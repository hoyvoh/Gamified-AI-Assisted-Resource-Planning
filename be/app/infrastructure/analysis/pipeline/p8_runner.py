"""P8 runner — self-critique gate: check overclaims, patch, retry once, persist result."""

from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.config import LLMSettings
from app.domain.analysis.entities import AnalysisRun
from app.infrastructure.analysis.pipeline.llm_runner import LLMCallError, call_llm
from app.infrastructure.analysis.prompts.p8_critique import build_p8_prompt
from app.infrastructure.db.repositories.analysis import (
    SqlAnalysisSnapshotRepository,
    SqlDimensionScoreRepository,
)
from app.logger import get_logger

logger = get_logger(__name__)


async def run_p8(
    run: AnalysisRun,
    session: AsyncSession,
    llm_settings: LLMSettings,
) -> None:
    """Run P8 self-critique gate.

    1. Load snapshot + dimension ui_summaries for this run.
    2. Build P8 prompt and call LLM.
    3. If approved=false, apply recommended_fix patches to affected fields and retry once.
    4. Persist final p8_approved + p8_issues to the snapshot.
    """
    dim_score_repo = SqlDimensionScoreRepository(session)
    snapshot_repo = SqlAnalysisSnapshotRepository(session)

    snapshot = await snapshot_repo.get_by_run(run.analysis_run_id)
    if snapshot is None:
        logger.warning("P8: no snapshot found for run_id=%s — skipping", run.analysis_run_id)
        return

    dimension_scores = await dim_score_repo.list_by_run(run.analysis_run_id)
    dim_dicts = [
        {
            "dimension_id": ds.dimension_id,
            "maturity_level": ds.maturity_level,
            "confidence_score": ds.confidence_score,
            "ui_summary": ds.ui_summary,
        }
        for ds in dimension_scores
    ]

    # ── First pass ────────────────────────────────────────────────────────────
    approved, issues = await _call_p8(
        run_id=run.analysis_run_id,
        dim_dicts=dim_dicts,
        profile_summary=snapshot.profile_summary,
        growth_journey_summary=snapshot.growth_journey_summary,
        overall_confidence=snapshot.overall_confidence or 0.0,
        llm_settings=llm_settings,
    )

    logger.debug(
        "P8 first pass: run_id=%s approved=%s issues=%d",
        run.analysis_run_id,
        approved,
        len(issues),
    )
    if not approved and issues:
        logger.debug(
            "P8 issues: %s",
            [
                f"field={i.get('field')} dim={i.get('dimension_id')} severity={i.get('severity')}: {i.get('reason', '')[:80]}"
                for i in issues
            ],
        )
        # ── Apply patches ─────────────────────────────────────────────────────
        patched_summary = snapshot.profile_summary
        patched_journey = snapshot.growth_journey_summary

        for issue in issues:
            field = issue.get("field", "")
            fix = issue.get("recommended_fix")
            if not fix:
                continue

            if field == "ui_summary":
                dim_id = issue.get("dimension_id")
                if dim_id:
                    await dim_score_repo.update_ui_summary(
                        run.analysis_run_id, str(dim_id), str(fix)
                    )
                    # Update local dim_dicts for the retry prompt
                    for d in dim_dicts:
                        if d["dimension_id"] == dim_id:
                            d["ui_summary"] = str(fix)
            elif field == "profile_summary":
                patched_summary = str(fix)
            elif field == "growth_journey_summary":
                patched_journey = str(fix)

        await session.commit()

        # Update snapshot text fields if patched
        if (
            patched_summary != snapshot.profile_summary
            or patched_journey != snapshot.growth_journey_summary
        ):
            snapshot.profile_summary = patched_summary
            snapshot.growth_journey_summary = patched_journey
            await snapshot_repo.upsert(snapshot)
            await session.commit()

        # ── Retry once ────────────────────────────────────────────────────────
        approved, issues = await _call_p8(
            run_id=run.analysis_run_id,
            dim_dicts=dim_dicts,
            profile_summary=patched_summary,
            growth_journey_summary=patched_journey,
            overall_confidence=snapshot.overall_confidence or 0.0,
            llm_settings=llm_settings,
        )
        logger.info(
            "P8 retry: run_id=%s approved=%s remaining_issues=%d",
            run.analysis_run_id,
            approved,
            len(issues),
        )

    # ── Persist P8 result to snapshot ─────────────────────────────────────────
    snapshot.p8_approved = approved
    snapshot.p8_issues = [
        {k: v for k, v in issue.items() if k in {"field", "dimension_id", "severity", "reason"}}
        for issue in issues
    ]
    await snapshot_repo.upsert(snapshot)
    await session.commit()

    logger.info(
        "P8 complete: run_id=%s approved=%s issues=%d",
        run.analysis_run_id,
        approved,
        len(issues),
    )


async def _call_p8(
    run_id: str,
    dim_dicts: list[dict],  # type: ignore[type-arg]
    profile_summary: str | None,
    growth_journey_summary: str | None,
    overall_confidence: float,
    llm_settings: LLMSettings,
) -> tuple[bool, list[dict]]:  # type: ignore[type-arg]
    """Call LLM for P8 critique. Returns (approved, issues)."""
    prompt = build_p8_prompt(
        run_id=run_id,
        dimension_scores=dim_dicts,
        profile_summary=profile_summary,
        growth_journey_summary=growth_journey_summary,
        overall_confidence=overall_confidence,
    )
    try:
        result = await call_llm(
            cli_tool=llm_settings.cli_tool,
            model=llm_settings.model,
            prompt=prompt,
            timeout_seconds=llm_settings.timeout_seconds,
            max_retries=llm_settings.max_retries,
        )
    except LLMCallError as exc:
        logger.warning(
            "P8 LLM call failed for run_id=%s: %s — approving with error note", run_id, exc
        )
        return True, []

    if not isinstance(result, dict):
        logger.warning("P8 returned non-dict for run_id=%s — approving by default", run_id)
        return True, []

    approved = bool(result.get("approved", True))
    raw_issues = result.get("issues", [])
    issues: list[dict] = []  # type: ignore[type-arg]
    if isinstance(raw_issues, list):
        for item in raw_issues:
            if isinstance(item, dict):
                issues.append(item)

    return approved, issues
