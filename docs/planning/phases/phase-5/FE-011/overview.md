# FE-011 — Gantt Chart (3-Layer + Scenario Markers)

**Phase:** 5 — Views & Visualizations
**Track:** Frontend
**Branch:** `feature/FE-011-gantt-chart`
**Status:** Not started
**Prerequisites:** INT-001

## Goal
SVG-based Gantt chart with 3 bar layers (baseline / planned / actual), scenario switch markers, and interactive deadline editing. Used in both Mode 3 (planning) and Mode 4 (execution).

## Scope
- **3 bar layers per task row:**
  - Baseline bar (grey, thin) — from `execution_baseline`, only visible after project launch
  - Planned bar (blue, solid) — from active scenario task dates
  - Actual bar (green/amber/red overlay) — from ProgressLogs completion %
- Scenario switch markers on timeline (with trigger reason tooltip)
- Today marker (vertical dashed line)
- Deadline marker (vertical red line) and EAC marker (green if ahead, red if behind)
- Milestone diamonds
- Filters: by person (swimlane), by milestone (grouping), by status
- Drag planned bar → reschedule task (triggers DEADLINE_CHANGE warning)
- Click bar → TaskDetailDrawer
- Hover → tooltip with planned dates, actual %, EAC, assignees
