# MVP Build Plan

**Developer Growth & Evidence-Based Performance Insight Platform — MVP**

---

## 1. MVP Scope (Locked)

The MVP delivers a working end-to-end system for:

1. Creating and navigating an Org → Team → Member hierarchy
2. Triggering a time-bounded analysis for a member
3. Viewing a 5-tab member profile:
   - Overview (radar, strengths, growth areas)
   - Competency & Evidence (all 25 dimensions, evidence trace)
   - KPT (Keep / Problem / Try retrospective)
   - Case-Based Feedback (concrete coaching cases)
   - Journey & Milestones (timeline, pattern summary)
4. Validating and flagging insights
5. P8 self-critique gate before every persist

---

## 2. Out of Scope for MVP

- Automated compensation / promotion recommendations
- Multi-user auth / role-based access control (single-user mode acceptable for MVP)
- Third-party integrations (GitHub, Jira, Slack) — manual data input or stub data in MVP
- Team-level capability heatmaps
- Period-to-period comparison export
- Development path archetype (Journey tab Component 5)
- Role-aware development ladders
- Manager annotation layer
- Exportable coaching packets

---

## 3. Tech Stack (Confirmed)

| Layer | Tech |
|-------|------|
| Frontend | Next.js (TypeScript) |
| Backend | Python (FastAPI or similar) |
| Database | SQLite |
| AI Pipeline | Claude API (claude-sonnet-4-6) |
| Deployment | Local / single-machine for MVP |

---

## 4. Implementation Milestones

### Milestone 1 — Skeleton & Hierarchy

**Goal:** Working app shell with full org/team/member CRUD.

**Deliverables:**
- Left sidebar with org tree
- Create/rename/delete org, team, member flows
- Member node with status icon
- Basic routing: select member → show empty profile workspace
- SQLite DB with tables: organizations, teams, members, role_profiles

**Done when:**
- User can create org → team → member and navigate to member workspace

---

### Milestone 2 — Analysis Run Infrastructure

**Goal:** Trigger analysis, poll status, handle failure.

**Deliverables:**
- `analysis_runs` table + API
- POST /analysis-runs endpoint
- GET /analysis-runs/:id polling endpoint
- Job queue / background worker skeleton
- Status badge updates in header and sidebar
- Time range picker with 1-year validation + auto-correct + warning

**Done when:**
- User can trigger a run, poll it, and see it fail gracefully (no AI pipeline yet)

---

### Milestone 3 — Data Collection & Evidence Extraction (P1 + P2)

**Goal:** Pipeline ingests data and produces `BehavioralEvent` records.

**Deliverables:**
- Source data input (stub files or manual JSON for MVP)
- P1 prompt execution (chunked, parallel)
- P2 event consolidation
- `evidence_units` and `behavioral_events` stored to DB
- Unit tests with representative event extraction cases

**Done when:**
- Given sample source data, system produces a clean set of behavioral events

---

### Milestone 4 — Dimension Scoring (P3 + Scoring Engine)

**Goal:** Full scoring pipeline produces `DimensionScore` and `CategoryScore` records.

**Deliverables:**
- P3 dimension inference (per dimension, parallel)
- Scoring engine (signal mass, dimension score, category score)
- Confidence scoring
- Opportunity gate guardrail
- Delta computation (if previous run exists)
- `dimension_signals`, `dimension_scores`, `category_scores` stored to DB
- Scoring version tracking

**Done when:**
- Given behavioral events, system produces scored dimension output with confidence + opportunity labels

---

### Milestone 5 — Human Output Generation (P4 + P5 + P6 + P7)

**Goal:** All profile tab content is generated and stored.

**Deliverables:**
- P4 dimension UI summaries
- P5 KPT generation
- P6 case-based feedback generation
- P7 overview + journey summary
- `kpt_items`, `case_feedbacks`, `analysis_snapshots` stored to DB
- Milestone derivation logic + `milestones` append

**Done when:**
- All 5 profile tabs have content to display for a completed analysis run

---

### Milestone 6 — Self-Critique Gate (P8)

**Goal:** P8 runs on every analysis before persist; overclaims are patched.

**Deliverables:**
- P8 prompt execution
- Patch logic (apply recommended_fix to summaries)
- P8 retry once on failure
- `p8_approved`, `p8_issues` stored in snapshot
- "Needs review" banner in UI when `p8_approved = false`

**Done when:**
- P8 runs on every completed analysis; no obviously overclaimed output ships without at minimum a flag

---

### Milestone 7 — Profile UI (All 5 Tabs)

**Goal:** Full profile workspace is rendered and navigable.

**Deliverables:**
- Member workspace header + summary strip
- Tab navigation
- Tab 1: Overview (all 7 components)
- Tab 2: Competency & Evidence (dimension cards, evidence trace drawer)
- Tab 3: KPT (all sections)
- Tab 4: Case-Based Feedback (case list + detail panel)
- Tab 5: Journey & Milestones (timeline + pattern summary)
- All empty/loading/error states implemented
- Trust disclaimer notes on all tabs

