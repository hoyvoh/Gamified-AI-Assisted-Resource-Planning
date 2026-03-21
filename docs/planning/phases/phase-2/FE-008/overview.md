# FE-008 — Scenario Management UI

**Phase:** 2 — Strategic Board
**Track:** Frontend
**Branch:** `feature/FE-008-scenario-management`
**Status:** Not started
**Prerequisites:** INT-001, BE-004

## Goal
Scenario selector in TopBar: list scenarios, switch between them, create snapshots, fork into new scenarios. Immutable scenarios show lock icon and disable edit actions.

## Scope
- ScenarioSelector dropdown in TopBar
- "Snapshot as..." modal → name input → create immutable copy
- "New scenario" → fork from current
- Lock icon on snapshot scenarios, edit buttons disabled
- Scenario metadata: name, created date, type (draft/snapshot)
