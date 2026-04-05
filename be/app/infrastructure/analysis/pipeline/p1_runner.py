"""P1 pipeline runner — parallel chunked behavioral event extraction."""

import asyncio
import uuid

from app.domain.analysis.entities import EvidenceUnit
from app.domain.analysis.taxonomy import VALID_POLARITIES
from app.infrastructure.analysis.pipeline.chunker import build_content_excerpt, chunk_records
from app.infrastructure.analysis.pipeline.llm_runner import LLMCallError, call_llm
from app.infrastructure.analysis.prompts.p1_extraction import build_p1_prompt
from app.infrastructure.db.base import utcnow
from app.logger import get_logger

logger = get_logger(__name__)

_MAX_PARALLEL_CHUNKS = 4  # concurrency limit for parallel LLM calls


async def run_p1(
    run_id: str,
    member_id: str,
    role_name: str,
    period_start: str,
    period_end: str,
    source_records: list[dict],  # type: ignore[type-arg]  # from parsed source_payloads
    cli_tool: str,
    model: str,
    timeout_seconds: int,
    max_retries: int,
) -> tuple[list[EvidenceUnit], list[dict]]:  # type: ignore[type-arg]
    """Run P1 extraction on all records.

    Returns:
        (evidence_units, candidate_events)
        - evidence_units: one EvidenceUnit per raw source record
        - candidate_events: raw P1 event dicts (before P2 consolidation)
    """
    now = utcnow()

    # Build evidence_units from all source records (before P1 runs)
    evidence_units: list[EvidenceUnit] = []
    record_id_to_evidence_id: dict[str, str] = {}

    for rec in source_records:
        evidence_id = str(uuid.uuid4())
        rec_id = rec.get("record_id", "")
        record_id_to_evidence_id[rec_id] = evidence_id
        # Build a human-readable content excerpt from all available fields
        # (handles GitHub-specific shapes: body, message, diff_hunk, etc.)
        content_excerpt = build_content_excerpt(rec)[:1000]
        evidence_units.append(
            EvidenceUnit(
                evidence_id=evidence_id,
                analysis_run_id=run_id,
                member_id=member_id,
                timestamp=(
                    rec.get("timestamp") or rec.get("created_at") or rec.get("committed_at") or now
                ),
                source_type=rec.get("source_type", "unknown"),
                record_type=rec.get("type") or None,  # "pr_authored" | "commit" | "message" | etc.
                record_id=rec_id
                or rec.get("sha")
                or (str(rec["number"]) if rec.get("number") else None),
                content_excerpt=content_excerpt,
                content_summary="",  # filled after P1 extracts events
                extraction_confidence=None,
                ambiguity_notes=[],
                created_at=now,
            )
        )

    if not source_records:
        logger.info("No source records for run %s — skipping P1", run_id)
        return [], []

    # Chunk records and run P1 in parallel
    chunks = chunk_records(source_records)
    logger.info(
        "P1: run_id=%s total_records=%d chunks=%d", run_id, len(source_records), len(chunks)
    )
    logger.debug(
        "P1 chunk breakdown: %s",
        [f"chunk[{i}]={len(c)}recs" for i, c in enumerate(chunks)],
    )

    semaphore = asyncio.Semaphore(_MAX_PARALLEL_CHUNKS)
    all_candidate_events: list[dict] = []  # type: ignore[type-arg]

    async def process_chunk(chunk: list[dict]) -> list[dict]:  # type: ignore[type-arg]
        async with semaphore:
            prompt = build_p1_prompt(
                member_id=member_id,
                role_name=role_name,
                period_start=period_start,
                period_end=period_end,
                records=chunk,
            )
            try:
                result = await call_llm(
                    cli_tool=cli_tool,
                    model=model,
                    prompt=prompt,
                    timeout_seconds=timeout_seconds,
                    max_retries=max_retries,
                )
            except LLMCallError as exc:
                logger.warning("P1 chunk failed, skipping: %s", exc)
                return []

            if not isinstance(result, dict):
                logger.warning("P1 chunk returned non-dict, skipping")
                return []

            events = result.get("events", [])
            if not isinstance(events, list):
                return []

            valid = [e for e in events if isinstance(e, dict)]
            logger.debug(
                "P1 chunk done: run_id=%s chunk_size=%d extracted_events=%d",
                run_id,
                len(chunk),
                len(valid),
            )
            return valid

    tasks = [process_chunk(chunk) for chunk in chunks]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    for res in results:
        if isinstance(res, list):
            all_candidate_events.extend(res)
        elif isinstance(res, Exception):
            logger.warning("P1 chunk raised exception: %s", res)

    # Resolve source_record_ids → evidence_ids in events
    resolved_events = _resolve_evidence_ids(
        all_candidate_events, record_id_to_evidence_id, run_id, member_id, now
    )

    logger.info("P1 complete: run_id=%s events_extracted=%d", run_id, len(resolved_events))
    return evidence_units, resolved_events


def _resolve_evidence_ids(
    events: list[dict],  # type: ignore[type-arg]
    record_id_map: dict[str, str],
    run_id: str,
    member_id: str,
    now: str,
) -> list[dict]:  # type: ignore[type-arg]
    """Map source_record_ids in P1 events to evidence_unit IDs; add run metadata."""
    resolved: list[dict] = []  # type: ignore[type-arg]
    for ev in events:
        src_ids = ev.get("source_record_ids", [])
        evidence_ids = [record_id_map[rid] for rid in src_ids if rid in record_id_map]
        polarity = ev.get("polarity", "neutral")
        if polarity not in VALID_POLARITIES:
            polarity = "neutral"
        resolved.append(
            {
                **ev,
                "source_evidence_ids": evidence_ids,
                "_run_id": run_id,
                "_member_id": member_id,
                "_created_at": now,
            }
        )
    return resolved
