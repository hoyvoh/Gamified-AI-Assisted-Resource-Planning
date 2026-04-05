import json

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.analysis.entities import (
    ANALYSIS_RUN_ACTIVE_STATUSES,
    AnalysisRun,
    AnalysisSnapshot,
    BehavioralEvent,
    CaseFeedback,
    CategoryScore,
    DimensionScore,
    DimensionSignal,
    EvidenceUnit,
    KptItem,
    Milestone,
    PersonalBaseline,
    SourcePayload,
    ValidationFlag,
)
from app.infrastructure.db.base import utcnow
from app.infrastructure.db.models.analysis import (
    AnalysisRunModel,
    AnalysisSnapshotModel,
    BehavioralEventModel,
    CaseFeedbackModel,
    CategoryScoreModel,
    DimensionScoreModel,
    DimensionSignalModel,
    EvidenceUnitModel,
    KptItemModel,
    MilestoneModel,
    PersonalBaselineModel,
    SourcePayloadModel,
    ValidationFlagModel,
)
from app.logger import get_logger

logger = get_logger(__name__)


class SqlAnalysisRunRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(self, run: AnalysisRun) -> None:
        model = AnalysisRunModel(
            analysis_run_id=run.analysis_run_id,
            member_id=run.member_id,
            period_start=run.period_start,
            period_end=run.period_end,
            run_type=run.run_type,
            status=run.status,
            progress_stage=run.progress_stage,
            progress_pct=run.progress_pct,
            error_message=run.error_message,
            scoring_version=run.scoring_version,
            created_at=run.created_at,
            updated_at=run.updated_at,
            completed_at=run.completed_at,
        )
        self._session.add(model)
        await self._session.flush()

    async def get_by_id(self, run_id: str) -> AnalysisRun | None:
        model = await self._session.get(AnalysisRunModel, run_id)
        if model is None:
            logger.debug("run not found: id=%s", run_id)
            return None
        entity = _run_to_entity(model)
        logger.debug(
            "run fetched: id=%s status=%s stage=%s pct=%d member=%s period=%s..%s",
            run_id,
            entity.status,
            entity.progress_stage,
            entity.progress_pct,
            entity.member_id,
            entity.period_start,
            entity.period_end,
        )
        return entity

    async def get_latest_for_member(self, member_id: str) -> AnalysisRun | None:
        stmt = (
            select(AnalysisRunModel)
            .where(AnalysisRunModel.member_id == member_id)
            .order_by(AnalysisRunModel.created_at.desc())
            .limit(1)
        )
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        if model is None:
            logger.debug("latest run not found for member=%s", member_id)
            return None
        entity = _run_to_entity(model)
        logger.debug(
            "latest run for member=%s: id=%s status=%s",
            member_id,
            entity.analysis_run_id,
            entity.status,
        )
        return entity

    async def get_active_for_member(self, member_id: str) -> AnalysisRun | None:
        active_statuses = list(ANALYSIS_RUN_ACTIVE_STATUSES)
        stmt = (
            select(AnalysisRunModel)
            .where(
                AnalysisRunModel.member_id == member_id,
                AnalysisRunModel.status.in_(active_statuses),
            )
            .limit(1)
        )
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        if model is None:
            logger.debug("no active run for member=%s", member_id)
            return None
        entity = _run_to_entity(model)
        logger.debug(
            "active run for member=%s: id=%s status=%s stage=%s",
            member_id,
            entity.analysis_run_id,
            entity.status,
            entity.progress_stage,
        )
        return entity

    async def get_latest_completed_for_member(self, member_id: str) -> AnalysisRun | None:
        stmt = (
            select(AnalysisRunModel)
            .where(
                AnalysisRunModel.member_id == member_id,
                AnalysisRunModel.status == "completed",
            )
            .order_by(AnalysisRunModel.completed_at.desc())
            .limit(1)
        )
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        if model is None:
            logger.debug("no completed run for member=%s", member_id)
            return None
        entity = _run_to_entity(model)
        logger.debug(
            "latest completed run for member=%s: id=%s completed=%s",
            member_id,
            entity.analysis_run_id,
            entity.completed_at,
        )
        return entity

    async def list_by_member(self, member_id: str, limit: int, offset: int) -> list[AnalysisRun]:
        stmt = (
            select(AnalysisRunModel)
            .where(AnalysisRunModel.member_id == member_id)
            .order_by(AnalysisRunModel.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await self._session.execute(stmt)
        entities = [_run_to_entity(m) for m in result.scalars().all()]
        logger.debug(
            "runs listed: member=%s count=%d statuses=%s",
            member_id,
            len(entities),
            [e.status for e in entities],
        )
        return entities

    async def update(self, run: AnalysisRun) -> None:
        model = await self._session.get(AnalysisRunModel, run.analysis_run_id)
        if model is not None:
            model.status = run.status
            model.progress_stage = run.progress_stage
            model.progress_pct = run.progress_pct
            model.error_message = run.error_message
            model.scoring_version = run.scoring_version
            model.completed_at = run.completed_at
            model.updated_at = utcnow()
            await self._session.flush()
            logger.debug(
                "run updated: id=%s status=%s stage=%s pct=%d",
                run.analysis_run_id,
                run.status,
                run.progress_stage,
                run.progress_pct,
            )

    async def list_all_active(self) -> list[AnalysisRun]:
        """Return all runs not in a terminal state (used for startup orphan cleanup)."""
        stmt = select(AnalysisRunModel).where(
            AnalysisRunModel.status.in_(list(ANALYSIS_RUN_ACTIVE_STATUSES))
        )
        result = await self._session.execute(stmt)
        return [_run_to_entity(m) for m in result.scalars().all()]


class SqlSourcePayloadRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(self, payload: SourcePayload) -> None:
        model = SourcePayloadModel(
            source_payload_id=payload.source_payload_id,
            analysis_run_id=payload.analysis_run_id,
            source_type=payload.source_type,
            source_handle=payload.source_handle,
            raw_data=payload.raw_data,
            record_count=payload.record_count,
            collection_status=payload.collection_status,
            error_message=payload.error_message,
            collected_at=payload.collected_at,
        )
        self._session.add(model)
        await self._session.flush()
        logger.debug(
            "payload persisted: run=%s source=%s status=%s records=%d err=%s",
            payload.analysis_run_id,
            payload.source_type,
            payload.collection_status,
            payload.record_count,
            payload.error_message,
        )

    async def list_by_run(self, run_id: str) -> list[SourcePayload]:
        stmt = select(SourcePayloadModel).where(SourcePayloadModel.analysis_run_id == run_id)
        result = await self._session.execute(stmt)
        entities = [_payload_to_entity(m) for m in result.scalars().all()]
        logger.debug("payloads fetched: run=%s count=%d", run_id, len(entities))
        return entities


# ── helpers ───────────────────────────────────────────────────────────────────


def _run_to_entity(model: AnalysisRunModel) -> AnalysisRun:
    return AnalysisRun(
        analysis_run_id=model.analysis_run_id,
        member_id=model.member_id,
        period_start=model.period_start,
        period_end=model.period_end,
        run_type=model.run_type,
        status=model.status,
        progress_stage=model.progress_stage,
        progress_pct=model.progress_pct,
        error_message=model.error_message,
        scoring_version=model.scoring_version,
        created_at=model.created_at,
        updated_at=model.updated_at,
        completed_at=model.completed_at,
    )


def _payload_to_entity(model: SourcePayloadModel) -> SourcePayload:
    return SourcePayload(
        source_payload_id=model.source_payload_id,
        analysis_run_id=model.analysis_run_id,
        source_type=model.source_type,
        source_handle=model.source_handle,
        raw_data=model.raw_data,
        record_count=model.record_count,
        collection_status=model.collection_status,
        error_message=model.error_message,
        collected_at=model.collected_at,
    )


class SqlEvidenceUnitRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def bulk_create(self, units: list[EvidenceUnit]) -> None:
        for unit in units:
            self._session.add(
                EvidenceUnitModel(
                    evidence_id=unit.evidence_id,
                    analysis_run_id=unit.analysis_run_id,
                    member_id=unit.member_id,
                    timestamp=unit.timestamp,
                    source_type=unit.source_type,
                    record_type=unit.record_type,
                    record_id=unit.record_id,
                    content_excerpt=unit.content_excerpt,
                    content_summary=unit.content_summary,
                    extraction_confidence=unit.extraction_confidence,
                    ambiguity_notes=json.dumps(unit.ambiguity_notes),
                    created_at=unit.created_at,
                )
            )
        await self._session.flush()
        if units:
            run_id = units[0].analysis_run_id
            by_source: dict[str, int] = {}
            for u in units:
                by_source[u.source_type or "unknown"] = (
                    by_source.get(u.source_type or "unknown", 0) + 1
                )
            logger.debug(
                "evidence units created: run=%s count=%d by_source=%s",
                run_id,
                len(units),
                by_source,
            )

    async def get_by_id(self, evidence_id: str) -> EvidenceUnit | None:
        model = await self._session.get(EvidenceUnitModel, evidence_id)
        if model is None:
            logger.debug("evidence not found: id=%s", evidence_id)
            return None
        entity = _evidence_to_entity(model)
        logger.debug(
            "evidence fetched: id=%s source=%s record_type=%s",
            evidence_id,
            entity.source_type,
            entity.record_type,
        )
        return entity

    async def list_by_ids(self, evidence_ids: list[str]) -> list[EvidenceUnit]:
        if not evidence_ids:
            return []
        stmt = select(EvidenceUnitModel).where(EvidenceUnitModel.evidence_id.in_(evidence_ids))
        result = await self._session.execute(stmt)
        entities = [_evidence_to_entity(m) for m in result.scalars().all()]
        logger.debug(
            "evidence fetched by ids: requested=%d found=%d", len(evidence_ids), len(entities)
        )
        return entities

    async def list_by_run(self, run_id: str) -> list[EvidenceUnit]:
        stmt = select(EvidenceUnitModel).where(EvidenceUnitModel.analysis_run_id == run_id)
        result = await self._session.execute(stmt)
        entities = [_evidence_to_entity(m) for m in result.scalars().all()]
        logger.debug("evidence units fetched: run=%s count=%d", run_id, len(entities))
        return entities

    async def list_by_run_filtered(
        self,
        run_id: str,
        search: str | None = None,
        sources: list[str] | None = None,
        record_types: list[str] | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[list[EvidenceUnit], int]:
        """Return (items, total_count) for the given filters."""
        from sqlalchemy import func

        base = select(EvidenceUnitModel).where(EvidenceUnitModel.analysis_run_id == run_id)

        if sources:
            base = base.where(EvidenceUnitModel.source_type.in_(sources))
        if record_types:
            base = base.where(EvidenceUnitModel.record_type.in_(record_types))
        if search:
            like = f"%{search}%"
            base = base.where(
                EvidenceUnitModel.content_excerpt.ilike(like)
                | EvidenceUnitModel.content_summary.ilike(like)
            )

        count_stmt = select(func.count()).select_from(base.subquery())
        total: int = (await self._session.execute(count_stmt)).scalar_one()

        items_stmt = base.order_by(EvidenceUnitModel.timestamp.desc()).limit(limit).offset(offset)
        result = await self._session.execute(items_stmt)
        entities = [_evidence_to_entity(m) for m in result.scalars().all()]
        logger.debug(
            "evidence filtered: run=%s search=%r sources=%s record_types=%s returned=%d/%d offset=%d",
            run_id,
            search,
            sources,
            record_types,
            len(entities),
            total,
            offset,
        )
        return entities, total


class SqlBehavioralEventRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def bulk_create(self, events: list[BehavioralEvent]) -> None:
        for ev in events:
            self._session.add(
                BehavioralEventModel(
                    event_id=ev.event_id,
                    analysis_run_id=ev.analysis_run_id,
                    member_id=ev.member_id,
                    timestamp=ev.timestamp,
                    source_evidence_ids=json.dumps(ev.source_evidence_ids),
                    event_type=ev.event_type,
                    event_summary=ev.event_summary,
                    polarity=ev.polarity,
                    severity=ev.severity,
                    event_confidence=ev.event_confidence,
                    impact_level=ev.impact_level,
                    opportunity_level=ev.opportunity_level,
                    related_dimensions=json.dumps(ev.related_dimensions),
                    ambiguity_notes=json.dumps(ev.ambiguity_notes),
                    why_it_matters=ev.why_it_matters,
                    created_at=ev.created_at,
                )
            )
        await self._session.flush()
        if events:
            run_id = events[0].analysis_run_id
            polarities: dict[str, int] = {}
            for e in events:
                polarities[e.polarity] = polarities.get(e.polarity, 0) + 1
            logger.debug(
                "behavioral events created: run=%s count=%d polarities=%s",
                run_id,
                len(events),
                polarities,
            )

    async def list_by_run(self, run_id: str) -> list[BehavioralEvent]:
        stmt = select(BehavioralEventModel).where(BehavioralEventModel.analysis_run_id == run_id)
        result = await self._session.execute(stmt)
        entities = [_event_to_entity(m) for m in result.scalars().all()]
        logger.debug("behavioral events fetched: run=%s count=%d", run_id, len(entities))
        return entities


class SqlDimensionSignalRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def bulk_create(self, signals: list[DimensionSignal]) -> None:
        for s in signals:
            self._session.add(
                DimensionSignalModel(
                    signal_id=s.signal_id,
                    analysis_run_id=s.analysis_run_id,
                    member_id=s.member_id,
                    dimension_id=s.dimension_id,
                    source_event_ids=json.dumps(s.source_event_ids),
                    polarity=s.polarity,
                    signal_strength=s.signal_strength,
                    signal_specificity=s.signal_specificity,
                    signal_confidence=s.signal_confidence,
                    opportunity_level=s.opportunity_level,
                    explanation_summary=s.explanation_summary,
                    created_at=s.created_at,
                )
            )
        await self._session.flush()
        if signals:
            run_id = signals[0].analysis_run_id
            by_dim: dict[str, int] = {}
            for s in signals:
                by_dim[s.dimension_id] = by_dim.get(s.dimension_id, 0) + 1
            logger.debug(
                "dim signals created: run=%s count=%d dims=%s",
                run_id,
                len(signals),
                list(by_dim.keys()),
            )

    async def list_by_run(self, run_id: str) -> list[DimensionSignal]:
        stmt = select(DimensionSignalModel).where(DimensionSignalModel.analysis_run_id == run_id)
        result = await self._session.execute(stmt)
        entities = [_signal_to_entity(m) for m in result.scalars().all()]
        logger.debug("dim signals fetched: run=%s count=%d", run_id, len(entities))
        return entities

    async def list_by_run_and_dimension(
        self, run_id: str, dimension_id: str
    ) -> list[DimensionSignal]:
        stmt = select(DimensionSignalModel).where(
            DimensionSignalModel.analysis_run_id == run_id,
            DimensionSignalModel.dimension_id == dimension_id,
        )
        result = await self._session.execute(stmt)
        entities = [_signal_to_entity(m) for m in result.scalars().all()]
        logger.debug(
            "dim signals fetched: run=%s dim=%s count=%d", run_id, dimension_id, len(entities)
        )
        return entities


class SqlDimensionScoreRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def bulk_create(self, scores: list[DimensionScore]) -> None:  # type: ignore[override]
        for sc in scores:
            self._session.add(
                DimensionScoreModel(
                    score_id=sc.score_id,
                    analysis_run_id=sc.analysis_run_id,
                    member_id=sc.member_id,
                    dimension_id=sc.dimension_id,
                    raw_score=sc.raw_score,
                    normalized_score=sc.normalized_score,
                    maturity_level=sc.maturity_level,
                    confidence_score=sc.confidence_score,
                    confidence_label=sc.confidence_label,
                    opportunity_score=sc.opportunity_score,
                    opportunity_label=sc.opportunity_label,
                    delta_value=sc.delta_value,
                    delta_label=sc.delta_label,
                    total_signals=sc.total_signals,
                    positive_signals=sc.positive_signals,
                    negative_signals=sc.negative_signals,
                    mixed_signals=sc.mixed_signals,
                    explanation_summary=sc.explanation_summary,
                    limitation_notes=json.dumps(sc.limitation_notes),
                    top_supporting_evidence_ids=json.dumps(sc.top_supporting_evidence_ids),
                    top_counter_evidence_ids=json.dumps(sc.top_counter_evidence_ids),
                    p3_inference=json.dumps(sc.p3_inference) if sc.p3_inference else None,
                    ui_summary=sc.ui_summary,
                    created_at=sc.created_at,
                )
            )
        await self._session.flush()
        if scores:
            run_id = scores[0].analysis_run_id
            logger.debug(
                "dim scores created: run=%s count=%d dims=%s",
                run_id,
                len(scores),
                [s.dimension_id for s in scores],
            )

    async def list_by_run(self, run_id: str) -> list[DimensionScore]:
        stmt = select(DimensionScoreModel).where(DimensionScoreModel.analysis_run_id == run_id)
        result = await self._session.execute(stmt)
        entities = [_dim_score_to_entity(m) for m in result.scalars().all()]
        logger.debug(
            "dim scores fetched: run=%s count=%d dims=%s",
            run_id,
            len(entities),
            [e.dimension_id for e in entities],
        )
        return entities

    async def get_by_run_and_dimension(
        self, run_id: str, dimension_id: str
    ) -> DimensionScore | None:
        stmt = select(DimensionScoreModel).where(
            DimensionScoreModel.analysis_run_id == run_id,
            DimensionScoreModel.dimension_id == dimension_id,
        )
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        if model is None:
            logger.debug("dim score not found: run=%s dim=%s", run_id, dimension_id)
            return None
        entity = _dim_score_to_entity(model)
        logger.debug(
            "dim score fetched: run=%s dim=%s maturity=%s score=%s",
            run_id,
            dimension_id,
            entity.maturity_level,
            entity.normalized_score,
        )
        return entity

    async def update_ui_summary(self, run_id: str, dimension_id: str, ui_summary: str) -> None:
        stmt = select(DimensionScoreModel).where(
            DimensionScoreModel.analysis_run_id == run_id,
            DimensionScoreModel.dimension_id == dimension_id,
        )
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        if model is not None:
            model.ui_summary = ui_summary
            await self._session.flush()


class SqlCategoryScoreRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def bulk_create(self, scores: list[CategoryScore]) -> None:
        for sc in scores:
            self._session.add(
                CategoryScoreModel(
                    category_score_id=sc.category_score_id,
                    analysis_run_id=sc.analysis_run_id,
                    member_id=sc.member_id,
                    category_id=sc.category_id,
                    score=sc.score,
                    confidence_score=sc.confidence_score,
                    confidence_label=sc.confidence_label,
                    included_dimensions=json.dumps(sc.included_dimensions),
                    excluded_dimensions=json.dumps(sc.excluded_dimensions),
                    explanation_summary=sc.explanation_summary,
                    created_at=sc.created_at,
                )
            )
        await self._session.flush()
        if scores:
            run_id = scores[0].analysis_run_id
            logger.debug(
                "cat scores created: run=%s count=%d cats=%s",
                run_id,
                len(scores),
                [f"{s.category_id}={s.score}" for s in scores],
            )

    async def list_by_run(self, run_id: str) -> list[CategoryScore]:
        stmt = select(CategoryScoreModel).where(CategoryScoreModel.analysis_run_id == run_id)
        result = await self._session.execute(stmt)
        entities = [_cat_score_to_entity(m) for m in result.scalars().all()]
        logger.debug(
            "cat scores fetched: run=%s count=%d cats=%s",
            run_id,
            len(entities),
            [f"{e.category_id}={e.score}" for e in entities],
        )
        return entities


class SqlPersonalBaselineRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_member(self, member_id: str) -> PersonalBaseline | None:
        stmt = select(PersonalBaselineModel).where(PersonalBaselineModel.member_id == member_id)
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        return _baseline_to_entity(model) if model else None

    async def upsert(self, baseline: PersonalBaseline) -> None:
        existing = await self._session.get(PersonalBaselineModel, baseline.baseline_id)
        if existing:
            existing.baseline_dimensions = json.dumps(baseline.baseline_dimensions)
            existing.updated_at = utcnow()
        else:
            # Check by member_id for true upsert
            stmt = select(PersonalBaselineModel).where(
                PersonalBaselineModel.member_id == baseline.member_id
            )
            result = await self._session.execute(stmt)
            by_member = result.scalar_one_or_none()
            if by_member:
                by_member.baseline_dimensions = json.dumps(baseline.baseline_dimensions)
                by_member.updated_at = utcnow()
            else:
                self._session.add(
                    PersonalBaselineModel(
                        baseline_id=baseline.baseline_id,
                        member_id=baseline.member_id,
                        baseline_dimensions=json.dumps(baseline.baseline_dimensions),
                        created_at=baseline.created_at,
                        updated_at=baseline.updated_at,
                    )
                )
        await self._session.flush()


def _evidence_to_entity(model: EvidenceUnitModel) -> EvidenceUnit:
    return EvidenceUnit(
        evidence_id=model.evidence_id,
        analysis_run_id=model.analysis_run_id,
        member_id=model.member_id,
        timestamp=model.timestamp,
        source_type=model.source_type,
        record_type=model.record_type,
        record_id=model.record_id,
        content_excerpt=model.content_excerpt,
        content_summary=model.content_summary,
        extraction_confidence=model.extraction_confidence,
        ambiguity_notes=json.loads(model.ambiguity_notes or "[]"),
        created_at=model.created_at,
    )


def _event_to_entity(model: BehavioralEventModel) -> BehavioralEvent:
    return BehavioralEvent(
        event_id=model.event_id,
        analysis_run_id=model.analysis_run_id,
        member_id=model.member_id,
        timestamp=model.timestamp,
        source_evidence_ids=json.loads(model.source_evidence_ids or "[]"),
        event_type=model.event_type,
        event_summary=model.event_summary,
        polarity=model.polarity,
        severity=model.severity,
        event_confidence=model.event_confidence,
        impact_level=model.impact_level,
        opportunity_level=model.opportunity_level,
        related_dimensions=json.loads(model.related_dimensions or "[]"),
        ambiguity_notes=json.loads(model.ambiguity_notes or "[]"),
        why_it_matters=model.why_it_matters,
        created_at=model.created_at,
    )


def _signal_to_entity(model: DimensionSignalModel) -> DimensionSignal:
    return DimensionSignal(
        signal_id=model.signal_id,
        analysis_run_id=model.analysis_run_id,
        member_id=model.member_id,
        dimension_id=model.dimension_id,
        source_event_ids=json.loads(model.source_event_ids or "[]"),
        polarity=model.polarity,
        signal_strength=model.signal_strength,
        signal_specificity=model.signal_specificity,
        signal_confidence=model.signal_confidence,
        opportunity_level=model.opportunity_level,
        explanation_summary=model.explanation_summary,
        created_at=model.created_at,
    )


def _dim_score_to_entity(model: DimensionScoreModel) -> DimensionScore:
    return DimensionScore(
        score_id=model.score_id,
        analysis_run_id=model.analysis_run_id,
        member_id=model.member_id,
        dimension_id=model.dimension_id,
        raw_score=model.raw_score,
        normalized_score=model.normalized_score,
        maturity_level=model.maturity_level,
        confidence_score=model.confidence_score,
        confidence_label=model.confidence_label,
        opportunity_score=model.opportunity_score,
        opportunity_label=model.opportunity_label,
        delta_value=model.delta_value,
        delta_label=model.delta_label,
        total_signals=model.total_signals,
        positive_signals=model.positive_signals,
        negative_signals=model.negative_signals,
        mixed_signals=model.mixed_signals,
        explanation_summary=model.explanation_summary,
        limitation_notes=json.loads(model.limitation_notes or "[]"),
        top_supporting_evidence_ids=json.loads(model.top_supporting_evidence_ids or "[]"),
        top_counter_evidence_ids=json.loads(model.top_counter_evidence_ids or "[]"),
        p3_inference=json.loads(model.p3_inference) if model.p3_inference else None,
        ui_summary=model.ui_summary,
        created_at=model.created_at,
    )


def _cat_score_to_entity(model: CategoryScoreModel) -> CategoryScore:
    return CategoryScore(
        category_score_id=model.category_score_id,
        analysis_run_id=model.analysis_run_id,
        member_id=model.member_id,
        category_id=model.category_id,
        score=model.score,
        confidence_score=model.confidence_score,
        confidence_label=model.confidence_label,
        included_dimensions=json.loads(model.included_dimensions or "[]"),
        excluded_dimensions=json.loads(model.excluded_dimensions or "[]"),
        explanation_summary=model.explanation_summary,
        created_at=model.created_at,
    )


def _baseline_to_entity(model: PersonalBaselineModel) -> PersonalBaseline:
    return PersonalBaseline(
        baseline_id=model.baseline_id,
        member_id=model.member_id,
        baseline_dimensions=json.loads(model.baseline_dimensions or "{}"),
        created_at=model.created_at,
        updated_at=model.updated_at,
    )


class SqlKptItemRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def replace_for_run(self, run_id: str, items: list[KptItem]) -> None:
        from sqlalchemy import delete

        await self._session.execute(
            delete(KptItemModel).where(KptItemModel.analysis_run_id == run_id)
        )
        by_type: dict[str, int] = {}
        for item in items:
            by_type[item.item_type] = by_type.get(item.item_type, 0) + 1
            self._session.add(
                KptItemModel(
                    kpt_id=item.kpt_id,
                    analysis_run_id=item.analysis_run_id,
                    member_id=item.member_id,
                    item_type=item.item_type,
                    title=item.title,
                    summary=item.summary,
                    linked_dimension_ids=json.dumps(item.linked_dimension_ids),
                    linked_evidence_ids=json.dumps(item.linked_evidence_ids),
                    linked_problem_ids=json.dumps(item.linked_problem_ids),
                    display_order=item.display_order,
                    created_at=item.created_at,
                )
            )
        await self._session.flush()
        logger.debug("kpt items replaced: run=%s total=%d by_type=%s", run_id, len(items), by_type)

    async def list_by_run(self, run_id: str) -> list[KptItem]:
        stmt = (
            select(KptItemModel)
            .where(KptItemModel.analysis_run_id == run_id)
            .order_by(KptItemModel.item_type, KptItemModel.display_order)
        )
        result = await self._session.execute(stmt)
        entities = [_kpt_to_entity(m) for m in result.scalars().all()]
        keep = sum(1 for e in entities if e.item_type == "keep")
        problem = sum(1 for e in entities if e.item_type == "problem")
        try_ = sum(1 for e in entities if e.item_type == "try")
        logger.debug(
            "kpt items fetched: run=%s total=%d keep=%d problem=%d try=%d",
            run_id,
            len(entities),
            keep,
            problem,
            try_,
        )
        return entities


class SqlCaseFeedbackRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def replace_for_run(self, run_id: str, cases: list[CaseFeedback]) -> None:
        from sqlalchemy import delete

        await self._session.execute(
            delete(CaseFeedbackModel).where(CaseFeedbackModel.analysis_run_id == run_id)
        )
        for case in cases:
            self._session.add(
                CaseFeedbackModel(
                    case_id=case.case_id,
                    analysis_run_id=case.analysis_run_id,
                    member_id=case.member_id,
                    title=case.title,
                    category=case.category,
                    impact_level=case.impact_level,
                    summary=case.summary,
                    why_it_matters=case.why_it_matters,
                    observed_pattern=case.observed_pattern,
                    better_alternative=case.better_alternative,
                    next_time_guidance=case.next_time_guidance,
                    linked_dimension_ids=json.dumps(case.linked_dimension_ids),
                    supporting_event_ids=json.dumps(case.supporting_event_ids),
                    confidence_score=case.confidence_score,
                    display_order=case.display_order,
                    created_at=case.created_at,
                )
            )
        await self._session.flush()
        logger.debug("cases replaced: run=%s count=%d", run_id, len(cases))

    async def get_by_id(self, case_id: str) -> CaseFeedback | None:
        model = await self._session.get(CaseFeedbackModel, case_id)
        if model is None:
            logger.debug("case not found: id=%s", case_id)
            return None
        entity = _case_to_entity(model)
        logger.debug(
            "case fetched: id=%s title=%r impact=%s", case_id, entity.title, entity.impact_level
        )
        return entity

    async def list_by_run(self, run_id: str) -> list[CaseFeedback]:
        stmt = (
            select(CaseFeedbackModel)
            .where(CaseFeedbackModel.analysis_run_id == run_id)
            .order_by(CaseFeedbackModel.display_order)
        )
        result = await self._session.execute(stmt)
        entities = [_case_to_entity(m) for m in result.scalars().all()]
        logger.debug("cases fetched: run=%s count=%d", run_id, len(entities))
        return entities


class SqlMilestoneRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def append(self, milestones: list[Milestone]) -> None:
        for m in milestones:
            self._session.add(
                MilestoneModel(
                    milestone_id=m.milestone_id,
                    member_id=m.member_id,
                    source_analysis_run_id=m.source_analysis_run_id,
                    timestamp=m.timestamp,
                    milestone_type=m.milestone_type,
                    title=m.title,
                    summary=m.summary,
                    impact_score=m.impact_score,
                    supporting_event_ids=json.dumps(m.supporting_event_ids),
                    supporting_evidence_ids=json.dumps(m.supporting_evidence_ids),
                    retained=1 if m.retained else 0,
                    created_at=m.created_at,
                )
            )
        await self._session.flush()
        if milestones:
            logger.debug(
                "milestones appended: member=%s count=%d", milestones[0].member_id, len(milestones)
            )

    async def list_by_member(self, member_id: str) -> list[Milestone]:
        stmt = (
            select(MilestoneModel)
            .where(MilestoneModel.member_id == member_id, MilestoneModel.retained == 1)
            .order_by(MilestoneModel.timestamp)
        )
        result = await self._session.execute(stmt)
        entities = [_milestone_to_entity(m) for m in result.scalars().all()]
        logger.debug("milestones fetched: member=%s count=%d", member_id, len(entities))
        return entities


class SqlAnalysisSnapshotRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def upsert(self, snapshot: AnalysisSnapshot) -> None:
        stmt = select(AnalysisSnapshotModel).where(
            AnalysisSnapshotModel.analysis_run_id == snapshot.analysis_run_id
        )
        result = await self._session.execute(stmt)
        existing = result.scalar_one_or_none()
        if existing:
            existing.overall_confidence = snapshot.overall_confidence
            existing.profile_summary = snapshot.profile_summary
            existing.growth_journey_summary = snapshot.growth_journey_summary
            existing.top_strength_dimension_ids = json.dumps(snapshot.top_strength_dimension_ids)
            existing.top_growth_dimension_ids = json.dumps(snapshot.top_growth_dimension_ids)
            existing.current_growth_path = snapshot.current_growth_path
            existing.fairness_notes = json.dumps(snapshot.fairness_notes)
            existing.insufficient_dimensions = json.dumps(snapshot.insufficient_dimensions)
            existing.flagged_items_count = snapshot.flagged_items_count
            existing.p8_approved = 1 if snapshot.p8_approved else 0
            existing.p8_issues = json.dumps(snapshot.p8_issues)
        else:
            self._session.add(
                AnalysisSnapshotModel(
                    snapshot_id=snapshot.snapshot_id,
                    analysis_run_id=snapshot.analysis_run_id,
                    member_id=snapshot.member_id,
                    period_start=snapshot.period_start,
                    period_end=snapshot.period_end,
                    generated_at=snapshot.generated_at,
                    overall_confidence=snapshot.overall_confidence,
                    profile_summary=snapshot.profile_summary,
                    growth_journey_summary=snapshot.growth_journey_summary,
                    top_strength_dimension_ids=json.dumps(snapshot.top_strength_dimension_ids),
                    top_growth_dimension_ids=json.dumps(snapshot.top_growth_dimension_ids),
                    current_growth_path=snapshot.current_growth_path,
                    fairness_notes=json.dumps(snapshot.fairness_notes),
                    insufficient_dimensions=json.dumps(snapshot.insufficient_dimensions),
                    flagged_items_count=snapshot.flagged_items_count,
                    p8_approved=1 if snapshot.p8_approved else 0,
                    p8_issues=json.dumps(snapshot.p8_issues),
                )
            )
        await self._session.flush()

    async def get_by_run(self, run_id: str) -> AnalysisSnapshot | None:
        stmt = select(AnalysisSnapshotModel).where(AnalysisSnapshotModel.analysis_run_id == run_id)
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        if model is None:
            logger.debug("snapshot not found: run=%s", run_id)
            return None
        entity = _snapshot_to_entity(model)
        logger.debug(
            "snapshot fetched: run=%s approved=%s confidence=%s strengths=%d growth=%d",
            run_id,
            entity.p8_approved,
            entity.overall_confidence,
            len(entity.top_strength_dimension_ids),
            len(entity.top_growth_dimension_ids),
        )
        return entity


def _kpt_to_entity(model: KptItemModel) -> KptItem:
    return KptItem(
        kpt_id=model.kpt_id,
        analysis_run_id=model.analysis_run_id,
        member_id=model.member_id,
        item_type=model.item_type,
        title=model.title,
        summary=model.summary,
        linked_dimension_ids=json.loads(model.linked_dimension_ids or "[]"),
        linked_evidence_ids=json.loads(model.linked_evidence_ids or "[]"),
        linked_problem_ids=json.loads(model.linked_problem_ids or "[]"),
        display_order=model.display_order,
        created_at=model.created_at,
    )


def _case_to_entity(model: CaseFeedbackModel) -> CaseFeedback:
    return CaseFeedback(
        case_id=model.case_id,
        analysis_run_id=model.analysis_run_id,
        member_id=model.member_id,
        title=model.title,
        category=model.category,
        impact_level=model.impact_level,
        summary=model.summary,
        why_it_matters=model.why_it_matters,
        observed_pattern=model.observed_pattern,
        better_alternative=model.better_alternative,
        next_time_guidance=model.next_time_guidance,
        linked_dimension_ids=json.loads(model.linked_dimension_ids or "[]"),
        supporting_event_ids=json.loads(model.supporting_event_ids or "[]"),
        confidence_score=model.confidence_score,
        display_order=model.display_order,
        created_at=model.created_at,
    )


def _milestone_to_entity(model: MilestoneModel) -> Milestone:
    return Milestone(
        milestone_id=model.milestone_id,
        member_id=model.member_id,
        source_analysis_run_id=model.source_analysis_run_id,
        timestamp=model.timestamp,
        milestone_type=model.milestone_type,
        title=model.title,
        summary=model.summary,
        impact_score=model.impact_score,
        supporting_event_ids=json.loads(model.supporting_event_ids or "[]"),
        supporting_evidence_ids=json.loads(model.supporting_evidence_ids or "[]"),
        retained=bool(model.retained),
        created_at=model.created_at,
    )


def _snapshot_to_entity(model: AnalysisSnapshotModel) -> AnalysisSnapshot:
    return AnalysisSnapshot(
        snapshot_id=model.snapshot_id,
        analysis_run_id=model.analysis_run_id,
        member_id=model.member_id,
        period_start=model.period_start,
        period_end=model.period_end,
        generated_at=model.generated_at,
        overall_confidence=model.overall_confidence,
        profile_summary=model.profile_summary,
        growth_journey_summary=model.growth_journey_summary,
        top_strength_dimension_ids=json.loads(model.top_strength_dimension_ids or "[]"),
        top_growth_dimension_ids=json.loads(model.top_growth_dimension_ids or "[]"),
        current_growth_path=model.current_growth_path,
        fairness_notes=json.loads(model.fairness_notes or "[]"),
        insufficient_dimensions=json.loads(model.insufficient_dimensions or "[]"),
        flagged_items_count=model.flagged_items_count,
        p8_approved=bool(model.p8_approved),
        p8_issues=json.loads(model.p8_issues or "[]"),
    )


class SqlValidationFlagRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def upsert(self, flag: ValidationFlag) -> None:
        """Insert or update flag keyed on (analysis_run_id, dimension_id)."""
        stmt = select(ValidationFlagModel).where(
            ValidationFlagModel.analysis_run_id == flag.analysis_run_id,
            ValidationFlagModel.dimension_id == flag.dimension_id,
        )
        result = await self._session.execute(stmt)
        existing = result.scalar_one_or_none()
        if existing:
            existing.verdict = flag.verdict
            existing.note = flag.note
            existing.flagged_at = flag.flagged_at
        else:
            self._session.add(
                ValidationFlagModel(
                    flag_id=flag.flag_id,
                    analysis_run_id=flag.analysis_run_id,
                    dimension_id=flag.dimension_id,
                    verdict=flag.verdict,
                    note=flag.note,
                    flagged_at=flag.flagged_at,
                )
            )
        await self._session.flush()

    async def list_by_run(self, run_id: str) -> list[ValidationFlag]:
        stmt = (
            select(ValidationFlagModel)
            .where(ValidationFlagModel.analysis_run_id == run_id)
            .order_by(ValidationFlagModel.flagged_at)
        )
        result = await self._session.execute(stmt)
        entities = [_flag_to_entity(m) for m in result.scalars().all()]
        logger.debug(
            "validation flags fetched: run=%s count=%d verdicts=%s",
            run_id,
            len(entities),
            [e.verdict for e in entities],
        )
        return entities

    async def count_by_run(self, run_id: str) -> int:
        from sqlalchemy import func

        stmt = select(func.count()).where(ValidationFlagModel.analysis_run_id == run_id)
        result = await self._session.execute(stmt)
        return result.scalar_one()


def _flag_to_entity(model: ValidationFlagModel) -> ValidationFlag:
    return ValidationFlag(
        flag_id=model.flag_id,
        analysis_run_id=model.analysis_run_id,
        dimension_id=model.dimension_id,
        verdict=model.verdict,
        note=model.note,
        flagged_at=model.flagged_at,
    )
