"""M9 integration & hardening tests.

B9.1 — E2E happy path: seed completed run data, verify all profile/validation endpoints.
B9.2 — Scoring engine performance: 100 events x 25 dims must finish < 1 s.
B9.3 — Same-period refresh: flags + milestones from old run survive.
B9.4 — Analysis run history ordered correctly (endpoint from B2.5).
"""

import time
import uuid

from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.analysis.entities import (
    AnalysisRun,
    AnalysisSnapshot,
    BehavioralEvent,
    CaseFeedback,
    CategoryScore,
    DimensionScore,
    EvidenceUnit,
    KptItem,
    Milestone,
)
from app.domain.analysis.scoring_engine import (
    ScoringInput,
    compute_category_scores,
    compute_dimension_scores,
)
from app.domain.analysis.taxonomy import DIMENSIONS
from app.infrastructure.db.base import utcnow
from app.infrastructure.db.repositories.analysis import (
    SqlAnalysisRunRepository,
    SqlAnalysisSnapshotRepository,
    SqlBehavioralEventRepository,
    SqlCaseFeedbackRepository,
    SqlCategoryScoreRepository,
    SqlDimensionScoreRepository,
    SqlEvidenceUnitRepository,
    SqlKptItemRepository,
    SqlMilestoneRepository,
)

# ── shared helpers ────────────────────────────────────────────────────────────

_PERIOD_START = "2024-01-01"
_PERIOD_END = "2024-03-31"  # 3-month window


async def _create_member(client: AsyncClient) -> dict:  # type: ignore[type-arg]
    org_r = await client.post("/api/v1/organizations", json={"name": "Acme"})
    org_id = org_r.json()["data"]["organization_id"]
    team_r = await client.post(f"/api/v1/organizations/{org_id}/teams", json={"name": "Eng"})
    team_id = team_r.json()["data"]["team_id"]
    mem_r = await client.post(
        f"/api/v1/organizations/{org_id}/teams/{team_id}/members",
        json={"display_name": "Bob", "external_id": "bob-gh"},
    )
    result: dict = mem_r.json()["data"]  # type: ignore[type-arg]
    return result


