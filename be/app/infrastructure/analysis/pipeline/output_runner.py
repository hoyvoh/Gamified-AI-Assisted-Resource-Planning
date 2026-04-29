"""Output generation runner — P4 (parallel) + P5 + P6 + P7 + milestones + snapshot assembly."""

from __future__ import annotations

import asyncio
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.config import LLMSettings
from app.domain.analysis.entities import (
    AnalysisRun,
    AnalysisSnapshot,
    BehavioralEvent,
    CaseFeedback,
    DimensionScore,
    KptItem,
    Milestone,
)
from app.infrastructure.agent_cli.base import AgentCliProvider
from app.infrastructure.analysis.pipeline.llm_runner import LLMCallError, call_llm
from app.infrastructure.analysis.prompts.p4_ui_summary import build_p4_prompt
from app.infrastructure.analysis.prompts.p5_kpt import build_p5_prompt
from app.infrastructure.analysis.prompts.p6_cases import build_p6_prompt
from app.infrastructure.analysis.prompts.p7_overview import build_p7_prompt
from app.infrastructure.db.base import utcnow
from app.infrastructure.db.repositories.analysis import (
    SqlAnalysisSnapshotRepository,
    SqlCaseFeedbackRepository,
    SqlDimensionScoreRepository,
    SqlKptItemRepository,
    SqlMilestoneRepository,
)
from app.infrastructure.db.repositories.org import SqlMemberRepository, SqlRoleProfileRepository
from app.logger import get_logger

logger = get_logger(__name__)

_P4_CONCURRENT = 4
_MILESTONE_CONFIDENCE_THRESHOLD = 0.65
_MILESTONE_IMPACT_LEVELS = {"high"}


