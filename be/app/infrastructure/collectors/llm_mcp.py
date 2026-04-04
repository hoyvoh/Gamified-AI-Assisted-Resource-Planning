"""LLM-mediated MCP collector — delegates Slack/Confluence/Jira collection to the LLM CLI.

The backend never holds Slack/Confluence/Jira tokens. Instead it calls the LLM CLI
(e.g. `claude -p "..."`) and instructs it to use its configured MCP servers to
fetch and return structured JSON. The LLM's own MCP configuration handles auth.
"""

import asyncio
import json
import logging
import re

from app.infrastructure.collectors.base import (
    CollectionResult,
    CollectorTimeoutError,
    CollectorUnavailableError,
)

logger = logging.getLogger(__name__)

_KNOWN_MCP_SOURCES = {"slack", "confluence", "jira", "notion", "linear"}

_COLLECTION_PROMPT_TEMPLATE = """\
You have access to MCP tools. Collect developer activity data for analysis.

Developer:
  Name: {display_name}
  GitHub handle: {external_id}
  Period: {period_start} to {period_end}

Available MCP servers (detected): {available_sources}

Instructions:
1. For each available MCP server, collect all messages, documents, tickets,
   and activity records created or authored by this person within the period.
2. If a source has no data for this person, include it in unavailable_sources
   with a note — do not omit it silently.
3. Resolve the person by name or handle — do your best if an exact match is unclear.

Return ONLY a valid JSON object (no markdown, no explanation) matching this schema exactly:
{{
  "sources_queried": ["slack", "confluence"],
  "records": [
    {{
      "source": "slack",
      "type": "message",
      "content": "...",
      "timestamp": "YYYY-MM-DDTHH:MM:SSZ",
      "metadata": {{}}
    }}
  ],
  "unavailable_sources": ["jira"],
  "notes": "..."
}}
"""


class LLMMCPCollector:
    _SOURCE_TYPE: str = "mcp"

    def __init__(self, cli_tool: str, model: str, timeout_seconds: int = 120) -> None:
        self._cli = cli_tool
        self._model = model
        self._timeout = timeout_seconds

    async def probe_mcp_sources(self) -> list[str]:
        """Detect which MCP servers are configured by running `<cli> mcp list`."""
        try:
            proc = await asyncio.create_subprocess_exec(
                self._cli,
                "mcp",
                "list",
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            stdout, _ = await asyncio.wait_for(proc.communicate(), timeout=5)
            output = stdout.decode(errors="replace").lower()
            found = [src for src in _KNOWN_MCP_SOURCES if src in output]
            return found
        except FileNotFoundError:
            raise CollectorUnavailableError(
                f"LLM CLI `{self._cli}` not found on PATH. "
                "Install and authenticate it before running analysis."
            ) from None
        except TimeoutError:
            logger.warning("MCP probe timed out — assuming no MCP sources available")
            return []

    async def collect(
        self,
        display_name: str,
        external_id: str | None,
        period_start: str,
        period_end: str,
    ) -> list[CollectionResult]:
        """Collect data from all available MCP sources via LLM CLI.

        Returns one CollectionResult per detected MCP source type.
        """
        try:
            available = await self.probe_mcp_sources()
        except CollectorUnavailableError as exc:
            logger.warning("LLM CLI unavailable — skipping MCP sources: %s", exc)
            return [
                CollectionResult(
                    source_type="mcp",
                    source_handle=display_name,
                    records=[],
                    status="skipped",
                    error_message=str(exc),
                )
            ]

        if not available:
            logger.info("No known MCP sources configured for %s — skipping", self._cli)
            return [
                CollectionResult(
                    source_type="mcp",
                    source_handle=display_name,
                    records=[],
                    status="skipped",
                    error_message="No MCP servers configured. Add Slack/Confluence/Jira MCP to your LLM CLI.",
                )
            ]

        prompt = _COLLECTION_PROMPT_TEMPLATE.format(
            display_name=display_name,
            external_id=external_id or "unknown",
            period_start=period_start,
            period_end=period_end,
            available_sources=", ".join(available),
        )

        raw_response = await self._run_llm(prompt)
        if raw_response is None:
            return [
                CollectionResult(
                    source_type="mcp",
                    source_handle=display_name,
                    records=[],
                    status="failed",
                    error_message="LLM CLI returned no output",
                )
            ]

        parsed = _parse_json_response(raw_response)
        if parsed is None:
            logger.warning(
                "Could not parse LLM MCP response as JSON. Raw (first 200 chars): %s",
                raw_response[:200],
            )
            return [
                CollectionResult(
                    source_type="mcp",
                    source_handle=display_name,
                    records=[],
                    status="failed",
                    error_message="LLM returned non-JSON response",
                )
            ]

        return _split_by_source(parsed, display_name)

    async def _run_llm(self, prompt: str) -> str | None:
        """Invoke the LLM CLI with a prompt and return its stdout."""
        cmd = [self._cli, "-p", prompt]
        if self._model:
            cmd = [self._cli, "--model", self._model, "-p", prompt]
        try:
            proc = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            try:
                stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=self._timeout)
            except TimeoutError as exc:
                proc.kill()
                raise CollectorTimeoutError(f"LLM CLI timed out after {self._timeout}s") from exc

            if proc.returncode != 0:
                err = stderr.decode(errors="replace").strip()
                logger.warning("LLM CLI exited with code %d: %s", proc.returncode, err[:300])
                return None

            return stdout.decode(errors="replace").strip() or None

        except CollectorTimeoutError:
            raise
        except FileNotFoundError:
            raise CollectorUnavailableError(f"LLM CLI `{self._cli}` not found on PATH.") from None


def _parse_json_response(raw: str) -> dict | None:  # type: ignore[type-arg]
    """Extract a JSON object from LLM output (handles markdown code fences)."""
    # Strip markdown code fences if present
    stripped = re.sub(r"^```(?:json)?\s*", "", raw.strip(), flags=re.MULTILINE)
    stripped = re.sub(r"\s*```$", "", stripped.strip(), flags=re.MULTILINE)
    try:
        result = json.loads(stripped)
        return result if isinstance(result, dict) else None
    except json.JSONDecodeError:
        return None


def _split_by_source(
    payload: dict,  # type: ignore[type-arg]
    handle: str,
) -> list[CollectionResult]:
    """Turn the LLM's unified JSON response into per-source CollectionResults."""
    records: list[dict] = payload.get("records", [])  # type: ignore[type-arg]
    sources_queried: list[str] = payload.get("sources_queried", [])
    unavailable: list[str] = payload.get("unavailable_sources", [])

    # Group records by source
    by_source: dict[str, list[dict]] = {}  # type: ignore[type-arg]
    for rec in records:
        src = rec.get("source", "unknown")
        by_source.setdefault(src, []).append(rec)

    results: list[CollectionResult] = []

    for src in sources_queried:
        src_records = by_source.get(src, [])
        results.append(
            CollectionResult(
                source_type=src,
                source_handle=handle,
                records=src_records,
                status="collected",
            )
        )

    for src in unavailable:
        results.append(
            CollectionResult(
                source_type=src,
                source_handle=handle,
                records=[],
                status="skipped",
                error_message=f"No data found for this member in {src} during the period",
            )
        )

    if not results:
        results.append(
            CollectionResult(
                source_type="mcp",
                source_handle=handle,
                records=[],
                status="skipped",
                error_message="LLM response had no sources_queried or unavailable_sources",
            )
        )

    return results
