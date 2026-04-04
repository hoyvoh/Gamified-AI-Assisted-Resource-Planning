from typing import Any

from pydantic import BaseModel, Field

from app.interfaces.schemas.base import BaseResponse

# ── Role Profile ──────────────────────────────────────────────────────────────


class RoleProfileResponse(BaseResponse):
    role_profile_id: str
    role_name: str
    expected_dimension_weights: dict[str, Any]
    expected_opportunity_levels: dict[str, Any]
    expected_maturity_ranges: dict[str, Any]


# ── Organization ──────────────────────────────────────────────────────────────


class CreateOrganizationRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)


class UpdateOrganizationRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)


class OrganizationResponse(BaseResponse):
    organization_id: str
    name: str
    created_at: str
    updated_at: str


class MemberStatusItem(BaseResponse):
    member_id: str
    display_name: str
    external_id: str | None
    role_profile_id: str | None
    analysis_status: str
    last_analysis_at: str | None


class TeamTreeItem(BaseResponse):
    team_id: str
    name: str
    members: list[MemberStatusItem]


class OrganizationDetailResponse(BaseResponse):
    organization_id: str
    name: str
    created_at: str
    updated_at: str
    teams: list[TeamTreeItem]


class OrganizationListItem(BaseResponse):
    organization_id: str
    name: str
    team_count: int
    member_count: int
    created_at: str


# ── Team ─────────────────────────────────────────────────────────────────────


class CreateTeamRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)


class UpdateTeamRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)


class TeamResponse(BaseResponse):
    team_id: str
    organization_id: str
    name: str
    created_at: str
    updated_at: str


# ── Member ────────────────────────────────────────────────────────────────────


class CreateMemberRequest(BaseModel):
    display_name: str = Field(min_length=1, max_length=255)
    external_id: str | None = None
    role_profile_id: str | None = None


class UpdateMemberRequest(BaseModel):
    display_name: str = Field(min_length=1, max_length=255)
    external_id: str | None = None
    role_profile_id: str | None = None


class MemberResponse(BaseResponse):
    member_id: str
    team_id: str
    organization_id: str
    display_name: str
    external_id: str | None
    role_profile_id: str | None
    analysis_status: str
    last_analysis_at: str | None
    created_at: str
    updated_at: str
