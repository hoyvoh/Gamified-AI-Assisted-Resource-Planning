# UI API Usage Status (Analysis Chamber)

Scope: `ui/src/features/analysis-chamber/*` (member profile / analysis “chamber” UI).

API base: UI uses `ANALYSIS_CHAMBER_API_BASE_URL = <origin>/api/v1` (see `ui/src/features/analysis-chamber/api/analysis-chamber-api.client.ts:1`).

## Used (called by UI)

### Bootstrap / shell

- `GET /api/v1/members/{member_id}`
  - Called by `getAnalysisChamberBootstrap()` in `ui/src/features/analysis-chamber/api/analysis-chamber-api.ts:71`.
  - Purpose: load member identity + `analysis_status` for shell gating.
- `GET /api/v1/role-profiles`
  - Called by `getAnalysisChamberBootstrap()` in `ui/src/features/analysis-chamber/api/analysis-chamber-api.ts:71`.
  - Purpose: resolve `roleName` from `member.role_profile_id`.
- `GET /api/v1/members/{member_id}/analysis-runs?limit=1&offset=0`
  - Called by `getAnalysisChamberBootstrap()` in `ui/src/features/analysis-chamber/api/analysis-chamber-api.ts:71`.
  - Purpose: get `latestRun` for status/progress hints.
- `GET /api/v1/organizations/{org_id}`
  - Called by `getAnalysisChamberBootstrap()` in `ui/src/features/analysis-chamber/api/analysis-chamber-api.ts:71`.
  - Purpose: resolve `teamName` from `member.team_id`.

### Trigger analysis

- `POST /api/v1/analysis-runs`
  - Called by `triggerAnalysis()` in `ui/src/features/analysis-chamber/api/analysis-chamber-api.ts:259`.
  - Used by pending screen CTA in `ui/src/features/analysis-chamber/components/analysis-chamber-shell.tsx:115`.

### Profile tabs (read)

- `GET /api/v1/members/{member_id}/profile/overview`
  - Called by `getChamberOverview()` in `ui/src/features/analysis-chamber/api/analysis-chamber-api.ts:107`.
  - Used by `OverviewStageShell` in `ui/src/features/analysis-chamber/components/stages/overview-stage-shell.tsx:205`.
- `GET /api/v1/members/{member_id}/profile/competency`
  - Called by `getChamberCompetency()` in `ui/src/features/analysis-chamber/api/analysis-chamber-api.ts:116`.
  - Used by `CompetencyStageShell` via `useAnalysisChamberCompetencyData` (hook in `ui/src/features/analysis-chamber/hooks/use-analysis-chamber-shell-data.ts:62`).
- `GET /api/v1/members/{member_id}/profile/competency/{dimension_id}`
  - Called by `getChamberDimensionDetail()` in `ui/src/features/analysis-chamber/api/analysis-chamber-api.ts:135`.
  - Used by `useAnalysisChamberDimensionDetail` in `ui/src/features/analysis-chamber/hooks/use-analysis-chamber-data.ts:43`.
- `GET /api/v1/members/{member_id}/profile/kpt`
  - Called by `getChamberKpt()` in `ui/src/features/analysis-chamber/api/analysis-chamber-api.ts:146`.
  - Used by `KptStageShell` via `useAnalysisChamberKptData` (hook in `ui/src/features/analysis-chamber/hooks/use-analysis-chamber-shell-data.ts:77`).
- `GET /api/v1/members/{member_id}/profile/cases`
  - Called by `getChamberCases()` in `ui/src/features/analysis-chamber/api/analysis-chamber-api.ts:151`.
  - Used by `CasesStageShell` via `useAnalysisChamberCasesData` (hook in `ui/src/features/analysis-chamber/hooks/use-analysis-chamber-shell-data.ts:86`).
- `GET /api/v1/members/{member_id}/profile/cases/{case_id}`
  - Called by `getChamberCaseDetail()` in `ui/src/features/analysis-chamber/api/analysis-chamber-api.ts:160`.
  - Used by `useAnalysisChamberCaseDetail` in `ui/src/features/analysis-chamber/hooks/use-analysis-chamber-data.ts:54`.
- `GET /api/v1/members/{member_id}/profile/journey`
  - Called by `getChamberJourney()` in `ui/src/features/analysis-chamber/api/analysis-chamber-api.ts:171`.
  - Used by `JourneyStageShell` via `useAnalysisChamberJourneyData` (hook in `ui/src/features/analysis-chamber/hooks/use-analysis-chamber-shell-data.ts:95`).

### Org / team / member (create, launcher)

