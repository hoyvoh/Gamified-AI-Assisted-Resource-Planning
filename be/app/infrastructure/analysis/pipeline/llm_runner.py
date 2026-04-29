"""Shared LLM runner — call the configured agent CLI provider and parse JSON output."""

import json
import re

from app.infrastructure.agent_cli.base import (
    AgentCliProvider,
    AgentCliTimeoutError,
    AgentCliUnavailableError,
)
from app.logger import get_logger

logger = get_logger(__name__)

_MAX_RETRIES = 2


class LLMCallError(Exception):
    """Raised when an LLM CLI call fails after retries."""


async def call_llm(
    provider: AgentCliProvider,
    model: str,
    prompt: str,
    timeout_seconds: int = 120,
    max_retries: int = _MAX_RETRIES,
) -> dict | list:  # type: ignore[type-arg]
    """Call the LLM CLI with a prompt; return parsed JSON (dict or list).

    Retries up to max_retries times on transient failures (non-zero exit, parse error).
    Raises LLMCallError if all attempts fail.
    """
    logger.debug(
        "LLM call starting: tool=%s model=%s timeout=%ds retries=%d prompt_len=%d\nPROMPT>>>\n%s\n<<<",
        provider.name,
        model,
        timeout_seconds,
        max_retries,
        len(prompt),
        prompt[:2000],
    )

    last_error: str = ""
    for attempt in range(1, max_retries + 2):
        logger.debug(
            "LLM attempt %d/%d: tool=%s model=%s",
            attempt,
            max_retries + 1,
            provider.name,
            model,
        )
        try:
            raw = await provider.run_prompt(prompt, model, timeout_seconds)
            logger.debug(
                "LLM attempt %d/%d raw response (len=%d):\n%s",
                attempt,
                max_retries + 1,
                len(raw),
                raw[:1000],
            )
            parsed = _parse_json(raw)
            if parsed is not None:
                logger.debug(
                    "LLM attempt %d/%d parsed OK: type=%s keys=%s",
                    attempt,
                    max_retries + 1,
                    type(parsed).__name__,
                    list(parsed.keys()) if isinstance(parsed, dict) else f"[{len(parsed)} items]",
                )
                return parsed
            last_error = f"Non-JSON output (first 200 chars): {raw[:200]}"
            logger.warning(
                "LLM attempt %d/%d returned non-JSON: %s", attempt, max_retries + 1, raw[:200]
            )
        except AgentCliTimeoutError:
            last_error = f"Timed out after {timeout_seconds}s"
            logger.warning(
                "LLM attempt %d/%d timed out after %ds", attempt, max_retries + 1, timeout_seconds
            )
        except AgentCliUnavailableError:
            # On Windows, concurrent subprocess spawns can transiently fail with
            # FileNotFoundError even when the executable exists on PATH.
            # Retry on all attempts except the last; only then treat it as permanent.
            if attempt == max_retries + 1:
                raise LLMCallError(
                    f"LLM CLI `{provider.name}` not found on PATH. "
                    "Install and authenticate it to enable analysis pipeline."
                ) from None
            last_error = f"CLI `{provider.name}` not found (transient, will retry)"
            logger.warning(
                "LLM attempt %d/%d FileNotFoundError for '%s' — likely transient on Windows, retrying",
                attempt,
                max_retries + 1,
                provider.name,
            )
        except Exception as exc:
            last_error = str(exc)
            logger.warning("LLM attempt %d/%d failed: %s", attempt, max_retries + 1, exc)

    raise LLMCallError(
        f"LLM call failed after {max_retries + 1} attempts. Last error: {last_error}"
    )


def _parse_json(raw: str) -> dict | list | None:  # type: ignore[type-arg]
    """Extract and parse JSON from LLM output. Returns None on failure.

    Handles:
    - Bare JSON
    - JSON wrapped in ```json ... ``` fences
    - Preamble text before the code block (e.g. "Here is the result:\\n\\n```json")
    """
    if not raw:
        return None

    # 1. Try direct parse first (bare JSON output)
    try:
        result = json.loads(raw.strip())
        if isinstance(result, (dict, list)):
            return result
    except json.JSONDecodeError:
        pass

    # 2. Extract the innermost ```json ... ``` block (handles preamble text)
    fence_match = re.search(r"```(?:json)?\s*\n(.*?)\n\s*```", raw, flags=re.DOTALL)
    if fence_match:
        try:
            result = json.loads(fence_match.group(1).strip())
            if isinstance(result, (dict, list)):
                return result
        except json.JSONDecodeError:
            pass

    # 3. Fallback: find the first { or [ and try to parse from there
    for start_char, end_char in (("{", "}"), ("[", "]")):
        idx = raw.find(start_char)
        if idx != -1:
            ridx = raw.rfind(end_char)
            if ridx > idx:
                try:
                    result = json.loads(raw[idx : ridx + 1])
                    if isinstance(result, (dict, list)):
                        return result
                except json.JSONDecodeError:
                    pass

    return None
