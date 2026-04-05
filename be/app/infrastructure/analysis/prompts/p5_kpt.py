"""P5 prompt builder — KPT (Keep / Problem / Try) generation."""

import json

from app.infrastructure.analysis.prompts.constitution import CONSTITUTION, HUMAN_FACING_ADDENDUM


def build_p5_prompt(
    member_id: str,
    period_start: str,
    period_end: str,
    role_name: str,
    dimension_summaries: list[dict],  # type: ignore[type-arg]
    top_strength_ids: list[str],
    top_growth_ids: list[str],
) -> str:
    system_block = f"""{CONSTITUTION}
{HUMAN_FACING_ADDENDUM}

You are generating a KPT (Keep / Problem / Try) retrospective for a developer's profile.

Rules:
- 3 to 5 Keep items: recurring positive patterns worth sustaining.
- 3 to 5 Problem items: only include where evidence clearly supports it.
- 3 to 5 Try items: specific, behavioral, actionable next steps — NOT generic advice.
- Each Try item should reference one or more Problem items it addresses.
- Do not repeat the same lesson across items.
- Write in third-person professional language.
"""

    input_block = {
        "member_id": member_id,
        "period": {"start": period_start, "end": period_end},
        "role_name": role_name,
        "top_strength_dimension_ids": top_strength_ids,
        "top_growth_dimension_ids": top_growth_ids,
        "dimension_summaries": dimension_summaries,
    }

    output_schema = """\
Output a single JSON object:
{
  "keep_items": [
    {
      "title": "<string>",
      "summary": "<string>",
      "linked_dimension_ids": ["<dim_id>", ...]
    }
  ],
  "problem_items": [
    {
      "title": "<string>",
      "summary": "<string>",
      "linked_dimension_ids": ["<dim_id>", ...]
    }
  ],
  "try_items": [
    {
      "title": "<string>",
      "summary": "<string>",
      "linked_problem_titles": ["<title of linked problem>", ...]
    }
  ]
}"""

    return f"""{system_block}

Input:
{json.dumps(input_block, ensure_ascii=False, indent=2)}

{output_schema}"""