async def _seed_completed_run(
    member_id: str,
    db_session: AsyncSession,
    created_at: str | None = None,
) -> tuple[str, str, str, str]:
    """Insert a completed analysis run with full profile data.

    Returns (run_id, evidence_id, case_id, milestone_id).
    """
    now = created_at or utcnow()
    run_id = str(uuid.uuid4())
    evidence_id = str(uuid.uuid4())
    case_id = str(uuid.uuid4())
    milestone_id = str(uuid.uuid4())

    run_repo = SqlAnalysisRunRepository(db_session)
    await run_repo.create(
        AnalysisRun(
            analysis_run_id=run_id,
            member_id=member_id,
            period_start=_PERIOD_START,
            period_end=_PERIOD_END,
            run_type="fresh",
            status="completed",
            progress_stage=None,
            error_message=None,
            scoring_version="1.0",
            created_at=now,
            updated_at=now,
            completed_at=now,
        )
    )

    # Evidence unit
    ev_repo = SqlEvidenceUnitRepository(db_session)
    await ev_repo.bulk_create(
        [
            EvidenceUnit(
                evidence_id=evidence_id,
                analysis_run_id=run_id,
                member_id=member_id,
                timestamp=now,
                source_type="github",
                record_id="pr-1",
                content_excerpt="Reviewed PR with thorough feedback.",
                content_summary="Code review feedback",
                extraction_confidence=0.9,
                ambiguity_notes=[],
                created_at=now,
            )
        ]
    )

    # Behavioral event
    event_repo = SqlBehavioralEventRepository(db_session)
    await event_repo.bulk_create(
        [
            BehavioralEvent(
                event_id=str(uuid.uuid4()),
                analysis_run_id=run_id,
                member_id=member_id,
                timestamp=now,
                source_evidence_ids=[evidence_id],
                event_type="review_feedback",
                event_summary="Provided detailed code review",
                polarity="positive",
                severity=0.7,
                event_confidence=0.85,
                impact_level="medium",
                opportunity_level="high",
                related_dimensions=[
                    {"dimension_id": "code_quality_discipline", "relation_strength": 0.8}
                ],
                ambiguity_notes=[],
                why_it_matters="Demonstrates quality mindset",
                created_at=now,
            )
        ]
    )

    # Dimension scores
    dim_repo = SqlDimensionScoreRepository(db_session)
    dim_score_id = str(uuid.uuid4())
    await dim_repo.bulk_create(
        [
            DimensionScore(
                score_id=dim_score_id,
                analysis_run_id=run_id,
                member_id=member_id,
                dimension_id="code_quality_discipline",
                raw_score=3.5,
                normalized_score=3.5,
                maturity_level="reliable",
                confidence_score=0.75,
                confidence_label="moderate",
                opportunity_score=0.8,
                opportunity_label="high",
                delta_value=0.3,
                delta_label="stable",
                total_signals=5,
                positive_signals=4,
                negative_signals=1,
                mixed_signals=0,
                explanation_summary="Consistent code quality practices observed.",
                limitation_notes=["Limited sample size"],
                top_supporting_evidence_ids=[evidence_id],
                top_counter_evidence_ids=[],
                p3_inference={"maturity_state": "reliable", "confidence_score": 0.75},
                ui_summary="Bob shows reliable code quality discipline in this period.",
                created_at=now,
            )
        ]
    )

    # Category score
    cat_repo = SqlCategoryScoreRepository(db_session)
    await cat_repo.bulk_create(
        [
            CategoryScore(
                category_score_id=str(uuid.uuid4()),
                analysis_run_id=run_id,
                member_id=member_id,
                category_id="core_technical_execution",
                score=3.5,
                confidence_score=0.75,
                confidence_label="moderate",
                included_dimensions=["code_quality_discipline"],
                excluded_dimensions=[],
                explanation_summary="Core technical execution is reliable.",
                created_at=now,
            )
        ]
    )

    # KPT items
    kpt_repo = SqlKptItemRepository(db_session)
    await kpt_repo.replace_for_run(
        run_id,
        [
            KptItem(
                kpt_id=str(uuid.uuid4()),
                analysis_run_id=run_id,
                member_id=member_id,
                item_type="keep",
                title="Thorough code reviews",
                summary="Continue detailed review feedback.",
                linked_dimension_ids=["code_quality_discipline"],
                linked_evidence_ids=[],
                linked_problem_ids=[],
                display_order=0,
                created_at=now,
            ),
            KptItem(
                kpt_id=str(uuid.uuid4()),
                analysis_run_id=run_id,
                member_id=member_id,
                item_type="problem",
                title="Occasional late status updates",
                summary="Status reporting can be more timely.",
                linked_dimension_ids=["horenso_reporting_discipline"],
                linked_evidence_ids=[],
                linked_problem_ids=[],
                display_order=1,
                created_at=now,
            ),
            KptItem(
                kpt_id=str(uuid.uuid4()),
                analysis_run_id=run_id,
                member_id=member_id,
                item_type="try",
                title="Daily standups update by 9am",
                summary="Try updating daily standup before 9am.",
                linked_dimension_ids=["horenso_reporting_discipline"],
                linked_evidence_ids=[],
                linked_problem_ids=[],
                display_order=2,
                created_at=now,
            ),
        ],
    )

    # Case feedback
    case_repo = SqlCaseFeedbackRepository(db_session)
    await case_repo.replace_for_run(
        run_id,
        [
            CaseFeedback(
                case_id=case_id,
                analysis_run_id=run_id,
                member_id=member_id,
                title="PR review depth",
                category="quality",
                impact_level="medium",
                summary="Bob's PR reviews cover edge cases well.",
                why_it_matters="Reduces post-merge bugs.",
                observed_pattern="Reviews typically 5+ comments.",
                better_alternative=None,
                next_time_guidance="Keep the depth, consider inline suggestions.",
                linked_dimension_ids=["code_quality_discipline"],
                supporting_event_ids=[],
                confidence_score=0.8,
                display_order=0,
                created_at=now,
            )
        ],
    )

    # Milestone
    milestone_repo = SqlMilestoneRepository(db_session)
    await milestone_repo.append(
        [
            Milestone(
                milestone_id=milestone_id,
                member_id=member_id,
                source_analysis_run_id=run_id,
                timestamp=now,
                milestone_type="delivery_completion",
                title="Shipped critical feature on time",
                summary="Delivered the auth module ahead of schedule.",
                impact_score=0.9,
                supporting_event_ids=[],
                supporting_evidence_ids=[evidence_id],
                retained=True,
                created_at=now,
            )
        ]
    )

    # Snapshot
    snapshot_repo = SqlAnalysisSnapshotRepository(db_session)
    await snapshot_repo.upsert(
        AnalysisSnapshot(
            snapshot_id=str(uuid.uuid4()),
            analysis_run_id=run_id,
            member_id=member_id,
            period_start=_PERIOD_START,
            period_end=_PERIOD_END,
            generated_at=now,
            overall_confidence=0.75,
            profile_summary="Bob is a reliable engineer with strong code quality practices.",
            growth_journey_summary="Showing steady improvement over this period.",
            top_strength_dimension_ids=["code_quality_discipline"],
            top_growth_dimension_ids=["horenso_reporting_discipline"],
            current_growth_path="Reliable Executor",
            fairness_notes=["Scores derived from observed patterns."],
            insufficient_dimensions=[],
            flagged_items_count=0,
            p8_approved=True,
            p8_issues=[],
        )
    )

    await db_session.flush()
    return run_id, evidence_id, case_id, milestone_id


