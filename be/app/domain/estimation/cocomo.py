"""COCOMO II Post-Architecture estimation engine.

This module is pure domain logic — no FastAPI, no SQLAlchemy, no I/O.
It is the single authoritative source of effort estimation in the system.

Formula:  PM = A * Size^E * prod(EM)
  PM   — person-months of effort
  A    — calibration constant          (from EstimationConfig, sourced from config/default.yaml)
  Size — project size (story points or KSLOC; unit must be consistent across the system)
  E    — scaling exponent = B + 0.01 * sum(SF weight values)
  B    — scaling exponent base         (from EstimationConfig, sourced from config/default.yaml)
  EM   — effort multiplier values; product defaults to 1.0 when none provided

Phase ratios (investigate/design/implement/testing/review/support) are NOT part of
EstimationConfig — they are stored per org and per project in the database so each
project type can have its own breakdown (research vs pure dev vs maintenance).

Reference: Boehm et al., "Software Cost Estimation with COCOMO II", 2000.
"""

import math

from app.domain.estimation.value_objects import (
    EffortBreakdown,
    EstimationConfig,
    ManDays,
    PersonMonths,
    PhaseRatios,
)


class CocomoEngine:
    """COCOMO II Post-Architecture model.

    Receives an EstimationConfig (A, B, working_days_per_month) built from
    application config at the DI boundary. The engine itself has no awareness
    of config files or environment variables.

    Scale factor weights (SF values):
        Pre-looked-up weight floats from the COCOMO II standard tables.
        Nominal weights: PREC=3.72, FLEX=3.04, RESL=4.24, TEAM=3.29, PMAT=4.68
        Range: 0.00 (Extra High / most favorable) to 7.80 (Very Low / least favorable).

    Effort multipliers (EM values):
        Direct float multipliers; nominal = 1.0.
        Values above 1.0 increase effort, below 1.0 decrease it.
    """

    # COCOMO II formula constants
    _SF_EXPONENT_SCALE: float = 0.01  # E = B + _SF_EXPONENT_SCALE * sum(SF_i)
    _EM_NEUTRAL_PRODUCT: float = 1.0  # Identity for EM product when no multipliers provided

    # Output rounding precision
    _PM_PRECISION: int = 4  # Person-months: 4 decimal places (e.g. 23.8972 PM)
    _DAYS_PRECISION: int = 2  # Man-days and phase breakdown: 2 decimal places (e.g. 517.61 days)

    def __init__(self, config: EstimationConfig | None = None) -> None:
        self._config = config or EstimationConfig()

    @property
    def config(self) -> EstimationConfig:
        return self._config

    def estimate_effort(
        self,
        size_points: float,
        scale_factors: dict[str, float] | None = None,
        effort_multipliers: dict[str, float] | None = None,
    ) -> PersonMonths:
        """Compute effort in person-months.

        Args:
            size_points: Project size. Use a consistent unit across the system
                         (story points, function points, or KSLOC). A and B encode
                         the unit choice via historical calibration.
            scale_factors: Mapping of SF key to weight value from COCOMO II tables.
                           Omit to use bare exponent B (best-case, no risk penalty).
            effort_multipliers: Mapping of EM key to multiplier float.
                                Omit to apply no adjustment (product = 1.0).

        Raises:
            ValueError: If size_points <= 0.
        """
        if size_points <= 0:
            raise ValueError(f"size_points must be positive, got {size_points}")

        sf_sum = sum((scale_factors or {}).values())
        exponent = self._config.b + self._SF_EXPONENT_SCALE * sf_sum

        em_values = list((effort_multipliers or {}).values())
        em_product = math.prod(em_values) if em_values else self._EM_NEUTRAL_PRODUCT

        raw_pm = self._config.a * (size_points**exponent) * em_product
        return PersonMonths(value=round(raw_pm, self._PM_PRECISION))

    def to_man_days(self, person_months: PersonMonths) -> ManDays:
        """Convert person-months to working man-days.

        Conversion factor comes from EstimationConfig.working_days_per_month,
        sourced from config/default.yaml (default: 21.67, the COCOMO II standard).
        """
        return ManDays(
            value=round(
                person_months.value * self._config.working_days_per_month, self._DAYS_PRECISION
            )
        )

    def breakdown_by_phase(
        self,
        man_days: ManDays,
        phase_ratios: PhaseRatios | None = None,
    ) -> EffortBreakdown:
        """Distribute total man-days across the six delivery phases.

        Args:
            man_days: Total effort to distribute.
            phase_ratios: Phase distribution resolved from the project's org or
                          project-level DB config. Falls back to PhaseRatios()
                          defaults only when no DB config exists yet.
        """
        ratios = phase_ratios or PhaseRatios()
        total = man_days.value

        return EffortBreakdown(
            investigate_days=round(total * ratios.investigate, self._DAYS_PRECISION),
            design_days=round(total * ratios.design, self._DAYS_PRECISION),
            implement_days=round(total * ratios.implement, self._DAYS_PRECISION),
            testing_days=round(total * ratios.testing, self._DAYS_PRECISION),
            review_days=round(total * ratios.review, self._DAYS_PRECISION),
            support_days=round(total * ratios.support, self._DAYS_PRECISION),
            total_days=round(total, self._DAYS_PRECISION),
        )
