"""ORM model for resource assignments: ResourceAssignment."""

import uuid
from datetime import datetime

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.db.base import Base, UUIDPrimaryKeyMixin

# ---------------------------------------------------------------------------
# Enum value constants
# ---------------------------------------------------------------------------
WFU_MODES = ("standard", "fast", "quality")

_wfu_mode_enum = sa.Enum(*WFU_MODES, name="wfu_mode", native_enum=False, length=10)

_DEFAULT_IS_LEAD = False
_DEFAULT_WFU_MODE = "standard"


class ResourceAssignment(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "resource_assignments"

    __table_args__ = (
        sa.CheckConstraint(
            "allocation_pct > 0 AND allocation_pct <= 100",
            name="valid_assignment_allocation",
        ),
        sa.Index("idx_assignments_task", "task_id"),
        sa.Index("idx_assignments_personnel", "personnel_id"),
    )

    task_id: Mapped[uuid.UUID] = mapped_column(
        sa.Uuid(as_uuid=True),
        sa.ForeignKey("tasks.id", ondelete="CASCADE"),
        nullable=False,
    )
    personnel_id: Mapped[uuid.UUID] = mapped_column(
        sa.Uuid(as_uuid=True),
        sa.ForeignKey("personnel.id", ondelete="CASCADE"),
        nullable=False,
    )
    allocation_pct: Mapped[float] = mapped_column(sa.Numeric(5, 2), nullable=False)
    wfu_mode: Mapped[str] = mapped_column(_wfu_mode_enum, nullable=False, default=_DEFAULT_WFU_MODE)
    effective_wfu: Mapped[float] = mapped_column(sa.Numeric(4, 2), nullable=False)
    is_lead: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, default=_DEFAULT_IS_LEAD)
    assigned_at: Mapped[datetime] = mapped_column(sa.DateTime(timezone=True), nullable=False)
    assigned_by: Mapped[uuid.UUID] = mapped_column(
        sa.Uuid(as_uuid=True),
        sa.ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
    )
