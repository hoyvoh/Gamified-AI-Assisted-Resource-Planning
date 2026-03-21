# BE-008 — Risk Analysis Endpoint

**Phase:** 3 — LLM Pipeline
**Track:** Backend
**Branch:** `feature/BE-008-risk-analysis`
**Status:** Not started
**Prerequisites:** BE-007, BE-006

## Goal
LLM-powered risk analysis for a scenario. Builds rich context from tasks, assignments, warnings, and deadline, then asks Claude to identify risks with probability, impact, and mitigation suggestions.

## Scope
- Context builder: aggregates scenario state into structured text
- Risk prompt template
- Structured risk response parsing
- POST /scenarios/{id}/risk-analysis endpoint
