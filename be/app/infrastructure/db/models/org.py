import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.db.base import Base, TimestampMixin


class OrganizationModel(TimestampMixin, Base):
    __tablename__ = "organizations"

    organization_id: Mapped[str] = mapped_column(sa.String, primary_key=True)
    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)

    teams: Mapped[list["TeamModel"]] = relationship(
        "TeamModel", back_populates="organization", cascade="all, delete-orphan"
    )


class TeamModel(TimestampMixin, Base):
    __tablename__ = "teams"
    __table_args__ = (sa.Index("idx_teams_organization", "organization_id"),)

    team_id: Mapped[str] = mapped_column(sa.String, primary_key=True)
    organization_id: Mapped[str] = mapped_column(
        sa.String,
        sa.ForeignKey("organizations.organization_id", ondelete="CASCADE"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)

    organization: Mapped["OrganizationModel"] = relationship(
        "OrganizationModel", back_populates="teams"
    )
    members: Mapped[list["MemberModel"]] = relationship(
        "MemberModel", back_populates="team", cascade="all, delete-orphan"
    )


class RoleProfileModel(TimestampMixin, Base):
    __tablename__ = "role_profiles"

    role_profile_id: Mapped[str] = mapped_column(sa.String, primary_key=True)
    role_name: Mapped[str] = mapped_column(sa.String(100), nullable=False, unique=True)
    expected_dimension_weights: Mapped[str] = mapped_column(sa.Text, nullable=False, default="{}")
    expected_opportunity_levels: Mapped[str] = mapped_column(sa.Text, nullable=False, default="{}")
    expected_maturity_ranges: Mapped[str] = mapped_column(sa.Text, nullable=False, default="{}")

    members: Mapped[list["MemberModel"]] = relationship(
        "MemberModel", back_populates="role_profile"
    )


class MemberModel(TimestampMixin, Base):
    __tablename__ = "members"
    __table_args__ = (
        sa.Index("idx_members_team", "team_id"),
        sa.Index("idx_members_role_profile", "role_profile_id"),
    )

    member_id: Mapped[str] = mapped_column(sa.String, primary_key=True)
    team_id: Mapped[str] = mapped_column(
        sa.String,
        sa.ForeignKey("teams.team_id", ondelete="CASCADE"),
        nullable=False,
    )
    role_profile_id: Mapped[str | None] = mapped_column(
        sa.String,
        sa.ForeignKey("role_profiles.role_profile_id", ondelete="SET NULL"),
        nullable=True,
    )
    display_name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    external_id: Mapped[str | None] = mapped_column(sa.String(255), nullable=True)

    team: Mapped["TeamModel"] = relationship("TeamModel", back_populates="members")
    role_profile: Mapped["RoleProfileModel | None"] = relationship(
        "RoleProfileModel", back_populates="members"
    )
