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

## Phase 0 — Foundation

| Ticket | Title | Status | Phase | Branch | Implemented by | Approved by | Notes |
|--------|-------|--------|-------|--------|----------------|-------------|-------|
| BE-001 | COCOMO II Estimation Engine | ⬜ | 0 | `feature/BE-001-cocomo-engine` | TBD | TBD | |
| BE-002 | Database Schema & Migrations | ⬜ | 0 | `feature/BE-002-db-schema` | TBD | TBD | Prerequisite cho mọi BE ticket khác |
| BE-003 | Core CRUD APIs | ⬜ | 0 | `feature/BE-003-core-crud` | TBD | TBD | Sau BE-002 |
| FE-001 | Application Shell & Routing | ⬜ | 0 | `feature/FE-001-app-shell` | TBD | TBD | |
| FE-002 | Design System & Shared Components | ⬜ | 0 | `feature/FE-002-design-system` | TBD | TBD | |

## Phase 1 — Core Data Management

| Ticket | Title | Status | Phase | Branch | Implemented by | Approved by | Notes |
|--------|-------|--------|-------|--------|----------------|-------------|-------|
| BE-004 | Scenario & Task APIs | ⬜ | 1 | `feature/BE-004-scenarios-tasks` | TBD | TBD | Sau BE-003 |
| BE-005 | Task Dependencies & Critical Path | ⬜ | 1 | `feature/BE-005-dependencies-critical-path` | TBD | TBD | Sau BE-004 |
| BE-006 | Assignment APIs & Warning Engine | ⬜ | 1 | `feature/BE-006-assignments-warnings` | TBD | TBD | Sau BE-004 |
| FE-003 | Personnel Sidebar Panel | ⬜ | 1 | `feature/FE-003-personnel-sidebar` | TBD | TBD | Sau FE-002 |
| FE-004 | Task Panel | ⬜ | 1 | `feature/FE-004-task-panel` | TBD | TBD | Sau FE-002 |
| INT-001 | FE-BE Integration: Personnel & Tasks | ⬜ | 1 | `feature/INT-001-personnel-tasks-integration` | TBD | TBD | Sau BE-003, FE-003, FE-004 |

## Phase 2 — Strategic Board

| Ticket | Title | Status | Phase | Branch | Implemented by | Approved by | Notes |
|--------|-------|--------|-------|--------|----------------|-------------|-------|
| FE-005 | Three.js Board — Static Scene | ⬜ | 2 | `feature/FE-005-threejs-board-static` | TBD | TBD | Sau INT-001 |
| FE-006 | Board Drag & Drop Assignment | ⬜ | 2 | `feature/FE-006-board-drag-drop` | TBD | TBD | Sau FE-005 |
| FE-007 | Warning Bar | ⬜ | 2 | `feature/FE-007-warning-bar` | TBD | TBD | Sau BE-006, FE-005 |
| FE-008 | Scenario Management UI | ⬜ | 2 | `feature/FE-008-scenario-management` | TBD | TBD | Sau INT-001, BE-004 |

## Phase 3 — LLM Pipeline (MVP Target: 1/4)

| Ticket | Title | Status | Phase | Branch | Implemented by | Approved by | Notes |
|--------|-------|--------|-------|--------|----------------|-------------|-------|
| BE-007 | LLM Service & Project Analysis | ⬜ | 3 | `feature/BE-007-llm-project-analysis` | TBD | TBD | |
| BE-008 | Risk Analysis Endpoint | ⬜ | 3 | `feature/BE-008-risk-analysis` | TBD | TBD | Sau BE-007 |
| FE-009 | AI Prompt Interface | ⬜ | 3 | `feature/FE-009-ai-prompt-interface` | TBD | TBD | Sau INT-001 |
| INT-002 | E2E: Proposal → Board | ⬜ | 3 | `feature/INT-002-proposal-to-board` | TBD | TBD | **MVP milestone** |

