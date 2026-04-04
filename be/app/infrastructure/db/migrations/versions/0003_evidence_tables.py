"""Add evidence_units and behavioral_events tables (M3)

Revision ID: 0003
Revises: 0002
Create Date: 2025-01-03 00:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0003"
down_revision: str | None = "0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "evidence_units",
        sa.Column("evidence_id", sa.String(), nullable=False),
        sa.Column("analysis_run_id", sa.String(), nullable=False),
        sa.Column("member_id", sa.String(), nullable=False),
        sa.Column("timestamp", sa.String(), nullable=False),
        sa.Column("source_type", sa.String(50), nullable=True),
        sa.Column("record_id", sa.String(255), nullable=True),
        sa.Column("content_excerpt", sa.Text(), nullable=False, server_default=""),
        sa.Column("content_summary", sa.Text(), nullable=False, server_default=""),
        sa.Column("extraction_confidence", sa.Float(), nullable=True),
        sa.Column("ambiguity_notes", sa.Text(), nullable=False, server_default="[]"),
        sa.Column("created_at", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(
            ["analysis_run_id"],
            ["analysis_runs.analysis_run_id"],
            name="fk_evidence_units_run",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("evidence_id", name="pk_evidence_units"),
    )
    op.create_index("idx_evidence_units_run", "evidence_units", ["analysis_run_id"])
    op.create_index("idx_evidence_units_member", "evidence_units", ["member_id"])

    op.create_table(
        "behavioral_events",
        sa.Column("event_id", sa.String(), nullable=False),
        sa.Column("analysis_run_id", sa.String(), nullable=False),
        sa.Column("member_id", sa.String(), nullable=False),
        sa.Column("timestamp", sa.String(), nullable=False),
        sa.Column("source_evidence_ids", sa.Text(), nullable=False, server_default="[]"),
        sa.Column("event_type", sa.String(50), nullable=False),
        sa.Column("event_summary", sa.Text(), nullable=True),
        sa.Column("polarity", sa.String(20), nullable=False),
        sa.Column("severity", sa.Float(), nullable=True),
        sa.Column("event_confidence", sa.Float(), nullable=True),
        sa.Column("impact_level", sa.String(20), nullable=True),
        sa.Column("opportunity_level", sa.String(20), nullable=True),
        sa.Column("related_dimensions", sa.Text(), nullable=False, server_default="[]"),
        sa.Column("ambiguity_notes", sa.Text(), nullable=False, server_default="[]"),
        sa.Column("why_it_matters", sa.Text(), nullable=True),
        sa.Column("created_at", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(
            ["analysis_run_id"],
            ["analysis_runs.analysis_run_id"],
            name="fk_behavioral_events_run",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("event_id", name="pk_behavioral_events"),
    )
    op.create_index("idx_behavioral_events_run", "behavioral_events", ["analysis_run_id"])
    op.create_index(
        "idx_behavioral_events_member_type",
        "behavioral_events",
        ["member_id", "event_type"],
    )


def downgrade() -> None:
    op.drop_index("idx_behavioral_events_member_type", table_name="behavioral_events")
    op.drop_index("idx_behavioral_events_run", table_name="behavioral_events")
    op.drop_table("behavioral_events")
    op.drop_index("idx_evidence_units_member", table_name="evidence_units")
    op.drop_index("idx_evidence_units_run", table_name="evidence_units")
    op.drop_table("evidence_units")
