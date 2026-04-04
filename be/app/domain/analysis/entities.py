from dataclasses import dataclass

# Valid status values for an AnalysisRun
ANALYSIS_RUN_ACTIVE_STATUSES = frozenset({"pending", "collecting", "analyzing"})
ANALYSIS_RUN_TERMINAL_STATUSES = frozenset({"completed", "failed"})


SCORING_VERSION = "1.0"  # bump when scoring formula changes


@dataclass
class AnalysisRun:
    analysis_run_id: str
    member_id: str
    period_start: str  # ISO date: YYYY-MM-DD
    period_end: str  # ISO date: YYYY-MM-DD
    run_type: str  # "fresh" | "refresh_same_period"
    status: str  # "pending" | "collecting" | "analyzing" | "completed" | "failed"
    progress_stage: str | None  # see PROGRESS_STAGES below
    progress_pct: int  # 0-100
    error_message: str | None
    scoring_version: str | None  # set at scoring time; matches SCORING_VERSION
    created_at: str  # ISO 8601 UTC
    updated_at: str
    completed_at: str | None

    def is_active(self) -> bool:
        return self.status in ANALYSIS_RUN_ACTIVE_STATUSES

    def is_terminal(self) -> bool:
        return self.status in ANALYSIS_RUN_TERMINAL_STATUSES


# Valid progress_stage values (informational — for polling UI)
PROGRESS_STAGES = [
    "collecting_data",
    "extracting_evidence",
    "inferring_dimensions",
    "scoring",
    "generating_kpt",
    "generating_cases",
    "generating_overview",
    "self_checking",
    "persisting",
]


@dataclass
class EvidenceUnit:
    evidence_id: str
    analysis_run_id: str
    member_id: str
    timestamp: str  # ISO 8601 from source record
    source_type: str | None  # "github" | "slack" | etc.
    record_id: str | None  # original record id from source payload
    content_excerpt: str  # raw content (truncated)
    content_summary: str  # one-line summary (filled in after P1)
    extraction_confidence: float | None
    ambiguity_notes: list[str]
    created_at: str


@dataclass
class BehavioralEvent:
    event_id: str
    analysis_run_id: str
    member_id: str
    timestamp: str
    source_evidence_ids: list[str]
    event_type: str
    event_summary: str | None
    polarity: str  # "positive" | "negative" | "mixed" | "neutral"
    severity: float | None
    event_confidence: float | None
    impact_level: str | None  # "low" | "medium" | "high"
    opportunity_level: str | None  # "none" | "low" | "medium" | "high"
    related_dimensions: list[
        dict[str, object]
    ]  # [{"dimension_id": str, "relation_strength": float}]
    ambiguity_notes: list[str]
    why_it_matters: str | None
    created_at: str


@dataclass
class DimensionSignal:
    signal_id: str
    analysis_run_id: str
    member_id: str
    dimension_id: str
    source_event_ids: list[str]
    polarity: str  # "positive" | "negative" | "neutral" | "insufficient"
    signal_strength: float  # 0.0 - 1.0
    signal_specificity: float
    signal_confidence: float
    opportunity_level: str | None  # "none" | "low" | "medium" | "high"
    explanation_summary: str | None
    created_at: str


@dataclass
class DimensionScore:
    score_id: str
    analysis_run_id: str
    member_id: str
    dimension_id: str
    raw_score: float | None  # 0.0 - 5.0
    normalized_score: float | None  # 0.0 - 5.0
    maturity_level: str  # see VALID_MATURITY_LEVELS
    confidence_score: float  # 0.0 - 1.0
    confidence_label: str  # "low" | "moderate" | "high"
    opportunity_score: float  # 0.0 - 1.0
    opportunity_label: str  # "none" | "low" | "medium" | "high"
    delta_value: float | None
    delta_label: str  # "improved"|"stable"|"emerging"|"regressing"|"not_enough_comparison"
    total_signals: int
    positive_signals: int
    negative_signals: int
    mixed_signals: int
    explanation_summary: str | None
    limitation_notes: list[str]
    top_supporting_evidence_ids: list[str]
    top_counter_evidence_ids: list[str]
    # P3 LLM inference output (stored as JSON)
    p3_inference: dict[str, object] | None
    # P4 generated human-readable summary (populated after P4 pass)
    ui_summary: str | None
    created_at: str


@dataclass
class CategoryScore:
    category_score_id: str
    analysis_run_id: str
    member_id: str
    category_id: str  # see CATEGORIES keys in taxonomy
    score: float | None  # weighted average
    confidence_score: float
    confidence_label: str  # "low" | "moderate" | "high"
    included_dimensions: list[str]
    excluded_dimensions: list[str]
    explanation_summary: str | None
    created_at: str


@dataclass
class PersonalBaseline:
    baseline_id: str
    member_id: str  # UNIQUE — one baseline per member
    baseline_dimensions: dict[str, object]  # {dimension_id: {baseline_score, ...}}
    created_at: str
    updated_at: str


@dataclass
class KptItem:
    kpt_id: str
    analysis_run_id: str
    member_id: str
    item_type: str  # "keep" | "problem" | "try"
    title: str
    summary: str | None
    linked_dimension_ids: list[str]
    linked_evidence_ids: list[str]
    linked_problem_ids: list[str]  # for Try items
    display_order: int
    created_at: str


@dataclass
class CaseFeedback:
    case_id: str
    analysis_run_id: str
    member_id: str
    title: str
    category: str | None
    impact_level: str | None  # "low" | "medium" | "high"
    summary: str | None
    why_it_matters: str | None
    observed_pattern: str | None
    better_alternative: str | None
    next_time_guidance: str | None
    linked_dimension_ids: list[str]
    supporting_event_ids: list[str]
    confidence_score: float | None
    display_order: int
    created_at: str


@dataclass
class Milestone:
    milestone_id: str
    member_id: str
    source_analysis_run_id: str | None
    timestamp: str
    milestone_type: str
    title: str
    summary: str | None
    impact_score: float | None
    supporting_event_ids: list[str]
    supporting_evidence_ids: list[str]
    retained: bool  # soft-delete flag
    created_at: str


@dataclass
class AnalysisSnapshot:
    snapshot_id: str
    analysis_run_id: str  # UNIQUE
    member_id: str
    period_start: str
    period_end: str
    generated_at: str
    overall_confidence: float | None
    profile_summary: str | None
    growth_journey_summary: str | None
    top_strength_dimension_ids: list[str]
    top_growth_dimension_ids: list[str]
    current_growth_path: str | None
    fairness_notes: list[str]
    insufficient_dimensions: list[str]
    flagged_items_count: int
    p8_approved: bool
    p8_issues: list[dict[str, object]]


@dataclass
class ValidationFlag:
    flag_id: str
    analysis_run_id: str
    dimension_id: str
    verdict: str  # "accurate" | "questionable" | "incorrect"
    note: str | None
    flagged_at: str  # ISO 8601 UTC


VALID_VERDICTS: frozenset[str] = frozenset({"accurate", "questionable", "incorrect"})


@dataclass
class SourcePayload:
    source_payload_id: str
    analysis_run_id: str
    source_type: str  # "github" | "slack" | "confluence" | "jira" | "unknown"
    source_handle: str  # handle/identifier used to collect (e.g. GitHub username)
    raw_data: str  # JSON string of collected records
    record_count: int
    collection_status: str  # "collected" | "failed" | "skipped"
    error_message: str | None
    collected_at: str  # ISO 8601 UTC
