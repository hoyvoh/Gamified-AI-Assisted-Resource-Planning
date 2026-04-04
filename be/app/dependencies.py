from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.analysis.use_cases import (
    GetAnalysisRunUseCase,
    ListMemberAnalysisRunsUseCase,
    RefreshAnalysisUseCase,
    TriggerAnalysisUseCase,
    UpsertBaselineUseCase,
)
from app.application.org.role_profile_use_cases import (
    GetRoleProfileUseCase,
    ListRoleProfilesUseCase,
)
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
from app.config import AnalysisSettings, get_settings
from app.infrastructure.db.repositories.analysis import (
    SqlAnalysisRunRepository,
    SqlPersonalBaselineRepository,
)
from app.infrastructure.db.repositories.org import (
    SqlMemberRepository,
    SqlOrganizationRepository,
    SqlRoleProfileRepository,
    SqlTeamRepository,
)
from app.infrastructure.db.session import get_session

# ── Organization ──────────────────────────────────────────────────────────────


def get_create_organization_use_case(
    session: AsyncSession = Depends(get_session),
) -> CreateOrganizationUseCase:
    return CreateOrganizationUseCase(org_repo=SqlOrganizationRepository(session))


def get_get_organization_use_case(
    session: AsyncSession = Depends(get_session),
) -> GetOrganizationUseCase:
    return GetOrganizationUseCase(org_repo=SqlOrganizationRepository(session))


def get_list_organizations_use_case(
    session: AsyncSession = Depends(get_session),
) -> ListOrganizationsUseCase:
    return ListOrganizationsUseCase(org_repo=SqlOrganizationRepository(session))


def get_update_organization_use_case(
    session: AsyncSession = Depends(get_session),
) -> UpdateOrganizationUseCase:
    return UpdateOrganizationUseCase(org_repo=SqlOrganizationRepository(session))


def get_delete_organization_use_case(
    session: AsyncSession = Depends(get_session),
) -> DeleteOrganizationUseCase:
    return DeleteOrganizationUseCase(org_repo=SqlOrganizationRepository(session))


# ── Team ─────────────────────────────────────────────────────────────────────


def get_create_team_use_case(
    session: AsyncSession = Depends(get_session),
) -> CreateTeamUseCase:
    return CreateTeamUseCase(
        org_repo=SqlOrganizationRepository(session),
        team_repo=SqlTeamRepository(session),
    )


def get_update_team_use_case(
    session: AsyncSession = Depends(get_session),
) -> UpdateTeamUseCase:
    return UpdateTeamUseCase(
        org_repo=SqlOrganizationRepository(session),
        team_repo=SqlTeamRepository(session),
    )


def get_delete_team_use_case(
    session: AsyncSession = Depends(get_session),
) -> DeleteTeamUseCase:
    return DeleteTeamUseCase(
        org_repo=SqlOrganizationRepository(session),
        team_repo=SqlTeamRepository(session),
    )


# ── Member ────────────────────────────────────────────────────────────────────


def get_create_member_use_case(
    session: AsyncSession = Depends(get_session),
) -> CreateMemberUseCase:
    return CreateMemberUseCase(
        org_repo=SqlOrganizationRepository(session),
        team_repo=SqlTeamRepository(session),
        member_repo=SqlMemberRepository(session),
    )


def get_get_member_use_case(
    session: AsyncSession = Depends(get_session),
) -> GetMemberUseCase:
    # Now enriches analysis_status from the analysis_runs table
    return GetMemberUseCase(
        member_repo=SqlMemberRepository(session),
        run_repo=SqlAnalysisRunRepository(session),
    )


def get_update_member_use_case(
    session: AsyncSession = Depends(get_session),
) -> UpdateMemberUseCase:
    return UpdateMemberUseCase(member_repo=SqlMemberRepository(session))


def get_delete_member_use_case(
    session: AsyncSession = Depends(get_session),
) -> DeleteMemberUseCase:
    return DeleteMemberUseCase(member_repo=SqlMemberRepository(session))


# ── Role Profile ──────────────────────────────────────────────────────────────


def get_list_role_profiles_use_case(
    session: AsyncSession = Depends(get_session),
) -> ListRoleProfilesUseCase:
    return ListRoleProfilesUseCase(repo=SqlRoleProfileRepository(session))


def get_get_role_profile_use_case(
    session: AsyncSession = Depends(get_session),
) -> GetRoleProfileUseCase:
    return GetRoleProfileUseCase(repo=SqlRoleProfileRepository(session))


# ── Analysis ──────────────────────────────────────────────────────────────────


def get_analysis_settings() -> AnalysisSettings:
    return get_settings().analysis


def get_trigger_analysis_use_case(
    session: AsyncSession = Depends(get_session),
    settings: AnalysisSettings = Depends(get_analysis_settings),
) -> TriggerAnalysisUseCase:
    return TriggerAnalysisUseCase(
        member_repo=SqlMemberRepository(session),
        run_repo=SqlAnalysisRunRepository(session),
        settings=settings,
    )


def get_get_analysis_run_use_case(
    session: AsyncSession = Depends(get_session),
) -> GetAnalysisRunUseCase:
    return GetAnalysisRunUseCase(run_repo=SqlAnalysisRunRepository(session))


def get_list_member_analysis_runs_use_case(
    session: AsyncSession = Depends(get_session),
) -> ListMemberAnalysisRunsUseCase:
    return ListMemberAnalysisRunsUseCase(
        member_repo=SqlMemberRepository(session),
        run_repo=SqlAnalysisRunRepository(session),
    )


def get_refresh_analysis_use_case(
    session: AsyncSession = Depends(get_session),
    settings: AnalysisSettings = Depends(get_analysis_settings),
) -> RefreshAnalysisUseCase:
    return RefreshAnalysisUseCase(
        member_repo=SqlMemberRepository(session),
        run_repo=SqlAnalysisRunRepository(session),
        settings=settings,
    )


def get_upsert_baseline_use_case(
    session: AsyncSession = Depends(get_session),
) -> UpsertBaselineUseCase:
    return UpsertBaselineUseCase(
        member_repo=SqlMemberRepository(session),
        baseline_repo=SqlPersonalBaselineRepository(session),
    )
