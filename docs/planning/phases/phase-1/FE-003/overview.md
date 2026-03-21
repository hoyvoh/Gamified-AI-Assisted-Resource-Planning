# FE-003 — Personnel Sidebar Panel

**Phase:** 1 — Core Data Management
**Track:** Frontend
**Branch:** `feature/FE-003-personnel-sidebar`
**Status:** Not started
**Prerequisites:** FE-002

## Goal
Left sidebar showing all org personnel as draggable cards with WFU load indicators. Clicking opens a detail drawer with skill matrix and multi-project allocation breakdown.

## Scope
- PersonnelCard: avatar, name, seniority badge, WFU load bar
- Search + filter by skill/seniority
- PersonnelDetailDrawer: skill matrix table, allocation doughnut, daily hours
- Draggable cards (HTML drag API — Three.js drop handled in FE-006)
- Data fetched from API via usePersonnel hook
