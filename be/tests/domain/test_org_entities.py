from app.domain.org.entities import Member, Organization, RoleProfile, Team
from app.domain.shared.exceptions import NotFoundError


def test_organization_starts_with_empty_teams() -> None:
    org = Organization(
        organization_id="org-1",
        name="Acme",
        created_at="2025-01-01T00:00:00Z",
        updated_at="2025-01-01T00:00:00Z",
    )
    assert org.teams == []


def test_team_starts_with_empty_members() -> None:
    team = Team(
        team_id="team-1",
        organization_id="org-1",
        name="Backend",
        created_at="2025-01-01T00:00:00Z",
        updated_at="2025-01-01T00:00:00Z",
    )
    assert team.members == []


def test_member_default_analysis_status() -> None:
    member = Member(
        member_id="mem-1",
        team_id="team-1",
        organization_id="org-1",
        display_name="Alice",
        external_id=None,
        role_profile_id=None,
        analysis_status="not_analyzed",
        last_analysis_at=None,
        created_at="2025-01-01T00:00:00Z",
        updated_at="2025-01-01T00:00:00Z",
    )
    assert member.analysis_status == "not_analyzed"
    assert member.last_analysis_at is None


def test_not_found_error_message() -> None:
    err = NotFoundError("Organization", "abc-123")
    assert "Organization" in str(err)
    assert "abc-123" in str(err)
    assert err.resource == "Organization"
    assert err.id == "abc-123"


def test_role_profile_has_correct_fields() -> None:
    profile = RoleProfile(
        role_profile_id="rp-1",
        role_name="Senior Backend Engineer",
        expected_dimension_weights={},
        expected_opportunity_levels={},
        expected_maturity_ranges={},
        created_at="2025-01-01T00:00:00Z",
        updated_at="2025-01-01T00:00:00Z",
    )
    assert profile.role_name == "Senior Backend Engineer"
    assert profile.expected_dimension_weights == {}
