# BE-007 — LLM Service & Project Analysis

**Phase:** 3 — LLM Pipeline
**Track:** Backend
**Branch:** `feature/BE-007-llm-project-analysis`
**Status:** Not started
**Prerequisites:** BE-004

## Goal
Integrate Claude (Anthropic SDK) to analyze a project proposal and generate a structured list of draft tasks with effort estimates, categories, techstacks, and dependencies.

## Scope
- LLMService abstraction (swappable Claude/OpenAI)
- Structured prompt template for task generation
- Response parsing with Pydantic validation
- POST /projects/{id}/analyze endpoint
- LLM session logging to llm_sessions table
- 503 fallback when LLM unavailable
