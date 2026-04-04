# Development Task Checklist

**Gamified Resource Planning — Pillar 2 MVP (Human Analysis)**

> Status legend: ⬜ To do · 🔄 In progress · ✅ Done · ❌ Blocked

---

## Milestone 1 — Skeleton & Hierarchy

> Goal: Working app shell with full org/team/member CRUD. SQLite wired.

### Backend

| # | Task | Status | Notes |
|---|------|--------|-------|
| B1.1 | Create SQLite DB + Alembic setup (`PRAGMA foreign_keys = ON`) | ✅ | |
| B1.2 | `organizations` table + migration | ✅ | |
| B1.3 | `teams` table + migration | ✅ | |
| B1.4 | `members` table + migration | ✅ | |
| B1.5 | `role_profiles` table + seed data | ✅ | 9 standard roles seeded on startup (idempotent) |
| B1.6 | `POST /organizations` endpoint | ✅ | |
| B1.7 | `GET /organizations` and `GET /organizations/:id` (with tree) | ✅ | |
| B1.8 | `PATCH /organizations/:id` and `DELETE /organizations/:id` | ✅ | |
| B1.9 | `POST /organizations/:id/teams` + PATCH + DELETE | ✅ | |
| B1.10 | `POST /organizations/:id/teams/:id/members` + PATCH + DELETE | ✅ | |
| B1.11 | `GET /members/:id` endpoint | ✅ | analysis_status derived from analysis_runs (M2) |
| B1.12 | `GET /role-profiles` + `GET /role-profiles/:id` | ✅ | |

### Frontend

| # | Task | Status | Notes |
|---|------|--------|-------|
| F1.1 | App shell layout (top header + left sidebar + main content) | ✅ | War room theme |
| F1.2 | Left sidebar: org tree with expand/collapse | ✅ | |
| F1.3 | Sidebar: org node with Create Team context menu | ✅ | |
| F1.4 | Sidebar: team node with Add Member context menu + member count | ✅ | |
| F1.5 | Sidebar: member node with status icon (not_analyzed / loading / ready / error) | ✅ | |
| F1.6 | Create Organization modal | ✅ | |
| F1.7 | Create Team modal | ✅ | |
| F1.8 | Add Member modal (display name, external ID, role dropdown) | ✅ | |
| F1.9 | Dashboard (empty state when no member selected) | ✅ | |
| F1.10 | Click member → open empty profile workspace stub | ✅ | |

---

## Milestone 2 — Analysis Run Infrastructure

> Goal: Trigger analysis, poll status, handle failure/conflict.

### Backend

| # | Task | Status | Notes |
|---|------|--------|-------|
| B2.1 | `analysis_runs` table + migration | ✅ | Migration 0002 |
| B2.2 | `POST /analysis-runs` — validate period ≤ 365 days, no duplicate active run | ✅ | 422 on period, 409 on conflict |
| B2.3 | Auto-correct period >365 days + return warning in response | ⬜ | Currently raises 422; auto-correct deferred |
| B2.4 | `GET /analysis-runs/:id` — polling endpoint | ✅ | Includes `progress_stage` |
| B2.5 | `GET /members/:id/analysis-runs` — history list | ✅ | Paginated (limit/offset) |
| B2.6 | `POST /members/:id/refresh` — shortcut for same-period refresh | ✅ | |
| B2.7 | Background job runner (async task queue or simple async worker) | ✅ | FastAPI BackgroundTasks; CLI-first data collection |
| B2.8 | `source_payloads` table + migration | ✅ | One row per source type per run |

### Frontend

| # | Task | Status | Notes |
|---|------|--------|-------|
| F2.1 | Member workspace header (name, breadcrumb, status badge, last analyzed, time window) | ⬜ | |
| F2.2 | Time range picker (with 1-year max enforcement + warning toast) | ⬜ | |
| F2.3 | Refresh button → trigger analysis | ⬜ | |
| F2.4 | Analysis status polling loop (3–5s intervals) | ⬜ | |
| F2.5 | Progress stage label during analysis ("Collecting data...", "Analyzing...") | ⬜ | |
| F2.6 | Sidebar member status icon updates on run status change | ⬜ | |
| F2.7 | Error banner + retry button when run fails | ⬜ | |
| F2.8 | Conflict toast when run already in progress | ⬜ | |

---

## Milestone 3 — Evidence Extraction (P1 + P2)

> Goal: Pipeline ingests data and produces BehavioralEvent records.

### Backend

