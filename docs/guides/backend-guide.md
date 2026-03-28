# Backend Guide

Stack: **Python 3.12 · FastAPI · Pydantic v2 · SQLite (dev) · uv · Ruff · Mypy**

> SQLite is the current database. The settings default (`sqlite+aiosqlite:///./dev.db`) is intentional.
> Schema migrations use Alembic. Switching to PostgreSQL later requires only changing `DATABASE_URL`.

---

## Design Manifesto

Every line of backend code must answer to four principles. They are not optional style preferences — they are the architecture.

---

### DDD — Domain-Driven Design

The business rules of this application (WFU calculation, COCOMO estimation, genetic optimization, warning logic) are the most valuable and most complex part of the codebase. They must not be buried inside FastAPI route handlers or tangled with SQLAlchemy. DDD enforces a hard wall between *what the system does* and *how it does it*.

**Four layers, strictly enforced:**

```
┌─────────────────────────────────────────────┐
│  interfaces/       HTTP only. No logic.      │  ← FastAPI routers, Pydantic schemas
├─────────────────────────────────────────────┤
│  application/      Orchestration only.       │  ← Use cases, transaction boundaries
├─────────────────────────────────────────────┤
│  domain/           Pure business rules.      │  ← Entities, value objects, domain services
│                    Zero framework imports.   │     Repository interfaces (Protocol)
├─────────────────────────────────────────────┤
│  infrastructure/   I/O only.                 │  ← SQLAlchemy, Alembic, LLM clients, HTTP
└─────────────────────────────────────────────┘
```

**The rule:** inner layers never import from outer layers.
`domain/` imports nothing from `application/`, `infrastructure/`, or `interfaces/`.

**In practice — where does each concept live?**

| Concept | Layer | Example |
|---------|-------|---------|
| WFU multiplier calculation | `domain/` | `PersonnelDomain.compute_wfu()` |
| COCOMO II formula | `domain/` | `CocomoEngine.estimate_effort()` |
| Genetic algorithm | `domain/` | `OptimizerDomain.evolve()` |
| "Assign member to task" use case | `application/` | `AssignmentUseCase.assign()` |
| Repository interface | `domain/` | `class IScenarioRepository(Protocol)` |
| SQLAlchemy query | `infrastructure/` | `SqlScenarioRepository.get_by_id()` |
| FastAPI route handler | `interfaces/` | `POST /scenarios/{id}/assign` |
| Pydantic request/response | `interfaces/` | `AssignmentRequest`, `AssignmentResponse` |

---

### SOLID

**S — Single Responsibility**
One class or function, one reason to change.
- `CocomoEngine` only computes estimates. It does not validate HTTP input, it does not write to the DB.
- A FastAPI router only translates HTTP ↔ Python. It does not contain `if` branches for business logic.

**O — Open/Closed**
Extend behavior by adding new code, not by editing existing code.
- Add a new warning type by creating a new `WarningRule` subclass, not by adding an `elif` to an existing warning engine.
- Add a new optimization objective by implementing a new `FitnessFunction` — the GA loop does not change.

**L — Liskov Substitution**
Concrete implementations must be drop-in replacements for their interface.
- `SqlScenarioRepository` and `InMemoryScenarioRepository` (for tests) both implement `IScenarioRepository`. Any application service works with either without knowing which it has.

**I — Interface Segregation**
Prefer small, focused `Protocol` classes over large base classes.

```python
# Good — focused protocols
class IScenarioReader(Protocol):
    def get_by_id(self, scenario_id: int) -> Scenario: ...

class IScenarioWriter(Protocol):
    def save(self, scenario: Scenario) -> None: ...

# Bad — one fat interface forces all implementations to know everything
class IScenarioRepository(Protocol):
    def get_by_id(...): ...
    def save(...): ...
    def delete(...): ...
    def list_by_project(...): ...
    def snapshot(...): ...
```

