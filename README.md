<p align="center">
  <img src="wallpaper.png" alt="Gamified Resource Planning — Desert Empire" width="100%" />
</p>

<h1 align="center">Gamified AI Assisted Resource Planning</h1>

<p align="center">
  <strong>Biến buổi họp phân bổ nhân sự thành bàn cờ chiến lược.</strong><br/>
  <em>Turn your resource planning meeting into a desert empire strategy board.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/Three.js-3D_Board-049ef4?logo=threedotjs" alt="Three.js" />
  <img src="https://img.shields.io/badge/FastAPI-Python_3.12-009688?logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Claude-LLM_Powered-7c3aed?logo=anthropic" alt="Claude AI" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License" />
</p>

---

## What is this?

**Gamified Resource Planning** is an open-source web application that reimagines project resource planning as a **desert empire strategy game**. You are the general — your team members are units, your tasks are military camps, and the distant fortress is your deadline.

Under the hood, the system combines:

- **COCOMO II** — industry-standard software effort estimation
- **Genetic Algorithm** — multi-constraint schedule optimization
- **Claude LLM** — natural language project analysis and risk assessment
- **Three.js** — real-time 3D strategy board visualization

---

## The Problem It Solves

Planning meetings where you need to allocate people across tasks are painful:

- Spreadsheets don't show real constraints (capacity, dependencies, skill gaps)
- Over-allocating people is invisible until someone burns out
- "Add more people" doesn't always help — and the system shows you why
- What-if scenarios ("what if someone quits?") are time-consuming to model

**With this tool**, you open the board in a meeting, input your project proposal, watch AI break it into tasks, drag your team members onto tasks, and see real-time warnings when something won't work — all before writing a single line of code.

---

## Key Features

### Strategic Board (Three.js)

- Desert empire 3D scene — tasks as **camps**, personnel as **units**, deadline as a **fortress** on the horizon
- Drag-and-drop personnel onto tasks in real time
- Camera orbit, zoom, click to inspect

### AI-Powered Planning

- Paste your project proposal → Claude analyzes and generates a structured task breakdown
- Each task: category, tech stack, effort estimate (COCOMO II), dependencies, priority
- "Analyze Risks" → LLM identifies timeline, technical, and resource risks with mitigation suggestions

### Resource Assignment Engine

- **Workforce Unit (WFU)** system: junior staff work at 80% capacity (learning time), seniors can boost to 1.2× or 1.5× on matching tech stacks
- Multi-project allocation: one person can be 60% on Project A, 40% on Project B — system tracks the total
- **Non-linear scaling**: adding people to a task doesn't always make it faster (Brooks' Law enforced)

### Warning System

| Type              | Trigger                                    | Severity    |
| ----------------- | ------------------------------------------ | ----------- |
| Capacity Overload | Person assigned >7h/day total              | 🔴 Critical |
| Junior Alone      | Junior-only team on critical task          | 🔴 Critical |
| Time Risk         | Current plan won't meet deadline           | 🟠 Warning  |
| Budget Exceeded   | Personnel cost > project budget            | 🟠 Warning  |
| Skill Mismatch    | Majority of task team lacks the tech stack | 🟡 Info     |

### Scenario Planning

- **Snapshot** the current plan as "Plan A" → keep dealing without losing your baseline
- Fork scenarios to model risk: "What if our senior dev leaves?"
- Compare scenarios side-by-side

### Genetic Algorithm Optimizer

- One click → system finds near-optimal allocation for **minimize duration** or **minimize cost**
- Reviews top 3 solutions, accept all or cherry-pick

### Views

- **Strategic Board** — 3D overview (main planning view)
- **Gantt Chart** — timeline with planned vs actual progress
- **Dependency Graph** — DAG with critical path highlighted
- **Calendar** — daily workload view per person

### Progress Tracking (Execution Mode)

- Daily progress updates → Earned Value metrics (SPI, CPI, EAC)
- Burndown chart: planned vs actual
- Auto-warning when project is at risk of missing deadline

### XP & Leveling

- When a project ends, team members earn XP based on delivery quality
- Learning new tech stacks → skill level-ups
- Skill matrix grows over time → better estimates for future projects

---

## Tech Stack

| Layer        | Technology                                  |
| ------------ | ------------------------------------------- |
| Frontend     | Next.js 15 · React 19 · TypeScript (strict) |
| 3D Board     | Three.js · OrbitControls · CSS2DRenderer    |
| Styling      | Tailwind CSS v4 (design tokens)             |
| State        | Zustand                                     |
| Backend      | Python 3.12 · FastAPI · Pydantic v2         |
| Database     | PostgreSQL · SQLAlchemy 2.x · Alembic       |
| AI           | Anthropic Claude (SDK)                      |
| Estimation   | COCOMO II Post-Architecture model           |
| Optimization | Custom Genetic Algorithm                    |
| FE Tooling   | pnpm 10 · Oxfmt · Oxlint · Vitest           |
| BE Tooling   | uv · Ruff · Mypy strict · Pytest            |
| CI           | GitHub Actions (parallel FE + BE jobs)      |

---

## Getting Started

### Prerequisites

```bash
node --version   # >= 22.12.0
pnpm --version   # >= 10
python --version # 3.12
uv --version     # latest
```

### Setup

