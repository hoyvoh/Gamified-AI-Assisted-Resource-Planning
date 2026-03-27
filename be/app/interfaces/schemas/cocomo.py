"""Pydantic schemas for COCOMO II estimation.

These models live in the interface layer — they are the HTTP-facing contract
for any endpoint that exposes estimation functionality. They must not be
imported by domain or application layers.
"""

from pydantic import BaseModel, Field, model_validator


class PhaseRatiosInput(BaseModel):
    """Custom phase breakdown ratios. All six values must sum to 1.0."""

    investigate: float = Field(0.10, ge=0.0, le=1.0)
    design: float = Field(0.15, ge=0.0, le=1.0)
    implement: float = Field(0.40, ge=0.0, le=1.0)
    testing: float = Field(0.20, ge=0.0, le=1.0)
    review: float = Field(0.10, ge=0.0, le=1.0)
    support: float = Field(0.05, ge=0.0, le=1.0)

    @model_validator(mode="after")
    def ratios_must_sum_to_one(self) -> "PhaseRatiosInput":
        total = (
            self.investigate
            + self.design
            + self.implement
            + self.testing
            + self.review
            + self.support
        )
        if abs(total - 1.0) > 1e-6:
            raise ValueError(f"Phase ratios must sum to 1.0, got {total:.6f}")
        return self


class CocomoInput(BaseModel):
    """Input for a COCOMO II estimation request."""

    size_points: float = Field(
        ...,
        gt=0,
        description=(
            "Project size in story points or KSLOC. "
            "Must be consistent with how constants A and B were calibrated."
        ),
    )
    scale_factors: dict[str, float] = Field(
        default_factory=dict,
        description=(
            "COCOMO II scale factor weights (pre-looked-up from standard tables). "
            "Common keys: PREC, FLEX, RESL, TEAM, PMAT. "
            "Omit for best-case baseline (exponent = B only)."
        ),
    )
    effort_multipliers: dict[str, float] = Field(
        default_factory=dict,
        description=(
            "Effort multiplier values. Nominal = 1.0; >1.0 increases effort. "
            "Common keys: RELY, CPLX, ACAP, TOOL, SCED. "
            "Omit to apply no adjustment."
        ),
    )
    phase_ratios: PhaseRatiosInput | None = Field(
        None,
        description="Custom phase breakdown. Omit to use the standard split.",
    )


class EffortBreakdownResponse(BaseModel):
    """Per-phase effort in man-days."""

    investigate_days: float
    design_days: float
    implement_days: float
    testing_days: float
    review_days: float
    support_days: float
    total_days: float


class CocomoResponse(BaseModel):
    """Full estimation result returned to the caller."""

    person_months: float = Field(description="Raw COCOMO II output in person-months.")
    man_days: float = Field(description="Converted to working man-days (1 PM = 21.67 days).")
    breakdown: EffortBreakdownResponse = Field(description="Per-phase effort distribution.")
