# Frontend Integration Guide

**What the backend offers and how to consume it — M1 through M9**

> Read before implementing any frontend task. This document is the bridge between the backend and the frontend implementation.

---

## 1. What is available now (M1–M9)

The backend exposes a fully working REST API at `http://localhost:8000`. Built with **FastAPI + SQLite**, Clean Architecture. Every response is wrapped in a `{ data: T }` envelope.

### Running the backend

```bash
cd be/
uv run uvicorn app.main:app --reload --port 8000
```

On startup the server automatically:
1. **Runs pending Alembic migrations** — no manual `alembic upgrade head` needed
2. **Seeds 9 standard role profiles** (idempotent — safe to restart)
3. **Cleans up orphaned analysis runs** — any run left in `collecting` / `analyzing` from a previous crash is marked `failed`

Interactive docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 2. Base URL and response envelope

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

// Every successful response:
{ "data": <payload> }

// Every error:
{ "detail": "Human-readable error message" }
```

Set `NEXT_PUBLIC_API_URL=http://localhost:8000` in `ui/.env.local` (gitignored).

---

## 3. Available endpoints

### 3.1 Organization CRUD (M1)

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| `POST` | `/api/v1/organizations` | 201 | |
| `GET` | `/api/v1/organizations` | 200 | Flat list, no member tree |
| `GET` | `/api/v1/organizations/:orgId` | 200 | Full tree: teams + members |
| `PATCH` | `/api/v1/organizations/:orgId` | 200 | |
| `DELETE` | `/api/v1/organizations/:orgId` | 204 | Cascades to teams and members |

**Create org body:** `{ name: string }` — 1–255 chars

**`GET /api/v1/organizations/:orgId`** returns:
```typescript
{
  organization_id: string
  name: string
  created_at: string      // ISO 8601
  updated_at: string
  teams: Array<{
    team_id: string
    name: string
    members: Array<{
      member_id: string
      display_name: string
      external_id: string | null
      role_profile_id: string | null
      analysis_status: 'not_analyzed' | 'analyzing' | 'completed' | 'failed'
      last_analysis_at: string | null
    }>
  }>
}
```

> **Sidebar staleness note**: `GET /organizations/:orgId` is the source of truth for member data in the sidebar. Always re-fetch after any create/delete, and add a manual refresh button. Cached React state can become stale if the DB changes between requests.

---

### 3.2 Team CRUD (M1)

| Method | Path | Status |
|--------|------|--------|
| `POST` | `/api/v1/organizations/:orgId/teams` | 201 |
| `GET` | `/api/v1/organizations/:orgId/teams` | 200 |
| `PATCH` | `/api/v1/organizations/:orgId/teams/:teamId` | 200 |
| `DELETE` | `/api/v1/organizations/:orgId/teams/:teamId` | 204 |

Body (create or update): `{ name: string }` — 1–255 chars

---

### 3.3 Member CRUD (M1)

| Method | Path | Status |
|--------|------|--------|
| `POST` | `/api/v1/organizations/:orgId/teams/:teamId/members` | 201 |
| `GET` | `/api/v1/members/:memberId` | 200 |
| `PATCH` | `/api/v1/members/:memberId` | 200 |
| `DELETE` | `/api/v1/members/:memberId` | 204 |

**Create / update body:**
```typescript
{
  display_name: string         // required, 1–255 chars
  external_id?: string         // GitHub handle — required for analysis
  role_profile_id?: string     // UUID from /role-profiles — optional
}
```

**`GET /api/v1/members/:memberId`** returns:
```typescript
{
  member_id: string
  team_id: string
  organization_id: string
  display_name: string
  external_id: string | null
  role_profile_id: string | null
  analysis_status: 'not_analyzed' | 'analyzing' | 'completed' | 'failed'
  last_analysis_at: string | null
  created_at: string
  updated_at: string
}
```

> **`external_id` is the GitHub handle.** Without it, the GitHub collection phase is silently skipped and the analysis will have no signal data.

---

### 3.4 Role Profiles (M1, read-only, pre-seeded)

| Method | Path | Status |
|--------|------|--------|
| `GET` | `/api/v1/role-profiles` | 200 |
| `GET` | `/api/v1/role-profiles/:roleProfileId` | 200 |

9 standard roles available:
```
Junior Backend Engineer    Mid Backend Engineer    Senior Backend Engineer
Junior Frontend Engineer   Mid Frontend Engineer   Senior Frontend Engineer
Senior Fullstack Engineer  Tech Lead               DevOps Engineer
```

Use for the **role dropdown** in the Add Member form.

---

