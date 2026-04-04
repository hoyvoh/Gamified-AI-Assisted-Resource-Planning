# Epics / Features / User Stories / Acceptance Criteria

**Developer Growth & Evidence-Based Performance Insight Platform — MVP**

> Priority: P0 = MVP blocker, P1 = MVP important, P2 = post-MVP

---

## Epic 1 — Organizational Structure Management

**Goal:** Enable users to create and navigate an Org → Team → Member hierarchy.

---

### Feature 1.1 — Organization CRUD

| Story | As a... | I want to... | So that... | Priority | Owner |
|-------|---------|-------------|-----------|----------|-------|
| S1.1.1 | Admin | Create an organization | I can start grouping teams | P0 | BE + FE |
| S1.1.2 | Admin | Rename an organization | I can fix naming mistakes | P1 | BE + FE |
| S1.1.3 | Admin | Delete an organization | I can remove unused orgs | P1 | BE + FE |
| S1.1.4 | Admin | See org in left sidebar after creation | I can navigate to it | P0 | FE |

**Acceptance Criteria — S1.1.1:**
- Given an authorized user, when they submit a valid org name, then the organization appears in the left sidebar
- Name must be non-empty and max 255 chars
- System returns 201 with org data

---

### Feature 1.2 — Team CRUD

| Story | Priority | Owner |
|-------|----------|-------|
| S1.2.1 Create team under org | P0 | BE + FE |
| S1.2.2 Rename team | P1 | BE + FE |
| S1.2.3 Delete team | P1 | BE + FE |
| S1.2.4 See team nested under org in sidebar | P0 | FE |

**Acceptance Criteria — S1.2.1:**
- Given an organization exists, when user creates a team, then the team appears nested under the org in the sidebar
- Team name required, max 255 chars

---

### Feature 1.3 — Member CRUD

| Story | Priority | Owner |
|-------|----------|-------|
| S1.3.1 Add member to team | P0 | BE + FE |
| S1.3.2 Edit member display name or role | P1 | BE + FE |
| S1.3.3 Remove member | P1 | BE + FE |
| S1.3.4 See member in sidebar with status icon | P0 | FE |
| S1.3.5 Assign role profile to member | P1 | BE + FE |

**Acceptance Criteria — S1.3.1:**
- Given a team exists, when user adds a member with a display name, then the member appears in the sidebar under the team
- Member must belong to exactly one team
- Analysis status shows `not_analyzed` initially

---

## Epic 2 — Analysis Run Management

**Goal:** Allow users to trigger, monitor, and refresh analysis for any member.

---

### Feature 2.1 — Trigger Analysis

| Story | Priority | Owner |
|-------|----------|-------|
| S2.1.1 Select time range and trigger analysis | P0 | BE + FE |
| S2.1.2 System validates period ≤ 365 days | P0 | BE |
| S2.1.3 Auto-correct and warn if range > 1 year | P0 | BE + FE |
| S2.1.4 Prevent duplicate active runs per member | P0 | BE |

**Acceptance Criteria — S2.1.2:**
- Given a user selects a valid date range (≤ 1 year), when they trigger analysis, then the system creates a run and returns 202
- Given a user selects a range > 1 year, then the system auto-adjusts and shows a warning toast before proceeding

---

### Feature 2.2 — Analysis Status Polling

| Story | Priority | Owner |
|-------|----------|-------|
| S2.2.1 See real-time status of running analysis | P0 | FE + BE |
| S2.2.2 See progress stage label during analysis | P1 | FE + BE |
| S2.2.3 Show completion and navigate to profile | P0 | FE |
| S2.2.4 Show error state with retry option | P0 | FE |

**Acceptance Criteria — S2.2.1:**
- While analysis is running, status badge shows `loading` in sidebar and header
- Client polls every 3–5 seconds
- On `completed`: profile workspace becomes available
- On `failed`: error banner with retry button shown

---

### Feature 2.3 — Refresh Analysis

| Story | Priority | Owner |
|-------|----------|-------|
| S2.3.1 Re-run analysis for same period | P0 | BE + FE |
| S2.3.2 Re-run with different date range | P1 | BE + FE |
| S2.3.3 Preserve validation flags on refresh | P0 | BE |
| S2.3.4 Preserve milestone history on refresh | P0 | BE |

**Acceptance Criteria — S2.3.1:**
- Given an existing analysis, when user clicks Refresh, then a new run is created for the same period
- Previous run data is not deleted
- Validation flags from previous insights are preserved

