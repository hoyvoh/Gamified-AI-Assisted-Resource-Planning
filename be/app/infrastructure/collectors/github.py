"""GitHub data collector — uses the `gh` CLI (no direct API tokens).

Collects three data streams, then enriches each with full content:

  Stream 1 — pr_authored
    Fields: title, body, state, labels, repo
    Enriched with: reviews_received (body + state), inline_feedback_received
                   (body + path + diff_hunk + outdated), files_changed

  Stream 2 — pr_reviewed
    Fields: title, state, pr_author, repo
    Enriched with: review_summaries (body + state), inline_comments
                   (body + path + diff_hunk + outdated), files_changed

  Stream 3 — commit
    Fields: sha (full), message, repo, committed_at
    Enriched with: files_changed (filename + patch excerpt)

`outdated=True` on a comment means the code it targets has since been
changed — a resolved/superseded comment. This is a strong signal that
the review feedback was actionable.
"""

import asyncio
import json

from app.infrastructure.collectors.base import (
    CollectionResult,
    CollectorTimeoutError,
    CollectorUnavailableError,
    run_subprocess,
)
from app.logger import get_logger

logger = get_logger(__name__)

# Maximum PRs/commits to enrich with secondary API calls.
# Each authored/reviewed PR costs up to 3 calls; each commit costs 1.
MAX_ENRICH_PRS = 20
MAX_ENRICH_COMMITS = 25
# Max concurrent gh API subprocess calls during enrichment phase.
# Prevents spawning 60+ threads simultaneously into asyncio.to_thread.
_ENRICH_CONCURRENCY = 10

# Per-file patch truncation (chars) to keep token budget reasonable.
_MAX_PATCH_CHARS = 400
_MAX_FILES_PER_RECORD = 30


