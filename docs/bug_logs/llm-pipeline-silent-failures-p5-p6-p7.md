# Lesson Learned: Silent P5/P6/P7 failures leaving KPT, Cases, Overview empty

**Date:** 2026-04-05  
**Affected area:** `be/app/infrastructure/analysis/pipeline/output_runner.py`, `llm_runner.py`  
**Severity:** Silent data loss — run completes successfully but KPT/Cases/Overview tabs are empty

---

## 1. The Observed Symptom

After a completed analysis run, the KPT tab showed "Keep (0) / Problem (0) / Try (0)" and the Cases tab showed "0 cases". The Overview tab also had empty `profile_summary` and `growth_journey_summary`. The run was `status=completed`, `progress_pct=100`, `error_message=null`.

Querying the DB confirmed the tables were empty:

```sql
SELECT COUNT(*) FROM kpt_items    WHERE analysis_run_id = '<run_id>';  -- 0
SELECT COUNT(*) FROM case_feedbacks WHERE analysis_run_id = '<run_id>'; -- 0
SELECT profile_summary FROM analysis_snapshots WHERE analysis_run_id = '<run_id>'; -- NULL
```

Yet `dimension_scores` had 2 rows (with `ui_summary` populated), and `behavioral_events` had 26 rows. Phases P1–P4 succeeded; P5/P6/P7 all failed silently.

---

## 2. Two Independent Bugs

---

### Bug A — Windows concurrent subprocess spawning fails with FileNotFoundError

**Root cause:**

`run_output_generation` runs P5, P6, and P7 concurrently:

```python
kpt_items, cases, p7_result = await asyncio.gather(
    _run_p5(...),
    _run_p6(...),
    _run_p7(...),
)
```

Each of these calls `call_llm(...)` which calls `_run_subprocess(...)`, which calls `asyncio.to_thread(subprocess.run, ["claude", ...])`. On Windows, when multiple threads attempt to spawn subprocesses simultaneously via `CreateProcess`, some calls transiently fail with `FileNotFoundError` — even when the executable (`claude`) is valid and on PATH.

The original `call_llm` code treated `FileNotFoundError` as permanent ("CLI not installed") and raised immediately without retrying:

```python
# Before — no retry on FileNotFoundError
except FileNotFoundError:
    raise LLMCallError(
        f"LLM CLI `{cli_tool}` not found on PATH..."
    ) from None
```

P6 (largest prompt) hit this error in the concurrent batch. `_run_p6` caught `LLMCallError` and returned `[]`. Since `if cases:` is False, `case_repo.replace_for_run` was never called.

**Evidence:** Running P6 in isolation (sequential) succeeded and returned 7 cases. The failure only occurred when P5, P6, P7 ran simultaneously.

**Fix (`llm_runner.py`):**

```python
except FileNotFoundError:
    # Transient on Windows under concurrent subprocess load — retry all except last attempt
    if attempt == max_retries + 1:
        raise LLMCallError(f"LLM CLI `{cli_tool}` not found on PATH...") from None
    last_error = f"CLI `{cli_tool}` not found (transient, will retry)"
    logger.warning("FileNotFoundError for '%s' — likely transient on Windows, retrying", cli_tool)
```

---

### Bug B — LLM preamble text before JSON code block breaks `_parse_json`

**Root cause:**

The LLM sometimes prefixes its response with explanatory text before the JSON code block:

```
Here is the analysis:

```json
{
  "overview_summary": "..."
}
```
```

The old `_parse_json` used line-anchored regex substitution:

```python
stripped = re.sub(r"^```(?:json)?\s*", "", raw.strip(), flags=re.MULTILINE)
stripped = re.sub(r"\s*```$", "", stripped.strip(), flags=re.MULTILINE)
```

With preamble text present, the first regex removes the opening fence from its line, but "Here is the analysis:\n\n" still precedes the `{`, making the result invalid JSON.

P7 failed on attempts 1 and 2 ("LLM attempt returned non-JSON"), then succeeded on attempt 3 when the LLM happened to return bare JSON. Attempts 1 and 2 contained the preamble pattern.

**Fix (`llm_runner.py`):**

Replaced the regex approach with a 3-tier parser:

```python
def _parse_json(raw):
    # 1. Direct parse (bare JSON)
    try:
        return json.loads(raw.strip())
    except json.JSONDecodeError:
        pass

    # 2. Extract innermost ```json ... ``` block (handles preamble text)
    fence_match = re.search(r"```(?:json)?\s*\n(.*?)\n\s*```", raw, flags=re.DOTALL)
    if fence_match:
        try:
            return json.loads(fence_match.group(1).strip())
        except json.JSONDecodeError:
            pass

    # 3. Fallback: find first { } or [ ] pair
    for start, end in (("{", "}"), ("[", "]")):
        idx, ridx = raw.find(start), raw.rfind(end)
        if ridx > idx >= 0:
            try:
                return json.loads(raw[idx:ridx+1])
            except json.JSONDecodeError:
                pass

    return None
```

---

## 3. Why the Run Still Completed

Both bugs are caught internally before propagating:

```
call_llm() → raises LLMCallError
    └─ _run_p5/p6/p7: except LLMCallError → return [] or (None, None, None)
            └─ asyncio.gather completes normally (no exception propagates)
                    └─ if kpt_items: → False → kpt_repo.replace_for_run never called
                            └─ run proceeds to snapshot and completion
```

The design is intentional: P5/P6/P7 failures leave those sections empty but don't fail the whole run. The issue is that these failures were invisible — no banner, no DB marker.

---

## 4. Recovery

Used `scripts/regenerate_output.py` to re-run the output generation phase for the stuck run (since deleted after use). Run P5/P6/P7 in isolation (sequential) against the existing behavioral events — all succeeded.

---

## 5. Rules Added

### Rule: `asyncio.gather` with LLM subprocesses — expect transient FileNotFoundError on Windows

When P4, P5, P6, P7 fire concurrently (or any group of ≥3 simultaneous LLM subprocess calls on Windows), some may transiently fail with `FileNotFoundError`. **Always retry on FileNotFoundError** — treat it the same as a transient subprocess failure, not as "CLI missing".

### Rule: Never parse LLM JSON with line-anchored regex only

LLMs frequently add preamble or postamble text around code blocks. A regex that only strips ` ``` ` fences fails when the JSON is embedded mid-response. Use `re.search(..., flags=re.DOTALL)` to extract the inner block, not `re.sub` on the full string.

### Rule: Silent P5/P6/P7 failure is not easily detectable post-run

There is no DB column that explicitly marks "P5 failed". The only signal is `kpt_items = 0` or `case_feedbacks = 0` on a completed run. If these are empty and the run succeeded, check server logs for "P5/P6 failed for run" warnings.
