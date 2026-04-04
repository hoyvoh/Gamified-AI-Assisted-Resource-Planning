"""P6 prompt builder — case-based feedback generation."""

import json

from app.infrastructure.analysis.prompts.constitution import CONSTITUTION, HUMAN_FACING_ADDENDUM


def build_p6_prompt(
    member_id: str,
    period_start: str,
    period_end: str,
    role_name: str,
    behavioral_events: list[dict],  # type: ignore[type-arg]
    dimension_summaries: list[dict],  # type: ignore[type-arg]
    top_growth_ids: list[str],
) -> str:
    system_block = f"""{CONSTITUTION}
{HUMAN_FACING_ADDENDUM}

You are generating case-based feedback for a developer growth profile.

Select 3 to 8 behavioral cases with high learning value.
Include both positive examples and corrective examples.
Each case must be concrete, grounded in the evidence, and actionable.
Avoid repeating the same lesson across cases.
Write in third-person professional language.
"""

    input_block = {
        "member_id": member_id,
        "period": {"start": period_start, "end": period_end},
        "role_name": role_name,
        "top_growth_dimension_ids": top_growth_ids,
        "dimension_summaries": dimension_summaries,
        "behavioral_events": behavioral_events[:60],  # cap to avoid token overflow
    }

    output_schema = """\
Output a single JSON object:
{
  "cases": [
    {
      "title": "<string>",
      "category": "<string — short category label>",
      "impact_level": "<low|medium|high>",
      "summary": "<string>",
      "why_it_matters": "<string>",
      "observed_pattern": "<string>",
      "better_alternative": "<string>",
      "next_time_guidance": "<string>",
      "linked_dimension_ids": ["<dim_id>", ...],
      "supporting_event_ids": ["<event_id>", ...]
    }
  ]
}"""

    return f"""{system_block}

Input:
{json.dumps(input_block, ensure_ascii=False, indent=2)}

{output_schema}"""
