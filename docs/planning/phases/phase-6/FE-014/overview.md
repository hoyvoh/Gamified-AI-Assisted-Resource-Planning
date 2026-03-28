# FE-014 — Execution Screen

**Phase:** 6 — Execution Mode
**Track:** Frontend
**Branch:** `feature/FE-014-execution-screen`
**Status:** Not started
**Prerequisites:** BE-010, INT-001, FE-011

## Goal
Full execution mode screen for daily progress tracking, EV metrics monitoring, and mid-execution scenario switching. Replaces the planning board as the primary screen after project launch.

## Scope
- `MyTasksPanel` (left): each member sees only their assigned tasks with progress input
- `ExecutionGantt` (center/right): full team Gantt — 3-layer bars, scenario markers, filter by person
- EV metrics summary: SPI, CPI, EAC, P(on_time) gauge with trend (PM view)
- `ScenarioSwitchBanner`: auto-shown when P(on_time) critical (< 40% for 3 days)
- `SwitchPlanDropdown` + `SwitchPlanConfirmModal`: PM-only, select new scenario + record trigger reason
- P(on_time) badge in TopBar — updates after each progress submission
