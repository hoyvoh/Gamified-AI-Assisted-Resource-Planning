# Architecture Overview

**Gamified Resource Planning** — Nền tảng AI-assisted resource planning chuyên nghiệp dạng card-game hiện đại. Kết hợp hai pillar độc lập (Project Analysis + Resource Analysis) rồi hội tụ vào board lập kế hoạch phân bổ nhân sự dạng kéo thả. COCOMO II, Genetic Algorithm, và LLM hỗ trợ ra quyết định real-time.

---

## Repository Layout

```
gamified_resource_planning/
├── ui/          # Next.js 15 frontend (App Router + Three.js)
├── be/          # Python FastAPI backend (Clean Architecture)
├── docs/        # Documentation ← bạn đang ở đây
│   ├── architecture-overview.md  ← this file
│   ├── business-spec.md          ← what the system does (business view)
│   ├── guides/                   ← how to work with the codebase
│   ├── design/                   ← technical design documents
│   └── planning/                 ← phases, tickets, milestones
├── .github/
│   ├── workflows/ci.yml
│   └── pull_request_template.md
├── .gitignore
├── .lintstagedrc.cjs
└── package.json   # root: simple-git-hooks + commitlint
```

---

## System Architecture

```
Browser
  │
  ▼
Next.js (ui/)            Port 3000 (dev)
  │  App Router: Server Components + Client Components
  │  Card-game UI: React DnD kanban board, SVG radar charts
  │  Tailwind CSS v4 · TypeScript strict
  │
  │ HTTP/REST + WebSocket (progress updates)
  ▼
FastAPI (be/)            Port 8000 (dev)
  │  Routers → Services → Repositories (Clean Architecture)
  │  Pydantic v2 · Python 3.12 · SQLAlchemy 2.x
  │
  ├─── Pillar 1: Project Analysis Engine
  │      LLM (Claude API) — 10-axis scoring, risk register, task gen
  │      COCOMO II engine — effort estimation
  │
  ├─── Pillar 2: Resource Analysis Engine
  │      GitHub API / GitHub CLI — commit history, PR data, code metrics
  │      Slack API              — communication patterns, collaboration
  │      LLM (Claude API)       — 5-layer developer profile inference
  │
  ├─── Pillar 3: Allocation Engine
  │      Genetic Algorithm      — multi-constraint optimization
  │      CPM / EV engine        — critical path + earned value
  │
  ▼
PostgreSQL               Port 5432 (dev)
```

---

## Tech Stack Decisions

| Concern | Choice | Reason |
|---------|--------|--------|
| UI Framework | Next.js 15 App Router | SSR/SSG, React 19, file-based routing |
| Board UI | React DnD + SVG | Card-game kanban board, drag-and-drop assignments |
| Charts | Recharts / custom SVG | Radar chart (10-axis), Gantt, dependency DAG |
| Styling | Tailwind CSS v4 | Design tokens via `@theme`, zero runtime |
| API | FastAPI + Pydantic v2 | OpenAPI auto-docs, async, type-safe |
| Package manager (FE) | pnpm 10 | Fast, strict, monorepo-friendly |
| Package manager (BE) | uv | Rust-based, fastest Python installer |
| Formatter (FE) | Oxfmt | Single-pass formatter |
| Linter (FE) | Oxlint → ESLint | Oxlint (fast) first, ESLint for advanced rules |
| Formatter/Linter (BE) | Ruff | Replaces black + isort + flake8 |
| Type checking (BE) | Mypy strict | Catches runtime bugs at dev time |
| Testing (FE) | Vitest + Testing Library | Vite-native, fast |
| Testing (BE) | Pytest + httpx | Async-native, ASGI transport |
| ORM | SQLAlchemy 2.x | Async sessions, type-safe queries |
| Migrations | Alembic | Version-controlled schema changes |
| Git hooks | simple-git-hooks + lint-staged | Lightweight, no Husky overhead |
| Commit convention | Conventional Commits | Enforced via commitlint |
| Estimation | COCOMO II | Industry-standard software effort model |
| Optimization | Genetic Algorithm | Multi-constraint, NP-hard scheduling problem |
| AI (backend) | Claude API (Anthropic) | Task gen, project scoring, developer profile inference, risk analysis |
| Data pipeline | GitHub API + GitHub CLI | Commit/PR/code metrics for developer profiling |
| Data pipeline | Slack API | Communication/collaboration signals for developer profiling |

---

