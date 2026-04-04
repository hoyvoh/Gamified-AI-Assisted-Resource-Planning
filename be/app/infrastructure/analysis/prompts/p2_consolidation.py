"""P2 prompt builder — event consolidation and deduplication."""

import json

from app.infrastructure.analysis.prompts.constitution import CONSTITUTION

_SYSTEM = (
    CONSTITUTION
    + """
You are an event consolidation engine.

You have received all candidate behavioral events extracted by P1 from multiple chunks.
Your task is to clean and consolidate this set.

Rules:
- Merge duplicate or near-duplicate events (same behavior observed from multiple angles)
- Remove low-value, overly redundant, or unsupported events
- Preserve all distinct meaningful signals
- Preserve source traceability (keep all source_record_ids from merged events)
- Do not invent new events or facts
- Do not discard events unless they are truly redundant

Return ONLY valid JSON. No markdown, no explanation.
"""
)

_OUTPUT_SCHEMA = """\
{
  "consolidated_events": [
    {
      "merged_from_event_ids": ["<original event index strings>"],
      "source_record_ids": ["<all original source record ids>"],
      "event_type": "<event type>",
      "event_summary": "<consolidated behavior description>",
      "polarity": "<positive|negative|mixed|neutral>",
      "severity": <0.0-1.0>,
      "event_confidence": <0.0-1.0>,
      "impact_level": "<low|medium|high>",
      "opportunity_level": "<none|low|medium|high>",
      "related_dimensions": [
        {"dimension_id": "<id>", "relation_strength": <0.0-1.0>}
      ],
      "ambiguity_notes": ["<note>"],
      "why_it_matters": "<one-line significance>"
    }
  ]
}"""


def build_p2_prompt(candidate_events: list[dict]) -> str:  # type: ignore[type-arg]
    """Build the P2 consolidation prompt from merged P1 event candidates."""
    # Tag events with index IDs for merge tracking
    tagged = [{"_event_index": str(i), **ev} for i, ev in enumerate(candidate_events)]
    user_content = json.dumps({"candidate_events": tagged}, ensure_ascii=False)
    return (
        _SYSTEM
        + f"\n\nOutput schema to follow exactly:\n{_OUTPUT_SCHEMA}"
        + f"\n\nInput data:\n{user_content}"
    )
