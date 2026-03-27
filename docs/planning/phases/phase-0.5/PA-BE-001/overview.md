# PA-BE-001 — Analysis Modules DB Schema

**Phase:** 0.5 — Analysis Modules
**Track:** Backend
**Branch:** `feature/PA-BE-001-analysis-schema`
**Status:** Not started
**Prerequisites:** BE-002 (initial schema must exist first)

## Goal

Add the three new tables required by the Project Analysis (Mode 1) and HR Analysis (Mode 2) modules to the database via a new Alembic migration. Also update existing tables with new columns.

## Scope

**New tables:**
- `project_evaluations` — 10-axis project analysis scores + verdict
- `personnel_profiles` — 5-layer developer profile (BOD-only)
- `project_team_matches` — match scores between personnel profiles and projects

**Updated tables:**
- `personnel` — add `dreyfus_level`, `github_username`, `profile_last_synced_at`
- `skill_matrix_entries` — add `dreyfus_level`
- `projects` — add `evaluation_id` FK, `evaluation_status` enum
