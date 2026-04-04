"""Initial org schema: organizations, teams, members, role_profiles

Revision ID: 0001
Revises:
Create Date: 2025-01-01 00:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "role_profiles",
        sa.Column("role_profile_id", sa.String(), nullable=False),
        sa.Column("role_name", sa.String(100), nullable=False),
        sa.Column("expected_dimension_weights", sa.Text(), nullable=False, server_default="{}"),
        sa.Column("expected_opportunity_levels", sa.Text(), nullable=False, server_default="{}"),
        sa.Column("expected_maturity_ranges", sa.Text(), nullable=False, server_default="{}"),
        sa.Column("created_at", sa.String(), nullable=False),
        sa.Column("updated_at", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("role_profile_id", name="pk_role_profiles"),
        sa.UniqueConstraint("role_name", name="uq_role_profiles_role_name"),
    )
    op.create_table(
        "organizations",
        sa.Column("organization_id", sa.String(), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("created_at", sa.String(), nullable=False),
        sa.Column("updated_at", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("organization_id", name="pk_organizations"),
    )
    op.create_table(
        "teams",
        sa.Column("team_id", sa.String(), nullable=False),
        sa.Column("organization_id", sa.String(), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("created_at", sa.String(), nullable=False),
        sa.Column("updated_at", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(
            ["organization_id"],
            ["organizations.organization_id"],
            name="fk_teams_organization",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("team_id", name="pk_teams"),
    )
    op.create_index("idx_teams_organization", "teams", ["organization_id"])
    op.create_table(
        "members",
        sa.Column("member_id", sa.String(), nullable=False),
        sa.Column("team_id", sa.String(), nullable=False),
        sa.Column("role_profile_id", sa.String(), nullable=True),
        sa.Column("display_name", sa.String(255), nullable=False),
        sa.Column("external_id", sa.String(255), nullable=True),
        sa.Column("created_at", sa.String(), nullable=False),
        sa.Column("updated_at", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(
            ["team_id"],
            ["teams.team_id"],
            name="fk_members_team",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["role_profile_id"],
            ["role_profiles.role_profile_id"],
            name="fk_members_role_profile",
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("member_id", name="pk_members"),
    )
    op.create_index("idx_members_team", "members", ["team_id"])
    op.create_index("idx_members_role_profile", "members", ["role_profile_id"])


def downgrade() -> None:
    op.drop_index("idx_members_role_profile", table_name="members")
    op.drop_index("idx_members_team", table_name="members")
    op.drop_table("members")
    op.drop_index("idx_teams_organization", table_name="teams")
    op.drop_table("teams")
    op.drop_table("organizations")
    op.drop_table("role_profiles")