Split only when a consumer genuinely needs just a subset. Don't split prematurely.

**D — Dependency Inversion**
Application services depend on abstractions, not on SQLAlchemy or any concrete class.

```python
# domain/scenario/repositories.py
from typing import Protocol
from app.domain.scenario.entities import Scenario

class IScenarioRepository(Protocol):
    def get_by_id(self, scenario_id: int) -> Scenario | None: ...
    def save(self, scenario: Scenario) -> None: ...


# application/scenario/use_cases.py
from app.domain.scenario.repositories import IScenarioRepository

class AssignmentUseCase:
    def __init__(self, scenarios: IScenarioRepository) -> None:
        self._scenarios = scenarios  # could be SQL, in-memory, anything

    def assign(self, scenario_id: int, member_id: int, task_id: int) -> None:
        scenario = self._scenarios.get_by_id(scenario_id)
        ...
        self._scenarios.save(scenario)
```

Concrete implementations live in `infrastructure/` and are wired in `app/dependencies.py` via FastAPI `Depends()`.

---

### DRY — Don't Repeat Yourself

- **Shared domain logic** goes in `app/domain/shared/` (e.g., `WfuCalculator`, `CapacityChecker`) and is imported by any domain service that needs it. Never copy-paste business rules between domains.
- **Shared Pydantic fields** (e.g., `created_at`, `updated_at`, `org_id`) go in `app/interfaces/schemas/base.py` as a `BaseResponse` class.
- **Shared SQLAlchemy columns** (timestamps, soft-delete) go in `app/infrastructure/db/base.py` as a `TimestampMixin`.
- If you find yourself writing the same validation logic twice in two different services, it belongs in the domain layer.

---

### No Magic Numbers

Every literal that carries business meaning must be a named constant. Unnamed numbers make code unreadable and create drift when a value needs to change.

**In regular classes** — use class-level attributes:

```python
class CocomoEngine:
    _SF_EXPONENT_SCALE: float = 0.01   # E = B + _SF_EXPONENT_SCALE * sum(SF_i)
    _EM_NEUTRAL_PRODUCT: float = 1.0   # multiplicative identity when no EMs given
    _PM_PRECISION: int = 4             # decimal places for person-months output
    _DAYS_PRECISION: int = 2           # decimal places for man-days output
```

**In dataclasses** — use `ClassVar` for constants used inside methods:

```python
from typing import ClassVar

@dataclass(frozen=True)
class PhaseRatios:
    _REQUIRED_SUM: ClassVar[float] = 1.0
    _SUM_TOLERANCE: ClassVar[float] = 1e-9
    _MIN_RATIO: ClassVar[float] = 0.0
    ...
    def __post_init__(self) -> None:
        if abs(total - self._REQUIRED_SUM) > self._SUM_TOLERANCE:
            raise ValueError(...)
```

