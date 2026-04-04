import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.db.base import Base


class EvidenceUnitModel(Base):
    __tablename__ = "evidence_units"
    __table_args__ = (
        sa.Index("idx_evidence_units_run", "analysis_run_id"),
        sa.Index("idx_evidence_units_member", "member_id"),
    )

    evidence_id: Mapped[str] = mapped_column(sa.String, primary_key=True)
    analysis_run_id: Mapped[str] = mapped_column(
        sa.String,
        sa.ForeignKey("analysis_runs.analysis_run_id", ondelete="CASCADE"),
        nullable=False,
    )
    member_id: Mapped[str] = mapped_column(sa.String, nullable=False)
    timestamp: Mapped[str] = mapped_column(sa.String, nullable=False)
    source_type: Mapped[str | None] = mapped_column(sa.String(50), nullable=True)
    record_id: Mapped[str | None] = mapped_column(sa.String(255), nullable=True)
    content_excerpt: Mapped[str] = mapped_column(sa.Text, nullable=False, default="")
    content_summary: Mapped[str] = mapped_column(sa.Text, nullable=False, default="")
    extraction_confidence: Mapped[float | None] = mapped_column(sa.Float, nullable=True)
    ambiguity_notes: Mapped[str] = mapped_column(sa.Text, nullable=False, default="[]")
    created_at: Mapped[str] = mapped_column(sa.String, nullable=False)


class BehavioralEventModel(Base):
    __tablename__ = "behavioral_events"
    __table_args__ = (
        sa.Index("idx_behavioral_events_run", "analysis_run_id"),
        sa.Index("idx_behavioral_events_member_type", "member_id", "event_type"),
    )

    event_id: Mapped[str] = mapped_column(sa.String, primary_key=True)
    analysis_run_id: Mapped[str] = mapped_column(
        sa.String,
        sa.ForeignKey("analysis_runs.analysis_run_id", ondelete="CASCADE"),
        nullable=False,
    )
    member_id: Mapped[str] = mapped_column(sa.String, nullable=False)
    timestamp: Mapped[str] = mapped_column(sa.String, nullable=False)
    source_evidence_ids: Mapped[str] = mapped_column(sa.Text, nullable=False, default="[]")
    event_type: Mapped[str] = mapped_column(sa.String(50), nullable=False)
    event_summary: Mapped[str | None] = mapped_column(sa.Text, nullable=True)
    polarity: Mapped[str] = mapped_column(sa.String(20), nullable=False)
    severity: Mapped[float | None] = mapped_column(sa.Float, nullable=True)
    event_confidence: Mapped[float | None] = mapped_column(sa.Float, nullable=True)
    impact_level: Mapped[str | None] = mapped_column(sa.String(20), nullable=True)
    opportunity_level: Mapped[str | None] = mapped_column(sa.String(20), nullable=True)
    related_dimensions: Mapped[str] = mapped_column(sa.Text, nullable=False, default="[]")
    ambiguity_notes: Mapped[str] = mapped_column(sa.Text, nullable=False, default="[]")
    why_it_matters: Mapped[str | None] = mapped_column(sa.Text, nullable=True)
    created_at: Mapped[str] = mapped_column(sa.String, nullable=False)


