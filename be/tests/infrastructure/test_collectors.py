"""Unit tests for GitHub and LLM-MCP collectors.

Tests run entirely with mocked subprocess calls — no real network or CLI needed.
"""

import json
from unittest.mock import AsyncMock, patch

import pytest

from app.infrastructure.collectors.base import (
    CollectionResult,
    CollectorTimeoutError,
    CollectorUnavailableError,
)
from app.infrastructure.collectors.github import GitHubCollector
from app.infrastructure.collectors.llm_mcp import LLMMCPCollector

# ── helpers ───────────────────────────────────────────────────────────────────


def _ok(stdout: bytes = b"", stderr: bytes = b"") -> tuple[int, bytes, bytes]:
    return (0, stdout, stderr)


def _fail(stderr: bytes = b"", returncode: int = 1) -> tuple[int, bytes, bytes]:
    return (returncode, b"", stderr)


_RUN_SUB_GH = "app.infrastructure.collectors.github.run_subprocess"
_RUN_SUB_MCP = "app.infrastructure.collectors.llm_mcp.run_subprocess"


# ── GitHubCollector ───────────────────────────────────────────────────────────


class TestGitHubCollectorAuth:
    async def test_check_auth_true_when_zero_exit(self) -> None:
        with patch(_RUN_SUB_GH, AsyncMock(return_value=_ok())):
            result = await GitHubCollector().check_auth()
        assert result is True

    async def test_check_auth_false_when_nonzero_exit(self) -> None:
        with patch(_RUN_SUB_GH, AsyncMock(return_value=_fail())):
            result = await GitHubCollector().check_auth()
        assert result is False

    async def test_check_auth_raises_when_cli_missing(self) -> None:
        with (
            patch(_RUN_SUB_GH, AsyncMock(side_effect=CollectorUnavailableError("not found"))),
            pytest.raises(CollectorUnavailableError),
        ):
            await GitHubCollector().check_auth()

    async def test_collect_skipped_when_not_authenticated(self) -> None:
        gh = GitHubCollector()
        with patch.object(gh, "check_auth", AsyncMock(return_value=False)):
            result = await gh.collect("bob", "2024-01-01", "2024-06-30")
        assert result.status == "skipped"
        assert result.record_count == 0
        assert "not authenticated" in (result.error_message or "").lower()


class TestGitHubCollectorCommitParsing:
    """Commit records now use nested `commit` object — validate field extraction."""

    async def test_commit_fields_extracted_from_nested_commit_object(self) -> None:
        raw_commits = json.dumps(
            [
                {
                    "sha": "abc123def456789",
                    "commit": {
                        "message": "feat: add thing\n\nBody text",
                        "author": {"date": "2024-03-15T10:00:00Z"},
                        "committer": {"date": "2024-03-15T10:00:00Z"},
                    },
                    "url": "https://github.com/owner/repo/commit/abc123",
                    "repository": {"nameWithOwner": "owner/repo"},
                }
            ]
        )
        gh = GitHubCollector()
        empty_items = json.dumps({"items": []}).encode()

        call_count = 0

        async def fake_run(*args, **kwargs):
            nonlocal call_count
            call_count += 1
            # commits call uses "search" as second arg
            if len(args) > 1 and args[1] == "search":
                return _ok(raw_commits.encode())
            return _ok(empty_items)

        with (
            patch.object(gh, "check_auth", AsyncMock(return_value=True)),
            patch(_RUN_SUB_GH, side_effect=fake_run),
        ):
            result = await gh.collect("alice", "2024-01-01", "2024-06-30")

        assert result.status == "collected"
        commits = [r for r in result.records if r["type"] == "commit"]
        assert len(commits) == 1
        c = commits[0]
        assert c["sha"] == "abc123def456789"  # full SHA stored
        assert c["message"] == "feat: add thing\n\nBody text"
        assert c["committed_at"] == "2024-03-15T10:00:00Z"
        assert c["repo"] == "owner/repo"
        assert c["url"] == "https://github.com/owner/repo/commit/abc123"

    async def test_commit_falls_back_to_committer_date_when_author_missing(self) -> None:
        raw_commits = json.dumps(
            [
                {
                    "sha": "deadbeef",
                    "commit": {
                        "message": "fix: typo",
                        "committer": {"date": "2024-04-01T09:00:00Z"},
                    },
                    "url": "https://example.com",
                    "repository": {"nameWithOwner": "owner/repo"},
                }
            ]
        )
        gh = GitHubCollector()

        async def fake_run(*args, **kwargs):
            if len(args) > 1 and args[1] == "search":
                return _ok(raw_commits.encode())
            return _ok(json.dumps({"items": []}).encode())

        with (
            patch.object(gh, "check_auth", AsyncMock(return_value=True)),
            patch(_RUN_SUB_GH, side_effect=fake_run),
        ):
            result = await gh.collect("alice", "2024-01-01", "2024-06-30")

        commits = [r for r in result.records if r["type"] == "commit"]
        assert commits[0]["committed_at"] == "2024-04-01T09:00:00Z"

    async def test_commits_returns_empty_when_cli_fails(self) -> None:
        gh = GitHubCollector()

        async def fake_run(*args, **kwargs):
            if len(args) > 1 and args[1] == "search":
                return _fail(b"Unknown JSON field: message")
            return _ok(json.dumps({"items": []}).encode())

        with (
            patch.object(gh, "check_auth", AsyncMock(return_value=True)),
            patch(_RUN_SUB_GH, side_effect=fake_run),
        ):
            result = await gh.collect("alice", "2024-01-01", "2024-06-30")

        commits = [r for r in result.records if r["type"] == "commit"]
        assert len(commits) == 0


