from pydantic import Field

from app.interfaces.schemas.base import BaseResponse


class TriggerAnalysisRequest(BaseResponse):
    member_id: str
    period_start: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    period_end: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    run_type: str = Field(default="fresh", pattern=r"^(fresh|refresh_same_period)$")


class RefreshAnalysisRequest(BaseResponse):
    period_start: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    period_end: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")


class AnalysisRunResponse(BaseResponse):
    analysis_run_id: str
    member_id: str
    period_start: str
    period_end: str
    run_type: str
    status: str
    progress_stage: str | None
    error_message: str | None
    scoring_version: str | None
    created_at: str
    updated_at: str
    completed_at: str | None


class UpsertBaselineRequest(BaseResponse):
    baseline_dimensions: dict = Field(  # type: ignore[type-arg]
        ...,
        description=(
            "Map of dimension_id to baseline data. "
            "Each value should contain: baseline_score (float|null), "
            "baseline_confidence (float), baseline_source (string), notes (string|null)."
        ),
    )


class PersonalBaselineResponse(BaseResponse):
    baseline_id: str
    member_id: str
    baseline_dimensions: dict  # type: ignore[type-arg]
    created_at: str
    updated_at: str


class UpsertValidationFlagRequest(BaseResponse):
    analysis_run_id: str
    dimension_id: str
    verdict: str = Field(..., pattern=r"^(accurate|questionable|incorrect)$")
    note: str | None = None


class ValidationFlagResponse(BaseResponse):
    flag_id: str
    analysis_run_id: str
    dimension_id: str
    verdict: str
    note: str | None
    flagged_at: str
