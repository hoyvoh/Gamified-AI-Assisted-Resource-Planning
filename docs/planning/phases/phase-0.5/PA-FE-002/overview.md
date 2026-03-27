# PA-FE-002 — HR Analysis Screen (Mode 2)

**Phase:** 0.5 — Analysis Modules
**Track:** Frontend
**Branch:** `feature/PA-FE-002-hr-analysis-screen`
**Status:** Not started
**Prerequisites:** PA-BE-003 (Personnel Profile + Team Match API), PA-FE-001 (mode switcher exists)

## Goal

Implement the HR Analysis screen — Mode 2 of the project hub. BOD-only access. Displays the full developer roster with match scores for the current project, a 5-tab profile drawer per developer, top-3 team composition recommendations, and profile sync status.

## Scope

- Route: `/org/[orgId]/projects/[projectId]/team-analysis`
- `DeveloperRosterPanel` — sortable table of personnel with per-row match score bar
- `DeveloperProfileDrawer` — slide-over with 5 tabs: OCEAN / Behavioral / Technical / Soft Skills / Performance
- `TeamCompositionPanel` — top-3 team cards with WFU budget, skill coverage %, [Select Team] action
- `ProfileSyncStatus` — last sync date + [Refresh Profile] trigger per developer
- Zustand team match store
- API integration with profile and team-match endpoints
