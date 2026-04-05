# Analysis Pipeline — End-to-End Data Flow

**Scope:** MVP backend analysis pipeline  
**Entry point:** `POST /members/:id/analysis`  
**Implementation:** `be/app/infrastructure/analysis/runner.py`

---

## Overview

```
HTTP trigger
    │
    ▼
Phase 1 — Collection          GitHub API + LLM MCP (parallel)
    │
    ▼
Phase 2 — P1 Evidence         LLM × N chunks (parallel, semaphore=4)
    │
    ▼
Phase 3 — P2 Consolidation    LLM × 1 call
    │
    ▼
Phase 4 — Scoring             P3 LLM × N dims (parallel) + scoring engine
    │
    ▼
Phase 5 — Output Generation   P4–P7 LLM calls (KPT, cases, milestones, overview)
    │
    ▼
Phase 6 — P8 Self-Critique    LLM × 1 call (gate)
    │
    ▼
run.status = "completed"
```

---

## Phase 0 — HTTP Trigger

```
POST /members/:id/analysis
    │
    ├─ Creates AnalysisRun row (status="pending")
    ├─ Returns HTTP 202 immediately
    └─ Registers BackgroundTask → run_analysis_job(run_id)
                                       │
                                       └─ runs inside uvicorn worker process
                                          event loop = SelectorEventLoop (Win32 --reload)
                                          or ProactorEventLoop (Win32 production / Linux)
```

**Implementation:** `app/interfaces/http/routes/analysis.py` → `runner.run_analysis_job()`

---

## Phase 1 — Collection

**Status transition:** `pending → collecting`  
**Progress:** 5% → 30%

```
asyncio.gather(
    _collect_gh(),    # GitHubCollector
    _collect_mcp(),   # LLMMCPCollector
)
```

### GitHubCollector

**Source:** `app/infrastructure/collectors/github.py`  
**Auth:** `gh auth status` (gh CLI must be logged in on the host machine)

```
Phase 1a — Metadata fetch (3 parallel streams)
──────────────────────────────────────────────
gh search issues  →  pr_authored[]   title, body, state, labels, repo
gh search issues  →  pr_reviewed[]   title, state, pr_author, repo
gh search commits →  commit[]        sha (full), message, committed_at, repo

Phase 1b — Content enrichment (parallel, up to 20 PRs + 25 commits)
────────────────────────────────────────────────────────────────────
For each authored PR:
  GET /repos/{owner}/{repo}/pulls/{n}/reviews    → reviews_received[]
  GET /repos/{owner}/{repo}/pulls/{n}/comments   → inline_feedback_received[]
  GET /repos/{owner}/{repo}/pulls/{n}/files      → files_changed[]

For each reviewed PR:
  GET /repos/{owner}/{repo}/pulls/{n}/reviews    → review_summaries[]
  GET /repos/{owner}/{repo}/pulls/{n}/comments   → inline_comments[]
  GET /repos/{owner}/{repo}/pulls/{n}/files      → files_changed[]

For each commit (with known repo):
  GET /repos/{owner}/{repo}/commits/{sha}        → files_changed[]
```

**Key fields on inline comments:**

| Field       | Source                     | Meaning                                                             |
| ----------- | -------------------------- | ------------------------------------------------------------------- |
| `body`      | comment.body               | The actual text the reviewer wrote                                  |
| `path`      | comment.path               | File being reviewed                                                 |
| `diff_hunk` | comment.diff_hunk          | The code block the comment targets                                  |
| `outdated`  | `comment.position is None` | `true` = code was changed after this comment; feedback was acted on |

The `outdated` flag is one of the strongest behavioural signals: it means the reviewer wrote a comment, the author then edited that exact code, and GitHub marked the comment as superseded. This indicates **actionable peer review**.

**Subprocess pattern (critical):**

All `gh` CLI calls use `asyncio.to_thread(subprocess.run, ...)` via `run_subprocess()` in `base.py`. This is required because `asyncio.create_subprocess_exec` raises `NotImplementedError` on Windows when the event loop is `SelectorEventLoop` (which uvicorn sets when `--reload` is active).

