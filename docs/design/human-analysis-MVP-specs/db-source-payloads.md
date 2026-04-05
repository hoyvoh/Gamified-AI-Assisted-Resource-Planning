# DB Design — source_payloads & evidence_units

## source_payloads

**Table:** `source_payloads`  
**Purpose:** Stores the raw collected records from each data source, per analysis run.

```sql
source_payload_id TEXT PK
analysis_run_id   TEXT FK → analysis_runs
source_type       TEXT(50)        -- "github" | "slack" | "confluence" | "jira" | "mcp"
source_handle     TEXT(255)       -- e.g. GitHub username
raw_data          TEXT            -- JSON array of record dicts (no length limit in SQLite)
record_count      INTEGER
collection_status TEXT(20)        -- "collected" | "failed" | "skipped"
error_message     TEXT NULL
collected_at      TEXT            -- ISO 8601 UTC
```

### raw_data schema evolution

`raw_data` is a JSON array. Each element is a record dict whose shape depends on
`source_type`. For `github`, the enriched schema (as of 2026-04) is:

```
pr_authored  → title, body, state, labels, repo,
               reviews_received[], inline_feedback_received[], files_changed[]
pr_reviewed  → title, state, pr_author, repo,
               review_summaries[], inline_comments[], files_changed[]
commit       → sha (full), message, repo, committed_at,
               files_changed[]
```

All sub-objects include `diff_hunk` (the code context) and `outdated` (whether
the comment targets since-changed code) where applicable.

**No migration needed** — `raw_data` is TEXT/JSON and the schema is additive.
Old runs have sparser records; new runs have enriched records. The P1 pipeline
handles both gracefully (`build_content_excerpt` returns empty string if no
content fields are present).

### Size considerations

| Record type     | ~Size before enrichment | ~Size after enrichment |
|-----------------|------------------------|------------------------|
| commit          | ~300 B                 | ~2–5 KB (with files)   |
| pr_authored     | ~1 KB                  | ~5–20 KB               |
| pr_reviewed     | ~200 B                 | ~3–15 KB               |

A 6-month run with 100 commits + 50 PRs → `raw_data` ≈ 500 KB–2 MB.
SQLite TEXT columns have no practical size limit for this scale.

---

## evidence_units

**Table:** `evidence_units`  
**Purpose:** Stores one row per source record, populated during P1 extraction.

```sql
evidence_id          TEXT PK
analysis_run_id      TEXT FK → analysis_runs
member_id            TEXT
timestamp            TEXT        -- ISO 8601, sourced from the original record
source_type          TEXT(50) NULL
record_type          TEXT(50) NULL   -- "pr_authored" | "pr_reviewed" | "commit" | ...
record_id            TEXT(255) NULL  -- SHA (commits) or PR number (PRs)
content_excerpt      TEXT            -- ≤1000 chars of build_content_excerpt() output
content_summary      TEXT            -- one-line summary (set after P1 runs)
extraction_confidence REAL NULL
ambiguity_notes      TEXT            -- JSON array of strings
created_at           TEXT
```

### content_excerpt field

`content_excerpt` stores the first 1000 characters of `build_content_excerpt(raw_record)`.

For GitHub records this means:
- **commit**: `"Commit message: feat: add thing\n  modified src/api.py (+15/-3)\n    @@ ..."`
- **pr_authored**: `"PR description: ...\n\nReview from reviewer [CHANGES_REQUESTED]: ...\n\nInline feedback from reviewer on src/handler.py [comment on obsolete code]: ..."`
- **pr_reviewed**: `"Review submitted [CHANGES_REQUESTED]: ...\n\nInline comment on src/worker.py: ...\n  Code:\n@@ -55,6 +55,10 ..."`

This is what appears in the **Evidence tab** in the UI.

### record_id field

For GitHub records, `record_id` maps as follows:

| record_type  | record_id value                        |
|--------------|----------------------------------------|
| `commit`     | Full SHA (40 chars)                    |
| `pr_authored`| PR number as string (`"42"`)           |
| `pr_reviewed`| PR number as string (`"99"`)           |

Previously this was always `None` for GitHub records (the collector used a
`record_id` field that didn't exist in the GitHub record shape). This is now
populated correctly.

### timestamp field

Previously always fell back to `utcnow()` for GitHub records (no `timestamp`
field on GitHub records). Now correctly uses:
- `committed_at` for commits
- `created_at` for authored PRs
- `updated_at` for reviewed PRs

---

## Data flow: collection → evidence

```
GitHubCollector.collect()
  └─ Phase 1: gh search API → raw record dicts
  └─ Phase 2: gh API /pulls/{n}/reviews+comments+files → enriched dicts
       ↓
source_payloads.raw_data  (JSON blob, full enriched records)
       ↓
runner.py → p1_runner.run_p1(source_records=all_records)
       ↓
chunker.chunk_records()
  └─ _prepare_record()
       ├─ _pick_timestamp() → evidence_units.timestamp
       ├─ _pick_record_id() → evidence_units.record_id
       └─ build_content_excerpt() → evidence_units.content_excerpt
                                  → P1 LLM prompt "content" field
       ↓
LLM (P1) → behavioral events
       ↓
evidence_units (persisted) + behavioral_events (persisted)
```
