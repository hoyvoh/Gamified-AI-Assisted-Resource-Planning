# PA-BE-003 — Personnel Profile API + Team Match Engine

**Phase:** 0.5 — Analysis Modules
**Track:** Backend
**Branch:** `feature/PA-BE-003-personnel-profile-api`
**Status:** Not started
**Prerequisites:** PA-BE-001, BE-003 (core CRUD patterns)

## Goal

Implement the Personnel Profile API (BOD-only) and Team Match engine. Handles 5-layer developer profile storage, GitHub data collection wrapper, WFU multi-factor computation, and cosine similarity-based team composition recommendations.

## Scope

- `PersonnelProfileService` — profile storage, WFU factor computation
- `TeamMatchService` — cosine similarity scoring, top-N team configuration recommendation
- `GET/POST /personnel/{id}/profile` endpoints (BOD-only)
- `POST /projects/{id}/team-match` — compute match scores for all available personnel
- `GET /projects/{id}/team-match/recommendations` — return top 3 team configurations
- Pydantic schemas for all request/response shapes
- Pytest tests: access control, match scoring, team recommendation logic
