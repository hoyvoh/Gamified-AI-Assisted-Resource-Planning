"""Shared LLM subprocess runner — call CLI and parse JSON output."""

import asyncio
import json
import logging
import re

logger = logging.getLogger(__name__)

_MAX_RETRIES = 2


class LLMCallError(Exception):
    """Raised when an LLM CLI call fails after retries."""


async def call_llm(
    cli_tool: str,
    model: str,
    prompt: str,
    timeout_seconds: int = 120,
    max_retries: int = _MAX_RETRIES,
) -> dict | list:  # type: ignore[type-arg]
    """Call the LLM CLI with a prompt; return parsed JSON (dict or list).

    Retries up to max_retries times on transient failures (non-zero exit, parse error).
    Raises LLMCallError if all attempts fail.
    """
    last_error: str = ""
    for attempt in range(1, max_retries + 2):
        try:
            raw = await _run_subprocess(cli_tool, model, prompt, timeout_seconds)
            parsed = _parse_json(raw)
            if parsed is not None:
                return parsed
            last_error = f"Non-JSON output (first 200 chars): {raw[:200]}"
            logger.warning("LLM attempt %d/%d returned non-JSON", attempt, max_retries + 1)
        except TimeoutError:
            last_error = f"Timed out after {timeout_seconds}s"
            logger.warning("LLM attempt %d/%d timed out", attempt, max_retries + 1)
        except FileNotFoundError:
            raise LLMCallError(
                f"LLM CLI `{cli_tool}` not found on PATH. "
                "Install and authenticate it to enable analysis pipeline."
            ) from None
        except Exception as exc:
            last_error = str(exc)
            logger.warning("LLM attempt %d/%d failed: %s", attempt, max_retries + 1, exc)

    raise LLMCallError(
        f"LLM call failed after {max_retries + 1} attempts. Last error: {last_error}"
    )


async def _run_subprocess(
    cli_tool: str,
    model: str,
    prompt: str,
    timeout_seconds: int,
) -> str:
    cmd = [cli_tool, "--model", model, "-p", prompt]
    proc = await asyncio.create_subprocess_exec(
        *cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=timeout_seconds)
    if proc.returncode != 0:
        err = stderr.decode(errors="replace").strip()
        raise RuntimeError(f"CLI exited {proc.returncode}: {err[:300]}")
    return stdout.decode(errors="replace").strip()


def _parse_json(raw: str) -> dict | list | None:  # type: ignore[type-arg]
    """Strip markdown fences and parse JSON. Returns None on failure."""
    if not raw:
        return None
    stripped = re.sub(r"^```(?:json)?\s*", "", raw.strip(), flags=re.MULTILINE)
    stripped = re.sub(r"\s*```$", "", stripped.strip(), flags=re.MULTILINE)
    try:
        result = json.loads(stripped)
        return result if isinstance(result, (dict, list)) else None
    except json.JSONDecodeError:
        return None