class DimensionSignalModel(Base):
    __tablename__ = "dimension_signals"
    __table_args__ = (
        sa.Index("idx_dimension_signals_run", "analysis_run_id"),
        sa.Index("idx_dimension_signals_run_dim", "analysis_run_id", "dimension_id"),
    )

    signal_id: Mapped[str] = mapped_column(sa.String, primary_key=True)
    analysis_run_id: Mapped[str] = mapped_column(
        sa.String,
        sa.ForeignKey("analysis_runs.analysis_run_id", ondelete="CASCADE"),
        nullable=False,
    )
    member_id: Mapped[str] = mapped_column(sa.String, nullable=False)
    dimension_id: Mapped[str] = mapped_column(sa.String(100), nullable=False)
    source_event_ids: Mapped[str] = mapped_column(sa.Text, nullable=False, default="[]")
    polarity: Mapped[str] = mapped_column(sa.String(20), nullable=False)
    signal_strength: Mapped[float] = mapped_column(sa.Float, nullable=False, default=0.0)
    signal_specificity: Mapped[float] = mapped_column(sa.Float, nullable=False, default=0.0)
    signal_confidence: Mapped[float] = mapped_column(sa.Float, nullable=False, default=0.0)
    opportunity_level: Mapped[str | None] = mapped_column(sa.String(20), nullable=True)
    explanation_summary: Mapped[str | None] = mapped_column(sa.Text, nullable=True)
    created_at: Mapped[str] = mapped_column(sa.String, nullable=False)


class DimensionScoreModel(Base):
    __tablename__ = "dimension_scores"
    __table_args__ = (
        sa.Index("idx_dimension_scores_run", "analysis_run_id"),
        sa.Index("idx_dimension_scores_member", "member_id"),
        sa.UniqueConstraint("analysis_run_id", "dimension_id", name="uq_dim_score_run_dim"),
    )

    score_id: Mapped[str] = mapped_column(sa.String, primary_key=True)
    analysis_run_id: Mapped[str] = mapped_column(
        sa.String,
        sa.ForeignKey("analysis_runs.analysis_run_id", ondelete="CASCADE"),
        nullable=False,
    )
    member_id: Mapped[str] = mapped_column(sa.String, nullable=False)
    dimension_id: Mapped[str] = mapped_column(sa.String(100), nullable=False)
    raw_score: Mapped[float | None] = mapped_column(sa.Float, nullable=True)
    normalized_score: Mapped[float | None] = mapped_column(sa.Float, nullable=True)
    maturity_level: Mapped[str] = mapped_column(sa.String(50), nullable=False)
    confidence_score: Mapped[float] = mapped_column(sa.Float, nullable=False, default=0.0)
    confidence_label: Mapped[str] = mapped_column(sa.String(20), nullable=False, default="low")
    opportunity_score: Mapped[float] = mapped_column(sa.Float, nullable=False, default=0.0)
    opportunity_label: Mapped[str] = mapped_column(sa.String(20), nullable=False, default="none")
    delta_value: Mapped[float | None] = mapped_column(sa.Float, nullable=True)
    delta_label: Mapped[str] = mapped_column(
        sa.String(30), nullable=False, default="not_enough_comparison"
    )
    total_signals: Mapped[int] = mapped_column(sa.Integer, nullable=False, default=0)
    positive_signals: Mapped[int] = mapped_column(sa.Integer, nullable=False, default=0)
    negative_signals: Mapped[int] = mapped_column(sa.Integer, nullable=False, default=0)
    mixed_signals: Mapped[int] = mapped_column(sa.Integer, nullable=False, default=0)
    explanation_summary: Mapped[str | None] = mapped_column(sa.Text, nullable=True)
    limitation_notes: Mapped[str] = mapped_column(sa.Text, nullable=False, default="[]")
    top_supporting_evidence_ids: Mapped[str] = mapped_column(sa.Text, nullable=False, default="[]")
    top_counter_evidence_ids: Mapped[str] = mapped_column(sa.Text, nullable=False, default="[]")
    p3_inference: Mapped[str | None] = mapped_column(sa.Text, nullable=True)
    created_at: Mapped[str] = mapped_column(sa.String, nullable=False)


