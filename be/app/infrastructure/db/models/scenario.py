"""ORM models for the scenario domain: Scenario, ScenarioCompletionSnapshot."""

import uuid
from datetime import date, datetime
from typing import Any

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.db.base import Base, CreatedAtMixin, UUIDPrimaryKeyMixin

# ---------------------------------------------------------------------------
# Enum value constants
# ---------------------------------------------------------------------------
SCENARIO_STATUSES = ("draft", "active", "archived", "rejected")

_scenario_status_enum = sa.Enum(
    *SCENARIO_STATUSES, name="scenario_status", native_enum=False, length=10
)

_DEFAULT_IS_SNAPSHOT = False


class Scenario(UUIDPrimaryKeyMixin, CreatedAtMixin, Base):
    __tablename__ = "scenarios"

    project_id: Mapped[uuid.UUID] = mapped_column(
        sa.Uuid(as_uuid=True),
        sa.ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(sa.String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(sa.Text, nullable=True)
    status: Mapped[str] = mapped_column(_scenario_status_enum, nullable=False)
    is_snapshot: Mapped[bool] = mapped_column(
        sa.Boolean, nullable=False, default=_DEFAULT_IS_SNAPSHOT
    )
    parent_scenario_id: Mapped[uuid.UUID | None] = mapped_column(
        sa.Uuid(as_uuid=True),
        sa.ForeignKey("scenarios.id", ondelete="SET NULL"),
        nullable=True,
    )
    created_by: Mapped[uuid.UUID] = mapped_column(
        sa.Uuid(as_uuid=True),
        sa.ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
    )
    metadata_: Mapped[dict[str, Any]] = mapped_column(
        "metadata", sa.JSON, nullable=False, default=dict
    )


class ScenarioCompletionSnapshot(UUIDPrimaryKeyMixin, Base):
    """Point-in-time P(on_time) snapshot — used to render trend charts."""

    __tablename__ = "scenario_completion_snapshots"

    __table_args__ = (sa.Index("idx_completion_snapshots_scenario", "scenario_id", "computed_at"),)

    scenario_id: Mapped[uuid.UUID] = mapped_column(
        sa.Uuid(as_uuid=True),
        sa.ForeignKey("scenarios.id", ondelete="CASCADE"),
        nullable=False,
    )
    computed_at: Mapped[datetime] = mapped_column(sa.DateTime(timezone=True), nullable=False)
    p_on_time: Mapped[float] = mapped_column(sa.Numeric(5, 4), nullable=False)
    eac_date: Mapped[date] = mapped_column(sa.Date, nullable=False)
    days_delta: Mapped[float] = mapped_column(sa.Numeric(6, 1), nullable=False)
    spi: Mapped[float] = mapped_column(sa.Numeric(5, 3), nullable=False)
    active_risk_count: Mapped[int] = mapped_column(sa.Integer, nullable=False)
