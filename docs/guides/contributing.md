# Contributing Guide

## Prerequisites

| Tool | Min version | Install |
|------|-------------|---------|
| Node.js | 22.12.0 | [nodejs.org](https://nodejs.org) |
| pnpm | 10+ | `npm i -g pnpm` |
| Python | 3.12 | [python.org](https://python.org) |
| uv | latest | `curl -Ls https://astral.sh/uv/install.sh \| sh` |
| Git | any | |

## Getting Started

```bash
# 1 — Clone
git clone <repo-url>
cd gamified_resource_planning

# 2 — Install root tools (sets up git hooks)
pnpm install

# 3 — Install frontend
cd ui && pnpm install && cd ..

# 4 — Install backend
cd be && uv sync && cd ..
```

## Running Locally

```bash
# Frontend (Next.js dev server — Turbopack)
cd ui && pnpm dev          # → http://localhost:3000

# Backend (FastAPI with auto-reload)
cd be && uv run uvicorn app.main:app --reload   # → http://localhost:8000

# API docs
open http://localhost:8000/docs
```

## Quality Commands

### Frontend (`ui/`)

```bash
pnpm format          # oxfmt — format all files in src/
pnpm format:check    # oxfmt --check (used in CI)
pnpm lint            # oxlint --fix → eslint --fix
pnpm lint:ci         # lint without auto-fix (used in CI)
pnpm type-check      # tsc --noEmit
pnpm test:unit       # vitest (watch mode)
pnpm test:unit:run   # vitest --run (CI mode)
pnpm build           # production build
```

### Backend (`be/`)

```bash
uv run ruff format .         # format all Python files
uv run ruff format --check . # check without modifying (CI)
uv run ruff check .          # lint
uv run ruff check --fix .    # lint + auto-fix
uv run mypy app              # type check
uv run pytest                # run all tests
uv run uvicorn app.main:app --reload  # dev server
```

## Git Workflow

### Commit Messages — Conventional Commits

```
<type>(<scope>): <description>

feat: add XP calculation endpoint
fix(ui): correct resource chip overflow on mobile
refactor(be): extract leaderboard service
docs: update architecture overview
chore: bump ruff to 0.9.0
test: add missing coverage for achievement unlock
ci: cache uv dependencies in GitHub Actions
```

Valid types: `feat` · `fix` · `refactor` · `docs` · `chore` · `test` · `style` · `perf` · `ci`

The `commit-msg` git hook enforces this — invalid commits are rejected.

### Pre-commit Hook

The `pre-commit` hook runs `lint-staged` automatically on staged files:
- `ui/**/*.{ts,tsx}` → oxfmt + oxlint --fix + eslint --fix
- `ui/**/*.{js,jsx,mjs,cjs}` → oxlint --fix
- `be/**/*.py` → ruff format + ruff check --fix

### Branch Naming

```
feat/add-xp-system
fix/resource-overflow
chore/update-deps
feature/BE-001-cocomo-engine    # ticket branches
feature/FE-005-threejs-board
```

## CI Pipeline

Two parallel jobs on every push/PR to `main` and `develop`:

**Frontend job** (`ui/`): format:check → lint:ci:oxlint → lint:ci:eslint → type-check → build

**Backend job** (`be/`): ruff format --check → ruff check → mypy → pytest

All jobs must pass before merging.

## File Naming Conventions

### Frontend

| Artifact | Convention | Example |
|----------|-----------|---------|
| Page | `page.tsx` in route dir | `app/resources/page.tsx` |
| Component | PascalCase | `ResourceCard.tsx` |
| Hook | `use` prefix | `useResources.ts` |
| API client | `camelCase` | `resourceApi.ts` |
| Types | generated | `src/types/api.ts` (from OpenAPI) |

### Backend

| Artifact | Convention | Example |
|----------|-----------|---------|
| Router | snake_case | `resource_router.py` |
| Schema | snake_case | `resource_schema.py` |
| Service | snake_case | `resource_service.py` |
| Repository | snake_case | `resource_repo.py` |
| Test | `test_` prefix | `test_resources.py` |

## Further Reading

- [Ticket Workflow](ticket-workflow.md) — How to pick up and complete a ticket
- [Backend Guide](backend-guide.md) — Backend code patterns (Clean Architecture)
- [Frontend Guide](frontend-guide.md) — Frontend code patterns (Next.js App Router)
- [ReactJS & Next.js Coding Standard](react-nextjs-coding-standard.md) — Frontend coding policy and review checklist
- [Development Phases](../planning/phases/) — All tickets with acceptance criteria