### LLMMCPCollector

**Source:** `app/infrastructure/collectors/llm_mcp.py`  
**Auth:** Handled by the LLM CLI's own MCP configuration (no tokens in the backend)

```
probe_mcp_sources()   →  detect which MCP servers are configured (Slack, Jira, etc.)
    │
    └─ If none found: returns CollectionResult(status="skipped")
    └─ If found: _run_llm(collection_prompt) → structured JSON response
                  → split into per-source CollectionResult[]
```

### Persistence

All `CollectionResult` objects (including `status="failed"` and `status="skipped"`) are persisted as rows in `source_payloads`:

```sql
source_payloads
  source_payload_id   TEXT PK
  analysis_run_id     TEXT FK
  source_type         TEXT    -- "github" | "slack" | "jira" | ...
  source_handle       TEXT    -- GitHub username / display name
  raw_data            TEXT    -- JSON array of enriched record dicts
  record_count        INT
  collection_status   TEXT    -- "collected" | "failed" | "skipped"
  error_message       TEXT    -- populated on failure/skip
```

If **all** sources produce `status != "collected"`, the run transitions to `failed` immediately and phases 2–6 are skipped.

---

## Phase 2 — P1 Evidence Extraction

**Status transition:** `collecting → analyzing` (stage: `extracting_evidence`)  
**Progress:** 35% → 50%  
**Source:** `app/infrastructure/analysis/pipeline/p1_runner.py`

### Record normalisation (chunker)

**Source:** `app/infrastructure/analysis/pipeline/chunker.py`

`chunk_records()` normalises raw source records into a uniform P1 input shape before sending to the LLM:

```
_prepare_record(raw)
  ├─ record_id  ← raw.sha[:12]  or  str(raw.number)  or  "rec_{idx}"
  ├─ timestamp  ← raw.committed_at  or  raw.created_at  or  raw.updated_at
  ├─ source_type← raw.source_type  (injected by runner.py)
  ├─ title      ← raw.title  or  raw.type
  └─ content    ← build_content_excerpt(raw)
```

`build_content_excerpt()` builds a rich text string per record type:

| Record type   | Content built from                                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `commit`      | commit message + files_changed (filename, +/- lines, patch excerpt)                                                            |
| `pr_authored` | PR description body + reviews_received (with state) + inline_feedback_received (with diff_hunk, outdated note) + files_changed |
| `pr_reviewed` | review_summaries (with state) + inline_comments (with diff_hunk, outdated note) + files_changed                                |
| MCP records   | content / message / body (first non-empty field)                                                                               |

Records are grouped by `source_type` and sorted by timestamp, then split into chunks of 20.

### LLM calls

```
chunks = chunk_records(all_records)   # typically 8 chunks for ~160 records

asyncio.gather(
    process_chunk(chunk_0),
    process_chunk(chunk_1),
    ...                               # semaphore limits to 4 concurrent
) → all_candidate_events[]
```

Each chunk call:

```
call_llm(p1_prompt)
  └─ _run_subprocess(cli_tool, model, prompt, timeout)
       └─ asyncio.to_thread(subprocess.run [claude --model ... -p ...])
            ← must NOT use asyncio.create_subprocess_exec (breaks on SelectorEventLoop)
```

P1 LLM output schema (per chunk):

```json
{
  "events": [
    {
      "source_record_ids": ["sha_or_number"],
      "event_type": "review_feedback | delivery_completion | ...",
      "event_summary": "concrete description of observed behaviour",
      "polarity": "positive | negative | mixed | neutral",
      "severity": 0.0,
      "event_confidence": 0.8,
      "impact_level": "low | medium | high",
      "opportunity_level": "none | low | medium | high",
      "related_dimensions": [
        { "dimension_id": "...", "relation_strength": 0.7 }
      ],
      "ambiguity_notes": [],
      "why_it_matters": "one-line behavioural significance"
    }
  ]
}
```

### Persistence

