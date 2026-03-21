# BE-010 — Progress Log & Earned Value

**Phase:** 6 — Progress Tracking
**Track:** Backend
**Branch:** `feature/BE-010-progress-earned-value`
**Status:** Not started
**Prerequisites:** BE-006

## Goal
Accept daily progress updates from team members and compute Earned Value metrics (SPI, CPI, EAC). Auto-trigger TIME_RISK warning when estimated completion exceeds deadline.

## Scope
- POST /tasks/{id}/progress — save daily log entry
- Earned Value computation: PV, EV, AC, SPI, CPI, EAC, ETC
- GET /projects/{id}/earned-value — project-level EV dashboard
- Auto-create TIME_RISK warning when EAC > project.deadline
