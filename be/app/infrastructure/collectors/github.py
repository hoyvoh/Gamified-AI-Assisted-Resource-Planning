"""GitHub data collector — uses the `gh` CLI (no direct API tokens)."""

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
        """Return True if `gh auth status` succeeds (authenticated)."""
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
        """Collect GitHub events and repos for a user handle within the period."""
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

        records: list[dict] = []  # type: ignore[type-arg]
        errors: list[str] = []

        # Collect public events
        events = await self._gh_api(f"/users/{handle}/events", paginate=True)
        if isinstance(events, list):
            filtered = [
                e for e in events if _in_period(e.get("created_at", ""), period_start, period_end)
            ]
            records.extend({"source": "github_events", "data": e} for e in filtered)
        elif isinstance(events, str):
            errors.append(f"events: {events}")
            logger.warning("GitHub events collection error for %s: %s", handle, events)

        # Collect repos (for language/contribution context)
        repos = await self._gh_api(f"/users/{handle}/repos", paginate=False)
        if isinstance(repos, list):
            records.extend({"source": "github_repos", "data": r} for r in repos)
        elif isinstance(repos, str):
            errors.append(f"repos: {repos}")
            logger.warning("GitHub repos collection error for %s: %s", handle, repos)

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
            status="collected",
            error_message=("; ".join(errors) if errors else None),
        )

    async def _gh_api(self, path: str, paginate: bool = False) -> list[dict] | str:  # type: ignore[type-arg]
        """Call `gh api <path>` and return parsed JSON or an error string."""
        cmd = ["gh", "api", path]
        if paginate:
            cmd.append("--paginate")
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
            # gh --paginate emits one JSON array per page; wrap into single list
            if paginate and raw:
                combined: list[dict] = []  # type: ignore[type-arg]
                for line in raw.splitlines():
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        chunk = json.loads(line)
                        if isinstance(chunk, list):
                            combined.extend(chunk)
                        elif isinstance(chunk, dict):
                            combined.append(chunk)
                    except json.JSONDecodeError:
                        pass
                return combined

            return json.loads(raw) if raw else []

        except CollectorTimeoutError:
            raise
        except FileNotFoundError:
            raise CollectorUnavailableError(
                "gh CLI not found on PATH. Install GitHub CLI: https://cli.github.com"
            ) from None
        except json.JSONDecodeError as exc:
            return f"JSON parse error: {exc}"


def _in_period(timestamp: str, start: str, end: str) -> bool:
    """Return True if ISO timestamp falls within [start, end] (date comparison)."""
    if not timestamp:
        return False
    date_part = timestamp[:10]  # YYYY-MM-DD
    return start <= date_part <= end
