"""ORM models for the project domain.

Models: Project, ProjectMembership, ProjectEvaluation,
        ProjectToolLicense, ToolSeatAssignment, ProjectTeamMatch.

Circular FK notes:
  - projects.active_scenario_id → scenarios.id  (nullable; set after scenario creation)
  - projects.evaluation_id → project_evaluations.id  (nullable; set after evaluation creation)
Both FKs are added via Alembic batch_alter_table after both tables exist.
"""

import uuid
from datetime import date, datetime
from typing import Any

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.db.base import Base, CreatedAtMixin, TimestampMixin, UUIDPrimaryKeyMixin

# ---------------------------------------------------------------------------
# Enum value constants
# ---------------------------------------------------------------------------
PROJECT_STATUSES = ("draft", "planning", "execution", "completed", "cancelled")
EVALUATION_STATUSES = ("draft", "complete")
EVALUATION_VERDICTS = ("proceed", "conditional", "do_not_proceed")
EVALUATION_WORKFLOW_STATUSES = ("not_started", "in_progress", "complete", "waived")

_project_status_enum = sa.Enum(
    *PROJECT_STATUSES, name="project_status", native_enum=False, length=20
)
_eval_status_enum = sa.Enum(
    *EVALUATION_STATUSES, name="evaluation_status", native_enum=False, length=10
)
_eval_verdict_enum = sa.Enum(
    *EVALUATION_VERDICTS, name="evaluation_verdict", native_enum=False, length=20
)
_eval_workflow_enum = sa.Enum(
    *EVALUATION_WORKFLOW_STATUSES, name="evaluation_workflow_status", native_enum=False, length=20
)

_DEFAULT_BUDGET_CURRENCY = "USD"
_DEFAULT_EVALUATION_WORKFLOW_STATUS = "not_started"


