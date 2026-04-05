# Acceptance Criteria

**Gamified Resource Planning — Pillar 2 MVP**

> After completing any task, verify the criteria below for that task. As an agent, self-verify each point and explicitly note which checks passed. For any check requiring user verification (UI/UX, visual correctness, manual DB inspection), prompt the user with a checklist to confirm.

---

## Milestone 1 — Skeleton & Hierarchy

### B1.1–B1.4 Database Setup + Core Tables

- [ ] `PRAGMA foreign_keys = ON` is set on every DB connection (verify in `session.py`)
- [ ] All tables created: `organizations`, `teams`, `members`, `role_profiles`
- [ ] `alembic upgrade head` completes without error
- [ ] `alembic downgrade -1` (repeated) rolls back cleanly
- [ ] Foreign key cascade: deleting an org cascades to teams; deleting a team cascades to members

### B1.5 Role Profile Seed Data

- [ ] 9 standard role profiles seeded: Junior BE, Mid BE, Senior BE, Junior FE, Mid FE, Senior FE, Senior Fullstack, Tech Lead, DevOps
- [ ] Each profile has `expected_dimension_weights`, `expected_opportunity_levels`, `expected_maturity_ranges` as valid JSON

### B1.6–B1.12 Organization / Team / Member APIs

- [ ] `POST /organizations` returns 201 with `organization_id`
- [ ] `POST /organizations` returns 422 if `name` is empty or >255 chars
- [ ] `GET /organizations/:id` includes full team/member tree with `analysis_status` per member
- [ ] `DELETE /organizations/:id` cascades teams and members (verify in DB)
- [ ] `POST .../teams` returns 422 if `name` is missing
- [ ] `POST .../members` links member to correct team; `team_id` is NOT NULL
- [ ] `GET /members/:id` returns `analysis_status: "not_analyzed"` for new members
- [ ] All endpoints return 404 for non-existent resources (not 500)

### F1.1–F1.10 App Shell + Sidebar

- [ ] **[User verify]** Left sidebar displays org → team → member tree correctly
- [ ] **[User verify]** Org/team/member nodes expand and collapse
- [ ] **[User verify]** New org appears in sidebar immediately after creation (no page refresh)
- [ ] **[User verify]** New team appears nested under its org
- [ ] **[User verify]** New member appears nested under its team with grey "not analyzed" status icon
- [ ] **[User verify]** Clicking member opens profile workspace area (even if empty stub)
- [ ] **[User verify]** Create Org / Create Team / Add Member modals validate required fields

---

## Milestone 2 — Analysis Run Infrastructure

### B2.1–B2.8 Analysis Run API

- [ ] `POST /analysis-runs` returns 202 with `analysis_run_id` and `status: "pending"`
- [ ] `POST /analysis-runs` returns 422 if `period_end - period_start > 365 days`
- [ ] When >365 days: response includes `warning: "Range adjusted to 1 year maximum"` and corrected dates
- [ ] `POST /analysis-runs` returns 409 if another run for the same member is already `pending` or `analyzing`
- [ ] `GET /analysis-runs/:id` returns current status and `progress_stage`
- [ ] Status transitions correctly: `pending → collecting → analyzing → completed` (or `→ failed`)
- [ ] `POST /members/:id/refresh` creates a new run with `run_type: "refresh_same_period"`

### F2.1–F2.8 Analysis Run UI

- [ ] **[User verify]** Time range picker enforces 1-year max; shows warning toast when exceeded
- [ ] **[User verify]** Refresh button triggers analysis; member status icon changes to spinner
- [ ] **[User verify]** Progress label updates during analysis stages
- [ ] **[User verify]** On `completed`: profile workspace loads
- [ ] **[User verify]** On `failed`: error banner appears with retry button
- [ ] **[User verify]** Starting analysis while one is running shows conflict toast (no duplicate run created)

---

## Milestone 3 — Evidence Extraction

### B3.1–B3.8 P1 + P2 Pipeline

- [ ] `evidence_units` and `behavioral_events` records created in DB for a test run
- [ ] P1 output is valid JSON matching the schema in `prompt-pipeline-spec.md`
- [ ] P2 output deduplicated: no two events with identical `source_record_ids` and `event_type`
- [ ] Low-signal records (acknowledgements, admin chatter) produce 0 events (not forced extraction)
- [ ] `extraction_confidence` field populated (0–1) on every `evidence_unit`
- [ ] Partial collection on source timeout: run continues with available data; error logged

---

## Milestone 4 — Dimension Scoring

### B4.1–B4.13 Scoring Engine

- [ ] `dimension_scores` records created for all 25 dimensions per analysis run
- [ ] Dimensions with `opportunity_score < 0.25` have `maturity_level = "insufficient_opportunity"` and `normalized_score = null`
- [ ] Dimensions with <2 signals have `confidence_label = "low"` (not "high")
- [ ] `confidence_score` is between 0 and 1 (app layer validation)
- [ ] `normalized_score` is between 1 and 5 when present (tanh formula)
- [ ] `category_scores` records created for all 4 categories
- [ ] Category score excludes dimensions with insufficient opportunity
- [ ] Delta computed correctly when a previous run exists for the same member
- [ ] Personal baseline endpoint: `PUT /members/:id/baseline` creates or updates (not duplicates)

