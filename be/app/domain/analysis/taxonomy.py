"""Canonical dimension IDs and category groupings (Taxonomy v1.0)."""

# 25 dimensions across 4 categories
DIMENSIONS: dict[str, str] = {
    # Group A — Core Technical Execution
    "implementation_reliability": "A1",
    "code_quality_discipline": "A2",
    "debugging_root_cause": "A3",
    "careless_mistake_control": "A4",
    "technical_ownership": "A5",
    "technical_learning_adaptability": "A6",
    # Group B — Technical Depth & Breadth
    "backend_capability": "B1",
    "frontend_capability": "B2",
    "devops_delivery_capability": "B3",
    "system_integration_capability": "B4",
    "data_interface_handling": "B5",
    "architecture_exposure": "B6",
    # Group C — Engineering Mindset
    "quality_mindset": "C1",
    "performance_awareness": "C2",
    "security_awareness": "C3",
    "maintainability_thinking": "C4",
    "risk_awareness": "C5",
    "decision_hygiene": "C6",
    # Group D — Collaboration & Growth
    "problem_solving": "D1",
    "self_management": "D2",
    "horenso_reporting_discipline": "D3",
    "user_first": "D4",
    "collaboration": "D5",
    "mentoring_knowledge_support": "D6",
    "ai_leverage_ability": "D7",
}

DIMENSION_IDS: frozenset[str] = frozenset(DIMENSIONS)

CATEGORIES: dict[str, list[str]] = {
    "core_technical_execution": [
        "implementation_reliability",
        "code_quality_discipline",
        "debugging_root_cause",
        "careless_mistake_control",
        "technical_ownership",
        "technical_learning_adaptability",
    ],
    "technical_depth_breadth": [
        "backend_capability",
        "frontend_capability",
        "devops_delivery_capability",
        "system_integration_capability",
        "data_interface_handling",
        "architecture_exposure",
    ],
    "engineering_mindset": [
        "quality_mindset",
        "performance_awareness",
        "security_awareness",
        "maintainability_thinking",
        "risk_awareness",
        "decision_hygiene",
    ],
    "collaboration_growth": [
        "problem_solving",
        "self_management",
        "horenso_reporting_discipline",
        "user_first",
        "collaboration",
        "mentoring_knowledge_support",
        "ai_leverage_ability",
    ],
}

VALID_EVENT_TYPES: frozenset[str] = frozenset(
    {
        "task_ownership",
        "delivery_completion",
        "clarification",
        "handoff",
        "review_feedback",
        "mistake_correction",
        "root_cause_analysis",
        "quality_check",
        "risk_awareness",
        "user_consideration",
        "support_given",
        "support_received",
        "status_reporting",
        "decision_reasoning",
        "learning_adaptation",
        "integration_handling",
        "delivery_awareness",
        "architecture_reasoning",
        "ai_usage_pattern",
    }
)

VALID_POLARITIES: frozenset[str] = frozenset({"positive", "negative", "mixed", "neutral"})
VALID_IMPACT_LEVELS: frozenset[str] = frozenset({"low", "medium", "high"})
VALID_OPPORTUNITY_LEVELS: frozenset[str] = frozenset({"none", "low", "medium", "high"})
VALID_MATURITY_LEVELS: frozenset[str] = frozenset(
    {
        "emerging",
        "developing",
        "reliable",
        "strong",
        "advanced",
        "insufficient_evidence",
        "insufficient_opportunity",
    }
)
