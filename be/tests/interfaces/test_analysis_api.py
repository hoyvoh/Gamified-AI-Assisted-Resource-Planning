"""Integration tests for M2 analysis-run endpoints."""

import pytest
from httpx import AsyncClient


@pytest.fixture
async def org_team_member(client: AsyncClient) -> dict:  # type: ignore[type-arg]
    """Create org → team → member and return their IDs."""
    org_r = await client.post("/api/v1/organizations", json={"name": "Acme"})
    assert org_r.status_code == 201
    org_id = org_r.json()["data"]["organization_id"]

    team_r = await client.post(f"/api/v1/organizations/{org_id}/teams", json={"name": "Backend"})
    assert team_r.status_code == 201
    team_id = team_r.json()["data"]["team_id"]

    member_r = await client.post(
        f"/api/v1/organizations/{org_id}/teams/{team_id}/members",
        json={"display_name": "Alice", "external_id": "alice-gh"},
    )
    assert member_r.status_code == 201
    member_id = member_r.json()["data"]["member_id"]

    return {"org_id": org_id, "team_id": team_id, "member_id": member_id}


# ── Trigger analysis ──────────────────────────────────────────────────────────


async def test_trigger_analysis_returns_202(
    client: AsyncClient,
    org_team_member: dict,  # type: ignore[type-arg]
) -> None:
    resp = await client.post(
        "/api/v1/analysis-runs",
        json={
            "member_id": org_team_member["member_id"],
            "period_start": "2024-01-01",
            "period_end": "2024-06-30",
        },
    )
    assert resp.status_code == 202
    data = resp.json()["data"]
    assert data["member_id"] == org_team_member["member_id"]
    assert data["status"] == "pending"
    assert data["period_start"] == "2024-01-01"
    assert data["period_end"] == "2024-06-30"
    assert data["run_type"] == "fresh"


async def test_trigger_analysis_404_unknown_member(client: AsyncClient) -> None:
    resp = await client.post(
        "/api/v1/analysis-runs",
        json={
            "member_id": "00000000-0000-0000-0000-000000000000",
            "period_start": "2024-01-01",
            "period_end": "2024-06-30",
        },
    )
    assert resp.status_code == 404


async def test_trigger_analysis_422_period_too_long(
    client: AsyncClient,
    org_team_member: dict,  # type: ignore[type-arg]
) -> None:
    resp = await client.post(
        "/api/v1/analysis-runs",
        json={
            "member_id": org_team_member["member_id"],
            "period_start": "2023-01-01",
            "period_end": "2024-12-31",  # > 365 days
        },
    )
    assert resp.status_code == 422


async def test_trigger_analysis_409_duplicate_active(
    client: AsyncClient,
    org_team_member: dict,  # type: ignore[type-arg]
) -> None:
    # First run
    r1 = await client.post(
        "/api/v1/analysis-runs",
        json={
            "member_id": org_team_member["member_id"],
            "period_start": "2024-01-01",
            "period_end": "2024-06-30",
        },
    )
    assert r1.status_code == 202

    # Second run while first is still pending
    r2 = await client.post(
        "/api/v1/analysis-runs",
        json={
            "member_id": org_team_member["member_id"],
            "period_start": "2024-01-01",
            "period_end": "2024-06-30",
        },
    )
    assert r2.status_code == 409


# ── Poll analysis run ─────────────────────────────────────────────────────────


async def test_get_analysis_run(
    client: AsyncClient,
    org_team_member: dict,  # type: ignore[type-arg]
) -> None:
    create_r = await client.post(
        "/api/v1/analysis-runs",
        json={
            "member_id": org_team_member["member_id"],
            "period_start": "2024-01-01",
            "period_end": "2024-06-30",
        },
    )
    run_id = create_r.json()["data"]["analysis_run_id"]

    poll_r = await client.get(f"/api/v1/analysis-runs/{run_id}")
    assert poll_r.status_code == 200
    data = poll_r.json()["data"]
    assert data["analysis_run_id"] == run_id
    assert data["status"] in {"pending", "collecting", "analyzing", "completed", "failed"}


async def test_get_analysis_run_404(client: AsyncClient) -> None:
    resp = await client.get("/api/v1/analysis-runs/no-such-run")
    assert resp.status_code == 404


# ── Member analysis history ───────────────────────────────────────────────────


async def test_list_member_analysis_runs(
    client: AsyncClient,
    org_team_member: dict,  # type: ignore[type-arg]
) -> None:
    member_id = org_team_member["member_id"]

    # Create two runs sequentially (second will conflict unless first is done — use different period)
    await client.post(
        "/api/v1/analysis-runs",
        json={
            "member_id": member_id,
            "period_start": "2024-01-01",
            "period_end": "2024-06-30",
        },
    )

    resp = await client.get(f"/api/v1/members/{member_id}/analysis-runs")
    assert resp.status_code == 200
    runs = resp.json()["data"]
    assert isinstance(runs, list)
    assert len(runs) >= 1
    assert runs[0]["member_id"] == member_id


async def test_list_member_analysis_runs_404_unknown_member(client: AsyncClient) -> None:
    resp = await client.get("/api/v1/members/00000000-0000-0000-0000-000000000000/analysis-runs")
    assert resp.status_code == 404


# ── Refresh shortcut ──────────────────────────────────────────────────────────


async def test_refresh_analysis_returns_202(
    client: AsyncClient,
    org_team_member: dict,  # type: ignore[type-arg]
) -> None:
    resp = await client.post(
        f"/api/v1/members/{org_team_member['member_id']}/refresh",
        json={"period_start": "2024-01-01", "period_end": "2024-06-30"},
    )
    assert resp.status_code == 202
    data = resp.json()["data"]
    assert data["run_type"] == "refresh_same_period"


# ── Member analysis_status enrichment ────────────────────────────────────────


async def test_member_status_not_analyzed_when_no_runs(
    client: AsyncClient,
    org_team_member: dict,  # type: ignore[type-arg]
) -> None:
    resp = await client.get(f"/api/v1/members/{org_team_member['member_id']}")
    assert resp.status_code == 200
    assert resp.json()["data"]["analysis_status"] == "not_analyzed"


async def test_member_status_analyzing_when_active_run(
    client: AsyncClient,
    org_team_member: dict,  # type: ignore[type-arg]
) -> None:
    await client.post(
        "/api/v1/analysis-runs",
        json={
            "member_id": org_team_member["member_id"],
            "period_start": "2024-01-01",
            "period_end": "2024-06-30",
        },
    )
    resp = await client.get(f"/api/v1/members/{org_team_member['member_id']}")
    assert resp.status_code == 200
    # Status should be "analyzing" since we have an active (pending) run
    assert resp.json()["data"]["analysis_status"] == "analyzing"
