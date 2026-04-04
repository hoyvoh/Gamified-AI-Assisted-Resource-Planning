# Frontend Integration Guide

**What the backend is offering right now and how to consume it**

> Read before implementing any M1-FE task. This document is the bridge between the backend team's work and the frontend implementation.

---

## 1. What is available right now (M1)

The backend exposes a fully working REST API at `http://localhost:8000`. It is built with **FastAPI + SQLite** and follows Clean Architecture. Every response is wrapped in a `{ data: T }` envelope.

### Running the backend

```bash
cd be/
uv run alembic upgrade head      # apply DB migrations (run once)
uv run uvicorn app.main:app --reload --port 8000
```

On startup the server **automatically seeds 9 standard role profiles** (idempotent — safe to restart).

Interactive docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 2. Base URL and response envelope

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

// Every successful response looks like:
{ "data": <payload> }

// Every error looks like:
{ "detail": "Human-readable error message" }
```

Set `NEXT_PUBLIC_API_URL=http://localhost:8000` in `ui/.env.local` (gitignored).

---

## 3. Available endpoints

### 3.1 Organization CRUD

| Method | Path | Status | Response |
|--------|------|--------|----------|
| `POST` | `/api/v1/organizations` | 201 | `OrgResponse` |
| `GET` | `/api/v1/organizations` | 200 | `OrgListItem[]` |
| `GET` | `/api/v1/organizations/:orgId` | 200 | `OrgDetail` (with full team/member tree) |
| `PATCH` | `/api/v1/organizations/:orgId` | 200 | `OrgResponse` |
| `DELETE` | `/api/v1/organizations/:orgId` | 204 | — |

**Create org:**
```typescript
// POST /api/v1/organizations
body: { name: string }  // 1–255 chars, required
```

**Get org with tree** (`GET /api/v1/organizations/:orgId`) returns:
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

**List orgs** (`GET /api/v1/organizations`) returns a flat list — no nested tree:
```typescript
{
  organization_id: string
  name: string
  team_count: number
  member_count: number
  created_at: string
}[]
```

---

### 3.2 Team CRUD

| Method | Path | Status |
|--------|------|--------|
| `POST` | `/api/v1/organizations/:orgId/teams` | 201 |
| `PATCH` | `/api/v1/organizations/:orgId/teams/:teamId` | 200 |
| `DELETE` | `/api/v1/organizations/:orgId/teams/:teamId` | 204 |

```typescript
// POST or PATCH body:
{ name: string }  // 1–255 chars
```

---

### 3.3 Member CRUD

| Method | Path | Status |
|--------|------|--------|
| `POST` | `/api/v1/organizations/:orgId/teams/:teamId/members` | 201 |
| `GET` | `/api/v1/members/:memberId` | 200 |
| `PATCH` | `/api/v1/organizations/:orgId/teams/:teamId/members/:memberId` | 200 |
| `DELETE` | `/api/v1/organizations/:orgId/teams/:teamId/members/:memberId` | 204 |

**Create member body:**
```typescript
{
  display_name: string         // required, 1–255 chars
  external_id?: string         // GitHub handle, Slack ID, etc. — optional
  role_profile_id?: string     // UUID from role-profiles endpoint — optional
}
```

**`GET /api/v1/members/:memberId`** returns:
```typescript
{
  member_id: string
  team_id: string
  organization_id: string      // denormalized for convenience
  display_name: string
  external_id: string | null
  role_profile_id: string | null
  analysis_status: 'not_analyzed' | 'analyzing' | 'completed' | 'failed'
  last_analysis_at: string | null
  created_at: string
  updated_at: string
}
```

> **M1 note:** `analysis_status` is always `"not_analyzed"` and `last_analysis_at` is always `null` until M2 (analysis run infrastructure) is complete.

---

### 3.4 Role Profiles (read-only, pre-seeded)

| Method | Path | Status |
|--------|------|--------|
| `GET` | `/api/v1/role-profiles` | 200 |
| `GET` | `/api/v1/role-profiles/:roleProfileId` | 200 |

Returns the 9 standard roles:
```
Junior Backend Engineer    Mid Backend Engineer    Senior Backend Engineer
Junior Frontend Engineer   Mid Frontend Engineer   Senior Frontend Engineer
Senior Fullstack Engineer  Tech Lead               DevOps Engineer
```

Use this for the **role dropdown** in the Add Member form.

---

## 4. Error handling

| HTTP code | When it happens | What to show the user |
|-----------|-----------------|----------------------|
| `404` | Resource not found | "Not found" message, possibly redirect |
| `409` | Conflict (e.g. duplicate active analysis run — M2) | Conflict toast |
| `422` | Validation error (empty name, range exceeded, bad enum) | Field-level error or toast |
| `500` | Unexpected server error | Generic error banner with retry |

