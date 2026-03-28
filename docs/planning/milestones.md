# Milestones

## Timeline Overview

```
Phase 0    Phase 0.5   Phase 1    Phase 2    🏆 MVP     Phase 4-5   Phase 6    Phase 7   Phase 8
Foundation  Analysis    Core Data  Board      Launch     Opt+Views   Execution   XP        QA
   M0          M0.5        M1         M1        M2           M3          M3        M4-M5     M6
```

> Dates are targets — reset as needed based on actual velocity.

---

## M0 — Foundation Ready

**Deliverables:**
- [ ] COCOMO II engine implemented + tested
- [ ] Database schema deployed (alembic migrations) — includes scenario states + execution_baseline table
- [ ] Core CRUD APIs (org, personnel, project)
- [ ] Next.js app shell running, routes working
- [ ] CI pipeline green (FE + BE)

**Definition of Done:** `uv run pytest` pass, `pnpm build` pass, `alembic upgrade head` pass

---

## M0.5 — Analysis Modules

**Deliverables:**
- [ ] DB schema: `project_evaluations`, `personnel_profiles`, `project_team_matches`
- [ ] Project Evaluation API: CRUD + verdict computation + AI assist per axis
- [ ] Personnel Profile API: 5-layer storage + WFU factors
- [ ] **GitHub + Slack Data Pipeline:** ingest commit/PR/Slack data per developer username
- [ ] Team Match engine: cosine similarity scoring + top-N team recommendation
- [ ] Project Analysis screen (Mode 1): 10-axis radar, scoring form, risk register, verdict
- [ ] HR Analysis screen (Mode 2): developer roster, profile drawer, team composition panel

**Definition of Done:**
PM có thể nhập proposal → chạy Project Analysis → xem radar + verdict.
BOD có thể sync GitHub/Slack data → xem developer profiles → nhận team recommendations.

---

## M1 — Core Planning Board

**Deliverables:**
- [ ] Scenario & Task APIs with **full state machine** (draft/active/archived, launch, fork, archive-with-trigger)
- [ ] Personnel sidebar + Task panel connected to BE
- [ ] Planning Board (kanban card-game): task cards + developer cards + lanes
- [ ] Drag & drop assignment → AllocationModal (%, WFU mode)
- [ ] Warning bar: capacity/junior/budget/time warnings
- [ ] **Scenario Management UI:** create, fork, compare, LaunchModal with state indicators
- [ ] Scenario selector with P(on_time) per scenario

**Definition of Done:** Demo trong meeting: tạo 2 scenarios → compare → Launch một scenario → thấy warnings

---

## M2 — MVP: AI-Powered Planning

**Deliverables:**
- [ ] Project proposal → LLM generate tasks → tasks appear on board
- [ ] Risk analysis endpoint + AI prompt interface
- [ ] **Full E2E launch flow:** Proposal → Analysis (Pillar 1) → HR Match (Pillar 2) → Board → Assign → Launch → Execution Mode unlocked
- [ ] Optimization (GA): Makespan + Budget modes, top 3 solutions

**Definition of Done:**
PM có thể ngồi trước màn hình, nhập đề bài dự án thực, nhận task list, phân người, launch dự án, unlock Execution Mode — tất cả trong 1 session.

---

## M3 — Full Views + Execution Mode

**Deliverables:**
- [ ] **Gantt Chart (3-layer):** Baseline / Planned / Actual bars, scenario switch markers, drag-to-reschedule
- [ ] Dependency graph với critical path highlight
- [ ] Calendar view
- [ ] **Execution Mode screen:** MyTasksPanel + ExecutionGantt + EV metrics (SPI/CPI/EAC)
- [ ] Daily progress input → P(on_time) updates
- [ ] **Scenario switch mid-execution:** SwitchPlanBanner + SwitchPlanConfirmModal + auto-fork + archive-with-trigger
- [ ] ProgressLogs preserved across scenario switches

**Definition of Done:**
Project đang chạy → P(on_time) giảm → banner xuất hiện → PM switch plan → Gantt hiển thị switch marker → progress data không bị mất.

---

## M5 — XP System & Full Feature

**Deliverables:**
- [ ] XP calculation khi finalize project
- [ ] Skill level up system
- [ ] XP reflected trong personnel profile cho dự án tiếp theo
- [ ] Velocity calibration sau mỗi dự án hoàn thành

**Definition of Done:** Finalize project → mỗi member xem XP + skill progress.

---

## M6 — Production Ready

**Deliverables:**
- [ ] E2E test suite pass (QA-001)
- [ ] Acceptance checklist (79 items) all verified
- [ ] Performance: 50 tasks + 20 people — board không lag, Gantt renders <1s
- [ ] Security review: multi-tenant isolation tested
- [ ] Deployment runbook hoàn chỉnh

---

## Risk Tracking

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| LLM API downtime ảnh hưởng MVP | Medium | High | Fallback to manual task creation mode |
| GitHub/Slack API rate limits | Medium | Medium | Cache responses, batch requests, token rotation |
| React DnD performance với nhiều cards (>50 tasks) | Low | Medium | Virtualize list, throttle drag events |
| COCOMO II complexity exceed timeline | Low | High | Start BE-001 sớm, timebox |
| GA optimizer chạy chậm (>30s) | Low | Medium | Async job + WebSocket progress |
| Scenario fork data integrity | Low | High | Integration tests on fork + switch + progress persistence |
