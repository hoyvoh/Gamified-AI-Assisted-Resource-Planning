# Backend Specification (High-Level)

Stack: **Python 3.12 · FastAPI · Pydantic v2 · SQLAlchemy 2.x · Alembic · uv**

---

## Service Architecture (Clean Architecture)

```
app/
├── routers/          # HTTP layer — nhận request, gọi service, trả response
├── schemas/          # Pydantic request/response models
├── services/         # Business logic — hoàn toàn không có HTTP
├── repositories/     # Data access layer — chỉ có SQL
├── models/           # SQLAlchemy ORM models
├── algorithms/       # COCOMO II, Genetic Algorithm, CPM, P(on_time)
├── llm/              # LLM integration service
│   └── prompts/      # All prompt files (.txt / .jinja2) — never hardcode prompts in service files
├── warnings/         # Warning computation engine (8 types)
└── config.py
```

---

## API Domains & Endpoints (Overview)

### Organizations & Users
```
GET    /health
GET    /orgs/{orgId}
POST   /orgs
GET    /orgs/{orgId}/personnel
POST   /orgs/{orgId}/personnel
GET    /orgs/{orgId}/personnel/{personnelId}
PATCH  /orgs/{orgId}/personnel/{personnelId}
POST   /orgs/{orgId}/personnel/{personnelId}/skills
```

### Projects
```
GET    /orgs/{orgId}/projects
POST   /orgs/{orgId}/projects
GET    /projects/{projectId}
PATCH  /projects/{projectId}
POST   /projects/{projectId}/analyze          # LLM task generation
POST   /projects/{projectId}/finalize         # Trigger XP calculation
```

### Project Evaluation (Mode 1 — PM/TL)
```
GET    /projects/{projectId}/evaluation                    # Get current evaluation (or 404)
POST   /projects/{projectId}/evaluation                    # Create evaluation (idempotent)
PATCH  /projects/{projectId}/evaluation                    # Update axis scores
POST   /projects/{projectId}/evaluation/finalize           # Compute verdict, lock evaluation
POST   /projects/{projectId}/evaluation/ai-assist          # AI scoring suggestion for 1 axis
DELETE /projects/{projectId}/evaluation                    # Reset to draft
```

### HR Analysis (Mode 2)
```
GET    /orgs/{orgId}/personnel/{personnelId}/profile          # Get developer profile
POST   /orgs/{orgId}/personnel/{personnelId}/profile/refresh  # Trigger GitHub data sync
GET    /projects/{projectId}/team-match                       # Get cached match results
POST   /projects/{projectId}/team-match                       # Run/re-run team match computation
GET    /projects/{projectId}/team-match/recommendations       # Top 3 team configs
```

### Scenarios
```
GET    /projects/{projectId}/scenarios
POST   /projects/{projectId}/scenarios
GET    /scenarios/{scenarioId}
PATCH  /scenarios/{scenarioId}
POST   /scenarios/{scenarioId}/snapshot       # Editable saved state (is_snapshot=true)
POST   /scenarios/{scenarioId}/optimize       # Genetic algorithm (async)
POST   /scenarios/{scenarioId}/risk-analysis  # LLM risk analysis
GET    /scenarios/{scenarioId}/warnings       # Computed warnings
GET    /scenarios/{scenarioId}/gantt          # Gantt data
GET    /scenarios/{scenarioId}/critical-path  # Critical path computation
```

### Tool Licenses
```
GET    /projects/{projectId}/tool-licenses         → list
POST   /projects/{projectId}/tool-licenses         → 201
DELETE /tool-licenses/{id}
POST   /tool-licenses/{id}/assign                  → assign seat to personnel
DELETE /tool-licenses/{id}/assignments/{personnel} → remove seat
```

### Completion Probability
```
GET    /scenarios/{scenarioId}/completion-probability → CompletionProbabilityResult (live compute)
GET    /scenarios/{scenarioId}/completion-history     → list[CompletionSnapshot] (trend over time)
```

### Tasks
```
GET    /scenarios/{scenarioId}/tasks
POST   /scenarios/{scenarioId}/tasks
GET    /tasks/{taskId}
PATCH  /tasks/{taskId}
DELETE /tasks/{taskId}
POST   /tasks/{taskId}/split                  # Tách task
POST   /tasks/merge                           # Gộp tasks
GET    /tasks/{taskId}/dependencies
POST   /tasks/{taskId}/dependencies
DELETE /tasks/{taskId}/dependencies/{depId}
POST   /tasks/{taskId}/progress               # Daily progress log
GET    /tasks/{taskId}/progress               # Progress history
```

### Assignments
```
GET    /scenarios/{scenarioId}/assignments
POST   /scenarios/{scenarioId}/assignments
PATCH  /assignments/{assignmentId}
DELETE /assignments/{assignmentId}
```

