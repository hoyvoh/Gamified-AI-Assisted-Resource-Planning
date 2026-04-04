"""Add dimension_signals, dimension_scores, category_scores, personal_baselines (M4)

Revision ID: 0004
Revises: 0003
Create Date: 2026-04-04 00:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0004"
down_revision: str | None = "0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "dimension_signals",
        sa.Column("signal_id", sa.String(), nullable=False),
        sa.Column("analysis_run_id", sa.String(), nullable=False),
        sa.Column("member_id", sa.String(), nullable=False),
        sa.Column("dimension_id", sa.String(100), nullable=False),
        sa.Column("source_event_ids", sa.Text(), nullable=False, server_default="[]"),
        sa.Column("polarity", sa.String(20), nullable=False),
        sa.Column("signal_strength", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("signal_specificity", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("signal_confidence", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("opportunity_level", sa.String(20), nullable=True),
        sa.Column("explanation_summary", sa.Text(), nullable=True),
        sa.Column("created_at", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(
            ["analysis_run_id"],
            ["analysis_runs.analysis_run_id"],
            name="fk_dimension_signals_run",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("signal_id", name="pk_dimension_signals"),
    )
    op.create_index("idx_dimension_signals_run", "dimension_signals", ["analysis_run_id"])
    op.create_index(
        "idx_dimension_signals_run_dim",
        "dimension_signals",
        ["analysis_run_id", "dimension_id"],
    )

    op.create_table(
        "dimension_scores",
        sa.Column("score_id", sa.String(), nullable=False),
        sa.Column("analysis_run_id", sa.String(), nullable=False),
        sa.Column("member_id", sa.String(), nullable=False),
        sa.Column("dimension_id", sa.String(100), nullable=False),
        sa.Column("raw_score", sa.Float(), nullable=True),
        sa.Column("normalized_score", sa.Float(), nullable=True),
        sa.Column("maturity_level", sa.String(50), nullable=False),
        sa.Column("confidence_score", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("confidence_label", sa.String(20), nullable=False, server_default="low"),
        sa.Column("opportunity_score", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("opportunity_label", sa.String(20), nullable=False, server_default="none"),
        sa.Column("delta_value", sa.Float(), nullable=True),
        sa.Column(
            "delta_label", sa.String(30), nullable=False, server_default="not_enough_comparison"
        ),
        sa.Column("total_signals", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("positive_signals", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("negative_signals", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("mixed_signals", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("explanation_summary", sa.Text(), nullable=True),
        sa.Column("limitation_notes", sa.Text(), nullable=False, server_default="[]"),
        sa.Column("top_supporting_evidence_ids", sa.Text(), nullable=False, server_default="[]"),
        sa.Column("top_counter_evidence_ids", sa.Text(), nullable=False, server_default="[]"),
        sa.Column("p3_inference", sa.Text(), nullable=True),
        sa.Column("created_at", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(
            ["analysis_run_id"],
            ["analysis_runs.analysis_run_id"],
            name="fk_dimension_scores_run",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("score_id", name="pk_dimension_scores"),
        sa.UniqueConstraint("analysis_run_id", "dimension_id", name="uq_dim_score_run_dim"),
    )
    op.create_index("idx_dimension_scores_run", "dimension_scores", ["analysis_run_id"])
    op.create_index("idx_dimension_scores_member", "dimension_scores", ["member_id"])

    op.create_table(
        "category_scores",
        sa.Column("category_score_id", sa.String(), nullable=False),
        sa.Column("analysis_run_id", sa.String(), nullable=False),
        sa.Column("member_id", sa.String(), nullable=False),
        sa.Column("category_id", sa.String(100), nullable=False),
        sa.Column("score", sa.Float(), nullable=True),
        sa.Column("confidence_score", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("confidence_label", sa.String(20), nullable=False, server_default="low"),
        sa.Column("included_dimensions", sa.Text(), nullable=False, server_default="[]"),
        sa.Column("excluded_dimensions", sa.Text(), nullable=False, server_default="[]"),
        sa.Column("explanation_summary", sa.Text(), nullable=True),
        sa.Column("created_at", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(
            ["analysis_run_id"],
            ["analysis_runs.analysis_run_id"],
            name="fk_category_scores_run",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("category_score_id", name="pk_category_scores"),
        sa.UniqueConstraint("analysis_run_id", "category_id", name="uq_cat_score_run_cat"),
    )
    op.create_index("idx_category_scores_run", "category_scores", ["analysis_run_id"])

    op.create_table(
        "personal_baselines",
        sa.Column("baseline_id", sa.String(), nullable=False),
        sa.Column("member_id", sa.String(), nullable=False),
        sa.Column("baseline_dimensions", sa.Text(), nullable=False, server_default="{}"),
        sa.Column("created_at", sa.String(), nullable=False),
        sa.Column("updated_at", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("baseline_id", name="pk_personal_baselines"),
        sa.UniqueConstraint("member_id", name="uq_personal_baselines_member"),
    )


def downgrade() -> None:
    op.drop_table("personal_baselines")
    op.drop_index("idx_category_scores_run", table_name="category_scores")
    op.drop_table("category_scores")
    op.drop_index("idx_dimension_scores_member", table_name="dimension_scores")
    op.drop_index("idx_dimension_scores_run", table_name="dimension_scores")
    op.drop_table("dimension_scores")
    op.drop_index("idx_dimension_signals_run_dim", table_name="dimension_signals")
    op.drop_index("idx_dimension_signals_run", table_name="dimension_signals")
    op.drop_table("dimension_signals")