async def run_output_generation(
    run: AnalysisRun,
    dimension_scores: list[DimensionScore],
    behavioral_events: list[BehavioralEvent],
    session: AsyncSession,
    llm_settings: LLMSettings,
    provider: AgentCliProvider,
) -> None:
    """Run P4 (parallel) + P5 + P6 + P7 + milestone derivation + snapshot persist."""
    member_repo = SqlMemberRepository(session)
    role_profile_repo = SqlRoleProfileRepository(session)
    dim_score_repo = SqlDimensionScoreRepository(session)
    kpt_repo = SqlKptItemRepository(session)
    case_repo = SqlCaseFeedbackRepository(session)
    milestone_repo = SqlMilestoneRepository(session)
    snapshot_repo = SqlAnalysisSnapshotRepository(session)

    member = await member_repo.get_by_id(run.member_id)
    role_name = ""
    if member and member.role_profile_id:
        rp = await role_profile_repo.get_by_id(member.role_profile_id)
        if rp:
            role_name = rp.role_name

    now = utcnow()
    events_as_dicts = [_event_to_dict(ev) for ev in behavioral_events]

    # ── Phase A: P4 — dimension UI summaries (parallel) ───────────────────────
    scored_dims = [ds for ds in dimension_scores if ds.p3_inference is not None]
    logger.info("P4 starting: run_id=%s scored_dims=%d", run.analysis_run_id, len(scored_dims))
    await _run_p4_parallel(
        scored_dims,
        run.analysis_run_id,
        dim_score_repo,
        session,
        llm_settings,
        provider,
    )
    await session.commit()

    # Reload dimension scores (now with ui_summary populated)
    dimension_scores = await dim_score_repo.list_by_run(run.analysis_run_id)

    # ── Derive top strengths / growth areas ───────────────────────────────────
    top_strength_ids, top_growth_ids = _rank_dimensions(dimension_scores)
    insufficient_dims = [
        ds.dimension_id
        for ds in dimension_scores
        if ds.maturity_level in {"insufficient_evidence", "insufficient_opportunity"}
    ]

    dim_summaries = [
        {
            "dimension_id": ds.dimension_id,
            "maturity_level": ds.maturity_level,
            "normalized_score": ds.normalized_score,
            "confidence_score": ds.confidence_score,
            "ui_summary": ds.ui_summary,
        }
        for ds in dimension_scores
    ]

    overall_confidence = sum(
        ds.confidence_score for ds in dimension_scores if ds.normalized_score is not None
    ) / max(1, sum(1 for ds in dimension_scores if ds.normalized_score is not None))

    # ── Milestone derivation (pure CPU — no LLM call, compute immediately) ───
    new_milestones = _derive_milestones(run, behavioral_events, now)

    # ── Phases B + C + D: P5 / P6 / P7 — run in parallel ────────────────────
    # None of these depend on each other: all only need dim_summaries from P4.
    # Running sequentially would waste ~30-60 s waiting for three LLM round trips.
    kpt_items, cases, p7_result = await asyncio.gather(
        _run_p5(
            run=run,
            role_name=role_name,
            dim_summaries=dim_summaries,
            top_strength_ids=top_strength_ids,
            top_growth_ids=top_growth_ids,
            llm_settings=llm_settings,
            provider=provider,
            now=now,
        ),
        _run_p6(
            run=run,
            role_name=role_name,
            events_as_dicts=events_as_dicts,
            dim_summaries=dim_summaries,
            top_growth_ids=top_growth_ids,
            llm_settings=llm_settings,
            provider=provider,
            now=now,
        ),
        _run_p7(
            run=run,
            role_name=role_name,
            top_strength_ids=top_strength_ids,
            top_growth_ids=top_growth_ids,
            dimension_scores=dimension_scores,
            overall_confidence=overall_confidence,
            llm_settings=llm_settings,
            provider=provider,
        ),
    )
    profile_summary, growth_journey_summary, current_growth_path = p7_result

    # ── Persist all P5/P6 outputs + milestones in one commit ─────────────────
    if kpt_items:
        await kpt_repo.replace_for_run(run.analysis_run_id, kpt_items)
    if cases:
        await case_repo.replace_for_run(run.analysis_run_id, cases)
    if new_milestones:
        await milestone_repo.append(new_milestones)
    await session.commit()

    # ── Phase F: Assemble and persist snapshot ────────────────────────────────
    snapshot = AnalysisSnapshot(
        snapshot_id=str(uuid.uuid4()),
        analysis_run_id=run.analysis_run_id,
        member_id=run.member_id,
        period_start=run.period_start,
        period_end=run.period_end,
        generated_at=now,
        overall_confidence=round(overall_confidence, 4),
        profile_summary=profile_summary,
        growth_journey_summary=growth_journey_summary,
        top_strength_dimension_ids=top_strength_ids,
        top_growth_dimension_ids=top_growth_ids,
        current_growth_path=current_growth_path,
        fairness_notes=[
            "Scores are derived from observed work patterns within the selected period.",
            "Dimensions with insufficient opportunity are excluded from scoring.",
            "All inferences are probabilistic and should be reviewed with human context.",
        ],
        insufficient_dimensions=insufficient_dims,
        flagged_items_count=0,
        p8_approved=False,  # P8 (M6) will update this
        p8_issues=[],
    )
    await snapshot_repo.upsert(snapshot)
    await session.commit()

    logger.info(
        "Output generation complete: run_id=%s kpt=%d cases=%d milestones=%d overall_confidence=%.2f",
        run.analysis_run_id,
        len(kpt_items),
        len(cases),
        len(new_milestones),
        overall_confidence,
    )
    logger.debug(
        "Snapshot summary: run_id=%s top_strengths=%s top_growth=%s profile_summary_len=%d",
        run.analysis_run_id,
        top_strength_ids,
        top_growth_ids,
        len(profile_summary or ""),
    )


# ── P4 ─────────────────────────────────────────────────────────────────────────


async def _run_p4_parallel(
    scored_dims: list[DimensionScore],
    run_id: str,
    dim_score_repo: SqlDimensionScoreRepository,
    session: AsyncSession,
    llm_settings: LLMSettings,
    provider: AgentCliProvider,
) -> None:
    semaphore = asyncio.Semaphore(_P4_CONCURRENT)

    async def do_one(ds: DimensionScore) -> None:
        if ds.p3_inference is None:
            return
        async with semaphore:
            prompt = build_p4_prompt(ds.dimension_id, ds.p3_inference)
            try:
                result = await call_llm(
                    provider=provider,
                    model=llm_settings.model,
                    prompt=prompt,
                    timeout_seconds=llm_settings.timeout_seconds,
                    max_retries=llm_settings.max_retries,
                )
                if isinstance(result, dict) and "ui_summary" in result:
                    await dim_score_repo.update_ui_summary(
                        run_id, ds.dimension_id, str(result["ui_summary"])
                    )
            except LLMCallError as exc:
                logger.warning("P4 failed for dim=%s run=%s: %s", ds.dimension_id, run_id, exc)

    await asyncio.gather(*[do_one(ds) for ds in scored_dims])


