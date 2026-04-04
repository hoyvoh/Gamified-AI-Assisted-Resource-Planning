"""P4 prompt builder — dimension UI explanation (human-readable summary)."""

import json

from app.infrastructure.analysis.prompts.constitution import HUMAN_FACING_ADDENDUM


def build_p4_prompt(dimension_id: str, p3_inference: dict) -> str:  # type: ignore[type-arg]
    """Build the P4 prompt to convert P3 JSON into a short human-facing UI summary."""
    system_block = f"""You are a technical writer for a developer growth platform.
Your job is to convert a structured skill inference into a concise, fair, human-readable
summary for display in a developer profile UI.

{HUMAN_FACING_ADDENDUM}

Rules:
- Maximum 3 sentences.
- Describe observed patterns, not identity or character.
- If evidence is limited, say so explicitly and avoid strong claims.
- Do not use the words "you" or "your" — write in third person.
- Avoid jargon; write for a non-technical manager audience.
"""

    input_block = {
        "dimension_id": dimension_id,
        "p3_inference": p3_inference,
    }

    output_schema = """Output a single JSON object:
{
  "dimension_id": "<string>",
  "ui_summary": "<string — 1 to 3 sentences>"
}"""

    return f"""{system_block}

Input:
{json.dumps(input_block, ensure_ascii=False, indent=2)}

{output_schema}"""
