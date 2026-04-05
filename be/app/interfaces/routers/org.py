from fastapi import APIRouter, Depends, HTTPException, Response

from app.application.org.use_cases import (
    CreateMemberUseCase,
    CreateOrganizationUseCase,
    CreateTeamUseCase,
    DeleteMemberUseCase,
    DeleteOrganizationUseCase,
    DeleteTeamUseCase,
    GetMemberUseCase,
    GetOrganizationUseCase,
    ListOrganizationsUseCase,
    UpdateMemberUseCase,
    UpdateOrganizationUseCase,
    UpdateTeamUseCase,
)
from app.dependencies import (
    get_create_member_use_case,
    get_create_organization_use_case,
    get_create_team_use_case,
    get_delete_member_use_case,
    get_delete_organization_use_case,
    get_delete_team_use_case,
    get_get_member_use_case,
    get_get_organization_use_case,
    get_list_organizations_use_case,
    get_update_member_use_case,
    get_update_organization_use_case,
    get_update_team_use_case,
)
from app.domain.shared.exceptions import NotFoundError
from app.interfaces.schemas.base import DataEnvelope
from app.interfaces.schemas.org import (
    CreateMemberRequest,
    CreateOrganizationRequest,
    CreateTeamRequest,
    MemberResponse,
    MemberStatusItem,
    OrganizationDetailResponse,
    OrganizationListItem,
    OrganizationResponse,
    TeamResponse,
    TeamTreeItem,
    UpdateMemberRequest,
    UpdateOrganizationRequest,
    UpdateTeamRequest,
)

router = APIRouter(prefix="/api/v1", tags=["organizations"])


# ── helpers ───────────────────────────────────────────────────────────────────


def _handle_not_found(exc: NotFoundError) -> HTTPException:
    return HTTPException(status_code=404, detail=str(exc))


# ── Organization endpoints ────────────────────────────────────────────────────


@router.post("/organizations", response_model=DataEnvelope[OrganizationResponse], status_code=201)
async def create_organization(
    body: CreateOrganizationRequest,
    use_case: CreateOrganizationUseCase = Depends(get_create_organization_use_case),
) -> DataEnvelope[OrganizationResponse]:
    org = await use_case.execute(name=body.name)
    return DataEnvelope(data=OrganizationResponse.model_validate(org.__dict__))


@router.get("/organizations", response_model=DataEnvelope[list[OrganizationListItem]])
async def list_organizations(
    use_case: ListOrganizationsUseCase = Depends(get_list_organizations_use_case),
) -> DataEnvelope[list[OrganizationListItem]]:
    orgs = await use_case.execute()
    items = [
        OrganizationListItem(
            organization_id=o.organization_id,
            name=o.name,
            team_count=len(o.teams),
            member_count=sum(len(t.members) for t in o.teams),
            created_at=o.created_at,
        )
        for o in orgs
    ]
    return DataEnvelope(data=items)


@router.get("/organizations/{org_id}", response_model=DataEnvelope[OrganizationDetailResponse])
async def get_organization(
    org_id: str,
    use_case: GetOrganizationUseCase = Depends(get_get_organization_use_case),
) -> DataEnvelope[OrganizationDetailResponse]:
    try:
        org = await use_case.execute(org_id)
    except NotFoundError as exc:
        raise _handle_not_found(exc) from exc
    teams = [
        TeamTreeItem(
            team_id=t.team_id,
            name=t.name,
            members=[
                MemberStatusItem(
                    member_id=m.member_id,
                    display_name=m.display_name,
                    external_id=m.external_id,
                    role_profile_id=m.role_profile_id,
                    analysis_status=m.analysis_status,
                    last_analysis_at=m.last_analysis_at,
                )
                for m in t.members
            ],
        )
        for t in org.teams
    ]
    return DataEnvelope(
        data=OrganizationDetailResponse(
            organization_id=org.organization_id,
            name=org.name,
            created_at=org.created_at,
            updated_at=org.updated_at,
            teams=teams,
        )
    )


@router.patch("/organizations/{org_id}", response_model=DataEnvelope[OrganizationResponse])
async def update_organization(
    org_id: str,
    body: UpdateOrganizationRequest,
    use_case: UpdateOrganizationUseCase = Depends(get_update_organization_use_case),
) -> DataEnvelope[OrganizationResponse]:
    try:
        org = await use_case.execute(org_id=org_id, name=body.name)
    except NotFoundError as exc:
        raise _handle_not_found(exc) from exc
    return DataEnvelope(data=OrganizationResponse.model_validate(org.__dict__))


