# General Ledger — Project Progress Tracking

Tài liệu này theo dõi toàn cảnh trạng thái implementation của từng ticket.

**Legend:**
- `⬜ Not started` `🔄 In progress` `✅ Done` `🔒 Blocked` `❌ Cancelled`

---

## Key References

| Document | Purpose |
|----------|---------|
| [architecture-overview.md](../architecture-overview.md) | System architecture, tech stack, data flow diagram |
| [business-spec.md](../business-spec.md) | Business requirements, WFU rules, warning types, feature list |
| [milestones.md](milestones.md) | Timeline & milestone targets (MVP: 1/4) |
| [acceptance-checklist.md](acceptance-checklist.md) | Final acceptance criteria (57 items) |
| [guides/ticket-workflow.md](../guides/ticket-workflow.md) | How to pick, work, and close a ticket |
| [guides/backend-guide.md](../guides/backend-guide.md) | BE code patterns (Clean Architecture, Pydantic, Alembic) |
| [guides/frontend-guide.md](../guides/frontend-guide.md) | FE code patterns (Next.js, Zustand, OpenAPI types) |
| [design/database-spec.md](../design/database-spec.md) | Full schema — all tables, columns, indexes, constraints |
| [design/backend-spec.md](../design/backend-spec.md) | API endpoints, services, algorithms overview |
| [design/frontend-spec.md](../design/frontend-spec.md) | Screens, components, Three.js board, state management |
| [design/data-flow.md](../design/data-flow.md) | 10 end-to-end data flows (assignment, optimization, P(on_time), …) |
| [phases/](phases/) | Per-ticket overview.md + design.md for all 30 tickets |

---

## Assignment Overview

> **Critical path first.** Tasks listed in dependency order within each phase.
> Tick `[x]` in the Done column when the PR for that ticket is merged.

| Order | Ticket | Assignee | Why |
|-------|--------|----------|-----|
| 1 | BE-002 | **Vy** | Hard blocker for all backend — data modeling depth needed |
| 2 | BE-001 | **Vy** | COCOMO II algorithm — Vy's core strength |
| 2 | FE-001 | **Tan** | Independent; unblocks all FE routing |
| 2 | FE-002 | **Tan** | Independent; unblocks all FE components |
| 3 | BE-003 | **Vy** | Core CRUD patterns — continues BE chain after BE-002 |
| 3 | PA-BE-001 | **Tan** | Analysis DB migrations — structural work, parallel with BE-003 |
| 3 | FE-003 | **Tan** | After FE-002; needed for INT-001 |
| 3 | FE-004 | **Tan** | After FE-002; needed for INT-001 |
| 4 | PA-BE-002 | **Vy** | Evaluation API + AI Assist — LLM integration |
| 4 | PA-BE-003 | **Vy** | Team Match engine — cosine similarity algorithm |
| 4 | PA-FE-001 | **Tan** | Project Analysis screen — frontend of PA-BE-002 |
| 4 | INT-001 | **Both** | Sync point: wire BE-003 + FE-003 + FE-004 |
| 5 | PA-FE-002 | **Tan** | HR Analysis screen — frontend of PA-BE-003 |
| 5 | BE-004 | **Tan** | Scenario & Task APIs — general CRUD |
| 6 | BE-005 | **Vy** | Critical path algorithm — Vy's strength |
| 6 | BE-006 | **Tan** | Assignment + Warning engine — general backend |
| 6 | FE-005 | **Tan** | Three.js board static scene — after INT-001 |
| 7 | BE-007 | **Vy** | LLM service — core LLM work |
| 7 | FE-006 | **Tan** | Board drag & drop — after FE-005 |
| 7 | FE-007 | **Tan** | Warning bar — after BE-006 + FE-005 |
| 7 | FE-008 | **Tan** | Scenario management UI — after INT-001 + BE-004 |
| 8 | BE-008 | **Vy** | Risk analysis — after BE-007 |
| 8 | FE-009 | **Tan** | AI prompt interface — after INT-001 |
| 8 | INT-002 | **Both** | MVP milestone: Proposal → Board E2E |
| 9 | BE-009 | **Vy** | Genetic algorithm optimizer |
| 9 | FE-011 | **Tan** | Gantt chart — after INT-001 |
| 9 | FE-012 | **Tan** | Dependency graph — after BE-005 + INT-001 |
| 9 | FE-013 | **Tan** | Calendar view — after INT-001 |
| 10 | FE-010 | **Tan** | Optimization UI — after BE-009 |
| 10 | BE-010 | **Tan** | Progress log & Earned Value — after BE-006 |
| 11 | FE-014 | **Tan** | Progress dashboard — after BE-010 + INT-001 |
| 11 | BE-011 | **Vy** | XP calculation engine — algorithm |
| 12 | FE-015 | **Tan** | XP & end-of-project review — after BE-011 + FE-014 |
| 13 | QA-001 | **Both** | E2E test suite |
| 13 | ACCEPT-001 | **Both** | Acceptance checklist — manual |

