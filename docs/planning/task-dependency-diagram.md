# Task Dependency Diagram

**Gamified Resource Planning — Pillar 2 MVP**

---

## Core Principle: BE First, Then FE

Backend tasks establish the data model, API contracts, and pipeline logic. Frontend tasks consume the API. No frontend task should start until its corresponding backend endpoint is verified and returning the correct response shape.

---

## Dependency Flow (Milestone Level)

```
M1-BE: Skeleton + DB + CRUD APIs
  │
  ├──► M1-FE: App shell + sidebar (can start in parallel with M1-BE using mocked data)
  │
  └──► M2-BE: Analysis Run Infrastructure
         │
         ├──► M2-FE: Time picker + polling UI (needs B2.2, B2.4 done)
         │
         └──► M3-BE: Evidence Extraction (P1 + P2)
                │
                └──► M4-BE: Dimension Scoring (P3 + Scoring Engine)
                       │
                       └──► M5-BE: Human Output Generation (P4–P7)
                              │
                              └──► M6-BE: P8 Self-Critique Gate
                                     │
                                     ├──► M7-BE: Profile Read Endpoints
                                     │      │
                                     │      └──► M7-FE: All 5 Profile Tabs (needs M7-BE)
                                     │
                                     └──► M8-BE: Validation Flags
                                            │
                                            └──► M8-FE: Trust UI + Flags (needs M8-BE)
                                                   │
                                                   └──► M9: Integration + Polish
```

---

## Detailed Task Dependencies

### M1 — Can start immediately

```
M1-BE tasks (B1.1–B1.12)
  All independent. Start with B1.1 (DB setup), then tables, then endpoints.

M1-FE tasks (F1.1–F1.10)
  Can start in parallel with M1-BE using mock/stub API responses.
  F1.6 (Create Org modal) needs B1.6 (POST /organizations) to be done.
  F1.7 (Create Team modal) needs B1.9.
  F1.8 (Add Member modal) needs B1.10.
  F1.10 (click member → stub workspace) can be done with hardcoded data.
```

---

### M2 — Depends on M1-BE

```
B2.1 (analysis_runs table)
  └── requires B1.3 (members table)

B2.2 (POST /analysis-runs)
  └── requires B2.1

B2.4 (GET /analysis-runs/:id polling)
  └── requires B2.2

F2.1 (member workspace header) — depends on B1.11 (GET /members/:id)
F2.2 (time range picker) — can be built standalone
F2.3 (refresh button) — depends on B2.2, B2.6
F2.4 (polling loop) — depends on B2.4
F2.5 (progress label) — depends on B2.4 (needs progress_stage field)
F2.6 (sidebar status update) — depends on B2.4
F2.7 (error banner) — can be built standalone
F2.8 (conflict toast) — depends on B2.2 returning 409
```

---

### M3 — Depends on M2-BE

```
B3.1 (evidence_units table)
  └── requires B2.1 (analysis_runs table)

B3.2 (behavioral_events table)
  └── requires B3.1

B3.3 (P1 prompt implementation)
  └── requires B2.7 (background job runner)
  └── requires B2.8 (source_payloads table)
  └── requires B3.1, B3.2

B3.4 (P1 chunking)
  └── requires B3.3

B3.5 (P2 consolidation)
  └── requires B3.3, B3.4

B3.6 (persist evidence + events)
  └── requires B3.1, B3.2, B3.5

B3.7 (status: collecting → analyzing)
  └── requires B2.2, B3.6

B3.8 (timeout handling)
  └── requires B3.3
```

---

### M4 — Depends on M3-BE

```
B4.1–B4.4 (signal/score/category/baseline tables)
  └── requires B2.1 (analysis_runs), B3.1 (evidence_units), B3.2 (behavioral_events)

B4.5 (P3 prompt)
  └── requires B3.6 (events in DB)

B4.6–B4.12 (scoring engine)
  └── requires B4.5

B4.13 (baseline endpoint)
  └── requires B4.4
```

---

### M5 — Depends on M4-BE

