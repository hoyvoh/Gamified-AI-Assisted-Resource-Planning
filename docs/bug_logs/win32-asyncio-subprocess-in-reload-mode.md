# Lesson Learned: Win32 asyncio subprocess in uvicorn reload mode

**Date:** 2026-04-05  
**Affected area:** `be/app/infrastructure/collectors/` — GitHub + LLM-MCP data collectors  
**Severity:** Silent total failure of all data collection on Windows in dev mode

---

## 1. The Context — Observed Phenomenon

During local development the analysis pipeline was triggered for a member (`Ho Vy / hoyvoh`).
The UI showed:

```
◎ No Data
Collection failed: No data collected from any source.
Details: github: ...; mcp: ...
```

Running the same GitHub queries manually worked perfectly:

```bash
# Works fine in the terminal:
gh auth status          # ✓ Logged in to github.com
gh search commits --author hoyvoh ...   # ✓ Returns 100 commits
```

The API call to trigger analysis returned HTTP 202 immediately (background task accepted).
The run then transitioned from `collecting` → `failed` with a misleading error message:

```
GitHub CLI not authenticated. Run `gh auth login` on the host machine.
```

But `gh auth login` had already been done. Re-running the analysis produced the same failure every time.

---

## 2. Tracing the Bug — Step by Step

### Step 1 — Read the error at face value (wrong path)

Initial hypothesis: `external_id` stored as `gh:hoyvoh` with a prefix was being passed to `gh` CLI verbatim.

Checked DB — `external_id = 'hoyvoh'` (no prefix). Dead end. Reverted.

### Step 2 — Check what data actually reached the DB

Queried `source_payloads` table for the failing run:

```sql
SELECT source_type, collection_status, record_count, error_message
FROM source_payloads
WHERE analysis_run_id = '<run_id>';
```

Result: **no rows**. The payload was never persisted — meaning the collector result never made it back to the runner at all.

### Step 3 — Add exception materialisation to runner.py

`asyncio.gather(return_exceptions=True)` returns exceptions as values in the result list.
The original runner code was:

```python
for batch in [gh_results, mcp_results]:
    if isinstance(batch, list):
        results.extend(batch)
    elif isinstance(batch, Exception):
        logger.warning("Collector raised unexpected error: %s", batch)
        # ← silently dropped; no CollectionResult created
```

An exception from the collector would be logged but never persisted as a payload.
The `collected_results` list was empty → `if not collected_results: → mark_failed("No data collected")`.

Fixed: exceptions are now materialised as `CollectionResult(status="failed")` objects so they are stored in the DB and surfaced in the error message.

### Step 4 — Re-run and read the actual error

After the fix the stored `error_message` read:

```
NotImplementedError:
```

`NotImplementedError` with an empty message. That is the signature of the Windows asyncio subprocess error.

### Step 5 — Read uvicorn's event loop factory

```python
# be/.venv/Lib/site-packages/uvicorn/loops/asyncio.py
def asyncio_loop_factory(use_subprocess: bool = False):
    if sys.platform == "win32" and not use_subprocess:
        return asyncio.ProactorEventLoop
    return asyncio.SelectorEventLoop   # ← returned when use_subprocess=True
```

uvicorn `--reload` sets `use_subprocess=True` (it spawns a child watcher process) which causes it to return `SelectorEventLoop` **even on Windows**.

`SelectorEventLoop` does **not** support subprocess creation on Win32. Calling `asyncio.create_subprocess_exec(...)` inside it raises:

```
NotImplementedError
```

### Step 6 — Confirm the causal chain

```
uvicorn --reload
  └─ use_subprocess=True
       └─ asyncio_loop_factory → SelectorEventLoop   (Win32)
            └─ BackgroundTask: run_analysis_job()
                 └─ gh.check_auth()
                      └─ asyncio.create_subprocess_exec("gh", "auth", "status")
                           └─ NotImplementedError  ← BOOM
```

---

## 3. Shell Scripts Used and Results

