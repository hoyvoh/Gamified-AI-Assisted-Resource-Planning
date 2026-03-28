# BE-004 — Scenario & Task APIs + State Machine

**Phase:** 1 — Core Data Management
**Track:** Backend
**Branch:** `feature/BE-004-scenario-tasks`
**Status:** Not started
**Prerequisites:** BE-003

## Goal
Full CRUD for scenarios and tasks, plus the scenario state machine (draft → active → archived), launch mechanism, fork-with-copy, and task split/merge operations.

## Scope
- Scenario CRUD with state machine: `draft` | `active` | `archived`
- Scenario types: `planning` | `contingency` | `what_if`
- **Launch endpoint**: activate a scenario → set project.started_at, create execution_baseline snapshot, enforce only-one-active constraint
- **Fork endpoint**: deep copy scenario (tasks + assignments) into new draft scenario
- **Archive endpoint**: mark scenario archived with reason + timestamp
- Scenario immutability: `active` and `archived` scenarios block task edits (403)
- Task CRUD + bulk create
- Task split (1 → N subtasks) and merge (N → 1)
- Enforce only-one-active per project constraint