```
B5.1–B5.4 (KPT/case/milestone/snapshot tables)
  └── requires B4.2 (dimension_scores)

B5.5 (P4 — UI summaries)
  └── requires B4.5 (P3 output)

B5.6 (P5 — KPT)
  └── requires B4.6–B4.12 (scores computed)

B5.7 (P6 — case feedback)
  └── requires B4.6–B4.12

B5.8 (P7 — overview/journey)
  └── requires B4.11 (category scores)

B5.9 (milestone derivation)
  └── requires B3.2 (behavioral events), B4.6 (scoring)

B5.10 (persist snapshot)
  └── requires B5.5–B5.9
```

---

### M6 — Depends on M5-BE

```
B6.1 (P8 prompt)
  └── requires B5.10 (all outputs generated)

B6.2 (patch logic)
  └── requires B6.1

B6.3 (P8 retry)
  └── requires B6.2

B6.4 (store p8_approved + p8_issues)
  └── requires B5.4 (analysis_snapshots table)

B6.5 (status → completed/failed)
  └── requires B6.4
```

---

### M7 — BE (profile endpoints) depends on M6-BE; FE depends on M7-BE

```
B7.1 (GET overview)
  └── requires B5.10, B6.5 (snapshot persisted, run completed)

B7.2 (GET competency all dimensions)
  └── requires B4.2 (dimension_scores)

B7.3 (GET competency/:dimensionId)
  └── requires B4.2, B3.1 (evidence_units)

B7.4 (GET KPT)
  └── requires B5.1 (kpt_items)

B7.5–B7.6 (GET cases)
  └── requires B5.2 (case_feedbacks)

B7.7 (GET journey)
  └── requires B5.3 (milestones)

B7.8 (GET evidence/:id)
  └── requires B3.1 (evidence_units)

B7.9 (GET milestones)
  └── requires B5.3

--- FE depends on all B7.x ---

F7.1–F7.2 (workspace header + summary strip)
  └── requires B7.1

F7.4–F7.7 (Tab 1 — Overview)
  └── requires B7.1

F7.8–F7.12 (Tab 2 — Competency)
  └── requires B7.2, B7.3, B7.8

F7.13 (Tab 3 — KPT)
  └── requires B7.4

F7.14–F7.15 (Tab 4 — Case Feedback)
  └── requires B7.5, B7.6

F7.16–F7.17 (Tab 5 — Journey)
  └── requires B7.7, B7.9

F7.18–F7.19 (states + trust notes)
  └── requires all tab endpoints
```

---

### M8 — Depends on M7

```
B8.1–B8.3 (validation_flags table + endpoints)
  └── requires B2.1 (analysis_runs), B4.2 (dimension_scores as foreign targets)

F8.1–F8.6 (flag UI + trust UI)
  └── requires B8.2 (POST /validation-flags)
  └── requires B7.x (profile tabs must exist first)
```

---

### M9 — Depends on all above

```
All M9 tasks require M1–M8 complete.
Integration tests require both BE and FE to be wired end-to-end.
```

---

## Parallelization Opportunities

| What | Can run in parallel |
|------|---------------------|
| M1-BE table + endpoint work | Independent; no ordering needed within M1-BE |
| M1-FE shell + sidebar | Can start alongside M1-BE (use mock API responses for modals) |
| P1 chunk batches | All P1 chunks run in parallel |
| P3 per-dimension inference | All dimensions inferred in parallel |
| P4 UI summaries | All dimensions processed in parallel |
| M7-BE profile endpoints | All independent of each other; start as soon as M6-BE done |
| M7-FE tabs | Can be built in any order once their corresponding M7-BE endpoint exists |

---

## Visual Timeline (sequential phases)

```
Week 1–2   [M1-BE] ─────────────────────────────────────────────
           [M1-FE] ─────────────────────────────────

Week 3     [M2-BE] ──────────────────
           [M2-FE] ──────────────────  (after B2.2, B2.4)

Week 4–5   [M3-BE] ──────────────────────────────────

Week 6–7   [M4-BE] ────────────────────────────────────

Week 8–9   [M5-BE] ──────────────────────────────────

Week 10    [M6-BE] ───────────────

Week 11–13 [M7-BE] ────────────────────────────
           [M7-FE] ────────────────────────────────────────────

Week 14    [M8-BE] ──────────
           [M8-FE] ──────────────────

Week 15–16 [M9]    ─────────────────────────────────────────────
```
