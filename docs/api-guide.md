# API Guide — Relationships, Input/Output & UI Mapping

> Base URL: `http://localhost:8000`  
> API prefix: `/api/v1`  
> All responses wrapped in `{ "data": <T> }` except `DELETE` (204) and `/health`.

---

## 1. Entity Relationship Map

```
Organization
  └── Team (1..N)
        └── Member (1..N)
              ├── RoleProfile (ref, 1:1)
              ├── AnalysisRun (1..N)  ← each run = one analysis cycle
              │     ├── EvidenceUnit[]         (raw GitHub/Slack records)
              │     ├── BehavioralEvent[]      (LLM-inferred events)
              │     ├── DimensionScore[]       (25 scored dimensions)
              │     ├── CategoryScore[]        (4 category aggregates)
              │     ├── KptItem[]              (Keep / Problem / Try)
              │     ├── CaseFeedback[]         (incident case studies)
              │     └── AnalysisSnapshot       (1:1 per run, summary snapshot)
              └── Milestone[]                  (retained across runs, per-member)
```

**Key rules:**
- One `AnalysisRun` per active period per member. Conflict (409) if a run already active.
- `AnalysisSnapshot` is `1:1` with a run — created at end of pipeline.
- `Milestone` is owned by member, not run — survives across multiple analysis cycles (`retained=true` to show).
- `CategoryScore` groups `DimensionScore` into 4 buckets (core_technical_execution, engineering_mindset, collaboration_growth, technical_depth_breadth).
- `DimensionScore` links back to evidence via `top_supporting_evidence_ids` / `top_counter_evidence_ids`.
- `CaseFeedback` and `BehavioralEvent` cross-reference via `supporting_event_ids`.

---

## 2. API Groups

### 2.1 Organization / Team / Member (CRUD)

These APIs manage the org hierarchy. They are used by the admin shell, not the Analysis Chamber.

| Method | Endpoint | Input | Output |
|---|---|---|---|
| POST | `/organizations` | `{ name }` | OrganizationResponse |
| GET | `/organizations` | — | OrganizationListItem[] |
| GET | `/organizations/{org_id}` | path: org_id | OrganizationDetailResponse (with team+member tree) |
| PATCH | `/organizations/{org_id}` | `{ name }` | OrganizationResponse |
| DELETE | `/organizations/{org_id}` | path: org_id | 204 |
| POST | `/organizations/{org_id}/teams` | `{ name }` | TeamResponse |
| PATCH | `/organizations/{org_id}/teams/{team_id}` | `{ name }` | TeamResponse |
| DELETE | `/organizations/{org_id}/teams/{team_id}` | — | 204 |
| POST | `/organizations/{org_id}/teams/{team_id}/members` | `{ display_name, external_id?, role_profile_id? }` | MemberResponse |
| PATCH | `/organizations/{org_id}/teams/{team_id}/members/{member_id}` | `{ display_name, external_id?, role_profile_id? }` | MemberResponse |
| DELETE | `/organizations/{org_id}/teams/{team_id}/members/{member_id}` | — | 204 |
| GET | `/members/{member_id}` | path: member_id | MemberResponse |

**MemberResponse fields of note:**
- `analysis_status` — reflects current analysis state (`pending / collecting / analyzing / completed / failed`)
- `last_analysis_at` — ISO timestamp of last completed run
- `role_profile_id` — links to benchmark expectations used in scoring

---

### 2.2 Role Profiles

Pre-loaded reference data. Defines expected dimension weights and maturity benchmarks per role.

| Method | Endpoint | Input | Output |
|---|---|---|---|
| GET | `/role-profiles` | — | RoleProfileResponse[] |
| GET | `/role-profiles/{role_profile_id}` | path | RoleProfileResponse |

**RoleProfileResponse:**
- `expected_dimension_weights` — map of `{ dimension_id: weight }`, used to score relative importance
- `expected_opportunity_levels` — expected growth ceiling per dimension
- `expected_maturity_ranges` — baseline maturity expectations per dimension

---

### 2.3 Analysis Run (trigger + polling)

Core async workflow. Creating a run starts the pipeline in a background task.