class GitHubCollector:
    _SOURCE_TYPE: str = "github"

    def __init__(self, timeout_seconds: int = 60) -> None:
        self._timeout = timeout_seconds

    async def check_auth(self) -> bool:
        """Return True if `gh auth status` succeeds."""
        try:
            returncode, _, _ = await run_subprocess("gh", "auth", "status", timeout=10)
            return returncode == 0
        except CollectorUnavailableError:
            raise CollectorUnavailableError(
                "gh CLI not found on PATH. Install GitHub CLI: https://cli.github.com"
            ) from None
        except (CollectorTimeoutError, OSError, Exception) as exc:
            logger.warning(
                "gh auth check failed (%s: %r) — skipping GitHub", type(exc).__name__, exc
            )
            return False

    async def collect(
        self,
        handle: str,
        period_start: str,
        period_end: str,
    ) -> CollectionResult:
        """Collect and enrich GitHub activity."""
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

        logger.info(
            "GitHub collection starting: handle=%s period=%s to %s",
            handle,
            period_start,
            period_end,
        )

        # ── Phase 1: parallel metadata fetch ────────────────────────────────
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

        authored_prs: list[dict] = batches[0] if isinstance(batches[0], list) else []
        reviewed_prs: list[dict] = batches[1] if isinstance(batches[1], list) else []
        commits: list[dict] = batches[2] if isinstance(batches[2], list) else []

        errors: list[str] = []
        for label, batch in zip(["authored_prs", "reviewed_prs", "commits"], batches, strict=False):
            if isinstance(batch, Exception):
                logger.warning("GitHub %s fetch error for %s: %s", label, handle, batch)
                errors.append(f"{label}: {batch}")
            elif isinstance(batch, list):
                logger.info("GitHub %s: %d records for %s", label, len(batch), handle)

        # ── Phase 2: parallel enrichment ─────────────────────────────────────
        # One shared semaphore caps total concurrent gh API subprocess calls.
        enrich_sem = asyncio.Semaphore(_ENRICH_CONCURRENCY)
        enrich_authored, enrich_reviewed, enrich_commits = await asyncio.gather(
            self._enrich_authored_prs(authored_prs, handle, enrich_sem),
            self._enrich_reviewed_prs(reviewed_prs, handle, enrich_sem),
            self._enrich_commits(commits, enrich_sem),
            return_exceptions=True,
        )

        if isinstance(enrich_authored, list):
            authored_prs = enrich_authored
        else:
            logger.warning("authored PR enrichment failed: %s", enrich_authored)

        if isinstance(enrich_reviewed, list):
            reviewed_prs = enrich_reviewed
        else:
            logger.warning("reviewed PR enrichment failed: %s", enrich_reviewed)

        if isinstance(enrich_commits, list):
            commits = enrich_commits
        else:
            logger.warning("commit enrichment failed: %s", enrich_commits)

        records = authored_prs + reviewed_prs + commits

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

    # ── Phase 1: metadata fetch ───────────────────────────────────────────────

    async def _fetch_authored_prs(
        self, handle: str, period_start: str, period_end: str
    ) -> list[dict]:
        query = f"type:pr+author:{handle}+created:{period_start}..{period_end}"
        logger.debug("GitHub authored PRs query: %s", query)
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
        query = f"type:pr+commenter:{handle}+updated:{period_start}..{period_end}"
        logger.debug("GitHub reviewed PRs query: %s", query)
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
            if (pr.get("user") or {}).get("login", "").lower() != handle.lower()
        ]

    async def _fetch_commits(self, handle: str, period_start: str, period_end: str) -> list[dict]:
        try:
            returncode, stdout, stderr = await run_subprocess(
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
                "sha,commit,url,repository",
                timeout=self._timeout,
            )
            if returncode != 0:
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
                    # Store full SHA — needed for enrichment API calls
                    "sha": c.get("sha", ""),
                    "message": ((c.get("commit") or {}).get("message") or "")[:500],
                    "url": c.get("url", ""),
                    "committed_at": (
                        (c.get("commit") or {}).get("author", {}).get("date", "")
                        or (c.get("commit") or {}).get("committer", {}).get("date", "")
                    ),
                    "repo": (c.get("repository") or {}).get("nameWithOwner", ""),
                }
                for c in (commits if isinstance(commits, list) else [])
            ]
        except (CollectorUnavailableError, CollectorTimeoutError):
            raise
        except json.JSONDecodeError:
            return []

    # ── Phase 2: content enrichment ───────────────────────────────────────────

    async def _enrich_authored_prs(
        self, prs: list[dict], handle: str, sem: asyncio.Semaphore
    ) -> list[dict]:
        """Add reviews_received, inline_feedback_received, files_changed to authored PRs."""
        # Skip enrichment for PRs with 0 review_comments — saves 2 API calls each
        to_enrich = [
            p
            for p in prs
            if p.get("repo")
            and p.get("number")
            and (p.get("review_comments", 0) > 0 or p.get("comments", 0) > 0)
        ][:MAX_ENRICH_PRS]
        if not to_enrich:
            return prs

        logger.debug("Enriching %d authored PRs with reviews + files", len(to_enrich))

        async def _gh_api_sem(path: str) -> dict | list | str:
            async with sem:
                return await self._gh_api(path)

        async def _enrich_one(pr: dict) -> dict:
            repo, number = pr["repo"], pr["number"]
            reviews_raw, inline_raw, files_raw = await asyncio.gather(
                _gh_api_sem(f"repos/{repo}/pulls/{number}/reviews?per_page=50"),
                _gh_api_sem(f"repos/{repo}/pulls/{number}/comments?per_page=100"),
                _gh_api_sem(f"repos/{repo}/pulls/{number}/files?per_page=100"),
                return_exceptions=True,
            )

            enriched = dict(pr)

            if isinstance(reviews_raw, list):
                reviews_received = [
                    {
                        "author": (r.get("user") or {}).get("login", ""),
                        "state": r.get("state", ""),
                        "body": (r.get("body") or "").strip(),
                        "submitted_at": r.get("submitted_at", ""),
                    }
                    for r in reviews_raw
                    if (r.get("user") or {}).get("login", "").lower() != handle.lower()
                    and (r.get("body") or "").strip()
                ]
                if reviews_received:
                    enriched["reviews_received"] = reviews_received

            if isinstance(inline_raw, list):
                inline_feedback = [
                    {
                        "author": (c.get("user") or {}).get("login", ""),
                        "body": (c.get("body") or "").strip(),
                        "path": c.get("path", ""),
                        "diff_hunk": (c.get("diff_hunk") or "")[:_MAX_PATCH_CHARS],
                        "outdated": c.get("position") is None,
                        "created_at": c.get("created_at", ""),
                    }
                    for c in inline_raw
                    if (c.get("user") or {}).get("login", "").lower() != handle.lower()
                    and (c.get("body") or "").strip()
                ]
                if inline_feedback:
                    enriched["inline_feedback_received"] = inline_feedback

            if isinstance(files_raw, list):
                files_changed = _parse_files(files_raw)
                if files_changed:
                    enriched["files_changed"] = files_changed

            return enriched

        enriched_list = await asyncio.gather(
            *[_enrich_one(pr) for pr in to_enrich], return_exceptions=True
        )
        return _merge_enriched(prs, to_enrich, enriched_list, "authored PR")

    async def _enrich_reviewed_prs(
        self, prs: list[dict], handle: str, sem: asyncio.Semaphore
    ) -> list[dict]:
        """Add user's review_summaries, inline_comments, files_changed to reviewed PRs."""
        to_enrich = [p for p in prs if p.get("repo") and p.get("number")][:MAX_ENRICH_PRS]
        if not to_enrich:
            return prs

        logger.debug("Enriching %d reviewed PRs with comment content + files", len(to_enrich))

        async def _gh_api_sem(path: str) -> dict | list | str:
            async with sem:
                return await self._gh_api(path)

        async def _enrich_one(pr: dict) -> dict:
            repo, number = pr["repo"], pr["number"]
            reviews_raw, inline_raw, files_raw = await asyncio.gather(
                _gh_api_sem(f"repos/{repo}/pulls/{number}/reviews?per_page=50"),
                _gh_api_sem(f"repos/{repo}/pulls/{number}/comments?per_page=100"),
                _gh_api_sem(f"repos/{repo}/pulls/{number}/files?per_page=100"),
                return_exceptions=True,
            )

            enriched = dict(pr)

            if isinstance(reviews_raw, list):
                review_summaries = [
                    {
                        "state": r.get("state", ""),
                        "body": (r.get("body") or "").strip(),
                        "submitted_at": r.get("submitted_at", ""),
                    }
                    for r in reviews_raw
                    if (r.get("user") or {}).get("login", "").lower() == handle.lower()
                    and (r.get("body") or "").strip()
                ]
                if review_summaries:
                    enriched["review_summaries"] = review_summaries

            if isinstance(inline_raw, list):
                inline_comments = [
                    {
                        "body": (c.get("body") or "").strip(),
                        "path": c.get("path", ""),
                        "diff_hunk": (c.get("diff_hunk") or "")[:_MAX_PATCH_CHARS],
                        # position=None means the reviewed line was subsequently changed
                        # (comment is on obsolete/outdated code — strong signal of actionable feedback)
                        "outdated": c.get("position") is None,
                        "created_at": c.get("created_at", ""),
                    }
                    for c in inline_raw
                    if (c.get("user") or {}).get("login", "").lower() == handle.lower()
                    and (c.get("body") or "").strip()
                ]
                if inline_comments:
                    enriched["inline_comments"] = inline_comments

            if isinstance(files_raw, list):
                files_changed = _parse_files(files_raw)
                if files_changed:
                    enriched["files_changed"] = files_changed

            return enriched

        enriched_list = await asyncio.gather(
            *[_enrich_one(pr) for pr in to_enrich], return_exceptions=True
        )
        return _merge_enriched(prs, to_enrich, enriched_list, "reviewed PR")

    async def _enrich_commits(self, commits: list[dict], sem: asyncio.Semaphore) -> list[dict]:
        """Add files_changed (with patch excerpts) to commits that have a known repo."""
        to_enrich = [c for c in commits if c.get("repo") and c.get("sha")][:MAX_ENRICH_COMMITS]
        if not to_enrich:
            return commits

        logger.debug("Enriching %d commits with file change data", len(to_enrich))

        async def _enrich_one(commit: dict) -> dict:
            repo = commit["repo"]
            sha = commit["sha"]
            async with sem:
                data = await self._gh_api(f"repos/{repo}/commits/{sha}")
            if not isinstance(data, dict):
                return commit
            files_raw = data.get("files") or []
            files_changed = _parse_files(files_raw)
            if not files_changed:
                return commit
            return {**commit, "files_changed": files_changed}

        enriched_list = await asyncio.gather(
            *[_enrich_one(c) for c in to_enrich], return_exceptions=True
        )
        return _merge_enriched(commits, to_enrich, enriched_list, "commit")

    # ── internal API helper ───────────────────────────────────────────────────

    async def _gh_api(self, path: str) -> dict | list | str:
        """Call `gh api <path>` and return parsed JSON or an error string."""
        try:
            returncode, stdout, stderr = await run_subprocess(
                "gh", "api", path, timeout=self._timeout
            )
            if returncode != 0:
                return stderr.decode(errors="replace").strip() or f"gh api {path} failed"

            raw = stdout.decode(errors="replace").strip()
            return json.loads(raw) if raw else {}

        except CollectorTimeoutError:
            raise
        except CollectorUnavailableError:
            raise CollectorUnavailableError(
                "gh CLI not found on PATH. Install GitHub CLI: https://cli.github.com"
            ) from None
        except json.JSONDecodeError as exc:
            return f"JSON parse error: {exc}"