```sql
evidence_units                         -- one row per source record
  evidence_id          TEXT PK
  analysis_run_id      TEXT FK
  record_type          TEXT    -- "pr_authored" | "pr_reviewed" | "commit" | ...
  record_id            TEXT    -- sha or PR number
  timestamp            TEXT    -- ISO 8601 from source record
  content_excerpt      TEXT    -- first 1000 chars of build_content_excerpt()
  content_summary      TEXT    -- filled after P1 (currently empty in MVP)
  extraction_confidence REAL
```

`candidate_events[]` (raw P1 dicts) are passed in memory to Phase 3 — not yet persisted at this stage.

---

## Phase 3 — P2 Event Consolidation

**Progress:** 50% → 55%  
**Source:** `app/infrastructure/analysis/pipeline/p2_runner.py`

```
call_llm(p2_prompt)
  input:  candidate_events[] from P1 (all chunks merged)
  output: consolidated BehavioralEvent[] (deduped, merged cross-record signals)
  fallback: if P2 fails, P1 events are used directly
```

### Persistence

```sql
behavioral_events
  event_id             TEXT PK
  analysis_run_id      TEXT FK
  event_type           TEXT
  event_summary        TEXT
  polarity             TEXT
  severity             REAL
  event_confidence     REAL
  impact_level         TEXT
  opportunity_level    TEXT
  related_dimensions   TEXT    -- JSON: [{"dimension_id": str, "relation_strength": float}]
  source_evidence_ids  TEXT    -- JSON: [evidence_id, ...]
  why_it_matters       TEXT
```

---

## Phase 4 — Scoring (P3 + Scoring Engine)

**Status stage:** `inferring_dimensions` → `scoring`  
**Progress:** 60% → 75%  
**Sources:** `p3_runner.py`, `scoring_runner.py`, `domain/analysis/scoring_engine.py`

```
run_p3()
  ├─ For each dimension in DIMENSION_IDS (parallel, semaphore=4):
  │    call_llm(p3_prompt)
  │      input:  behavioral_events + role_profile + baseline
  │      output: {dimension_id, polarity, signal_strength, signal_specificity,
  │               signal_confidence, opportunity_level, explanation_summary}
  │
  └─ → DimensionSignal[] per dimension

scoring_engine.compute_dimension_scores(signals)
  → DimensionScore[] (raw_score 0–5, normalized_score, maturity_level,
                      confidence_score/label, opportunity_score/label,
                      delta_value/label vs personal baseline)

scoring_engine.compute_category_scores(dimension_scores)
  → CategoryScore[] (weighted average across dimensions per category)
```

### Persistence

```sql
dimension_scores     -- one row per dimension per run
  dimension_id       TEXT
  raw_score          REAL     -- 0.0–5.0
  normalized_score   REAL
  maturity_level     TEXT     -- "novice" | "developing" | ... | "expert"
  confidence_score   REAL
  confidence_label   TEXT     -- "low" | "moderate" | "high"
  opportunity_score  REAL
  opportunity_label  TEXT
  delta_value        REAL     -- vs personal baseline
  delta_label        TEXT     -- "improved" | "stable" | "regressing" | ...
  p3_inference       TEXT     -- raw P3 JSON output

category_scores      -- one row per category per run
  category_id        TEXT
  score              REAL
  confidence_score   REAL
  included_dimensions TEXT    -- JSON array
```

---

## Phase 5 — Output Generation (P4–P7)

**Status stage:** `generating_kpt`  
**Progress:** 80%  
**Source:** `app/infrastructure/analysis/pipeline/output_runner.py`

```
P4 — ui_summary per dimension
  call_llm(p4_prompt) per dimension (parallel)
  → updates dimension_scores.ui_summary

P5 — KPT generation
  call_llm(p5_prompt)
  input:  dimension_scores + behavioral_events
  output: keep[], problem[], try[]  items
  → stored in kpt_items

P6 — Case feedback
  call_llm(p6_prompt)
  input:  behavioral_events (negative/mixed polarity)
  output: case_feedback[] with why_it_matters, better_alternative, next_time_guidance
  → stored in case_feedbacks

P7 — Overview / snapshot
  call_llm(p7_prompt)
  input:  dimension_scores + kpt + cases
  output: profile_summary, growth_journey_summary, top_strengths, top_growth_areas
  → stored in analysis_snapshots
```