**Done when:**
- Full profile renders correctly for a completed analysis run, all tabs navigable

---

### Milestone 8 — Validation & Trust UI

**Goal:** Users can flag insights; trust signals are visible.

**Deliverables:**
- Validation flag form (accurate / questionable / incorrect + optional note)
- POST /validation-flags API
- Flag icon on flagged dimension cards
- Flagged count in competency summary header
- Confidence + opportunity badges on all scored items
- Fairness notes on Overview tab

**Done when:**
- Users can flag any dimension insight and the flag is stored and displayed

---

### Milestone 9 — Integration, Polish, Hardening

**Goal:** End-to-end working and stable for first use.

**Deliverables:**
- End-to-end happy path test (create org → analyze → view profile → flag)
- Error states wired throughout
- Retry / failure / timeout behavior verified
- Analysis run history list for member
- PRAGMA foreign_keys = ON enforcement
- Basic performance testing (analysis time for 1 member, 3-month window)

**Done when:**
- The system can be demonstrated end-to-end with real or representative data

---

## 5. Sprint Breakdown (Suggested)

| Sprint | Milestones | Target |
|--------|-----------|--------|
| Sprint 1 | M1 (Skeleton + Hierarchy) | Week 1–2 |
| Sprint 2 | M2 (Analysis Run Infrastructure) | Week 3 |
| Sprint 3 | M3 (Evidence Extraction) | Week 4–5 |
| Sprint 4 | M4 (Dimension Scoring) | Week 6–7 |
| Sprint 5 | M5 (Human Output Generation) | Week 8–9 |
| Sprint 6 | M6 (P8 Self-Critique Gate) | Week 10 |
| Sprint 7 | M7 (Profile UI) | Week 11–13 |
| Sprint 8 | M8 (Validation & Trust UI) | Week 14 |
| Sprint 9 | M9 (Integration, Polish) | Week 15–16 |

---

## 6. Technical Spikes (TBD — needs team input)

The following areas need investigation before or during implementation:

| Spike | Question | When |
|-------|----------|------|
| SP-01 | How to best chunk raw records for P1 (optimal batch size, grouping heuristic) | Before Sprint 3 |
| SP-02 | Parallel prompt execution: concurrency model for P1 and P3 | Before Sprint 3 |
| SP-03 | Scoring engine normalization tuning (tanh formula calibration) | Sprint 4 |
| SP-04 | P8 patch application: automated text replacement vs re-prompt | Sprint 6 |
| SP-05 | SQLite performance under load: index optimization for evidence / event queries | Sprint 9 |
| SP-06 | Milestone derivation threshold tuning (what impact_score triggers a milestone) | Sprint 5 |

---

## 7. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| P3 inference inconsistency across runs | Medium | High | Consistent system prompt + scoring version tracking |
| P8 false negatives (overclaims slip through) | Medium | High | Gold test cases + manual spot checks post-launch |
| Analysis pipeline too slow for 1-year window | Medium | Medium | Use summarize-first strategy for 6–12 month ranges |
| SQLite performance bottleneck on evidence queries | Low | Medium | Add indexes, spike in Sprint 9 |
| AI API rate limits hit during parallel P1/P3 | Medium | Medium | Implement concurrency cap + retry with backoff |
| Users distrust AI output from day one | High | High | Lead with confidence badges, evidence trace, P8, validation flags |
| Manager misuses profile as punishment tool | Medium | Very High | Product framing, UI trust notes, never show absolute low scores |
| Hallucination in P5/P6/P7 summaries | Medium | High | P8 gate is mandatory; all summaries must trace to P3 inference |

---

## 8. Release Readiness Checklist

Before first use with real data:

**Pipeline:**
- [ ] P1–P8 all tested end-to-end on synthetic data
- [ ] P8 gate catches at least 3 of the 5 overclaim scenarios in test set
- [ ] Scoring engine produces expected maturity levels for known test inputs
- [ ] Delta computation validated against two-run sequence

**Data integrity:**
- [ ] SQLite FK enforcement verified (`PRAGMA foreign_keys = ON` on every connection)
- [ ] Same-period refresh preserves validation flags and milestones
- [ ] Milestone append-only behavior verified

**UI:**
- [ ] All 5 tabs render correctly for completed analysis
- [ ] Empty / loading / error states tested for all tabs
- [ ] Trust disclaimers visible on all profile tabs
- [ ] Validation flag flow tested end-to-end

**Trust:**
- [ ] No dimension surfaced as strong weakness with `confidence < 0.40`
- [ ] No dimension scored when `opportunity < 0.25`
- [ ] All surfaced growth areas use developmental (not judgmental) language
- [ ] Profile summary does not use identity language ("this person is X")