### 3.5 Analysis Runs (M2)

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| `POST` | `/api/v1/analysis-runs` | 202 | Triggers background pipeline |
| `GET` | `/api/v1/analysis-runs/:runId` | 200 | Poll for status |
| `GET` | `/api/v1/members/:memberId/analysis-runs` | 200 | Run history, paginated |
| `POST` | `/api/v1/members/:memberId/refresh` | 202 | Re-run for same period |

**Trigger analysis body:**
```typescript
{
  member_id: string
  period_start: string   // YYYY-MM-DD
  period_end: string     // YYYY-MM-DD
  run_type?: string      // "fresh" (default) | "refresh_same_period"
}
```

**`AnalysisRun` response shape:**
```typescript
{
  analysis_run_id: string
  member_id: string
  period_start: string
  period_end: string
  run_type: string
  status: 'pending' | 'collecting' | 'analyzing' | 'completed' | 'failed'
  progress_stage: string | null   // e.g. "extracting_evidence", "scoring"
  progress_pct: number            // 0–100 integer
  error_message: string | null
  scoring_version: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
}
```

**Status polling pattern:**
```typescript
// Poll every 3s while status is non-terminal
const TERMINAL = new Set(['completed', 'failed'])

async function pollRun(runId: string, onUpdate: (run: AnalysisRun) => void) {
  while (true) {
    const run = await getAnalysisRun(runId)
    onUpdate(run)
    if (TERMINAL.has(run.status)) break
    await new Promise(r => setTimeout(r, 3000))
  }
}
```

**Progress stages in order:**
| `progress_stage` | `progress_pct` | Meaning |
|-----------------|---------------|---------|
| `collecting_data` | 5–30% | Fetching GitHub + MCP data in parallel |
| `extracting_evidence` | 35–50% | P1: evidence extraction |
| (P2 running) | 50–55% | Behavioral event classification |
| `inferring_dimensions` | 60–75% | P3: dimension scoring |
| `scoring` | 75–80% | Scoring engine |
| `generating_kpt` | 80–92% | P4-P7: KPT, cases, journey, overview |
| `self_checking` | 92–99% | P8: self-critique gate |
| `null` (completed) | 100% | Done |

**Validation errors (409):** Only one active run per member is allowed. If a run is `collecting` or `analyzing`, a new trigger returns `409 Conflict`.

**Timeout:** Runs have a max duration (default 3600s). If the pipeline hangs, the run is marked `failed` with a timeout message.

---

### 3.6 Profile Tabs (M7)

All profile endpoints return 404 if no `completed` analysis run exists for the member.

#### Overview tab
```
GET /api/v1/members/:memberId/profile/overview
```
```typescript
{
  run_id: string
  member_id: string
  period_start: string
  period_end: string
  scoring_version: string | null
  p8_approved: boolean
  overall_confidence: number | null
  profile_summary: string | null
  growth_journey_summary: string | null
  current_growth_path: string | null
  top_strength_dimension_ids: string[]
  top_growth_dimension_ids: string[]
  insufficient_dimensions: string[]
  fairness_notes: string[]
  category_scores: CategoryScore[]
}
```

#### Competency list
```
GET /api/v1/members/:memberId/profile/competency
     ?category=<id>    // optional filter by category
     ?maturity=<label> // optional filter by maturity level
```
```typescript
{
  run_id: string
  dimension_scores: DimensionScore[]
  category_scores: CategoryScore[]
}
```

#### Dimension detail (with evidence)
```
GET /api/v1/members/:memberId/profile/competency/:dimensionId
```
```typescript
{
  dimension_score: DimensionScoreDetail  // includes p3_inference
  supporting_evidence: EvidenceUnit[]
  counter_evidence: EvidenceUnit[]
  behavioral_events: BehavioralEvent[]
}
```

#### KPT tab
```
GET /api/v1/members/:memberId/profile/kpt
```
```typescript
{
  run_id: string
  keep_items: KptItem[]
  problem_items: KptItem[]
  try_items: KptItem[]
}
```

#### Cases tab
```
GET /api/v1/members/:memberId/profile/cases
GET /api/v1/members/:memberId/profile/cases/:caseId  // single case detail
```
```typescript
// List response
{ run_id: string; cases: CaseFeedback[] }

// CaseFeedback shape
{
  case_id: string
  analysis_run_id: string
  title: string
  category: string | null
  impact_level: string | null
  summary: string | null
  why_it_matters: string | null
  observed_pattern: string | null
  better_alternative: string | null
  next_time_guidance: string | null
  linked_dimension_ids: string[]
  supporting_event_ids: string[]
  confidence_score: number | null
  display_order: number
}
```

#### Journey tab
```
GET /api/v1/members/:memberId/profile/journey
```
```typescript
{
  run_id: string
  growth_journey_summary: string | null
  current_growth_path: string | null
  milestones: Milestone[]
}
```

