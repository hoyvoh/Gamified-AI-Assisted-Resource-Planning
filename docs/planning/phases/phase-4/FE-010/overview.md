# FE-010 — Optimization Results UI

**Phase:** 4 — Optimization Engine
**Track:** Frontend
**Branch:** `feature/FE-010-optimization-ui`
**Status:** Not started
**Prerequisites:** BE-009, FE-006

## Goal
Display genetic algorithm optimization results. Shows top 3 solutions in a comparison panel, allowing the user to accept all, accept selectively, or dismiss.

## Scope
- "Optimize" button in TopBar (makespan / budget mode selector)
- Loading state while GA runs
- Comparison panel: current vs each solution
- Accept button applies assignments to board
- Solution shows: improvement %, makespan days, cost, remaining warnings