### Persistence

```sql
kpt_items        -- keep/problem/try items with linked_dimension_ids + linked_evidence_ids
case_feedbacks   -- per case: title, summary, why_it_matters, better_alternative, guidance
analysis_snapshots -- profile_summary, growth_journey_summary, top strengths/growth
```

---

## Phase 6 — P8 Self-Critique Gate

**Status stage:** `self_checking`  
**Progress:** 92%  
**Source:** `app/infrastructure/analysis/pipeline/p8_runner.py`

```
call_llm(p8_prompt)
  input:  dimension_scores + snapshot + fairness_notes
  output: {approved: bool, issues: [{dimension_id, verdict, note}]}

  If approved → analysis_snapshots.p8_approved = true
  If not approved → patch scores, retry once, then mark approved regardless
```

### Persistence

```sql
analysis_snapshots.p8_approved    INT    -- 0 | 1
analysis_snapshots.p8_issues      TEXT   -- JSON array of issue dicts

validation_flags                   -- per dimension, per run
  dimension_id    TEXT
  verdict         TEXT    -- "accurate" | "questionable" | "incorrect"
  note            TEXT
```

---

## Completion

```
run.status       = "completed"
run.progress_pct = 100
run.completed_at = utcnow()
```

The UI polls `GET /members/:id/runs` for status. On `completed`, tabs (Overview, Competency, KPT, Cases, Journey, Evidence) fetch their respective endpoints.

---

## Subprocess pattern — why `asyncio.to_thread` everywhere

**Rule:** All CLI subprocess calls in this codebase use `asyncio.to_thread(subprocess.run, ...)` and never `asyncio.create_subprocess_exec`.

```
asyncio.create_subprocess_exec   ← requires ProactorEventLoop on Win32
                                    raises NotImplementedError on SelectorEventLoop
                                    (uvicorn --reload sets SelectorEventLoop on Win32)

asyncio.to_thread(subprocess.run)← runs subprocess.run in a ThreadPoolExecutor worker
                                    works on any event loop type
                                    correct choice for one-shot CLI tools
```

This applies to:

- `run_subprocess()` in `collectors/base.py` — used by `GitHubCollector` and `LLMMCPCollector`
- `_run_subprocess()` in `pipeline/llm_runner.py` — used by every P1–P8 LLM call

Violating this rule silently kills the entire analysis pipeline: `NotImplementedError` is caught by `except Exception`, produces an empty error message string, and causes all chunks to be skipped with no visible error surfaced to the user.

---

## Progress stage reference

| Stage key              | Phase              | Progress  |
| ---------------------- | ------------------ | --------- |
| `collecting_data`      | 1 — Collection     | 5% → 30%  |
| `extracting_evidence`  | 2 — P1             | 35% → 50% |
| `inferring_dimensions` | 3 — P2 + P3 start  | 55% → 60% |
| `scoring`              | 4 — Scoring engine | 75%       |
| `generating_kpt`       | 5 — Output gen     | 80%       |
| `self_checking`        | 6 — P8             | 92%       |
| _(null)_               | Completed          | 100%      |

## Error states

| Condition                                     | Result                                                         |
| --------------------------------------------- | -------------------------------------------------------------- |
| All collectors return `status != "collected"` | `run.status = "failed"`, phases 2–6 skipped                    |
| All P1 chunks raise `LLMCallError`            | 0 events → 0 scores → empty analysis (completed but null)      |
| P2 fails                                      | Falls back to raw P1 events                                    |
| P3 fails for a dimension                      | That dimension gets `maturity_level = "insufficient_data"`     |
| P5/P6/P7 fails                                | Section is empty; run still completes                          |
| P8 fails                                      | Snapshot marked `p8_approved = false`; run still completes     |
| Job timeout (configurable)                    | `run.status = "failed"`, error_message set                     |
| Server restart mid-run                        | `cleanup_orphaned_runs()` on startup marks stale runs `failed` |
