"""P8 prompt builder — self-critique / overclaim check."""

import json

from app.infrastructure.analysis.prompts.constitution import CONSTITUTION


def build_p8_prompt(
    run_id: str,
    dimension_scores: list[dict],  # type: ignore[type-arg]
    profile_summary: str | None,
    growth_journey_summary: str | None,
    overall_confidence: float,
) -> str:
    """Build the P8 self-critique prompt.

    P8 reads all human-facing text already generated (P4 ui_summaries, P7 overview/journey)
    and flags any overclaims, unsupported assertions, or unfair language.
    Returns approved=true when no actionable issues are found.
    """
    system_block = f"""{CONSTITUTION}

You are performing a self-critique pass on AI-generated developer profile text.

Your role:
1. Read each piece of human-facing text produced by this analysis pipeline.
2. Identify any overclaims, unsupported assertions, absolute statements, or unfair language.
3. For each issue, provide a recommended replacement that is more cautious and evidence-based.
4. Approve the output if no actionable issues remain (or only minor style issues exist).

What counts as an issue:
- Claiming certainty where confidence is low (e.g., "clearly demonstrates" when confidence < 0.5)
- Absolute negative statements without hedging (e.g., "fails to", "never", "always struggles")
- Identity or personality claims (e.g., "is not a team player") rather than behavioral patterns
- Inferences not grounded in the provided scores or events
- Promises about future performance

What does NOT count as an issue:
- Appropriate hedged language ("appears to", "suggests", "in this period")
- Mentioning insufficient evidence as a limitation
- Factual references to scores or maturity levels

Be conservative: only flag text that could genuinely mislead a reader or harm a subject.
"""

    dim_texts = [
        {
            "dimension_id": d.get("dimension_id"),
            "maturity_level": d.get("maturity_level"),
            "confidence_score": d.get("confidence_score"),
            "ui_summary": d.get("ui_summary"),
        }
        for d in dimension_scores
        if d.get("ui_summary")
    ]

    input_block = {
        "run_id": run_id,
        "overall_confidence": overall_confidence,
        "profile_summary": profile_summary,
        "growth_journey_summary": growth_journey_summary,
        "dimension_ui_summaries": dim_texts,
    }

    output_schema = """\
Output a single JSON object:
{
  "approved": true,
  "issues": []
}
or, if issues are found:
{
  "approved": false,
  "issues": [
    {
      "field": "<'ui_summary' | 'profile_summary' | 'growth_journey_summary'>",
      "dimension_id": "<dimension_id if field is ui_summary, else null>",
      "severity": "<'low' | 'medium' | 'high'>",
      "current_text": "<the exact problematic text>",
      "reason": "<one-sentence explanation of the problem>",
      "recommended_fix": "<replacement text that is accurate and hedged>"
    }
  ]
}

Only include issues where 'recommended_fix' meaningfully improves the text.
If no fixes are needed, set approved=true and issues=[]."""

    return f"""{system_block}

Input:
{json.dumps(input_block, ensure_ascii=False, indent=2)}

{output_schema}"""
