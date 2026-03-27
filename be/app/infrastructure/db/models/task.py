"""ORM models for the task domain: Task, TaskDependency.

Note: effort_total_days is a plain column, not a DB-generated column.
SQLite does not support generated columns. The application layer is
responsible for keeping it in sync with the six phase effort columns.
"""

import uuid
from datetime import date
from typing import Any

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.db.base import Base, CreatedAtMixin, UUIDPrimaryKeyMixin

# ---------------------------------------------------------------------------
# Enum value constants
# ---------------------------------------------------------------------------
TASK_CATEGORIES = ("backend", "frontend", "devops", "qa", "research", "design", "pm")
TASK_STATUSES = ("draft", "todo", "in_progress", "review", "done", "blocked")
TASK_PRIORITIES = ("critical", "high", "medium", "low")
DEPENDENCY_TYPES = ("finish_to_start", "start_to_start", "finish_to_finish")

_task_category_enum = sa.Enum(*TASK_CATEGORIES, name="task_category", native_enum=False, length=15)
_task_status_enum = sa.Enum(*TASK_STATUSES, name="task_status", native_enum=False, length=15)
_task_priority_enum = sa.Enum(*TASK_PRIORITIES, name="task_priority", native_enum=False, length=10)
_dependency_type_enum = sa.Enum(
    *DEPENDENCY_TYPES, name="dependency_type", native_enum=False, length=20
)

_DEFAULT_EFFORT_DAYS = 0
_DEFAULT_LAG_DAYS = 0


class Task(UUIDPrimaryKeyMixin, CreatedAtMixin, Base):
    __tablename__ = "tasks"

    __table_args__ = (sa.Index("idx_tasks_scenario", "scenario_id"),)

    scenario_id: Mapped[uuid.UUID] = mapped_column(
        sa.Uuid(as_uuid=True),
        sa.ForeignKey("scenarios.id", ondelete="CASCADE"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(sa.String(300), nullable=False)
    description: Mapped[str] = mapped_column(sa.Text, nullable=False)
    category: Mapped[str] = mapped_column(_task_category_enum, nullable=False)
    status: Mapped[str] = mapped_column(_task_status_enum, nullable=False)
    priority: Mapped[str] = mapped_column(_task_priority_enum, nullable=False)
    tech_stacks: Mapped[list[Any]] = mapped_column(sa.JSON, nullable=False)
    required_languages: Mapped[list[Any]] = mapped_column(sa.JSON, nullable=False, default=list)

    effort_investigate_days: Mapped[float] = mapped_column(
        sa.Numeric(6, 2), nullable=False, default=_DEFAULT_EFFORT_DAYS
    )
    effort_design_days: Mapped[float] = mapped_column(
        sa.Numeric(6, 2), nullable=False, default=_DEFAULT_EFFORT_DAYS
    )
    effort_implement_days: Mapped[float] = mapped_column(
        sa.Numeric(6, 2), nullable=False, default=_DEFAULT_EFFORT_DAYS
    )
    effort_testing_days: Mapped[float] = mapped_column(
        sa.Numeric(6, 2), nullable=False, default=_DEFAULT_EFFORT_DAYS
    )
    effort_review_days: Mapped[float] = mapped_column(
        sa.Numeric(6, 2), nullable=False, default=_DEFAULT_EFFORT_DAYS
    )
    effort_support_days: Mapped[float] = mapped_column(
        sa.Numeric(6, 2), nullable=False, default=_DEFAULT_EFFORT_DAYS
    )
    # App-managed sum of the six phase columns — see module docstring.
    effort_total_days: Mapped[float] = mapped_column(
        sa.Numeric(6, 2), nullable=False, default=_DEFAULT_EFFORT_DAYS
    )

    planned_start: Mapped[date | None] = mapped_column(sa.Date, nullable=True)
    planned_end: Mapped[date | None] = mapped_column(sa.Date, nullable=True)
    actual_start: Mapped[date | None] = mapped_column(sa.Date, nullable=True)
    actual_end: Mapped[date | None] = mapped_column(sa.Date, nullable=True)
    cocomo_size_points: Mapped[float | None] = mapped_column(sa.Numeric(10, 2), nullable=True)
    position_x: Mapped[float] = mapped_column(sa.Numeric(8, 2), nullable=False, default=0)
    position_z: Mapped[float] = mapped_column(sa.Numeric(8, 2), nullable=False, default=0)
    llm_analysis: Mapped[dict[str, Any] | None] = mapped_column(sa.JSON, nullable=True)


class TaskDependency(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "task_dependencies"

    __table_args__ = (
        sa.CheckConstraint(
            "task_id != depends_on_task_id",
            name="no_self_dependency",
        ),
    )

    task_id: Mapped[uuid.UUID] = mapped_column(
        sa.Uuid(as_uuid=True),
        sa.ForeignKey("tasks.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    depends_on_task_id: Mapped[uuid.UUID] = mapped_column(
        sa.Uuid(as_uuid=True),
        sa.ForeignKey("tasks.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    dependency_type: Mapped[str] = mapped_column(
        _dependency_type_enum, nullable=False, default="finish_to_start"
    )
    lag_days: Mapped[float] = mapped_column(
        sa.Numeric(4, 1), nullable=False, default=_DEFAULT_LAG_DAYS
    )