---

## Epic 3 — Member Profile: Overview Tab

**Goal:** Give managers and members a fast, high-level summary of contribution and capability.

---

### Feature 3.1 — Overview Display

| Story | Priority | Owner |
|-------|----------|-------|
| S3.1.1 Show profile summary paragraph | P0 | FE + Analysis |
| S3.1.2 Show radar chart with 4 category scores | P0 | FE + Analysis |
| S3.1.3 Show top 3–5 strengths with confidence | P0 | FE + Analysis |
| S3.1.4 Show top 3 growth areas (non-judgmental) | P0 | FE + Analysis |
| S3.1.5 Show contribution stats (workstreams, ownership, completions) | P1 | FE + Analysis |
| S3.1.6 Show delta from previous period | P1 | FE + Analysis |
| S3.1.7 Show encouragement / reflection summary | P1 | FE + Analysis |

**Acceptance Criteria — S3.1.2:**
- Radar shows 4 axes
- Each axis displays category score with confidence
- Low confidence axes visually indicate uncertainty (e.g. dashed)
- Clicking an axis opens Competency tab filtered to that category

**Acceptance Criteria — S3.1.4:**
- Growth areas use developmental language, not judgmental language
- If insufficient opportunity: show "Insufficient opportunity" label, not a low score

---

### Feature 3.2 — Overview Empty/Loading States

| Story | Priority | Owner |
|-------|----------|-------|
| S3.2.1 Show skeleton loading state during analysis | P0 | FE |
| S3.2.2 Show empty state if no analysis yet | P0 | FE |
| S3.2.3 Show trust disclaimer note | P0 | FE |

---

## Epic 4 — Member Profile: Competency & Evidence Tab

**Goal:** Allow users to understand why each skill was evaluated as it was, with evidence.

---

### Feature 4.1 — Dimension Cards

| Story | Priority | Owner |
|-------|----------|-------|
| S4.1.1 Show all dimensions as expandable cards | P0 | FE + Analysis |
| S4.1.2 Show maturity level, confidence, opportunity per dimension | P0 | FE + Analysis |
| S4.1.3 Expand card to see positive/negative patterns | P0 | FE |
| S4.1.4 Show counter-evidence/limitation note per dimension | P0 | FE + Analysis |
| S4.1.5 Show supporting evidence list per dimension | P0 | FE + Analysis |
| S4.1.6 Show delta badge per dimension | P1 | FE + Analysis |

**Acceptance Criteria — S4.1.2:**
- Dimensions with `insufficient_opportunity` show "Insufficient Opportunity" instead of a score
- Confidence is shown as High / Moderate / Low badge
- Opportunity is shown as High / Medium / Low / Insufficient badge

---

### Feature 4.2 — Evidence Trace

| Story | Priority | Owner |
|-------|----------|-------|
| S4.2.1 Show evidence trace drawer on "View trace" click | P0 | FE + BE |
| S4.2.2 Trace shows source, excerpt, related dimensions, context | P0 | FE |
| S4.2.3 Allow user to flag evidence as irrelevant/misinterpreted | P2 | FE + BE |

**Acceptance Criteria — S4.2.1:**
- Right drawer opens with evidence detail
- Evidence includes timestamp, source type, excerpt, related dimensions
- "View trace" button visible on each evidence list item

---

### Feature 4.3 — Dimension Filtering

| Story | Priority | Owner |
|-------|----------|-------|
| S4.3.1 Filter dimensions by category | P1 | FE |
| S4.3.2 Filter by confidence level | P1 | FE |
| S4.3.3 Filter by opportunity level | P1 | FE |
| S4.3.4 Search dimension by name | P2 | FE |

---

### Feature 4.4 — Assessment Validation

| Story | Priority | Owner |
|-------|----------|-------|
| S4.4.1 Flag a dimension as accurate / questionable / incorrect | P0 | FE + BE |
| S4.4.2 Add optional note when flagging | P1 | FE + BE |
| S4.4.3 Show flag icon on flagged dimension cards | P1 | FE |
| S4.4.4 Show flagged count in competency summary header | P1 | FE |

**Acceptance Criteria — S4.4.1:**
- User can flag any dimension
- Flag is submitted to POST /validation-flags
- Stored and preserved across same-period refresh
- UI updates to show flag state immediately

---

## Epic 5 — Member Profile: KPT Tab

