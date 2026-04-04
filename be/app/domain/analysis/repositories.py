from typing import Protocol

from app.domain.analysis.entities import (
    AnalysisRun,
    BehavioralEvent,
    CategoryScore,
    DimensionScore,
    DimensionSignal,
    EvidenceUnit,
    PersonalBaseline,
    SourcePayload,
)


class IAnalysisRunRepository(Protocol):
    async def create(self, run: AnalysisRun) -> None: ...

    async def get_by_id(self, run_id: str) -> AnalysisRun | None: ...

    async def get_latest_for_member(self, member_id: str) -> AnalysisRun | None:
        """Return the most recent run (any status) for this member."""
        ...

    async def get_active_for_member(self, member_id: str) -> AnalysisRun | None:
        """Return the currently active (pending/collecting/analyzing) run, if any."""
        ...

    async def list_by_member(
        self, member_id: str, limit: int, offset: int
    ) -> list[AnalysisRun]: ...

    async def update(self, run: AnalysisRun) -> None: ...


class ISourcePayloadRepository(Protocol):
    async def create(self, payload: SourcePayload) -> None: ...

    async def list_by_run(self, run_id: str) -> list[SourcePayload]: ...


class IEvidenceUnitRepository(Protocol):
    async def bulk_create(self, units: list[EvidenceUnit]) -> None: ...

    async def list_by_run(self, run_id: str) -> list[EvidenceUnit]: ...


class IBehavioralEventRepository(Protocol):
    async def bulk_create(self, events: list[BehavioralEvent]) -> None: ...

    async def list_by_run(self, run_id: str) -> list[BehavioralEvent]: ...


class IDimensionSignalRepository(Protocol):
    async def bulk_create(self, signals: list[DimensionSignal]) -> None: ...

    async def list_by_run(self, run_id: str) -> list[DimensionSignal]: ...

    async def list_by_run_and_dimension(
        self, run_id: str, dimension_id: str
    ) -> list[DimensionSignal]: ...


class IDimensionScoreRepository(Protocol):
    async def bulk_create(self, scores: list[DimensionScore]) -> None: ...

    async def list_by_run(self, run_id: str) -> list[DimensionScore]: ...

    async def get_by_run_and_dimension(
        self, run_id: str, dimension_id: str
    ) -> DimensionScore | None: ...


class ICategoryScoreRepository(Protocol):
    async def bulk_create(self, scores: list[CategoryScore]) -> None: ...

    async def list_by_run(self, run_id: str) -> list[CategoryScore]: ...


class IPersonalBaselineRepository(Protocol):
    async def get_by_member(self, member_id: str) -> PersonalBaseline | None: ...

    async def upsert(self, baseline: PersonalBaseline) -> None: ...
