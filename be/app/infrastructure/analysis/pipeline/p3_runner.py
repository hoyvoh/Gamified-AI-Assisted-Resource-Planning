"""P3 pipeline runner — per-dimension skill inference (parallel)."""

import asyncio

from app.domain.analysis.taxonomy import DIMENSION_IDS
from app.infrastructure.agent_cli.base import AgentCliProvider
from app.infrastructure.analysis.pipeline.llm_runner import LLMCallError, call_llm
from app.infrastructure.analysis.prompts.p3_inference import build_p3_prompt
from app.logger import get_logger

logger = get_logger(__name__)

_MAX_CONCURRENT = 4  # parallel LLM calls


async def run_p3(
    run_id: str,
    behavioral_events: list[dict],  # type: ignore[type-arg]
    role_profile_summary: str,
    baseline_summary: str,
    provider: AgentCliProvider,
    model: str,
    timeout_seconds: int,
    max_retries: int,
) -> dict[str, dict]:  # type: ignore[type-arg]
    """Run P3 inference for all relevant dimensions in parallel.

    Returns a mapping of dimension_id -> P3 inference dict.
    Only runs inference for dimensions that have at least one related event.
    """
    # Group events by dimension relevance
    events_by_dim = _group_events_by_dimension(behavioral_events)

    if not events_by_dim:
        logger.info("P3: no dimension-relevant events for run %s — skipping", run_id)
        return {}

    logger.info(
        "P3: run_id=%s dimensions_with_events=%d total_events=%d",
        run_id,
        len(events_by_dim),
        len(behavioral_events),
    )

    semaphore = asyncio.Semaphore(_MAX_CONCURRENT)

    async def infer_one(dim_id: str, dim_events: list[dict]) -> tuple[str, dict | None]:  # type: ignore[type-arg]
        async with semaphore:
            prompt = build_p3_prompt(
                dimension_id=dim_id,
                role_profile_summary=role_profile_summary,
                baseline_summary=baseline_summary,
                behavioral_events=dim_events,
            )
            logger.debug("P3: inferring dim=%s run=%s events=%d", dim_id, run_id, len(dim_events))
            try:
                result = await call_llm(
                    provider=provider,
                    model=model,
                    prompt=prompt,
                    timeout_seconds=timeout_seconds,
                    max_retries=max_retries,
                )
                if isinstance(result, dict) and result.get("dimension_id") == dim_id:
                    logger.debug(
                        "P3: dim=%s run=%s maturity=%s score=%s confidence=%s",
                        dim_id,
                        run_id,
                        result.get("maturity_level"),
                        result.get("inferred_score"),
                        result.get("confidence_score"),
                    )
                    return dim_id, result
                logger.warning("P3: unexpected output structure for dim=%s run=%s", dim_id, run_id)
                return dim_id, None
            except LLMCallError as exc:
                logger.warning("P3: failed for dim=%s run=%s: %s", dim_id, run_id, exc)
                return dim_id, None

    tasks = [infer_one(dim_id, events) for dim_id, events in events_by_dim.items()]
    results = await asyncio.gather(*tasks)

    inference_map: dict[str, dict] = {}  # type: ignore[type-arg]
    for dim_id, inference in results:
        if inference is not None:
            inference_map[dim_id] = inference

    logger.info(
        "P3 complete: run_id=%s inferred=%d/%d",
        run_id,
        len(inference_map),
        len(events_by_dim),
    )
    return inference_map


def _group_events_by_dimension(
    events: list[dict],  # type: ignore[type-arg]
) -> dict[str, list[dict]]:  # type: ignore[type-arg]
    """Map each dimension_id to the subset of events related to it."""
    by_dim: dict[str, list[dict]] = {}  # type: ignore[type-arg]
    for ev in events:
        related = ev.get("related_dimensions", [])
        if not isinstance(related, list):
            continue
        for rel in related:
            if not isinstance(rel, dict):
                continue
            dim_id = rel.get("dimension_id", "")
            if dim_id not in DIMENSION_IDS:
                continue
            # Only include events with meaningful relation strength
            strength = rel.get("relation_strength", 0.0)
            if isinstance(strength, (int, float)) and float(strength) >= 0.30:
                by_dim.setdefault(dim_id, []).append(ev)
    return by_dim
