"""Chunk raw source records into P1 input batches.

Grouping strategy (in order of preference):
1. Group by source_type (GitHub events together, Slack messages together)
2. Within each source group, split into fixed-size chunks of CHUNK_SIZE records
3. Sort records within each chunk by timestamp ascending

This keeps related artifacts together (a GitHub PR and its review comments
end up in the same chunk) while bounding prompt token count.

Record normalisation
────────────────────
GitHub records use non-standard field names (body/message instead of
content, created_at/committed_at instead of timestamp, sha/number instead
of record_id, source_type instead of source). _prepare_record handles all
of these so the P1 prompt always sees a uniform shape.
"""

from __future__ import annotations

_CHUNK_SIZE = 20  # records per P1 call — balances context vs token budget
_MAX_CONTENT_LEN = 1500  # truncate per-record content to this many chars


def chunk_records(
    records: list[dict],  # type: ignore[type-arg]
    chunk_size: int = _CHUNK_SIZE,
) -> list[list[dict]]:  # type: ignore[type-arg]
    """Split records into chunks for parallel P1 execution."""
    if not records:
        return []

    # Group by source_type (runner.py injects this); fall back to 'source'
    by_source: dict[str, list[dict]] = {}  # type: ignore[type-arg]
    for rec in records:
        src = rec.get("source_type") or rec.get("source", "unknown")
        by_source.setdefault(src, []).append(rec)

    chunks: list[list[dict]] = []  # type: ignore[type-arg]
    for source_records in by_source.values():
        sorted_recs = sorted(
            source_records,
            key=lambda r: _pick_timestamp(r),
        )
        for i in range(0, len(sorted_recs), chunk_size):
            chunk = sorted_recs[i : i + chunk_size]
            chunks.append([_prepare_record(r, idx) for idx, r in enumerate(chunk)])

    return chunks


def build_content_excerpt(raw: dict) -> str:  # type: ignore[type-arg]
    """Build a human-readable content string from a raw source record.

    Called by both the chunker (for LLM prompts) and the p1_runner (for
    evidence_unit.content_excerpt stored in the DB).
    """
    record_type = raw.get("type", "")

    if record_type == "commit":
        return _build_commit_content(raw)
    if record_type == "pr_authored":
        return _build_authored_pr_content(raw)
    if record_type == "pr_reviewed":
        return _build_reviewed_pr_content(raw)

    # Generic fallback — covers Slack/Confluence/Jira MCP records
    for field in ("content", "message", "body", "text"):
        val = raw.get(field)
        if val:
            return str(val)
    return ""


# ── per-type content builders ─────────────────────────────────────────────────


def _build_commit_content(raw: dict) -> str:  # type: ignore[type-arg]
    parts: list[str] = []
    if raw.get("message"):
        parts.append(f"Commit message: {raw['message']}")
    for f in (raw.get("files_changed") or [])[:10]:
        fname = f.get("filename", "")
        add = f.get("additions", 0)
        delete = f.get("deletions", 0)
        status = f.get("status", "")
        line = f"  {status} {fname} (+{add}/-{delete})"
        patch = f.get("patch", "")
        if patch:
            line += f"\n    {patch[:200]}"
        parts.append(line)
    return "\n".join(parts)


def _build_authored_pr_content(raw: dict) -> str:  # type: ignore[type-arg]
    parts: list[str] = []
    if raw.get("body"):
        parts.append(f"PR description:\n{raw['body']}")

    for r in (raw.get("reviews_received") or [])[:5]:
        author = r.get("author", "reviewer")
        state = r.get("state", "")
        body = r.get("body", "").strip()
        if body:
            parts.append(f"Review from {author} [{state}]: {body}")

    for c in (raw.get("inline_feedback_received") or [])[:8]:
        author = c.get("author", "reviewer")
        path = c.get("path", "")
        body = c.get("body", "").strip()
        outdated_note = (
            " [comment on obsolete code — feedback was acted on]" if c.get("outdated") else ""
        )
        if body:
            hunk = c.get("diff_hunk", "")
            if hunk:
                parts.append(
                    f"Inline feedback from {author} on {path}{outdated_note}:\n  Code:\n{hunk}\n  Comment: {body}"
                )
            else:
                parts.append(f"Inline feedback from {author} on {path}{outdated_note}: {body}")

    files = (raw.get("files_changed") or [])[:15]
    if files:
        file_lines = []
        for f in files:
            line = f"  {f.get('status', '')} {f.get('filename', '')} (+{f.get('additions', 0)}/-{f.get('deletions', 0)})"
            if f.get("patch"):
                line += f"\n    {f['patch'][:200]}"
            file_lines.append(line)
        parts.append("Files changed:\n" + "\n".join(file_lines))

    return "\n\n".join(parts)


def _build_reviewed_pr_content(raw: dict) -> str:  # type: ignore[type-arg]
    parts: list[str] = []

    for r in (raw.get("review_summaries") or [])[:5]:
        state = r.get("state", "")
        body = r.get("body", "").strip()
        if body:
            parts.append(f"Review submitted [{state}]: {body}")

    for c in (raw.get("inline_comments") or [])[:8]:
        path = c.get("path", "")
        body = c.get("body", "").strip()
        outdated_note = (
            " [comment on obsolete code — feedback was acted on]" if c.get("outdated") else ""
        )
        if body:
            hunk = c.get("diff_hunk", "")
            if hunk:
                parts.append(
                    f"Inline comment on {path}{outdated_note}:\n  Code:\n{hunk}\n  Comment: {body}"
                )
            else:
                parts.append(f"Inline comment on {path}{outdated_note}: {body}")

    files = (raw.get("files_changed") or [])[:15]
    if files:
        file_lines = [
            f"  {f.get('filename', '')} (+{f.get('additions', 0)}/-{f.get('deletions', 0)})"
            for f in files
        ]
        parts.append("Reviewed PR files:\n" + "\n".join(file_lines))

    return "\n\n".join(parts)


# ── internal helpers ──────────────────────────────────────────────────────────


def _pick_timestamp(raw: dict) -> str:  # type: ignore[type-arg]
    """Best-effort timestamp extraction across all source record shapes."""
    return (
        raw.get("timestamp")
        or raw.get("created_at")
        or raw.get("committed_at")
        or raw.get("updated_at")
        or ""
    )


def _pick_record_id(raw: dict, idx: int) -> str:  # type: ignore[type-arg]
    """Best-effort record_id extraction across all source record shapes."""
    return (
        str(raw.get("record_id") or "")
        or str(raw.get("sha") or "")[:12]
        or (str(raw["number"]) if raw.get("number") else "")
        or f"rec_{idx}"
    )


def _prepare_record(
    raw: dict,  # type: ignore[type-arg]
    idx: int,
) -> dict:  # type: ignore[type-arg]
    """Normalise a source payload record into a standard P1 input shape."""
    content = build_content_excerpt(raw)
    if len(content) > _MAX_CONTENT_LEN:
        content = content[:_MAX_CONTENT_LEN] + "...[truncated]"

    return {
        "record_id": _pick_record_id(raw, idx),
        "timestamp": _pick_timestamp(raw),
        "source_type": raw.get("source_type") or raw.get("source", "unknown"),
        "title": raw.get("title") or raw.get("type", ""),
        "content": content,
        "thread_context": raw.get("thread_id") or raw.get("context", ""),
    }
