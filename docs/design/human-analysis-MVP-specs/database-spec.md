# Database Schema Spec

**Developer Growth & Evidence-Based Performance Insight Platform — MVP**

> **Storage:** SQLite (MVP). UUIDs stored as `TEXT`, generated at app layer. Timestamps are `TEXT` ISO 8601 UTC. JSON fields use `TEXT` with app-layer serialization. Enable `PRAGMA foreign_keys = ON` on every connection.

---

## Schema Overview

```
organizations
teams
members
role_profiles
personal_baselines
analysis_runs
source_payloads
evidence_units
behavioral_events
dimension_signals       (populated but not actively queried in MVP)
dimension_scores
category_scores
kpt_items
case_feedbacks
milestones
validation_flags
analysis_snapshots
```

---

## Table Definitions

### `organizations`

```sql
CREATE TABLE organizations (
  organization_id   TEXT PRIMARY KEY,
  name              TEXT NOT NULL,
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL
);
```

---

### `teams`

```sql
CREATE TABLE teams (
  team_id           TEXT PRIMARY KEY,
  organization_id   TEXT NOT NULL REFERENCES organizations(organization_id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL
);
```

---

### `members`

```sql
CREATE TABLE members (
  member_id         TEXT PRIMARY KEY,
  team_id           TEXT NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE,
  role_profile_id   TEXT REFERENCES role_profiles(role_profile_id) ON DELETE SET NULL,
  display_name      TEXT NOT NULL,
  external_id       TEXT,       -- GitHub handle, Slack ID, etc.
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL
);
```

---

### `role_profiles`

```sql
CREATE TABLE role_profiles (
  role_profile_id              TEXT PRIMARY KEY,
  role_name                    TEXT NOT NULL UNIQUE,
  expected_dimension_weights   TEXT NOT NULL DEFAULT '{}',   -- JSON
  expected_opportunity_levels  TEXT NOT NULL DEFAULT '{}',   -- JSON
  expected_maturity_ranges     TEXT NOT NULL DEFAULT '{}',   -- JSON
  created_at                   TEXT NOT NULL,
  updated_at                   TEXT NOT NULL
);
```

Pre-seeded with standard roles. JSON fields keyed by `dimension_id`.

---

### `personal_baselines`

```sql
CREATE TABLE personal_baselines (
  baseline_id          TEXT PRIMARY KEY,
  member_id            TEXT NOT NULL UNIQUE REFERENCES members(member_id) ON DELETE CASCADE,
  baseline_dimensions  TEXT NOT NULL DEFAULT '{}',    -- JSON
  created_by           TEXT,
  notes                TEXT,
  baseline_created_at  TEXT NOT NULL
);
```

One baseline per member (`UNIQUE` on `member_id`).

---

### `analysis_runs`

```sql
CREATE TABLE analysis_runs (
  analysis_run_id   TEXT PRIMARY KEY,
  member_id         TEXT NOT NULL REFERENCES members(member_id) ON DELETE CASCADE,
  period_start      TEXT NOT NULL,   -- ISO date YYYY-MM-DD
  period_end        TEXT NOT NULL,
  run_type          TEXT NOT NULL
                      CHECK (run_type IN ('fresh', 'refresh_same_period', 'refresh_new_period', 'compare_period')),
  status            TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'collecting', 'analyzing', 'completed', 'failed')),
  progress_stage    TEXT,            -- e.g. "collecting_data", "extracting_evidence", null on completed
  progress_pct      INTEGER,         -- 0–100
  scoring_version   TEXT,
  error_message     TEXT,
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL,
  completed_at      TEXT
);
```

**Progress stages:** `collecting_data → extracting_evidence → inferring_dimensions → scoring → generating_kpt → self_checking`

**Business rules:**
- `period_end - period_start` must not exceed 365 days (app layer)
- Only one `status IN ('pending', 'analyzing', 'collecting')` run per member at a time (app layer)

---

### `source_payloads`

One row per collector source per run. Stored even for `failed` / `skipped` sources.

