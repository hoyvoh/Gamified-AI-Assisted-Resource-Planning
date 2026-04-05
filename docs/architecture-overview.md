# Architecture Overview

**Gamified Resource Planning** — A holographic war room for strategic resource allocation. The commander stands at a glowing tactical table, moving personnel units across a 3D battlefield of projects and tasks. Powered by COCOMO II, Genetic Algorithm, and LLM to support real-time decision-making.

The system is built in two integrated pillars:
- **Pillar 1 — Resource Allocation War Room:** Strategic board, scenario planning, warnings engine, optimization
- **Pillar 2 — Human Analysis MVP:** Evidence-based developer growth and performance insight platform

---

## Repository Layout

```
gamified_resource_planning/
├── ui/          # Next.js 15 frontend (App Router + Three.js holographic board)
├── be/          # Python FastAPI backend (Clean Architecture)
├── docs/        # Documentation ← you are here
│   ├── architecture-overview.md    ← this file
│   ├── business-spec.md            ← what the system does (full product)
│   ├── guides/                     ← how to work with the codebase
│   │   ├── backend-guide.md
│   │   └── frontend-guide.md
│   ├── design/                     ← technical design documents
│   │   └── human-analysis-MVP-specs/  ← Pillar 2 specs
│   └── planning/                   ← task checklist, acceptance criteria, dependencies
├── .github/
│   ├── workflows/ci.yml
│   └── pull_request_template.md
├── .gitignore
└── package.json
```

---

## System Architecture

```
Browser
  │
  ▼
Next.js (ui/)                    Port 3000 (dev)
  │  App Router: Server + Client Components
  │  Three.js: Holographic war room — 3D tactical board
  │  Tailwind CSS v4 · TypeScript strict
  │
  │  HTTP/REST + WebSocket (progress updates)
  ▼
FastAPI (be/)                    Port 8000 (dev)
  │  Clean Architecture: Presentation → Application → Infrastructure → Domain
  │  Pydantic v2 · Python 3.12 · SQLAlchemy 2.x · SQLite
  │
  ├─── Claude API (Anthropic)    — task analysis, risk analysis, developer profiling
  ├─── Genetic Algorithm         — resource optimization
  ├─── COCOMO II engine          — effort estimation
  ├─── Scoring Engine            — developer dimension scoring (Pillar 2)
  │
  ▼
SQLite (be/dev.db)               Local file — no server required
```

---

## Clean Architecture (Backend)

```
┌─────────────────────────────────────────────────────┐
│  Presentation Layer   (interfaces/)                  │  ← FastAPI routers, Pydantic schemas
├─────────────────────────────────────────────────────┤
│  Application Layer    (application/)                 │  ← Use cases, business workflows
├─────────────────────────────────────────────────────┤
│  Infrastructure Layer (infrastructure/)              │  ← SQLite, Alembic, LLM clients
├─────────────────────────────────────────────────────┤
│  Domain Layer         (domain/)                      │  ← Entities, business logic, interfaces
└─────────────────────────────────────────────────────┘
```

Inner layers never import from outer layers. Bounded contexts are used to group related logic (e.g., `estimation/`, `personnel/`, `scenario/`, `profiling/`).

---

## Tech Stack Decisions

| Concern | Choice | Reason |
|---------|--------|--------|
| UI Framework | Next.js 15 App Router | SSR/SSG, React 19, file-based routing |
| 3D Visualization | Three.js | Holographic war room board, personnel units, tactical camps |
| Styling | Tailwind CSS v4 | Design tokens via `@theme`, zero runtime |
| API | FastAPI + Pydantic v2 | OpenAPI auto-docs, async, type-safe |
| Package manager (FE) | pnpm 10 | Fast, strict, monorepo-friendly |
| Package manager (BE) | uv | Rust-based, fastest Python installer |
| Formatter/Linter (BE) | Ruff | Replaces black + isort + flake8 |
| Type checking (BE) | Mypy strict | Catches runtime bugs at dev time |
| Testing (FE) | Vitest + Testing Library | Vite-native, fast |
| Testing (BE) | Pytest + httpx | Async-native, ASGI transport |
| ORM | SQLAlchemy 2.x | Async sessions, type-safe queries |
| Migrations | Alembic | Version-controlled schema changes |
| Database | SQLite | Zero-dependency local dev; migrate to PostgreSQL later by changing `DATABASE_URL` |
| Commit convention | Conventional Commits | Enforced via commitlint |
| Estimation | COCOMO II | Industry-standard software effort model |
| Optimization | Genetic Algorithm | Multi-constraint, NP-hard scheduling |
| AI | Claude (Anthropic) | Task generation, risk analysis, developer profiling pipeline |