| # | Task | Status | Notes |
|---|------|--------|-------|
| B3.1 | `evidence_units` table + migration | ✅ | Migration 0003 |
| B3.2 | `behavioral_events` table + migration | ✅ | Migration 0003 |
| B3.3 | P1 prompt implementation (chunked extraction) | ✅ | p1_extraction.py + p1_runner.py |
| B3.4 | P1 chunk grouping strategy (by thread / artifact / time slice) | ✅ | chunker.py — by source_type then fixed-size slices |
| B3.5 | P2 prompt implementation (event consolidation / dedup) | ✅ | p2_consolidation.py + p2_runner.py (falls back to P1 output on failure) |
| B3.6 | Persist evidence_units and behavioral_events to DB | ✅ | Bulk insert after P1/P2 |
| B3.7 | Analysis run status update: `collecting` → `analyzing` | ✅ | progress_stage advances through extracting_evidence → inferring_dimensions |
| B3.8 | Error handling: partial collection on source timeout | ✅ | Each chunk failure logged and skipped; P2 falls back to P1 output |

---

## Milestone 4 — Dimension Scoring

> Goal: Full scoring pipeline produces DimensionScore and CategoryScore records.

### Backend

| # | Task | Status | Notes |
|---|------|--------|-------|
| B4.1 | `dimension_signals` table + migration | ✅ | Migration 0004 |
| B4.2 | `dimension_scores` table + migration | ✅ | Migration 0004 |
| B4.3 | `category_scores` table + migration | ✅ | Migration 0004 |
| B4.4 | `personal_baselines` table + migration | ✅ | Migration 0004 |
| B4.5 | P3 prompt implementation (per-dimension inference) | ✅ | p3_inference.py + p3_runner.py; parallel via asyncio.Semaphore(4) |
| B4.6 | Scoring engine: signal mass formula | ✅ | 8-factor product in scoring_engine.py |
| B4.7 | Scoring engine: dimension score + maturity level mapping | ✅ | tanh: 3 + 2*tanh(balance), clamp [1,5] |
| B4.8 | Scoring engine: opportunity gate (OpportunityScore < 0.25 → insufficient_opportunity) | ✅ | |
| B4.9 | Scoring engine: confidence score (4-component formula) | ✅ | Blended with P3 LLM confidence |
| B4.10 | Scoring engine: delta computation vs previous run | ✅ | From personal baseline |
| B4.11 | Scoring engine: category score (weighted average of valid dimensions) | ✅ | Role-aware weights |
| B4.12 | Scoring version tracking on analysis_runs | ✅ | `SCORING_VERSION = "1.0"` constant; column in migration 0005; stamped after scoring |
| B4.13 | `PUT /members/:id/baseline` — create/update personal baseline | ✅ | |

---

## Milestone 5 — Human Output Generation (P4 + P5 + P6 + P7)

> Goal: All profile tab content generated and stored.

### Backend

| # | Task | Status | Notes |
|---|------|--------|-------|
| B5.1 | `kpt_items` table + migration | ✅ | Migration 0005 |
| B5.2 | `case_feedbacks` table + migration | ✅ | Migration 0005 |
| B5.3 | `milestones` table + migration | ✅ | Migration 0005 |
| B5.4 | `analysis_snapshots` table + migration | ✅ | Migration 0005 |
| B5.5 | P4 prompt: dimension UI summary (per dimension) | ✅ | Parallel via asyncio.Semaphore(4); writes to `dimension_scores.ui_summary` |
| B5.6 | P5 prompt: KPT generation | ✅ | 3-5 keep/problem/try items |
| B5.7 | P6 prompt: case-based feedback generation | ✅ | 3-8 cases |
| B5.8 | P7 prompt: overview + journey summary | ✅ | Profile summary + growth journey text + growth path label |
| B5.9 | Milestone derivation logic (threshold-based from event clusters) | ✅ | High-impact positive events with confidence >= 0.65; append-only |
| B5.10 | Assemble and persist AnalysisSnapshot | ✅ | Upsert with fairness notes; p8_approved=false pending M6 |

---

## Milestone 6 — P8 Self-Critique Gate

> Goal: P8 runs on every analysis before persist; overclaims are patched.

### Backend

| # | Task | Status | Notes |
|---|------|--------|-------|
| B6.1 | P8 prompt: self-critique / overclaim check | ✅ | p8_critique.py |
| B6.2 | Patch logic: apply `recommended_fix` to affected summaries | ✅ | Patches ui_summary / profile_summary / growth_journey_summary |
| B6.3 | P8 retry once on `approved = false` | ✅ | _call_p8 called twice on failure |
| B6.4 | Store `p8_approved` + `p8_issues` in `analysis_snapshots` | ✅ | Via snapshot_repo.upsert after gate |
| B6.5 | Run status transitions: `analyzing` → `completed` / `failed` | ✅ | self_checking stage → completed; outer try/except → failed |

---

## Milestone 7 — Profile UI (All 5 Tabs)

> Goal: Full profile workspace rendered and navigable.

### Backend (read endpoints)

