# MVP Build Plan

**Developer Growth & Evidence-Based Performance Insight Platform**

> **Status as of 2026-04:** All milestones shipped. System is running end-to-end on real data.

---

## MVP Scope (Delivered)

1. Org → Team → Member hierarchy CRUD
2. Time-bounded analysis trigger + async polling
3. Full pipeline: GitHub collection → P1 evidence extraction → P2 consolidation → P3 dimension scoring → P4 UI summaries → P5 KPT → P6 cases → P7 overview → P8 self-critique gate
4. 6-tab member profile: Overview · Competency · KPT · Cases · Journey · Evidence
5. Validation flags (per-dimension verdict from user)
6. Milestone derivation + long-term history

---

## Milestones

| # | Milestone | Status |
|---|-----------|--------|
| M1 | Skeleton & Org/Team/Member hierarchy | ✓ Shipped |
| M2 | Analysis run infrastructure (trigger, poll, fail gracefully) | ✓ Shipped |
| M3 | Data collection: GitHub collector + LLM MCP collector | ✓ Shipped |
| M4 | Evidence extraction: P1 + P2 → BehavioralEvents | ✓ Shipped |
| M5 | Dimension scoring: P3 + scoring engine → DimensionScores + CategoryScores | ✓ Shipped |
| M6 | Human output: P4 (ui_summary) + P5 (KPT) + P6 (cases) + P7 (overview) | ✓ Shipped |
| M7 | P8 self-critique gate + validation flags | ✓ Shipped |
| M8 | Profile UI — all 6 tabs | ✓ Shipped |
| M9 | Integration, hardening, orphan cleanup | ✓ Shipped |

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js (TypeScript) |
| Backend | Python 3.12 · FastAPI · SQLAlchemy · aiosqlite |
| Database | SQLite (dev) |
| AI Pipeline | Claude CLI subprocess (`claude --model claude-sonnet-4-6 -p`) |
| Deployment | Local / single-machine |

---

## Out of Scope (Post-MVP)

- Multi-user auth / RBAC
- Automated compensation / promotion recommendations
- Team-level capability heatmaps
- Period-to-period export
- Role-aware development ladders
- Manager annotation layer
- Exportable coaching packets

---

## Known Risks (Addressed)

| Risk | Resolution |
|------|-----------|
| Win32 asyncio subprocess break under `uvicorn --reload` | All subprocess calls use `asyncio.to_thread(subprocess.run)` — see bug log |
| Concurrent subprocess spawning (P5/P6/P7) fails transiently on Windows | `FileNotFoundError` is now retried instead of treated as permanent — see bug log |
| LLM preamble text breaks JSON parsing | `_parse_json` uses `re.search(DOTALL)` + `{...}` fallback scan |
| P5/P6/P7 failure leaves tabs empty without surfacing error | Non-blocking by design; check logs for "PX failed for run" warnings |
| P8 false negatives | P8 is mandatory; runs complete even with `p8_approved=false` |
| SQLite performance | Adequate at current scale; indexed on `analysis_run_id`, `member_id` |
