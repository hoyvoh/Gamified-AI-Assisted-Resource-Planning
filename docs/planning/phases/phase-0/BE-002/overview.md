# BE-002 — Database Schema & Migrations

**Phase:** 0 — Foundation
**Track:** Backend
**Branch:** `feature/BE-002-db-schema`
**Status:** Not started
**Prerequisites:** None (but run before any other BE ticket)

## Goal

Create all SQLAlchemy ORM models and Alembic migrations for the complete database schema defined in `docs/design/database-spec.md`. This is a hard prerequisite for every other backend ticket.

## Scope

- All 12 ORM models (organizations, users, personnel, skill_matrix_entries, projects, project_memberships, scenarios, tasks, task_dependencies, resource_assignments, task_progress_logs, project_warnings, xp_events, llm_sessions)
- Alembic configured and initial migration file
- DB constraints (check constraints, unique constraints) enforced at DB level