# ── P5 ─────────────────────────────────────────────────────────────────────────


async def _run_p5(
    *,
    run: AnalysisRun,
    role_name: str,
    dim_summaries: list[dict],  # type: ignore[type-arg]
    top_strength_ids: list[str],
    top_growth_ids: list[str],
    llm_settings: LLMSettings,
    provider: AgentCliProvider,
    now: str,
) -> list[KptItem]:
    prompt = build_p5_prompt(
        member_id=run.member_id,
        period_start=run.period_start,
        period_end=run.period_end,
        role_name=role_name,
        dimension_summaries=dim_summaries,
        top_strength_ids=top_strength_ids,
        top_growth_ids=top_growth_ids,
    )
    try:
        result = await call_llm(
            provider=provider,
            model=llm_settings.model,
            prompt=prompt,
            timeout_seconds=llm_settings.timeout_seconds,
            max_retries=llm_settings.max_retries,
        )
    except LLMCallError as exc:
        logger.warning("P5 failed for run %s: %s", run.analysis_run_id, exc)
        return []

    if not isinstance(result, dict):
        return []

    items: list[KptItem] = []
    order = 0
    for itype in ("keep", "problem", "try"):
        key = f"{itype}_items"
        for raw in result.get(key, []):
            if not isinstance(raw, dict):
                continue
            items.append(
                KptItem(
                    kpt_id=str(uuid.uuid4()),
                    analysis_run_id=run.analysis_run_id,
                    member_id=run.member_id,
                    item_type=itype,
                    title=str(raw.get("title", "")),
                    summary=raw.get("summary"),
                    linked_dimension_ids=_str_list(raw.get("linked_dimension_ids", [])),
                    linked_evidence_ids=[],
                    linked_problem_ids=_str_list(raw.get("linked_problem_titles", [])),
                    display_order=order,
                    created_at=now,
                )
            )
            order += 1

    logger.info("P5 complete: run_id=%s items=%d", run.analysis_run_id, len(items))
    return items


# ── P6 ─────────────────────────────────────────────────────────────────────────


async def _run_p6(
    *,
    run: AnalysisRun,
    role_name: str,
    events_as_dicts: list[dict],  # type: ignore[type-arg]
    dim_summaries: list[dict],  # type: ignore[type-arg]
    top_growth_ids: list[str],
    llm_settings: LLMSettings,
    provider: AgentCliProvider,
    now: str,
) -> list[CaseFeedback]:
    prompt = build_p6_prompt(
        member_id=run.member_id,
        period_start=run.period_start,
        period_end=run.period_end,
        role_name=role_name,
        behavioral_events=events_as_dicts,
        dimension_summaries=dim_summaries,
        top_growth_ids=top_growth_ids,
    )
    try:
        result = await call_llm(
            provider=provider,
            model=llm_settings.model,
            prompt=prompt,
            timeout_seconds=llm_settings.timeout_seconds,
            max_retries=llm_settings.max_retries,
        )
    except LLMCallError as exc:
        logger.warning("P6 failed for run %s: %s", run.analysis_run_id, exc)
        return []

    if not isinstance(result, dict):
        return []

    cases: list[CaseFeedback] = []
    for order, raw in enumerate(result.get("cases", [])):
        if not isinstance(raw, dict):
            continue
        impact = raw.get("impact_level")
        if impact not in {"low", "medium", "high"}:
            impact = None
        cases.append(
            CaseFeedback(
                case_id=str(uuid.uuid4()),
                analysis_run_id=run.analysis_run_id,
                member_id=run.member_id,
                title=str(raw.get("title", "")),
                category=raw.get("category"),
                impact_level=impact,
                summary=raw.get("summary"),
                why_it_matters=raw.get("why_it_matters"),
                observed_pattern=raw.get("observed_pattern"),
                better_alternative=raw.get("better_alternative"),
                next_time_guidance=raw.get("next_time_guidance"),
                linked_dimension_ids=_str_list(raw.get("linked_dimension_ids", [])),
                supporting_event_ids=_str_list(raw.get("supporting_event_ids", [])),
                confidence_score=None,
                display_order=order,
                created_at=now,
            )
        )

    logger.info("P6 complete: run_id=%s cases=%d", run.analysis_run_id, len(cases))
    return cases


# ── P7 ─────────────────────────────────────────────────────────────────────────


