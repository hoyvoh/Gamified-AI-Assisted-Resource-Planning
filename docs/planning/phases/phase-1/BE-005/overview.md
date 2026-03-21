# BE-005 — Task Dependencies & Critical Path

**Phase:** 1 — Core Data Management
**Track:** Backend
**Branch:** `feature/BE-005-dependencies-critical-path`
**Status:** Not started
**Prerequisites:** BE-004

## Goal
Manage task dependency relationships (DAG) and implement Critical Path Method (CPM) to identify the longest path through the project, which determines the earliest possible completion date.

## Scope
- Add/remove dependency endpoints
- Cycle detection (reject circular dependencies)
- CPM algorithm: early start, early finish, late start, late finish, float
- Critical path endpoint returning ordered task list and total duration
