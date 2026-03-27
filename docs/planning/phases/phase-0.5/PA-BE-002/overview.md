# PA-BE-002 — Project Evaluation API + AI Assist

**Phase:** 0.5 — Analysis Modules
**Track:** Backend
**Branch:** `feature/PA-BE-002-evaluation-api`
**Status:** Not started
**Prerequisites:** PA-BE-001, BE-003 (core CRUD patterns)

## Goal

Implement the Project Evaluation API — the backend for Mode 1 (Project Analysis Screen). Handles CRUD for evaluation scores, verdict computation with hard gate rules, auto-generated risk register, and AI-assisted axis scoring.

## Scope

- `ProjectEvaluationService` — scoring logic, verdict computation, risk register generation
- `POST/GET/PATCH /projects/{id}/evaluation` endpoints
- `POST /projects/{id}/evaluation/finalize` — compute verdict and lock
- `POST /projects/{id}/evaluation/ai-assist` — LLM scoring suggestion for 1 axis
- Pydantic schemas for all request/response shapes
- Pytest tests: verdict logic, hard gate rules, AI assist mocking
