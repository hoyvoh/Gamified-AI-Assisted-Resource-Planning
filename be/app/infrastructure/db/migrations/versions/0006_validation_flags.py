"""Add validation_flags table (M8)

Revision ID: 0006
Revises: 0005
Create Date: 2026-04-04 00:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0006"
down_revision: str | None = "0005"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "validation_flags",
        sa.Column("flag_id", sa.String(), nullable=False),
        sa.Column("analysis_run_id", sa.String(), nullable=False),
        sa.Column("dimension_id", sa.String(100), nullable=False),
        sa.Column("verdict", sa.String(20), nullable=False),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("flagged_at", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(
            ["analysis_run_id"],
            ["analysis_runs.analysis_run_id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("flag_id"),
        sa.UniqueConstraint("analysis_run_id", "dimension_id", name="uq_validation_flags_run_dim"),
    )
    op.create_index("idx_validation_flags_run", "validation_flags", ["analysis_run_id"])


def downgrade() -> None:
    op.drop_index("idx_validation_flags_run", table_name="validation_flags")
    op.drop_table("validation_flags")
