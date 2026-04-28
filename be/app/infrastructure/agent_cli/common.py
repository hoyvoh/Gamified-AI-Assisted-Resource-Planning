"""Shared subprocess helpers for agent CLI providers."""

from __future__ import annotations

import asyncio
import subprocess

from app.infrastructure.agent_cli.base import AgentCliTimeoutError, AgentCliUnavailableError

KNOWN_MCP_SOURCES = {"slack", "confluence", "jira", "notion", "linear"}


async def run_cli(
    args: list[str],
    *,
    timeout: float,
    stdin: str | None = None,
) -> tuple[int, bytes, bytes]:
    """Run a CLI subprocess in a thread so it works across event loop policies."""

    def _run() -> tuple[int, bytes, bytes]:
        try:
            result = subprocess.run(
                args,
                input=stdin.encode() if stdin is not None else None,
                capture_output=True,
                timeout=timeout,
            )
            return result.returncode, result.stdout, result.stderr
        except subprocess.TimeoutExpired as exc:
            raise AgentCliTimeoutError(f"`{args[0]}` timed out after {timeout}s") from exc
        except FileNotFoundError as exc:
            raise AgentCliUnavailableError(f"`{args[0]}` not found on PATH") from exc

    return await asyncio.to_thread(_run)


def parse_known_mcp_sources(output: str) -> list[str]:
    lowered = output.lower()
    return [source for source in sorted(KNOWN_MCP_SOURCES) if source in lowered]


def stderr_summary(stderr: bytes, fallback: str) -> str:
    text = stderr.decode(errors="replace").strip()
    return text[:300] if text else fallback

