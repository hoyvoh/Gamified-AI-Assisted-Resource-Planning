import uuid

from app.domain.org.entities import Member, Organization, Team
from app.domain.org.repositories import IMemberRepository, IOrganizationRepository, ITeamRepository
from app.domain.shared.exceptions import NotFoundError
from app.infrastructure.db.base import utcnow


class CreateOrganizationUseCase:
    def __init__(self, org_repo: IOrganizationRepository) -> None:
        self._org_repo = org_repo

    async def execute(self, name: str) -> Organization:
        now = utcnow()
        org = Organization(
            organization_id=str(uuid.uuid4()),
            name=name,
            created_at=now,
            updated_at=now,
        )
        await self._org_repo.create(org)
        return org


class GetOrganizationUseCase:
    def __init__(self, org_repo: IOrganizationRepository) -> None:
        self._org_repo = org_repo

    async def execute(self, org_id: str) -> Organization:
        org = await self._org_repo.get_by_id(org_id)
        if org is None:
            raise NotFoundError("Organization", org_id)
        return org


class ListOrganizationsUseCase:
    def __init__(self, org_repo: IOrganizationRepository) -> None:
        self._org_repo = org_repo

    async def execute(self) -> list[Organization]:
        return await self._org_repo.list_all()


class UpdateOrganizationUseCase:
    def __init__(self, org_repo: IOrganizationRepository) -> None:
        self._org_repo = org_repo

    async def execute(self, org_id: str, name: str) -> Organization:
        org = await self._org_repo.get_by_id(org_id)
        if org is None:
            raise NotFoundError("Organization", org_id)
        org.name = name
        await self._org_repo.update(org)
        return org


class DeleteOrganizationUseCase:
    def __init__(self, org_repo: IOrganizationRepository) -> None:
        self._org_repo = org_repo

    async def execute(self, org_id: str) -> None:
        org = await self._org_repo.get_by_id(org_id)
        if org is None:
            raise NotFoundError("Organization", org_id)
        await self._org_repo.delete(org_id)


class CreateTeamUseCase:
    def __init__(self, org_repo: IOrganizationRepository, team_repo: ITeamRepository) -> None:
        self._org_repo = org_repo
        self._team_repo = team_repo

    async def execute(self, org_id: str, name: str) -> Team:
        org = await self._org_repo.get_by_id(org_id)
        if org is None:
            raise NotFoundError("Organization", org_id)
        now = utcnow()
        team = Team(
            team_id=str(uuid.uuid4()),
            organization_id=org_id,
            name=name,
            created_at=now,
            updated_at=now,
        )
        await self._team_repo.create(team)
        return team


class GetTeamUseCase:
    def __init__(self, org_repo: IOrganizationRepository, team_repo: ITeamRepository) -> None:
        self._org_repo = org_repo
        self._team_repo = team_repo

    async def execute(self, team_id: str, org_id: str) -> Team:
        org = await self._org_repo.get_by_id(org_id)
        if org is None:
            raise NotFoundError("Organization", org_id)
        team = await self._team_repo.get_by_id(team_id)
        if team is None or team.organization_id != org_id:
            raise NotFoundError("Team", team_id)
        return team


class UpdateTeamUseCase:
    def __init__(self, org_repo: IOrganizationRepository, team_repo: ITeamRepository) -> None:
        self._org_repo = org_repo
        self._team_repo = team_repo

    async def execute(self, team_id: str, org_id: str, name: str) -> Team:
        org = await self._org_repo.get_by_id(org_id)
        if org is None:
            raise NotFoundError("Organization", org_id)
        team = await self._team_repo.get_by_id(team_id)
        if team is None or team.organization_id != org_id:
            raise NotFoundError("Team", team_id)
        team.name = name
        await self._team_repo.update(team)
        return team


class DeleteTeamUseCase:
    def __init__(self, org_repo: IOrganizationRepository, team_repo: ITeamRepository) -> None:
        self._org_repo = org_repo
        self._team_repo = team_repo

    async def execute(self, team_id: str, org_id: str) -> None:
        org = await self._org_repo.get_by_id(org_id)
        if org is None:
            raise NotFoundError("Organization", org_id)
        team = await self._team_repo.get_by_id(team_id)
        if team is None or team.organization_id != org_id:
            raise NotFoundError("Team", team_id)
        await self._team_repo.delete(team_id)


class CreateMemberUseCase:
    def __init__(
        self,
        org_repo: IOrganizationRepository,
        team_repo: ITeamRepository,
        member_repo: IMemberRepository,
    ) -> None:
        self._org_repo = org_repo
        self._team_repo = team_repo
        self._member_repo = member_repo

    async def execute(
        self,
        org_id: str,
        team_id: str,
        display_name: str,
        external_id: str | None,
        role_profile_id: str | None,
    ) -> Member:
        org = await self._org_repo.get_by_id(org_id)
        if org is None:
            raise NotFoundError("Organization", org_id)
        team = await self._team_repo.get_by_id(team_id)
        if team is None or team.organization_id != org_id:
            raise NotFoundError("Team", team_id)
        now = utcnow()
        member = Member(
            member_id=str(uuid.uuid4()),
            team_id=team_id,
            organization_id=org_id,
            display_name=display_name,
            external_id=external_id,
            role_profile_id=role_profile_id,
            analysis_status="not_analyzed",
            last_analysis_at=None,
            created_at=now,
            updated_at=now,
        )
        await self._member_repo.create(member)
        return member


class GetMemberUseCase:
    def __init__(self, member_repo: IMemberRepository) -> None:
        self._member_repo = member_repo

    async def execute(self, member_id: str) -> Member:
        member = await self._member_repo.get_by_id(member_id)
        if member is None:
            raise NotFoundError("Member", member_id)
        return member


class UpdateMemberUseCase:
    def __init__(self, member_repo: IMemberRepository) -> None:
        self._member_repo = member_repo

    async def execute(
        self,
        member_id: str,
        display_name: str,
        external_id: str | None,
        role_profile_id: str | None,
    ) -> Member:
        member = await self._member_repo.get_by_id(member_id)
        if member is None:
            raise NotFoundError("Member", member_id)
        member.display_name = display_name
        member.external_id = external_id
        member.role_profile_id = role_profile_id
        await self._member_repo.update(member)
        return member


class DeleteMemberUseCase:
    def __init__(self, member_repo: IMemberRepository) -> None:
        self._member_repo = member_repo

    async def execute(self, member_id: str) -> None:
        member = await self._member_repo.get_by_id(member_id)
        if member is None:
            raise NotFoundError("Member", member_id)
        await self._member_repo.delete(member_id)