# ── B9.1 — E2E happy path ─────────────────────────────────────────────────────


async def test_e2e_profile_overview(client: AsyncClient, db_session: AsyncSession) -> None:
    member = await _create_member(client)
    member_id = member["member_id"]
    await _seed_completed_run(member_id, db_session)

    resp = await client.get(f"/api/v1/members/{member_id}/profile/overview")
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["member_id"] == member_id
    assert data["p8_approved"] is True
    assert data["profile_summary"] is not None
    assert isinstance(data["category_scores"], list)
    assert len(data["category_scores"]) >= 1


async def test_e2e_profile_competency(client: AsyncClient, db_session: AsyncSession) -> None:
    member = await _create_member(client)
    member_id = member["member_id"]
    await _seed_completed_run(member_id, db_session)

    resp = await client.get(f"/api/v1/members/{member_id}/profile/competency")
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert len(data["dimension_scores"]) >= 1
    ds = data["dimension_scores"][0]
    assert ds["dimension_id"] == "code_quality_discipline"
    assert ds["maturity_level"] == "reliable"
    assert ds["ui_summary"] is not None


async def test_e2e_profile_competency_category_filter(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    member = await _create_member(client)
    member_id = member["member_id"]
    await _seed_completed_run(member_id, db_session)

    resp = await client.get(
        f"/api/v1/members/{member_id}/profile/competency",
        params={"category": "core_technical_execution"},
    )
    assert resp.status_code == 200
    scores = resp.json()["data"]["dimension_scores"]
    # code_quality_discipline belongs to core_technical_execution
    assert any(s["dimension_id"] == "code_quality_discipline" for s in scores)


async def test_e2e_profile_dimension_detail(client: AsyncClient, db_session: AsyncSession) -> None:
    member = await _create_member(client)
    member_id = member["member_id"]
    _, _, _, _ = await _seed_completed_run(member_id, db_session)

    resp = await client.get(
        f"/api/v1/members/{member_id}/profile/competency/code_quality_discipline"
    )
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["dimension_score"]["dimension_id"] == "code_quality_discipline"
    assert data["dimension_score"]["p3_inference"] is not None
    assert isinstance(data["supporting_evidence"], list)
    assert isinstance(data["behavioral_events"], list)


async def test_e2e_profile_kpt(client: AsyncClient, db_session: AsyncSession) -> None:
    member = await _create_member(client)
    member_id = member["member_id"]
    await _seed_completed_run(member_id, db_session)

    resp = await client.get(f"/api/v1/members/{member_id}/profile/kpt")
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert len(data["keep_items"]) == 1
    assert len(data["problem_items"]) == 1
    assert len(data["try_items"]) == 1
    assert data["keep_items"][0]["title"] == "Thorough code reviews"


async def test_e2e_profile_cases(client: AsyncClient, db_session: AsyncSession) -> None:
    member = await _create_member(client)
    member_id = member["member_id"]
    await _seed_completed_run(member_id, db_session)

    resp = await client.get(f"/api/v1/members/{member_id}/profile/cases")
    assert resp.status_code == 200
    cases = resp.json()["data"]["cases"]
    assert len(cases) == 1
    assert cases[0]["title"] == "PR review depth"


async def test_e2e_profile_case_detail(client: AsyncClient, db_session: AsyncSession) -> None:
    member = await _create_member(client)
    member_id = member["member_id"]
    _, _, case_id, _ = await _seed_completed_run(member_id, db_session)

    resp = await client.get(f"/api/v1/members/{member_id}/profile/cases/{case_id}")
    assert resp.status_code == 200
    assert resp.json()["data"]["case_id"] == case_id


async def test_e2e_profile_journey(client: AsyncClient, db_session: AsyncSession) -> None:
    member = await _create_member(client)
    member_id = member["member_id"]
    await _seed_completed_run(member_id, db_session)

    resp = await client.get(f"/api/v1/members/{member_id}/profile/journey")
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["growth_journey_summary"] is not None
    assert len(data["milestones"]) == 1
    assert data["milestones"][0]["title"] == "Shipped critical feature on time"


async def test_e2e_evidence_trace(client: AsyncClient, db_session: AsyncSession) -> None:
    member = await _create_member(client)
    member_id = member["member_id"]
    _, evidence_id, _, _ = await _seed_completed_run(member_id, db_session)

    resp = await client.get(f"/api/v1/evidence/{evidence_id}")
    assert resp.status_code == 200
    assert resp.json()["data"]["evidence_id"] == evidence_id
    assert resp.json()["data"]["source_type"] == "github"


async def test_e2e_member_milestones(client: AsyncClient, db_session: AsyncSession) -> None:
    member = await _create_member(client)
    member_id = member["member_id"]
    await _seed_completed_run(member_id, db_session)

    resp = await client.get(f"/api/v1/members/{member_id}/milestones")
    assert resp.status_code == 200
    milestones = resp.json()["data"]["milestones"]
    assert len(milestones) == 1


async def test_e2e_validation_flag_roundtrip(client: AsyncClient, db_session: AsyncSession) -> None:
    member = await _create_member(client)
    member_id = member["member_id"]
    run_id, _, _, _ = await _seed_completed_run(member_id, db_session)

    # Post a flag
    post_r = await client.post(
        "/api/v1/validation-flags",
        json={
            "analysis_run_id": run_id,
            "dimension_id": "code_quality_discipline",
            "verdict": "questionable",
            "note": "Score seems too high given limited data.",
        },
    )
    assert post_r.status_code == 201
    flag = post_r.json()["data"]
    assert flag["verdict"] == "questionable"
    assert flag["dimension_id"] == "code_quality_discipline"

    # Upsert same dim with new verdict
    post_r2 = await client.post(
        "/api/v1/validation-flags",
        json={
            "analysis_run_id": run_id,
            "dimension_id": "code_quality_discipline",
            "verdict": "accurate",
        },
    )
    assert post_r2.status_code == 201

    # Get flags — should be one (upsert replaced)
    get_r = await client.get(f"/api/v1/analysis-runs/{run_id}/validation-flags")
    assert get_r.status_code == 200
    flags = get_r.json()["data"]
    assert len(flags) == 1
    assert flags[0]["verdict"] == "accurate"


async def test_e2e_profile_endpoints_404_without_completed_run(
    client: AsyncClient,
) -> None:
    member = await _create_member(client)
    member_id = member["member_id"]

    # No completed run seeded → all profile endpoints should 404
    for path in [
        f"/api/v1/members/{member_id}/profile/overview",
        f"/api/v1/members/{member_id}/profile/competency",
        f"/api/v1/members/{member_id}/profile/kpt",
        f"/api/v1/members/{member_id}/profile/cases",
        f"/api/v1/members/{member_id}/profile/journey",
    ]:
        resp = await client.get(path)
        assert resp.status_code == 404, f"Expected 404 for {path}, got {resp.status_code}"


# ── B9.2 — Scoring engine performance ────────────────────────────────────────


def test_scoring_engine_performance_under_1s() -> None:
    """Scoring engine (pure Python, no I/O) must complete 100 events x 25 dims < 1 s."""
    now = utcnow()
    run_id = str(uuid.uuid4())
    member_id = str(uuid.uuid4())
    dim_ids = list(DIMENSIONS.keys())  # 25 dimensions

    # 100 behavioral events spread across all dimensions
    events: list[BehavioralEvent] = []
    for i in range(100):
        dim_id = dim_ids[i % len(dim_ids)]
        events.append(
            BehavioralEvent(
                event_id=str(uuid.uuid4()),
                analysis_run_id=run_id,
                member_id=member_id,
                timestamp=now,
                source_evidence_ids=[],
                event_type="delivery_completion",
                event_summary=f"Event {i}",
                polarity="positive" if i % 3 != 0 else "negative",
                severity=0.6,
                event_confidence=0.8,
                impact_level="medium",
                opportunity_level="high",
                related_dimensions=[{"dimension_id": dim_id, "relation_strength": 0.7}],
                ambiguity_notes=[],
                why_it_matters=None,
                created_at=now,
            )
        )

    # Minimal P3 inference for each dimension (matching P3 prompt output schema)
    p3_inferences = {
        dim_id: {
            "maturity_state": "reliable",
            "confidence_score": 0.75,
            "opportunity_assessment": {"label": "high", "score": 0.8},
            "supporting_event_ids": [],
            "counter_event_ids": [],
            "explanation": "Test inference.",
        }
        for dim_id in dim_ids
    }

    inp = ScoringInput(
        run_id=run_id,
        member_id=member_id,
        behavioral_events=events,
        p3_inferences=p3_inferences,
        previous_scores={},
        role_dimension_weights={},
        now=now,
    )

    start = time.perf_counter()
    dim_scores = compute_dimension_scores(inp)
    cat_scores = compute_category_scores(
        dimension_scores=dim_scores,
        run_id=run_id,
        member_id=member_id,
        role_dimension_weights={},
        now=now,
    )
    elapsed = time.perf_counter() - start

    assert len(dim_scores) == 25, f"Expected 25 dimension scores, got {len(dim_scores)}"
    assert len(cat_scores) == 4, f"Expected 4 category scores, got {len(cat_scores)}"
    assert elapsed < 1.0, f"Scoring took {elapsed:.3f}s — exceeds 1s budget"


# ── B9.3 — Refresh preserves flags + milestones ───────────────────────────────


async def test_refresh_preserves_flags_and_milestones(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """After same-period refresh, old run's flags and all milestones are preserved."""
    member = await _create_member(client)
    member_id = member["member_id"]
    old_run_id, _, _, milestone_id = await _seed_completed_run(member_id, db_session)

    # Add a flag on the old run
    flag_r = await client.post(
        "/api/v1/validation-flags",
        json={
            "analysis_run_id": old_run_id,
            "dimension_id": "code_quality_discipline",
            "verdict": "questionable",
        },
    )
    assert flag_r.status_code == 201

    # Trigger a new run (refresh) — old run is completed so no conflict
    refresh_r = await client.post(
        f"/api/v1/members/{member_id}/refresh",
        json={"period_start": _PERIOD_START, "period_end": _PERIOD_END},
    )
    assert refresh_r.status_code == 202
    new_run_id = refresh_r.json()["data"]["analysis_run_id"]
    assert new_run_id != old_run_id

    # Old flag still accessible on old run
    flags_r = await client.get(f"/api/v1/analysis-runs/{old_run_id}/validation-flags")
    assert flags_r.status_code == 200
    assert len(flags_r.json()["data"]) == 1
    assert flags_r.json()["data"][0]["verdict"] == "questionable"

    # New run has no flags yet
    new_flags_r = await client.get(f"/api/v1/analysis-runs/{new_run_id}/validation-flags")
    assert new_flags_r.status_code == 200
    assert len(new_flags_r.json()["data"]) == 0

    # Milestone survived (member-scoped, not run-scoped)
    milestones_r = await client.get(f"/api/v1/members/{member_id}/milestones")
    assert milestones_r.status_code == 200
    milestone_ids = [m["milestone_id"] for m in milestones_r.json()["data"]["milestones"]]
    assert milestone_id in milestone_ids


# ── B9.4 — Analysis run history ───────────────────────────────────────────────


async def test_run_history_ordered_newest_first(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """GET /members/:id/analysis-runs returns runs newest-first and includes completed ones."""
    member = await _create_member(client)
    member_id = member["member_id"]

    # Seed a completed run with a fixed past timestamp so it is always older
    old_run_id, _, _, _ = await _seed_completed_run(
        member_id, db_session, created_at="2024-01-01T00:00:00.000000Z"
    )

    # Trigger a new pending run (different period to avoid conflict)
    new_r = await client.post(
        "/api/v1/analysis-runs",
        json={
            "member_id": member_id,
            "period_start": "2024-04-01",
            "period_end": "2024-06-30",
        },
    )
    assert new_r.status_code == 202
    new_run_id = new_r.json()["data"]["analysis_run_id"]

    history_r = await client.get(f"/api/v1/members/{member_id}/analysis-runs")
    assert history_r.status_code == 200
    runs = history_r.json()["data"]

    assert len(runs) >= 2
    run_ids = [r["analysis_run_id"] for r in runs]
    # Newest (new pending run) comes first
    assert run_ids.index(new_run_id) < run_ids.index(old_run_id)

    statuses = {r["analysis_run_id"]: r["status"] for r in runs}
    assert statuses[old_run_id] == "completed"
    assert statuses[new_run_id] == "pending"