```sql
CREATE TABLE source_payloads (
  source_payload_id   TEXT PRIMARY KEY,
  analysis_run_id     TEXT NOT NULL REFERENCES analysis_runs(analysis_run_id) ON DELETE CASCADE,
  source_type         TEXT NOT NULL,    -- "github" | "slack" | "jira" | "mcp" | ...
  source_handle       TEXT,             -- GitHub username / display name
  raw_data            TEXT,             -- JSON array of enriched record dicts
  record_count        INTEGER,
  collection_status   TEXT NOT NULL,    -- "collected" | "failed" | "skipped"
  error_message       TEXT,             -- populated on failure/skip
  collected_at        TEXT NOT NULL
);
```

`raw_data` schema is source-specific. For `github`, see `github-collection-schema.md`. The field is additive — old runs have sparser records, new runs have enriched records. The P1 pipeline handles both.

---

### `evidence_units`

One row per source record, populated during P1 extraction.

```sql
CREATE TABLE evidence_units (
  evidence_id           TEXT PRIMARY KEY,
  analysis_run_id       TEXT NOT NULL REFERENCES analysis_runs(analysis_run_id) ON DELETE CASCADE,
  member_id             TEXT NOT NULL,
  timestamp             TEXT NOT NULL,  -- sourced from original record (committed_at / created_at)
  source_type           TEXT,           -- "github" | "mcp" | ...
  record_type           TEXT,           -- "pr_authored" | "pr_reviewed" | "commit" | ...
  record_id             TEXT,           -- full SHA (commits) or PR number as string
  content_excerpt       TEXT,           -- first ≤1000 chars of build_content_excerpt()
  content_summary       TEXT,           -- one-line summary (filled after P1)
  extraction_confidence REAL,
  ambiguity_notes       TEXT,           -- JSON array of strings
  created_at            TEXT NOT NULL
);
```

`content_excerpt` is what appears in the Evidence tab UI.

---

### `behavioral_events`

```sql
CREATE TABLE behavioral_events (
  event_id              TEXT PRIMARY KEY,
  analysis_run_id       TEXT NOT NULL REFERENCES analysis_runs(analysis_run_id) ON DELETE CASCADE,
  member_id             TEXT NOT NULL,
  timestamp             TEXT NOT NULL,
  source_evidence_ids   TEXT NOT NULL DEFAULT '[]',   -- JSON array of evidence_id
  event_type            TEXT NOT NULL,
  event_summary         TEXT,
  polarity              TEXT NOT NULL CHECK (polarity IN ('positive', 'negative', 'mixed', 'neutral')),
  severity              REAL,
  event_confidence      REAL,
  impact_level          TEXT CHECK (impact_level IN ('low', 'medium', 'high')),
  opportunity_level     TEXT CHECK (opportunity_level IN ('none', 'low', 'medium', 'high')),
  related_dimensions    TEXT NOT NULL DEFAULT '[]',   -- JSON: [{"dimension_id": str, "relation_strength": float}]
  ambiguity_notes       TEXT DEFAULT '[]',
  why_it_matters        TEXT,
  created_at            TEXT NOT NULL
);
```

---

### `dimension_scores`