## Core Data Flow

```
User action
  → Next.js client component (board/panel)
  → fetch / Server Action
  → FastAPI endpoint (router)
  → Pydantic validation
  → Service layer (business logic: COCOMO, Warning Engine)
  → Repository layer (SQLAlchemy → PostgreSQL)
  → Pydantic response
  → JSON → Next.js renders updated UI
  → Warning Engine recomputes → WebSocket push (if warnings changed)
```

---

## Domain Model

```
Organization
  └── has many Projects
        ├── has ProjectAnalysis (Pillar 1: 10-axis scores, verdict, risk register)
        ├── has many DeveloperProfiles (Pillar 2: 5-layer profiles, cached per org)
        └── has many Scenarios (planning alternatives)
              └── has many Tasks (kanban cards on the board)
                    ├── has many ResourceAssignments → Personnel
                    ├── has many TaskDependencies
                    └── has many ProgressLogs

Organization
  └── has many Personnel
        ├── has SkillMatrix (skill → level → WFU multiplier)
        ├── has DeveloperProfile (Pillar 2: inferred from GitHub + Slack data)
        └── participates in Projects via ProjectMembership (allocation %)
```

### Two-Pillar Architecture (pre-planning)

```
┌──────────────────────────────────┐    ┌──────────────────────────────────┐
│    PILLAR 1: Project Analysis    │    │   PILLAR 2: Resource Analysis    │
│                                  │    │                                  │
│  PM/TL input project brief       │    │  GitHub API + Slack API          │
│      ↓                           │    │      ↓                           │
│  [10-axis LLM scoring engine]    │    │  [Data pipeline + feature ext.]  │
│      ↓                           │    │      ↓                           │
│  Radar + Verdict + Risk Register │    │  [5-layer profile engine (LLM)]  │
│      ↓                           │    │      ↓                           │
│  Project Requirements Vector     │    │  Developer Profiles (BOD-only)   │
│  (skills needed, risk, timeline) │    │      ↓                           │
└────────────────┬─────────────────┘    │  Match Engine                    │
                 │                      │      ↓                           │
                 │                      │  Team Recommendations            │
                 └──────────┬───────────┘
                            ↓
              [Mode 3: Resource Planning Board]
              Card-based kanban, drag-and-drop assignments,
              WFU effective, warnings, Gantt, GA optimization
```

---

## Environment Variables

| Var | Location | Purpose |
|-----|----------|---------|
| `DATABASE_URL` | `be/.env` | PostgreSQL connection string |
| `SECRET_KEY` | `be/.env` | JWT signing key |
| `ANTHROPIC_API_KEY` | `be/.env` | Backend → Claude API (Pillar 1 scoring, Pillar 2 profile inference, task gen) |
| `GITHUB_TOKEN` | `be/.env` | GitHub API access for developer data pipeline (Pillar 2) |
| `SLACK_BOT_TOKEN` | `be/.env` | Slack API access for communication data pipeline (Pillar 2) |
| `NEXT_PUBLIC_API_URL` | `ui/.env.local` | Backend base URL (default: `http://localhost:8000`) |

**Never commit `.env` files.** Use `.env.example` as template.

> **Note:** `ANTHROPIC_API_KEY` là cho backend gọi Claude API. Claude Code CLI (dev tooling) auth riêng qua `claude auth` — không đọc env var này.

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
| What the system does (features, WFU rules, warnings) | [business-spec.md](business-spec.md) |
| How to set up & run | [guides/contributing.md](guides/contributing.md) |
| How to work a ticket | [guides/ticket-workflow.md](guides/ticket-workflow.md) |
| BE code patterns | [guides/backend-guide.md](guides/backend-guide.md) |
| FE code patterns | [guides/frontend-guide.md](guides/frontend-guide.md) |
| Data flow diagrams | [design/data-flow.md](design/data-flow.md) |
| Database schema | [design/database-spec.md](design/database-spec.md) |
| Backend services & APIs | [design/backend-spec.md](design/backend-spec.md) |
| Frontend screens & components | [design/frontend-spec.md](design/frontend-spec.md) |
| All tickets (phases 0-8) | [planning/phases/](planning/phases/) |
| Progress tracking | [planning/general-ledger.md](planning/general-ledger.md) |
| Timeline & milestones | [planning/milestones.md](planning/milestones.md) |
| Final acceptance test | [planning/acceptance-checklist.md](planning/acceptance-checklist.md) |
