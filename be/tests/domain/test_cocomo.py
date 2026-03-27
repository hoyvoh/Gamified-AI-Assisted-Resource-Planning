"""Unit tests for the COCOMO II estimation engine.

Pure domain tests — no DB, no HTTP, no fixtures.
All expected values are derived analytically from the formula:
  PM = A * Size^E * prod(EM),  E = B + 0.01 * sum(SF values)
  A = 2.94, B = 0.91
"""

import pytest

from app.domain.estimation.cocomo import CocomoEngine
from app.domain.estimation.value_objects import EstimationConfig, ManDays, PersonMonths, PhaseRatios

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

ENGINE = CocomoEngine()  # default A=2.94, B=0.91


def _expected_pm(size: float, sf_sum: float = 0.0, em_product: float = 1.0) -> float:
    exponent = 0.91 + 0.01 * sf_sum
    return 2.94 * (size**exponent) * em_product


# ---------------------------------------------------------------------------
# estimate_effort — reference values
# ---------------------------------------------------------------------------


def test_estimate_effort_size_one_no_modifiers() -> None:
    """size=1 with no SFs/EMs: PM = A * 1^B * 1 = A = 2.94 exactly."""
    result = ENGINE.estimate_effort(1.0)
    assert result == PersonMonths(value=2.94)


def test_estimate_effort_size_ten_no_modifiers() -> None:
    """size=10, no SFs, no EMs: PM = 2.94 * 10^0.91."""
    expected = round(_expected_pm(10.0), 4)
    result = ENGINE.estimate_effort(10.0)
    assert result.value == pytest.approx(expected, rel=1e-4)


def test_estimate_effort_with_scale_factor_increases_exponent() -> None:
    """Adding a scale factor (PREC=3.72) must produce higher PM than no-SF baseline."""
    baseline = ENGINE.estimate_effort(10.0)
    with_sf = ENGINE.estimate_effort(10.0, scale_factors={"PREC": 3.72})
    assert with_sf.value > baseline.value


def test_estimate_effort_scale_factor_exponent_math() -> None:
    """Verify E = B + 0.01 * SF_sum is applied correctly."""
    sf = {"PREC": 3.72, "FLEX": 3.04}
    sf_sum = 3.72 + 3.04
    expected = round(_expected_pm(5.0, sf_sum=sf_sum), 4)
    result = ENGINE.estimate_effort(5.0, scale_factors=sf)
    assert result.value == pytest.approx(expected, rel=1e-4)


def test_estimate_effort_with_effort_multiplier() -> None:
    """EM > 1.0 must increase effort proportionally."""
    base = ENGINE.estimate_effort(10.0)
    with_em = ENGINE.estimate_effort(10.0, effort_multipliers={"RELY": 1.40})
    assert with_em.value == pytest.approx(base.value * 1.40, rel=1e-4)


def test_estimate_effort_multiple_ems_multiply() -> None:
    """Multiple EMs are multiplied together."""
    ems = {"RELY": 1.15, "CPLX": 1.30}
    expected_em_product = 1.15 * 1.30
    base = ENGINE.estimate_effort(8.0)
    with_em = ENGINE.estimate_effort(8.0, effort_multipliers=ems)
    assert with_em.value == pytest.approx(base.value * expected_em_product, rel=1e-4)


def test_estimate_effort_em_below_one_reduces_effort() -> None:
    """EM < 1.0 (e.g. high analyst capability) must reduce effort."""
    base = ENGINE.estimate_effort(10.0)
    with_em = ENGINE.estimate_effort(10.0, effort_multipliers={"ACAP": 0.71})
    assert with_em.value < base.value


def test_estimate_effort_empty_dicts_same_as_none() -> None:
    """Passing empty dicts must produce the same result as passing None."""
    result_none = ENGINE.estimate_effort(5.0)
    result_empty = ENGINE.estimate_effort(5.0, scale_factors={}, effort_multipliers={})
    assert result_none == result_empty


def test_estimate_effort_invalid_size_zero() -> None:
    with pytest.raises(ValueError, match="size_points must be positive"):
        ENGINE.estimate_effort(0.0)


def test_estimate_effort_invalid_size_negative() -> None:
    with pytest.raises(ValueError, match="size_points must be positive"):
        ENGINE.estimate_effort(-5.0)


# ---------------------------------------------------------------------------
# to_man_days — conversion
# ---------------------------------------------------------------------------


def test_to_man_days_one_person_month() -> None:
    """1 PM = 21.67 working days (COCOMO II standard)."""
    result = ENGINE.to_man_days(PersonMonths(1.0))
    assert result == ManDays(value=21.67)


def test_to_man_days_zero() -> None:
    result = ENGINE.to_man_days(PersonMonths(0.0))
    assert result == ManDays(value=0.0)


def test_to_man_days_proportional() -> None:
    """Conversion must be linear."""
    result = ENGINE.to_man_days(PersonMonths(2.0))
    assert result.value == pytest.approx(43.34, rel=1e-4)


# ---------------------------------------------------------------------------
# breakdown_by_phase — distribution
# ---------------------------------------------------------------------------


def test_breakdown_phase_sum_equals_total() -> None:
    """Sum of all phase days must equal total_days."""
    breakdown = ENGINE.breakdown_by_phase(ManDays(100.0))
    assert breakdown.phase_sum == pytest.approx(breakdown.total_days, abs=0.01)


