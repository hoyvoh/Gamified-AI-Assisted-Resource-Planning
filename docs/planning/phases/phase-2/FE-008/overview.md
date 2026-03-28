# FE-008 — Scenario Management UI (Full Lifecycle)

**Phase:** 2 — Planning Board
**Track:** Frontend
**Branch:** `feature/FE-008-scenario-management`
**Status:** Not started
**Prerequisites:** INT-001, BE-004

## Goal
Full scenario management UI: selector with state indicators, create/fork/compare, Launch modal, and scenario state display. PM can see all scenarios at a glance, understand which is active, and launch the project from here.

## Scope
- `ScenarioBar` in TopBar: dropdown listing all scenarios with status badge + P(on_time)
- Create new scenario (name + type: planning / contingency / what_if)
- Fork current scenario into a new draft
- Compare 2 scenarios side-by-side (makespan, cost, team size, P(on_time), warnings count)
- `LaunchConfirmModal`: confirm launch with team summary + unassigned task warnings
- State indicators: draft (editable), active (running — lock on edit), archived (read-only)
- Archived scenarios visible but non-editable, show archive reason + date