**Goal:** Provide a coaching-grade retrospective for the selected period.

---

### Feature 5.1 — KPT Display

| Story | Priority | Owner |
|-------|----------|-------|
| S5.1.1 Show Keep / Problem / Try sections | P0 | FE + Analysis |
| S5.1.2 Each item links to supporting evidence or dimension | P1 | FE |
| S5.1.3 Show Development Focus box | P1 | FE + Analysis |
| S5.1.4 Show intro + coaching reminder note | P0 | FE |

**Acceptance Criteria — S5.1.1:**
- 3–5 items shown per section
- Problem items use pattern-based, non-judgmental language
- Try items are specific, behavioral next steps (not generic advice)

---

## Epic 6 — Member Profile: Case-Based Feedback Tab

**Goal:** Surface concrete, high-learning-value coaching cases.

---

### Feature 6.1 — Case List and Detail

| Story | Priority | Owner |
|-------|----------|-------|
| S6.1.1 Show list of notable cases with summary cards | P0 | FE + Analysis |
| S6.1.2 Show full case detail on click | P0 | FE |
| S6.1.3 Link cases to related dimensions | P1 | FE |
| S6.1.4 Link cases to supporting evidence with trace | P1 | FE + BE |
| S6.1.5 Show improvement theme summary at tab footer | P1 | FE + Analysis |

**Acceptance Criteria — S6.1.2:**
- Detail panel shows: What Happened / Why It Matters / Observed Pattern / Better Alternative / Next-Time Guidance
- Corrective cases outnumber positive cases in most analyses (expected)
- Cases do not moralize or use identity language

---

## Epic 7 — Member Profile: Journey & Milestones Tab

**Goal:** Show long-term growth trajectory and milestone history.

---

### Feature 7.1 — Timeline and Milestones

| Story | Priority | Owner |
|-------|----------|-------|
| S7.1.1 Show milestone timeline visualization | P1 | FE + Analysis |
| S7.1.2 Show milestone detail on click | P1 | FE |
| S7.1.3 Show growth pattern summary | P1 | FE + Analysis |
| S7.1.4 Show development path interpretation | P2 | FE + Analysis |
| S7.1.5 Retain milestones up to 5 years | P0 | BE |

**Acceptance Criteria — S7.1.1:**
- Timeline shows nodes ordered by date
- Nodes represent: major_delivery, ownership_shift, learning_breakthrough, quality_lesson, etc.
- Milestones from outside the current analysis window shown in muted style
- Empty state shown if no milestones yet

**Acceptance Criteria — S7.1.5:**
- Milestones stored in DB are retained across analysis refresh
- Soft-delete only; hard delete not allowed in MVP

---

## Epic 8 — Trust & Fairness Mechanisms

**Goal:** Ensure the product earns and keeps user trust.

---

### Feature 8.1 — Trust UX

| Story | Priority | Owner |
|-------|----------|-------|
| S8.1.1 Show trust disclaimer on all profile tabs | P0 | FE |
| S8.1.2 Show fairness notes on Overview if applicable | P0 | FE + Analysis |
| S8.1.3 Show "insufficient dimensions" list on Overview | P1 | FE + Analysis |
| S8.1.4 Confidence badge on every scored item | P0 | FE |
| S8.1.5 Opportunity badge on every dimension | P0 | FE |

---

### Feature 8.2 — P8 Self-Critique Gate

| Story | Priority | Owner |
|-------|----------|-------|
| S8.2.1 All analysis runs pass through P8 before persist | P0 | Analysis |
| S8.2.2 P8 issues stored in snapshot | P0 | BE + Analysis |
| S8.2.3 Human review recommended if p8_approved = false | P1 | FE |

---

## Scope: MVP vs Post-MVP

### MVP (P0 + P1 above)

- Full org/team/member hierarchy management
- Analysis trigger, polling, status
- Overview tab (full)
- Competency & Evidence tab (full)
- KPT tab (full)
- Case-based Feedback tab (full)
- Journey tab (basic: milestones list, pattern summary)
- Validation flags (basic: flag dimension)
- Trust disclaimers on all tabs
- P8 self-critique gate (mandatory)

### Post-MVP (P2)

- Dimension search in Competency filter
- Evidence relevance marking
- Development path archetype (Journey tab Component 5)
- Period comparison export
- Team-level capability heatmap
- Baseline evolution tracking
- Role-aware development ladders
- Manager annotation layer
- Exportable coaching packet
