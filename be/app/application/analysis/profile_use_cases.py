"""Profile tab use cases — read-only, all resolved from latest completed run."""

from dataclasses import dataclass

from app.domain.analysis.entities import (
    AnalysisRun,
    AnalysisSnapshot,
    BehavioralEvent,
    CaseFeedback,
    CategoryScore,
    DimensionScore,
    EvidenceUnit,
    KptItem,
    Milestone,
)
from app.domain.analysis.taxonomy import CATEGORIES
from app.domain.org.repositories import IMemberRepository
from app.domain.shared.exceptions import NotFoundError
from app.infrastructure.db.repositories.analysis import (
    SqlAnalysisRunRepository,
    SqlAnalysisSnapshotRepository,
    SqlBehavioralEventRepository,
    SqlCaseFeedbackRepository,
    SqlCategoryScoreRepository,
    SqlDimensionScoreRepository,
    SqlEvidenceUnitRepository,
    SqlKptItemRepository,
    SqlMilestoneRepository,
)

# ── helpers ───────────────────────────────────────────────────────────────────


async def _require_member_and_run(
    member_id: str,
    member_repo: IMemberRepository,
    run_repo: SqlAnalysisRunRepository,
) -> AnalysisRun:
    """Raise NotFoundError if member or latest completed run doesn't exist."""
    member = await member_repo.get_by_id(member_id)
    if member is None:
        raise NotFoundError("Member", member_id)
    run = await run_repo.get_latest_completed_for_member(member_id)
    if run is None:
        raise NotFoundError("CompletedAnalysisRun", member_id)
    return run


# ── B7.1 ─────────────────────────────────────────────────────────────────────


@dataclass
class OverviewPayload:
    run: AnalysisRun
    snapshot: AnalysisSnapshot
    category_scores: list[CategoryScore]


class GetProfileOverviewUseCase:
    def __init__(
        self,
        member_repo: IMemberRepository,
        run_repo: SqlAnalysisRunRepository,
        snapshot_repo: SqlAnalysisSnapshotRepository,
        cat_score_repo: SqlCategoryScoreRepository,
    ) -> None:
        self._members = member_repo
        self._runs = run_repo
        self._snapshots = snapshot_repo
        self._cat_scores = cat_score_repo

    async def execute(self, member_id: str) -> OverviewPayload:
        run = await _require_member_and_run(member_id, self._members, self._runs)
        snapshot = await self._snapshots.get_by_run(run.analysis_run_id)
        if snapshot is None:
            raise NotFoundError("AnalysisSnapshot", run.analysis_run_id)
        cat_scores = await self._cat_scores.list_by_run(run.analysis_run_id)
        return OverviewPayload(run=run, snapshot=snapshot, category_scores=cat_scores)


# ── B7.2 ─────────────────────────────────────────────────────────────────────


@dataclass
class CompetencyPayload:
    run: AnalysisRun
    dimension_scores: list[DimensionScore]
    category_scores: list[CategoryScore]


class GetProfileCompetencyUseCase:
    def __init__(
        self,
        member_repo: IMemberRepository,
        run_repo: SqlAnalysisRunRepository,
        dim_score_repo: SqlDimensionScoreRepository,
        cat_score_repo: SqlCategoryScoreRepository,
    ) -> None:
        self._members = member_repo
        self._runs = run_repo
        self._dim_scores = dim_score_repo
        self._cat_scores = cat_score_repo

    async def execute(
        self,
        member_id: str,
        category: str | None = None,
        maturity: str | None = None,
    ) -> CompetencyPayload:
        run = await _require_member_and_run(member_id, self._members, self._runs)
        dim_scores = await self._dim_scores.list_by_run(run.analysis_run_id)
        cat_scores = await self._cat_scores.list_by_run(run.analysis_run_id)

        if category is not None:
            allowed = frozenset(CATEGORIES.get(category, []))
            dim_scores = [ds for ds in dim_scores if ds.dimension_id in allowed]

        if maturity is not None:
            dim_scores = [ds for ds in dim_scores if ds.maturity_level == maturity]

        return CompetencyPayload(run=run, dimension_scores=dim_scores, category_scores=cat_scores)


# ── B7.3 ─────────────────────────────────────────────────────────────────────


@dataclass
class DimensionDetailPayload:
    dimension_score: DimensionScore
    supporting_evidence: list[EvidenceUnit]
    counter_evidence: list[EvidenceUnit]
    behavioral_events: list[BehavioralEvent]


