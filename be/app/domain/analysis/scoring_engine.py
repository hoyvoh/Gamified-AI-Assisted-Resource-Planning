"""Dimension and category scoring engine — pure Python, no I/O.

Implements:
- Signal mass formula (8-factor product)
- Dimension score via tanh normalization: 3 + 2*tanh(balance)
- Maturity level mapping
- Opportunity gate (OpportunityScore < 0.25 → insufficient_opportunity)
- Confidence scoring (4-component weighted average)
- Delta computation vs previous run score
- Category score (weighted average of valid dimension scores)
"""

from __future__ import annotations

import math
import uuid
from dataclasses import dataclass

from app.domain.analysis.entities import BehavioralEvent, CategoryScore, DimensionScore
from app.domain.analysis.taxonomy import CATEGORIES, DIMENSIONS

# ── Constants ─────────────────────────────────────────────────────────────────

_MIN_SIGNAL_MASS_THRESHOLD = 0.05  # below this → insufficient_evidence
_OPPORTUNITY_GATE = 0.25  # below this → insufficient_opportunity
_TARGET_SIGNAL_COUNT = 6  # target for full evidence sufficiency

# Default equal weights per dimension within each category
# Used when role profile provides no weights
_DEFAULT_CATEGORY_WEIGHTS: dict[str, dict[str, float]] = {
    "core_technical_execution": {
        "implementation_reliability": 0.20,
        "code_quality_discipline": 0.15,
        "debugging_root_cause": 0.20,
        "careless_mistake_control": 0.15,
        "technical_ownership": 0.15,
        "technical_learning_adaptability": 0.15,
    },
    "technical_depth_breadth": {
        "backend_capability": 0.20,
        "frontend_capability": 0.15,
        "devops_delivery_capability": 0.15,
        "system_integration_capability": 0.20,
        "data_interface_handling": 0.15,
        "architecture_exposure": 0.15,
    },
    "engineering_mindset": {
        "quality_mindset": 0.20,
        "performance_awareness": 0.15,
        "security_awareness": 0.15,
        "maintainability_thinking": 0.20,
        "risk_awareness": 0.15,
        "decision_hygiene": 0.15,
    },
    "collaboration_growth": {
        "problem_solving": 0.20,
        "self_management": 0.15,
        "horenso_reporting_discipline": 0.15,
        "user_first": 0.15,
        "collaboration": 0.15,
        "mentoring_knowledge_support": 0.10,
        "ai_leverage_ability": 0.10,
    },
}

# ── Public entry points ────────────────────────────────────────────────────────


@dataclass
class ScoringInput:
    run_id: str
    member_id: str
    behavioral_events: list[BehavioralEvent]
    p3_inferences: dict[str, dict]  # type: ignore[type-arg]  # dim_id → P3 output
    previous_scores: dict[str, float]  # dim_id → previous normalized_score (may be empty)
    role_dimension_weights: dict[str, float]  # dim_id → weight override (may be empty)
    now: str  # ISO UTC timestamp for created_at


def compute_dimension_scores(inp: ScoringInput) -> list[DimensionScore]:
    """Compute DimensionScore for every dimension that has P3 inference output."""
    scores: list[DimensionScore] = []
    for dim_id in DIMENSIONS:
        inference = inp.p3_inferences.get(dim_id)
        if inference is None:
            # No P3 inference → skip (dimension had no relevant events)
            continue
        score = _score_one_dimension(dim_id, inference, inp)
        scores.append(score)
    return scores


def compute_category_scores(
    dimension_scores: list[DimensionScore],
    run_id: str,
    member_id: str,
    role_dimension_weights: dict[str, float],
    now: str,
) -> list[CategoryScore]:
    """Compute CategoryScore for each category from valid dimension scores."""
    score_map = {s.dimension_id: s for s in dimension_scores}
    category_scores: list[CategoryScore] = []

    for cat_id, dim_ids in CATEGORIES.items():
        weights = _get_category_weights(cat_id, dim_ids, role_dimension_weights)
        included: list[str] = []
        excluded: list[str] = []
        weighted_score_sum = 0.0
        weight_sum = 0.0
        confidence_sum = 0.0
        confidence_weight_sum = 0.0

        for dim_id in dim_ids:
            ds = score_map.get(dim_id)
            w = weights.get(dim_id, 1.0 / len(dim_ids))
            if ds is None or ds.normalized_score is None:
                excluded.append(dim_id)
                continue
            included.append(dim_id)
            weighted_score_sum += ds.normalized_score * w
            weight_sum += w
            confidence_sum += ds.confidence_score * w
            confidence_weight_sum += w

        cat_score: float | None = (weighted_score_sum / weight_sum) if weight_sum > 0 else None
        cat_confidence = (
            (confidence_sum / confidence_weight_sum) if confidence_weight_sum > 0 else 0.0
        )

        category_scores.append(
            CategoryScore(
                category_score_id=str(uuid.uuid4()),
                analysis_run_id=run_id,
                member_id=member_id,
                category_id=cat_id,
                score=round(cat_score, 4) if cat_score is not None else None,
                confidence_score=round(cat_confidence, 4),
                confidence_label=_confidence_label(cat_confidence),
                included_dimensions=included,
                excluded_dimensions=excluded,
                explanation_summary=None,
                created_at=now,
            )
        )

    return category_scores