| Method | Endpoint | Input | Output |
|---|---|---|---|
| POST | `/analysis-runs` | `{ member_id, period_start, period_end, run_type }` | 202 + AnalysisRunResponse |
| GET | `/analysis-runs/{run_id}` | path: run_id | AnalysisRunResponse (live status) |
| GET | `/members/{member_id}/analysis-runs` | path + query `limit/offset` | AnalysisRunResponse[] |
| POST | `/members/{member_id}/refresh` | `{ period_start, period_end }` | 202 + AnalysisRunResponse |

**AnalysisRunResponse fields:**
- `status`: `pending → collecting → analyzing → completed | failed`
- `progress_stage`: human-readable current step (see pipeline below)
- `progress_pct`: 0–100 integer
- `error_message`: set if `status = failed`
- `run_type`: `fresh` (new analysis) or `refresh_same_period` (re-run same dates)

**409 error** — a run is already active for this member. Must wait or fail the existing run first.

---

### 2.4 Profile APIs (read-only, post-analysis)

All 5 profile endpoints follow the same contract:
- `GET /api/v1/members/{member_id}/profile/<tab>`
- Always returns data from the **latest completed run**
- `404` if no completed run exists

#### Overview — `/profile/overview`

**Purpose:** Aggregate view. Single source of truth for hero panel and confidence display.

**Output — `ProfileOverviewResponse`:**

| Field | Type | What it represents |
|---|---|---|
| `run_id` | string | Which run this data comes from |
| `period_start / period_end` | string | Analysis window |
| `p8_approved` | boolean | LLM self-critique quality gate passed |
| `overall_confidence` | number 0–1 | Overall confidence in the analysis |
| `profile_summary` | string | 2–5 sentence narrative about the member |
| `growth_journey_summary` | string | Narrative about growth over time |
| `current_growth_path` | string | Archetype label: "Reliable Executor" / "Emerging Owner" / etc. |
| `top_strength_dimension_ids` | string[] | Top 3 dimension IDs where member excels |
| `top_growth_dimension_ids` | string[] | Top 2 dimension IDs with highest growth potential |
| `insufficient_dimensions` | string[] | Dimensions skipped due to insufficient data |
| `fairness_notes` | string[] | Caveats about data quality or coverage gaps |
| `category_scores` | CategoryScore[] | 4-category aggregate scores (used in radar chart) |

**UI reflections:**
- `profile_summary` → hero narrative text block
- `current_growth_path` → archetype badge on hero
- `overall_confidence` → confidence meter in header
- `category_scores` → radar/star chart data
- `top_strength_dimension_ids` → strength chip list
- `top_growth_dimension_ids` → growth area chip list
- `fairness_notes` → fairness warning banners

---

#### Competency — `/profile/competency`

**Purpose:** Dimension-level breakdown. Filterable by category and maturity.

**Query params:** `category?` (string), `maturity?` (string)

**Output — `ProfileCompetencyResponse`:**

| Field | Type | What it represents |
|---|---|---|
| `dimension_scores` | DimensionScore[] | Scored list of dimensions |
| `category_scores` | CategoryScore[] | Same as overview, for category tab header |

**DimensionScore fields:**

| Field | Type | What it represents |
|---|---|---|
| `dimension_id` | string | Canonical dimension key (e.g. `implementation_reliability`) |
| `raw_score` | number 0–10 | Actual score |
| `normalized_score` | number 0–1 | For comparisons |
| `maturity_level` | string | `Foundational / Intermediate / Advanced` |
| `confidence_label` | string | `High / Moderate / Low` |
| `opportunity_label` | string | `High / Medium / Low / Insufficient` |
| `delta_value / delta_label` | number + string | Change vs baseline (`Improved / Stable / Declined`) |
| `positive_signals / negative_signals / mixed_signals` | int | Evidence signal counts |
| `explanation_summary` | string | Short narrative explanation |
| `top_supporting_evidence_ids` | string[] | IDs for evidence drill-down |

**CategoryScore fields:**

