"""ORM models for the personnel domain.

Models: Personnel, PersonnelLanguage, SkillMatrixEntry, PersonnelProfile.
"""

import uuid
from datetime import date, datetime
from typing import Any

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.db.base import Base, CreatedAtMixin, UUIDPrimaryKeyMixin

# ---------------------------------------------------------------------------
# Enum value constants
# ---------------------------------------------------------------------------
SENIORITY_LEVELS = ("intern", "junior", "mid", "senior", "lead")
LANGUAGE_PROFICIENCIES = ("native", "fluent", "basic")
SKILL_LEVELS = ("beginner", "intermediate", "advanced", "expert")

_seniority_enum = sa.Enum(*SENIORITY_LEVELS, name="seniority_level", native_enum=False, length=10)
_language_proficiency_enum = sa.Enum(
    *LANGUAGE_PROFICIENCIES, name="language_proficiency", native_enum=False, length=10
)
_skill_level_enum = sa.Enum(*SKILL_LEVELS, name="skill_level", native_enum=False, length=15)

# ---------------------------------------------------------------------------
# Default column values (named to avoid magic numbers)
# ---------------------------------------------------------------------------
_DEFAULT_BASE_WFU = 1.0
_DEFAULT_DAILY_CAPACITY_HOURS = 7.0
_DEFAULT_WFU_MULTIPLIER_STANDARD = 1.0
_DEFAULT_WFU_MULTIPLIER_FAST = 1.2
_DEFAULT_WFU_MULTIPLIER_QUALITY = 1.5
_DEFAULT_DREYFUS_LEVEL = 3


class Personnel(UUIDPrimaryKeyMixin, CreatedAtMixin, Base):
    __tablename__ = "personnel"

    org_id: Mapped[uuid.UUID] = mapped_column(
        sa.Uuid(as_uuid=True),
        sa.ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        sa.Uuid(as_uuid=True),
        sa.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    display_name: Mapped[str] = mapped_column(sa.String(200), nullable=False)
    seniority: Mapped[str] = mapped_column(_seniority_enum, nullable=False)
    years_experience: Mapped[float] = mapped_column(sa.Numeric(4, 1), nullable=False)
    base_wfu: Mapped[float] = mapped_column(
        sa.Numeric(4, 2), nullable=False, default=_DEFAULT_BASE_WFU
    )
    daily_capacity_hours: Mapped[float] = mapped_column(
        sa.Numeric(4, 1), nullable=False, default=_DEFAULT_DAILY_CAPACITY_HOURS
    )
    hourly_cost: Mapped[float] = mapped_column(sa.Numeric(10, 2), nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(sa.Text, nullable=True)
    velocity_baseline: Mapped[float | None] = mapped_column(sa.Numeric(4, 2), nullable=True)
    dreyfus_level: Mapped[int | None] = mapped_column(sa.SmallInteger, nullable=True)
    github_username: Mapped[str | None] = mapped_column(sa.String(100), nullable=True)
    profile_last_synced_at: Mapped[datetime | None] = mapped_column(
        sa.DateTime(timezone=True), nullable=True
    )


class PersonnelLanguage(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "personnel_languages"

    __table_args__ = (sa.Index("idx_personnel_languages", "personnel_id"),)

    personnel_id: Mapped[uuid.UUID] = mapped_column(
        sa.Uuid(as_uuid=True),
        sa.ForeignKey("personnel.id", ondelete="CASCADE"),
        nullable=False,
    )
    language_code: Mapped[str] = mapped_column(sa.String(10), nullable=False)
    proficiency: Mapped[str] = mapped_column(_language_proficiency_enum, nullable=False)


class SkillMatrixEntry(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "skill_matrix_entries"

    personnel_id: Mapped[uuid.UUID] = mapped_column(
        sa.Uuid(as_uuid=True),
        sa.ForeignKey("personnel.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    skill_name: Mapped[str] = mapped_column(sa.String(100), nullable=False)
    category: Mapped[str] = mapped_column(sa.String(50), nullable=False)
    level: Mapped[str] = mapped_column(_skill_level_enum, nullable=False)
    wfu_multiplier_standard: Mapped[float] = mapped_column(
        sa.Numeric(3, 2), nullable=False, default=_DEFAULT_WFU_MULTIPLIER_STANDARD
    )
    wfu_multiplier_fast: Mapped[float] = mapped_column(
        sa.Numeric(3, 2), nullable=False, default=_DEFAULT_WFU_MULTIPLIER_FAST
    )
    wfu_multiplier_quality: Mapped[float] = mapped_column(
        sa.Numeric(3, 2), nullable=False, default=_DEFAULT_WFU_MULTIPLIER_QUALITY
    )
    dreyfus_level: Mapped[int] = mapped_column(
        sa.SmallInteger, nullable=False, default=_DEFAULT_DREYFUS_LEVEL
    )

    __table_args__ = (
        sa.CheckConstraint(
            "wfu_multiplier_standard >= 0.5 AND wfu_multiplier_quality <= 3.0",
            name="valid_wfu_multiplier",
        ),
    )


class PersonnelProfile(UUIDPrimaryKeyMixin, CreatedAtMixin, Base):
    """5-layer developer behavioral profile inferred from GitHub data."""

    __tablename__ = "personnel_profiles"

    __table_args__ = (sa.UniqueConstraint("personnel_id", name="uq_personnel_profiles_personnel"),)

    personnel_id: Mapped[uuid.UUID] = mapped_column(
        sa.Uuid(as_uuid=True),
        sa.ForeignKey("personnel.id", ondelete="CASCADE"),
        nullable=False,
    )
    profile_version: Mapped[str] = mapped_column(sa.String(20), nullable=False)
    data_period_from: Mapped[date] = mapped_column(sa.Date, nullable=False)
    data_period_to: Mapped[date] = mapped_column(sa.Date, nullable=False)
    corpus_size: Mapped[int] = mapped_column(sa.Integer, nullable=False)
    ocean_scores: Mapped[dict[str, Any]] = mapped_column(sa.JSON, nullable=False)
    behavioral_prefs: Mapped[dict[str, Any]] = mapped_column(sa.JSON, nullable=False)
    tech_capability: Mapped[dict[str, Any]] = mapped_column(sa.JSON, nullable=False)
    soft_skills: Mapped[dict[str, Any]] = mapped_column(sa.JSON, nullable=False)
    performance: Mapped[dict[str, Any]] = mapped_column(sa.JSON, nullable=False)
    wfu_factors: Mapped[dict[str, Any]] = mapped_column(sa.JSON, nullable=False)
    flags: Mapped[list[Any]] = mapped_column(sa.JSON, nullable=False)
    github_repos_analyzed: Mapped[list[Any]] = mapped_column(sa.JSON, nullable=False)
    synced_at: Mapped[datetime] = mapped_column(sa.DateTime(timezone=True), nullable=False)