## Phase 4 — Optimization Engine

| Ticket | Title | Status | Phase | Branch | Implemented by | Approved by | Notes |
|--------|-------|--------|-------|--------|----------------|-------------|-------|
| BE-009 | Genetic Algorithm Optimizer | ⬜ | 4 | `feature/BE-009-genetic-optimizer` | TBD | TBD | |
| FE-010 | Optimization Results UI | ⬜ | 4 | `feature/FE-010-optimization-ui` | TBD | TBD | Sau BE-009 |

## Phase 5 — Views & Visualizations

| Ticket | Title | Status | Phase | Branch | Implemented by | Approved by | Notes |
|--------|-------|--------|-------|--------|----------------|-------------|-------|
| FE-011 | Gantt Chart | ⬜ | 5 | `feature/FE-011-gantt-chart` | TBD | TBD | Sau INT-001 |
| FE-012 | Dependency Graph | ⬜ | 5 | `feature/FE-012-dependency-graph` | TBD | TBD | Sau BE-005, INT-001 |
| FE-013 | Calendar View | ⬜ | 5 | `feature/FE-013-calendar-view` | TBD | TBD | Sau INT-001 |

## Phase 6 — Progress Tracking

| Ticket | Title | Status | Phase | Branch | Implemented by | Approved by | Notes |
|--------|-------|--------|-------|--------|----------------|-------------|-------|
| BE-010 | Progress Log & Earned Value | ⬜ | 6 | `feature/BE-010-progress-earned-value` | TBD | TBD | Sau BE-006 |
| FE-014 | Progress Dashboard | ⬜ | 6 | `feature/FE-014-progress-dashboard` | TBD | TBD | Sau BE-010, INT-001 |

## Phase 7 — XP & Gamification

| Ticket | Title | Status | Phase | Branch | Implemented by | Approved by | Notes |
|--------|-------|--------|-------|--------|----------------|-------------|-------|
| BE-011 | XP Calculation Engine | ⬜ | 7 | `feature/BE-011-xp-engine` | TBD | TBD | Sau BE-010 |
| FE-015 | XP & End-of-Project Review | ⬜ | 7 | `feature/FE-015-xp-review` | TBD | TBD | Sau BE-011, FE-014 |

## Phase 8 — QA & Acceptance

| Ticket | Title | Status | Phase | Branch | Implemented by | Approved by | Notes |
|--------|-------|--------|-------|--------|----------------|-------------|-------|
| QA-001 | End-to-End Test Suite | ⬜ | 8 | `feature/QA-001-e2e-tests` | TBD | TBD | |
| ACCEPT-001 | Acceptance Checklist Execution | ⬜ | 8 | N/A | TBD | TBD | Manual |

---

## Progress Summary

| Phase | Total | Done | In Progress | Blocked |
|-------|-------|------|-------------|---------|
| 0 — Foundation | 5 | 0 | 0 | 0 |
| 1 — Core Data | 6 | 0 | 0 | 0 |
| 2 — Board | 4 | 0 | 0 | 0 |
| 3 — LLM / MVP | 4 | 0 | 0 | 0 |
| 4 — Optimization | 2 | 0 | 0 | 0 |
| 5 — Views | 3 | 0 | 0 | 0 |
| 6 — Progress | 2 | 0 | 0 | 0 |
| 7 — XP | 2 | 0 | 0 | 0 |
| 8 — QA | 2 | 0 | 0 | 0 |
| **Total** | **30** | **0** | **0** | **0** |

---

## How to Update This Ledger

1. Khi bắt đầu ticket → cập nhật Status = 🔄, điền "Implemented by"
2. Khi tạo PR → điền branch, link PR trong Notes
3. Khi PR merged → Status = ✅, điền "Approved by" và ngày
4. Nếu blocked → Status = 🔒, ghi lý do trong Notes
5. Cập nhật Progress Summary table sau mỗi thay đổi