---

## Core Services

### `ProjectEvaluationService` (`services/project_evaluation.py`)
Manages the 10-axis Project Analysis scoring (Mode 1). See full axis rubrics and weights in [`knowledge-base/project-analysis/02_project_radar_scoring_matrix.md`](knowledge-base/project-analysis/02_project_radar_scoring_matrix.md).

**Responsibilities:**
- `get_or_create` — returns existing evaluation or creates a fresh draft for the project
- `update_axis_scores` — accepts per-axis scores (1–5) and optional TELOS sub-dimension breakdown; persists to DB
- `compute_verdict` — computes weighted composite score across 10 axes, applies hard gate rules (any axis = 1 → do_not_proceed; legal < 2 → do_not_proceed; TRL < 2 → conditional), maps composite to verdict label, auto-populates risk_register from axes ≤ 2
- `ai_assist_axis` — calls LLM with the axis rubric (loaded from `llm/prompts/`) and the project proposal text; returns suggested score + reasoning + clarifying questions

**Verdict thresholds:** ≥ 4.5 = Proceed with confidence / 4.0–4.4 = Proceed / 3.0–3.9 = Conditional / 2.0–2.9 = Conditional hold / < 2.0 = Do not proceed

---

### `PersonnelProfileService` (`services/personnel_profile.py`)
Manages developer profiles (Mode 2 — Pillar 2). Full scoring methodology and layer definitions in [`knowledge-base/resource-analysis/01_resource_profile_methodology.md`](knowledge-base/resource-analysis/01_resource_profile_methodology.md).

**Responsibilities:**
- `get_profile` — retrieves cached 5-layer developer profile for a personnel record
- `refresh_profile` — orchestrates the full data pipeline:
  1. Collect GitHub commit/PR/review data via `gh` CLI wrapper (date range, repos)
  2. Extract behavioral signals (commit frequency, PR size, review participation, response time)
  3. Build NLP corpus from PR descriptions, review comments, and issue text
  4. Call LLM (OCEAN inference via MLA-OCEAN approach) for personality trait scores
  5. Compute 5-layer profile scores (technical capability, collaboration, delivery, growth, personality)
  6. Compute WFU factors for the given project context
  7. Generate confidence flags (axes with low data coverage marked with `~` prefix)
  8. Persist results to `personnel_profiles` table
- `compute_wfu_factors` — derives the 4 WFU multiplier factors from the profile:
  - `project_familiarity_factor` (0.7–1.2): based on tenure months in similar technology domains
  - `technology_match_factor` (0.8–1.5): coverage of project tech_stacks by developer's skill matrix
  - `quality_history_factor` (0.9–1.1): from `performance.code_quality` score
  - `delivery_reliability_factor` (0.8–1.1): from `performance.delivery_reliability` score

---

### `TeamMatchService` (`services/team_match.py`)
Computes project-developer match scores and team composition recommendations.

