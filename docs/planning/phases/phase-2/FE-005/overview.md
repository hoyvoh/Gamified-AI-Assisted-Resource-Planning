# FE-005 — Planning Board — Static Kanban

**Phase:** 2 — Planning Board
**Track:** Frontend
**Branch:** `feature/FE-005-planning-board-static`
**Status:** Not started
**Prerequisites:** INT-001

## Goal
Build the static planning board UI — a card-game style kanban where task cards are rendered in lanes and developer cards are listed in the left panel. No interaction yet (drag-and-drop in FE-006). Focus: data display, card design, layout.

## Scope
- `PlanningBoard` layout: left sidebar (developer cards) + main board (task card lanes)
- **Task card** component: title, effort badge (man-days), techstack tag chips, status badge, P(on_time) badge, assignee avatars
- **Developer card** component: name, avatar, availability bar, skill match % (from Pillar 2 if available, else N/A), WFU effective
- Lanes: `Unassigned` | `In Progress` | `Done` (group by task status)
- Task card click → expand to show effort breakdown (investigate/design/implement/test/review/release), dependencies list, active warnings
- Developer card click → popup with allocation summary across all projects
- Scenario selector (top bar) to switch between scenarios
- Empty state when no tasks exist