```bash
git clone <repo-url>
cd gamified_resource_planning

# Install root tooling (git hooks)
pnpm install

# Frontend
cd ui && pnpm install && cd ..

# Backend
cd be && uv sync && cd ..
```

### Run

```bash
# Terminal 1 — Backend
cd be && uv run uvicorn app.main:app --reload
# → http://localhost:8000
# → http://localhost:8000/docs (Swagger UI)

# Terminal 2 — Frontend
cd ui && pnpm dev
# → http://localhost:3000
```

### Environment

```bash
# be/.env
DATABASE_URL=postgresql://user:pass@localhost:5432/grp
SECRET_KEY=your-secret-key
ANTHROPIC_API_KEY=sk-ant-...

# ui/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Project Structure

```
gamified_resource_planning/
├── ui/                    # Next.js 15 frontend
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # Shared components (StrategicBoard, GanttChart, ...)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/api/       # Typed fetch wrappers
│   │   ├── store/         # Zustand state
│   │   └── types/         # Generated from OpenAPI
│   └── package.json
├── be/                    # FastAPI backend
│   ├── app/
│   │   ├── routers/       # HTTP endpoints
│   │   ├── services/      # Business logic
│   │   ├── repositories/  # Data access
│   │   ├── models/        # SQLAlchemy ORM
│   │   ├── schemas/       # Pydantic models
│   │   ├── algorithms/    # COCOMO II, Genetic Algorithm, CPM
│   │   ├── llm/           # Claude integration
│   │   └── warnings/      # Warning engine
│   └── pyproject.toml
└── docs/                  # All documentation
    ├── architecture-overview.md
    ├── business-spec.md
    ├── guides/            # How to contribute & develop
    ├── design/            # Technical specs (DB, API, FE, data flow)
    └── planning/          # Phases, tickets, milestones, ledger
```

---

## Documentation

| Document                                                      | Description                          |
| ------------------------------------------------------------- | ------------------------------------ |
| [Architecture Overview](docs/architecture-overview.md)        | System design, tech stack, data flow |
| [Business Spec](docs/business-spec.md)                        | Full feature specification           |
| [Contributing Guide](docs/guides/contributing.md)             | Setup, running, code quality         |
| [Ticket Workflow](docs/guides/ticket-workflow.md)             | How to pick up and complete a ticket |
| [Backend Guide](docs/guides/backend-guide.md)                 | Clean architecture patterns for BE   |
| [Frontend Guide](docs/guides/frontend-guide.md)               | Component and hook patterns for FE   |
| [Database Spec](docs/design/database-spec.md)                 | Full schema with all tables          |
| [API & Services Spec](docs/design/backend-spec.md)            | Service inventory and API overview   |
| [Frontend Spec](docs/design/frontend-spec.md)                 | Screens, components, Three.js design |
| [Data Flow](docs/design/data-flow.md)                         | All major data flow diagrams         |
| [Development Phases](docs/planning/phases/)                   | 30 tickets across 8 phases           |
| [General Ledger](docs/planning/general-ledger.md)             | Progress tracker for all 30 tickets  |
| [Milestones](docs/planning/milestones.md)                     | Timeline (MVP: 1 Apr 2026)           |
| [Acceptance Checklist](docs/planning/acceptance-checklist.md) | 57-item final verification           |

---

## Development Roadmap

| Milestone                           | Target         | Status         |
| ----------------------------------- | -------------- | -------------- |
| M0 — Foundation (DB, COCOMO, shell) | 22 Mar 2026    | 🔄 In progress |
| M1 — Core Planning Board            | 30 Mar 2026    | ⬜ Planned     |
| **M2 — MVP: AI Planning**           | **1 Apr 2026** | ⬜ Planned     |
| M3 — Optimization & Views           | 20 Apr 2026    | ⬜ Planned     |
| M4 — Execution Mode                 | 30 Apr 2026    | ⬜ Planned     |
| M5 — XP System                      | 15 May 2026    | ⬜ Planned     |
| M6 — Production Ready               | 31 May 2026    | ⬜ Planned     |

---

## Contributing

We welcome contributions! **Direct pushes to this repository are not allowed** — all contributions must go through a fork + pull request flow.

### Workflow

1. **Fork** this repository to your own GitHub account
2. Clone your fork locally and create a feature branch:
   ```bash
   git clone https://github.com/<your-username>/gamified_resource_planning
   cd gamified_resource_planning
   git checkout -b feature/<TICKET-ID>-<short-name>
   ```
3. Check the [General Ledger](docs/planning/general-ledger.md) for available tickets
4. Read the ticket's `overview.md` and `design.md` in `docs/planning/phases/`
5. Follow the [Ticket Workflow](docs/guides/ticket-workflow.md)
6. Push to **your fork** and open a Pull Request targeting `main` in this repo
7. CI must be green and all acceptance criteria must be checked before merge

> **Note:** The `main` branch is protected. No one — including maintainers — merges to `main` without a reviewed PR.

**Branch naming:** `feature/<TICKET-ID>-<short-name>` (e.g., `feature/BE-001-cocomo-engine`)

**Commit format:** [Conventional Commits](https://www.conventionalcommits.org/) — enforced by git hook.

---

## License

MIT © 2026 — See [LICENSE](LICENSE) for details.

---

<p align="center">
  <em>"The general who wins the battle makes many calculations before the battle is fought." — Sun Tzu</em>
</p>
