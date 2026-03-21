# FE-012 — Dependency Graph

**Phase:** 5 — Views & Visualizations
**Track:** Frontend
**Branch:** `feature/FE-012-dependency-graph`
**Status:** Not started
**Prerequisites:** BE-005, INT-001

## Goal
DAG visualization of task dependencies. Uses dagre layout algorithm for auto-positioning. Critical path highlighted in orange/red. Interactive: zoom, pan, click to open task detail.

## Scope
- Directed graph: nodes = tasks, edges = dependencies
- dagre layout for topological auto-positioning
- Critical path tasks highlighted (from BE-005 /critical-path endpoint)
- Zoom + pan (SVG viewBox manipulation)
- Click node → TaskDetailDrawer