| Field | Type | What it represents |
|---|---|---|
| `category_id` | string | One of 4 groups |
| `score` | number 0–10 | Weighted average of included dimensions |
| `confidence_label` | string | Aggregate confidence |
| `included_dimensions` | string[] | Dimensions with enough data to score |
| `excluded_dimensions` | string[] | Dimensions skipped (insufficient data) |
| `explanation_summary` | string | Category-level narrative |

**UI reflections:**
- `dimension_scores` → dimension card grid (score bar, maturity badge, signal bars)
- `included_dimensions.length` → "INCLUDED LANES" counter
- `excluded_dimensions.length` → "AWAITING PROOF" counter
- Filter by `category` → tab switch within Competency screen
- Click dimension card → navigate to detail drawer

---

#### Competency Detail — `/profile/competency/{dimension_id}`

**Purpose:** Deep dive into one dimension — evidence, counter-evidence, behavioral events.

**Output — `DimensionDetailResponse`:**

| Field | Type | What it represents |
|---|---|---|
| `dimension_score` | DimensionScoreDetail | Score + `p3_inference` (LLM reasoning object) |
| `supporting_evidence` | EvidenceUnit[] | Raw GitHub/Slack records that support this dimension |
| `counter_evidence` | EvidenceUnit[] | Records that challenge or contradict the score |
| `behavioral_events` | BehavioralEvent[] | Filtered events linked to this dimension |

**EvidenceUnit fields:**
- `content_excerpt` — raw text from GitHub PR / commit / comment
- `record_type` — `pr_authored / pr_reviewed / commit / comment / etc.`
- `extraction_confidence` — how confident LLM was extracting this evidence

**BehavioralEvent fields:**
- `event_type` — behavioral category (e.g. `code_review_insight`, `communication_gap`)
- `polarity` — `positive / negative / mixed`
- `severity` — 0–10 impact rating
- `why_it_matters` — LLM-generated reasoning

**UI reflections:**
- Opens in side drawer when dimension card clicked
- Evidence list with source badges + excerpts
- Polarity-colored event timeline

---

#### KPT — `/profile/kpt`

**Purpose:** Structured coaching feedback in Keep / Problem / Try format.

**Output — `ProfileKptResponse`:**

| Field | Type | What it represents |
|---|---|---|
| `keep_items` | KptItem[] | Behaviors/practices to continue |
| `problem_items` | KptItem[] | Patterns/gaps to address |
| `try_items` | KptItem[] | Concrete experiments to attempt |

**KptItem fields:**

| Field | Type | What it represents |
|---|---|---|
| `item_type` | string | `keep / problem / try` |
| `title` | string | Action-oriented headline |
| `summary` | string | Why this item matters |
| `linked_dimension_ids` | string[] | Cross-link to competency dimensions |
| `linked_problem_ids` | string[] | For Try items: which Problem it addresses |
| `display_order` | int | Sort order within section |

**UI reflections:**
- 3-column parchment layout (Keep / Problem / Try scrolls)
- `linked_problem_ids` → draw connection line from Try to Problem card
- `linked_dimension_ids` → cross-navigate to Competency dimension

---

#### Cases — `/profile/cases`

**Purpose:** Story-based coaching via concrete incident case studies.

**Output — `ProfileCasesResponse`:**

| Field | Type | What it represents |
|---|---|---|
| `cases` | CaseFeedback[] | List ordered by `display_order` |

**CaseFeedback fields:**

| Field | Type | What it represents |
|---|---|---|
| `title` | string | Short incident headline |
| `category` | string | Incident type (Communication, Quality, Ownership, etc.) |
| `impact_level` | string | `low / medium / high` |
| `summary` | string | What happened |
| `why_it_matters` | string | Business / team impact context |
| `observed_pattern` | string | How often/where this pattern recurs |
| `better_alternative` | string | Concrete improvement suggestion |
| `next_time_guidance` | string | Actionable steps for next occurrence |
| `linked_dimension_ids` | string[] | Cross-link to Competency dimensions |
| `confidence_score` | number 0–1 | AI confidence in this case |

**UI reflections:**
- Archive ledger: each case is a record card in the archive
- `impact_level` → colored badge (high=red, medium=amber, low=grey)
- `confidence_score` → small confidence indicator on card
- Click → detail drawer with full case narrative
- `linked_dimension_ids` → cross-nav to Competency

