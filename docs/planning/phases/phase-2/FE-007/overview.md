# FE-007 — Warning Bar

**Phase:** 2 — Strategic Board
**Track:** Frontend
**Branch:** `feature/FE-007-warning-bar`
**Status:** Not started
**Prerequisites:** BE-006, FE-005

## Goal
Collapsible warning bar at the bottom of the board screen. Shows severity-grouped badges with counts. Clicking expands to show individual warnings with detail and acknowledgement.

## Scope
- Sticky bottom bar with severity badge groups (🔴/🟠/🟡)
- Expand: scrollable list of individual warnings
- Each warning: type icon, message, entity link, acknowledge button
- Auto-refresh warnings after each assignment change
- aria-live announcements for new critical warnings
