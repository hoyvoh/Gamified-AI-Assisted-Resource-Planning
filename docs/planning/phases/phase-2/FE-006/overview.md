# FE-006 — Board Drag & Drop Assignment

**Phase:** 2 — Strategic Board
**Track:** Frontend
**Branch:** `feature/FE-006-board-drag-drop`
**Status:** Not started
**Prerequisites:** FE-005, BE-006

## Goal
Enable personnel assignment by dragging a PersonnelCard from the sidebar and dropping it onto a camp in the Three.js board. Includes optimistic UI update, API integration, and rollback on failure.

## Scope
- HTML drag from PersonnelCard sets personnelId in dataTransfer
- Three.js raycasting detects which camp is under the pointer on drop
- Optimistic update: unit moves immediately, API call fires
- Rollback on API failure with error toast
- Keyboard fallback: select person → select task → press Enter to assign
