"""Codex CLI provider adapter."""

from app.infrastructure.agent_cli.base import (
    AgentCliError,
    AgentCliHealth,
    AgentCliProvider,
)
from app.infrastructure.agent_cli.common import parse_known_mcp_sources, run_cli, stderr_summary


class CodexCliProvider(AgentCliProvider):
    name = "codex"

    async def health_check(self) -> AgentCliHealth:
        errors: list[str] = []
        installed = True
        mcp_sources: list[str] = []
        try:
            returncode, stdout, stderr = await run_cli(["codex", "mcp", "list"], timeout=5)
            if returncode != 0:
                errors.append(stderr_summary(stderr, "Codex MCP probe failed"))
            else:
                mcp_sources = parse_known_mcp_sources(stdout.decode(errors="replace"))
        except AgentCliError as exc:
            installed = False
            errors.append(str(exc))

        return AgentCliHealth(
            provider=self.name,
            installed=installed,
            authenticated=None,
            mcp_available=bool(mcp_sources),
            mcp_sources=mcp_sources,
            errors=errors,
        )

    async def list_mcp_sources(self) -> list[str]:
        returncode, stdout, stderr = await run_cli(["codex", "mcp", "list"], timeout=5)
        if returncode != 0:
            raise AgentCliError(stderr_summary(stderr, "Codex MCP probe failed"))
        return parse_known_mcp_sources(stdout.decode(errors="replace"))

    async def run_prompt(self, prompt: str, model: str, timeout_seconds: int) -> str:
        cmd = ["codex", "exec"]
        if model:
            cmd.extend(["--model", model])
        cmd.append("-")
        returncode, stdout, stderr = await run_cli(cmd, timeout=timeout_seconds, stdin=prompt)
        if returncode != 0:
            raise AgentCliError(stderr_summary(stderr, f"Codex exited with code {returncode}"))
        return stdout.decode(errors="replace").strip()

