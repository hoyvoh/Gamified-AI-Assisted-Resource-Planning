# General Ledger — Project Progress Tracking

Tài liệu này theo dõi toàn cảnh trạng thái implementation của từng ticket.

**Legend:**
- `⬜ Not started` `🔄 In progress` `✅ Done` `🔒 Blocked` `❌ Cancelled`

---

## Key References

| Document | Purpose |
|----------|---------|
| [architecture-overview.md](../architecture-overview.md) | System architecture, tech stack, two-pillar design |
| [business-spec.md](../business-spec.md) | Business requirements, WFU rules, scenario lifecycle, warning types |
| [milestones.md](milestones.md) | Timeline & milestone targets |
| [acceptance-checklist.md](acceptance-checklist.md) | Final acceptance criteria (79 items) |
| [guides/ticket-workflow.md](../guides/ticket-workflow.md) | How to pick, work, and close a ticket |
| [guides/backend-guide.md](../guides/backend-guide.md) | BE code patterns (Clean Architecture, Pydantic, Alembic) |
| [guides/frontend-guide.md](../guides/frontend-guide.md) | FE code patterns (Next.js, Zustand, OpenAPI types) |
| [design/database-spec.md](../design/database-spec.md) | Full schema — all tables, columns, indexes, constraints |
| [design/backend-spec.md](../design/backend-spec.md) | API endpoints, services, algorithms overview |
| [design/frontend-spec.md](../design/frontend-spec.md) | Screens, components, Planning Board (kanban), state management |
| [design/data-flow.md](../design/data-flow.md) | End-to-end data flows |
| [phases/](phases/) | Per-ticket overview.md + design.md |

---

## Dependency Chain Analysis

```
Critical sequential chain (the bottleneck path):

BE-002 → BE-003 → BE-004 → BE-006 → BE-010 → BE-011 → FE-015
                          → BE-005 → BE-009 → FE-010
                          → BE-007 → BE-008
BE-002 → PA-BE-001 → PA-BE-002 → PA-FE-001
                   → PA-BE-003 → PA-FE-002
                   → PA-BE-004 (data pipeline — independent after PA-BE-001)

FE-001 → FE-002 → FE-003 ┐
                 → FE-004 ┘→ INT-001 → FE-005 → FE-006 → FE-007
                                     → FE-008          → FE-010
                                     → FE-009 → INT-002
                                     → FE-011 (Gantt)
                                     → FE-012 (Dep Graph, also needs BE-005)
                                     → FE-013 (Calendar)
                          → PA-FE-001 (also needs PA-BE-002)
BE-010 + INT-001 → FE-014 (Execution Screen)
BE-011 + FE-014 → FE-015 (XP Review)
```

---

## Assignment Overview

> **Critical path first.** Vy = BE algorithms/LLM; Tan = FE + general BE CRUD.
> Assignments balanced for maximum parallel throughput.

| Order | Ticket | Assignee | Rationale |
|-------|--------|----------|-----------|
| 1 | BE-002 | **Vy** | Blocks all BE — schema depth needed |
| 1 | FE-001 | **Tan** | Independent; unblocks all FE |
| 2 | BE-001 | **Vy** | COCOMO algorithm — parallel with FE-002 |
| 2 | FE-002 | **Tan** | After FE-001; unblocks all FE components |
| 3 | BE-003 | **Vy** | After BE-002; core CRUD patterns |
| 3 | FE-003 | **Tan** | After FE-002 |
| 3 | FE-004 | **Tan** | After FE-002 |
| 4 | PA-BE-001 | **Vy** | After BE-002; analysis schema |
| 4 | INT-001 | **Both** | Sync point after BE-003 + FE-003 + FE-004 |
| 5 | PA-BE-002 | **Vy** | After PA-BE-001 + BE-003; LLM integration |
| 5 | PA-BE-003 | **Vy** | After PA-BE-001 + BE-003; match algorithm |
| 5 | PA-BE-004 | **Tan** | After PA-BE-001; GitHub + Slack pipeline |
| 5 | PA-FE-001 | **Tan** | After INT-001 + PA-BE-002 |
| 6 | PA-FE-002 | **Tan** | After PA-FE-001 + PA-BE-003 |
| 6 | BE-004 | **Vy** | After BE-003; scenario state machine |
| 7 | BE-005 | **Vy** | After BE-004; critical path algorithm |
| 7 | BE-006 | **Tan** | After BE-004; assignments + warnings CRUD |
| 7 | FE-005 | **Tan** | After INT-001; planning board static |
| 8 | BE-007 | **Vy** | After BE-004; LLM service core |
| 8 | FE-006 | **Tan** | After FE-005 + BE-006; drag & drop |
| 8 | FE-007 | **Tan** | After BE-006 + FE-005; warning bar |
| 8 | FE-008 | **Tan** | After INT-001 + BE-004; scenario management full |
| 9 | BE-008 | **Vy** | After BE-007 + BE-006; risk analysis |
| 9 | FE-009 | **Tan** | After INT-001; AI prompt interface |
| 9 | FE-011 | **Tan** | After INT-001; Gantt (3-layer) |
| 9 | FE-012 | **Tan** | After BE-005 + INT-001; dep graph |
| 10 | INT-002 | **Both** | MVP sync point: Proposal → Board E2E |
| 11 | BE-009 | **Vy** | After BE-006 + BE-005; GA optimizer |
| 11 | FE-013 | **Tan** | After INT-001; calendar view |
| 12 | BE-010 | **Tan** | After BE-006; progress log + EV + scenario switch |
| 12 | FE-010 | **Tan** | After BE-009; optimization results UI |
| 13 | FE-014 | **Tan** | After BE-010 + INT-001; execution screen |
| 14 | BE-011 | **Vy** | After BE-010; XP engine |
| 15 | FE-015 | **Tan** | After BE-011 + FE-014; XP review |
| 16 | QA-001 | **Both** | E2E test suite |
| 16 | ACCEPT-001 | **Both** | Manual acceptance |