---

## Core Data Flow

```
User action (drag personnel unit onto camp)
  → Next.js client component (board / panel)
  → fetch / Server Action
  → FastAPI endpoint (Presentation Layer)
  → Pydantic validation
  → Application Layer (use case — AssignmentUseCase)
  → Domain Layer (business logic — WFU calculation, capacity check)
  → Infrastructure Layer (SQLite via SQLAlchemy)
  → Pydantic response
  → JSON → Next.js renders updated holographic board
  → Warning Engine recomputes → WebSocket push (if warnings changed)
```

---

## Pillar 2 — Analysis Pipeline Data Flow

```
User triggers analysis for a member
  → FastAPI endpoint
  → RunAnalysisUseCase (Application Layer)
  → LLM prompt pipeline (P1→P2→P3→P4→P5→P6→P7→P8) via Infrastructure
  → Scoring Engine (Domain Layer)
  → AnalysisSnapshot persisted to SQLite
  → WebSocket / polling status update to UI
  → Frontend renders 5-tab member profile
```

---

## Domain Model

### Pillar 1 — Resource Planning

```
Organization
  └── Projects
        ├── ProjectMembers → Personnel
        └── Scenarios
              └── Tasks
                    ├── ResourceAssignments → Personnel (wfu_mode)
                    ├── TaskDependencies
                    └── ProgressLogs

Organization
  └── Personnel
        ├── SkillMatrix (skill → level → wfu_multipliers)
        ├── Languages
        └── XPHistory
```

### Pillar 2 — Human Analysis

```
Organization
  └── Teams
        └── Members
              ├── RoleProfile
              ├── PersonalBaseline
              └── AnalysisRuns
                    ├── EvidenceUnits
                    ├── BehavioralEvents
                    ├── DimensionScores
                    ├── CategoryScores
                    ├── KPTItems
                    ├── CaseFeedbacks
                    └── AnalysisSnapshot

Members (long-term)
  └── Milestones (up to 5 years, cross-run)
```

---

## Environment Variables

| Var | Location | Purpose |
|-----|----------|---------|
| `DATABASE_URL` | `be/.env` | SQLite path (default: `sqlite+aiosqlite:///./dev.db`) |
| `SECRET_KEY` | `be/.env` | JWT signing key |
| `ANTHROPIC_API_KEY` | `be/.env` | Claude LLM access |
| `NEXT_PUBLIC_API_URL` | `ui/.env.local` | Backend base URL (default: `http://localhost:8000`) |

**Never commit `.env` files.** Use `.env.example` as template.

---

## API Contract

FastAPI auto-generates OpenAPI docs:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- JSON schema: `http://localhost:8000/openapi.json`

**Principle:** Never hand-write frontend types — always generate from OpenAPI:
```bash
npx openapi-typescript http://localhost:8000/openapi.json -o ui/src/types/api.ts
```

---

## Documentation Map

| Need | Document |
|------|----------|
| Full product features and business rules | [business-spec.md](business-spec.md) |
| Pillar 2 MVP specs (human analysis) | [design/human-analysis-MVP-specs/](design/human-analysis-MVP-specs/) |
| BE code patterns and architecture rules | [guides/backend-guide.md](guides/backend-guide.md) |
| FE code patterns | [guides/frontend-guide.md](guides/frontend-guide.md) |
| Development task checklist | [planning/task-checklist.md](planning/task-checklist.md) |
| Acceptance criteria per task | [planning/acceptance-criteria.md](planning/acceptance-criteria.md) |
| Task dependency diagram | [planning/task-dependency-diagram.md](planning/task-dependency-diagram.md) |
