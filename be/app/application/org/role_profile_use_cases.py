from app.domain.org.entities import RoleProfile
from app.domain.org.repositories import IRoleProfileRepository
from app.domain.shared.exceptions import NotFoundError


class ListRoleProfilesUseCase:
    def __init__(self, repo: IRoleProfileRepository) -> None:
        self._repo = repo

    async def execute(self) -> list[RoleProfile]:
        return await self._repo.list_all()


class GetRoleProfileUseCase:
    def __init__(self, repo: IRoleProfileRepository) -> None:
        self._repo = repo

    async def execute(self, role_profile_id: str) -> RoleProfile:
        profile = await self._repo.get_by_id(role_profile_id)
        if profile is None:
            raise NotFoundError("RoleProfile", role_profile_id)
        return profile
