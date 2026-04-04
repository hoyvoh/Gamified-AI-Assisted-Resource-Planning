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
GET    /orgs/{orgId}/personnel/{personnelId}/profile       # Get developer profile
POST   /orgs/{orgId}/personnel/{personnelId}/profile/refresh  # Trigger GitHub data sync
GET    /projects/{projectId}/team-match                    # Get cached match results
POST   /projects/{projectId}/team-match                    # Run/re-run team match computation
GET    /projects/{projectId}/team-match/recommendations    # Top 3 team configs
```

### Scenarios
```
GET    /projects/{projectId}/scenarios
POST   /projects/{projectId}/scenarios
GET    /scenarios/{scenarioId}
PATCH  /scenarios/{scenarioId}
POST   /scenarios/{scenarioId}/snapshot       # Immutable copy
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
Manages the 10-axis Project Analysis scoring (Mode 1):

```python
class ProjectEvaluationService:
    def get_or_create(self, project_id: UUID) -> ProjectEvaluation: ...

    def update_axis_scores(
        self,
        evaluation_id: UUID,
        axis_scores: dict[str, AxisScore],   # {axis_id: {score, rationale}}
        telos_breakdown: TelosBreakdown | None = None
    ) -> ProjectEvaluation: ...

    def compute_verdict(self, evaluation_id: UUID) -> ProjectEvaluation:
        # 1. Compute composite = Σ (weight_i × score_i) for 10 axes
        # 2. Apply hard gate rules:
        #    - any score == 1 → do_not_proceed
        #    - legal axis < 2 → do_not_proceed
        #    - TRL axis < 2 → conditional at minimum
        # 3. Composite → verdict:
        #    - ≥ 4.0 → proceed
        #    - 3.0–3.9 → conditional
        #    - < 3.0 → do_not_proceed
        # 4. Auto-generate risk_register from axes with score ≤ 2
        ...

    def ai_assist_axis(
        self,
        project_id: UUID,
        axis_id: str,             # e.g. "problem_solution_fit"
        proposal_text: str
    ) -> AxisScoringSuggestion:
        # Calls LLM with:
        # - Full rubric for the axis (from knowledge base)
        # - Project proposal text
        # Returns: suggested score + reasoning + questions to answer
        ...
```

### `PersonnelProfileService` (`services/personnel_profile.py`)
Manages developer profiles (Mode 2):

```python
class PersonnelProfileService:
    def get_profile(self, personnel_id: UUID) -> PersonnelProfile:
        ...

    def refresh_profile(
        self,
        personnel_id: UUID,
        github_repos: list[str],
        date_from: date,
        date_to: date
    ) -> PersonnelProfile:
        # 1. Collect GitHub data via gh CLI wrapper
        # 2. Extract behavioral signals (quantitative)
        # 3. Build NLP corpus (PR bodies, review comments, issues)
        # 4. Call LLM for OCEAN inference + quality signals
        # 5. Compute 5-layer profile scores
        # 6. Compute WFU factors
        # 7. Generate flags
        # 8. Persist to personnel_profiles
        ...

    def compute_wfu_factors(self, profile: PersonnelProfile, project: Project) -> WFUFactors:
        # project_familiarity_factor: based on project_tenure months in similar repos
        # technology_match_factor: based on tech_capability scores vs project tech_stacks
        # quality_history_factor: based on performance.code_quality score
        # delivery_reliability_factor: based on performance.delivery_reliability score
        ...
```

### `TeamMatchService` (`services/team_match.py`)
Computes project-developer match scores and team composition recommendations:

```python
class TeamMatchService:
    def compute_matches(
        self,
        project_id: UUID,
        evaluation: ProjectEvaluation,
        available_personnel: list[Personnel]
    ) -> list[PersonnelMatch]:
        # For each personnel with a profile:
        # 1. Build project_requirements_vector from evaluation (required skills, tech axes)
        # 2. Build developer_profile_vector from personnel_profile
        # 3. match_score = cosine_similarity(profile_vector, requirements_vector)
        # 4. skill_coverage = coverage of project tech_stacks by developer skill matrix
        # 5. ocean_fit = personality fit for this project type
        # 6. growth_opportunity = would this project expand their weakest dimensions?
        # 7. effective_wfu = compute_wfu_factors for this project
        ...

    def recommend_teams(
        self,
        matches: list[PersonnelMatch],
        project: Project,
        n_recommendations: int = 3
    ) -> list[TeamConfiguration]:
        # Greedy + local search to find top N team configs that:
        # - Cover all required skills (minimum viable)
        # - Maximize skill_coverage_score
        # - Respect budget constraints (if set)
        # - Balance OCEAN profiles (not all introverts, not all high-E)
        # Returns top N configs sorted by composite team score
        ...
```

