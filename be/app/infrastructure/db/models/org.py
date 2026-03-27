"""ORM models for the organization domain: Organization, User."""

import uuid
from typing import Any

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.db.base import Base, CreatedAtMixin, UUIDPrimaryKeyMixin

# ---------------------------------------------------------------------------
# Enum value constants — avoids magic strings throughout application code.
# ---------------------------------------------------------------------------
USER_ROLES = ("admin", "pm", "tech_lead", "member")

_user_role_enum = sa.Enum(
    *USER_ROLES,
    name="user_role",
    native_enum=False,
    length=20,
)


class Organization(UUIDPrimaryKeyMixin, CreatedAtMixin, Base):
    __tablename__ = "organizations"

    name: Mapped[str] = mapped_column(sa.String(200), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(100), unique=True, nullable=False)
    # Org-level default phase breakdown {investigate, design, implement, testing, review, support}.
    # Null = fall back to PhaseRatios() system defaults.
    default_phase_ratios: Mapped[dict[str, Any] | None] = mapped_column(sa.JSON, nullable=True)


class User(UUIDPrimaryKeyMixin, CreatedAtMixin, Base):
    __tablename__ = "users"

    org_id: Mapped[uuid.UUID] = mapped_column(
        sa.Uuid(as_uuid=True),
        sa.ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    email: Mapped[str] = mapped_column(sa.String(255), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(sa.String(200), nullable=False)
    role: Mapped[str] = mapped_column(_user_role_enum, nullable=False)