# ── module-level helpers ──────────────────────────────────────────────────────


def _extract_repo(repository_url: str) -> str:
    """Extract 'owner/repo' from GitHub API repository_url."""
    parts = repository_url.rstrip("/").split("/")
    if len(parts) >= 2:
        return f"{parts[-2]}/{parts[-1]}"
    return repository_url


def _parse_files(files_raw: list) -> list[dict]:  # type: ignore[type-arg]
    """Normalise a GitHub files array into a compact list for storage."""
    result = []
    for f in files_raw[:_MAX_FILES_PER_RECORD]:
        entry: dict = {  # type: ignore[type-arg]
            "filename": f.get("filename", ""),
            "status": f.get("status", ""),
            "additions": f.get("additions", 0),
            "deletions": f.get("deletions", 0),
        }
        patch = (f.get("patch") or "").strip()
        if patch:
            entry["patch"] = patch[:_MAX_PATCH_CHARS]
        result.append(entry)
    return result


def _merge_enriched(
    original: list[dict],
    enriched_subset: list[dict],
    enriched_results: list,
    label: str,
) -> list[dict]:
    """Merge enrichment results back, falling back to original on failure."""
    result: list[dict] = []
    for orig, enriched in zip(enriched_subset, enriched_results, strict=False):
        if isinstance(enriched, Exception):
            logger.warning(
                "Failed to enrich %s #%s: %s",
                label,
                orig.get("number") or orig.get("sha", "")[:8],
                enriched,
            )
            result.append(orig)
        else:
            result.append(enriched)
    result.extend(original[len(enriched_subset) :])
    return result


def _in_period(timestamp: str, start: str, end: str) -> bool:
    if not timestamp:
        return False
    return start <= timestamp[:10] <= end