### Verify gh CLI works outside asyncio

```python
# run_direct.py — run with plain asyncio.run() (ProactorEventLoop on Win32)
import asyncio
from app.infrastructure.collectors.github import GitHubCollector

async def main():
    gh = GitHubCollector()
    result = await gh.collect("hoyvoh", "2025-10-01", "2026-04-05")
    print(result.status, result.record_count)

asyncio.run(main())   # uses ProactorEventLoop by default on Win32
```

**Result:**
```
collected 142
```

✓ Confirms the collector logic is correct. The problem is **only in the server context**.

### Confirm the server uses SelectorEventLoop

```python
# diagnosis snippet added temporarily to runner.py
import asyncio
loop = asyncio.get_event_loop()
logger.info("Event loop type: %s", type(loop).__name__)
```

**Server log output:**
```
Event loop type: SelectorEventLoop
```

**Direct asyncio.run() output:**
```
Event loop type: ProactorEventLoop
```

### Pipeline log after fix (background task, server running with --reload)

```
INFO  GitHub collection starting: handle=hoyvoh period=2025-10-01 to 2026-04-05
INFO  GitHub authored_prs: 41 records for hoyvoh
INFO  GitHub reviewed_prs: 1 records for hoyvoh
INFO  GitHub commits: 100 records for hoyvoh
INFO  Collection complete: sources=2 total_records=142 collected_sources=1
INFO  P1: total_records=142 chunks=8
...
INFO  Analysis run completed
```

✓ 142 records collected, pipeline ran end-to-end.

---

## 4. The Bug Explained

### The event loop mismatch

```
Windows asyncio event loop types
─────────────────────────────────────────────────────────
ProactorEventLoop   ← default on Win32 (asyncio.run())
  ✓ supports subprocesses
  ✓ supports pipes
  ✓ I/O Completion Ports (IOCP)

SelectorEventLoop   ← used by select/poll (Linux default)
  ✗ does NOT support subprocesses on Win32
  ✗ asyncio.create_subprocess_exec() → NotImplementedError
```

### How uvicorn --reload triggers the wrong loop

```
                    uvicorn startup
                         │
            ┌────────────┴────────────┐
            │ --reload flag?          │
            │                         │
           Yes                        No
            │                         │
   use_subprocess=True       use_subprocess=False
            │                         │
   SelectorEventLoop ◄────────────    ProactorEventLoop
   (Win32 broken)           │          (Win32 correct)
                            │
               asyncio_loop_factory() in uvicorn
```

### Why the error was invisible

Three layers of cover-up stacked on top of each other:

```
Layer 1 — check_auth() swallowed NotImplementedError
──────────────────────────────────────────────────────
asyncio.create_subprocess_exec()
    → NotImplementedError
        → caught by: except (TimeoutError, OSError, Exception)
            → logged as "gh auth check failed"
            → returned False
            → collect() returned CollectionResult(status="skipped",
                error_message="GitHub CLI not authenticated")
                                    ↑
                         USER SEES THIS MISLEADING MESSAGE

Layer 2 — runner swallowed the whole collector exception
──────────────────────────────────────────────────────────
asyncio.gather(return_exceptions=True) → [NotImplementedError, ...]
    → isinstance(batch, Exception): True
    → logger.warning(...)
    → No CollectionResult created
    → collected_results = []
    → error: "No data collected from any source"

Layer 3 — no payload row in DB
──────────────────────────────────────────────────────────
Because the CollectionResult was never created, no source_payload
row was written. Diagnostic query returned 0 rows, hiding the
error from any post-hoc investigation.
```

### The fix

Replace `asyncio.create_subprocess_exec` (event-loop-bound) with `asyncio.to_thread(subprocess.run, ...)` (thread-pool-based, loop-agnostic):