---

#### Journey — `/profile/journey`

**Purpose:** Growth narrative over time — milestones on a timeline, archetype progression.

**Output — `ProfileJourneyResponse`:**

| Field | Type | What it represents |
|---|---|---|
| `growth_journey_summary` | string | Paragraph narrative about growth trajectory |
| `current_growth_path` | string | Current archetype (same as overview) |
| `milestones` | Milestone[] | Ordered by `timestamp` ascending |

**Milestone fields:**

| Field | Type | What it represents |
|---|---|---|
| `milestone_type` | string | `ownership_shift / quality_signal / collaboration_signal / delivery_milestone / learning_moment` |
| `title` | string | Milestone headline |
| `summary` | string | 1–2 sentence description |
| `impact_score` | number 0–10 | Significance of this milestone |
| `timestamp` | string | When this event occurred |
| `source_analysis_run_id` | string? | Which run first identified this milestone |

**UI reflections:**
- Realm map / timeline: milestones as plot points on expedition log
- `impact_score` → size/brightness of milestone marker
- `milestone_type` → icon/sigil on the timeline node
- `growth_journey_summary` → narrative text at top of journey screen
- `current_growth_path` → archetype banner

---

### 2.5 Supporting APIs

| Endpoint | Purpose |
|---|---|
| `GET /members/{member_id}/profile/evidence` | Paginated evidence list with search + source/type filters. Used for evidence library. |
| `GET /evidence/{evidence_id}` | Single evidence detail. |
| `GET /members/{member_id}/milestones` | Full milestone history for the member. |
| `PUT /members/{member_id}/baseline` | Set personal baseline for dimension comparison. |
| `POST /validation-flags` | HR/manager flags a dimension as `accurate / questionable / incorrect`. |
| `GET /analysis-runs/{run_id}/validation-flags` | List all human flags for a run. |

---

## 3. Analysis Pipeline Flow

When `POST /analysis-runs` is called, the following background job runs:

```
[POST /analysis-runs]
        │
        ▼
status: pending
        │
        ▼
status: collecting  ─── progress_stage: "collecting_data"
   │  GitHub CLI: fetch PRs, commits, reviews, comments for member
   │  Stores → SourcePayload (raw JSON)
        │
        ▼
status: analyzing
   │
   ├── P1: extracting_evidence
   │     LLM reads raw records in chunks
   │     Stores → EvidenceUnit[] (content_excerpt, record_type, extraction_confidence)
   │
   ├── P2: (consolidation)
   │     Deduplicate + merge overlapping evidence signals
   │
   ├── P3: inferring_dimensions
   │     LLM maps evidence → 25 dimension IDs
   │     Stores → p3_inference on DimensionScore
   │
   ├── Scoring: scoring
   │     Calculate raw_score, confidence, opportunity per dimension
   │     Apply role_profile weights
   │     Stores → DimensionScore[], CategoryScore[]
   │
   ├── P5: generating_kpt
   │     LLM generates Keep/Problem/Try from dimension patterns
   │     Stores → KptItem[]
   │
   ├── P6: generating_cases
   │     LLM generates incident case studies from BehavioralEvent patterns
   │     Stores → CaseFeedback[]
   │
   ├── P7: generating_overview
   │     LLM synthesizes profile_summary, growth_journey_summary, growth_path, fairness_notes
   │     Stores → AnalysisSnapshot (+ top_strength_dimension_ids, top_growth_dimension_ids)
   │     Stores → Milestone[] (retained=true for significant events)
   │
   └── P8: self_checking
         LLM critiques its own output for quality/bias
         Sets → p8_approved, p8_issues on AnalysisSnapshot
         If fails → status: failed with error_message
        │
        ▼
status: completed   ─── progress_pct: 100
   All profile endpoints now return data.
```

**Polling pattern (frontend):**
```
POST /analysis-runs → get run_id
  loop every 3s:
    GET /analysis-runs/{run_id}
    → check status + progress_pct + progress_stage
    → update progress bar UI
    → if status = "completed": load profile data
    → if status = "failed": show error_message
```

---

## 4. Frontend Execution Flow (per screen)

### App boot / member page load

