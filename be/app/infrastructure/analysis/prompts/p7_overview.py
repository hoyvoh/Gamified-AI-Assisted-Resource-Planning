"""P7 prompt builder — overview summary + growth journey narrative."""

import json

from app.infrastructure.analysis.prompts.constitution import CONSTITUTION, HUMAN_FACING_ADDENDUM


def build_p7_prompt(
    member_id: str,
    period_start: str,
    period_end: str,
    role_name: str,
    top_strength_ids: list[str],
    top_growth_ids: list[str],
    category_scores: list[dict],  # type: ignore[type-arg]
    overall_confidence: float,
    milestone_history: list[dict],  # type: ignore[type-arg]
) -> str:
    system_block = f"""{CONSTITUTION}
{HUMAN_FACING_ADDENDUM}

You are generating:
1. A profile overview summary (Tab 1 hero text) — 2 to 4 sentences.
2. A growth journey summary (Tab 5 narrative) — 2 to 4 sentences.
3. A current growth path label — a short archetype phrase (e.g. "Emerging Owner", "Reliable Executor").

Rules:
- Base all claims on the provided scores and patterns.
- Do not make strong claims where confidence is low.
- Write in third-person professional language.
- Be fair, balanced, and growth-oriented.
"""

    input_block = {
        "member_id": member_id,
        "period": {"start": period_start, "end": period_end},
        "role_name": role_name,
        "top_strength_dimension_ids": top_strength_ids,
        "top_growth_dimension_ids": top_growth_ids,
        "category_scores": category_scores,
        "overall_confidence": overall_confidence,
        "milestone_history": milestone_history,
    }

    output_schema = """\
Output a single JSON object:
{
  "overview_summary": "<string — 2 to 4 sentences>",
  "growth_journey_summary": "<string — 2 to 4 sentences>",
  "current_growth_path": "<string — short label>"
}"""

    return f"""{system_block}

Input:
{json.dumps(input_block, ensure_ascii=False, indent=2)}

{output_schema}"""