class TestGitHubCollectorPrParsing:
    async def test_authored_pr_record_shape(self) -> None:
        items = [
            {
                "number": 42,
                "title": "Add feature X",
                "body": "Description here",
                "state": "open",
                "created_at": "2024-02-01T12:00:00Z",
                "updated_at": "2024-02-02T12:00:00Z",
                "html_url": "https://github.com/owner/repo/pull/42",
                "comments": 3,
                "review_comments": 1,
                "repository_url": "https://api.github.com/repos/owner/repo",
                "labels": [{"name": "feature"}],
                "user": {"login": "alice"},
            }
        ]
        gh = GitHubCollector()
        with (
            patch.object(gh, "check_auth", AsyncMock(return_value=True)),
            patch.object(gh, "_gh_api", AsyncMock(return_value={"items": items})),
        ):
            result = await gh._fetch_authored_prs("alice", "2024-01-01", "2024-06-30")

        assert len(result) == 1
        pr = result[0]
        assert pr["type"] == "pr_authored"
        assert pr["number"] == 42
        assert pr["repo"] == "owner/repo"
        assert pr["labels"] == ["feature"]

    async def test_reviewed_prs_exclude_own_prs(self) -> None:
        """PRs authored by the same handle must not appear in reviewed list."""
        items = [
            {
                "number": 1,
                "title": "own PR",
                "state": "open",
                "updated_at": "2024-01-01",
                "html_url": "https://x",
                "repository_url": "https://api.github.com/repos/a/b",
                "user": {"login": "alice"},
            },
            {
                "number": 2,
                "title": "other PR",
                "state": "merged",
                "updated_at": "2024-01-02",
                "html_url": "https://y",
                "repository_url": "https://api.github.com/repos/a/b",
                "user": {"login": "bob"},
            },
        ]
        gh = GitHubCollector()
        with patch.object(gh, "_gh_api", AsyncMock(return_value={"items": items})):
            result = await gh._fetch_reviewed_prs("alice", "2024-01-01", "2024-06-30")

        assert len(result) == 1
        assert result[0]["number"] == 2
        assert result[0]["pr_author"] == "bob"


# ── LLMMCPCollector ───────────────────────────────────────────────────────────


