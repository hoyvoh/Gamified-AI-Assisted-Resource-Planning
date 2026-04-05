"""Background analysis runner — full pipeline through P8 self-critique gate.

State machine:
  pending → collecting → analyzing (extracting_evidence → inferring_dimensions →
  scoring → generating_kpt → self_checking) → completed / failed
"""

import asyncio
import json
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.config import AnalysisSettings, LLMSettings
from app.domain.analysis.entities import AnalysisRun, SourcePayload
from app.domain.analysis.repositories import IAnalysisRunRepository
from app.infrastructure.analysis.pipeline.output_runner import run_output_generation
from app.infrastructure.analysis.pipeline.p1_runner import run_p1
from app.infrastructure.analysis.pipeline.p2_runner import run_p2
from app.infrastructure.analysis.pipeline.p8_runner import run_p8
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
    SqlDimensionScoreRepository,
    SqlEvidenceUnitRepository,
    SqlSourcePayloadRepository,
)
from app.infrastructure.db.repositories.org import SqlMemberRepository
from app.infrastructure.db.session import _session_factory
from app.logger import get_logger

logger = get_logger(__name__)


async def run_analysis_job(
    run_id: str,
    llm_settings: LLMSettings,
    analysis_settings: AnalysisSettings,
) -> None:
    """Entry point called by FastAPI BackgroundTasks."""
    logger.info("Analysis job started: run_id=%s", run_id)
    timeout = analysis_settings.max_job_timeout_seconds
    try:
        async with _session_factory() as session:
            await asyncio.wait_for(
                _run_pipeline(run_id, session, llm_settings, analysis_settings),
                timeout=timeout,
            )
    except TimeoutError:
        logger.error("Analysis job timed out after %ds: run_id=%s", timeout, run_id)
        try:
            async with _session_factory() as session:
                await _mark_failed(
                    run_id,
                    f"Analysis timed out after {timeout}s — pipeline took too long.",
                    session,
                )
        except Exception:
            logger.exception("Failed to persist timeout state for run_id=%s", run_id)
    except Exception as exc:
        logger.exception("Analysis job failed: run_id=%s error=%s", run_id, exc)
        try:
            async with _session_factory() as session:
                await _mark_failed(run_id, str(exc), session)
        except Exception:
            logger.exception("Failed to persist error state for run_id=%s", run_id)


