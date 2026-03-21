# BE-009 — Genetic Algorithm Optimizer

**Phase:** 4 — Optimization Engine
**Track:** Backend
**Branch:** `feature/BE-009-genetic-optimizer`
**Status:** Not started
**Prerequisites:** BE-006, BE-005

## Goal
Implement a genetic algorithm that finds near-optimal resource allocation for a scenario. Supports two optimization objectives: minimize makespan (total duration) or minimize budget (total cost). Returns top 3 solutions for the user to review.

## Scope
- Chromosome representation: task-personnel assignment matrix
- Fitness functions: makespan and budget
- Constraint enforcement: capacity (7h/day), dependency order, junior rule
- Async background job (async def with potential Celery integration later)
- POST /scenarios/{id}/optimize endpoint returning top 3 solutions
