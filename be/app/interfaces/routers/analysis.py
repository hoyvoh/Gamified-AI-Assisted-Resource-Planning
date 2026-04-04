from fastapi import APIRouter, BackgroundTasks, Depends, Query
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.analysis.use_cases import (
    GetAnalysisRunUseCase,
    ListMemberAnalysisRunsUseCase,
    ListRunValidationFlagsUseCase,
    RefreshAnalysisUseCase,
    TriggerAnalysisUseCase,
    UpsertBaselineUseCase,
    UpsertValidationFlagUseCase,
)
from app.dependencies import (
    get_get_analysis_run_use_case,
    get_list_member_analysis_runs_use_case,
    get_list_run_validation_flags_use_case,
    get_refresh_analysis_use_case,
    get_trigger_analysis_use_case,
    get_upsert_baseline_use_case,
    get_upsert_validation_flag_use_case,
)
from app.domain.shared.exceptions import ConflictError, NotFoundError, ValidationError
from app.infrastructure.analysis.runner import run_analysis_job
from app.infrastructure.db.session import get_session
from app.interfaces.schemas.analysis import (
    AnalysisRunResponse,
    PersonalBaselineResponse,
    RefreshAnalysisRequest,
    TriggerAnalysisRequest,
    UpsertBaselineRequest,
    UpsertValidationFlagRequest,
    ValidationFlagResponse,
)
from app.interfaces.schemas.base import DataEnvelope

router = APIRouter(prefix="/api/v1", tags=["analysis"])