async def cleanup_orphaned_runs() -> None:
    """Mark any non-terminal runs as failed — called at server startup.

    If the server was killed mid-analysis, those runs would be stuck in
    'collecting' or 'analyzing' forever.  This resets them so the member
    can trigger a fresh run.
    """
    async with _session_factory() as session:
        run_repo = SqlAnalysisRunRepository(session)
        orphans = await run_repo.list_all_active()
        if not orphans:
            return
        logger.warning(
            "Found %d orphaned analysis run(s) from previous server process — marking failed",
            len(orphans),
        )
        now = utcnow()
        for run in orphans:
            run.status = "failed"
            run.error_message = (
                "Analysis was interrupted by a server restart. Please trigger a new run."
            )
            run.progress_stage = None
            run.completed_at = now
            await run_repo.update(run)
        await session.commit()
        logger.info("Orphan cleanup complete: %d run(s) marked failed", len(orphans))


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
    dim_score_repo = SqlDimensionScoreRepository(session)

    run = await run_repo.get_by_id(run_id)
    if run is None:
        logger.error("Analysis run %s not found — aborting", run_id)
        return

    member = await member_repo.get_by_id(run.member_id)
    if member is None:
        await _mark_failed_in_session(run, run_repo, "Member not found", session)
        return

    # ── Phase 1: Parallel Data Collection ────────────────────────────────────
    run.status = "collecting"
    run.progress_stage = "collecting_data"
    run.progress_pct = 5
    await run_repo.update(run)
    await session.commit()

    gh = GitHubCollector(timeout_seconds=analysis_settings.github_timeout_seconds)
    mcp = LLMMCPCollector(
        cli_tool=llm_settings.cli_tool,
        model=llm_settings.model,
        timeout_seconds=llm_settings.timeout_seconds,
    )

    async def _collect_gh() -> list[CollectionResult]:
        if not member.external_id:
            logger.info("Member %s has no external_id — skipping GitHub", run.member_id)
            return []
        try:
            result = await gh.collect(
                handle=member.external_id,
                period_start=run.period_start,
                period_end=run.period_end,
            )
            return [result]
        except (CollectorTimeoutError, CollectorUnavailableError) as exc:
            logger.warning("GitHub collection skipped: %s", exc)
            return [
                CollectionResult(
                    source_type="github",
                    source_handle=member.external_id,
                    records=[],
                    status="skipped",
                    error_message=str(exc),
                )
            ]

    async def _collect_mcp() -> list[CollectionResult]:
        try:
            return await mcp.collect(
                display_name=member.display_name,
                external_id=member.external_id,
                period_start=run.period_start,
                period_end=run.period_end,
            )
        except (CollectorTimeoutError, CollectorUnavailableError) as exc:
            logger.warning("LLM MCP collection skipped: %s", exc)
            return [
                CollectionResult(
                    source_type="mcp",
                    source_handle=member.display_name,
                    records=[],
                    status="skipped",
                    error_message=str(exc),
                )
            ]
        except Exception as exc:
            logger.warning("LLM MCP collection failed unexpectedly: %s", exc)
            return [
                CollectionResult(
                    source_type="mcp",
                    source_handle=member.display_name,
                    records=[],
                    status="failed",
                    error_message=str(exc),
                )
            ]

    logger.info("Collection starting: run_id=%s member=%s", run_id, run.member_id)
    # Run both collectors in parallel — they only make subprocess/network calls
    gh_results, mcp_results = await asyncio.gather(
        _collect_gh(), _collect_mcp(), return_exceptions=True
    )

    results: list[CollectionResult] = []
    for batch in [gh_results, mcp_results]:
        if isinstance(batch, list):
            results.extend(batch)
        elif isinstance(batch, Exception):
            logger.warning("Collector raised unexpected error: %s", batch)

    run.progress_pct = 30
    await run_repo.update(run)

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
    logger.info(
        "Collection complete: run_id=%s sources=%d total_records=%d collected_sources=%d",
        run_id,
        len(results),
        total_records,
        len(collected_results),
    )
    logger.debug(
        "Collection results: %s",
        [
            f"{r.source_type}({r.source_handle})={r.status} records={r.record_count} err={r.error_message}"
            for r in results
        ],
    )

    if not collected_results:
        errors = "; ".join(r.error_message or "" for r in results if r.error_message)
        detail = f" Details: {errors}" if errors else " No collectors ran or all were skipped."
        await _mark_failed_in_session(
            run,
            run_repo,
            f"No data collected from any source.{detail}",
            session,
        )
        return

    await session.commit()

    # ── Phase 2: Evidence Extraction (P1 + P2) ────────────────────────────────
    run.status = "analyzing"
    run.progress_stage = "extracting_evidence"
    run.progress_pct = 35
    await run_repo.update(run)
    await session.commit()

    all_records: list[dict] = []
    for result in collected_results:
        for rec in result.records:
            all_records.append({**rec, "source_type": result.source_type})

    role_name = ""

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

    run.progress_pct = 50
    await run_repo.update(run)

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

    run.progress_pct = 55
    await run_repo.update(run)

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

    # ── Phase 3: Dimension Scoring (P3 + scoring engine) ─────────────────────
    logger.info("Phase 3 starting: run_id=%s stage=inferring_dimensions", run_id)
    run.progress_stage = "inferring_dimensions"
    run.progress_pct = 60
    await run_repo.update(run)
    await session.commit()

    await run_scoring(
        run=run,
        behavioral_events=behavioral_events,
        session=session,
        llm_settings=llm_settings,
    )

    run.progress_stage = "scoring"
    run.progress_pct = 75
    await run_repo.update(run)
    await session.commit()

    # ── Phase 4: Human Output Generation (P4-P7) ─────────────────────────────
    logger.info("Phase 4 starting: run_id=%s stage=generating_kpt", run_id)
    run.progress_stage = "generating_kpt"
    run.progress_pct = 80
    await run_repo.update(run)
    await session.commit()

    dimension_scores = await dim_score_repo.list_by_run(run_id)

    await run_output_generation(
        run=run,
        dimension_scores=dimension_scores,
        behavioral_events=behavioral_events,
        session=session,
        llm_settings=llm_settings,
    )

    # ── Phase 5: P8 Self-Critique Gate ────────────────────────────────────────
    logger.info("Phase 5 starting: run_id=%s stage=self_checking", run_id)
    run.progress_stage = "self_checking"
    run.progress_pct = 92
    await run_repo.update(run)
    await session.commit()

    await run_p8(run=run, session=session, llm_settings=llm_settings)

    # ── Completed ─────────────────────────────────────────────────────────────
    run.status = "completed"
    run.progress_stage = None
    run.progress_pct = 100
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
