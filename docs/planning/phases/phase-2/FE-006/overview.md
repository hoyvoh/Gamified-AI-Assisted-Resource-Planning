# FE-006 — Board Drag & Drop Assignment

**Phase:** 2 — Planning Board
**Track:** Frontend
**Branch:** `feature/FE-006-board-drag-drop`
**Status:** Not started
**Prerequisites:** FE-005, BE-006

## Goal
Enable personnel assignment by dragging a DeveloperCard from the left panel and dropping it onto a TaskCard in the kanban board. Includes AllocationModal for % + WFU mode selection, optimistic UI update, API integration, and rollback on failure.

## Scope
- React DnD (or native HTML5 drag API): DeveloperCard is draggable source, TaskCard is drop target
- Drop → `AllocationModal` opens: enter allocation % + select WFU mode (standard / fast / quality; fast/quality only if skill match)
- Optimistic update: assignee avatar appears on task card immediately
- API call: `POST /scenarios/{id}/assignments`
- Rollback on failure: remove avatar, show error toast
- Remove assignment: click assignee avatar → confirm → delete
- Keyboard fallback: Tab to DeveloperCard → Space to "pick up" → Tab to TaskCard → Enter to assign
