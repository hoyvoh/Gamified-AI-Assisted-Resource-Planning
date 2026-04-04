# TODO CHECKLIST — HUMAN ANALYSIS MVP SPECS

> **Legend:**
> - ✅ Covered — source doc exists in `input-documents/`
> - 📄 Drafted — spec doc written in `human-analysis-MVP-specs/`
> - ⬜ To do — still needs work

---

## 1. Entity / Data Model Spec

- ✅ Core entity list identified (Business-Specification.md, Scoring-Engine-Pseudo-spec.md)
- 📄 Entity model spec written → `entity-data-model.md`
  - ✅ Organization, Team, Member
  - ✅ AnalysisRun, DimensionScore, EvidenceUnit
  - ✅ BehavioralEvent, DimensionSignal, CategoryScore
  - ✅ KPTItem, CaseFeedback, Milestone
  - ✅ ValidationFlag, RoleProfile, PersonalBaseline
- ✅ Conceptual purpose of each entity
- ✅ Relationships defined
- ✅ Lifecycle defined
- ✅ Snapshot strategy defined
- ✅ Current-state vs historical-state behavior

---

## 2. Entity / Database Schema Spec

- 📄 Schema spec written → `database-spec.md`
  - ✅ Field-level schema per entity
  - ✅ Foreign keys / relations
  - ✅ Indexes
  - ✅ Constraints / validation rules
  - ✅ Read patterns
  - ✅ Write patterns
  - ✅ Snapshot persistence strategy
  - ✅ Historical storage for runs / milestones / flags

---

## 3. Epic → Feature → User Story → Acceptance Criteria

- ✅ High-level FRs in Information-Architecture.md (Part B, Section 9–10)
- 📄 Epics and stories written → `epics-user-stories.md`
  - ✅ Product epics defined
  - ✅ Features per epic
  - ✅ User stories per feature
  - ✅ Acceptance criteria per story
  - ✅ MVP vs Future scope marked
  - ✅ Priority levels
  - ✅ Ownership tags (FE / BE / Analysis / QA)

---

## 4. Frontend Screen Spec (handoff-level)

- ✅ Wireframe text spec in Information-Architecture.md (Part A)
- 📄 Frontend spec written → `frontend-spec.md`
  - ✅ Every screen defined
  - ✅ Modals / drawers / detail views
  - ✅ Screen layout zones
  - ✅ Screen components
  - ✅ Interaction behavior
  - ✅ Loading states
  - ✅ Empty states
  - ✅ Partial-data states
  - ✅ Error states
  - ✅ Confidence / trust / fairness UI messaging
  - ✅ Evidence trace interaction UX

---

## 5. BRD / SRS Formalization

- ✅ Full BRD + SRS written in Information-Architecture.md (Part B)
- ⬜ Optional: extract into standalone formal doc if needed for handoff
  - Already has numbered FRs (FR-01 through FR-10.11)
  - Already has NFRs (NFR-01 through NFR-07)
  - Already has Business Rules (BR-01 through BR-10)
  - Already has Acceptance Criteria per FR

---

## 6. API / Backend Functional Spec

- 📄 Backend spec written → `backend-spec.md`
  - ✅ Backend domains / modules
  - ✅ API resource groups
  - ✅ CRUD endpoints
  - ✅ Analysis run endpoints
  - ✅ Refresh / rerun flow
  - ✅ Polling / async job flow
  - ✅ Member profile read endpoints
  - ✅ Dimension detail endpoints
  - ✅ Evidence trace endpoints
  - ✅ KPT endpoints
  - ✅ Case feedback endpoints
  - ✅ Milestone endpoints
  - ✅ Validation / feedback endpoints
  - ✅ Request / response contracts
  - ✅ Backend validation / business rules
  - ✅ Retry / failure / timeout behavior

---

## 7. Prompt & Analysis Pipeline Spec (implementation-level)

- ✅ Prompt Architecture in Prompt-Architecture-Spec.md (P1–P8)
- ✅ Scoring engine pseudocode in Scoring-Engine-Pseudo-spec.md
- 📄 Pipeline spec written → `prompt-pipeline-spec.md`
  - ✅ Prompt file structure / naming
  - ✅ Input / output contract per prompt
  - ✅ Orchestration order
  - ✅ Retry / fallback behavior
  - ✅ Intermediate artifact storage
  - ✅ Raw → evidence → event → signal → score pipeline
  - ✅ Self-critique (P8) patch / correction flow
  - ✅ Final persistence flow

---

## 8. Evaluation / QA / Trust Framework

- ✅ Confidence framework in developer-profiling-engine.md (Section 8)
- ✅ Guardrails in Scoring-Engine-Pseudo-spec.md (Section 19)
- ✅ Fairness guardrails in developer-profiling-engine.md (Section 11)
- 📄 QA framework written → `evaluation-trust-framework.md`
  - ✅ Evaluation metrics (Evidence Sufficiency, Pattern Consistency, Cross-Source Agreement)
  - ✅ Confidence calibration method
  - ✅ Evidence support rate criteria
  - ✅ Unsupported-claim detection (P8 / G2 / G3 / G4)
  - ⬜ Human review workflow — needs fuller definition
  - ⬜ Reviewer validation loop — needs fuller definition
  - ⬜ Gold test case set — not yet defined
    - ⬜ clear positive cases
    - ⬜ clear negative cases
    - ⬜ mixed cases
    - ⬜ insufficient evidence cases
    - ⬜ role-bias cases
  - ⬜ QA checklist for generated outputs
  - ⬜ Post-release improvement loop

---

## 9. MVP Build Planning

- 📄 MVP plan written → `mvp-build-plan.md`
  - ✅ MVP scope locked
  - ✅ MVP vs Post-MVP features separated
  - ✅ Implementation milestones
  - ✅ Sprint / delivery order
  - ⬜ Technical spikes — needs team input
  - ⬜ Risk register — partially captured in Business-Specification.md Section 13
  - ⬜ Release readiness checklist

---

# REMAINING OPEN ITEMS (Priority Order)

1. ⬜ Gold test case set — define representative positive / negative / edge cases
2. ⬜ Human review workflow + reviewer validation loop (detailed)
3. ⬜ Technical spikes (confirm with dev team)
4. ⬜ Risk register (formalize from Business-Specification.md Section 13)
5. ⬜ Release readiness checklist
6. ⬜ Optional: standalone BRD/SRS doc if needed for external stakeholder handoff

---

# DOCUMENTS WRITTEN

| Doc | Location | Status |
|-----|----------|--------|
| Entity / Data Model Spec | `entity-data-model.md` | 📄 Draft |
| Database Schema Spec | `database-spec.md` | 📄 Draft |
| Epic / User Stories | `epics-user-stories.md` | 📄 Draft |
| Frontend Screen Spec | `frontend-spec.md` | 📄 Draft |
| Backend API Spec | `backend-spec.md` | 📄 Draft |
| Data Flow | `data-flow.md` | 📄 Draft |
| Prompt Pipeline Spec | `prompt-pipeline-spec.md` | 📄 Draft |
| Evaluation / QA / Trust | `evaluation-trust-framework.md` | 📄 Draft |
| MVP Build Plan | `mvp-build-plan.md` | 📄 Draft |
