"""Add progress_pct to analysis_runs (M-progress)

Revision ID: 0007
Revises: 0006
Create Date: 2026-04-04 00:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0007"
down_revision: str | None = "0006"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    with op.batch_alter_table("analysis_runs") as batch_op:
        batch_op.add_column(
            sa.Column("progress_pct", sa.Integer(), nullable=False, server_default="0")
        )


def downgrade() -> None:
    with op.batch_alter_table("analysis_runs") as batch_op:
        batch_op.drop_column("progress_pct")
