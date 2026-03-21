# INT-001 — FE-BE Integration: Personnel & Tasks

**Phase:** 1 — Core Data Management
**Track:** Integration
**Branch:** `feature/INT-001-personnel-tasks-integration`
**Status:** Not started
**Prerequisites:** BE-003, FE-003, FE-004

## Goal
Connect the frontend panels to the live backend APIs. Generate TypeScript types from OpenAPI schema. Set up Zustand store as single source of truth for scenario state.

## Scope
- Generate src/types/api.ts from running backend
- Complete API client functions for all existing endpoints
- Zustand scenarioStore wiring to API calls
- Environment configuration (.env.local)
- Manual E2E smoke test of full flow