#### Evidence list
```
GET /api/v1/members/:memberId/profile/evidence
     ?search=<keyword>              // full-text search over content_excerpt
     ?source=github,mcp             // comma-separated source_type filter
     ?record_type=pr_authored,commit // comma-separated record_type filter
     ?limit=50&offset=0             // pagination
```
```typescript
{
  run_id: string
  items: EvidenceUnit[]
  total: number
  limit: number
  offset: number
}
```

#### Evidence detail
```
GET /api/v1/evidence/:evidenceId
```
Used for deep-linking to a single evidence unit from the dimension detail view.

#### Member milestones (standalone)
```
GET /api/v1/members/:memberId/milestones
```
Returns all milestones for a member across all runs.

---

### 3.7 Shared sub-types (M7)

```typescript
interface CategoryScore {
  category_score_id: string
  category_id: string
  score: number | null
  confidence_score: number
  confidence_label: string
  included_dimensions: string[]
  excluded_dimensions: string[]
  explanation_summary: string | null
}

interface DimensionScore {
  score_id: string
  dimension_id: string
  raw_score: number | null
  normalized_score: number | null     // 0–5 scale
  maturity_level: string              // e.g. "developing", "proficient"
  confidence_score: number
  confidence_label: string
  opportunity_score: number
  opportunity_label: string
  delta_value: number | null          // change since last run
  delta_label: string
  total_signals: number
  positive_signals: number
  negative_signals: number
  mixed_signals: number
  explanation_summary: string | null
  limitation_notes: string[]
  top_supporting_evidence_ids: string[]
  top_counter_evidence_ids: string[]
  ui_summary: string | null
}

interface EvidenceUnit {
  evidence_id: string
  analysis_run_id: string
  member_id: string
  timestamp: string
  source_type: string | null          // "github" | "mcp"
  record_type: string | null          // "pr_authored" | "pr_reviewed" | "commit" | ...
  record_id: string | null
  content_excerpt: string
  content_summary: string
  extraction_confidence: number | null
  ambiguity_notes: string[]
  created_at: string
}

interface BehavioralEvent {
  event_id: string
  timestamp: string
  event_type: string
  event_summary: string | null
  polarity: string                    // "positive" | "negative" | "mixed"
  severity: number | null
  event_confidence: number | null
  impact_level: string | null
  opportunity_level: string | null
  related_dimensions: Record<string, unknown>[]
  why_it_matters: string | null
}

interface KptItem {
  kpt_id: string
  item_type: string                   // "keep" | "problem" | "try"
  title: string
  summary: string | null
  linked_dimension_ids: string[]
  linked_problem_ids: string[]
  display_order: number
}

interface Milestone {
  milestone_id: string
  member_id: string
  source_analysis_run_id: string | null
  timestamp: string
  milestone_type: string
  title: string
  summary: string | null
  impact_score: number | null
  supporting_event_ids: string[]
  created_at: string
}
```

---

### 3.8 Validation Flags (M8)

Managers / reviewers can flag dimension scores as accurate, questionable, or incorrect.

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| `POST` | `/api/v1/validation-flags` | 201 | Upsert (one flag per run+dimension) |
| `GET` | `/api/v1/analysis-runs/:runId/validation-flags` | 200 | All flags for a run |

**Upsert body:**
```typescript
{
  analysis_run_id: string
  dimension_id: string
  verdict: 'accurate' | 'questionable' | 'incorrect'
  note?: string
}
```

**`ValidationFlag` response:**
```typescript
{
  flag_id: string
  analysis_run_id: string
  dimension_id: string
  verdict: string
  note: string | null
  flagged_at: string
}
```

---

## 4. Analysis pipeline flow

The full lifecycle of triggering an analysis and rendering the results:

```
1. POST /analysis-runs              → 202, returns run with status="pending"
2. Poll GET /analysis-runs/:id      → status transitions:
     pending → collecting → analyzing → completed | failed
3. On status="completed":
     GET /members/:id/profile/overview    → render Overview tab
     GET /members/:id/profile/competency  → render Competency tab
     GET /members/:id/profile/kpt         → render KPT tab
     GET /members/:id/profile/cases       → render Cases tab
     GET /members/:id/profile/journey     → render Journey tab
4. User clicks dimension row:
     GET /members/:id/profile/competency/:dimId  → evidence + events panel
5. User flags a dimension:
     POST /validation-flags
     GET /analysis-runs/:runId/validation-flags  → refresh flag badges
```

**Display `progress_pct` as a progress bar during steps 1–2.** The value goes from 0 to 100 and is updated every time the pipeline commits a stage. Polling every 3 seconds is appropriate.

---

## 5. Error handling

