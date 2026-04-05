"""P1 prompt builder — evidence/event extraction from raw source records."""

import json

from app.infrastructure.analysis.prompts.constitution import CONSTITUTION

_SYSTEM = (
    CONSTITUTION
    + """
You are an evidence extraction engine for developer work-pattern analysis.

Extract only behaviorally meaningful evidence related to how a developer works.
You may extract zero, one, or multiple behavioral events from a record set.

Do NOT extract:
- Acknowledgements or empty replies
- Empty status pings ("ok", "got it", "thanks")
- Generic praise without specifics
- Administrative chatter unrelated to work patterns

Each extracted event must:
- Be grounded in the provided text (quote or paraphrase the source)
- Describe concrete observed behavior
- Include confidence and ambiguity notes
- Map only to relevant dimension IDs from the taxonomy

Valid event types:
task_ownership | delivery_completion | clarification | handoff
review_feedback | mistake_correction | root_cause_analysis | quality_check
risk_awareness | user_consideration | support_given | support_received
status_reporting | decision_reasoning | learning_adaptation
integration_handling | delivery_awareness | architecture_reasoning | ai_usage_pattern

Valid polarity values: positive | negative | mixed | neutral
Valid impact_level values: low | medium | high
Valid opportunity_level values: none | low | medium | high

Return ONLY valid JSON. No markdown, no explanation.
"""
)

_OUTPUT_SCHEMA = """\
{
  "events": [
    {
      "source_record_ids": ["<id from input>"],
      "event_type": "<one of the valid event types>",
      "event_summary": "<concrete description of the observed behavior>",
      "polarity": "<positive|negative|mixed|neutral>",
      "severity": <0.0-1.0 float>,
      "event_confidence": <0.0-1.0 float>,
      "impact_level": "<low|medium|high>",
      "opportunity_level": "<none|low|medium|high>",
      "related_dimensions": [
        {"dimension_id": "<dimension_id>", "relation_strength": <0.0-1.0>}
      ],
      "ambiguity_notes": ["<note if any>"],
      "why_it_matters": "<one-line behavioral significance>"
    }
  ]
}"""


def build_p1_prompt(
    member_id: str,
    role_name: str,
    period_start: str,
    period_end: str,
    records: list[dict],  # type: ignore[type-arg]
) -> str:
    """Build the full P1 extraction prompt for a chunk of raw records."""
    user_content = json.dumps(
        {
            "member_id": member_id,
            "role_name": role_name,
            "period": {"start_date": period_start, "end_date": period_end},
            "raw_records": records,
        },
        ensure_ascii=False,
    )
    return (
        _SYSTEM
        + f"\n\nOutput schema to follow exactly:\n{_OUTPUT_SCHEMA}"
        + f"\n\nInput data:\n{user_content}"
    )
