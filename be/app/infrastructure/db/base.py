"""SQLAlchemy declarative base and shared mixins.

All ORM models in app/infrastructure/db/models/ inherit from Base.
Mixins are composed, not inherited through a chain, to keep each model explicit.
"""

import uuid
from datetime import datetime

import sqlalchemy as sa
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class UUIDPrimaryKeyMixin:
    """UUID primary key with server-side default via Python uuid4."""

    id: Mapped[uuid.UUID] = mapped_column(
        sa.Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )


class CreatedAtMixin:
    """Append-only timestamp set once on insert."""

    created_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True),
        server_default=sa.func.now(),
        nullable=False,
    )


class TimestampMixin(CreatedAtMixin):
    """Created + updated timestamps. updated_at refreshed on every UPDATE."""

    updated_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True),
        server_default=sa.func.now(),
        onupdate=sa.func.now(),
        nullable=False,
    )
