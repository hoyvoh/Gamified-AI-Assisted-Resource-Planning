# Design — INT-002

## Files to Create/Modify
- ui/src/types/api.ts — regenerate from updated OpenAPI
- ui/src/store/scenarioStore.ts — add LLM-related actions
- ui/src/lib/api/analysis.ts — connect to real endpoints
- Any type fixes discovered during integration

## Integration Test Flow
1. Start BE: cd be && uv run uvicorn app.main:app --reload
2. Start FE: cd ui && pnpm dev
3. Navigate to /org/[id]/projects/new
4. Enter proposal: "Build a todo app with user auth, React frontend, FastAPI backend, PostgreSQL"
5. Click "Analyze" → verify 5+ tasks generated
6. Accept all tasks → Create Project
7. Navigate to board → verify tasks appear as camps
8. Drag a person to a camp → verify assignment + warning system

## Acceptance Criteria
- [ ] Full flow works end-to-end without manual data entry in DB
- [ ] Generated tasks appear on Three.js board as camps
- [ ] Warnings triggered correctly after first assignment
- [ ] npx openapi-typescript regeneration succeeds with no type errors
- [ ] pnpm type-check passes
- [ ] Manual test documented in PR description
