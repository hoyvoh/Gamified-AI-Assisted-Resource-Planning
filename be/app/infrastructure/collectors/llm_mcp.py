"""LLM-mediated MCP collector — delegates Slack/Confluence/Jira collection to the LLM CLI.

The backend never holds Slack/Confluence/Jira tokens. Instead it calls the LLM CLI
(e.g. `claude -p "..."`) and instructs it to use its configured MCP servers to
fetch and return structured JSON. The LLM's own MCP configuration handles auth.
"""

from app.infrastructure.agent_cli.base import (
    AgentCliError,
    AgentCliProvider,
    AgentCliTimeoutError,
    AgentCliUnavailableError,
)
from app.infrastructure.analysis.pipeline.llm_runner import _parse_json
from app.infrastructure.collectors.base import (
    CollectionResult,
    CollectorTimeoutError,
    CollectorUnavailableError,
)
from app.logger import get_logger

logger = get_logger(__name__)

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

    def __init__(
        self,
        provider: AgentCliProvider,
        model: str,
        timeout_seconds: int = 120,
    ) -> None:
        self._provider = provider
        self._model = model
        self._timeout = timeout_seconds

    async def probe_mcp_sources(self) -> list[str]:
        """Detect which MCP servers are configured for the selected provider."""
        try:
            return await self._provider.list_mcp_sources()
        except AgentCliUnavailableError:
            raise CollectorUnavailableError(
                f"LLM CLI `{self._provider.name}` not found on PATH. "
                "Install and authenticate it before running analysis."
            ) from None
        except AgentCliTimeoutError:
            logger.warning("MCP probe timed out — assuming no MCP sources available")
            return []
        except AgentCliError as exc:
            logger.warning("MCP probe failed for %s: %s", self._provider.name, exc)
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

        logger.debug(
            "MCP probe result: provider=%s available_sources=%s",
            self._provider.name,
            available,
        )
        if not available:
            logger.info("No known MCP sources configured for %s — skipping", self._provider.name)
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

        logger.info("MCP collection starting: display_name=%s sources=%s", display_name, available)
        logger.debug("MCP collection prompt (len=%d):\n%s", len(prompt), prompt[:1000])
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

        logger.debug("MCP raw response (len=%d): %s", len(raw_response), raw_response[:500])
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
        try:
            return (
                await self._provider.run_prompt(
                    prompt=prompt,
                    model=self._model,
                    timeout_seconds=self._timeout,
                )
            ) or None
        except AgentCliTimeoutError as exc:
            raise CollectorTimeoutError(str(exc)) from exc
        except AgentCliUnavailableError as exc:
            raise CollectorUnavailableError(str(exc)) from exc
        except AgentCliError as exc:
            logger.warning("LLM CLI exited unsuccessfully: %s", exc)
            return None


def _parse_json_response(raw: str) -> dict | None:  # type: ignore[type-arg]
    """Extract a JSON object from LLM output (handles markdown code fences)."""
    result = _parse_json(raw)
    return result if isinstance(result, dict) else None


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