# ── Internal helpers ───────────────────────────────────────────────────────────


def _score_one_dimension(
    dim_id: str,
    inference: dict,  # type: ignore[type-arg]
    inp: ScoringInput,
) -> DimensionScore:
    """Derive DimensionScore from P3 inference + behavioral events."""
    # Collect events related to this dimension
    dim_events = _events_for_dimension(dim_id, inp.behavioral_events)

    # Compute signal masses from events
    positive_mass, negative_mass, neutral_mass, signal_count_by_polarity = _aggregate_signal_mass(
        dim_id, dim_events
    )
    total_mass = positive_mass + negative_mass + neutral_mass
    total_signals = sum(signal_count_by_polarity.values())

    # Opportunity score from P3 inference
    opp_label = _coerce_opportunity(inference.get("opportunity_assessment", {}).get("label", "low"))
    opp_score = _opportunity_label_to_score(opp_label, dim_events)

    # Opportunity gate
    if opp_score < _OPPORTUNITY_GATE:
        return _make_score(
            dim_id=dim_id,
            inp=inp,
            inference=inference,
            raw_score=None,
            normalized_score=None,
            maturity_level="insufficient_opportunity",
            opp_score=opp_score,
            opp_label=opp_label,
            total_signals=total_signals,
            positive_signals=signal_count_by_polarity.get("positive", 0),
            negative_signals=signal_count_by_polarity.get("negative", 0),
            mixed_signals=signal_count_by_polarity.get("mixed", 0),
            confidence_score=0.0,
        )

    # Insufficient evidence
    if total_mass < _MIN_SIGNAL_MASS_THRESHOLD:
        return _make_score(
            dim_id=dim_id,
            inp=inp,
            inference=inference,
            raw_score=None,
            normalized_score=None,
            maturity_level="insufficient_evidence",
            opp_score=opp_score,
            opp_label=opp_label,
            total_signals=total_signals,
            positive_signals=signal_count_by_polarity.get("positive", 0),
            negative_signals=signal_count_by_polarity.get("negative", 0),
            mixed_signals=signal_count_by_polarity.get("mixed", 0),
            confidence_score=0.0,
        )

    # Raw balance → tanh normalization
    balance = positive_mass - negative_mass
    raw_score = 3.0 + 2.0 * math.tanh(balance)
    normalized_score = max(1.0, min(5.0, raw_score))

    # Maturity level
    maturity = _maturity_level(normalized_score)

    # Confidence score — blend P3 confidence with evidence metrics
    p3_confidence = _safe_float(inference.get("confidence_score"), default=0.5)
    evidence_sufficiency = min(1.0, total_signals / _TARGET_SIGNAL_COUNT)
    pattern_consistency = _pattern_consistency(signal_count_by_polarity, total_mass)
    context_diversity = _context_diversity(dim_events)
    cross_agreement = _cross_signal_agreement(dim_events, dim_id)

    evidence_confidence = (
        0.30 * evidence_sufficiency
        + 0.30 * pattern_consistency
        + 0.20 * context_diversity
        + 0.20 * cross_agreement
    )
    # Blend with P3 LLM confidence
    confidence_score = max(0.0, min(1.0, 0.6 * evidence_confidence + 0.4 * p3_confidence))

    return _make_score(
        dim_id=dim_id,
        inp=inp,
        inference=inference,
        raw_score=round(raw_score, 4),
        normalized_score=round(normalized_score, 4),
        maturity_level=maturity,
        opp_score=opp_score,
        opp_label=opp_label,
        total_signals=total_signals,
        positive_signals=signal_count_by_polarity.get("positive", 0),
        negative_signals=signal_count_by_polarity.get("negative", 0),
        mixed_signals=signal_count_by_polarity.get("mixed", 0),
        confidence_score=round(confidence_score, 4),
    )


