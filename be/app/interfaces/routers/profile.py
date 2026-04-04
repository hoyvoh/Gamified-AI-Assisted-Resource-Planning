"""Profile tab read endpoints (M7)."""

from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse

from app.application.analysis.profile_use_cases import (
    GetCaseDetailUseCase,
    GetDimensionDetailUseCase,
    GetEvidenceTraceUseCase,
    GetMemberMilestonesUseCase,
    GetProfileCasesUseCase,
    GetProfileCompetencyUseCase,
    GetProfileJourneyUseCase,
    GetProfileKptUseCase,
    GetProfileOverviewUseCase,
)
from app.dependencies import (
    get_case_detail_use_case,
    get_dimension_detail_use_case,
    get_evidence_trace_use_case,
    get_member_milestones_use_case,
    get_profile_cases_use_case,
    get_profile_competency_use_case,
    get_profile_journey_use_case,
    get_profile_kpt_use_case,
    get_profile_overview_use_case,
)
from app.domain.analysis.entities import (
    BehavioralEvent,
    CaseFeedback,
    DimensionScore,
    EvidenceUnit,
    KptItem,
    Milestone,
)
from app.domain.shared.exceptions import NotFoundError
from app.interfaces.schemas.base import DataEnvelope
from app.interfaces.schemas.profile import (
    BehavioralEventSchema,
    CaseFeedbackSchema,
    CategoryScoreSchema,
    DimensionDetailResponse,
    DimensionScoreDetailSchema,
    DimensionScoreSchema,
    EvidenceUnitSchema,
    KptItemSchema,
    MilestoneSchema,
    MilestonesResponse,
    ProfileCasesResponse,
    ProfileCompetencyResponse,
    ProfileJourneyResponse,
    ProfileKptResponse,
    ProfileOverviewResponse,
)

router = APIRouter(prefix="/api/v1", tags=["profile"])


# ── B7.1 — Overview ──────────────────────────────────────────────────────────


@router.get("/members/{member_id}/profile/overview")
async def get_profile_overview(
    member_id: str,
    use_case: GetProfileOverviewUseCase = Depends(get_profile_overview_use_case),
) -> DataEnvelope[ProfileOverviewResponse]:
    try:
        payload = await use_case.execute(member_id)
    except NotFoundError as exc:
        return JSONResponse(status_code=404, content={"detail": str(exc)})  # type: ignore[return-value]

    return DataEnvelope[ProfileOverviewResponse](
        data=ProfileOverviewResponse(
            run_id=payload.run.analysis_run_id,
            member_id=payload.run.member_id,
            period_start=payload.run.period_start,
            period_end=payload.run.period_end,
            scoring_version=payload.run.scoring_version,
            p8_approved=payload.snapshot.p8_approved,
            overall_confidence=payload.snapshot.overall_confidence,
            profile_summary=payload.snapshot.profile_summary,
            growth_journey_summary=payload.snapshot.growth_journey_summary,
            current_growth_path=payload.snapshot.current_growth_path,
            top_strength_dimension_ids=payload.snapshot.top_strength_dimension_ids,
            top_growth_dimension_ids=payload.snapshot.top_growth_dimension_ids,
            insufficient_dimensions=payload.snapshot.insufficient_dimensions,
            fairness_notes=payload.snapshot.fairness_notes,
            category_scores=[
                CategoryScoreSchema(
                    category_score_id=cs.category_score_id,
                    category_id=cs.category_id,
                    score=cs.score,
                    confidence_score=cs.confidence_score,
                    confidence_label=cs.confidence_label,
                    included_dimensions=cs.included_dimensions,
                    excluded_dimensions=cs.excluded_dimensions,
                    explanation_summary=cs.explanation_summary,
                )
                for cs in payload.category_scores
            ],
        )
    )


# ── B7.2 — Competency list ───────────────────────────────────────────────────


@router.get("/members/{member_id}/profile/competency")
async def get_profile_competency(
    member_id: str,
    category: str | None = Query(default=None),
    maturity: str | None = Query(default=None),
    use_case: GetProfileCompetencyUseCase = Depends(get_profile_competency_use_case),
) -> DataEnvelope[ProfileCompetencyResponse]:
    try:
        payload = await use_case.execute(member_id, category=category, maturity=maturity)
    except NotFoundError as exc:
        return JSONResponse(status_code=404, content={"detail": str(exc)})  # type: ignore[return-value]

    return DataEnvelope[ProfileCompetencyResponse](
        data=ProfileCompetencyResponse(
            run_id=payload.run.analysis_run_id,
            dimension_scores=[_dim_score_schema(ds) for ds in payload.dimension_scores],
            category_scores=[
                CategoryScoreSchema(
                    category_score_id=cs.category_score_id,
                    category_id=cs.category_id,
                    score=cs.score,
                    confidence_score=cs.confidence_score,
                    confidence_label=cs.confidence_label,
                    included_dimensions=cs.included_dimensions,
                    excluded_dimensions=cs.excluded_dimensions,
                    explanation_summary=cs.explanation_summary,
                )
                for cs in payload.category_scores
            ],
        )
    )


