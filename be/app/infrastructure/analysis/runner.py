"""Background analysis runner — M4: full pipeline through dimension scoring.

State machine:
  pending → collecting → analyzing (extracting_evidence → inferring_dimensions → scoring)
  → completed / failed

P5-P8 (output generation + self-critique) continue in M5+.
"""

import json
import logging
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.config import AnalysisSettings, LLMSettings
from app.domain.analysis.entities import AnalysisRun, SourcePayload
from app.domain.analysis.repositories import IAnalysisRunRepository
from app.infrastructure.analysis.pipeline.p1_runner import run_p1
from app.infrastructure.analysis.pipeline.p2_runner import run_p2
from app.infrastructure.analysis.pipeline.scoring_runner import run_scoring
from app.infrastructure.collectors.base import (
    CollectionResult,
    CollectorTimeoutError,
    CollectorUnavailableError,
)
from app.infrastructure.collectors.github import GitHubCollector
from app.infrastructure.collectors.llm_mcp import LLMMCPCollector
from app.infrastructure.db.base import utcnow
from app.infrastructure.db.repositories.analysis import (
    SqlAnalysisRunRepository,
    SqlBehavioralEventRepository,
    SqlEvidenceUnitRepository,
    SqlSourcePayloadRepository,
)
from app.infrastructure.db.repositories.org import SqlMemberRepository
from app.infrastructure.db.session import _session_factory

logger = logging.getLogger(__name__)


async def run_analysis_job(
    run_id: str,
    llm_settings: LLMSettings,
    analysis_settings: AnalysisSettings,
) -> None:
    """Entry point called by FastAPI BackgroundTasks."""
    logger.info("Analysis job started: run_id=%s", run_id)
    try:
        async with _session_factory() as session:
            await _run_pipeline(run_id, session, llm_settings, analysis_settings)
    except Exception as exc:
        logger.exception("Analysis job failed: run_id=%s error=%s", run_id, exc)
        try:
            async with _session_factory() as session:
                await _mark_failed(run_id, str(exc), session)
        except Exception:
            logger.exception("Failed to persist error state for run_id=%s", run_id)


