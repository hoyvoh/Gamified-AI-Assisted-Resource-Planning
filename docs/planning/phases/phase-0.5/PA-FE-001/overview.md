# PA-FE-001 — Project Analysis Screen (Mode 1)

**Phase:** 0.5 — Analysis Modules
**Track:** Frontend
**Branch:** `feature/PA-FE-001-project-analysis-screen`
**Status:** Not started
**Prerequisites:** PA-BE-002 (Evaluation API must exist), FE-003 (routing skeleton)

## Goal

Implement the Project Analysis screen — Mode 1 of the project hub. PM and TL can score a project across 10 axes, get AI-assisted scoring suggestions, view the auto-populated risk register, and finalize the evaluation to receive a verdict.

## Scope

- Route: `/org/[orgId]/projects/[projectId]/evaluate`
- `ProjectRadarChart` — 10-axis SVG radar, live update on score change
- `AxisScoringPanel` — 10 accordion rows with 1–5 sliders, TELOS sub-dimension inputs, AI Assist button per axis
- `RiskRegister` — auto-rendered from axes ≤ 2; severity badges
- `VerdictBadge` — `proceed` / `conditional` / `do_not_proceed` with color coding
- Zustand evaluation store
- API integration with all 5 evaluation endpoints
- Mode tab switcher in project hub header