def _make_score(
    *,
    dim_id: str,
    inp: ScoringInput,
    inference: dict,  # type: ignore[type-arg]
    raw_score: float | None,
    normalized_score: float | None,
    maturity_level: str,
    opp_score: float,
    opp_label: str,
    total_signals: int,
    positive_signals: int,
    negative_signals: int,
    mixed_signals: int,
    confidence_score: float,
) -> DimensionScore:
    prev = inp.previous_scores.get(dim_id)
    delta_value, delta_label = _compute_delta(normalized_score, prev)

    return DimensionScore(
        score_id=str(uuid.uuid4()),
        analysis_run_id=inp.run_id,
        member_id=inp.member_id,
        dimension_id=dim_id,
        raw_score=raw_score,
        normalized_score=normalized_score,
        maturity_level=maturity_level,
        confidence_score=confidence_score,
        confidence_label=_confidence_label(confidence_score),
        opportunity_score=round(opp_score, 4),
        opportunity_label=opp_label,
        delta_value=delta_value,
        delta_label=delta_label,
        total_signals=total_signals,
        positive_signals=positive_signals,
        negative_signals=negative_signals,
        mixed_signals=mixed_signals,
        explanation_summary=inference.get("observed_pattern_summary"),
        limitation_notes=_list_field(inference, "counter_evidence_or_limitations"),
        top_supporting_evidence_ids=_list_field(inference, "top_supporting_event_ids"),
        top_counter_evidence_ids=_list_field(inference, "top_counter_event_ids"),
        p3_inference=inference,
        created_at=inp.now,
    )


def _events_for_dimension(dim_id: str, events: list[BehavioralEvent]) -> list[BehavioralEvent]:
    """Filter events that have a relation to this dimension (strength >= 0.30)."""
    out = []
    for ev in events:
        for rel in ev.related_dimensions:
            if not isinstance(rel, dict):
                continue
            if rel.get("dimension_id") != dim_id:
                continue
            strength = rel.get("relation_strength", 0.0)
            if _safe_float(strength) >= 0.30:
                out.append(ev)
                break
    return out


def _aggregate_signal_mass(
    dim_id: str, events: list[BehavioralEvent]
) -> tuple[float, float, float, dict[str, int]]:
    """Compute positive, negative, neutral signal mass and polarity counts."""
    pos_mass = neg_mass = neu_mass = 0.0
    counts: dict[str, int] = {"positive": 0, "negative": 0, "mixed": 0, "neutral": 0}

    for ev in events:
        rel_strength = _relation_strength(ev, dim_id)
        mass = _signal_mass(ev, rel_strength)

        polarity = ev.polarity if ev.polarity in counts else "neutral"
        counts[polarity] += 1

        if polarity == "positive":
            pos_mass += mass
        elif polarity == "negative":
            neg_mass += mass
        elif polarity == "mixed":
            pos_mass += mass * 0.5
            neg_mass += mass * 0.5
        else:
            neu_mass += mass * 0.3

    return pos_mass, neg_mass, neu_mass, counts


def _signal_mass(ev: BehavioralEvent, relation_strength: float) -> float:
    """Compute the signal mass for one event contributing to a dimension.

    Formula:
        signal_strength (= relation_strength)
        x signal_specificity (= relation_strength, proxy)
        x signal_confidence (= event_confidence)
        x event_confidence
        x evidence_strength (= extraction_confidence proxy, default 0.7)
        x evidence_directness (= 0.8 constant - all events are direct)
        x recency_weight (1.0 - period already bounded)
        x opportunity_adjustment (from opportunity_level)
    """
    sig_strength = relation_strength
    sig_specificity = relation_strength  # same source for MVP
    sig_confidence = _safe_float(ev.event_confidence, default=0.5)
    event_conf = sig_confidence
    evidence_strength = 0.7  # evidence units not individually scored in MVP
    evidence_directness = 0.8
    recency_weight = 1.0
    opp_adj = _opportunity_adjustment(ev.opportunity_level)

    mass = (
        sig_strength
        * sig_specificity
        * sig_confidence
        * event_conf
        * evidence_strength
        * evidence_directness
        * recency_weight
        * opp_adj
    )
    return max(0.0, mass)


def _relation_strength(ev: BehavioralEvent, dim_id: str) -> float:
    for rel in ev.related_dimensions:
        if isinstance(rel, dict) and rel.get("dimension_id") == dim_id:
            return min(1.0, max(0.0, _safe_float(rel.get("relation_strength", 0.5))))
    return 0.0