---

## Phase 0 — Foundation

| Ticket | Title | Done | Status | Assignee | Branch | Notes |
|--------|-------|:----:|--------|----------|--------|-------|
| BE-002 | Database Schema & Migrations | [ ] | ⬜ | **Vy** | `feature/BE-002-db-schema` | **Start here — blocks all BE** |
| BE-001 | COCOMO II Estimation Engine | [ ] | ⬜ | **Vy** | `feature/BE-001-cocomo-engine` | Parallel with FE-001/FE-002 |
| BE-003 | Core CRUD APIs | [ ] | ⬜ | **Vy** | `feature/BE-003-core-crud` | After BE-002 |
| FE-001 | Application Shell & Routing | [ ] | ⬜ | **Tan** | `feature/FE-001-app-shell` | Parallel with BE-002 |
| FE-002 | Design System & Shared Components | [ ] | ⬜ | **Tan** | `feature/FE-002-design-system` | After FE-001 |

## Phase 0.5 — Analysis Modules

| Ticket | Title | Done | Status | Assignee | Branch | Notes |
|--------|-------|:----:|--------|----------|--------|-------|
| PA-BE-001 | Analysis Modules DB Schema | [ ] | ⬜ | **Vy** | `feature/PA-BE-001-analysis-schema` | After BE-002 |
| PA-BE-002 | Project Evaluation API + AI Assist | [ ] | ⬜ | **Vy** | `feature/PA-BE-002-evaluation-api` | After PA-BE-001 + BE-003 |
| PA-BE-003 | Personnel Profile API + Team Match Engine | [ ] | ⬜ | **Vy** | `feature/PA-BE-003-profile-match` | After PA-BE-001 + BE-003 |
| PA-BE-004 | GitHub + Slack Data Pipeline | [ ] | ⬜ | **Tan** | `feature/PA-BE-004-data-pipeline` | After PA-BE-001; Pillar 2 data ingestion |
| PA-FE-001 | Project Analysis Screen (Mode 1) | [ ] | ⬜ | **Tan** | `feature/PA-FE-001-project-analysis` | After INT-001 + PA-BE-002 |
| PA-FE-002 | HR Analysis Screen (Mode 2) | [ ] | ⬜ | **Tan** | `feature/PA-FE-002-hr-analysis` | After PA-FE-001 + PA-BE-003 |

## Phase 1 — Core Data Management

| Ticket | Title | Done | Status | Assignee | Branch | Notes |
|--------|-------|:----:|--------|----------|--------|-------|
| FE-003 | Personnel Sidebar Panel | [ ] | ⬜ | **Tan** | `feature/FE-003-personnel-sidebar` | After FE-002 |
| FE-004 | Task Panel | [ ] | ⬜ | **Tan** | `feature/FE-004-task-panel` | After FE-002 |
| BE-004 | Scenario & Task APIs + State Machine | [ ] | ⬜ | **Vy** | `feature/BE-004-scenario-tasks` | After BE-003; includes launch/activate/archive/fork |
| BE-005 | Task Dependencies & Critical Path | [ ] | ⬜ | **Vy** | `feature/BE-005-deps-critical-path` | After BE-004 |
| BE-006 | Assignment APIs & Warning Engine | [ ] | ⬜ | **Tan** | `feature/BE-006-assignments-warnings` | After BE-004 |
| INT-001 | FE-BE Integration: Personnel & Tasks | [ ] | ⬜ | **Both** | `feature/INT-001-integration` | **Sync point** — after BE-003 + FE-003 + FE-004 |

## Phase 2 — Planning Board

| Ticket | Title | Done | Status | Assignee | Branch | Notes |
|--------|-------|:----:|--------|----------|--------|-------|
| FE-005 | Planning Board — Static Kanban | [ ] | ⬜ | **Tan** | `feature/FE-005-planning-board-static` | After INT-001 |
| FE-006 | Board Drag & Drop Assignment | [ ] | ⬜ | **Tan** | `feature/FE-006-board-drag-drop` | After FE-005 + BE-006 |
| FE-007 | Warning Bar | [ ] | ⬜ | **Tan** | `feature/FE-007-warning-bar` | After BE-006 + FE-005 |
| FE-008 | Scenario Management UI (full lifecycle) | [ ] | ⬜ | **Tan** | `feature/FE-008-scenario-management` | After INT-001 + BE-004; includes Launch, fork, compare, states |

