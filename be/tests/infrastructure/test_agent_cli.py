"""Unit tests for agent CLI provider command adapters."""

import subprocess
from unittest.mock import patch

import pytest

from app.infrastructure.agent_cli.base import AgentCliError
from app.infrastructure.agent_cli.claude import ClaudeCliProvider
from app.infrastructure.agent_cli.codex import CodexCliProvider
from app.infrastructure.agent_cli.factory import create_agent_cli_provider


def _completed(
    stdout: bytes = b"",
    stderr: bytes = b"",
    returncode: int = 0,
) -> subprocess.CompletedProcess:
    return subprocess.CompletedProcess(
        args=[],
        returncode=returncode,
        stdout=stdout,
        stderr=stderr,
    )


class TestAgentCliFactory:
    def test_creates_claude_provider(self) -> None:
        assert isinstance(create_agent_cli_provider("claude"), ClaudeCliProvider)

    def test_creates_codex_provider(self) -> None:
        assert isinstance(create_agent_cli_provider("codex"), CodexCliProvider)

    def test_rejects_unknown_provider(self) -> None:
        with pytest.raises(ValueError):
            create_agent_cli_provider("unknown")


class TestClaudeCliProvider:
    async def test_run_prompt_uses_claude_prompt_command(self) -> None:
        calls = []

        def fake_run(args, **kwargs):
            calls.append((args, kwargs))
            return _completed(stdout=b'{"ok": true}')

        with patch("app.infrastructure.agent_cli.common.subprocess.run", side_effect=fake_run):
            result = await ClaudeCliProvider().run_prompt("hello", "claude-sonnet-4-6", 10)

        assert result == '{"ok": true}'
        assert calls[0][0] == ["claude", "--model", "claude-sonnet-4-6", "-p", "hello"]
        assert calls[0][1]["input"] is None

    async def test_list_mcp_sources_uses_claude_mcp_list(self) -> None:
        calls = []

        def fake_run(args, **kwargs):
            calls.append(args)
            return _completed(stdout=b"slack\nlinear\n")

        with patch("app.infrastructure.agent_cli.common.subprocess.run", side_effect=fake_run):
            result = await ClaudeCliProvider().list_mcp_sources()

        assert calls[0] == ["claude", "mcp", "list"]
        assert result == ["linear", "slack"]


class TestCodexCliProvider:
    async def test_run_prompt_uses_codex_exec_with_stdin(self) -> None:
        calls = []

        def fake_run(args, **kwargs):
            calls.append((args, kwargs))
            return _completed(stdout=b'{"ok": true}')

        with patch("app.infrastructure.agent_cli.common.subprocess.run", side_effect=fake_run):
            result = await CodexCliProvider().run_prompt("hello", "gpt-5.4", 10)

        assert result == '{"ok": true}'
        assert calls[0][0] == ["codex", "exec", "--model", "gpt-5.4", "-"]
        assert calls[0][1]["input"] == b"hello"

    async def test_list_mcp_sources_uses_codex_mcp_list(self) -> None:
        calls = []

        def fake_run(args, **kwargs):
            calls.append(args)
            return _completed(stdout=b"notion\njira\n")

        with patch("app.infrastructure.agent_cli.common.subprocess.run", side_effect=fake_run):
            result = await CodexCliProvider().list_mcp_sources()

        assert calls[0] == ["codex", "mcp", "list"]
        assert result == ["jira", "notion"]

    async def test_nonzero_exit_includes_stderr(self) -> None:
        def fake_run(args, **kwargs):
            return _completed(stderr=b"not logged in", returncode=1)

        with (
            patch("app.infrastructure.agent_cli.common.subprocess.run", side_effect=fake_run),
            pytest.raises(AgentCliError, match="not logged in"),
        ):
            await CodexCliProvider().run_prompt("hello", "gpt-5.4", 10)

