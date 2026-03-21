# BE-001 — COCOMO II Estimation Engine

**Phase:** 0 — Foundation
**Track:** Backend
**Branch:** `feature/BE-001-cocomo-engine`
**Status:** Not started
**Prerequisites:** None

## Goal

Implement the COCOMO II Post-Architecture model as a standalone service. This is the estimation backbone used by every task in the system — it converts function points / size estimates into man-days with phase breakdowns.

## Scope

- `CocomoService` class with `estimate_effort()`, `to_man_days()`, `breakdown_by_phase()`
- Pydantic schemas for COCOMO input/output
- Pytest tests with known reference values