async def _run_p7(
    *,
    run: AnalysisRun,
    role_name: str,
    top_strength_ids: list[str],
    top_growth_ids: list[str],
    dimension_scores: list[DimensionScore],
    overall_confidence: float,
    llm_settings: LLMSettings,
    provider: AgentCliProvider,
) -> tuple[str | None, str | None, str | None]:
    cat_scores_for_prompt = [
        {"category_id": ds.dimension_id, "score": ds.normalized_score}
        for ds in dimension_scores
        if ds.normalized_score is not None
    ]
    prompt = build_p7_prompt(
        member_id=run.member_id,
        period_start=run.period_start,
        period_end=run.period_end,
        role_name=role_name,
        top_strength_ids=top_strength_ids,
        top_growth_ids=top_growth_ids,
        category_scores=cat_scores_for_prompt,
        overall_confidence=overall_confidence,
        milestone_history=[],
    )
    try:
        result = await call_llm(
            provider=provider,
            model=llm_settings.model,
            prompt=prompt,
            timeout_seconds=llm_settings.timeout_seconds,
            max_retries=llm_settings.max_retries,
        )
    except LLMCallError as exc:
        logger.warning("P7 failed for run %s: %s", run.analysis_run_id, exc)
        return None, None, None

    if not isinstance(result, dict):
        return None, None, None

    return (
        result.get("overview_summary"),
        result.get("growth_journey_summary"),
        result.get("current_growth_path"),
    )


# ── Milestone derivation ────────────────────────────────────────────────────────


def _derive_milestones(
    run: AnalysisRun,
    events: list[BehavioralEvent],
    now: str,
) -> list[Milestone]:
    """Derive milestones from high-impact positive events.

    Rule: positive events with impact_level='high' and event_confidence >= threshold
    are candidates for milestones. One milestone per qualifying event cluster.
    """
    milestones: list[Milestone] = []
    for ev in events:
        if ev.polarity != "positive":
            continue
        if ev.impact_level not in _MILESTONE_IMPACT_LEVELS:
            continue
        conf = ev.event_confidence or 0.0
        if conf < _MILESTONE_CONFIDENCE_THRESHOLD:
            continue
        milestones.append(
            Milestone(
                milestone_id=str(uuid.uuid4()),
                member_id=run.member_id,
                source_analysis_run_id=run.analysis_run_id,
                timestamp=ev.timestamp,
                milestone_type=ev.event_type,
                title=ev.event_summary or ev.event_type.replace("_", " ").title(),
                summary=ev.why_it_matters,
                impact_score=ev.event_confidence,
                supporting_event_ids=[ev.event_id],
                supporting_evidence_ids=ev.source_evidence_ids,
                retained=True,
                created_at=now,
            )
        )
    return milestones


# ── Ranking helpers ─────────────────────────────────────────────────────────────


def _rank_dimensions(scores: list[DimensionScore]) -> tuple[list[str], list[str]]:
    """Return top 5 strengths and top 5 growth areas by rank score."""
    valid = [ds for ds in scores if ds.normalized_score is not None]

    def strength_rank(ds: DimensionScore) -> float:
        return (ds.normalized_score or 0.0) * ds.confidence_score * ds.opportunity_score

    def growth_rank(ds: DimensionScore) -> float:
        score = ds.normalized_score or 0.0
        return (5.0 - score) * ds.confidence_score * ds.opportunity_score

    top_strengths = [ds.dimension_id for ds in sorted(valid, key=strength_rank, reverse=True)[:5]]
    top_growth = [
        ds.dimension_id
        for ds in sorted(valid, key=growth_rank, reverse=True)[:5]
        if (ds.normalized_score or 5.0) < 4.0  # only real growth areas
    ]
    return top_strengths, top_growth


# ── Helpers ─────────────────────────────────────────────────────────────────────


def _event_to_dict(ev: BehavioralEvent) -> dict:  # type: ignore[type-arg]
    return {
        "event_id": ev.event_id,
        "timestamp": ev.timestamp,
        "event_type": ev.event_type,
        "event_summary": ev.event_summary,
        "polarity": ev.polarity,
        "severity": ev.severity,
        "event_confidence": ev.event_confidence,
        "impact_level": ev.impact_level,
        "opportunity_level": ev.opportunity_level,
        "related_dimensions": ev.related_dimensions,
        "why_it_matters": ev.why_it_matters,
    }


def _str_list(val: object) -> list[str]:
    if isinstance(val, list):
        return [str(v) for v in val]
    return []
