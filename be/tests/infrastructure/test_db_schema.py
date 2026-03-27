"""Smoke tests for the database schema (BE-002).

Verifies that all 21 tables can be created and accept a valid insert.
Uses an in-memory SQLite database — no filesystem state, no migration runner.
All tests are synchronous (SQLAlchemy sync engine) for simplicity.
"""

import uuid
from datetime import UTC, date, datetime

import pytest
import sqlalchemy as sa
from sqlalchemy import create_engine
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.infrastructure.db.base import Base
from app.infrastructure.db.models import (
    LLMSession,
    Organization,
    Personnel,
    PersonnelLanguage,
    PersonnelProfile,
    Project,
    ProjectEvaluation,
    ProjectMembership,
    ProjectTeamMatch,
    ProjectToolLicense,
    ProjectWarning,
    ResourceAssignment,
    Scenario,
    ScenarioCompletionSnapshot,
    SkillMatrixEntry,
    Task,
    TaskDependency,
    TaskProgressLog,
    ToolSeatAssignment,
    User,
    XPEvent,
)

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture(scope="module")
def engine():
    _engine = create_engine("sqlite:///:memory:", echo=False)
    Base.metadata.create_all(_engine)
    yield _engine
    _engine.dispose()


@pytest.fixture
def session(engine):
    with Session(engine) as s:
        yield s
        s.rollback()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _now() -> datetime:
    return datetime.now(tz=UTC)


def _uuid() -> uuid.UUID:
    return uuid.uuid4()


# ---------------------------------------------------------------------------
# Seed: one row of every parent table, reused across tests
# ---------------------------------------------------------------------------


@pytest.fixture(scope="module")
def seed(engine):
    """Insert one row per root table; return IDs for FK use in child tests."""
    with Session(engine) as s:
        org = Organization(name="Acme", slug="acme")
        s.add(org)
        s.flush()

        user = User(org_id=org.id, email="dev@acme.com", name="Dev", role="admin")
        s.add(user)
        s.flush()

        person = Personnel(
            org_id=org.id,
            display_name="Alice",
            seniority="senior",
            years_experience=5.0,
            hourly_cost=50.0,
        )
        s.add(person)
        s.flush()

        project = Project(
            org_id=org.id,
            name="Project X",
            description="Test project",
            status="draft",
            deadline=date(2026, 12, 31),
            raw_proposal="Raw text",
            evaluation_status="not_started",
            created_by=user.id,
        )
        s.add(project)
        s.flush()

        scenario = Scenario(
            project_id=project.id,
            name="Plan A",
            status="draft",
            created_by=user.id,
            metadata_={},
        )
        s.add(scenario)
        s.flush()

        task = Task(
            scenario_id=scenario.id,
            name="Backend setup",
            description="Set up FastAPI",
            category="backend",
            status="todo",
            priority="high",
            tech_stacks=["Python", "FastAPI"],
            required_languages=[],
        )
        s.add(task)
        s.flush()

        llm_session = LLMSession(
            project_id=project.id,
            scenario_id=scenario.id,
            session_type="general",
            prompt="Summarize project",
            response="Project summary...",
            model_used="claude-sonnet-4-6",
            created_by=user.id,
        )
        s.add(llm_session)
        s.flush()

        s.commit()
        return {
            "org_id": org.id,
            "user_id": user.id,
            "person_id": person.id,
            "project_id": project.id,
            "scenario_id": scenario.id,
            "task_id": task.id,
            "llm_session_id": llm_session.id,
        }


# ---------------------------------------------------------------------------
# Tests — one per model
# ---------------------------------------------------------------------------


def test_organization_exists(session, seed):
    assert session.get(Organization, seed["org_id"]) is not None


def test_user_exists(session, seed):
    assert session.get(User, seed["user_id"]) is not None


def test_personnel_exists(session, seed):
    assert session.get(Personnel, seed["person_id"]) is not None