The error body is always `{ detail: string }`. Extract and display it.

```typescript
async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { ...init })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { detail?: string }).detail ?? `HTTP ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return ((await res.json()) as { data: T }).data
}
```

---

## 5. CORS

The backend allows origins `http://localhost:3000` and `http://127.0.0.1:3000`. No credentials or custom headers needed beyond `Content-Type: application/json`.

---

## 6. Typed API client

A typed client matching the M1 surface is already written at:

```
ui/src/lib/api/org.ts
```

Import from it directly — **do not write raw `fetch` calls with `any` types**:

```typescript
import { listOrgs, createOrg, createTeam, createMember, listRoleProfiles } from '@/lib/api/org'
import type { OrgDetail, MemberResponse, RoleProfile } from '@/lib/api/org'
```

When the backend adds new endpoints (M2+), extend `org.ts` or create a new file per domain (`analysis.ts`, `profile.ts`, etc.).

---

## 7. Type generation (keep in sync)

Once M7 is complete (all profile endpoints stable), regenerate TypeScript types from the live OpenAPI schema:

```bash
# Install once
pnpm add -D openapi-typescript

# Regenerate (backend must be running)
npx openapi-typescript http://localhost:8000/openapi.json -o src/types/api.ts
```

Until then, the hand-written types in `src/lib/api/org.ts` are the source of truth — keep them in sync with `docs/design/human-analysis-MVP-specs/backend-spec.md`.

---

## 8. What is NOT available yet (do not build)

| Feature | Available in |
|---------|-------------|
| Analysis run trigger / status polling | M2 |
| Profile overview / radar chart data | M7 |
| Competency tab / dimension scores | M7 |
| KPT tab | M7 |
| Case feedback tab | M7 |
| Journey / milestone tab | M7 |
| Validation flags | M8 |
| Evidence trace | M7 |

For screens that depend on these, show the loading skeleton or "Analysis not started" empty state as defined in `docs/design/human-analysis-MVP-specs/frontend-spec.md`.

---

## 9. Key documents to read before implementing

| Document | Why |
|----------|-----|
| `docs/guides/frontend-guide.md` | Stack, design tokens, component patterns, acceptance criteria, quality gates |
| `docs/design/human-analysis-MVP-specs/frontend-spec.md` | Full UI spec: sidebar tree, member workspace, all 5 profile tabs, modals, loading/empty/error states |
| `docs/design/human-analysis-MVP-specs/backend-spec.md` | All endpoint request/response shapes — authoritative source until OpenAPI types are generated |
| `docs/design/human-analysis-MVP-specs/entity-data-model.md` | What each entity means, its lifecycle, and relationships |
| `docs/planning/task-checklist.md` | Which FE tasks are unblocked right now (M1-FE can start) |
| `docs/planning/task-dependency-diagram.md` | Which FE tasks require which BE tasks to be done first |
| `docs/planning/acceptance-criteria.md` | Per-milestone checklist — verify these before marking a task done |

---

## 10. M1 FE tasks you can implement now

The following FE tasks are unblocked because their backend endpoints are live:

| Task | Depends on | Endpoint |
|------|-----------|----------|
| F1.1 — App shell layout | Nothing | — |
| F1.2 — Sidebar org tree | B1.7 ✅ | `GET /organizations` + `GET /organizations/:id` |
| F1.3 — Create Org context | B1.6 ✅ | `POST /organizations` |
| F1.4 — Create Team context | B1.9 ✅ | `POST /organizations/:id/teams` |
| F1.5 — Member status icon | B1.11 ✅ | `GET /members/:id` → `analysis_status` |
| F1.6 — Create Org modal | B1.6 ✅ | `POST /organizations` |
| F1.7 — Create Team modal | B1.9 ✅ | `POST .../teams` |
| F1.8 — Add Member modal | B1.10 ✅ | `POST .../members` + `GET /role-profiles` for dropdown |
| F1.9 — Dashboard empty state | Nothing | — |
| F1.10 — Click member → stub workspace | B1.11 ✅ | `GET /members/:id` |

**A working reference implementation** of all M1-FE tasks is in:
```
ui/src/app/page.tsx
ui/src/app/_components/Sidebar.tsx
ui/src/app/_components/MemberPanel.tsx
ui/src/lib/api/org.ts
```

Use it as a reference, not as the final implementation. The final M1-FE implementation should follow the full spec in `frontend-spec.md`.

---

## 11. Running the full stack locally

```bash
# Terminal 1 — Backend
cd be/
uv run alembic upgrade head
uv run uvicorn app.main:app --reload --port 8000

# Terminal 2 — Frontend
cd ui/
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Backend docs: [http://localhost:8000/docs](http://localhost:8000/docs)
