# BE-011 — XP Calculation Engine

**Phase:** 7 — XP & Gamification
**Track:** Backend
**Branch:** `feature/BE-011-xp-engine`
**Status:** Not started
**Prerequisites:** BE-010

## Goal
Calculate and award XP to all project members when a project is finalized. XP is based on task completion quality, timeliness, skill usage, and mentoring. Skill levels in the skill matrix are updated when XP thresholds are reached.

## Scope
- XP rules: on-time, early, new skill, quality, mentoring
- XPCalculationService: iterate all member-task pairs
- POST /projects/{id}/finalize: trigger XP + update skill levels
- Level thresholds: beginner(0) → intermediate(100) → advanced(300) → expert(600)