### `ProjectAnalysisService` (`services/project_analysis.py`)
- **Input:** raw project proposal text + personnel list + org context
- **Action:** Calls LLM với structured prompt → parse JSON response
- **Output:** List of draft tasks với effort estimates
- **COCOMO II integration:** sau khi LLM suggests tasks, COCOMO II validates/adjusts effort

### `CocomoService` (`algorithms/cocomo.py`)
Implements **COCOMO II Post-Architecture model**:
```python
# Core formula: PM = A × Size^E × ∏EM
# PM = person-months
# Size = KSLOC hoặc Function Points converted
# E = scaling exponent (từ scale factors)
# EM = effort multipliers

class CocomoService:
    def estimate_effort(self, size_points: float, scale_factors: dict, effort_multipliers: dict) -> float: ...
    def to_man_days(self, person_months: float) -> float: ...
    def breakdown_by_phase(self, total_days: float) -> EffortBreakdown: ...
        # investigate: 10%, design: 20%, implement: 40%, test: 20%, review: 10%
```

### `WarningEngine` (`warnings/engine.py`)
Recomputes tất cả warnings khi state thay đổi:
```python
class WarningEngine:
    def compute_all(self, scenario_id: UUID) -> list[Warning]: ...
    def check_capacity(self, personnel_id: UUID, date: date) -> Warning | None: ...
    def check_junior_alone(self, task: Task) -> Warning | None: ...
    def check_time_risk(self, scenario: Scenario) -> list[Warning]: ...
    def check_language_barrier(self, task: Task, assignments: list[Assignment]) -> Warning | None:
        # For each assignment: if task.required_languages not in personnel.languages → warning
        ...
    def check_budget(self, scenario: Scenario) -> Warning | None: ...
    def check_license(self, project: Project) -> list[Warning]:
        # For each tool: if tool_seat_assignments.count > project_tool_licenses.total_seats → warning
        ...
    def check_dependency_risk(self, tasks: list[Task]) -> list[Warning]: ...
    def check_skill_mismatch(self, task: Task, assignments: list[Assignment]) -> Warning | None: ...
```

### `GeneticOptimizer` (`algorithms/genetic.py`)
```python
class GeneticOptimizer:
    # Chromosome: ma trận (task × personnel) với allocation percentages
    # Fitness function: makespan (tổng thời gian) hoặc total cost
    # Constraints: capacity <= 7h/day, junior_rule, dependency_order

    def optimize(
        self,
        scenario_id: UUID,
        mode: Literal['makespan', 'budget'],
        population_size: int = 100,
        generations: int = 500
    ) -> list[OptimizationSolution]: ...
```

### `LLMService` (`llm/service.py`)
```python
class LLMService:
    def analyze_project(self, proposal: str, context: ProjectContext) -> list[TaskDraft]: ...
    def analyze_risks(self, scenario: ScenarioContext) -> list[Risk]: ...
    def suggest_task_split(self, task: Task, reason: str) -> list[TaskDraft]: ...
    def free_prompt(self, prompt: str, context: ScenarioContext) -> str: ...
```
- Sử dụng `anthropic` SDK (Claude) hoặc `openai` SDK theo config
- Tất cả interactions được log vào `llm_sessions` table

### `CriticalPathService` (`services/critical_path.py`)
- Implements **CPM (Critical Path Method)**
- Input: DAG của tasks với durations và dependencies
- Output: critical path tasks (longest path), float values, early/late start-finish

### `EarnedValueService` (`services/earned_value.py`)
- Tính SPI, CPI, EAC, ETC từ progress logs
- Dự báo ngày hoàn thành thực tế
- Trigger warnings khi EAC > deadline