def test_breakdown_default_ratios() -> None:
    """Default split: 10/15/40/20/10/5 of total."""
    total = 100.0
    breakdown = ENGINE.breakdown_by_phase(ManDays(total))
    assert breakdown.investigate_days == pytest.approx(total * 0.10, abs=0.01)
    assert breakdown.design_days == pytest.approx(total * 0.15, abs=0.01)
    assert breakdown.implement_days == pytest.approx(total * 0.40, abs=0.01)
    assert breakdown.testing_days == pytest.approx(total * 0.20, abs=0.01)
    assert breakdown.review_days == pytest.approx(total * 0.10, abs=0.01)
    assert breakdown.support_days == pytest.approx(total * 0.05, abs=0.01)


def test_breakdown_custom_ratios() -> None:
    """Custom PhaseRatios must be respected."""
    ratios = PhaseRatios(
        investigate=0.05,
        design=0.10,
        implement=0.50,
        testing=0.25,
        review=0.07,
        support=0.03,
    )
    breakdown = ENGINE.breakdown_by_phase(ManDays(200.0), phase_ratios=ratios)
    assert breakdown.implement_days == pytest.approx(200.0 * 0.50, abs=0.01)
    assert breakdown.support_days == pytest.approx(200.0 * 0.03, abs=0.01)
    assert breakdown.phase_sum == pytest.approx(200.0, abs=0.01)


def test_breakdown_small_total() -> None:
    """Works correctly for sub-day totals."""
    breakdown = ENGINE.breakdown_by_phase(ManDays(1.0))
    assert breakdown.total_days == pytest.approx(1.0, abs=0.01)
    assert breakdown.phase_sum == pytest.approx(1.0, abs=0.01)


# ---------------------------------------------------------------------------
# PhaseRatios validation
# ---------------------------------------------------------------------------


def test_phase_ratios_invalid_sum_raises() -> None:
    with pytest.raises(ValueError, match=r"must sum to 1\.0"):
        PhaseRatios(
            investigate=0.20,
            design=0.20,
            implement=0.20,
            testing=0.20,
            review=0.20,
            support=0.20,  # sum = 1.20
        )


def test_phase_ratios_negative_raises() -> None:
    with pytest.raises(ValueError):
        PhaseRatios(
            investigate=-0.10,
            design=0.25,
            implement=0.45,
            testing=0.25,
            review=0.10,
            support=0.05,
        )


# ---------------------------------------------------------------------------
# PersonMonths / ManDays validation
# ---------------------------------------------------------------------------


def test_person_months_negative_raises() -> None:
    with pytest.raises(ValueError, match="cannot be negative"):
        PersonMonths(value=-1.0)


def test_man_days_negative_raises() -> None:
    with pytest.raises(ValueError, match="cannot be negative"):
        ManDays(value=-0.5)


# ---------------------------------------------------------------------------
# CocomoEngine construction
# ---------------------------------------------------------------------------


def test_engine_custom_constants() -> None:
    """Custom A and B via EstimationConfig are used in computation."""
    engine = CocomoEngine(EstimationConfig(a=3.0, b=1.0))
    result = engine.estimate_effort(1.0)
    assert result == PersonMonths(value=3.0)  # 3.0 * 1^1.0 * 1 = 3.0


def test_engine_invalid_a_raises() -> None:
    with pytest.raises(ValueError, match="A must be positive"):
        EstimationConfig(a=0.0)


def test_engine_invalid_b_raises() -> None:
    with pytest.raises(ValueError, match="B must be positive"):
        EstimationConfig(b=-1.0)


# ---------------------------------------------------------------------------
# EstimationConfig
# ---------------------------------------------------------------------------


def test_estimation_config_defaults() -> None:
    config = EstimationConfig()
    assert config.a == 2.94
    assert config.b == 0.91
    assert config.working_days_per_month == 21.67


def test_estimation_config_custom_working_days() -> None:
    """Custom working_days_per_month flows through to_man_days."""
    config = EstimationConfig(working_days_per_month=22.0)
    engine = CocomoEngine(config)
    result = engine.to_man_days(PersonMonths(1.0))
    assert result == ManDays(value=22.0)


def test_estimation_config_invalid_working_days_raises() -> None:
    with pytest.raises(ValueError, match="working_days_per_month must be positive"):
        EstimationConfig(working_days_per_month=0.0)


def test_engine_exposes_config() -> None:
    config = EstimationConfig(a=3.5, b=1.0, working_days_per_month=22.0)
    engine = CocomoEngine(config)
    assert engine.config == config


# ---------------------------------------------------------------------------
# End-to-end: estimate -> convert -> breakdown
# ---------------------------------------------------------------------------


def test_full_pipeline_coherence() -> None:
    """estimate_effort -> to_man_days -> breakdown_by_phase produces consistent totals."""
    pm = ENGINE.estimate_effort(
        5.0, scale_factors={"PREC": 3.72}, effort_multipliers={"RELY": 1.10}
    )
    man_days = ENGINE.to_man_days(pm)
    breakdown = ENGINE.breakdown_by_phase(man_days)

    assert man_days.value == pytest.approx(pm.value * 21.67, rel=1e-4)
    assert breakdown.total_days == pytest.approx(man_days.value, abs=0.01)
    assert breakdown.phase_sum == pytest.approx(breakdown.total_days, abs=0.01)


def test_full_pipeline_known_values() -> None:
    """Reference: size=10, PREC=3.72, RELY=1.15 -> verify PM and man-days."""
    sf_sum = 3.72
    em_product = 1.15
    expected_pm = round(_expected_pm(10.0, sf_sum=sf_sum, em_product=em_product), 4)
    expected_days = round(expected_pm * 21.67, 2)

    pm = ENGINE.estimate_effort(
        10.0, scale_factors={"PREC": 3.72}, effort_multipliers={"RELY": 1.15}
    )
    man_days = ENGINE.to_man_days(pm)

    assert pm.value == pytest.approx(expected_pm, rel=1e-4)
    assert man_days.value == pytest.approx(expected_days, rel=1e-3)