class CategoryScoreModel(Base):
    __tablename__ = "category_scores"
    __table_args__ = (
        sa.Index("idx_category_scores_run", "analysis_run_id"),
        sa.UniqueConstraint("analysis_run_id", "category_id", name="uq_cat_score_run_cat"),
    )

    category_score_id: Mapped[str] = mapped_column(sa.String, primary_key=True)
    analysis_run_id: Mapped[str] = mapped_column(
        sa.String,
        sa.ForeignKey("analysis_runs.analysis_run_id", ondelete="CASCADE"),
        nullable=False,
    )
    member_id: Mapped[str] = mapped_column(sa.String, nullable=False)
    category_id: Mapped[str] = mapped_column(sa.String(100), nullable=False)
    score: Mapped[float | None] = mapped_column(sa.Float, nullable=True)
    confidence_score: Mapped[float] = mapped_column(sa.Float, nullable=False, default=0.0)
    confidence_label: Mapped[str] = mapped_column(sa.String(20), nullable=False, default="low")
    included_dimensions: Mapped[str] = mapped_column(sa.Text, nullable=False, default="[]")
    excluded_dimensions: Mapped[str] = mapped_column(sa.Text, nullable=False, default="[]")
    explanation_summary: Mapped[str | None] = mapped_column(sa.Text, nullable=True)
    created_at: Mapped[str] = mapped_column(sa.String, nullable=False)


class PersonalBaselineModel(Base):
    __tablename__ = "personal_baselines"
    __table_args__ = (sa.UniqueConstraint("member_id", name="uq_personal_baselines_member"),)

    baseline_id: Mapped[str] = mapped_column(sa.String, primary_key=True)
    member_id: Mapped[str] = mapped_column(sa.String, nullable=False, unique=True)
    baseline_dimensions: Mapped[str] = mapped_column(sa.Text, nullable=False, default="{}")
    created_at: Mapped[str] = mapped_column(sa.String, nullable=False)
    updated_at: Mapped[str] = mapped_column(sa.String, nullable=False)


class AnalysisRunModel(Base):
    __tablename__ = "analysis_runs"
    __table_args__ = (
        sa.Index("idx_analysis_runs_member", "member_id"),
        sa.Index("idx_analysis_runs_status", "status"),
    )

    analysis_run_id: Mapped[str] = mapped_column(sa.String, primary_key=True)
    member_id: Mapped[str] = mapped_column(
        sa.String,
        sa.ForeignKey("members.member_id", ondelete="CASCADE"),
        nullable=False,
    )
    period_start: Mapped[str] = mapped_column(sa.String(10), nullable=False)
    period_end: Mapped[str] = mapped_column(sa.String(10), nullable=False)
    run_type: Mapped[str] = mapped_column(sa.String(50), nullable=False)
    status: Mapped[str] = mapped_column(sa.String(20), nullable=False, default="pending")
    progress_stage: Mapped[str | None] = mapped_column(sa.String(50), nullable=True)
    error_message: Mapped[str | None] = mapped_column(sa.Text, nullable=True)
    created_at: Mapped[str] = mapped_column(sa.String, nullable=False)
    updated_at: Mapped[str] = mapped_column(sa.String, nullable=False)
    completed_at: Mapped[str | None] = mapped_column(sa.String, nullable=True)


class SourcePayloadModel(Base):
    __tablename__ = "source_payloads"
    __table_args__ = (sa.Index("idx_source_payloads_run", "analysis_run_id"),)

    source_payload_id: Mapped[str] = mapped_column(sa.String, primary_key=True)
    analysis_run_id: Mapped[str] = mapped_column(
        sa.String,
        sa.ForeignKey("analysis_runs.analysis_run_id", ondelete="CASCADE"),
        nullable=False,
    )
    source_type: Mapped[str] = mapped_column(sa.String(50), nullable=False)
    source_handle: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    raw_data: Mapped[str] = mapped_column(sa.Text, nullable=False, default="[]")
    record_count: Mapped[int] = mapped_column(sa.Integer, nullable=False, default=0)
    collection_status: Mapped[str] = mapped_column(sa.String(20), nullable=False)
    error_message: Mapped[str | None] = mapped_column(sa.Text, nullable=True)
    collected_at: Mapped[str] = mapped_column(sa.String, nullable=False)
