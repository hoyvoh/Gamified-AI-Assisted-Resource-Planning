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

# 2 — Install root tools (sets up git hooks automatically)
pnpm install

# 3 — Install frontend
cd ui && pnpm install && cd ..

# 4 — Install backend
cd be && uv sync && cd ..
```

## Running Locally

```bash
# Frontend (Next.js dev server with Turbopack)
cd ui && pnpm dev          # → http://localhost:3000

# Backend (FastAPI with auto-reload)
cd be && uv run uvicorn app.main:app --reload   # → http://localhost:8000
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
uv run ruff format --check . # check without modifying (used in CI)
uv run ruff check .          # lint
uv run ruff check --fix .    # lint + auto-fix
uv run mypy app              # type check
uv run pytest                # run all tests
uv run uvicorn app.main:app --reload  # dev server
```

## Git Workflow

### Commit Messages — Conventional Commits

All commits **must** follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<optional scope>): <description>

feat: add XP calculation endpoint
fix(ui): correct resource chip overflow on mobile
refactor(be): extract leaderboard service
docs: update API endpoint list
chore: bump ruff to 0.9.0
test: add missing coverage for achievement unlock
ci: cache uv dependencies in GitHub Actions
```

Valid types: `feat` · `fix` · `refactor` · `docs` · `chore` · `test` · `style` · `perf` · `ci`

The `commit-msg` git hook enforces this. An invalid commit will be **rejected**.

### Pre-commit Hook

The `pre-commit` hook runs `lint-staged` automatically on all staged files:

- `ui/**/*.{ts,tsx}` → oxfmt + oxlint --fix + eslint --fix
- `ui/**/*.{js,jsx,mjs,cjs}` → oxlint --fix
- `be/**/*.py` → ruff format + ruff check --fix

Auto-fixes are re-staged, so the commit will include the formatted versions.

### Branch Naming

```
feat/add-xp-system
fix/resource-overflow
chore/update-deps
```

## CI Pipeline

Two parallel jobs run on every push/PR to `main` and `develop`:

**Frontend job** (`ui/`): format:check → lint:ci:oxlint → lint:ci:eslint → type-check → build

**Backend job** (`be/`): ruff format --check → ruff check → mypy → pytest

All jobs must pass before merging.

## Adding a New Feature

### Backend endpoint

1. Add route in `be/app/routers/<domain>.py` (create if new domain)
2. Add request/response models in `be/app/schemas/<domain>.py`
3. Add service logic in `be/app/services/<domain>.py`
4. Register router in `be/app/main.py`
5. Write tests in `be/tests/test_<domain>.py`
6. Run `uv run mypy app` and `uv run pytest`

### Frontend page / component

1. New page: `ui/src/app/<route>/page.tsx`
2. New component: `ui/src/components/<ComponentName>.tsx`
3. API types: generate from `http://localhost:8000/openapi.json` (never hand-write)
4. Write tests in `ui/src/__tests__/<ComponentName>.test.tsx`
5. Run `pnpm type-check` and `pnpm test:unit:run`

## File Naming Conventions

### Frontend

| Artifact | Convention | Example |
|----------|-----------|---------|
| Page | `page.tsx` in route dir | `app/resources/page.tsx` |
| Component | PascalCase | `ResourceCard.tsx` |
| Hook | `use` prefix | `useResources.ts` |
| API client | `camelCase` | `resourceApi.ts` |
| Types | `camelCase` | `types.ts` or `resourceTypes.ts` |

### Backend

| Artifact | Convention | Example |
|----------|-----------|---------|
| Router | snake_case | `resource_router.py` |
| Schema | snake_case | `resource_schema.py` |
| Service | snake_case | `resource_service.py` |
| Test | `test_` prefix | `test_resources.py` |