def test_project_exists(session, seed):
    assert session.get(Project, seed["project_id"]) is not None


def test_scenario_exists(session, seed):
    assert session.get(Scenario, seed["scenario_id"]) is not None


def test_task_exists(session, seed):
    assert session.get(Task, seed["task_id"]) is not None


def test_llm_session_exists(session, seed):
    assert session.get(LLMSession, seed["llm_session_id"]) is not None


def test_personnel_language_insert(session, seed):
    row = PersonnelLanguage(
        personnel_id=seed["person_id"],
        language_code="en",
        proficiency="native",
    )
    session.add(row)
    session.flush()
    assert session.get(PersonnelLanguage, row.id) is not None


def test_skill_matrix_entry_insert(session, seed):
    row = SkillMatrixEntry(
        personnel_id=seed["person_id"],
        skill_name="Python",
        category="Backend",
        level="expert",
    )
    session.add(row)
    session.flush()
    assert session.get(SkillMatrixEntry, row.id) is not None


def test_personnel_profile_insert(session, seed):
    row = PersonnelProfile(
        personnel_id=seed["person_id"],
        profile_version="2026-03-27",
        data_period_from=date(2025, 1, 1),
        data_period_to=date(2026, 3, 1),
        corpus_size=500,
        ocean_scores={"O": {"score": 4.2, "confidence": 0.8}},
        behavioral_prefs={"work_rhythm": "async"},
        tech_capability={"TC1": {"score": 4.5}},
        soft_skills={"SS1": {"score": 3.8}},
        performance={"delivery_reliability": {"score": 4.0}},
        wfu_factors={"project_familiarity_typical": 0.9},
        flags=[],
        github_repos_analyzed=["repo-a", "repo-b"],
        synced_at=_now(),
    )
    session.add(row)
    session.flush()
    assert session.get(PersonnelProfile, row.id) is not None


def test_project_membership_insert(session, seed):
    row = ProjectMembership(
        project_id=seed["project_id"],
        personnel_id=seed["person_id"],
        allocation_pct=80.0,
        role_in_project="Backend Lead",
        joined_at=date(2026, 1, 1),
    )
    session.add(row)
    session.flush()
    assert session.get(ProjectMembership, row.id) is not None


def test_project_evaluation_insert(session, seed):
    row = ProjectEvaluation(
        project_id=seed["project_id"],
        axis_scores={},
        telos_breakdown={},
        risk_register=[],
        axis_weights={},
        created_by=seed["user_id"],
    )
    session.add(row)
    session.flush()
    assert session.get(ProjectEvaluation, row.id) is not None


def test_project_tool_license_insert(session, seed):
    row = ProjectToolLicense(
        project_id=seed["project_id"],
        tool_name="Claude Code",
        total_seats=5,
    )
    session.add(row)
    session.flush()
    assert session.get(ProjectToolLicense, row.id) is not None


def test_tool_seat_assignment_insert(session, seed):
    license_row = ProjectToolLicense(
        project_id=seed["project_id"],
        tool_name="GitHub Copilot",
        total_seats=3,
    )
    session.add(license_row)
    session.flush()

    row = ToolSeatAssignment(
        tool_license_id=license_row.id,
        personnel_id=seed["person_id"],
        assigned_at=_now(),
    )
    session.add(row)
    session.flush()
    assert session.get(ToolSeatAssignment, row.id) is not None


def test_project_team_match_insert(session, seed):
    row = ProjectTeamMatch(
        project_id=seed["project_id"],
        personnel_id=seed["person_id"],
        match_score=0.85,
        skill_coverage_score=0.90,
        ocean_fit_score=0.75,
        growth_opportunity_score=0.80,
        effective_wfu_estimate=1.1,
        match_details={},
        computed_at=_now(),
    )
    session.add(row)
    session.flush()
    assert session.get(ProjectTeamMatch, row.id) is not None


