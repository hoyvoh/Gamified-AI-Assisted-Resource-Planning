# BE-004 — Scenario & Task APIs

**Phase:** 1 — Core Data Management
**Track:** Backend
**Branch:** `feature/BE-004-scenarios-tasks`
**Status:** Not started
**Prerequisites:** BE-003

## Goal
Full CRUD for scenarios and tasks, including bulk task creation, task split/merge operations, and task position data for the 3D board.

## Scope
- Scenario CRUD + snapshot (immutable copy) endpoint
- Task CRUD + bulk create endpoint
- Task split (1 → N) and merge (N → 1) operations
- Task position (x, z) for board layout
- Scenario snapshot immutability enforcement (403 on edit attempts)
