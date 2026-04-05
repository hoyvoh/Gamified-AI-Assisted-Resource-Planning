"""Add kpt_items, case_feedbacks, milestones, analysis_snapshots; add ui_summary to dimension_scores (M5)

Revision ID: 0005
Revises: 0004
Create Date: 2026-04-04 00:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0005"
down_revision: str | None = "0004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    with op.batch_alter_table("analysis_runs") as batch_op:
        batch_op.add_column(sa.Column("scoring_version", sa.String(20), nullable=True))

    with op.batch_alter_table("dimension_scores") as batch_op:
        batch_op.add_column(sa.Column("ui_summary", sa.Text(), nullable=True))

    op.create_table(
        "kpt_items",
        sa.Column("kpt_id", sa.String(), nullable=False),
        sa.Column("analysis_run_id", sa.String(), nullable=False),
        sa.Column("member_id", sa.String(), nullable=False),
        sa.Column("item_type", sa.String(20), nullable=False),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("linked_dimension_ids", sa.Text(), nullable=False, server_default="[]"),
        sa.Column("linked_evidence_ids", sa.Text(), nullable=False, server_default="[]"),
        sa.Column("linked_problem_ids", sa.Text(), nullable=False, server_default="[]"),
        sa.Column("display_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(
            ["analysis_run_id"],
            ["analysis_runs.analysis_run_id"],
            name="fk_kpt_items_run",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("kpt_id", name="pk_kpt_items"),
    )
    op.create_index("idx_kpt_items_run_type", "kpt_items", ["analysis_run_id", "item_type"])

    op.create_table(
        "case_feedbacks",
        sa.Column("case_id", sa.String(), nullable=False),
        sa.Column("analysis_run_id", sa.String(), nullable=False),
        sa.Column("member_id", sa.String(), nullable=False),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("category", sa.String(100), nullable=True),
        sa.Column("impact_level", sa.String(20), nullable=True),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("why_it_matters", sa.Text(), nullable=True),
        sa.Column("observed_pattern", sa.Text(), nullable=True),
        sa.Column("better_alternative", sa.Text(), nullable=True),
        sa.Column("next_time_guidance", sa.Text(), nullable=True),
        sa.Column("linked_dimension_ids", sa.Text(), nullable=False, server_default="[]"),
        sa.Column("supporting_event_ids", sa.Text(), nullable=False, server_default="[]"),
        sa.Column("confidence_score", sa.Float(), nullable=True),
        sa.Column("display_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(
            ["analysis_run_id"],
            ["analysis_runs.analysis_run_id"],
            name="fk_case_feedbacks_run",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("case_id", name="pk_case_feedbacks"),
    )
    op.create_index("idx_case_feedbacks_run", "case_feedbacks", ["analysis_run_id"])

    op.create_table(
        "milestones",
        sa.Column("milestone_id", sa.String(), nullable=False),
        sa.Column("member_id", sa.String(), nullable=False),
        sa.Column("source_analysis_run_id", sa.String(), nullable=True),
        sa.Column("timestamp", sa.String(), nullable=False),
        sa.Column("milestone_type", sa.String(100), nullable=False),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("impact_score", sa.Float(), nullable=True),
        sa.Column("supporting_event_ids", sa.Text(), nullable=False, server_default="[]"),
        sa.Column("supporting_evidence_ids", sa.Text(), nullable=False, server_default="[]"),
        sa.Column("retained", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("created_at", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(
            ["member_id"],
            ["members.member_id"],
            name="fk_milestones_member",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["source_analysis_run_id"],
            ["analysis_runs.analysis_run_id"],
            name="fk_milestones_run",
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("milestone_id", name="pk_milestones"),
    )
    op.create_index("idx_milestones_member", "milestones", ["member_id"])
    op.create_index("idx_milestones_member_ts", "milestones", ["member_id", "timestamp"])

    op.create_table(
        "analysis_snapshots",
        sa.Column("snapshot_id", sa.String(), nullable=False),
        sa.Column("analysis_run_id", sa.String(), nullable=False),
        sa.Column("member_id", sa.String(), nullable=False),
        sa.Column("period_start", sa.String(10), nullable=False),
        sa.Column("period_end", sa.String(10), nullable=False),
        sa.Column("generated_at", sa.String(), nullable=False),
        sa.Column("overall_confidence", sa.Float(), nullable=True),
        sa.Column("profile_summary", sa.Text(), nullable=True),
        sa.Column("growth_journey_summary", sa.Text(), nullable=True),
        sa.Column("top_strength_dimension_ids", sa.Text(), nullable=False, server_default="[]"),
        sa.Column("top_growth_dimension_ids", sa.Text(), nullable=False, server_default="[]"),
        sa.Column("current_growth_path", sa.Text(), nullable=True),
        sa.Column("fairness_notes", sa.Text(), nullable=False, server_default="[]"),
        sa.Column("insufficient_dimensions", sa.Text(), nullable=False, server_default="[]"),
        sa.Column("flagged_items_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("p8_approved", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("p8_issues", sa.Text(), nullable=False, server_default="[]"),
        sa.ForeignKeyConstraint(
            ["analysis_run_id"],
            ["analysis_runs.analysis_run_id"],
            name="fk_analysis_snapshots_run",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("snapshot_id", name="pk_analysis_snapshots"),
        sa.UniqueConstraint("analysis_run_id", name="uq_snapshots_run"),
    )
    op.create_index("idx_analysis_snapshots_member", "analysis_snapshots", ["member_id"])


def downgrade() -> None:
    op.drop_index("idx_analysis_snapshots_member", table_name="analysis_snapshots")
    op.drop_table("analysis_snapshots")
    op.drop_index("idx_milestones_member_ts", table_name="milestones")
    op.drop_index("idx_milestones_member", table_name="milestones")
    op.drop_table("milestones")
    op.drop_index("idx_case_feedbacks_run", table_name="case_feedbacks")
    op.drop_table("case_feedbacks")
    op.drop_index("idx_kpt_items_run_type", table_name="kpt_items")
    op.drop_table("kpt_items")
    with op.batch_alter_table("dimension_scores") as batch_op:
        batch_op.drop_column("ui_summary")
    with op.batch_alter_table("analysis_runs") as batch_op:
        batch_op.drop_column("scoring_version")
