"""Scoring runner — orchestrates P3 inference + scoring engine + persistence."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.config import LLMSettings
from app.domain.analysis.entities import SCORING_VERSION, AnalysisRun, BehavioralEvent
from app.domain.analysis.scoring_engine import (
    ScoringInput,
    compute_category_scores,
    compute_dimension_scores,
)
from app.infrastructure.analysis.pipeline.p3_runner import run_p3
from app.infrastructure.db.base import utcnow
from app.infrastructure.db.repositories.analysis import (
    SqlAnalysisRunRepository,
    SqlCategoryScoreRepository,
    SqlDimensionScoreRepository,
    SqlPersonalBaselineRepository,
)
from app.infrastructure.db.repositories.org import SqlMemberRepository, SqlRoleProfileRepository
from app.logger import get_logger

logger = get_logger(__name__)


async def run_scoring(
    run: AnalysisRun,
    behavioral_events: list[BehavioralEvent],
    session: AsyncSession,
    llm_settings: LLMSettings,
) -> None:
    """Run P3 + scoring engine for the given analysis run.

    Writes DimensionScore and CategoryScore rows to DB.
    Updates run.progress_stage as it advances.
    """
    run_repo = SqlAnalysisRunRepository(session)
    member_repo = SqlMemberRepository(session)
    role_profile_repo = SqlRoleProfileRepository(session)
    dim_score_repo = SqlDimensionScoreRepository(session)
    cat_score_repo = SqlCategoryScoreRepository(session)
    baseline_repo = SqlPersonalBaselineRepository(session)

    # Load member + role profile context
    member = await member_repo.get_by_id(run.member_id)
    role_name = ""
    role_weights: dict[str, float] = {}

    if member and member.role_profile_id:
        role_profile = await role_profile_repo.get_by_id(member.role_profile_id)
        if role_profile:
            role_name = role_profile.role_name
            weights = role_profile.expected_dimension_weights
            role_weights = weights if isinstance(weights, dict) else {}

    role_profile_summary = f"Role: {role_name}." if role_name else "No role profile assigned."
    logger.debug(
        "Scoring context: run_id=%s role=%r weights=%d",
        run.analysis_run_id,
        role_name,
        len(role_weights),
    )

    # Load personal baseline for delta computation
    baseline = await baseline_repo.get_by_member(run.member_id)
    baseline_dims: dict[str, object] = baseline.baseline_dimensions if baseline else {}
    baseline_summary = (
        "No personal baseline available."
        if not baseline
        else (f"Baseline available with {len(baseline_dims)} dimension entries.")
    )

    # Extract previous scores from baseline for delta
    previous_scores: dict[str, float] = {}
    for dim_id, bdata in baseline_dims.items():
        if isinstance(bdata, dict):
            bs = bdata.get("baseline_score")
            if isinstance(bs, (int, float)):
                previous_scores[dim_id] = float(bs)

    # Serialize events as dicts for P3 prompt
    events_as_dicts = [_event_to_dict(ev) for ev in behavioral_events]

    # Run P3 inference in parallel across all dimensions
    p3_inferences = await run_p3(
        run_id=run.analysis_run_id,
        behavioral_events=events_as_dicts,
        role_profile_summary=role_profile_summary,
        baseline_summary=baseline_summary,
        cli_tool=llm_settings.cli_tool,
        model=llm_settings.model,
        timeout_seconds=llm_settings.timeout_seconds,
        max_retries=llm_settings.max_retries,
    )

    now = utcnow()

    # Compute dimension scores
    scoring_input = ScoringInput(
        run_id=run.analysis_run_id,
        member_id=run.member_id,
        behavioral_events=behavioral_events,
        p3_inferences=p3_inferences,
        previous_scores=previous_scores,
        role_dimension_weights=role_weights,
        now=now,
    )
    dimension_scores = compute_dimension_scores(scoring_input)

    # Compute category scores
    category_scores = compute_category_scores(
        dimension_scores=dimension_scores,
        run_id=run.analysis_run_id,
        member_id=run.member_id,
        role_dimension_weights=role_weights,
        now=now,
    )

    # Persist
    if dimension_scores:
        await dim_score_repo.bulk_create(dimension_scores)
        await session.commit()

    if category_scores:
        await cat_score_repo.bulk_create(category_scores)
        await session.commit()

    # Stamp scoring version on the run
    run.scoring_version = SCORING_VERSION
    await run_repo.update(run)
    await session.commit()

    logger.info(
        "Scoring complete: run_id=%s dimensions=%d categories=%d scoring_version=%s",
        run.analysis_run_id,
        len(dimension_scores),
        len(category_scores),
        SCORING_VERSION,
    )
    logger.debug(
        "Dimension scores detail: %s",
        [
            f"{ds.dimension_id}={ds.normalized_score:.2f} conf={ds.confidence_score:.2f} maturity={ds.maturity_level}"
            for ds in dimension_scores
            if ds.normalized_score is not None
        ],
    )
    logger.debug(
        "Category scores detail: %s",
        [
            f"{cs.category_id}={cs.score:.2f} conf={cs.confidence_label}"
            for cs in category_scores
            if cs.score is not None
        ],
    )


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
