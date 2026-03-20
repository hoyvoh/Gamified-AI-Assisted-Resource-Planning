# Architecture Overview

## Project

**Gamified Resource Planning** — A web application for managing project resources with gamification mechanics (XP, levels, achievements, leaderboards).

## Repository Layout

```
gamified_resource_planning/
├── ui/          # Next.js 15 frontend (App Router)
├── be/          # Python FastAPI backend
├── docs/        # Architecture & contributor guides  ← you are here
├── .github/
│   ├── workflows/ci.yml          # CI for both ui/ and be/
│   └── pull_request_template.md
├── .gitignore
├── .lintstagedrc.cjs   # Monorepo lint-staged config
└── package.json        # Root: simple-git-hooks + commitlint
```

## System Architecture

```
Browser
  │
  ▼
Next.js (ui/)            Port 3000 (dev)
  │  React Server Components + Client Components
  │  Tailwind CSS v4 · TypeScript strict
  │
  │ HTTP/REST
  ▼
FastAPI (be/)            Port 8000 (dev)
  │  Pydantic v2 · Python 3.12 · uvicorn
  │
  ▼
Database (TBD)
  PostgreSQL recommended
```

## Tech Decisions

| Concern | Choice | Reason |
|---------|--------|--------|
| UI Framework | Next.js 15 (App Router) | SSR/SSG, React 19, great DX |
| Styling | Tailwind CSS v4 | Zero-config, design tokens via `@theme` |
| API | FastAPI + Pydantic v2 | Auto docs (OpenAPI), type-safe, async |
| Package manager (FE) | pnpm 10 | Fast, strict, monorepo-friendly |
| Package manager (BE) | uv | Rust-based, fastest Python installer |
| Formatting (FE) | Oxfmt | Single-pass formatter, no config noise |
| Linting (FE) | Oxlint → ESLint | Oxlint (fast Rust) first, ESLint for advanced rules |
| Formatting/Linting (BE) | Ruff | Replaces black + isort + flake8 in one tool |
| Type checking (BE) | Mypy (strict) | Catches runtime bugs at dev time |
| Testing (FE) | Vitest + Testing Library | Vite-native, fast |
| Testing (BE) | Pytest + httpx | Async-native, ASGI transport |
| Git hooks | simple-git-hooks + lint-staged | Lightweight, no Husky overhead |
| Commit convention | Conventional Commits | Enables changelog gen, semantic versioning |

## Data Flow (planned)

```
User action
  → Next.js client component
  → fetch / React Server Action
  → FastAPI endpoint
  → Pydantic request model (validated)
  → Service layer (business logic)
  → Repository layer (DB)
  → Pydantic response model
  → JSON response
  → Next.js renders updated UI
```

## API Contract

FastAPI auto-generates OpenAPI docs at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc:       `http://localhost:8000/redoc`
- JSON schema: `http://localhost:8000/openapi.json`

**Principle**: Never write frontend types by hand — always generate from the OpenAPI schema.

## Gamification Domain (planned)

```
User
  ├── level: int
  ├── xp: int
  ├── achievements: Achievement[]
  └── resources: ResourceAssignment[]

Project
  ├── tasks: Task[]
  ├── sprints: Sprint[]
  └── leaderboard: LeaderboardEntry[]

Resource
  ├── type: SKILL | PERSON | TOOL | BUDGET
  ├── capacity: float
  └── assignments: ResourceAssignment[]
```

## Environment Variables

| Var | Location | Purpose |
|-----|----------|---------|
| `DATABASE_URL` | `be/.env` | PostgreSQL connection string |
| `SECRET_KEY` | `be/.env` | JWT signing key |
| `NEXT_PUBLIC_API_URL` | `ui/.env.local` | Backend base URL |

**Never commit `.env` files.** Use `.env.example` as a template.