@router.post("/analysis-runs", status_code=202)
async def trigger_analysis(
    body: TriggerAnalysisRequest,
    background_tasks: BackgroundTasks,
    use_case: TriggerAnalysisUseCase = Depends(get_trigger_analysis_use_case),
    session: AsyncSession = Depends(get_session),
) -> JSONResponse:
    try:
        run = await use_case.execute(
            member_id=body.member_id,
            period_start=body.period_start,
            period_end=body.period_end,
            run_type=body.run_type,
        )
    except NotFoundError as exc:
        return JSONResponse(status_code=404, content={"detail": str(exc)})
    except ConflictError as exc:
        return JSONResponse(status_code=409, content={"detail": str(exc)})
    except ValidationError as exc:
        return JSONResponse(status_code=422, content={"detail": str(exc)})

    # Commit the run record NOW so the background task can find it.
    # FastAPI runs background tasks before the dependency cleanup (session.commit),
    # causing a race where get_by_id returns None.
    await session.commit()

    from app.config import get_settings

    settings = get_settings()
    background_tasks.add_task(
        run_analysis_job,
        run_id=run.analysis_run_id,
        llm_settings=settings.llm,
        analysis_settings=settings.analysis,
    )

    payload = AnalysisRunResponse(
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
    return JSONResponse(
        status_code=202,
        content=DataEnvelope[AnalysisRunResponse](data=payload).model_dump(),
    )


@router.get("/analysis-runs/{run_id}")
async def get_analysis_run(
    run_id: str,
    use_case: GetAnalysisRunUseCase = Depends(get_get_analysis_run_use_case),
) -> DataEnvelope[AnalysisRunResponse]:
    try:
        run = await use_case.execute(run_id)
    except NotFoundError as exc:
        return JSONResponse(status_code=404, content={"detail": str(exc)})  # type: ignore[return-value]

    return DataEnvelope[AnalysisRunResponse](
        data=AnalysisRunResponse(
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
    )


@router.get("/members/{member_id}/analysis-runs")
async def list_member_analysis_runs(
    member_id: str,
    limit: int = Query(default=10, ge=1, le=50),
    offset: int = Query(default=0, ge=0),
    use_case: ListMemberAnalysisRunsUseCase = Depends(get_list_member_analysis_runs_use_case),
) -> DataEnvelope[list[AnalysisRunResponse]]:
    try:
        runs = await use_case.execute(member_id, limit=limit, offset=offset)
    except NotFoundError as exc:
        return JSONResponse(status_code=404, content={"detail": str(exc)})  # type: ignore[return-value]

    return DataEnvelope[list[AnalysisRunResponse]](
        data=[
            AnalysisRunResponse(
                analysis_run_id=r.analysis_run_id,
                member_id=r.member_id,
                period_start=r.period_start,
                period_end=r.period_end,
                run_type=r.run_type,
                status=r.status,
                progress_stage=r.progress_stage,
                progress_pct=r.progress_pct,
                error_message=r.error_message,
                scoring_version=r.scoring_version,
                created_at=r.created_at,
                updated_at=r.updated_at,
                completed_at=r.completed_at,
            )
            for r in runs
        ]
    )


@router.post("/members/{member_id}/refresh", status_code=202)
async def refresh_analysis(
    member_id: str,
    body: RefreshAnalysisRequest,
    background_tasks: BackgroundTasks,
    use_case: RefreshAnalysisUseCase = Depends(get_refresh_analysis_use_case),
    session: AsyncSession = Depends(get_session),
) -> JSONResponse:
    try:
        run = await use_case.execute(
            member_id=member_id,
            period_start=body.period_start,
            period_end=body.period_end,
        )
    except NotFoundError as exc:
        return JSONResponse(status_code=404, content={"detail": str(exc)})
    except ConflictError as exc:
        return JSONResponse(status_code=409, content={"detail": str(exc)})
    except ValidationError as exc:
        return JSONResponse(status_code=422, content={"detail": str(exc)})

    await session.commit()

    from app.config import get_settings

    settings = get_settings()
    background_tasks.add_task(
        run_analysis_job,
        run_id=run.analysis_run_id,
        llm_settings=settings.llm,
        analysis_settings=settings.analysis,
    )

    payload = AnalysisRunResponse(
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
    return JSONResponse(
        status_code=202,
        content=DataEnvelope[AnalysisRunResponse](data=payload).model_dump(),
    )


@router.put("/members/{member_id}/baseline")
async def upsert_member_baseline(
    member_id: str,
    body: UpsertBaselineRequest,
    use_case: UpsertBaselineUseCase = Depends(get_upsert_baseline_use_case),
) -> DataEnvelope[PersonalBaselineResponse]:
    try:
        baseline = await use_case.execute(
            member_id=member_id,
            baseline_dimensions=body.baseline_dimensions,
        )
    except NotFoundError as exc:
        return JSONResponse(status_code=404, content={"detail": str(exc)})  # type: ignore[return-value]

    return DataEnvelope[PersonalBaselineResponse](
        data=PersonalBaselineResponse(
            baseline_id=baseline.baseline_id,
            member_id=baseline.member_id,
            baseline_dimensions=baseline.baseline_dimensions,
            created_at=baseline.created_at,
            updated_at=baseline.updated_at,
        )
    )


# ── B8.2 ─────────────────────────────────────────────────────────────────────


@router.post("/validation-flags", status_code=201)
async def upsert_validation_flag(
    body: UpsertValidationFlagRequest,
    use_case: UpsertValidationFlagUseCase = Depends(get_upsert_validation_flag_use_case),
) -> DataEnvelope[ValidationFlagResponse]:
    try:
        flag = await use_case.execute(
            analysis_run_id=body.analysis_run_id,
            dimension_id=body.dimension_id,
            verdict=body.verdict,
            note=body.note,
        )
    except NotFoundError as exc:
        return JSONResponse(status_code=404, content={"detail": str(exc)})  # type: ignore[return-value]
    except ValidationError as exc:
        return JSONResponse(status_code=422, content={"detail": str(exc)})  # type: ignore[return-value]

    return DataEnvelope[ValidationFlagResponse](
        data=ValidationFlagResponse(
            flag_id=flag.flag_id,
            analysis_run_id=flag.analysis_run_id,
            dimension_id=flag.dimension_id,
            verdict=flag.verdict,
            note=flag.note,
            flagged_at=flag.flagged_at,
        )
    )


# ── B8.3 ─────────────────────────────────────────────────────────────────────


@router.get("/analysis-runs/{run_id}/validation-flags")
async def list_run_validation_flags(
    run_id: str,
    use_case: ListRunValidationFlagsUseCase = Depends(get_list_run_validation_flags_use_case),
) -> DataEnvelope[list[ValidationFlagResponse]]:
    try:
        flags = await use_case.execute(run_id)
    except NotFoundError as exc:
        return JSONResponse(status_code=404, content={"detail": str(exc)})  # type: ignore[return-value]

    return DataEnvelope[list[ValidationFlagResponse]](
        data=[
            ValidationFlagResponse(
                flag_id=f.flag_id,
                analysis_run_id=f.analysis_run_id,
                dimension_id=f.dimension_id,
                verdict=f.verdict,
                note=f.note,
                flagged_at=f.flagged_at,
            )
            for f in flags
        ]
    )
