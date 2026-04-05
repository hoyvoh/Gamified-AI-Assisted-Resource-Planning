"""Shared LLM subprocess runner — call CLI and parse JSON output."""

import asyncio
import json
import re

from app.logger import get_logger

logger = get_logger(__name__)

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
    logger.debug(
        "LLM call starting: tool=%s model=%s timeout=%ds retries=%d prompt_len=%d\nPROMPT>>>\n%s\n<<<",
        cli_tool,
        model,
        timeout_seconds,
        max_retries,
        len(prompt),
        prompt[:2000],
    )

    last_error: str = ""
    for attempt in range(1, max_retries + 2):
        logger.debug(
            "LLM attempt %d/%d: tool=%s model=%s", attempt, max_retries + 1, cli_tool, model
        )
        try:
            raw = await _run_subprocess(cli_tool, model, prompt, timeout_seconds)
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
        except TimeoutError:
            last_error = f"Timed out after {timeout_seconds}s"
            logger.warning(
                "LLM attempt %d/%d timed out after %ds", attempt, max_retries + 1, timeout_seconds
            )
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