---

## Milestone 5 — Human Output Generation

### B5.1–B5.10 P4–P7 Output

- [ ] `kpt_items` created: 3–5 keep, 3–5 problem, 3–5 try items
- [ ] `case_feedbacks` created: 3–8 cases
- [ ] All KPT problem items use pattern-based language (no identity language like "you are bad at X")
- [ ] All Try items are concrete behavioral experiments (not generic advice like "communicate better")
- [ ] `analysis_snapshots` record created and linked to `analysis_run_id` (UNIQUE)
- [ ] `milestones` records append-only: existing milestones not modified on same-period refresh
- [ ] `profile_summary` is 3–5 sentences, not empty
- [ ] All `kpt_items` have `linked_dimension_ids` that correspond to real dimension IDs

---

## Milestone 6 — P8 Self-Critique Gate

### B6.1–B6.5 P8

- [ ] P8 runs on every analysis run before snapshot is finalized
- [ ] If `approved = false`: patches applied to affected summaries; P8 re-run once
- [ ] `p8_approved` and `p8_issues` stored in `analysis_snapshots`
- [ ] A dimension with `confidence < 0.40` and strong claim language gets flagged by P8
- [ ] A dimension marked `insufficient_opportunity` does not appear as a "major weakness" in summaries

---

## Milestone 7 — Profile UI

### B7.1–B7.9 Profile Read Endpoints

- [ ] `GET /members/:id/profile/overview` returns category scores, top strengths, growth areas, confidence
- [ ] `GET /members/:id/profile/competency` returns all 25 dimension entries
- [ ] `GET /members/:id/profile/competency/:dimensionId` returns supporting evidence list
- [ ] `GET /evidence/:evidenceId` returns source, excerpt, related dimensions, confidence
- [ ] All endpoints return 404 for non-existent IDs (not 500)

### F7.1–F7.19 Profile UI

- [ ] **[User verify]** Tab 1 radar chart shows 4 axes with scores
- [ ] **[User verify]** Low-confidence axes visually distinguished (e.g., dashed line)
- [ ] **[User verify]** Top strengths use confidence badges (High / Moderate / Low)
- [ ] **[User verify]** Growth areas use developmental language (not "you are weak at X")
- [ ] **[User verify]** Dimensions with insufficient opportunity show "Insufficient Opportunity" label (no score)
- [ ] **[User verify]** Expandable dimension card shows positive indicators, development indicators, limitation notes
- [ ] **[User verify]** "View trace" button opens right drawer with evidence detail
- [ ] **[User verify]** KPT Try items are specific experiments, not generic advice
- [ ] **[User verify]** Case detail panel shows What Happened / Why It Matters / Better Alternative / Next-Time Guidance
- [ ] **[User verify]** Journey tab shows milestone timeline ordered by date
- [ ] **[User verify]** All 5 tabs show trust disclaimer note
- [ ] **[User verify]** Loading skeleton shown during analysis; empty state shown before first analysis

---

## Milestone 8 — Validation & Trust

### B8.1–B8.3 Validation Flags

- [ ] `POST /validation-flags` returns 201 with `flag_id`
- [ ] Returns 422 if `flag_type` is not one of `accurate | questionable | incorrect`
- [ ] Returns 422 if `target_type` is invalid
- [ ] Flags are preserved on same-period refresh (not deleted with old snapshot)

### F8.1–F8.6 Trust UI

- [ ] **[User verify]** Flag form opens from any dimension card; all 3 options visible
- [ ] **[User verify]** After flagging: yellow flag icon appears on dimension card
- [ ] **[User verify]** Flagged count updates in Competency summary header
- [ ] **[User verify]** "Needs review" banner appears on profile when `p8_approved = false`
- [ ] **[User verify]** Confidence + opportunity badges visible on every scored dimension
- [ ] **[User verify]** Fairness notes section visible on Overview tab when applicable

---

## Milestone 9 — Integration & Polish

- [ ] End-to-end: create org → add member → trigger analysis → view all 5 tabs → flag a dimension
- [ ] Same-period refresh: flags from previous run still visible; milestones not duplicated
- [ ] Analysis history list shows previous runs with period and status
- [ ] **[User verify]** Clicking radar axis jumps to Competency tab filtered by that category
- [ ] **[User verify]** Clicking dimension chip in KPT jumps to Competency tab, scrolled to that dimension
- [ ] **[User verify]** All error states are user-friendly (no raw stack traces visible in UI)

---

## General Checks (apply to every BE task)

After every backend task, verify:

```
uv run ruff format .     ← 0 diffs
uv run ruff check .      ← 0 errors
uv run mypy app          ← passes
uv run pytest            ← all tests pass
uv run alembic upgrade head   ← no errors (if migration added)
```

## General Checks (apply to every FE task)

After every frontend task, verify:

```
pnpm lint      ← 0 errors
pnpm typecheck ← passes
pnpm test      ← all tests pass
```