| # | Task | Status | Notes |
|---|------|--------|-------|
| B7.1 | `GET /members/:id/profile/overview` | ⬜ | |
| B7.2 | `GET /members/:id/profile/competency` (all dimensions, with filter params) | ⬜ | |
| B7.3 | `GET /members/:id/profile/competency/:dimensionId` (detail + evidence list) | ⬜ | |
| B7.4 | `GET /members/:id/profile/kpt` | ⬜ | |
| B7.5 | `GET /members/:id/profile/cases` | ⬜ | |
| B7.6 | `GET /members/:id/profile/cases/:caseId` | ⬜ | |
| B7.7 | `GET /members/:id/profile/journey` | ⬜ | |
| B7.8 | `GET /evidence/:evidenceId` (trace detail) | ⬜ | |
| B7.9 | `GET /members/:id/milestones` | ⬜ | |

### Frontend

| # | Task | Status | Notes |
|---|------|--------|-------|
| F7.1 | Member workspace header (full, not stub) | ⬜ | |
| F7.2 | Member summary strip (archetype, top strengths, growth areas, confidence/coverage badges) | ⬜ | |
| F7.3 | Tab navigation (5 tabs) | ⬜ | |
| F7.4 | **Tab 1 — Overview:** hero card + radar chart (4 axes) | ⬜ | |
| F7.5 | Tab 1: contribution stats, top strengths, growth areas cards | ⬜ | |
| F7.6 | Tab 1: delta card + encouragement summary | ⬜ | |
| F7.7 | Tab 1: loading skeleton + empty state + trust note | ⬜ | |
| F7.8 | **Tab 2 — Competency:** filter panel + dimension card list | ⬜ | |
| F7.9 | Tab 2: expandable dimension card (score, confidence, opportunity, delta, indicators) | ⬜ | |
| F7.10 | Tab 2: counter-evidence / limitation note in card | ⬜ | |
| F7.11 | Tab 2: evidence list per dimension + "View trace" button | ⬜ | |
| F7.12 | Tab 2: evidence trace right drawer | ⬜ | |
| F7.13 | **Tab 3 — KPT:** Keep / Problem / Try sections + development focus box | ⬜ | |
| F7.14 | **Tab 4 — Case Feedback:** case list + case detail panel | ⬜ | |
| F7.15 | Tab 4: improvement theme summary at bottom | ⬜ | |
| F7.16 | **Tab 5 — Journey:** milestone timeline + growth pattern summary | ⬜ | |
| F7.17 | Tab 5: milestone detail on click | ⬜ | |
| F7.18 | All tabs: shared loading / empty / error states | ⬜ | |
| F7.19 | All tabs: trust disclaimer notes | ⬜ | |

---

## Milestone 8 — Validation & Trust UI

| # | Task | Status | Notes |
|---|------|--------|-------|
| B8.1 | `validation_flags` table + migration | ⬜ | |
| B8.2 | `POST /validation-flags` endpoint | ⬜ | |
| B8.3 | `GET /analysis-runs/:id/validation-flags` endpoint | ⬜ | |
| F8.1 | Flag form (accurate / questionable / incorrect + optional note) | ⬜ | Opens from any dimension card |
| F8.2 | Flag icon on flagged dimension cards | ⬜ | |
| F8.3 | Flagged count in Competency summary header | ⬜ | |
| F8.4 | "Needs review" banner when `p8_approved = false` | ⬜ | |
| F8.5 | Confidence + opportunity badges on all scored items | ⬜ | |
| F8.6 | Fairness notes section on Overview tab | ⬜ | |

---

## Milestone 9 — Integration, Polish, Hardening

| # | Task | Status | Notes |
|---|------|--------|-------|
| B9.1 | End-to-end happy path test | ⬜ | |
| B9.2 | Performance check: analysis time for 3-month window | ⬜ | |
| B9.3 | Same-period refresh: verify flags + milestones preserved | ⬜ | |
| B9.4 | Analysis run history list endpoint + UI | ⬜ | |
| F9.1 | All error states wired throughout | ⬜ | |
| F9.2 | Radar chart: click axis → navigate to Competency tab filtered by category | ⬜ | |
| F9.3 | Cross-tab navigation: dimension chip → jump to competency, milestone link → jump to journey | ⬜ | |

---

## Summary Progress

| Milestone | BE tasks | FE tasks | Status |
|-----------|---------|---------|--------|
| M1 — Skeleton | 12 | 10 | ✅ Done |
| M2 — Analysis Run Infra | 8 | 8 | ✅ BE done · FE ⬜ |
| M3 — Evidence Extraction | 8 | 0 | ✅ Done |
| M4 — Dimension Scoring | 13 | 0 | ✅ BE done |
| M5 — Human Output Gen | 10 | 0 | ✅ BE done |
| M6 — P8 Gate | 5 | 0 | ✅ BE done |
| M7 — Profile UI | 9 BE | 19 FE | ⬜ |
| M8 — Validation & Trust | 3 BE | 6 FE | ⬜ |
| M9 — Integration & Polish | 4 BE | 3 FE | ⬜ |
