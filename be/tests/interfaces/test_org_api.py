import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_organization(client: AsyncClient) -> None:
    resp = await client.post("/api/v1/organizations", json={"name": "Acme Corp"})
    assert resp.status_code == 201
    data = resp.json()["data"]
    assert data["name"] == "Acme Corp"
    assert "organization_id" in data


@pytest.mark.asyncio
async def test_create_organization_empty_name_returns_422(client: AsyncClient) -> None:
    resp = await client.post("/api/v1/organizations", json={"name": ""})
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_list_organizations(client: AsyncClient) -> None:
    await client.post("/api/v1/organizations", json={"name": "Org A"})
    await client.post("/api/v1/organizations", json={"name": "Org B"})
    resp = await client.get("/api/v1/organizations")
    assert resp.status_code == 200
    items = resp.json()["data"]
    assert len(items) >= 2


@pytest.mark.asyncio
async def test_get_organization_with_tree(client: AsyncClient) -> None:
    create_resp = await client.post("/api/v1/organizations", json={"name": "Tree Org"})
    org_id = create_resp.json()["data"]["organization_id"]

    # add a team
    await client.post(f"/api/v1/organizations/{org_id}/teams", json={"name": "Alpha"})

    resp = await client.get(f"/api/v1/organizations/{org_id}")
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["organization_id"] == org_id
    assert len(data["teams"]) == 1
    assert data["teams"][0]["name"] == "Alpha"


@pytest.mark.asyncio
async def test_get_nonexistent_organization_returns_404(client: AsyncClient) -> None:
    resp = await client.get("/api/v1/organizations/nonexistent-id")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_update_organization(client: AsyncClient) -> None:
    create_resp = await client.post("/api/v1/organizations", json={"name": "Old Name"})
    org_id = create_resp.json()["data"]["organization_id"]

    resp = await client.patch(f"/api/v1/organizations/{org_id}", json={"name": "New Name"})
    assert resp.status_code == 200
    assert resp.json()["data"]["name"] == "New Name"


@pytest.mark.asyncio
async def test_delete_organization(client: AsyncClient) -> None:
    create_resp = await client.post("/api/v1/organizations", json={"name": "To Delete"})
    org_id = create_resp.json()["data"]["organization_id"]

    resp = await client.delete(f"/api/v1/organizations/{org_id}")
    assert resp.status_code == 204

    get_resp = await client.get(f"/api/v1/organizations/{org_id}")
    assert get_resp.status_code == 404


@pytest.mark.asyncio
async def test_create_team(client: AsyncClient) -> None:
    create_resp = await client.post("/api/v1/organizations", json={"name": "Team Org"})
    org_id = create_resp.json()["data"]["organization_id"]

    resp = await client.post(f"/api/v1/organizations/{org_id}/teams", json={"name": "Backend Team"})
    assert resp.status_code == 201
    data = resp.json()["data"]
    assert data["name"] == "Backend Team"
    assert data["organization_id"] == org_id


@pytest.mark.asyncio
async def test_create_team_on_nonexistent_org_returns_404(client: AsyncClient) -> None:
    resp = await client.post("/api/v1/organizations/bad-org/teams", json={"name": "Orphan Team"})
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_create_member_and_get_member(client: AsyncClient) -> None:
    org_resp = await client.post("/api/v1/organizations", json={"name": "Member Org"})
    org_id = org_resp.json()["data"]["organization_id"]
    team_resp = await client.post(f"/api/v1/organizations/{org_id}/teams", json={"name": "Dev"})
    team_id = team_resp.json()["data"]["team_id"]

    member_resp = await client.post(
        f"/api/v1/organizations/{org_id}/teams/{team_id}/members",
        json={"display_name": "Alice", "external_id": "gh:alice"},
    )
    assert member_resp.status_code == 201
    member_data = member_resp.json()["data"]
    assert member_data["display_name"] == "Alice"
    assert member_data["analysis_status"] == "not_analyzed"

    # GET /members/:id
    member_id = member_data["member_id"]
    get_resp = await client.get(f"/api/v1/members/{member_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["data"]["member_id"] == member_id


@pytest.mark.asyncio
async def test_get_nonexistent_member_returns_404(client: AsyncClient) -> None:
    resp = await client.get("/api/v1/members/bad-member-id")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_delete_member(client: AsyncClient) -> None:
    org_resp = await client.post("/api/v1/organizations", json={"name": "Del Org"})
    org_id = org_resp.json()["data"]["organization_id"]
    team_resp = await client.post(
        f"/api/v1/organizations/{org_id}/teams", json={"name": "Del Team"}
    )
    team_id = team_resp.json()["data"]["team_id"]
    member_resp = await client.post(
        f"/api/v1/organizations/{org_id}/teams/{team_id}/members",
        json={"display_name": "Bob"},
    )
    member_id = member_resp.json()["data"]["member_id"]

    del_resp = await client.delete(
        f"/api/v1/organizations/{org_id}/teams/{team_id}/members/{member_id}"
    )
    assert del_resp.status_code == 204

    get_resp = await client.get(f"/api/v1/members/{member_id}")
    assert get_resp.status_code == 404


@pytest.mark.asyncio
async def test_list_role_profiles(client: AsyncClient) -> None:
    resp = await client.get("/api/v1/role-profiles")
    assert resp.status_code == 200
    # seed runs at startup — but in test mode seed doesn't run (no lifespan),
    # so we just verify the endpoint returns 200 with an empty or populated list
    assert "data" in resp.json()