- `GET /api/v1/organizations`
  - Called by `listOrganizations()` in `ui/src/features/analysis-chamber/api/analysis-chamber-api.ts:207`.
  - Used by launcher UI in `ui/src/features/analysis-chamber/components/analysis-chamber-launcher.tsx:1`.
- `POST /api/v1/organizations`
  - Called by `createOrganization()` in `ui/src/features/analysis-chamber/api/analysis-chamber-api.ts:216`.
- `GET /api/v1/organizations/{org_id}`
  - Called by `getOrganizationDetail()` / `getOrgTeams()` in `ui/src/features/analysis-chamber/api/analysis-chamber-api.ts:211`.
- `POST /api/v1/organizations/{org_id}/teams`
  - Called by `createTeam()` in `ui/src/features/analysis-chamber/api/analysis-chamber-api.ts:233`.
- `POST /api/v1/organizations/{org_id}/teams/{team_id}/members`
  - Called by `createMember()` in `ui/src/features/analysis-chamber/api/analysis-chamber-api.ts:244`.

### Member lookup by GitHub handle (launcher enter/create)

- `GET /api/v1/members?external_id=<handle>` — **⚠️ This endpoint does NOT exist in BE.**
  - `findMemberByGithubHandle()` actually traverses org tree: `GET /organizations` → `GET /organizations/{org_id}` per org, then scans `team.members` client-side.
  - Used by launcher "Enter" and "Create" flows in `ui/src/features/analysis-chamber/components/analysis-chamber-launcher.tsx:1`.
  - **TODO:** Replace with a dedicated flat-search endpoint when BE adds one.

## Called but not reflected well (API fields fetched but not shown/used)

- Analysis run progress detail is not surfaced:
  - UI fetches latest run in bootstrap (`GET /members/{id}/analysis-runs?limit=1`), but only uses `progress_pct` for a “confidence” effect.
  - `progress_stage`, `error_message`, `scoring_version`, `completed_at` are mapped but not displayed anywhere (see `mapChamberAnalysisRun()` in `ui/src/features/analysis-chamber/api/analysis-chamber-api.mappers.ts:59`).
- Org detail payload is over-fetched for UI needs:
  - `GET /organizations/{org_id}` returns full org tree; UI only uses it to compute `teamName` (see `getTeamName()` in `ui/src/features/analysis-chamber/api/analysis-chamber-api.ts:63`).

## Implemented in UI code but currently unused (no UI path calls them)

These functions/hooks exist, but repo search shows no component uses them:

- `GET /api/v1/analysis-runs/{run_id}/validation-flags`
  - `getChamberValidationFlags()` in `ui/src/features/analysis-chamber/api/analysis-chamber-api.ts:180`
  - Hook `useAnalysisChamberValidationFlags()` in `ui/src/features/analysis-chamber/hooks/use-analysis-chamber-data.ts:65`
- `POST /api/v1/validation-flags`
  - `createChamberValidationFlag()` in `ui/src/features/analysis-chamber/api/analysis-chamber-api.ts:191`
  - Mutation `useCreateAnalysisChamberValidationFlag()` in `ui/src/features/analysis-chamber/hooks/use-analysis-chamber-data.ts:73`

## BE APIs available but not used by Analysis Chamber UI

Profile / evidence:
- `GET /api/v1/members/{member_id}/profile/evidence`
- `GET /api/v1/evidence/{evidence_id}`
- `GET /api/v1/members/{member_id}/milestones` (note: UI journey uses milestones from `/profile/journey`, not this endpoint)

Analysis workflow:
- `GET /api/v1/analysis-runs/{run_id}` (poll run status by id)
- `POST /api/v1/members/{member_id}/refresh`
- `PUT /api/v1/members/{member_id}/baseline`

Org/member maintenance (write ops not present in UI):
- `PATCH/DELETE /api/v1/organizations/{org_id}`
- `PATCH/DELETE /api/v1/organizations/{org_id}/teams/{team_id}`
- `PATCH /api/v1/organizations/{org_id}/teams/{team_id}/members/{member_id}`
- `DELETE /api/v1/organizations/{org_id}/teams/{team_id}/members/{member_id}`

## Notable UX/behavior gaps (likely “next APIs to wire”)

- Real-time run status: shell currently polls bootstrap (`GET /members/{id}` + latest run list) every 8s while analyzing (see `refetchInterval` in `ui/src/features/analysis-chamber/hooks/use-analysis-chamber-shell-data.ts:36`), but does not poll `GET /analysis-runs/{run_id}` for richer progress/error messaging.
- Evidence view: UI renders dimension/case details with evidence IDs, but there is no UI that uses `/profile/evidence` or `/evidence/{id}` for full trace browsing.

