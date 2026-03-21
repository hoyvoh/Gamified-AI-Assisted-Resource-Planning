# Architecture Overview

**Gamified Resource Planning** — Biến quá trình họp phân bổ nhân sự thành bàn cờ chiến lược Desert Empire. Kết hợp COCOMO II, Genetic Algorithm, và LLM để tối ưu resource planning.

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
  │  Three.js: 3D Desert Empire board
  │  Tailwind CSS v4 · TypeScript strict
  │
  │ HTTP/REST + WebSocket (progress updates)
  ▼
FastAPI (be/)            Port 8000 (dev)
  │  Routers → Services → Repositories (Clean Architecture)
  │  Pydantic v2 · Python 3.12 · SQLAlchemy 2.x
  │
  ├─── LLM API (Anthropic/Claude)  — task analysis, risk analysis
  ├─── Genetic Algorithm           — resource optimization
  ├─── COCOMO II engine            — effort estimation
  │
  ▼
PostgreSQL               Port 5432 (dev)
```

---

## Tech Stack Decisions

| Concern | Choice | Reason |
|---------|--------|--------|
| UI Framework | Next.js 15 App Router | SSR/SSG, React 19, file-based routing |
| 3D Visualization | Three.js | Desert empire board, camp objects, personnel units |
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
| AI | Claude (Anthropic) | Task generation, risk analysis, suggestions |

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
        └── has many Scenarios (planning alternatives)
              └── has many Tasks (camps on the board)
                    ├── has many ResourceAssignments → Personnel
                    ├── has many TaskDependencies
                    └── has many ProgressLogs

Organization
  └── has many Personnel
        ├── has SkillMatrix (skill → level → WFU multiplier)
        └── participates in Projects via ProjectMembership (allocation %)
```

---

## Environment Variables

| Var | Location | Purpose |
|-----|----------|---------|
| `DATABASE_URL` | `be/.env` | PostgreSQL connection string |
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
