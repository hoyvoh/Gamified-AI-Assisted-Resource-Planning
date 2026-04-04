"""Add analysis_runs and source_payloads tables (M2)

Revision ID: 0002
Revises: 0001
Create Date: 2025-01-02 00:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0002"
down_revision: str | None = "0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "analysis_runs",
        sa.Column("analysis_run_id", sa.String(), nullable=False),
        sa.Column("member_id", sa.String(), nullable=False),
        sa.Column("period_start", sa.String(10), nullable=False),
        sa.Column("period_end", sa.String(10), nullable=False),
        sa.Column("run_type", sa.String(50), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
        sa.Column("progress_stage", sa.String(50), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("created_at", sa.String(), nullable=False),
        sa.Column("updated_at", sa.String(), nullable=False),
        sa.Column("completed_at", sa.String(), nullable=True),
        sa.ForeignKeyConstraint(
            ["member_id"],
            ["members.member_id"],
            name="fk_analysis_runs_member",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("analysis_run_id", name="pk_analysis_runs"),
    )
    op.create_index("idx_analysis_runs_member", "analysis_runs", ["member_id"])
    op.create_index("idx_analysis_runs_status", "analysis_runs", ["status"])

    op.create_table(
        "source_payloads",
        sa.Column("source_payload_id", sa.String(), nullable=False),
        sa.Column("analysis_run_id", sa.String(), nullable=False),
        sa.Column("source_type", sa.String(50), nullable=False),
        sa.Column("source_handle", sa.String(255), nullable=False),
        sa.Column("raw_data", sa.Text(), nullable=False, server_default="[]"),
        sa.Column("record_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("collection_status", sa.String(20), nullable=False),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("collected_at", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(
            ["analysis_run_id"],
            ["analysis_runs.analysis_run_id"],
            name="fk_source_payloads_run",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("source_payload_id", name="pk_source_payloads"),
    )
    op.create_index("idx_source_payloads_run", "source_payloads", ["analysis_run_id"])


def downgrade() -> None:
    op.drop_index("idx_source_payloads_run", table_name="source_payloads")
    op.drop_table("source_payloads")
    op.drop_index("idx_analysis_runs_status", table_name="analysis_runs")
    op.drop_index("idx_analysis_runs_member", table_name="analysis_runs")
    op.drop_table("analysis_runs")