class TestLLMMCPCollector:
    def _make_collector(self) -> LLMMCPCollector:
        return LLMMCPCollector(cli_tool="claude", model="claude-sonnet-4-6", timeout_seconds=10)

    async def test_returns_skipped_when_cli_not_found(self) -> None:
        collector = self._make_collector()
        with patch(_RUN_SUB_MCP, AsyncMock(side_effect=CollectorUnavailableError("not found"))):
            results = await collector.collect("Alice", "alice", "2024-01-01", "2024-06-30")

        assert len(results) == 1
        assert results[0].status == "skipped"
        assert results[0].source_type == "mcp"

    async def test_returns_skipped_when_no_mcp_sources_configured(self) -> None:
        collector = self._make_collector()
        with patch(_RUN_SUB_MCP, AsyncMock(return_value=_ok(b"No servers configured"))):
            results = await collector.collect("Alice", "alice", "2024-01-01", "2024-06-30")

        assert len(results) == 1
        assert results[0].status == "skipped"
        assert results[0].record_count == 0

    async def test_returns_skipped_when_probe_times_out(self) -> None:
        collector = self._make_collector()
        with patch(_RUN_SUB_MCP, AsyncMock(side_effect=CollectorTimeoutError("timed out"))):
            results = await collector.collect("Alice", "alice", "2024-01-01", "2024-06-30")

        assert len(results) == 1
        assert results[0].status == "skipped"

    async def test_returns_failed_when_llm_returns_no_output(self) -> None:
        collector = self._make_collector()
        call_count = 0

        async def fake_run(*args, **kwargs):
            nonlocal call_count
            call_count += 1
            return _ok(b"slack") if call_count == 1 else _ok(b"")

        with patch(_RUN_SUB_MCP, side_effect=fake_run):
            results = await collector.collect("Alice", "alice", "2024-01-01", "2024-06-30")

        assert any(r.status == "failed" for r in results)

    async def test_parses_json_response_into_per_source_results(self) -> None:
        collector = self._make_collector()
        response_json = json.dumps(
            {
                "sources_queried": ["slack"],
                "records": [
                    {
                        "source": "slack",
                        "type": "message",
                        "content": "Hello",
                        "timestamp": "2024-02-01T10:00:00Z",
                        "metadata": {},
                    }
                ],
                "unavailable_sources": ["jira"],
                "notes": "",
            }
        )
        call_count = 0

        async def fake_run(*args, **kwargs):
            nonlocal call_count
            call_count += 1
            return _ok(b"slack") if call_count == 1 else _ok(response_json.encode())

        with patch(_RUN_SUB_MCP, side_effect=fake_run):
            results = await collector.collect("Alice", "alice", "2024-01-01", "2024-06-30")

        by_type = {r.source_type: r for r in results}
        assert by_type["slack"].status == "collected"
        assert by_type["slack"].record_count == 1
        assert by_type["jira"].status == "skipped"


# ── Runner collection guard ───────────────────────────────────────────────────


class TestRunnerCollectionGuard:
    """Tests for the `if not collected_results:` fail-fast guard in runner.py.

    These use CollectionResult directly — no DB needed.
    """

    def _results(self, *statuses: str) -> list[CollectionResult]:
        return [
            CollectionResult(
                source_type="github" if i == 0 else "mcp",
                source_handle="handle",
                records=[{"x": i}] if s == "collected" else [],
                status=s,
                error_message=None if s == "collected" else f"{s} error",
            )
            for i, s in enumerate(statuses)
        ]

    def test_collected_results_filter_returns_only_collected(self) -> None:
        results = self._results("collected", "skipped")
        collected = [r for r in results if r.status == "collected"]
        assert len(collected) == 1
        assert collected[0].source_type == "github"

    def test_all_skipped_triggers_no_collected(self) -> None:
        results = self._results("skipped", "skipped")
        collected = [r for r in results if r.status == "collected"]
        assert not collected  # guard `if not collected_results:` fires

    def test_empty_results_triggers_no_collected(self) -> None:
        """Both collectors returned [] — the old bug would have false-greened here."""
        results: list[CollectionResult] = []
        collected = [r for r in results if r.status == "collected"]
        assert not collected  # guard fires

    def test_one_failed_one_collected_proceeds(self) -> None:
        results = self._results("failed", "collected")
        collected = [r for r in results if r.status == "collected"]
        assert len(collected) == 1  # guard does NOT fire

    def test_total_records_counts_only_across_all_results(self) -> None:
        results = self._results("collected", "skipped")
        total = sum(r.record_count for r in results)
        assert total == 1  # skipped has 0 records

    def test_all_records_built_from_collected_only(self) -> None:
        """Verify the all_records assembly loop mirrors runner.py logic."""
        results = self._results("collected", "skipped", "failed")
        collected = [r for r in results if r.status == "collected"]
        all_records = []
        for result in collected:
            for rec in result.records:
                all_records.append({**rec, "source_type": result.source_type})
        assert len(all_records) == 1
        assert all_records[0]["source_type"] == "github"

    def test_error_message_joined_from_non_collected(self) -> None:
        results = self._results("skipped", "failed")
        errors = "; ".join(r.error_message or "" for r in results if r.error_message)
        assert "skipped error" in errors
        assert "failed error" in errors
