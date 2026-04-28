"""Factory for configured agent CLI providers."""

from app.infrastructure.agent_cli.base import AgentCliProvider
from app.infrastructure.agent_cli.claude import ClaudeCliProvider
from app.infrastructure.agent_cli.codex import CodexCliProvider


def create_agent_cli_provider(provider: str) -> AgentCliProvider:
    if provider == "claude":
        return ClaudeCliProvider()
    if provider == "codex":
        return CodexCliProvider()
    raise ValueError(f"Unsupported agent CLI provider: {provider}")