# ── B7.3 — Dimension detail ──────────────────────────────────────────────────


@router.get("/members/{member_id}/profile/competency/{dimension_id}")
async def get_dimension_detail(
    member_id: str,
    dimension_id: str,
    use_case: GetDimensionDetailUseCase = Depends(get_dimension_detail_use_case),
) -> DataEnvelope[DimensionDetailResponse]:
    try:
        payload = await use_case.execute(member_id, dimension_id)
    except NotFoundError as exc:
        return JSONResponse(status_code=404, content={"detail": str(exc)})  # type: ignore[return-value]

    ds = payload.dimension_score
    return DataEnvelope[DimensionDetailResponse](
        data=DimensionDetailResponse(
            dimension_score=DimensionScoreDetailSchema(
                score_id=ds.score_id,
                dimension_id=ds.dimension_id,
                raw_score=ds.raw_score,
                normalized_score=ds.normalized_score,
                maturity_level=ds.maturity_level,
                confidence_score=ds.confidence_score,
                confidence_label=ds.confidence_label,
                opportunity_score=ds.opportunity_score,
                opportunity_label=ds.opportunity_label,
                delta_value=ds.delta_value,
                delta_label=ds.delta_label,
                total_signals=ds.total_signals,
                positive_signals=ds.positive_signals,
                negative_signals=ds.negative_signals,
                mixed_signals=ds.mixed_signals,
                explanation_summary=ds.explanation_summary,
                limitation_notes=ds.limitation_notes,
                top_supporting_evidence_ids=ds.top_supporting_evidence_ids,
                top_counter_evidence_ids=ds.top_counter_evidence_ids,
                ui_summary=ds.ui_summary,
                p3_inference=ds.p3_inference,
            ),
            supporting_evidence=[_evidence_schema(ev) for ev in payload.supporting_evidence],
            counter_evidence=[_evidence_schema(ev) for ev in payload.counter_evidence],
            behavioral_events=[_event_schema(ev) for ev in payload.behavioral_events],
        )
    )


# ── B7.4 — KPT ───────────────────────────────────────────────────────────────


@router.get("/members/{member_id}/profile/kpt")
async def get_profile_kpt(
    member_id: str,
    use_case: GetProfileKptUseCase = Depends(get_profile_kpt_use_case),
) -> DataEnvelope[ProfileKptResponse]:
    try:
        payload = await use_case.execute(member_id)
    except NotFoundError as exc:
        return JSONResponse(status_code=404, content={"detail": str(exc)})  # type: ignore[return-value]

    return DataEnvelope[ProfileKptResponse](
        data=ProfileKptResponse(
            run_id=payload.run.analysis_run_id,
            keep_items=[_kpt_schema(i) for i in payload.keep_items],
            problem_items=[_kpt_schema(i) for i in payload.problem_items],
            try_items=[_kpt_schema(i) for i in payload.try_items],
        )
    )


# ── B7.5 — Cases list ────────────────────────────────────────────────────────


@router.get("/members/{member_id}/profile/cases")
async def get_profile_cases(
    member_id: str,
    use_case: GetProfileCasesUseCase = Depends(get_profile_cases_use_case),
) -> DataEnvelope[ProfileCasesResponse]:
    try:
        payload = await use_case.execute(member_id)
    except NotFoundError as exc:
        return JSONResponse(status_code=404, content={"detail": str(exc)})  # type: ignore[return-value]

    return DataEnvelope[ProfileCasesResponse](
        data=ProfileCasesResponse(
            run_id=payload.run.analysis_run_id,
            cases=[_case_schema(c) for c in payload.cases],
        )
    )


# ── B7.6 — Case detail ───────────────────────────────────────────────────────


@router.get("/members/{member_id}/profile/cases/{case_id}")
async def get_case_detail(
    member_id: str,
    case_id: str,
    use_case: GetCaseDetailUseCase = Depends(get_case_detail_use_case),
) -> DataEnvelope[CaseFeedbackSchema]:
    try:
        case = await use_case.execute(case_id)
    except NotFoundError as exc:
        return JSONResponse(status_code=404, content={"detail": str(exc)})  # type: ignore[return-value]

    return DataEnvelope[CaseFeedbackSchema](data=_case_schema(case))


# ── B7.7 — Journey ───────────────────────────────────────────────────────────


@router.get("/members/{member_id}/profile/journey")
async def get_profile_journey(
    member_id: str,
    use_case: GetProfileJourneyUseCase = Depends(get_profile_journey_use_case),
) -> DataEnvelope[ProfileJourneyResponse]:
    try:
        payload = await use_case.execute(member_id)
    except NotFoundError as exc:
        return JSONResponse(status_code=404, content={"detail": str(exc)})  # type: ignore[return-value]

    return DataEnvelope[ProfileJourneyResponse](
        data=ProfileJourneyResponse(
            run_id=payload.run.analysis_run_id,
            growth_journey_summary=payload.growth_journey_summary,
            current_growth_path=payload.current_growth_path,
            milestones=[_milestone_schema(m) for m in payload.milestones],
        )
    )


