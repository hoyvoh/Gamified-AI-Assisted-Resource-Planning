"""Chunk raw source records into P1 input batches.

Grouping strategy (in order of preference):
1. Group by source_type (GitHub events together, Slack messages together)
2. Within each source group, split into fixed-size chunks of CHUNK_SIZE records
3. Sort records within each chunk by timestamp ascending

This keeps related artifacts together (a GitHub PR and its review comments
end up in the same chunk) while bounding prompt token count.
"""

from __future__ import annotations

_CHUNK_SIZE = 20  # records per P1 call — balances context vs token budget
_MAX_CONTENT_LEN = 800  # truncate individual record content to this many chars


def chunk_records(
    records: list[dict],  # type: ignore[type-arg]
    chunk_size: int = _CHUNK_SIZE,
) -> list[list[dict]]:  # type: ignore[type-arg]
    """Split records into chunks for parallel P1 execution.

    Returns a list of chunks, each a list of record dicts ready for the P1 prompt.
    """
    if not records:
        return []

    # Group by source type so related artifacts stay together
    by_source: dict[str, list[dict]] = {}  # type: ignore[type-arg]
    for rec in records:
        src = rec.get("source", "unknown")
        by_source.setdefault(src, []).append(rec)

    chunks: list[list[dict]] = []  # type: ignore[type-arg]
    for source_records in by_source.values():
        # Sort by timestamp within each source group
        sorted_recs = sorted(
            source_records,
            key=lambda r: r.get("timestamp", ""),
        )
        # Split into fixed-size slices
        for i in range(0, len(sorted_recs), chunk_size):
            chunk = sorted_recs[i : i + chunk_size]
            chunks.append([_prepare_record(r, idx) for idx, r in enumerate(chunk)])

    return chunks


def _prepare_record(
    raw: dict,  # type: ignore[type-arg]
    idx: int,
) -> dict:  # type: ignore[type-arg]
    """Normalise a source payload record into a standard P1 input shape."""
    content = str(raw.get("content", "") or raw.get("message", "") or "")
    if len(content) > _MAX_CONTENT_LEN:
        content = content[:_MAX_CONTENT_LEN] + "...[truncated]"

    return {
        "record_id": raw.get("record_id") or f"rec_{idx}",
        "timestamp": raw.get("timestamp", ""),
        "source_type": raw.get("source", "unknown"),
        "title": raw.get("title") or raw.get("type", ""),
        "content": content,
        "thread_context": raw.get("thread_id") or raw.get("context", ""),
    }