```sql
CREATE TABLE dimension_scores (
  score_id                    TEXT PRIMARY KEY,
  analysis_run_id             TEXT NOT NULL REFERENCES analysis_runs(analysis_run_id) ON DELETE CASCADE,
  member_id                   TEXT NOT NULL,
  dimension_id                TEXT NOT NULL,
  raw_score                   REAL,
  normalized_score            REAL,
  maturity_level              TEXT NOT NULL,
  confidence_score            REAL,
  confidence_label            TEXT CHECK (confidence_label IN ('low', 'moderate', 'high')),
  opportunity_score           REAL,
  opportunity_label           TEXT CHECK (opportunity_label IN ('none', 'low', 'medium', 'high')),
  delta_value                 REAL,
  delta_label                 TEXT,
  total_signals               INTEGER NOT NULL DEFAULT 0,
  positive_signals            INTEGER NOT NULL DEFAULT 0,
  negative_signals            INTEGER NOT NULL DEFAULT 0,
  mixed_signals               INTEGER NOT NULL DEFAULT 0,
  explanation_summary         TEXT,
  limitation_notes            TEXT DEFAULT '[]',          -- JSON array
  top_supporting_evidence_ids TEXT DEFAULT '[]',          -- JSON array
  top_counter_evidence_ids    TEXT DEFAULT '[]',          -- JSON array
  p3_inference                TEXT,                       -- raw P3 JSON output, used as P4 input
  ui_summary                  TEXT,                       -- P4 output, displayed in Competency tab
  created_at                  TEXT NOT NULL,

  UNIQUE (analysis_run_id, dimension_id)
);
```

---

### `category_scores`

```sql
CREATE TABLE category_scores (
  category_score_id    TEXT PRIMARY KEY,
  analysis_run_id      TEXT NOT NULL REFERENCES analysis_runs(analysis_run_id) ON DELETE CASCADE,
  member_id            TEXT NOT NULL,
  category_id          TEXT NOT NULL,
  score                REAL,
  confidence_score     REAL,
  confidence_label     TEXT CHECK (confidence_label IN ('low', 'moderate', 'high')),
  included_dimensions  TEXT DEFAULT '[]',   -- JSON array
  excluded_dimensions  TEXT DEFAULT '[]',   -- JSON array
  explanation_summary  TEXT,

  UNIQUE (analysis_run_id, category_id)
);
```

---

### `kpt_items`

```sql
CREATE TABLE kpt_items (
  kpt_id               TEXT PRIMARY KEY,
  analysis_run_id      TEXT NOT NULL REFERENCES analysis_runs(analysis_run_id) ON DELETE CASCADE,
  member_id            TEXT NOT NULL,
  item_type            TEXT NOT NULL CHECK (item_type IN ('keep', 'problem', 'try')),
  title                TEXT NOT NULL,
  summary              TEXT,
  linked_dimension_ids TEXT DEFAULT '[]',   -- JSON array
  linked_evidence_ids  TEXT DEFAULT '[]',   -- JSON array
  linked_problem_ids   TEXT DEFAULT '[]',   -- JSON array (for Try items: titles of linked Problems)
  display_order        INTEGER NOT NULL DEFAULT 0,
  created_at           TEXT NOT NULL
);
```

Write pattern: delete-then-insert per run (`replace_for_run`).

---

### `case_feedbacks`

```sql
CREATE TABLE case_feedbacks (
  case_id               TEXT PRIMARY KEY,
  analysis_run_id       TEXT NOT NULL REFERENCES analysis_runs(analysis_run_id) ON DELETE CASCADE,
  member_id             TEXT NOT NULL,
  title                 TEXT NOT NULL,
  category              TEXT,
  impact_level          TEXT CHECK (impact_level IN ('low', 'medium', 'high')),
  summary               TEXT,
  why_it_matters        TEXT,
  observed_pattern      TEXT,
  better_alternative    TEXT,
  next_time_guidance    TEXT,
  linked_dimension_ids  TEXT DEFAULT '[]',    -- JSON array
  supporting_event_ids  TEXT DEFAULT '[]',    -- JSON array
  confidence_score      REAL,
  display_order         INTEGER NOT NULL DEFAULT 0,
  created_at            TEXT NOT NULL
);
```

Write pattern: delete-then-insert per run (`replace_for_run`).

---

### `milestones`

```sql
CREATE TABLE milestones (
  milestone_id              TEXT PRIMARY KEY,
  member_id                 TEXT NOT NULL REFERENCES members(member_id) ON DELETE CASCADE,
  source_analysis_run_id    TEXT REFERENCES analysis_runs(analysis_run_id) ON DELETE SET NULL,
  timestamp                 TEXT NOT NULL,
  milestone_type            TEXT NOT NULL,
  title                     TEXT NOT NULL,
  summary                   TEXT,
  impact_score              REAL,
  supporting_event_ids      TEXT DEFAULT '[]',    -- JSON array
  supporting_evidence_ids   TEXT DEFAULT '[]',    -- JSON array
  retained                  INTEGER NOT NULL DEFAULT 1,   -- 1=true, 0=false
  created_at                TEXT NOT NULL
);
```

