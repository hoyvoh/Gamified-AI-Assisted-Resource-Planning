import json

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domain.org.entities import Member, Organization, RoleProfile, Team
from app.infrastructure.db.base import utcnow
from app.infrastructure.db.models.org import (
    MemberModel,
    OrganizationModel,
    RoleProfileModel,
    TeamModel,
)


class SqlOrganizationRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(self, org: Organization) -> None:
        model = OrganizationModel(
            organization_id=org.organization_id,
            name=org.name,
            created_at=org.created_at,
            updated_at=org.updated_at,
        )
        self._session.add(model)
        await self._session.flush()

    async def get_by_id(self, org_id: str) -> Organization | None:
        stmt = (
            select(OrganizationModel)
            .where(OrganizationModel.organization_id == org_id)
            .options(selectinload(OrganizationModel.teams).selectinload(TeamModel.members))
        )
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        if model is None:
            return None
        return _org_to_entity(model, include_tree=True)

    async def list_all(self) -> list[Organization]:
        stmt = select(OrganizationModel).options(
            selectinload(OrganizationModel.teams).selectinload(TeamModel.members)
        )
        result = await self._session.execute(stmt)
        models = result.scalars().all()
        return [_org_to_entity(m, include_tree=True) for m in models]

    async def update(self, org: Organization) -> None:
        model = await self._session.get(OrganizationModel, org.organization_id)
        if model is not None:
            model.name = org.name
            model.updated_at = utcnow()
            await self._session.flush()

    async def delete(self, org_id: str) -> None:
        await self._session.execute(
            delete(OrganizationModel).where(OrganizationModel.organization_id == org_id)
        )
        await self._session.flush()


class SqlTeamRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(self, team: Team) -> None:
        model = TeamModel(
            team_id=team.team_id,
            organization_id=team.organization_id,
            name=team.name,
            created_at=team.created_at,
            updated_at=team.updated_at,
        )
        self._session.add(model)
        await self._session.flush()

    async def get_by_id(self, team_id: str) -> Team | None:
        model = await self._session.get(TeamModel, team_id)
        if model is None:
            return None
        return _team_to_entity(model)

    async def update(self, team: Team) -> None:
        model = await self._session.get(TeamModel, team.team_id)
        if model is not None:
            model.name = team.name
            model.updated_at = utcnow()
            await self._session.flush()

    async def delete(self, team_id: str) -> None:
        await self._session.execute(delete(TeamModel).where(TeamModel.team_id == team_id))
        await self._session.flush()


class SqlMemberRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(self, member: Member) -> None:
        model = MemberModel(
            member_id=member.member_id,
            team_id=member.team_id,
            role_profile_id=member.role_profile_id,
            display_name=member.display_name,
            external_id=member.external_id,
            created_at=member.created_at,
            updated_at=member.updated_at,
        )
        self._session.add(model)
        await self._session.flush()

    async def get_by_id(self, member_id: str) -> Member | None:
        stmt = (
            select(MemberModel)
            .where(MemberModel.member_id == member_id)
            .options(selectinload(MemberModel.team))
        )
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        if model is None:
            return None
        return _member_to_entity(model, org_id=model.team.organization_id)

    async def update(self, member: Member) -> None:
        model = await self._session.get(MemberModel, member.member_id)
        if model is not None:
            model.display_name = member.display_name
            model.external_id = member.external_id
            model.role_profile_id = member.role_profile_id
            model.updated_at = utcnow()
            await self._session.flush()

    async def delete(self, member_id: str) -> None:
        await self._session.execute(delete(MemberModel).where(MemberModel.member_id == member_id))
        await self._session.flush()


class SqlRoleProfileRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_all(self) -> list[RoleProfile]:
        result = await self._session.execute(select(RoleProfileModel))
        return [_role_to_entity(m) for m in result.scalars().all()]

    async def get_by_id(self, role_profile_id: str) -> RoleProfile | None:
        model = await self._session.get(RoleProfileModel, role_profile_id)
        return _role_to_entity(model) if model else None

    async def upsert(self, profile: RoleProfile) -> None:
        existing = await self._session.get(RoleProfileModel, profile.role_profile_id)
        if existing is None:
            self._session.add(
                RoleProfileModel(
                    role_profile_id=profile.role_profile_id,
                    role_name=profile.role_name,
                    expected_dimension_weights=json.dumps(profile.expected_dimension_weights),
                    expected_opportunity_levels=json.dumps(profile.expected_opportunity_levels),
                    expected_maturity_ranges=json.dumps(profile.expected_maturity_ranges),
                    created_at=profile.created_at,
                    updated_at=profile.updated_at,
                )
            )
        else:
            existing.role_name = profile.role_name
            existing.updated_at = utcnow()
        await self._session.flush()


# ── helpers ───────────────────────────────────────────────────────────────────


def _role_to_entity(model: RoleProfileModel) -> RoleProfile:
    return RoleProfile(
        role_profile_id=model.role_profile_id,
        role_name=model.role_name,
        expected_dimension_weights=json.loads(model.expected_dimension_weights or "{}"),
        expected_opportunity_levels=json.loads(model.expected_opportunity_levels or "{}"),
        expected_maturity_ranges=json.loads(model.expected_maturity_ranges or "{}"),
        created_at=model.created_at,
        updated_at=model.updated_at,
    )


def _member_to_entity(model: MemberModel, org_id: str) -> Member:
    return Member(
        member_id=model.member_id,
        team_id=model.team_id,
        organization_id=org_id,
        display_name=model.display_name,
        external_id=model.external_id,
        role_profile_id=model.role_profile_id,
        analysis_status="not_analyzed",
        last_analysis_at=None,
        created_at=model.created_at,
        updated_at=model.updated_at,
    )


def _team_to_entity(model: TeamModel, include_members: bool = False) -> Team:
    members: list[Member] = []
    if include_members and model.members:
        members = [_member_to_entity(m, org_id=model.organization_id) for m in model.members]
    return Team(
        team_id=model.team_id,
        organization_id=model.organization_id,
        name=model.name,
        created_at=model.created_at,
        updated_at=model.updated_at,
        members=members,
    )


def _org_to_entity(model: OrganizationModel, include_tree: bool = False) -> Organization:
    teams: list[Team] = []
    if include_tree and model.teams:
        teams = [_team_to_entity(t, include_members=True) for t in model.teams]
    return Organization(
        organization_id=model.organization_id,
        name=model.name,
        created_at=model.created_at,
        updated_at=model.updated_at,
        teams=teams,
    )