---

## Phase 0 — Foundation

| Ticket | Title | Done | Status | Assignee | Branch | Approved by | Notes |
|--------|-------|:----:|--------|----------|--------|-------------|-------|
| BE-002 | Database Schema & Migrations | [ ] | ⬜ | **Vy** | `feature/BE-002-db-schema` | | **Start here — blocks all BE** |
| BE-001 | COCOMO II Estimation Engine | [ ] | ⬜ | **Vy** | `feature/BE-001-cocomo-engine` | | Parallel with FE-001/FE-002 |
| BE-003 | Core CRUD APIs | [ ] | ⬜ | **Vy** | `feature/BE-003-core-crud` | | After BE-002 |
| FE-001 | Application Shell & Routing | [ ] | ⬜ | **Tan** | `feature/FE-001-app-shell` | | Start in parallel with BE-002 |
| FE-002 | Design System & Shared Components | [ ] | ⬜ | **Tan** | `feature/FE-002-design-system` | | After FE-001 |

## Phase 0.5 — Analysis Modules

| Ticket | Title | Done | Status | Assignee | Branch | Approved by | Notes |
|--------|-------|:----:|--------|----------|--------|-------------|-------|
| PA-BE-001 | Analysis Modules DB Schema | [ ] | ⬜ | **Tan** | `feature/PA-BE-001-analysis-schema` | | After BE-002; structural migration |
| PA-BE-002 | Project Evaluation API + AI Assist | [ ] | ⬜ | **Vy** | `feature/PA-BE-002-evaluation-api` | | After PA-BE-001 + BE-003; LLM |
| PA-BE-003 | Personnel Profile API + Team Match Engine | [ ] | ⬜ | **Vy** | `feature/PA-BE-003-personnel-profile-api` | | After PA-BE-001 + BE-003; algorithm |
| PA-FE-001 | Project Analysis Screen (Mode 1) | [ ] | ⬜ | **Tan** | `feature/PA-FE-001-project-analysis-screen` | | After PA-BE-002 + FE-001 |
| PA-FE-002 | HR Analysis Screen (Mode 2) | [ ] | ⬜ | **Tan** | `feature/PA-FE-002-hr-analysis-screen` | | After PA-BE-003 + PA-FE-001 |

## Phase 1 — Core Data Management

| Ticket | Title | Done | Status | Assignee | Branch | Approved by | Notes |
|--------|-------|:----:|--------|----------|--------|-------------|-------|
| FE-003 | Personnel Sidebar Panel | [ ] | ⬜ | **Tan** | `feature/FE-003-personnel-sidebar` | | After FE-002 |
| FE-004 | Task Panel | [ ] | ⬜ | **Tan** | `feature/FE-004-task-panel` | | After FE-002 |
| BE-004 | Scenario & Task APIs | [ ] | ⬜ | **Tan** | `feature/BE-004-scenarios-tasks` | | After BE-003 |
| BE-005 | Task Dependencies & Critical Path | [ ] | ⬜ | **Vy** | `feature/BE-005-dependencies-critical-path` | | After BE-004; algorithm |
| BE-006 | Assignment APIs & Warning Engine | [ ] | ⬜ | **Tan** | `feature/BE-006-assignments-warnings` | | After BE-004 |
| INT-001 | FE-BE Integration: Personnel & Tasks | [ ] | ⬜ | **Both** | `feature/INT-001-personnel-tasks-integration` | | **Sync point** — after BE-003 + FE-003 + FE-004 |

## Phase 2 — Strategic Board

| Ticket | Title | Done | Status | Assignee | Branch | Approved by | Notes |
|--------|-------|:----:|--------|----------|--------|-------------|-------|
| FE-005 | Three.js Board — Static Scene | [ ] | ⬜ | **Tan** | `feature/FE-005-threejs-board-static` | | After INT-001 |
| FE-006 | Board Drag & Drop Assignment | [ ] | ⬜ | **Tan** | `feature/FE-006-board-drag-drop` | | After FE-005 |
| FE-007 | Warning Bar | [ ] | ⬜ | **Tan** | `feature/FE-007-warning-bar` | | After BE-006 + FE-005 |
| FE-008 | Scenario Management UI | [ ] | ⬜ | **Tan** | `feature/FE-008-scenario-management` | | After INT-001 + BE-004 |

## Phase 3 — LLM Pipeline (MVP Target: 1/4)