**Responsibilities:**
- `compute_matches` — for each personnel with a profile:
  - Builds a `project_requirements_vector` from the evaluation (required skills, tech axes, quality attribute priorities)
  - Builds a `developer_profile_vector` from the personnel profile
  - Computes `match_score` via cosine similarity between the two vectors
  - Computes `skill_coverage` (% of project tech_stacks covered by developer's skills)
  - Computes `ocean_fit` (personality trait alignment with project type)
  - Computes `growth_opportunity` (would this project expand the developer's weakest dimensions?)
  - Computes `effective_wfu` via `compute_wfu_factors` for this specific project
- `recommend_teams` — greedy + local search to find top 3 team configurations that:
  - Cover all required project skills (minimum viable coverage)
  - Maximize `skill_coverage_score` across the team
  - Respect budget constraints (if set)
  - Balance OCEAN profiles (avoid all-introvert or all-high-E teams)

---

### `ProjectAnalysisService` (`services/project_analysis.py`)
- **Input:** Raw project proposal text + personnel list + org context
- **Action:** Calls LLM with structured prompt (loaded from `llm/prompts/`) → parses JSON response
- **Output:** List of draft tasks with category, tech stack, effort estimate, dependencies, priority
- **COCOMO II integration:** After LLM suggests tasks, `CocomoService` validates and adjusts effort estimates

---

### `CocomoService` (`algorithms/cocomo.py`)
Implements the **COCOMO II Post-Architecture model**.

**Core formula:** `PM = A × Size^E × ∏EM`
- PM = person-months; Size = KSLOC or Function Points (converted); E = scaling exponent from scale factors; EM = effort multipliers

**Responsibilities:**
- `estimate_effort` — accepts size points, scale factors, and effort multipliers; returns person-months
- `to_man_days` — converts person-months to man-days (assumes 20 working days/month)
- `breakdown_by_phase` — distributes total days across 6 phases:

| Phase | Default % |
|-------|-----------|
| Investigate | 10% |
| Design | 15% |
| Implement | 40% |
| Test | 20% |
| Review | 10% |
| Support (release, handover, post-launch monitoring) | 5% |

Org/project can override via `phase_ratios_override` (must sum to 1.0).

---

### `WarningEngine` (`warnings/engine.py`)
Recomputes all warnings whenever scenario state changes (assignments, task dates, allocations). 8 warning types:

| Method | Warning Type | Trigger |
|--------|-------------|---------|
| `check_capacity` | CAPACITY | Total daily hours across all projects > 7h for any person |
| `check_junior_alone` | JUNIOR_ALONE | All assignees on critical/high task belong to `{intern, fresher, junior_1}` — no senior present |
| `check_language_barrier` | LANGUAGE_BARRIER | Task's required languages not present in assignee's language list |
| `check_budget` | BUDGET | Cumulative personnel cost > `project.budget_total` |
| `check_license` | LICENSE | Tool seat assignments > `project_tool_licenses.total_seats` for any tool |
| `check_time_risk` | TIME_RISK | P(on_time) < 50% or EAC date > project deadline |
| `check_dependency_risk` | DEPENDENCY_RISK | Dependent task approaching start date while predecessor is unfinished |
| `check_skill_mismatch` | SKILL_MISMATCH | > 50% of assignees lack the task's required tech stack |

---

### `GeneticOptimizer` (`algorithms/genetic.py`)
- **Chromosome:** task × personnel allocation matrix (allocation percentages)
- **Fitness function:** minimize makespan (total duration) or minimize total cost — user selects mode
- **Constraints enforced:** daily capacity ≤ 7h, junior_alone rule, topological dependency order
- **Run:** `optimize(scenario_id, mode, population_size=100, generations=500)` → returns top 3 `OptimizationSolution` objects sorted by fitness
- **Execution:** runs as async background task via Celery; progress broadcast via WebSocket

---

### `LLMService` (`llm/service.py`)
Central gateway for all LLM calls. All prompts are loaded from `app/llm/prompts/` (`.txt` / `.jinja2`) — never hardcoded in service files.

**Operations:**
- `analyze_project` — generates structured task list from proposal text
- `analyze_risks` — identifies timeline, technical, and resource risks with mitigation suggestions
- `suggest_task_split` — proposes subtask decomposition for a given task and split reason
- `free_prompt` — general-purpose AI assistant with scenario context injected

Uses `anthropic` SDK (Claude) or `openai` SDK per `llm_provider` config. All interactions logged to `llm_sessions` table.

---

### `CriticalPathService` (`services/critical_path.py`)
- Implements **CPM (Critical Path Method)**
- Input: DAG of tasks with durations and typed dependencies (`finish_to_start`, `start_to_start`, `finish_to_finish`)
- Output: critical path task list (longest path), float values per task, early/late start and finish dates

---

### `EarnedValueService` (`services/earned_value.py`)
- Computes SPI (Schedule Performance Index), CPI (Cost Performance Index), EAC (Estimate at Completion), ETC from daily progress logs
- Forecasts actual completion date
- Triggers TIME_RISK warning when EAC date > project deadline

---

### `CompletionProbabilityService` (`algorithms/completion_probability.py`)
Computes `P(on_time)` — the probability the project will finish by its deadline.

**Algorithm:**
1. Get current SPI from `EarnedValueService`
2. Get SPI variance from the last 7 days of progress logs
3. Sum active warning penalties (each active warning type reduces P(on_time)):

| Warning | Weight |
|---------|--------|
| CAPACITY | −0.15 |
| JUNIOR_ALONE | −0.12 |
| LANGUAGE_BARRIER | −0.10 |
| SKILL_MISMATCH | −0.08 |
| DEPENDENCY_RISK | −0.07 |
| TIME_RISK | −0.05 |
| BUDGET | −0.03 |
| LICENSE | −0.02 |

4. Get critical path float (slack days) from `CriticalPathService`
5. Compute: `p_on_time = clamp(0, 1, spi_to_probability(spi, variance) − risk_penalty + slack_bonus)`
6. Compute EAC date and `days_delta` (positive = ahead of deadline, negative = behind)
7. Save snapshot to `scenario_completion_snapshots` for trend tracking

**Response fields:** `p_on_time` (0.0–1.0), `eac_date`, `days_delta`, `confidence_level` (on_track / at_risk / critical), `contributing_factors` (human-readable list)

---

### `VelocityCalibrationService` (`services/velocity_calibration.py`)
Updates `personnel.velocity_baseline` after each completed project:
- Computes `actual_wfu = actual_hours / planned_hours` for the project
- Updates baseline via exponential moving average: `velocity_baseline = 0.7 × old_baseline + 0.3 × actual_wfu`
- Updated baseline is used in future COCOMO estimates for this person

---

### `XPCalculationService` (`services/xp.py`)
Triggered at project finalization (`POST /projects/{id}/finalize`). For each team member:
- Awards base XP per completed task
- Applies bonus XP for early delivery, new skill usage, and quality signals
- Checks level-up threshold in skill matrix and upgrades skill level if met

---

## Background Jobs

| Job | Trigger | Description |
|-----|---------|-------------|
| `optimize_scenario` | POST /scenarios/{id}/optimize | Genetic algorithm — Celery task |
| `recompute_warnings` | After any assignment/task change | Fast sync computation |
| `analyze_project` | POST /projects/{id}/analyze | LLM call — Celery task |
| `recalculate_ev` | After progress log | EV metrics recomputation |

Background jobs use **Celery + Redis** (or `asyncio` background tasks for simpler MVP flows).

---

## Add WFU Mid-Execution Flow

When `GET /scenarios/{id}/completion-probability` returns `p_on_time < 0.5`:

```
PM sees TIME_RISK warning → clicks "Add Support"
  → UI shows: "Add person or increase allocation"
  → PM assigns new person / increases allocation_pct
  → POST /scenarios/{id}/assignments (or PATCH existing)
  → Warning Engine recomputes capacity/warnings
  → CompletionProbabilityService.compute() called immediately
  → If p_on_time improves → show new probability
  → If adding person late (task >50% done) → show Brooks' Law warning:
     "Adding N people at this stage is unlikely to help — task is already 65% complete"
```

---

## Key Business Rules

1. **Junior alone rule:** All assignees on a `priority=critical` or `priority=high` task must not all belong to `{intern, fresher, junior_1}` — at least one `junior_2` or above must be present
2. **Capacity check:** Total effective daily hours for any person across all projects ≤ 7h (`daily_capacity_hours`)
3. **Non-linear scaling (Brooks' Law):** Adding a person to a task that is >50% complete slows it down rather than accelerating it — the Warning Engine surfaces this as a Brooks' Law advisory
4. **Snapshot editability:** A scenario with `is_snapshot=true` remains fully editable and can be activated at any time. Snapshot is a "saved draft state" — not immutable. Only `status=archived` scenarios are read-only (API returns 403 on write)
5. **Dependency order:** Schedule computation processes tasks in topological order of the dependency DAG; circular dependencies return 409

---

## Configuration (`app/config.py`)

Settings loaded via `pydantic-settings` from `be/.env`. See [`architecture-overview.md` — Environment Variables](../architecture-overview.md#environment-variables) for the full env var reference.

| Setting | Default | Purpose |
|---------|---------|---------|
| `database_url` | — | PostgreSQL connection string |
| `redis_url` | `redis://localhost:6379` | Celery broker + result backend |
| `secret_key` | — | JWT signing key |
| `anthropic_api_key` | — | Claude API access |
| `openai_api_key` | — | OpenAI fallback (optional) |
| `llm_provider` | `anthropic` | Which SDK to use (`anthropic` / `openai`) |
| `llm_model` | `claude-sonnet-4-6` | Model ID for LLM calls |
| `llm_prompts_dir` | `app/llm/prompts` | Directory for `.txt`/`.jinja2` prompt files |
| `github_token` | — | GitHub API / CLI access for developer data pipeline |
| `github_api_host` | `api.github.com` | Override for GitHub Enterprise instances |
| `github_strict_mode` | `false` | `true` = only fetch from `github_api_host`; `false` = any public repo |
| `slack_bot_token` | — | Slack API access; absent = gracefully skip Slack pipeline |
| `cocomo_a` | `2.94` | COCOMO II A constant |
| `cocomo_b` | `0.91` | COCOMO II scaling exponent base |
| `ga_population` | `100` | Genetic Algorithm population size |
| `ga_generations` | `500` | Genetic Algorithm generation count |

---

## Error Handling

All errors return structured JSON:
```json
{
  "error": "CAPACITY_EXCEEDED",
  "message": "Assigning this task would give Nguyen Van A 9.5h/day",
  "detail": { "personnel_id": "...", "current_hours": 9.5, "limit": 7.0 }
}
```

HTTP status codes:
- `400` — Business rule violation
- `403` — Forbidden (archived scenario is read-only, permission denied)
- `404` — Resource not found
- `409` — Conflict (e.g., circular dependency)
- `422` — Validation error (Pydantic)
- `503` — LLM service unavailable
