from dataclasses import dataclass

# Valid status values for an AnalysisRun
ANALYSIS_RUN_ACTIVE_STATUSES = frozenset({"pending", "collecting", "analyzing"})
ANALYSIS_RUN_TERMINAL_STATUSES = frozenset({"completed", "failed"})


@dataclass
class AnalysisRun:
    analysis_run_id: str
    member_id: str
    period_start: str  # ISO date: YYYY-MM-DD
    period_end: str  # ISO date: YYYY-MM-DD
    run_type: str  # "fresh" | "refresh_same_period"
    status: str  # "pending" | "collecting" | "analyzing" | "completed" | "failed"
    progress_stage: str | None  # see PROGRESS_STAGES below
    error_message: str | None
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