| Ticket | Title | Done | Status | Assignee | Branch | Approved by | Notes |
|--------|-------|:----:|--------|----------|--------|-------------|-------|
| BE-007 | LLM Service & Project Analysis | [ ] | ⬜ | **Vy** | `feature/BE-007-llm-project-analysis` | | LLM core |
| BE-008 | Risk Analysis Endpoint | [ ] | ⬜ | **Vy** | `feature/BE-008-risk-analysis` | | After BE-007 |
| FE-009 | AI Prompt Interface | [ ] | ⬜ | **Tan** | `feature/FE-009-ai-prompt-interface` | | After INT-001 |
| INT-002 | E2E: Proposal → Board | [ ] | ⬜ | **Both** | `feature/INT-002-proposal-to-board` | | **MVP milestone — sync point** |

## Phase 4 — Optimization Engine

| Ticket | Title | Done | Status | Assignee | Branch | Approved by | Notes |
|--------|-------|:----:|--------|----------|--------|-------------|-------|
| BE-009 | Genetic Algorithm Optimizer | [ ] | ⬜ | **Vy** | `feature/BE-009-genetic-optimizer` | | Core algorithm |
| FE-010 | Optimization Results UI | [ ] | ⬜ | **Tan** | `feature/FE-010-optimization-ui` | | After BE-009 |

## Phase 5 — Views & Visualizations

| Ticket | Title | Done | Status | Assignee | Branch | Approved by | Notes |
|--------|-------|:----:|--------|----------|--------|-------------|-------|
| FE-011 | Gantt Chart | [ ] | ⬜ | **Tan** | `feature/FE-011-gantt-chart` | | After INT-001 |
| FE-012 | Dependency Graph | [ ] | ⬜ | **Tan** | `feature/FE-012-dependency-graph` | | After BE-005 + INT-001 |
| FE-013 | Calendar View | [ ] | ⬜ | **Tan** | `feature/FE-013-calendar-view` | | After INT-001 |

## Phase 6 — Progress Tracking

| Ticket | Title | Done | Status | Assignee | Branch | Approved by | Notes |
|--------|-------|:----:|--------|----------|--------|-------------|-------|
| BE-010 | Progress Log & Earned Value | [ ] | ⬜ | **Tan** | `feature/BE-010-progress-earned-value` | | After BE-006 |
| FE-014 | Progress Dashboard | [ ] | ⬜ | **Tan** | `feature/FE-014-progress-dashboard` | | After BE-010 + INT-001 |

## Phase 7 — XP & Gamification

| Ticket | Title | Done | Status | Assignee | Branch | Approved by | Notes |
|--------|-------|:----:|--------|----------|--------|-------------|-------|
| BE-011 | XP Calculation Engine | [ ] | ⬜ | **Vy** | `feature/BE-011-xp-engine` | | After BE-010; algorithm |
| FE-015 | XP & End-of-Project Review | [ ] | ⬜ | **Tan** | `feature/FE-015-xp-review` | | After BE-011 + FE-014 |

## Phase 8 — QA & Acceptance

| Ticket | Title | Done | Status | Assignee | Branch | Approved by | Notes |
|--------|-------|:----:|--------|----------|--------|-------------|-------|
| QA-001 | End-to-End Test Suite | [ ] | ⬜ | **Both** | `feature/QA-001-e2e-tests` | | |
| ACCEPT-001 | Acceptance Checklist Execution | [ ] | ⬜ | **Both** | N/A | | Manual |

---

## Progress Summary

| Phase | Total | Done | In Progress | Blocked |
|-------|-------|------|-------------|---------|
| 0 — Foundation | 5 | 0 | 0 | 0 |
| 0.5 — Analysis Modules | 5 | 0 | 0 | 0 |
| 1 — Core Data | 6 | 0 | 0 | 0 |
| 2 — Board | 4 | 0 | 0 | 0 |
| 3 — LLM / MVP | 4 | 0 | 0 | 0 |
| 4 — Optimization | 2 | 0 | 0 | 0 |
| 5 — Views | 3 | 0 | 0 | 0 |
| 6 — Progress | 2 | 0 | 0 | 0 |
| 7 — XP | 2 | 0 | 0 | 0 |
| 8 — QA | 2 | 0 | 0 | 0 |
| **Total** | **35** | **0** | **0** | **0** |

---

## How to Update This Ledger

1. Khi bắt đầu ticket → cập nhật Status = 🔄
2. Khi tạo PR → điền link PR trong Notes
3. Khi PR merged → Status = ✅, tick `[x]` trong cột Done, điền "Approved by" và ngày
4. Nếu blocked → Status = 🔒, ghi lý do trong Notes
5. Cập nhật Progress Summary table sau mỗi thay đổi