**Append-only.** Never overwrite or delete. Soft-delete via `retained=0`.

---

### `validation_flags`

One row per (run, dimension) pair. Upserted when the user submits a verdict.

```sql
CREATE TABLE validation_flags (
  flag_id          TEXT PRIMARY KEY,
  analysis_run_id  TEXT NOT NULL REFERENCES analysis_runs(analysis_run_id) ON DELETE CASCADE,
  dimension_id     TEXT NOT NULL,
  verdict          TEXT NOT NULL CHECK (verdict IN ('accurate', 'questionable', 'incorrect')),
  note             TEXT,
  flagged_at       TEXT NOT NULL
);
```

Flags are preserved when a same-period refresh overwrites scores.

---

### `analysis_snapshots`

```sql
CREATE TABLE analysis_snapshots (
  snapshot_id                 TEXT PRIMARY KEY,
  analysis_run_id             TEXT NOT NULL UNIQUE REFERENCES analysis_runs(analysis_run_id) ON DELETE CASCADE,
  member_id                   TEXT NOT NULL,
  period_start                TEXT NOT NULL,
  period_end                  TEXT NOT NULL,
  generated_at                TEXT NOT NULL,
  overall_confidence          REAL,
  profile_summary             TEXT,              -- P7 output
  growth_journey_summary      TEXT,              -- P7 output
  top_strength_dimension_ids  TEXT DEFAULT '[]', -- JSON array
  top_growth_dimension_ids    TEXT DEFAULT '[]', -- JSON array
  current_growth_path         TEXT,              -- P7 output (e.g. "Emerging Owner")
  fairness_notes              TEXT DEFAULT '[]', -- JSON array
  insufficient_dimensions     TEXT DEFAULT '[]', -- JSON array
  flagged_items_count         INTEGER NOT NULL DEFAULT 0,
  p8_approved                 INTEGER NOT NULL DEFAULT 0,   -- 0=false, 1=true
  p8_issues                   TEXT DEFAULT '[]'             -- JSON array
);
```

Upserted at end of run. On same-period refresh: overwrite snapshot + scores + kpt/cases; preserve milestones + validation_flags.

---

## Key Read Patterns

| Query | Tables |
|-------|--------|
| Get member profile (latest run) | `analysis_runs` → filter `status='completed'`, order `period_end DESC` |
| Overview tab | `analysis_snapshots`, `category_scores` |
| Competency tab | `dimension_scores` — all rows for `analysis_run_id` |
| Dimension detail | `dimension_scores`, `evidence_units` (by IDs) |
| KPT tab | `kpt_items` — filter by `analysis_run_id`, order by `item_type`, `display_order` |
| Cases tab | `case_feedbacks` — filter by `analysis_run_id`, order by `display_order` |
| Journey tab | `analysis_snapshots`, `milestones` — filter by `member_id` |
| Evidence tab | `evidence_units` — paginated, filterable by `source_type`, `record_type` |
| Run status polling | `analysis_runs` — select `status`, `progress_stage`, `progress_pct` |

---

## Constraints Summary

| Rule | Enforcement |
|------|-------------|
| Period max 365 days | App layer |
| One baseline per member | `UNIQUE` on `personal_baselines.member_id` |
| One snapshot per run | `UNIQUE` on `analysis_snapshots.analysis_run_id` |
| Score range 0–5 | App layer (scoring engine) |
| Confidence range 0–1 | App layer |
| Boolean fields (`retained`, `p8_approved`) | `INTEGER` 0/1 |
| `PRAGMA foreign_keys = ON` | Required on every connection |
