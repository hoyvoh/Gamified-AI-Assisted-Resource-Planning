"""Response schemas for profile tab endpoints (M7)."""

from app.interfaces.schemas.base import BaseResponse

# ── Shared leaf schemas ───────────────────────────────────────────────────────


class CategoryScoreSchema(BaseResponse):
    category_score_id: str
    category_id: str
    score: float | None
    confidence_score: float
    confidence_label: str
    included_dimensions: list[str]
    excluded_dimensions: list[str]
    explanation_summary: str | None


class DimensionScoreSchema(BaseResponse):
    score_id: str
    dimension_id: str
    raw_score: float | None
    normalized_score: float | None
    maturity_level: str
    confidence_score: float
    confidence_label: str
    opportunity_score: float
    opportunity_label: str
    delta_value: float | None
    delta_label: str
    total_signals: int
    positive_signals: int
    negative_signals: int
    mixed_signals: int
    explanation_summary: str | None
    limitation_notes: list[str]
    top_supporting_evidence_ids: list[str]
    top_counter_evidence_ids: list[str]
    ui_summary: str | None


class DimensionScoreDetailSchema(DimensionScoreSchema):
    """Full dimension score including P3 inference (used in detail endpoint only)."""

    p3_inference: dict | None  # type: ignore[type-arg]


class EvidenceUnitSchema(BaseResponse):
    evidence_id: str
    analysis_run_id: str
    member_id: str
    timestamp: str
    source_type: str | None
    record_id: str | None
    content_excerpt: str
    content_summary: str
    extraction_confidence: float | None
    ambiguity_notes: list[str]
    created_at: str


class BehavioralEventSchema(BaseResponse):
    event_id: str
    timestamp: str
    event_type: str
    event_summary: str | None
    polarity: str
    severity: float | None
    event_confidence: float | None
    impact_level: str | None
    opportunity_level: str | None
    related_dimensions: list[dict]  # type: ignore[type-arg]
    why_it_matters: str | None


class KptItemSchema(BaseResponse):
    kpt_id: str
    item_type: str
    title: str
    summary: str | None
    linked_dimension_ids: list[str]
    linked_problem_ids: list[str]
    display_order: int


class CaseFeedbackSchema(BaseResponse):
    case_id: str
    analysis_run_id: str
    title: str
    category: str | None
    impact_level: str | None
    summary: str | None
    why_it_matters: str | None
    observed_pattern: str | None
    better_alternative: str | None
    next_time_guidance: str | None
    linked_dimension_ids: list[str]
    supporting_event_ids: list[str]
    confidence_score: float | None
    display_order: int


class MilestoneSchema(BaseResponse):
    milestone_id: str
    member_id: str
    source_analysis_run_id: str | None
    timestamp: str
    milestone_type: str
    title: str
    summary: str | None
    impact_score: float | None
    supporting_event_ids: list[str]
    created_at: str


# ── B7.1 — Overview ──────────────────────────────────────────────────────────


class ProfileOverviewResponse(BaseResponse):
    run_id: str
    member_id: str
    period_start: str
    period_end: str
    scoring_version: str | None
    p8_approved: bool
    overall_confidence: float | None
    profile_summary: str | None
    growth_journey_summary: str | None
    current_growth_path: str | None
    top_strength_dimension_ids: list[str]
    top_growth_dimension_ids: list[str]
    insufficient_dimensions: list[str]
    fairness_notes: list[str]
    category_scores: list[CategoryScoreSchema]


# ── B7.2 — Competency list ───────────────────────────────────────────────────


class ProfileCompetencyResponse(BaseResponse):
    run_id: str
    dimension_scores: list[DimensionScoreSchema]
    category_scores: list[CategoryScoreSchema]


# ── B7.3 — Dimension detail ──────────────────────────────────────────────────


class DimensionDetailResponse(BaseResponse):
    dimension_score: DimensionScoreDetailSchema
    supporting_evidence: list[EvidenceUnitSchema]
    counter_evidence: list[EvidenceUnitSchema]
    behavioral_events: list[BehavioralEventSchema]


# ── B7.4 — KPT ───────────────────────────────────────────────────────────────


class ProfileKptResponse(BaseResponse):
    run_id: str
    keep_items: list[KptItemSchema]
    problem_items: list[KptItemSchema]
    try_items: list[KptItemSchema]


# ── B7.5 — Cases list ────────────────────────────────────────────────────────


class ProfileCasesResponse(BaseResponse):
    run_id: str
    cases: list[CaseFeedbackSchema]


# ── B7.7 — Journey ───────────────────────────────────────────────────────────


class ProfileJourneyResponse(BaseResponse):
    run_id: str
    growth_journey_summary: str | None
    current_growth_path: str | None
    milestones: list[MilestoneSchema]


# ── B7.9 — Member milestones ─────────────────────────────────────────────────


class MilestonesResponse(BaseResponse):
    milestones: list[MilestoneSchema]