### `CompletionProbabilityService` (`algorithms/completion_probability.py`)
Tính P(on_time) từ SPI variance + risk factors + critical path slack:
```python
class CompletionProbabilityService:
    def compute(self, scenario_id: UUID) -> CompletionProbabilityResult:
        # 1. Get current SPI from EarnedValueService
        # 2. Get SPI variance from last 7 days of progress logs
        # 3. Count active risk factors (warnings) with weights:
        #      CAPACITY: -0.15, LANGUAGE_BARRIER: -0.10,
        #      SKILL_MISMATCH: -0.08, JUNIOR_ALONE: -0.12
        # 4. Get critical path float (slack days)
        # 5. Apply formula:
        #      base_prob = spi_to_probability(spi, variance)
        #      risk_penalty = sum(risk_weights)
        #      p_on_time = max(0, min(1, base_prob - risk_penalty + slack_bonus))
        # 6. Compute EAC date and days_delta (positive = ahead)
        # 7. Save snapshot to scenario_completion_snapshots
        ...

class CompletionProbabilityResult(BaseModel):
    p_on_time: float           # 0.0–1.0
    eac_date: date
    days_delta: float          # positive = ahead of deadline, negative = behind
    confidence_level: Literal["on_track", "at_risk", "critical"]
    contributing_factors: list[str]   # human-readable risk factors
```

### `VelocityCalibrationService` (`services/velocity_calibration.py`)
Cập nhật `personnel.velocity_baseline` sau mỗi dự án hoàn thành:
```python
class VelocityCalibrationService:
    def update_baseline(self, personnel_id: UUID, project_id: UUID) -> None:
        # Compute: actual_wfu = actual_hours / planned_hours for this project
        # Update: velocity_baseline = 0.7 × old_baseline + 0.3 × actual_wfu (EMA)
        # This baseline is used in future COCOMO estimates for this person
```

### `XPCalculationService` (`services/xp.py`)
```python
class XPCalculationService:
    def calculate_for_project(self, project_id: UUID) -> list[XPEvent]:
        # Foreach member:
        # - Base XP per task completed
        # - Bonus: early delivery, new skill, quality
        # - Level up check in skill matrix
```

---

## Background Jobs

| Job | Trigger | Description |
|-----|---------|-------------|
| `optimize_scenario` | POST /scenarios/{id}/optimize | Genetic algorithm — Celery task |
| `recompute_warnings` | After any assignment/task change | Fast sync computation |
| `analyze_project` | POST /projects/{id}/analyze | LLM call — Celery task |
| `recalculate_ev` | After progress log | EV metrics recomputation |

Background jobs dùng **Celery + Redis** (hoặc `asyncio` background tasks nếu đơn giản hơn cho MVP).

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

1. **Junior alone rule:** `task.assignments` không được có `senior=false` cho tất cả assignees trên task `priority=critical` hoặc `priority=high`
2. **Capacity check:** Tổng `effective_wfu × allocation_pct` của 1 person trong 1 ngày ≤ `daily_capacity_hours` (7h)
3. **Non-linear scaling:** Khi thêm người vào task đã có người, effort không giảm tuyến tính. Áp dụng **Brooks' Law factor**: thêm người khi task >50% complete làm chậm hơn
4. **Snapshot immutability:** Scenario với `is_snapshot=true` → reject tất cả PATCH/DELETE requests, trả 403
5. **Dependency order:** Khi tính schedule, tasks phải được sắp xếp theo topological order của dependency DAG

---

## Configuration (`app/config.py`)

```python
class Settings(BaseSettings):
    database_url: str
    redis_url: str = "redis://localhost:6379"
    secret_key: str

    # LLM
    anthropic_api_key: str | None = None
    openai_api_key: str | None = None
    llm_provider: Literal['anthropic', 'openai'] = 'anthropic'
    llm_model: str = 'claude-sonnet-4-6'

    # COCOMO
    cocomo_a: float = 2.94         # COCOMO II constant
    cocomo_b: float = 0.91         # Scaling exponent base

    # Optimizer
    ga_population: int = 100
    ga_generations: int = 500

    model_config = {"env_file": ".env"}
```

---

## Error Handling

Tất cả errors return structured JSON:
```json
{
  "error": "CAPACITY_EXCEEDED",
  "message": "Assigning this task would give Nguyen Van A 9.5h/day",
  "detail": { "personnel_id": "...", "current_hours": 9.5, "limit": 7.0 }
}
```

HTTP status codes:
- `400` — Business rule violation
- `403` — Forbidden (snapshot immutability, permission)
- `404` — Resource not found
- `409` — Conflict (e.g., circular dependency)
- `422` — Validation error (Pydantic)
- `503` — LLM service unavailable
