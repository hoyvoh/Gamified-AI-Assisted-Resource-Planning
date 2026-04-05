import uuid
from datetime import date, timedelta

from app.config import AnalysisSettings
from app.domain.analysis.entities import (
    VALID_VERDICTS,
    AnalysisRun,
    PersonalBaseline,
    ValidationFlag,
)
from app.domain.analysis.repositories import IAnalysisRunRepository, IPersonalBaselineRepository
from app.domain.org.repositories import IMemberRepository
from app.domain.shared.exceptions import ConflictError, NotFoundError, ValidationError
from app.infrastructure.db.base import utcnow
from app.infrastructure.db.repositories.analysis import (
    SqlAnalysisSnapshotRepository,
    SqlValidationFlagRepository,
)


class TriggerAnalysisUseCase:
    def __init__(
        self,
        member_repo: IMemberRepository,
        run_repo: IAnalysisRunRepository,
        settings: AnalysisSettings,
    ) -> None:
        self._members = member_repo
        self._runs = run_repo
        self._settings = settings

    async def execute(
        self,
        member_id: str,
        period_start: str,
        period_end: str,
        run_type: str = "fresh",
    ) -> AnalysisRun:
        # Verify member exists
        member = await self._members.get_by_id(member_id)
        if member is None:
            raise NotFoundError("Member", member_id)

        # Validate period length
        start = date.fromisoformat(period_start)
        end = date.fromisoformat(period_end)
        if end <= start:
            raise ValidationError("period_end must be after period_start")
        if (end - start) > timedelta(days=self._settings.max_period_days):
            raise ValidationError(
                f"Analysis period must not exceed {self._settings.max_period_days} days"
            )

        # Check for active run conflict
        active = await self._runs.get_active_for_member(member_id)
        if active is not None:
            raise ConflictError(
                f"Member already has an active analysis run ({active.analysis_run_id})"
            )

        now = utcnow()
        run = AnalysisRun(
            analysis_run_id=str(uuid.uuid4()),
            member_id=member_id,
            period_start=period_start,
            period_end=period_end,
            run_type=run_type,
            status="pending",
            progress_stage=None,
            progress_pct=0,
            error_message=None,
            scoring_version=None,
            created_at=now,
            updated_at=now,
            completed_at=None,
        )
        await self._runs.create(run)
        return run


class GetAnalysisRunUseCase:
    def __init__(self, run_repo: IAnalysisRunRepository) -> None:
        self._runs = run_repo

    async def execute(self, run_id: str) -> AnalysisRun:
        run = await self._runs.get_by_id(run_id)
        if run is None:
            raise NotFoundError("AnalysisRun", run_id)
        return run


class ListMemberAnalysisRunsUseCase:
    _DEFAULT_LIMIT: int = 10
    _MAX_LIMIT: int = 50

    def __init__(
        self,
        member_repo: IMemberRepository,
        run_repo: IAnalysisRunRepository,
    ) -> None:
        self._members = member_repo
        self._runs = run_repo

    async def execute(
        self, member_id: str, limit: int = _DEFAULT_LIMIT, offset: int = 0
    ) -> list[AnalysisRun]:
        member = await self._members.get_by_id(member_id)
        if member is None:
            raise NotFoundError("Member", member_id)
        effective_limit = min(max(1, limit), self._MAX_LIMIT)
        return await self._runs.list_by_member(member_id, effective_limit, offset)


class RefreshAnalysisUseCase:
    """Same-period refresh shortcut — delegates to TriggerAnalysisUseCase."""

    def __init__(
        self,
        member_repo: IMemberRepository,
        run_repo: IAnalysisRunRepository,
        settings: AnalysisSettings,
    ) -> None:
        self._trigger = TriggerAnalysisUseCase(member_repo, run_repo, settings)

    async def execute(
        self,
        member_id: str,
        period_start: str,
        period_end: str,
    ) -> AnalysisRun:
        return await self._trigger.execute(
            member_id=member_id,
            period_start=period_start,
            period_end=period_end,
            run_type="refresh_same_period",
        )


class UpsertValidationFlagUseCase:
    """Create or update a validation flag for a dimension within an analysis run.

    Also syncs analysis_snapshots.flagged_items_count after upsert.
    """

    def __init__(
        self,
        run_repo: IAnalysisRunRepository,
        flag_repo: SqlValidationFlagRepository,
        snapshot_repo: SqlAnalysisSnapshotRepository,
    ) -> None:
        self._runs = run_repo
        self._flags = flag_repo
        self._snapshots = snapshot_repo

    async def execute(
        self,
        analysis_run_id: str,
        dimension_id: str,
        verdict: str,
        note: str | None,
    ) -> ValidationFlag:
        if verdict not in VALID_VERDICTS:
            raise ValidationError(f"verdict must be one of: {', '.join(sorted(VALID_VERDICTS))}")

        run = await self._runs.get_by_id(analysis_run_id)
        if run is None:
            raise NotFoundError("AnalysisRun", analysis_run_id)

        now = utcnow()
        flag = ValidationFlag(
            flag_id=str(uuid.uuid4()),
            analysis_run_id=analysis_run_id,
            dimension_id=dimension_id,
            verdict=verdict,
            note=note,
            flagged_at=now,
        )
        await self._flags.upsert(flag)

        # Sync flagged_items_count in snapshot
        count = await self._flags.count_by_run(analysis_run_id)
        snapshot = await self._snapshots.get_by_run(analysis_run_id)
        if snapshot is not None:
            snapshot.flagged_items_count = count
            await self._snapshots.upsert(snapshot)

        return flag


class ListRunValidationFlagsUseCase:
    def __init__(
        self,
        run_repo: IAnalysisRunRepository,
        flag_repo: SqlValidationFlagRepository,
    ) -> None:
        self._runs = run_repo
        self._flags = flag_repo

    async def execute(self, run_id: str) -> list[ValidationFlag]:
        run = await self._runs.get_by_id(run_id)
        if run is None:
            raise NotFoundError("AnalysisRun", run_id)
        return await self._flags.list_by_run(run_id)


class UpsertBaselineUseCase:
    """Create or update a personal baseline for a member."""

    def __init__(
        self,
        member_repo: IMemberRepository,
        baseline_repo: IPersonalBaselineRepository,
    ) -> None:
        self._members = member_repo
        self._baselines = baseline_repo

    async def execute(
        self,
        member_id: str,
        baseline_dimensions: dict,  # type: ignore[type-arg]
    ) -> PersonalBaseline:
        member = await self._members.get_by_id(member_id)
        if member is None:
            raise NotFoundError("Member", member_id)

        existing = await self._baselines.get_by_member(member_id)
        now = utcnow()

        if existing:
            existing.baseline_dimensions = baseline_dimensions
            existing.updated_at = now
            await self._baselines.upsert(existing)
            return existing

        baseline = PersonalBaseline(
            baseline_id=str(uuid.uuid4()),
            member_id=member_id,
            baseline_dimensions=baseline_dimensions,
            created_at=now,
            updated_at=now,
        )
        await self._baselines.upsert(baseline)
        return baseline
