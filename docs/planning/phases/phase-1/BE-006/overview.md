# BE-006 — Assignment APIs & Warning Engine

**Phase:** 1 — Core Data Management
**Track:** Backend
**Branch:** `feature/BE-006-assignments-warnings`
**Status:** Not started
**Prerequisites:** BE-004

## Goal
Resource assignment CRUD with automatic Warning Engine. Every assignment change triggers recomputation of all relevant warnings (capacity overload, junior-alone, budget, time risk).

## Scope
- Assignment CRUD endpoints
- WFU effective calculation (base_wfu × skill_multiplier × mode_multiplier × allocation_pct)
- Warning Engine: 5 warning types computed synchronously
- Warning acknowledgement endpoint
