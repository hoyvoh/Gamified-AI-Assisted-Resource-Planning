# FE-011 — Gantt Chart

**Phase:** 5 — Views & Visualizations
**Track:** Frontend
**Branch:** `feature/FE-011-gantt-chart`
**Status:** Not started
**Prerequisites:** INT-001

## Goal
SVG-based Gantt chart generated from scenario task data. Shows planned vs actual progress bars, milestones, and supports filtering by person, category, and status.

## Scope
- Timeline X-axis by day, Y-axis by task (grouped by category)
- Planned bar (solid) and actual progress (striped overlay)
- Milestone diamonds at critical task deadlines
- Filters: by person, by category, by status
- Click task bar → opens TaskDetailDrawer
- No heavy chart library (custom SVG)