def _opportunity_adjustment(opp_level: str | None) -> float:
    mapping = {"none": 0.2, "low": 0.5, "medium": 0.8, "high": 1.0}
    return mapping.get(opp_level or "medium", 0.8)


def _opportunity_label_to_score(label: str, events: list[BehavioralEvent]) -> float:
    """Convert P3 opportunity label + event mass into an opportunity score.

    Formula: 0.40 * RoleRelevance + 0.30 * ContextExposure + 0.30 * EventOpportunityMass
    We proxy RoleRelevance from the label, ContextExposure from event count, and
    EventOpportunityMass from the average opportunity_level of events.
    """
    label_base = {"none": 0.05, "low": 0.30, "medium": 0.55, "high": 0.85}.get(label, 0.55)
    role_relevance = label_base

    context_exposure = min(1.0, len(events) / 5.0) if events else 0.0

    opp_scores = []
    for ev in events:
        opp_scores.append(_opportunity_adjustment(ev.opportunity_level))
    event_opp_mass = (sum(opp_scores) / len(opp_scores)) if opp_scores else 0.0

    return 0.40 * role_relevance + 0.30 * context_exposure + 0.30 * event_opp_mass


def _pattern_consistency(polarity_counts: dict[str, int], total_mass: float) -> float:
    """Higher when one polarity dominates."""
    if total_mass == 0:
        return 0.0
    pos = polarity_counts.get("positive", 0)
    neg = polarity_counts.get("negative", 0)
    total = sum(polarity_counts.values())
    if total == 0:
        return 0.0
    dominant = max(pos, neg)
    return dominant / total


def _context_diversity(events: list[BehavioralEvent]) -> float:
    """Proxy for diversity: fraction of unique source_evidence_id lists."""
    if not events:
        return 0.0
    unique_types: set[str] = set()
    for ev in events:
        if ev.impact_level:
            unique_types.add(ev.impact_level)
        if ev.event_type:
            unique_types.add(ev.event_type)
    return min(1.0, len(unique_types) / 4.0)


def _cross_signal_agreement(events: list[BehavioralEvent], dim_id: str) -> float:
    """Fraction of events where polarity is consistent (all pos or all neg)."""
    if not events:
        return 0.0
    polarities = [ev.polarity for ev in events]
    pos_count = polarities.count("positive")
    neg_count = polarities.count("negative")
    total = len(polarities)
    dominant = max(pos_count, neg_count)
    return dominant / total


def _maturity_level(score: float) -> str:
    if score < 2.0:
        return "emerging"
    if score < 2.8:
        return "developing"
    if score < 3.6:
        return "reliable"
    if score < 4.4:
        return "strong"
    return "advanced"


def _confidence_label(score: float) -> str:
    if score < 0.40:
        return "low"
    if score < 0.70:
        return "moderate"
    return "high"


def _opportunity_score_to_label(score: float) -> str:
    if score < 0.20:
        return "none"
    if score < 0.40:
        return "low"
    if score < 0.70:
        return "medium"
    return "high"


def _coerce_opportunity(label: object) -> str:
    valid = {"none", "low", "medium", "high"}
    return str(label) if str(label) in valid else "low"


def _compute_delta(current: float | None, previous: float | None) -> tuple[float | None, str]:
    if current is None or previous is None:
        return None, "not_enough_comparison"
    delta = current - previous
    if delta >= 0.40:
        label = "improved"
    elif delta <= -0.40:
        label = "regressing"
    elif previous < 2.0 and current >= 2.0:
        label = "emerging"
    else:
        label = "stable"
    return round(delta, 4), label


def _get_category_weights(
    cat_id: str,
    dim_ids: list[str],
    role_weights: dict[str, float],
) -> dict[str, float]:
    """Return weights for dimensions in this category.

    Role weights override defaults when present.
    """
    defaults = _DEFAULT_CATEGORY_WEIGHTS.get(cat_id, {})
    weights: dict[str, float] = {}
    for d in dim_ids:
        weights[d] = role_weights.get(d, defaults.get(d, 1.0 / len(dim_ids)))
    return weights


def _safe_float(val: object, *, default: float = 0.5) -> float:
    try:
        return max(0.0, min(1.0, float(val)))  # type: ignore[arg-type]
    except (TypeError, ValueError):
        return default


def _list_field(d: dict, key: str) -> list[str]:  # type: ignore[type-arg]
    val = d.get(key, [])
    if isinstance(val, list):
        return [str(v) for v in val]
    return []