def test_scenario_completion_snapshot_insert(session, seed):
    row = ScenarioCompletionSnapshot(
        scenario_id=seed["scenario_id"],
        computed_at=_now(),
        p_on_time=0.82,
        eac_date=date(2026, 11, 15),
        days_delta=7.0,
        spi=1.05,
        active_risk_count=2,
    )
    session.add(row)
    session.flush()
    assert session.get(ScenarioCompletionSnapshot, row.id) is not None


def test_task_dependency_insert(session, seed):
    task2 = Task(
        scenario_id=seed["scenario_id"],
        name="API endpoints",
        description="Implement REST API",
        category="backend",
        status="todo",
        priority="high",
        tech_stacks=["FastAPI"],
        required_languages=[],
    )
    session.add(task2)
    session.flush()

    row = TaskDependency(
        task_id=task2.id,
        depends_on_task_id=seed["task_id"],
    )
    session.add(row)
    session.flush()
    assert session.get(TaskDependency, row.id) is not None


def test_task_dependency_no_self_reference(session, seed):
    row = TaskDependency(
        task_id=seed["task_id"],
        depends_on_task_id=seed["task_id"],
    )
    session.add(row)
    with pytest.raises(IntegrityError):
        session.flush()
    session.rollback()


def test_resource_assignment_insert(session, seed):
    row = ResourceAssignment(
        task_id=seed["task_id"],
        personnel_id=seed["person_id"],
        allocation_pct=100.0,
        effective_wfu=1.0,
        assigned_at=_now(),
        assigned_by=seed["user_id"],
    )
    session.add(row)
    session.flush()
    assert session.get(ResourceAssignment, row.id) is not None


def test_resource_assignment_invalid_allocation(session, seed):
    row = ResourceAssignment(
        task_id=seed["task_id"],
        personnel_id=seed["person_id"],
        allocation_pct=0.0,  # violates > 0 check
        effective_wfu=1.0,
        assigned_at=_now(),
        assigned_by=seed["user_id"],
    )
    session.add(row)
    with pytest.raises(IntegrityError):
        session.flush()
    session.rollback()


def test_task_progress_log_insert(session, seed):
    row = TaskProgressLog(
        task_id=seed["task_id"],
        personnel_id=seed["person_id"],
        log_date=date(2026, 3, 27),
        completion_pct=25.0,
        hours_spent=4.0,
    )
    session.add(row)
    session.flush()
    assert session.get(TaskProgressLog, row.id) is not None


def test_project_warning_insert(session, seed):
    row = ProjectWarning(
        scenario_id=seed["scenario_id"],
        warning_type="capacity",
        severity="warning",
        entity_type="personnel",
        entity_id=seed["person_id"],
        message="Personnel at 120% capacity",
        data={"personnel_id": str(seed["person_id"]), "utilization": 1.2},
    )
    session.add(row)
    session.flush()
    assert session.get(ProjectWarning, row.id) is not None


def test_xp_event_insert(session, seed):
    row = XPEvent(
        personnel_id=seed["person_id"],
        project_id=seed["project_id"],
        xp_amount=150,
        reason="task_completed",
    )
    session.add(row)
    session.flush()
    assert session.get(XPEvent, row.id) is not None


def test_table_count(engine):
    """Verify all 21 tables are present in the schema."""
    inspector = sa.inspect(engine)
    tables = set(inspector.get_table_names())
    expected = {
        "organizations",
        "users",
        "personnel",
        "personnel_languages",
        "skill_matrix_entries",
        "personnel_profiles",
        "projects",
        "project_memberships",
        "project_evaluations",
        "project_tool_licenses",
        "tool_seat_assignments",
        "project_team_matches",
        "scenarios",
        "scenario_completion_snapshots",
        "tasks",
        "task_dependencies",
        "resource_assignments",
        "task_progress_logs",
        "project_warnings",
        "xp_events",
        "llm_sessions",
    }
    assert expected.issubset(tables), f"Missing tables: {expected - tables}"