async def _run_pipeline(
    run_id: str,
    session: AsyncSession,
    llm_settings: LLMSettings,
    analysis_settings: AnalysisSettings,
) -> None:
    run_repo = SqlAnalysisRunRepository(session)
    payload_repo = SqlSourcePayloadRepository(session)
    member_repo = SqlMemberRepository(session)
    evidence_repo = SqlEvidenceUnitRepository(session)
    event_repo = SqlBehavioralEventRepository(session)

    run = await run_repo.get_by_id(run_id)
    if run is None:
        logger.error("Analysis run %s not found — aborting", run_id)
        return

    member = await member_repo.get_by_id(run.member_id)
    if member is None:
        await _mark_failed_in_session(run, run_repo, "Member not found", session)
        return

    # ── Phase 1: Data Collection ───────────────────────────────────────────────
    run.status = "collecting"
    run.progress_stage = "collecting_data"
    await run_repo.update(run)
    await session.commit()

    results: list[CollectionResult] = []

    if member.external_id:
        gh = GitHubCollector(timeout_seconds=analysis_settings.github_timeout_seconds)
        try:
            gh_result = await gh.collect(
                handle=member.external_id,
                period_start=run.period_start,
                period_end=run.period_end,
            )
            results.append(gh_result)
        except (CollectorTimeoutError, CollectorUnavailableError) as exc:
            logger.warning("GitHub collection skipped: %s", exc)
            results.append(
                CollectionResult(
                    source_type="github",
                    source_handle=member.external_id,
                    records=[],
                    status="skipped",
                    error_message=str(exc),
                )
            )
    else:
        logger.info("Member %s has no external_id — skipping GitHub", run.member_id)

    mcp = LLMMCPCollector(
        cli_tool=llm_settings.cli_tool,
        model=llm_settings.model,
        timeout_seconds=llm_settings.timeout_seconds,
    )
    try:
        mcp_results = await mcp.collect(
            display_name=member.display_name,
            external_id=member.external_id,
            period_start=run.period_start,
            period_end=run.period_end,
        )
        results.extend(mcp_results)
    except CollectorTimeoutError as exc:
        logger.warning("LLM MCP collection timed out: %s", exc)
        results.append(
            CollectionResult(
                source_type="mcp",
                source_handle=member.display_name,
                records=[],
                status="failed",
                error_message=str(exc),
            )
        )

    now = utcnow()
    payloads: list[SourcePayload] = []
    for result in results:
        payload = SourcePayload(
            source_payload_id=str(uuid.uuid4()),
            analysis_run_id=run_id,
            source_type=result.source_type,
            source_handle=result.source_handle,
            raw_data=json.dumps(result.records),
            record_count=result.record_count,
            collection_status=result.status,
            error_message=result.error_message,
            collected_at=now,
        )
        payloads.append(payload)
        await payload_repo.create(payload)

    total_records = sum(r.record_count for r in results)
    collected_results = [r for r in results if r.status == "collected"]

    if not collected_results and results:
        errors = "; ".join(r.error_message or "" for r in results if r.error_message)
        await _mark_failed_in_session(
            run,
            run_repo,
            f"No data collected from any source. Details: {errors}",
            session,
        )
        return

    await session.commit()

    # ── Phase 2: Evidence Extraction (P1 + P2) ────────────────────────────────
    run.status = "analyzing"
    run.progress_stage = "extracting_evidence"
    await run_repo.update(run)
    await session.commit()

    # Flatten all collected records across sources
    all_records: list[dict] = []  # type: ignore[type-arg]
    for result in collected_results:
        for rec in result.records:
            all_records.append(
                {
                    **rec,
                    "source_type": result.source_type,
                }
            )

    role_name = ""  # will be enriched in M4 from member.role_profile_id

    evidence_units, candidate_events = await run_p1(
        run_id=run_id,
        member_id=run.member_id,
        role_name=role_name,
        period_start=run.period_start,
        period_end=run.period_end,
        source_records=all_records,
        cli_tool=llm_settings.cli_tool,
        model=llm_settings.model,
        timeout_seconds=llm_settings.timeout_seconds,
        max_retries=llm_settings.max_retries,
    )

    if evidence_units:
        await evidence_repo.bulk_create(evidence_units)
        await session.commit()

    behavioral_events = await run_p2(
        run_id=run_id,
        member_id=run.member_id,
        candidate_events=candidate_events,
        cli_tool=llm_settings.cli_tool,
        model=llm_settings.model,
        timeout_seconds=llm_settings.timeout_seconds,
        max_retries=llm_settings.max_retries,
    )

    if behavioral_events:
        await event_repo.bulk_create(behavioral_events)
        await session.commit()

    logger.info(
        "Evidence extraction complete: run_id=%s records=%d evidence=%d events=%d",
        run_id,
        total_records,
        len(evidence_units),
        len(behavioral_events),
    )

    # ── Phase 3: Dimension Scoring (P3 + scoring engine) ──────────────────────
    run.progress_stage = "inferring_dimensions"
    await run_repo.update(run)
    await session.commit()

    await run_scoring(
        run=run,
        behavioral_events=behavioral_events,
        session=session,
        llm_settings=llm_settings,
    )

    run.progress_stage = "scoring"
    await run_repo.update(run)
    await session.commit()

    # M4 ends here — M5 (output generation) adds P5-P8
    # Mark completed for now; M5 will extend this pipeline
    run.status = "completed"
    run.progress_stage = None
    run.completed_at = utcnow()
    await run_repo.update(run)
    await session.commit()

    logger.info("Analysis run completed: run_id=%s", run_id)


async def _mark_failed_in_session(
    run: AnalysisRun,
    run_repo: IAnalysisRunRepository,
    message: str,
    session: AsyncSession,
) -> None:
    run.status = "failed"
    run.error_message = message
    run.completed_at = utcnow()
    await run_repo.update(run)
    await session.commit()


async def _mark_failed(run_id: str, message: str, session: AsyncSession) -> None:
    run_repo = SqlAnalysisRunRepository(session)
    run = await run_repo.get_by_id(run_id)
    if run is None:
        return
    await _mark_failed_in_session(run, run_repo, message, session)
