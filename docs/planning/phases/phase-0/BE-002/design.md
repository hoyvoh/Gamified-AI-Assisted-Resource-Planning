# Design — BE-002

## Files to Create/Modify

- `be/app/models/__init__.py`
- `be/app/models/org.py` — Organization, User
- `be/app/models/personnel.py` — Personnel, SkillMatrixEntry, ProjectMembership
- `be/app/models/project.py` — Project
- `be/app/models/scenario.py` — Scenario
- `be/app/models/task.py` — Task, TaskDependency
- `be/app/models/assignment.py` — ResourceAssignment
- `be/app/models/tracking.py` — TaskProgressLog, ProjectWarning, XPEvent, LLMSession
- `be/alembic.ini`
- `be/alembic/env.py`
- `be/alembic/versions/001_initial_schema.py`
- `be/pyproject.toml` — add alembic, psycopg2-binary (or asyncpg)
- `be/tests/test_db_schema.py` — smoke tests

## Technical Design

### Base Model

```python
from sqlalchemy.orm import DeclarativeBase
import uuid
from sqlalchemy import UUID

class Base(DeclarativeBase):
    pass

# All PKs use UUID:
id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
```

### Key Relationships

```
Organization 1──* Project
Organization 1──* Personnel
Personnel *──* Project (via ProjectMembership)
Project 1──* Scenario
Scenario 1──* Task
Task *──* Task (via TaskDependency, self-referential)
Task 1──* ResourceAssignment
ResourceAssignment *──1 Personnel
Task 1──* TaskProgressLog
Scenario 1──* ProjectWarning
Personnel 1──* XPEvent
```

### Alembic Setup

```bash
cd be
uv add alembic
uv run alembic init alembic
# configure alembic/env.py to use app.models.Base and Settings.database_url
uv run alembic revision --autogenerate -m "initial schema"
uv run alembic upgrade head
```

## Acceptance Criteria

- [ ] `uv run alembic upgrade head` succeeds on fresh PostgreSQL DB
- [ ] All 12 tables exist with correct columns, types, FK constraints
- [ ] `uv run alembic downgrade -1` then `upgrade head` is idempotent
- [ ] Check constraints enforced: no self-referential task dependency, valid allocation_pct 0-100
- [ ] `uv run pytest tests/test_db_schema.py` — smoke test each table with an insert

## Notes

- Use `UUID` as PK type — avoid integer auto-increment for multi-tenant safety
- For local dev, SQLite is acceptable; for CI and prod, PostgreSQL
- `asyncpg` for async SQLAlchemy; `psycopg2` for sync/Alembic migrations