class GetDimensionDetailUseCase:
    def __init__(
        self,
        member_repo: IMemberRepository,
        run_repo: SqlAnalysisRunRepository,
        dim_score_repo: SqlDimensionScoreRepository,
        evidence_repo: SqlEvidenceUnitRepository,
        event_repo: SqlBehavioralEventRepository,
    ) -> None:
        self._members = member_repo
        self._runs = run_repo
        self._dim_scores = dim_score_repo
        self._evidence = evidence_repo
        self._events = event_repo

    async def execute(self, member_id: str, dimension_id: str) -> DimensionDetailPayload:
        run = await _require_member_and_run(member_id, self._members, self._runs)
        dim_score = await self._dim_scores.get_by_run_and_dimension(
            run.analysis_run_id, dimension_id
        )
        if dim_score is None:
            raise NotFoundError("DimensionScore", dimension_id)

        supporting = await self._evidence.list_by_ids(dim_score.top_supporting_evidence_ids)
        counter = await self._evidence.list_by_ids(dim_score.top_counter_evidence_ids)

        all_events = await self._events.list_by_run(run.analysis_run_id)
        dim_events = [
            ev
            for ev in all_events
            if any(
                isinstance(rd, dict) and rd.get("dimension_id") == dimension_id
                for rd in ev.related_dimensions
            )
        ]

        return DimensionDetailPayload(
            dimension_score=dim_score,
            supporting_evidence=supporting,
            counter_evidence=counter,
            behavioral_events=dim_events,
        )


# ── B7.4 ─────────────────────────────────────────────────────────────────────


@dataclass
class KptPayload:
    run: AnalysisRun
    keep_items: list[KptItem]
    problem_items: list[KptItem]
    try_items: list[KptItem]


class GetProfileKptUseCase:
    def __init__(
        self,
        member_repo: IMemberRepository,
        run_repo: SqlAnalysisRunRepository,
        kpt_repo: SqlKptItemRepository,
    ) -> None:
        self._members = member_repo
        self._runs = run_repo
        self._kpt = kpt_repo

    async def execute(self, member_id: str) -> KptPayload:
        run = await _require_member_and_run(member_id, self._members, self._runs)
        items = await self._kpt.list_by_run(run.analysis_run_id)
        return KptPayload(
            run=run,
            keep_items=[i for i in items if i.item_type == "keep"],
            problem_items=[i for i in items if i.item_type == "problem"],
            try_items=[i for i in items if i.item_type == "try"],
        )


# ── B7.5 ─────────────────────────────────────────────────────────────────────


@dataclass
class CasesPayload:
    run: AnalysisRun
    cases: list[CaseFeedback]


class GetProfileCasesUseCase:
    def __init__(
        self,
        member_repo: IMemberRepository,
        run_repo: SqlAnalysisRunRepository,
        case_repo: SqlCaseFeedbackRepository,
    ) -> None:
        self._members = member_repo
        self._runs = run_repo
        self._cases = case_repo

    async def execute(self, member_id: str) -> CasesPayload:
        run = await _require_member_and_run(member_id, self._members, self._runs)
        cases = await self._cases.list_by_run(run.analysis_run_id)
        return CasesPayload(run=run, cases=cases)


# ── B7.6 ─────────────────────────────────────────────────────────────────────


class GetCaseDetailUseCase:
    def __init__(self, case_repo: SqlCaseFeedbackRepository) -> None:
        self._cases = case_repo

    async def execute(self, case_id: str) -> CaseFeedback:
        case = await self._cases.get_by_id(case_id)
        if case is None:
            raise NotFoundError("CaseFeedback", case_id)
        return case


# ── B7.7 ─────────────────────────────────────────────────────────────────────


@dataclass
class JourneyPayload:
    run: AnalysisRun
    growth_journey_summary: str | None
    current_growth_path: str | None
    milestones: list[Milestone]


class GetProfileJourneyUseCase:
    def __init__(
        self,
        member_repo: IMemberRepository,
        run_repo: SqlAnalysisRunRepository,
        snapshot_repo: SqlAnalysisSnapshotRepository,
        milestone_repo: SqlMilestoneRepository,
    ) -> None:
        self._members = member_repo
        self._runs = run_repo
        self._snapshots = snapshot_repo
        self._milestones = milestone_repo

    async def execute(self, member_id: str) -> JourneyPayload:
        run = await _require_member_and_run(member_id, self._members, self._runs)
        snapshot = await self._snapshots.get_by_run(run.analysis_run_id)
        milestones = await self._milestones.list_by_member(member_id)
        return JourneyPayload(
            run=run,
            growth_journey_summary=snapshot.growth_journey_summary if snapshot else None,
            current_growth_path=snapshot.current_growth_path if snapshot else None,
            milestones=milestones,
        )


# ── B7.8 ─────────────────────────────────────────────────────────────────────


class GetEvidenceTraceUseCase:
    def __init__(self, evidence_repo: SqlEvidenceUnitRepository) -> None:
        self._evidence = evidence_repo

    async def execute(self, evidence_id: str) -> EvidenceUnit:
        ev = await self._evidence.get_by_id(evidence_id)
        if ev is None:
            raise NotFoundError("EvidenceUnit", evidence_id)
        return ev


# ── B7.9 ─────────────────────────────────────────────────────────────────────


class GetMemberMilestonesUseCase:
    def __init__(
        self,
        member_repo: IMemberRepository,
        milestone_repo: SqlMilestoneRepository,
    ) -> None:
        self._members = member_repo
        self._milestones = milestone_repo

    async def execute(self, member_id: str) -> list[Milestone]:
        member = await self._members.get_by_id(member_id)
        if member is None:
            raise NotFoundError("Member", member_id)
        return await self._milestones.list_by_member(member_id)
