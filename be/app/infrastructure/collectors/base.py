"""Shared types for data collectors."""

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