class Project(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "projects"

    org_id: Mapped[uuid.UUID] = mapped_column(
        sa.Uuid(as_uuid=True),
        sa.ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(sa.String(300), nullable=False)
    description: Mapped[str] = mapped_column(sa.Text, nullable=False)
    status: Mapped[str] = mapped_column(_project_status_enum, nullable=False)
    deadline: Mapped[date] = mapped_column(sa.Date, nullable=False)
    budget_total: Mapped[float | None] = mapped_column(sa.Numeric(15, 2), nullable=True)
    budget_currency: Mapped[str] = mapped_column(
        sa.String(10), nullable=False, default=_DEFAULT_BUDGET_CURRENCY
    )
    # FK to scenarios.id — added post-creation; see circular FK note in module docstring.
    active_scenario_id: Mapped[uuid.UUID | None] = mapped_column(
        sa.Uuid(as_uuid=True), nullable=True
    )
    # Project-level phase ratios override. Null = inherit from org.
    phase_ratios_override: Mapped[dict[str, Any] | None] = mapped_column(sa.JSON, nullable=True)
    raw_proposal: Mapped[str] = mapped_column(sa.Text, nullable=False)
    # FK to project_evaluations.id — added post-creation; see circular FK note.
    evaluation_id: Mapped[uuid.UUID | None] = mapped_column(sa.Uuid(as_uuid=True), nullable=True)
    evaluation_status: Mapped[str] = mapped_column(
        _eval_workflow_enum, nullable=False, default=_DEFAULT_EVALUATION_WORKFLOW_STATUS
    )
    created_by: Mapped[uuid.UUID] = mapped_column(
        sa.Uuid(as_uuid=True),
        sa.ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
    )


class ProjectMembership(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "project_memberships"

    __table_args__ = (
        sa.CheckConstraint(
            "allocation_pct > 0 AND allocation_pct <= 100",
            name="valid_project_membership_allocation",
        ),
    )

    project_id: Mapped[uuid.UUID] = mapped_column(
        sa.Uuid(as_uuid=True),
        sa.ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    personnel_id: Mapped[uuid.UUID] = mapped_column(
        sa.Uuid(as_uuid=True),
        sa.ForeignKey("personnel.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    allocation_pct: Mapped[float] = mapped_column(sa.Numeric(5, 2), nullable=False)
    role_in_project: Mapped[str] = mapped_column(sa.String(100), nullable=False)
    joined_at: Mapped[date] = mapped_column(sa.Date, nullable=False)
    left_at: Mapped[date | None] = mapped_column(sa.Date, nullable=True)


class ProjectEvaluation(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """10-axis Project Analysis result (Pillar 1). One evaluation per project."""

    __tablename__ = "project_evaluations"

    __table_args__ = (sa.UniqueConstraint("project_id", name="uq_project_evaluations_project"),)

    project_id: Mapped[uuid.UUID] = mapped_column(
        sa.Uuid(as_uuid=True),
        sa.ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
    )
    status: Mapped[str] = mapped_column(_eval_status_enum, nullable=False, default="draft")
    verdict: Mapped[str | None] = mapped_column(_eval_verdict_enum, nullable=True)
    composite_score: Mapped[float | None] = mapped_column(sa.Numeric(3, 2), nullable=True)
    axis_scores: Mapped[dict[str, Any]] = mapped_column(sa.JSON, nullable=False)
    telos_breakdown: Mapped[dict[str, Any]] = mapped_column(sa.JSON, nullable=False)
    risk_register: Mapped[list[Any]] = mapped_column(sa.JSON, nullable=False)
    axis_weights: Mapped[dict[str, Any]] = mapped_column(sa.JSON, nullable=False)
    llm_session_id: Mapped[uuid.UUID | None] = mapped_column(sa.Uuid(as_uuid=True), nullable=True)
    created_by: Mapped[uuid.UUID] = mapped_column(
        sa.Uuid(as_uuid=True),
        sa.ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
    )
    updated_by: Mapped[uuid.UUID | None] = mapped_column(
        sa.Uuid(as_uuid=True),
        sa.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )


class ProjectToolLicense(UUIDPrimaryKeyMixin, CreatedAtMixin, Base):
    __tablename__ = "project_tool_licenses"

    __table_args__ = (sa.Index("idx_tool_licenses_project", "project_id"),)

    project_id: Mapped[uuid.UUID] = mapped_column(
        sa.Uuid(as_uuid=True),
        sa.ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
    )
    tool_name: Mapped[str] = mapped_column(sa.String(100), nullable=False)
    total_seats: Mapped[int] = mapped_column(sa.Integer, nullable=False)
    cost_per_seat_monthly: Mapped[float | None] = mapped_column(sa.Numeric(10, 2), nullable=True)


class ToolSeatAssignment(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "tool_seat_assignments"

    __table_args__ = (sa.Index("idx_seat_assignments_tool", "tool_license_id"),)

    tool_license_id: Mapped[uuid.UUID] = mapped_column(
        sa.Uuid(as_uuid=True),
        sa.ForeignKey("project_tool_licenses.id", ondelete="CASCADE"),
        nullable=False,
    )
    personnel_id: Mapped[uuid.UUID] = mapped_column(
        sa.Uuid(as_uuid=True),
        sa.ForeignKey("personnel.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    assigned_at: Mapped[datetime] = mapped_column(sa.DateTime(timezone=True), nullable=False)


class ProjectTeamMatch(UUIDPrimaryKeyMixin, Base):
    """HR Analysis result — match score between project requirements and personnel."""

    __tablename__ = "project_team_matches"

    __table_args__ = (
        sa.Index("idx_team_matches_project", "project_id", "match_score"),
        sa.Index("idx_team_matches_personnel", "personnel_id"),
    )

    project_id: Mapped[uuid.UUID] = mapped_column(
        sa.Uuid(as_uuid=True),
        sa.ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
    )
    personnel_id: Mapped[uuid.UUID] = mapped_column(
        sa.Uuid(as_uuid=True),
        sa.ForeignKey("personnel.id", ondelete="CASCADE"),
        nullable=False,
    )
    match_score: Mapped[float] = mapped_column(sa.Numeric(4, 3), nullable=False)
    skill_coverage_score: Mapped[float] = mapped_column(sa.Numeric(4, 3), nullable=False)
    ocean_fit_score: Mapped[float] = mapped_column(sa.Numeric(4, 3), nullable=False)
    growth_opportunity_score: Mapped[float] = mapped_column(sa.Numeric(4, 3), nullable=False)
    effective_wfu_estimate: Mapped[float] = mapped_column(sa.Numeric(4, 2), nullable=False)
    match_details: Mapped[dict[str, Any]] = mapped_column(sa.JSON, nullable=False)
    computed_at: Mapped[datetime] = mapped_column(sa.DateTime(timezone=True), nullable=False)
