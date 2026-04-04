from datetime import UTC, datetime

import sqlalchemy as sa
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class TimestampMixin:
    created_at: Mapped[str] = mapped_column(sa.String, nullable=False)
    updated_at: Mapped[str] = mapped_column(sa.String, nullable=False)


def utcnow() -> str:
    return datetime.now(UTC).isoformat().replace("+00:00", "Z")
