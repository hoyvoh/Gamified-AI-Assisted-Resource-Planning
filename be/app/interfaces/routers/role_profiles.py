from fastapi import APIRouter, Depends, HTTPException

from app.application.org.role_profile_use_cases import (
    GetRoleProfileUseCase,
    ListRoleProfilesUseCase,
)
from app.dependencies import get_get_role_profile_use_case, get_list_role_profiles_use_case
from app.domain.shared.exceptions import NotFoundError
from app.interfaces.schemas.base import DataEnvelope
from app.interfaces.schemas.org import RoleProfileResponse

router = APIRouter(prefix="/api/v1", tags=["role-profiles"])


@router.get("/role-profiles", response_model=DataEnvelope[list[RoleProfileResponse]])
async def list_role_profiles(
    use_case: ListRoleProfilesUseCase = Depends(get_list_role_profiles_use_case),
) -> DataEnvelope[list[RoleProfileResponse]]:
    profiles = await use_case.execute()
    return DataEnvelope(data=[RoleProfileResponse.model_validate(p.__dict__) for p in profiles])


@router.get("/role-profiles/{role_profile_id}", response_model=DataEnvelope[RoleProfileResponse])
async def get_role_profile(
    role_profile_id: str,
    use_case: GetRoleProfileUseCase = Depends(get_get_role_profile_use_case),
) -> DataEnvelope[RoleProfileResponse]:
    try:
        profile = await use_case.execute(role_profile_id)
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return DataEnvelope(data=RoleProfileResponse.model_validate(profile.__dict__))