```
1. GET /members/{member_id}
   → confirm member exists, get display_name, analysis_status, role_profile_id

2. GET /role-profiles/{role_profile_id}
   → load role benchmark for context

3. GET /members/{member_id}/analysis-runs?limit=1
   → get latest run, check status
   → if status = completed: proceed to load chamber data
   → if status = active: show progress polling UI
   → if no runs: show "Start Analysis" CTA
```

---

### Analysis Chamber — tab data loading

Each tab is a separate fetch, loaded lazily when user navigates to that tab:

```
TAB: Overview
  → GET /members/{member_id}/profile/overview
  → Renders: hero narrative, archetype, confidence, radar chart, strength/growth chips

TAB: Competency
  → GET /members/{member_id}/profile/competency
  → Renders: dimension card grid, category lane headers, included/excluded counts
  → On card click: GET /members/{member_id}/profile/competency/{dimension_id}
  → Renders in drawer: evidence list, behavioral events, p3_inference

TAB: KPT
  → GET /members/{member_id}/profile/kpt
  → Renders: 3 scroll panels (Keep / Problem / Try)
  → Try items link to Problem items via linked_problem_ids

TAB: Cases
  → GET /members/{member_id}/profile/cases
  → Renders: archive ledger card list
  → On card click: GET /members/{member_id}/profile/cases/{case_id}
  → Renders in drawer: full case narrative with guidance

TAB: Journey
  → GET /members/{member_id}/profile/journey
  → Renders: growth summary text, archetype banner, milestone timeline
```

---

### Cross-tab navigation

These cross-links exist in the data and should be wired in the UI:

| From | Field | To |
|---|---|---|
| KPT item | `linked_dimension_ids` | Competency tab → highlight that dimension |
| Case card | `linked_dimension_ids` | Competency tab → open dimension drawer |
| BehavioralEvent | `related_dimensions[].dimension_id` | Competency dimension detail |
| Try item | `linked_problem_ids` | Problem item (same tab) |
| Milestone | `source_analysis_run_id` | Analysis run detail |

---

## 5. Data Dependencies Summary

Which tables must have data for each screen to be non-empty:

| Screen | Required Tables | Empty State If Missing |
|---|---|---|
| Overview | `AnalysisSnapshot`, `CategoryScore` | No profile summary, no radar chart |
| Competency | `DimensionScore`, `CategoryScore` | "INCLUDED LANES: 0" |
| KPT | `KptItem` | Empty keep/problem/try columns |
| Cases | `CaseFeedback` | "ARCHIVE IS EMPTY" |
| Journey | `Milestone`, `AnalysisSnapshot` | "NO LANDMARKS YET", no narrative |

To seed all screens: run `be/scripts/seed_demo_data.py` — creates all required tables for a demo member.

---

## 6. Error Handling Reference

| Code | Meaning | When |
|---|---|---|
| `404` | Resource not found | member_id, run_id, case_id doesn't exist |
| `409` | Conflict | Analysis run already active for member |
| `422` | Validation error | Invalid date format, out-of-range values |
| `202` | Accepted (async) | Analysis run created, job running in background |
| `204` | No content | Successful DELETE |

All error responses: `{ "detail": "..." }`

---

## 7. Taxonomy Reference (25 Dimensions → 4 Categories)

```
core_technical_execution (A)
  A1 implementation_reliability
  A2 code_quality_discipline
  A3 debugging_root_cause
  A4 careless_mistake_control
  A5 technical_ownership
  A6 technical_learning_adaptability

technical_depth_breadth (B)
  B1 backend_capability
  B2 frontend_capability
  B3 devops_delivery_capability
  B4 system_integration_capability
  B5 data_interface_handling
  B6 architecture_exposure

engineering_mindset (C)
  C1 quality_mindset
  C2 performance_awareness
  C3 security_awareness
  C4 maintainability_thinking
  C5 risk_awareness
  C6 decision_hygiene

collaboration_growth (D)
  D1 problem_solving
  D2 self_management
  D3 horenso_reporting_discipline
  D4 user_first
  D5 collaboration
  D6 mentoring_knowledge_support
  D7 ai_leverage_ability
```
