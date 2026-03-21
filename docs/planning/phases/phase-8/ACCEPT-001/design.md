# Design — ACCEPT-001

## Execution Environment
- Fresh PostgreSQL database (not dev database)
- Both FE and BE running in production mode (pnpm build + pnpm start, uvicorn without --reload)
- Two different org accounts for multi-tenant testing

## Execution Steps

### Setup
```bash
# BE production mode
cd be && uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4

# FE production mode
cd ui && pnpm build && pnpm start
```

### Sections to Execute (in order)
1. A — Foundation & Infrastructure (automated: run test suite)
2. B — Org & Personnel Management (manual UI)
3. C — Project & Scenario Management (manual UI)
4. D — AI Task Generation (manual UI with real LLM)
5. E — Strategic Board (manual UI, check 3D performance)
6. F — Resource Assignment (manual + check DB)
7. G — Warning System (manual, trigger each warning type)
8. H — Optimization (manual, verify GA output)
9. I — Views (manual, all 3 views)
10. J — Progress Tracking (manual, input 3 days of progress)
11. K — XP & Gamification (manual, finalize test project)
12. L — Non-Functional (security, lint, mypy)

## Acceptance Criteria
- [ ] All 57 items in acceptance-checklist.md are checked ✅
- [ ] 0 critical failures
- [ ] Document any known issues in a "Known Issues" section
- [ ] Sign-off by PM and Tech Lead
