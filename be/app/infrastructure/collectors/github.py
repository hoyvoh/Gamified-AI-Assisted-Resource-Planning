"""GitHub data collector — uses the `gh` CLI (no direct API tokens).

Collects three data streams in parallel:
  1. PRs authored by the user (with review context)
  2. PRs where the user commented or reviewed
  3. Commits authored by the user
"""

import asyncio
import json
import logging

from app.infrastructure.collectors.base import (
    CollectionResult,
    CollectorTimeoutError,
    CollectorUnavailableError,
)

logger = logging.getLogger(__name__)


class GitHubCollector:
    _SOURCE_TYPE: str = "github"

    def __init__(self, timeout_seconds: int = 60) -> None:
        self._timeout = timeout_seconds

    async def check_auth(self) -> bool:
        """Return True if `gh auth status` succeeds."""
        try:
            proc = await asyncio.create_subprocess_exec(
                "gh",
                "auth",
                "status",
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            await asyncio.wait_for(proc.communicate(), timeout=10)
            return proc.returncode == 0
        except (TimeoutError, FileNotFoundError):
            return False

    async def collect(
        self,
        handle: str,
        period_start: str,
        period_end: str,
    ) -> CollectionResult:
        """Collect GitHub activity in parallel: authored PRs, reviewed PRs, commits."""
        authenticated = await self.check_auth()
        if not authenticated:
            logger.warning("GitHub CLI not authenticated — skipping GitHub source")
            return CollectionResult(
                source_type=self._SOURCE_TYPE,
                source_handle=handle,
                records=[],
                status="skipped",
                error_message="GitHub CLI not authenticated. Run `gh auth login` on the host machine.",
            )

        # Run all three fetches in parallel — none write to the DB
        authored_task = asyncio.create_task(
            self._fetch_authored_prs(handle, period_start, period_end)
        )
        reviewed_task = asyncio.create_task(
            self._fetch_reviewed_prs(handle, period_start, period_end)
        )
        commits_task = asyncio.create_task(self._fetch_commits(handle, period_start, period_end))

        batches = await asyncio.gather(
            authored_task, reviewed_task, commits_task, return_exceptions=True
        )

        records: list[dict] = []
        errors: list[str] = []
        labels = ["authored_prs", "reviewed_prs", "commits"]
        for label, batch in zip(labels, batches, strict=False):
            if isinstance(batch, Exception):
                logger.warning("GitHub %s fetch error for %s: %s", label, handle, batch)
                errors.append(f"{label}: {batch}")
            elif isinstance(batch, list):
                records.extend(batch)
                logger.info("GitHub %s: %d records for %s", label, len(batch), handle)

        if not records and errors:
            return CollectionResult(
                source_type=self._SOURCE_TYPE,
                source_handle=handle,
                records=[],
                status="failed",
                error_message="; ".join(errors),
            )

        return CollectionResult(
            source_type=self._SOURCE_TYPE,
            source_handle=handle,
            records=records,
            status="collected" if records else "skipped",
            error_message=("; ".join(errors) if errors else None),
        )

    # ── private fetch methods ─────────────────────────────────────────────────

    async def _fetch_authored_prs(
        self, handle: str, period_start: str, period_end: str
    ) -> list[dict]:
        """Fetch PRs authored by the user via GitHub search API."""
        query = f"type:pr+author:{handle}+created:{period_start}..{period_end}"
        data = await self._gh_api(f"search/issues?q={query}&per_page=50&sort=created&order=desc")
        if isinstance(data, str):
            raise RuntimeError(data)
        items = data.get("items", []) if isinstance(data, dict) else []
        return [
            {
                "type": "pr_authored",
                "number": pr.get("number"),
                "title": pr.get("title", ""),
                "body": (pr.get("body") or "")[:2000],
                "state": pr.get("state", ""),
                "created_at": pr.get("created_at", ""),
                "updated_at": pr.get("updated_at", ""),
                "html_url": pr.get("html_url", ""),
                "comments": pr.get("comments", 0),
                "review_comments": pr.get("review_comments", 0),
                "repo": _extract_repo(pr.get("repository_url", "")),
                "labels": [lb.get("name") for lb in (pr.get("labels") or [])],
            }
            for pr in items
        ]

    async def _fetch_reviewed_prs(
        self, handle: str, period_start: str, period_end: str
    ) -> list[dict]:
        """Fetch PRs where the user left a review or comment."""
        query = f"type:pr+commenter:{handle}+updated:{period_start}..{period_end}"
        data = await self._gh_api(f"search/issues?q={query}&per_page=50&sort=updated&order=desc")
        if isinstance(data, str):
            raise RuntimeError(data)
        items = data.get("items", []) if isinstance(data, dict) else []
        return [
            {
                "type": "pr_reviewed",
                "number": pr.get("number"),
                "title": pr.get("title", ""),
                "state": pr.get("state", ""),
                "updated_at": pr.get("updated_at", ""),
                "html_url": pr.get("html_url", ""),
                "repo": _extract_repo(pr.get("repository_url", "")),
                "pr_author": (pr.get("user") or {}).get("login", ""),
            }
            for pr in items
            # exclude PRs authored by the user (already in authored_prs)
            if (pr.get("user") or {}).get("login", "").lower() != handle.lower()
        ]

    async def _fetch_commits(self, handle: str, period_start: str, period_end: str) -> list[dict]:
        """Fetch commits authored by the user via gh search commits."""
        try:
            # gh search commits uses the commit search API with correct Accept header
            proc = await asyncio.create_subprocess_exec(
                "gh",
                "search",
                "commits",
                "--author",
                handle,
                "--committer-date",
                f"{period_start}..{period_end}",
                "--limit",
                "100",
                "--json",
                "sha,message,url,committedDate,repository",
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            try:
                stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=self._timeout)
            except TimeoutError as exc:
                proc.kill()
                raise CollectorTimeoutError("gh search commits timed out") from exc

            if proc.returncode != 0:
                err = stderr.decode(errors="replace").strip()
                logger.warning("gh search commits failed: %s", err[:200])
                return []

            raw = stdout.decode(errors="replace").strip()
            if not raw:
                return []
            commits = json.loads(raw)
            return [
                {
                    "type": "commit",
                    "sha": c.get("sha", "")[:12],
                    "message": (c.get("message") or "")[:500],
                    "url": c.get("url", ""),
                    "committed_at": c.get("committedDate", ""),
                    "repo": (c.get("repository") or {}).get("nameWithOwner", ""),
                }
                for c in (commits if isinstance(commits, list) else [])
            ]
        except (FileNotFoundError, CollectorTimeoutError):
            raise
        except json.JSONDecodeError:
            return []

    async def _gh_api(self, path: str) -> dict | list | str:
        """Call `gh api <path>` and return parsed JSON or an error string."""
        cmd = ["gh", "api", path]
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
                raise CollectorTimeoutError(
                    f"gh api {path} timed out after {self._timeout}s"
                ) from exc

            if proc.returncode != 0:
                return stderr.decode(errors="replace").strip() or f"gh api {path} failed"

            raw = stdout.decode(errors="replace").strip()
            return json.loads(raw) if raw else {}

        except CollectorTimeoutError:
            raise
        except FileNotFoundError:
            raise CollectorUnavailableError(
                "gh CLI not found on PATH. Install GitHub CLI: https://cli.github.com"
            ) from None
        except json.JSONDecodeError as exc:
            return f"JSON parse error: {exc}"


def _extract_repo(repository_url: str) -> str:
    """Extract 'owner/repo' from GitHub API repository_url."""
    parts = repository_url.rstrip("/").split("/")
    if len(parts) >= 2:
        return f"{parts[-2]}/{parts[-1]}"
    return repository_url


def _in_period(timestamp: str, start: str, end: str) -> bool:
    if not timestamp:
        return False
    return start <= timestamp[:10] <= end
