"""ORM models for tracking and audit: TaskProgressLog, ProjectWarning, XPEvent, LLMSession."""

import uuid
from datetime import date, datetime
from typing import Any

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.db.base import Base, CreatedAtMixin, UUIDPrimaryKeyMixin

# ---------------------------------------------------------------------------
# Enum value constants
# ---------------------------------------------------------------------------
WARNING_TYPES = (
    "capacity",
    "junior_alone",
    "time_risk",
    "language_barrier",
    "budget",
    "license",
    "skill_mismatch",
    "dependency",
)
WARNING_SEVERITIES = ("critical", "warning", "info")
XP_REASONS = ("task_completed", "early_delivery", "new_skill", "quality_bonus", "mentoring")
LLM_SESSION_TYPES = ("task_generation", "risk_analysis", "optimization_prompt", "general")

_warning_type_enum = sa.Enum(*WARNING_TYPES, name="warning_type", native_enum=False, length=20)
_warning_severity_enum = sa.Enum(
    *WARNING_SEVERITIES, name="warning_severity", native_enum=False, length=10
)
_xp_reason_enum = sa.Enum(*XP_REASONS, name="xp_reason", native_enum=False, length=20)
_llm_session_type_enum = sa.Enum(
    *LLM_SESSION_TYPES, name="llm_session_type", native_enum=False, length=25
)

_DEFAULT_IS_ACKNOWLEDGED = False


class TaskProgressLog(UUIDPrimaryKeyMixin, CreatedAtMixin, Base):
    __tablename__ = "task_progress_logs"

    __table_args__ = (sa.Index("idx_progress_task_date", "task_id", "log_date"),)

    task_id: Mapped[uuid.UUID] = mapped_column(
        sa.Uuid(as_uuid=True),
        sa.ForeignKey("tasks.id", ondelete="CASCADE"),
        nullable=False,
    )
    personnel_id: Mapped[uuid.UUID] = mapped_column(
        sa.Uuid(as_uuid=True),
        sa.ForeignKey("personnel.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    log_date: Mapped[date] = mapped_column(sa.Date, nullable=False)
    completion_pct: Mapped[float] = mapped_column(sa.Numeric(5, 2), nullable=False)
    notes: Mapped[str | None] = mapped_column(sa.Text, nullable=True)
    hours_spent: Mapped[float] = mapped_column(sa.Numeric(4, 1), nullable=False)


class ProjectWarning(UUIDPrimaryKeyMixin, CreatedAtMixin, Base):
    __tablename__ = "project_warnings"

    __table_args__ = (sa.Index("idx_warnings_scenario", "scenario_id", "is_acknowledged"),)

    scenario_id: Mapped[uuid.UUID] = mapped_column(
        sa.Uuid(as_uuid=True),
        sa.ForeignKey("scenarios.id", ondelete="CASCADE"),
        nullable=False,
    )
    warning_type: Mapped[str] = mapped_column(_warning_type_enum, nullable=False)
    severity: Mapped[str] = mapped_column(_warning_severity_enum, nullable=False)
    entity_type: Mapped[str] = mapped_column(sa.String(50), nullable=False)
    entity_id: Mapped[uuid.UUID] = mapped_column(sa.Uuid(as_uuid=True), nullable=False)
    message: Mapped[str] = mapped_column(sa.Text, nullable=False)
    data: Mapped[dict[str, Any]] = mapped_column(sa.JSON, nullable=False)
    is_acknowledged: Mapped[bool] = mapped_column(
        sa.Boolean, nullable=False, default=_DEFAULT_IS_ACKNOWLEDGED
    )
    resolved_at: Mapped[datetime | None] = mapped_column(sa.DateTime(timezone=True), nullable=True)


class XPEvent(UUIDPrimaryKeyMixin, CreatedAtMixin, Base):
    __tablename__ = "xp_events"

    personnel_id: Mapped[uuid.UUID] = mapped_column(
        sa.Uuid(as_uuid=True),
        sa.ForeignKey("personnel.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    project_id: Mapped[uuid.UUID] = mapped_column(
        sa.Uuid(as_uuid=True),
        sa.ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    skill_name: Mapped[str | None] = mapped_column(sa.String(100), nullable=True)
    xp_amount: Mapped[int] = mapped_column(sa.Integer, nullable=False)
    reason: Mapped[str] = mapped_column(_xp_reason_enum, nullable=False)
    description: Mapped[str | None] = mapped_column(sa.Text, nullable=True)


class LLMSession(UUIDPrimaryKeyMixin, CreatedAtMixin, Base):
    """Audit log for all LLM CLI interactions (claude / codex subprocess calls)."""

    __tablename__ = "llm_sessions"

    project_id: Mapped[uuid.UUID | None] = mapped_column(
        sa.Uuid(as_uuid=True),
        sa.ForeignKey("projects.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    scenario_id: Mapped[uuid.UUID | None] = mapped_column(
        sa.Uuid(as_uuid=True),
        sa.ForeignKey("scenarios.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    session_type: Mapped[str] = mapped_column(_llm_session_type_enum, nullable=False)
    prompt: Mapped[str] = mapped_column(sa.Text, nullable=False)
    response: Mapped[str] = mapped_column(sa.Text, nullable=False)
    model_used: Mapped[str] = mapped_column(sa.String(100), nullable=False)
    created_by: Mapped[uuid.UUID] = mapped_column(
        sa.Uuid(as_uuid=True),
        sa.ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
    )
