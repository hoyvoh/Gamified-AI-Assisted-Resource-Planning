"""Shared types for data collectors."""

import asyncio
import subprocess
from dataclasses import dataclass


@dataclass
class CollectionResult:
    source_type: str
    source_handle: str
    records: list[dict]  # type: ignore[type-arg]
    status: str  # "collected" | "failed" | "skipped"
    error_message: str | None = None

    @property
    def record_count(self) -> int:
        return len(self.records)


class CollectorUnavailableError(Exception):
    """Raised when the required CLI tool is not available or not authenticated."""


class CollectorTimeoutError(Exception):
    """Raised when a CLI call exceeds its timeout."""


async def run_subprocess(*args: str, timeout: float) -> tuple[int, bytes, bytes]:
    """Run a subprocess via asyncio.to_thread — works on any event loop (incl. SelectorEventLoop).

    Raises CollectorTimeoutError if the process exceeds timeout.
    Raises CollectorUnavailableError if the executable is not found on PATH.
    """

    def _run() -> tuple[int, bytes, bytes]:
        try:
            r = subprocess.run(list(args), capture_output=True, timeout=timeout)
            return r.returncode, r.stdout, r.stderr
        except subprocess.TimeoutExpired as exc:
            raise CollectorTimeoutError(f"`{args[0]}` timed out after {timeout}s") from exc
        except FileNotFoundError as exc:
            raise CollectorUnavailableError(f"`{args[0]}` not found on PATH") from exc

    return await asyncio.to_thread(_run)
