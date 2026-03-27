"""Value objects for the estimation domain.

These are immutable, self-validating types. They carry no framework dependencies.
"""

from dataclasses import dataclass, field
from typing import ClassVar

# ---------------------------------------------------------------------------
# Module-level constants for EstimationConfig field defaults.
# Must be module-level (not ClassVar) because dataclass field() defaults are
# evaluated before the class body is fully defined.
# ---------------------------------------------------------------------------
_COCOMO_A: float = 2.94  # COCOMO II calibration constant A (Boehm et al. 2000)
_COCOMO_B: float = 0.91  # COCOMO II scaling exponent base B
_WORKING_DAYS_PER_MONTH: float = 21.67  # 260 working days/year / 12 months


@dataclass(frozen=True)
class PersonMonths:
    """Effort expressed in person-months (COCOMO II output unit)."""

    value: float

    def __post_init__(self) -> None:
        if self.value < 0:
            raise ValueError(f"PersonMonths cannot be negative, got {self.value}")


@dataclass(frozen=True)
class ManDays:
    """Effort expressed in working man-days (1 PM = 21.67 days)."""

    value: float

    def __post_init__(self) -> None:
        if self.value < 0:
            raise ValueError(f"ManDays cannot be negative, got {self.value}")


@dataclass(frozen=True)
class PhaseRatios:
    """Distribution of total effort across the six delivery phases.

    All six ratios must sum to exactly 1.0.

    Default split reflects a typical software project:
      - Investigate  10%  requirements clarification, spike research
      - Design       15%  architecture, DB design, API contracts
      - Implement    40%  core development
      - Testing      20%  unit, integration, manual testing
      - Review       10%  code review, stakeholder feedback cycles
      - Support       5%  deployment support, rollback readiness
    """

    _REQUIRED_SUM: ClassVar[float] = 1.0
    _SUM_TOLERANCE: ClassVar[float] = 1e-9
    _MIN_RATIO: ClassVar[float] = 0.0

    investigate: float = 0.10
    design: float = 0.15
    implement: float = 0.40
    testing: float = 0.20
    review: float = 0.10
    support: float = 0.05

    def __post_init__(self) -> None:
        total = (
            self.investigate
            + self.design
            + self.implement
            + self.testing
            + self.review
            + self.support
        )
        if abs(total - self._REQUIRED_SUM) > self._SUM_TOLERANCE:
            raise ValueError(f"Phase ratios must sum to {self._REQUIRED_SUM}, got {total:.10f}")
        for name, ratio in self._items():
            if ratio < self._MIN_RATIO:
                raise ValueError(f"Phase ratio '{name}' cannot be negative, got {ratio}")

    def _items(self) -> list[tuple[str, float]]:
        return [
            ("investigate", self.investigate),
            ("design", self.design),
            ("implement", self.implement),
            ("testing", self.testing),
            ("review", self.review),
            ("support", self.support),
        ]


@dataclass(frozen=True)
class EstimationConfig:
    """COCOMO II calibration parameters injected into CocomoEngine at runtime.

    Resolved from application config (YAML -> env vars). Built at the application
    boundary from CocomoSettings and passed into CocomoEngine via DI.

    Phase ratios are intentionally excluded — they are stored per org/project
    in the database and resolved separately at call time.

    Defaults are the COCOMO II standard values and serve as an absolute fallback
    (e.g. in tests that bypass Settings). At runtime, values come from config/default.yaml.
    """

    a: float = field(default=_COCOMO_A)
    b: float = field(default=_COCOMO_B)
    working_days_per_month: float = field(default=_WORKING_DAYS_PER_MONTH)

    def __post_init__(self) -> None:
        if self.a <= 0:
            raise ValueError(f"COCOMO constant A must be positive, got {self.a}")
        if self.b <= 0:
            raise ValueError(f"COCOMO exponent B must be positive, got {self.b}")
        if self.working_days_per_month <= 0:
            raise ValueError(
                f"working_days_per_month must be positive, got {self.working_days_per_month}"
            )


@dataclass(frozen=True)
class EffortBreakdown:
    """Per-phase effort in man-days, produced by CocomoEngine.breakdown_by_phase."""

    investigate_days: float
    design_days: float
    implement_days: float
    testing_days: float
    review_days: float
    support_days: float
    total_days: float

    @property
    def phase_sum(self) -> float:
        """Sum of all phase values (should equal total_days within floating-point tolerance)."""
        return (
            self.investigate_days
            + self.design_days
            + self.implement_days
            + self.testing_days
            + self.review_days
            + self.support_days
        )