```
Before (broken on SelectorEventLoop):
──────────────────────────────────────
asyncio.create_subprocess_exec("gh", ...)
    │
    └─ requires ProactorEventLoop on Win32
         NotImplementedError if SelectorEventLoop

After (works on any loop):
──────────────────────────
asyncio.to_thread(subprocess.run, ["gh", ...])
    │
    └─ runs subprocess.run() in a ThreadPoolExecutor worker thread
         ✓ subprocess.run is blocking (no loop dependency)
         ✓ works regardless of which asyncio loop type is active
         ✓ asyncio.to_thread only needs the loop to schedule the thread
```

### Code change summary

```python
# base.py — new shared helper
async def run_subprocess(*args: str, timeout: float) -> tuple[int, bytes, bytes]:
    def _run():
        r = subprocess.run(list(args), capture_output=True, timeout=timeout)
        return r.returncode, r.stdout, r.stderr
    return await asyncio.to_thread(_run)

# github.py / llm_mcp.py — all subprocess sites replaced
# Before:
proc = await asyncio.create_subprocess_exec(*cmd, stdout=PIPE, stderr=PIPE)
stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=self._timeout)

# After:
returncode, stdout, stderr = await run_subprocess(*cmd, timeout=self._timeout)
```

---

## 5. How to Avoid in the Future

### Rule: Never use asyncio.create_subprocess_exec in this backend

Add to the backend coding guide:

---

### Backend Guide — Subprocess Calls

**Do not use `asyncio.create_subprocess_exec` or `asyncio.create_subprocess_shell`.**

These require `ProactorEventLoop` on Windows. The dev server (`uvicorn --reload`) uses `SelectorEventLoop`, which raises `NotImplementedError` silently absorbed by broad `except Exception` handlers.

**Always use `run_subprocess` from `app.infrastructure.collectors.base`:**

```python
from app.infrastructure.collectors.base import run_subprocess

returncode, stdout, stderr = await run_subprocess(
    "gh", "api", "some/path",
    timeout=30.0,
)
```

This runs `subprocess.run` in a thread via `asyncio.to_thread`, which:
- Works with any event loop type (`SelectorEventLoop`, `ProactorEventLoop`, `uvloop`)
- Is safe in both dev (`--reload`) and production
- Raises `CollectorTimeoutError` and `CollectorUnavailableError` with clean messages

**Why the asyncio subprocess API exists at all:**  
It was designed for long-lived, interactive subprocesses where you need to stream output in real time. For one-shot CLI tools (like `gh`, `claude`) where you just want stdout/stderr when the process exits, `subprocess.run` in a thread is simpler, safer, and cross-platform.

---

### Rule: asyncio.gather exceptions must always be materialised

When using `asyncio.gather(return_exceptions=True)`, every result in the list must be handled:

```python
# Wrong — silently drops failures
for batch in batches:
    if isinstance(batch, list):
        results.extend(batch)
    elif isinstance(batch, Exception):
        logger.warning(...)          # ← data loss; no record of failure

# Correct — materialise as a domain object so it's stored and visible
for label, batch in zip(labels, batches):
    if isinstance(batch, list):
        results.extend(batch)
    elif isinstance(batch, BaseException):
        logger.exception(..., exc_info=batch)
        results.append(CollectionResult(
            source_type=label,
            source_handle=handle,
            records=[],
            status="failed",
            error_message=f"{type(batch).__name__}: {batch!r}",
        ))
```

If a collector exception is not materialised as a `CollectionResult`, it disappears from the DB, making post-hoc investigation impossible.

---

### Rule: Broad except clauses must log the exception type, not just the message

```python
# Wrong — NotImplementedError() has an empty message; this logs nothing useful
except (TimeoutError, OSError, Exception) as exc:
    logger.warning("check failed: %s", exc)          # logs ""

# Correct — always log type name AND repr
except (TimeoutError, OSError, Exception) as exc:
    logger.warning("check failed (%s: %r)", type(exc).__name__, exc)
    # logs: "check failed (NotImplementedError: )"
```

When an exception has an empty string message (like `NotImplementedError()`), using `%s` logs nothing. Using `type(exc).__name__` and `%r` always gives you something to grep for.
