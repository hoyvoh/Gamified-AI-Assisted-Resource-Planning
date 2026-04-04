"""P2 pipeline runner — event consolidation and deduplication."""

import logging
import uuid

from app.domain.analysis.entities import BehavioralEvent
from app.domain.analysis.taxonomy import (
    VALID_IMPACT_LEVELS,
    VALID_OPPORTUNITY_LEVELS,
    VALID_POLARITIES,
)
from app.infrastructure.analysis.pipeline.llm_runner import LLMCallError, call_llm
from app.infrastructure.analysis.prompts.p2_consolidation import build_p2_prompt
from app.infrastructure.db.base import utcnow

logger = logging.getLogger(__name__)


async def run_p2(
    run_id: str,
    member_id: str,
    candidate_events: list[dict],  # type: ignore[type-arg]  # from P1
    cli_tool: str,
    model: str,
    timeout_seconds: int,
    max_retries: int,
) -> list[BehavioralEvent]:
    """Run P2 consolidation on merged P1 candidates.

    Falls back to using P1 output directly if P2 fails.
    """
    if not candidate_events:
        logger.info("P2: no candidate events for run %s — skipping", run_id)
        return []

    logger.info("P2: run_id=%s input_events=%d", run_id, len(candidate_events))

    prompt = build_p2_prompt(candidate_events)
    try:
        result = await call_llm(
            cli_tool=cli_tool,
            model=model,
            prompt=prompt,
            timeout_seconds=timeout_seconds,
            max_retries=max_retries,
        )
    except LLMCallError as exc:
        logger.warning("P2 failed for run %s, using P1 output as-is: %s", run_id, exc)
        return _events_from_candidates(candidate_events, run_id, member_id)

    if not isinstance(result, dict):
        logger.warning("P2 returned non-dict for run %s, using P1 output as-is", run_id)
        return _events_from_candidates(candidate_events, run_id, member_id)

    consolidated = result.get("consolidated_events", [])
    if not isinstance(consolidated, list) or not consolidated:
        logger.warning(
            "P2 returned empty consolidated_events for run %s, using P1 output as-is", run_id
        )
        return _events_from_candidates(candidate_events, run_id, member_id)

    now = utcnow()
    events: list[BehavioralEvent] = []
    for ev in consolidated:
        if not isinstance(ev, dict):
            continue
        events.append(_dict_to_behavioral_event(ev, run_id, member_id, now))

    logger.info("P2 complete: run_id=%s consolidated_events=%d", run_id, len(events))
    return events


def _events_from_candidates(
    candidates: list[dict],  # type: ignore[type-arg]
    run_id: str,
    member_id: str,
) -> list[BehavioralEvent]:
    """Convert raw P1 candidate dicts directly to BehavioralEvent (P2 fallback)."""
    now = utcnow()
    return [_dict_to_behavioral_event(c, run_id, member_id, now) for c in candidates]


def _dict_to_behavioral_event(
    ev: dict,  # type: ignore[type-arg]
    run_id: str,
    member_id: str,
    now: str,
) -> BehavioralEvent:
    polarity = ev.get("polarity", "neutral")
    if polarity not in VALID_POLARITIES:
        polarity = "neutral"

    impact = ev.get("impact_level")
    if impact not in VALID_IMPACT_LEVELS:
        impact = None

    opportunity = ev.get("opportunity_level")
    if opportunity not in VALID_OPPORTUNITY_LEVELS:
        opportunity = None

    related_dims = ev.get("related_dimensions", [])
    if not isinstance(related_dims, list):
        related_dims = []

    source_evidence_ids = ev.get("source_evidence_ids") or []
    if not isinstance(source_evidence_ids, list):
        source_evidence_ids = []

    ambiguity = ev.get("ambiguity_notes", [])
    if not isinstance(ambiguity, list):
        ambiguity = []

    return BehavioralEvent(
        event_id=str(uuid.uuid4()),
        analysis_run_id=run_id,
        member_id=member_id,
        timestamp=ev.get("timestamp", now),
        source_evidence_ids=source_evidence_ids,
        event_type=ev.get("event_type", "task_ownership"),
        event_summary=ev.get("event_summary"),
        polarity=polarity,
        severity=_safe_float(ev.get("severity")),
        event_confidence=_safe_float(ev.get("event_confidence")),
        impact_level=impact,
        opportunity_level=opportunity,
        related_dimensions=related_dims,
        ambiguity_notes=ambiguity,
        why_it_matters=ev.get("why_it_matters"),
        created_at=ev.get("_created_at", now),
    )


def _safe_float(val: object) -> float | None:
    try:
        f = float(val)  # type: ignore[arg-type]
        return max(0.0, min(1.0, f))
    except (TypeError, ValueError):
        return None