@router.delete("/organizations/{org_id}", status_code=204)
async def delete_organization(
    org_id: str,
    use_case: DeleteOrganizationUseCase = Depends(get_delete_organization_use_case),
) -> Response:
    try:
        await use_case.execute(org_id)
    except NotFoundError as exc:
        raise _handle_not_found(exc) from exc
    return Response(status_code=204)


# ── Team endpoints ────────────────────────────────────────────────────────────


@router.post(
    "/organizations/{org_id}/teams",
    response_model=DataEnvelope[TeamResponse],
    status_code=201,
)
async def create_team(
    org_id: str,
    body: CreateTeamRequest,
    use_case: CreateTeamUseCase = Depends(get_create_team_use_case),
) -> DataEnvelope[TeamResponse]:
    try:
        team = await use_case.execute(org_id=org_id, name=body.name)
    except NotFoundError as exc:
        raise _handle_not_found(exc) from exc
    return DataEnvelope(data=TeamResponse.model_validate(team.__dict__))


@router.patch(
    "/organizations/{org_id}/teams/{team_id}",
    response_model=DataEnvelope[TeamResponse],
)
async def update_team(
    org_id: str,
    team_id: str,
    body: UpdateTeamRequest,
    use_case: UpdateTeamUseCase = Depends(get_update_team_use_case),
) -> DataEnvelope[TeamResponse]:
    try:
        team = await use_case.execute(team_id=team_id, org_id=org_id, name=body.name)
    except NotFoundError as exc:
        raise _handle_not_found(exc) from exc
    return DataEnvelope(data=TeamResponse.model_validate(team.__dict__))


@router.delete("/organizations/{org_id}/teams/{team_id}", status_code=204)
async def delete_team(
    org_id: str,
    team_id: str,
    use_case: DeleteTeamUseCase = Depends(get_delete_team_use_case),
) -> Response:
    try:
        await use_case.execute(team_id=team_id, org_id=org_id)
    except NotFoundError as exc:
        raise _handle_not_found(exc) from exc
    return Response(status_code=204)


# ── Member endpoints ──────────────────────────────────────────────────────────


@router.post(
    "/organizations/{org_id}/teams/{team_id}/members",
    response_model=DataEnvelope[MemberResponse],
    status_code=201,
)
async def create_member(
    org_id: str,
    team_id: str,
    body: CreateMemberRequest,
    use_case: CreateMemberUseCase = Depends(get_create_member_use_case),
) -> DataEnvelope[MemberResponse]:
    try:
        member = await use_case.execute(
            org_id=org_id,
            team_id=team_id,
            display_name=body.display_name,
            external_id=body.external_id,
            role_profile_id=body.role_profile_id,
        )
    except NotFoundError as exc:
        raise _handle_not_found(exc) from exc
    return DataEnvelope(data=MemberResponse.model_validate(member.__dict__))


@router.patch(
    "/organizations/{org_id}/teams/{team_id}/members/{member_id}",
    response_model=DataEnvelope[MemberResponse],
)
async def update_member(
    org_id: str,
    team_id: str,
    member_id: str,
    body: UpdateMemberRequest,
    use_case: UpdateMemberUseCase = Depends(get_update_member_use_case),
) -> DataEnvelope[MemberResponse]:
    try:
        member = await use_case.execute(
            member_id=member_id,
            display_name=body.display_name,
            external_id=body.external_id,
            role_profile_id=body.role_profile_id,
        )
    except NotFoundError as exc:
        raise _handle_not_found(exc) from exc
    return DataEnvelope(data=MemberResponse.model_validate(member.__dict__))


@router.delete("/organizations/{org_id}/teams/{team_id}/members/{member_id}", status_code=204)
async def delete_member(
    org_id: str,
    team_id: str,
    member_id: str,
    use_case: DeleteMemberUseCase = Depends(get_delete_member_use_case),
) -> Response:
    try:
        await use_case.execute(member_id)
    except NotFoundError as exc:
        raise _handle_not_found(exc) from exc
    return Response(status_code=204)


@router.get("/members/{member_id}", response_model=DataEnvelope[MemberResponse])
async def get_member(
    member_id: str,
    use_case: GetMemberUseCase = Depends(get_get_member_use_case),
) -> DataEnvelope[MemberResponse]:
    try:
        member = await use_case.execute(member_id)
    except NotFoundError as exc:
        raise _handle_not_found(exc) from exc
    return DataEnvelope(data=MemberResponse.model_validate(member.__dict__))