# ── B7.8 — Evidence trace ────────────────────────────────────────────────────


@router.get("/evidence/{evidence_id}")
async def get_evidence_trace(
    evidence_id: str,
    use_case: GetEvidenceTraceUseCase = Depends(get_evidence_trace_use_case),
) -> DataEnvelope[EvidenceUnitSchema]:
    try:
        ev = await use_case.execute(evidence_id)
    except NotFoundError as exc:
        return JSONResponse(status_code=404, content={"detail": str(exc)})  # type: ignore[return-value]

    return DataEnvelope[EvidenceUnitSchema](data=_evidence_schema(ev))


# ── B7.9 — Member milestones ─────────────────────────────────────────────────


@router.get("/members/{member_id}/milestones")
async def get_member_milestones(
    member_id: str,
    use_case: GetMemberMilestonesUseCase = Depends(get_member_milestones_use_case),
) -> DataEnvelope[MilestonesResponse]:
    try:
        milestones = await use_case.execute(member_id)
    except NotFoundError as exc:
        return JSONResponse(status_code=404, content={"detail": str(exc)})  # type: ignore[return-value]

    return DataEnvelope[MilestonesResponse](
        data=MilestonesResponse(milestones=[_milestone_schema(m) for m in milestones])
    )


# ── Serialization helpers ─────────────────────────────────────────────────────


def _dim_score_schema(ds: DimensionScore) -> DimensionScoreSchema:
    return DimensionScoreSchema(
        score_id=ds.score_id,
        dimension_id=ds.dimension_id,
        raw_score=ds.raw_score,
        normalized_score=ds.normalized_score,
        maturity_level=ds.maturity_level,
        confidence_score=ds.confidence_score,
        confidence_label=ds.confidence_label,
        opportunity_score=ds.opportunity_score,
        opportunity_label=ds.opportunity_label,
        delta_value=ds.delta_value,
        delta_label=ds.delta_label,
        total_signals=ds.total_signals,
        positive_signals=ds.positive_signals,
        negative_signals=ds.negative_signals,
        mixed_signals=ds.mixed_signals,
        explanation_summary=ds.explanation_summary,
        limitation_notes=ds.limitation_notes,
        top_supporting_evidence_ids=ds.top_supporting_evidence_ids,
        top_counter_evidence_ids=ds.top_counter_evidence_ids,
        ui_summary=ds.ui_summary,
    )


def _evidence_schema(ev: EvidenceUnit) -> EvidenceUnitSchema:
    return EvidenceUnitSchema(
        evidence_id=ev.evidence_id,
        analysis_run_id=ev.analysis_run_id,
        member_id=ev.member_id,
        timestamp=ev.timestamp,
        source_type=ev.source_type,
        record_id=ev.record_id,
        content_excerpt=ev.content_excerpt,
        content_summary=ev.content_summary,
        extraction_confidence=ev.extraction_confidence,
        ambiguity_notes=ev.ambiguity_notes,
        created_at=ev.created_at,
    )


def _event_schema(ev: BehavioralEvent) -> BehavioralEventSchema:
    return BehavioralEventSchema(
        event_id=ev.event_id,
        timestamp=ev.timestamp,
        event_type=ev.event_type,
        event_summary=ev.event_summary,
        polarity=ev.polarity,
        severity=ev.severity,
        event_confidence=ev.event_confidence,
        impact_level=ev.impact_level,
        opportunity_level=ev.opportunity_level,
        related_dimensions=ev.related_dimensions,
        why_it_matters=ev.why_it_matters,
    )


def _kpt_schema(item: KptItem) -> KptItemSchema:
    return KptItemSchema(
        kpt_id=item.kpt_id,
        item_type=item.item_type,
        title=item.title,
        summary=item.summary,
        linked_dimension_ids=item.linked_dimension_ids,
        linked_problem_ids=item.linked_problem_ids,
        display_order=item.display_order,
    )


def _case_schema(case: CaseFeedback) -> CaseFeedbackSchema:
    return CaseFeedbackSchema(
        case_id=case.case_id,
        analysis_run_id=case.analysis_run_id,
        title=case.title,
        category=case.category,
        impact_level=case.impact_level,
        summary=case.summary,
        why_it_matters=case.why_it_matters,
        observed_pattern=case.observed_pattern,
        better_alternative=case.better_alternative,
        next_time_guidance=case.next_time_guidance,
        linked_dimension_ids=case.linked_dimension_ids,
        supporting_event_ids=case.supporting_event_ids,
        confidence_score=case.confidence_score,
        display_order=case.display_order,
    )


def _milestone_schema(m: Milestone) -> MilestoneSchema:
    return MilestoneSchema(
        milestone_id=m.milestone_id,
        member_id=m.member_id,
        source_analysis_run_id=m.source_analysis_run_id,
        timestamp=m.timestamp,
        milestone_type=m.milestone_type,
        title=m.title,
        summary=m.summary,
        impact_score=m.impact_score,
        supporting_event_ids=m.supporting_event_ids,
        created_at=m.created_at,
    )