**Module-level constants** for dataclass `field()` defaults (because `ClassVar` cannot be referenced inside `field(default=...)` — the class body isn't fully defined yet):

```python
# Module level — used as field defaults below
_COCOMO_A: float = 2.94
_COCOMO_B: float = 0.91

@dataclass(frozen=True)
class EstimationConfig:
    a: float = field(default=_COCOMO_A)  # references module constant, not a literal
    b: float = field(default=_COCOMO_B)
```

**System-wide constants** belong in `config/default.yaml` (see Configuration section). Python constants in domain classes are the absolute fallback; at runtime, the YAML value takes precedence.

---

## Configuration

All system-wide constants live in `config/default.yaml`. Python config classes define **shape only** — no duplicated defaults.

**Load order (highest priority wins):**
```
1. Environment variables     COCOMO__A=3.1
2. config/local.yaml         gitignored — local dev overrides
3. config/default.yaml       committed — single source of truth
```

Nested keys use `__` as the env-var separator: `cocomo.a` → `COCOMO__A`.

**Two categories of configurable values:**

| Category | Where | Examples |
|----------|-------|---------|
| System constants | `config/default.yaml` | COCOMO A/B, working days/month, GA params, LLM model |
| Per-org / per-project values | Database (JSONB columns) | Phase ratios — a research project has a very different breakdown than a pure dev sprint |

**Config class shape (`app/config.py`):**

```python
class CocomoSettings(BaseModel):
    # Shape only — no defaults. Values come from config/default.yaml.
    # Missing key = startup fails with a clear ValidationError.
    a: float
    b: float
    working_days_per_month: float

class LLMSettings(BaseModel):
    # LLM ops run via CLI subprocess (claude / codex) — no API keys stored here.
    # Authenticate once with: `claude auth login` or `codex auth`
    cli_tool: Literal["claude", "codex"]
    model: str  # Passed as --model flag when supported by the CLI

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        yaml_file=["config/default.yaml", "config/local.yaml"],
        yaml_file_encoding="utf-8",
        env_nested_delimiter="__",
    )
    database_url: str
    secret_key: str
    debug: bool = False   # safe default for a boolean flag
    cocomo: CocomoSettings
    llm: LLMSettings
    optimizer: OptimizerSettings
```

Only `debug` keeps a Python default (safe boolean fallback). Everything else is required and must exist in the YAML.

**`config/default.yaml` example:**

```yaml
database_url: "sqlite+aiosqlite:///./dev.db"
secret_key: "change-me"

cocomo:
  a: 2.94
  b: 0.91
  working_days_per_month: 21.67

llm:
  cli_tool: "claude"          # "claude" | "codex"
  model: "claude-sonnet-4-6"  # Passed via --model flag

optimizer:
  population: 100
  generations: 500
```

---

## Project Structure

```
be/
├── config/
│   ├── default.yaml               # All system constants — committed, single source of truth
│   └── local.yaml                 # Local dev overrides — gitignored
│
├── app/
│   ├── main.py                    # FastAPI app, router registration
│   ├── config.py                  # Settings shape (pydantic-settings + YAML source)
│   ├── dependencies.py            # FastAPI Depends() wiring — DI root
│   │
│   ├── domain/                    # Pure business rules — zero framework imports
│   │   ├── shared/
│   │   │   ├── value_objects.py   # WfuFactor, Capacity, shared primitives
│   │   │   └── exceptions.py      # Domain exceptions (not HTTP exceptions)
│   │   ├── estimation/
│   │   │   ├── value_objects.py   # PersonMonths, ManDays, PhaseRatios, EstimationConfig, EffortBreakdown
│   │   │   └── cocomo.py          # CocomoEngine — COCOMO II Post-Architecture model
│   │   ├── personnel/
│   │   │   ├── entities.py
│   │   │   ├── services.py        # WFU computation, seniority rules
│   │   │   └── repositories.py    # IPersonnelRepository (Protocol)
│   │   ├── scenario/
│   │   │   ├── entities.py
│   │   │   ├── services.py        # Assignment rules, capacity checks
│   │   │   └── repositories.py
│   │   └── optimization/
│   │       └── genetic.py         # Genetic algorithm (pure, no I/O)
│   │
│   ├── application/               # Use cases — orchestrates domain + repos
│   │   ├── scenario/
│   │   │   ├── assign_member.py
│   │   │   └── snapshot.py
│   │   ├── estimation/
│   │   │   └── analyze_project.py
│   │   └── optimization/
│   │       └── run_optimizer.py
│   │
│   ├── infrastructure/            # All I/O
│   │   ├── db/
│   │   │   ├── session.py         # SQLite session factory (AsyncSession)
│   │   │   ├── base.py            # TimestampMixin, soft-delete mixin
│   │   │   ├── models/            # SQLAlchemy ORM models (one file per domain)
│   │   │   │   └── <domain>.py
│   │   │   └── repositories/      # Concrete repo implementations
│   │   │       └── <domain>.py
│   │   ├── llm/
│   │   │   └── client.py          # CLI subprocess wrapper (claude / codex)
│   │   └── db/migrations/         # Alembic env + versions
│   │
│   └── interfaces/                # HTTP interface — no business logic
│       ├── routers/               # FastAPI route handlers
│       │   └── <domain>.py
│       └── schemas/               # Pydantic request/response models
│           ├── base.py            # BaseResponse, shared fields
│           └── <domain>.py
│
├── tests/
│   ├── conftest.py                # InMemory repo fixtures, async client
│   ├── domain/                    # Pure unit tests — no DB, no HTTP
│   │   └── test_cocomo.py
│   ├── application/               # Use case tests with in-memory repos
│   │   └── test_assign_member.py
│   ├── infrastructure/            # DB smoke tests — sync SQLite in-memory
│   │   └── test_db_schema.py
│   └── interfaces/                # Integration tests against ASGI
│       └── test_scenario_api.py
│
├── .python-version                # 3.12
└── pyproject.toml
```

---

## Adding a New Domain

Follow this order — inner layers first, outer layers last.

### 1. Domain entity (`app/domain/<domain>/entities.py`)

```python
from dataclasses import dataclass
from app.domain.shared.value_objects import ManDays


@dataclass
class Task:
    id: int
    name: str
    estimated_days: ManDays
    is_confirmed: bool = False

    def confirm(self) -> None:
        if self.estimated_days.value <= 0:
            raise ValueError("Cannot confirm a task with zero estimate")
        self.is_confirmed = True
```

### 2. Repository interface (`app/domain/<domain>/repositories.py`)

```python
from typing import Protocol
from app.domain.task.entities import Task


class ITaskRepository(Protocol):
    def get_by_id(self, task_id: int) -> Task | None: ...
    def list_by_scenario(self, scenario_id: int) -> list[Task]: ...
    def save(self, task: Task) -> None: ...
```

### 3. Application use case (`app/application/<domain>/<use_case>.py`)

```python
from app.domain.task.entities import Task
from app.domain.task.repositories import ITaskRepository


class ConfirmTaskUseCase:
    def __init__(self, tasks: ITaskRepository) -> None:
        self._tasks = tasks

    def execute(self, task_id: int) -> Task:
        task = self._tasks.get_by_id(task_id)
        if task is None:
            raise ValueError(f"Task {task_id} not found")
        task.confirm()
        self._tasks.save(task)
        return task
```

### 4. Infrastructure: ORM model (`app/infrastructure/db/models/<domain>.py`)

Mixin order matters for Python MRO: mixins before `Base`, most specific first.

```python
import uuid
from typing import Any

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.db.base import Base, CreatedAtMixin, UUIDPrimaryKeyMixin

# Enum values as module-level constants — avoids magic strings in application code.
TASK_STATUSES = ("draft", "todo", "in_progress", "review", "done", "blocked")

_task_status_enum = sa.Enum(*TASK_STATUSES, name="task_status", native_enum=False, length=15)

# Column defaults as named constants — no magic numbers.
_DEFAULT_EFFORT_DAYS = 0


class TaskModel(UUIDPrimaryKeyMixin, CreatedAtMixin, Base):
    __tablename__ = "tasks"

    __table_args__ = (
        sa.Index("idx_tasks_scenario", "scenario_id"),
        sa.CheckConstraint("effort_days >= 0", name="valid_effort_days"),
    )

    scenario_id: Mapped[uuid.UUID] = mapped_column(
        sa.Uuid(as_uuid=True),
        sa.ForeignKey("scenarios.id", ondelete="CASCADE"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(sa.String(300), nullable=False)
    status: Mapped[str] = mapped_column(_task_status_enum, nullable=False)
    effort_days: Mapped[float] = mapped_column(
        sa.Numeric(6, 2), nullable=False, default=_DEFAULT_EFFORT_DAYS
    )
    # JSON columns must be typed with Any for mypy strict mode.
    tech_stacks: Mapped[list[Any]] = mapped_column(sa.JSON, nullable=False)
    metadata: Mapped[dict[str, Any] | None] = mapped_column(sa.JSON, nullable=True)
```

**Key rules for ORM models:**
- Always `UUIDPrimaryKeyMixin, [TimestampMixin|CreatedAtMixin], Base` — in that order
- Enums: always `native_enum=False` — works in SQLite without `CREATE TYPE`
- JSON columns: `sa.JSON` (not `JSONB`) — SQLAlchemy maps to native JSONB in PostgreSQL automatically
- JSON typed as `dict[str, Any]` / `list[Any]` — required for mypy strict
- Check constraints and indexes in `__table_args__` with explicit `name=` — required for Alembic downgrade
- All model files imported in `models/__init__.py` — required for Alembic autogenerate discovery

### 5. Infrastructure: concrete repository (`app/infrastructure/db/repositories/<domain>.py`)

```python
from sqlalchemy.ext.asyncio import AsyncSession
from app.domain.task.entities import Task
from app.domain.task.repositories import ITaskRepository
from app.domain.shared.value_objects import ManDays
from app.infrastructure.db.models.task import TaskModel


class SqlTaskRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, task_id: int) -> Task | None:
        model = await self._session.get(TaskModel, task_id)
        return self._to_entity(model) if model else None

    async def save(self, task: Task) -> None:
        model = await self._session.get(TaskModel, task.id)
        if model:
            model.is_confirmed = task.is_confirmed
        else:
            self._session.add(TaskModel(...))

    @staticmethod
    def _to_entity(model: TaskModel) -> Task:
        return Task(
            id=model.id,
            name=model.name,
            estimated_days=ManDays(model.estimated_days),
            is_confirmed=model.is_confirmed,
        )
```

### 6. Interface: Pydantic schemas (`app/interfaces/schemas/<domain>.py`)

```python
from pydantic import BaseModel
from app.interfaces.schemas.base import BaseResponse


class TaskConfirmResponse(BaseResponse):
    id: int
    name: str
    is_confirmed: bool
```

### 7. Interface: Router (`app/interfaces/routers/<domain>.py`)

```python
from fastapi import APIRouter, Depends
from app.application.task.confirm_task import ConfirmTaskUseCase
from app.interfaces.schemas.task import TaskConfirmResponse
from app.dependencies import get_confirm_task_use_case

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("/{task_id}/confirm", response_model=TaskConfirmResponse, status_code=200)
async def confirm_task(
    task_id: int,
    use_case: ConfirmTaskUseCase = Depends(get_confirm_task_use_case),
) -> TaskConfirmResponse:
    task = await use_case.execute(task_id)
    return TaskConfirmResponse(id=task.id, name=task.name, is_confirmed=task.is_confirmed)
```

### 8. DI wiring (`app/dependencies.py`)

```python
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.db.session import get_session
from app.infrastructure.db.repositories.task import SqlTaskRepository
from app.application.task.confirm_task import ConfirmTaskUseCase


def get_confirm_task_use_case(
    session: AsyncSession = Depends(get_session),
) -> ConfirmTaskUseCase:
    repo = SqlTaskRepository(session)
    return ConfirmTaskUseCase(tasks=repo)
```

### 9. Test (`tests/domain/test_task.py` — no DB, no HTTP)

```python
from app.domain.task.entities import Task
from app.domain.shared.value_objects import ManDays


def test_confirm_task() -> None:
    task = Task(id=1, name="Implement login", estimated_days=ManDays(2.0))
    task.confirm()
    assert task.is_confirmed is True


def test_confirm_task_zero_estimate_raises() -> None:
    task = Task(id=2, name="Empty task", estimated_days=ManDays(0))
    with pytest.raises(ValueError):
        task.confirm()
```

---

## Alembic — Migration Workflow

Migrations live in `app/infrastructure/db/migrations/`. The env is configured for SQLite (sync URL adapter strips `+aiosqlite`) with `render_as_batch=True` for ALTER TABLE support.

**Daily commands:**

```bash
# Apply all pending migrations
uv run alembic upgrade head

# Roll back one migration
uv run alembic downgrade -1

# Generate a new migration from ORM model changes
uv run alembic revision --autogenerate -m "add task priority column"

# Show current migration state
uv run alembic current
```

**Before running autogenerate** — all models must be imported in `models/__init__.py`. Alembic discovers tables by inspecting `Base.metadata`, which is only populated after models are imported. A model not in `__init__.py` is invisible to autogenerate.

**SQLite-specific rules:**

| Situation | Rule |
|-----------|------|
| Enum columns | `native_enum=False, length=N` — no `CREATE TYPE` step |
| Async driver | `env.py` strips `+aiosqlite` → sync engine for Alembic runner |
| ALTER TABLE | `render_as_batch=True` in `context.configure()` — SQLite doesn't support `ALTER COLUMN` natively |
| Generated columns | Not supported in SQLite — use plain columns managed by the app layer |

**Circular FK pattern** — when two tables reference each other (e.g., `projects ↔ scenarios`):

```python
# In the migration upgrade(), after both tables are created:
with op.batch_alter_table('projects', schema=None) as batch_op:
    batch_op.create_foreign_key(
        'fk_projects_active_scenario',   # explicit name — needed for downgrade
        'scenarios', ['active_scenario_id'], ['id'],
        ondelete='SET NULL',
    )

# In downgrade(), before dropping tables:
with op.batch_alter_table('projects', schema=None) as batch_op:
    batch_op.drop_constraint('fk_projects_active_scenario', type_='foreignkey')
```

---

## Hard Rules

| Rule | Why |
|------|-----|
| `domain/` has zero imports from `application/`, `infrastructure/`, or `interfaces/` | Keeps business logic portable and testable without a running server or DB |
| Routers never contain `if`/`for` business logic | Single Responsibility — routers translate, use cases decide |
| Services depend on `Protocol`, never on SQLAlchemy directly | Dependency Inversion — swap SQLite for Postgres without touching use cases |
| No magic numbers — every business literal is a named constant | A number without a name has no meaning; constants make intent explicit and changes safe |
| `config/default.yaml` is the single source of truth for system constants | No duplicated defaults between YAML and Python — one change, one place |
| Config `BaseModel` subclasses define shape only — no Python defaults on constants | Missing YAML key = clear startup error, not silent stale value |
| No `Any`, no `# type: ignore` without a comment explaining why | Mypy strict — type errors are bugs caught at dev time |
| ORM mixins: `UUIDPrimaryKeyMixin, [Timestamp\|CreatedAt]Mixin, Base` in that order | Python MRO — wrong order silently breaks column inheritance |
| All ORM models imported in `models/__init__.py` | Alembic autogenerate only sees tables present in `Base.metadata` |
| Constraints and indexes always have explicit `name=` | Required for `downgrade` to drop them by name |
| `async def` for all route handlers and repo methods | Async first — unblocks I/O under load |
| `uv run ruff format . && uv run ruff check .` before every commit | Ruff replaces black + isort + flake8 |
| Domain logic tested without HTTP/DB fixtures | Fast pure unit tests catch regressions in milliseconds |

---

## Running

```bash
# Dev server with auto-reload
uv run uvicorn app.main:app --reload --port 8000

# Run all tests
uv run pytest

# Type check
uv run mypy app

# Lint + format
uv run ruff check .
uv run ruff format .
```

## Dependency Management

```bash
uv add <package>               # production dependency
uv add --group dev <package>   # dev dependency
uv remove <package>
uv sync --upgrade
```