| HTTP code | When | Show |
|-----------|------|------|
| `202` | Analysis triggered | "Analysis started" toast, begin polling |
| `404` | Resource not found; also: no completed run for profile tabs | Empty state / "Analysis not run yet" |
| `409` | Member already has an active run | "Analysis already in progress" toast |
| `422` | Validation error (bad date range, unknown enum) | Field-level or toast message |
| `500` | Unexpected server error | Generic error banner with retry |

> **P5/P6/P7 silent failure:** A run can complete with `status="completed"` while KPT, Cases, or Overview tabs return empty data. This happens when the LLM subprocess fails for those stages — the pipeline is non-blocking by design and the run still succeeds. Show an empty state with a "Refresh analysis" option rather than an error. Check backend logs for `"PX failed for run"` warnings if this occurs.

```typescript
async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { detail?: string }).detail ?? `HTTP ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return ((await res.json()) as { data: T }).data
}
```

---

## 6. CORS

Backend allows `http://localhost:3000` and `http://127.0.0.1:3000`. No credentials or custom headers needed beyond `Content-Type: application/json`.

---

## 7. Typed API clients

Two typed clients are already written:

```
ui/src/lib/api/org.ts       ← M1: orgs, teams, members, role-profiles
ui/src/lib/api/analysis.ts  ← M2–M9: analysis runs, all profile tabs, validation flags
```

**Do not write raw `fetch` calls with `any` types.** Import from the clients:

```typescript
// Org / member management
import { listOrgs, getOrg, createOrg, createTeam, createMember } from '@/lib/api/org'
import type { OrgDetail, MemberResponse, RoleProfile } from '@/lib/api/org'

// Analysis pipeline
import {
  triggerAnalysis, getAnalysisRun, listMemberRuns, refreshAnalysis,
  getProfileOverview, getProfileCompetency, getDimensionDetail,
  getProfileKpt, getProfileCases, getCaseDetail, getProfileJourney,
  getEvidence, upsertValidationFlag, listRunFlags,
} from '@/lib/api/analysis'
import type { AnalysisRun, ProfileOverview, DimensionDetail } from '@/lib/api/analysis'
```

A working **reference implementation** covering all M1–M9 endpoints is in:
```
ui/src/app/page.tsx
ui/src/app/_components/Sidebar.tsx
ui/src/app/_components/MemberPanel.tsx
```

---

## 8. Sidebar staleness and refresh

The sidebar stores expanded org details in React state. This data can go stale if:
- The backend was restarted with a fresh DB
- A member was deleted from another tab

**The sidebar header has a refresh button (↺)** that re-fetches all expanded orgs. If you see "Member not found" errors in the analysis panel, click it. Alternatively, collapse and re-expand the org row.

In code: after every CRUD mutation call `getOrg(orgId)` to update `expanded[orgId]`:
```typescript
const detail = await getOrg(orgId)
setExpanded(prev => ({ ...prev, [orgId]: detail }))
```

---

## 9. Type generation (keep in sync)

Once all profile endpoints are stable, regenerate TypeScript types from the live OpenAPI schema:

```bash
pnpm add -D openapi-typescript
npx openapi-typescript http://localhost:8000/openapi.json -o src/types/api.ts
```

Until then, the hand-written types in `src/lib/api/*.ts` are the source of truth.

---

## 10. What is NOT available

Everything from M1 through M9 is implemented. The following are out of scope for the current MVP:

| Feature | Notes |
|---------|-------|
| WebSocket / SSE for push updates | Poll `GET /analysis-runs/:id` instead |
| Bulk analysis for multiple members | Trigger one run per member |
| Scenario / project planning endpoints | Future milestone |
| Authentication / multi-tenant | All endpoints are unguarded in dev |
| Pagination for profile tabs | Not implemented; returns all items |

---

## 11. Running the full stack locally

```bash
# Terminal 1 — Backend
cd be/
uv run uvicorn app.main:app --reload --port 8000

# Terminal 2 — Frontend
cd ui/
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).
Backend interactive docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 12. Key documents

| Document | Why |
|----------|-----|
| `docs/guides/backend-guide.md` | Architecture, layer rules, pipeline patterns |
| `docs/guides/frontend-guide.md` | Stack, design tokens, component patterns, quality gates |
| `docs/design/human-analysis-MVP-specs/frontend-spec.md` | Full UI spec: all 6 profile tabs, states, interactions |
| `docs/design/human-analysis-MVP-specs/backend-spec.md` | Authoritative request/response shapes until OpenAPI gen |
| `docs/design/human-analysis-MVP-specs/database-spec.md` | DB schema reference — all tables and constraints |
| `docs/design/human-analysis-MVP-specs/prompt-pipeline-spec.md` | P1–P8 pipeline: output schemas, fallbacks, retry rules |
