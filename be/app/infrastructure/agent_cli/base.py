"""Shared agent CLI provider contracts."""

from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class AgentCliHealth:
    provider: str
    installed: bool
    authenticated: bool | None
    mcp_available: bool
    mcp_sources: list[str]
    errors: list[str]


class AgentCliError(Exception):
    """Base exception for agent CLI provider failures."""


class AgentCliUnavailableError(AgentCliError):
    """Raised when the configured CLI executable is unavailable."""


class AgentCliTimeoutError(AgentCliError):
    """Raised when the configured CLI exceeds its timeout."""


class AgentCliProvider(Protocol):
    name: str

    async def health_check(self) -> AgentCliHealth:
        """Return readiness information for diagnostics."""

    async def list_mcp_sources(self) -> list[str]:
        """Return configured MCP source names understood by the app."""

    async def run_prompt(
        self,
        prompt: str,
        model: str,
        timeout_seconds: int,
    ) -> str:
        """Run a non-interactive prompt and return stdout text."""

