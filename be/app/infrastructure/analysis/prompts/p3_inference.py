"""P3 prompt builder — per-dimension skill inference."""

import json

from app.infrastructure.analysis.prompts.constitution import CONSTITUTION

# One-line descriptions per dimension for context injection
_DIMENSION_DESCRIPTIONS: dict[str, str] = {
    "implementation_reliability": (
        "Ability to execute technical work reliably, completing tasks correctly with minimal rework."
    ),
    "code_quality_discipline": (
        "Consistent practice of clean, maintainable, well-structured code."
    ),
    "debugging_root_cause": (
        "Skill at diagnosing the underlying cause of issues rather than just symptoms."
    ),
    "careless_mistake_control": (
        "Avoiding preventable mistakes through careful checking and attention to detail."
    ),
    "technical_ownership": (
        "Taking full ownership of technical decisions and deliverables from start to finish."
    ),
    "technical_learning_adaptability": (
        "Ability to learn new technologies and adapt to changing technical requirements."
    ),
    "backend_capability": (
        "Proficiency in server-side development, APIs, databases, and backend systems."
    ),
    "frontend_capability": (
        "Proficiency in UI development, frameworks, and browser-side engineering."
    ),
    "devops_delivery_capability": (
        "Skill with CI/CD, deployment, infrastructure, and delivery pipelines."
    ),
    "system_integration_capability": (
        "Ability to integrate disparate systems, APIs, and services effectively."
    ),
    "data_interface_handling": (
        "Handling data models, schemas, migrations, and data contracts correctly."
    ),
    "architecture_exposure": (
        "Engagement with system design decisions, trade-offs, and architectural thinking."
    ),
    "quality_mindset": (
        "Proactive attention to testing, code review, and overall product quality."
    ),
    "performance_awareness": (
        "Awareness of and action on performance bottlenecks and efficiency concerns."
    ),
    "security_awareness": ("Recognition and mitigation of security risks and vulnerabilities."),
    "maintainability_thinking": (
        "Writing and structuring code with future maintainability in mind."
    ),
    "risk_awareness": ("Identifying and communicating risks before they become problems."),
    "decision_hygiene": (
        "Making decisions with clear reasoning, documenting rationale, and avoiding ad hoc choices."
    ),
    "problem_solving": (
        "Structured approach to breaking down and solving complex technical problems."
    ),
    "self_management": ("Managing own time, priorities, and workload with minimal supervision."),
    "horenso_reporting_discipline": (
        "Proactive status reporting: Houkoku (report), Renraku (inform), Soudan (consult)."
    ),
    "user_first": ("Keeping the end user's needs and experience central to technical decisions."),
    "collaboration": (
        "Working effectively with teammates, sharing context, and contributing to team success."
    ),
    "mentoring_knowledge_support": (
        "Sharing knowledge, helping less experienced teammates, and contributing to team growth."
    ),
    "ai_leverage_ability": (
        "Effectively using AI tools to improve productivity without reducing quality."
    ),
}


def build_p3_prompt(
    dimension_id: str,
    role_profile_summary: str,
    baseline_summary: str,
    behavioral_events: list[dict],  # type: ignore[type-arg]
) -> str:
    """Build the P3 per-dimension inference prompt."""
    dim_desc = _DIMENSION_DESCRIPTIONS.get(dimension_id, dimension_id.replace("_", " ").title())

    system_block = f"""{CONSTITUTION}

You are a skill inference evaluator for developer profiling.
You are evaluating ONE skill dimension at a time.

Determine what is reasonably supported from the provided behavioral events.
Distinguish positive, negative, mixed, and insufficient evidence.
Identify repeated patterns — not isolated incidents.
Note limitations and uncertainty explicitly.
Avoid overclaiming.

Do not assign personality labels.
Do not assume capability from visibility.
Do not assume weakness from missing evidence.
"""

    input_block = {
        "dimension_id": dimension_id,
        "dimension_description": dim_desc,
        "role_profile_summary": role_profile_summary,
        "baseline_summary": baseline_summary,
        "behavioral_events": behavioral_events,
    }

    output_schema = """Output a single JSON object with this exact schema:
{
  "dimension_id": "<string>",
  "observed_pattern_summary": "<string — 1-3 sentences describing the dominant observed pattern>",
  "positive_indicators": ["<string>", ...],
  "development_indicators": ["<string>", ...],
  "counter_evidence_or_limitations": ["<string>", ...],
  "opportunity_assessment": {
    "label": "<none|low|medium|high>",
    "reason": "<string>"
  },
  "maturity_state": "<emerging|developing|reliable|strong|advanced|insufficient_evidence|insufficient_opportunity>",
  "confidence_label": "<low|moderate|high>",
  "confidence_score": <float 0.0-1.0>,
  "top_supporting_event_ids": ["<event_id>", ...],
  "top_counter_event_ids": ["<event_id>", ...]
}"""

    return f"""{system_block}

Input:
{json.dumps(input_block, ensure_ascii=False, indent=2)}

{output_schema}"""