## Phase 3 — LLM Pipeline (MVP Target)

| Ticket | Title | Done | Status | Assignee | Branch | Notes |
|--------|-------|:----:|--------|----------|--------|-------|
| BE-007 | LLM Service & Task Generation | [ ] | ⬜ | **Vy** | `feature/BE-007-llm-service` | After BE-004 |
| BE-008 | Risk Analysis Endpoint | [ ] | ⬜ | **Vy** | `feature/BE-008-risk-analysis` | After BE-007 + BE-006 |
| FE-009 | AI Prompt Interface | [ ] | ⬜ | **Tan** | `feature/FE-009-ai-prompt` | After INT-001 |
| INT-002 | E2E: Proposal → Board (MVP) | [ ] | ⬜ | **Both** | `feature/INT-002-mvp-e2e` | **MVP milestone sync point** |

## Phase 4 — Optimization Engine

| Ticket | Title | Done | Status | Assignee | Branch | Notes |
|--------|-------|:----:|--------|----------|--------|-------|
| BE-009 | Genetic Algorithm Optimizer | [ ] | ⬜ | **Vy** | `feature/BE-009-ga-optimizer` | After BE-006 + BE-005 |
| FE-010 | Optimization Results UI | [ ] | ⬜ | **Tan** | `feature/FE-010-optimization-ui` | After BE-009 + FE-006 |

## Phase 5 — Views & Visualizations

| Ticket | Title | Done | Status | Assignee | Branch | Notes |
|--------|-------|:----:|--------|----------|--------|-------|
| FE-011 | Gantt Chart (3-layer + scenario markers) | [ ] | ⬜ | **Tan** | `feature/FE-011-gantt-chart` | After INT-001; major — baseline/planned/actual layers |
| FE-012 | Dependency Graph | [ ] | ⬜ | **Tan** | `feature/FE-012-dep-graph` | After BE-005 + INT-001 |
| FE-013 | Calendar View | [ ] | ⬜ | **Tan** | `feature/FE-013-calendar-view` | After INT-001 |

## Phase 6 — Execution Mode

| Ticket | Title | Done | Status | Assignee | Branch | Notes |
|--------|-------|:----:|--------|----------|--------|-------|
| BE-010 | Progress Log, Earned Value & Scenario Switch | [ ] | ⬜ | **Tan** | `feature/BE-010-progress-ev-switch` | After BE-006; includes fork-from-execution + archive-with-trigger |
| FE-014 | Execution Screen (MyTasks + Gantt + Switch Plan) | [ ] | ⬜ | **Tan** | `feature/FE-014-execution-screen` | After BE-010 + INT-001 + FE-011 |

## Phase 7 — XP & Gamification

| Ticket | Title | Done | Status | Assignee | Branch | Notes |
|--------|-------|:----:|--------|----------|--------|-------|
| BE-011 | XP Calculation Engine | [ ] | ⬜ | **Vy** | `feature/BE-011-xp-engine` | After BE-010 |
| FE-015 | XP & End-of-Project Review | [ ] | ⬜ | **Tan** | `feature/FE-015-xp-review` | After BE-011 + FE-014 |

## Phase 8 — QA & Acceptance

| Ticket | Title | Done | Status | Assignee | Branch | Notes |
|--------|-------|:----:|--------|----------|--------|-------|
| QA-001 | End-to-End Test Suite | [ ] | ⬜ | **Both** | `feature/QA-001-e2e-tests` | All phases done |
| ACCEPT-001 | Acceptance Checklist Execution | [ ] | ⬜ | **Both** | N/A | Manual — 79 items |

---

## Progress Summary

| Phase | Total | Done | In Progress | Blocked |
|-------|-------|------|-------------|---------|
| 0 — Foundation | 5 | 0 | 0 | 0 |
| 0.5 — Analysis Modules | 6 | 0 | 0 | 0 |
| 1 — Core Data | 6 | 0 | 0 | 0 |
| 2 — Planning Board | 4 | 0 | 0 | 0 |
| 3 — LLM / MVP | 4 | 0 | 0 | 0 |
| 4 — Optimization | 2 | 0 | 0 | 0 |
| 5 — Views | 3 | 0 | 0 | 0 |
| 6 — Execution Mode | 2 | 0 | 0 | 0 |
| 7 — XP | 2 | 0 | 0 | 0 |
| 8 — QA | 2 | 0 | 0 | 0 |
| **Total** | **36** | **0** | **0** | **0** |

---

## How to Update This Ledger

1. Khi bắt đầu ticket → cập nhật Status = 🔄
2. Khi tạo PR → điền link PR trong Notes
3. Khi PR merged → Status = ✅, tick `[x]` trong cột Done
4. Nếu blocked → Status = 🔒, ghi lý do trong Notes
5. Cập nhật Progress Summary sau mỗi thay đổi
