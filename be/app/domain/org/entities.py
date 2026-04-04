from dataclasses import dataclass, field


@dataclass
class RoleProfile:
    role_profile_id: str
    role_name: str
    expected_dimension_weights: dict  # type: ignore[type-arg]
    expected_opportunity_levels: dict  # type: ignore[type-arg]
    expected_maturity_ranges: dict  # type: ignore[type-arg]
    created_at: str
    updated_at: str


@dataclass
class Member:
    member_id: str
    team_id: str
    organization_id: str  # denormalized for convenience
    display_name: str
    external_id: str | None
    role_profile_id: str | None
    analysis_status: str  # "not_analyzed" | "analyzing" | "completed" | "failed"
    last_analysis_at: str | None
    created_at: str
    updated_at: str


@dataclass
class Team:
    team_id: str
    organization_id: str
    name: str
    created_at: str
    updated_at: str
    members: list[Member] = field(default_factory=list)


@dataclass
class Organization:
    organization_id: str
    name: str
    created_at: str
    updated_at: str
    teams: list[Team] = field(default_factory=list)
