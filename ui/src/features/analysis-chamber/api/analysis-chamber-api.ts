import {
  fetchEnvelope,
  postEnvelope,
} from "@/features/analysis-chamber/api/analysis-chamber-api.client";

import type {
  ChamberAnalysisRunResponse,
  ChamberCaseResponse,
  ChamberCasesResponse,
  ChamberCompetencyResponse,
  ChamberCreateMemberRequest,
  ChamberDimensionDetailResponse,
  ChamberJourneyResponse,
  ChamberKptResponse,
  ChamberMemberResponse,
  ChamberOrganizationResponse,
  ChamberOrganizationSummaryResponse,
  ChamberOrganizationTeamResponse,
  ChamberOverviewResponse,
  ChamberRoleProfileResponse,
  ChamberTeamCreateResponse,
  ChamberTriggerAnalysisRequest,
  ChamberValidationFlagRequest,
  ChamberValidationFlagResponse,
} from "@/features/analysis-chamber/api/analysis-chamber-api.types";

import {
  mapChamberAnalysisRun,
  mapChamberBootstrap,
  mapChamberCase,
  mapChamberCases,
  mapChamberCompetency,
  mapChamberDimensionDetail,
  mapChamberJourney,
  mapChamberKpt,
  mapChamberOverview,
  mapChamberValidationFlag,
  mapChamberValidationFlagInput,
} from "@/features/analysis-chamber/api/analysis-chamber-api.mappers";

import type {
  ChamberAnalysisRun,
  ChamberBootstrap,
  ChamberCase,
  ChamberCases,
  ChamberCompetency,
  ChamberDimensionDetail,
  FlatMemberRow,
  ChamberJourney,
  ChamberKpt,
  ChamberOverview,
  ChamberValidationFlag,
  ChamberValidationFlagInput,
} from "@/features/analysis-chamber/api/analysis-chamber-api.view-models";

import { normalizeAnalysisStatus } from "@/types/organization";

const getRoleName = (
  member: ChamberMemberResponse,

  roles: ChamberRoleProfileResponse[],
): string | null =>
  roles.find((role) => role.role_profile_id === member.role_profile_id)
    ?.role_name ?? null;

const getTeamName = (
  member: ChamberMemberResponse,

  organization: ChamberOrganizationResponse | null,
): string =>
  organization?.teams.find((team) => team.team_id === member.team_id)?.name ??
  "Team pending";

export const getAnalysisChamberBootstrap = async (
  memberId: string,
): Promise<ChamberBootstrap> => {
  const member = await fetchEnvelope<ChamberMemberResponse>(
    `/members/${memberId}`,
  );

  const [roles, latestRuns, organization] = await Promise.all([
    fetchEnvelope<ChamberRoleProfileResponse[]>("/role-profiles"),

    fetchEnvelope<ChamberAnalysisRunResponse[]>(
      `/members/${memberId}/analysis-runs`,

      undefined,

      { limit: 1, offset: 0 },
    ).catch(() => []),

    fetchEnvelope<ChamberOrganizationResponse>(
      `/organizations/${member.organization_id}`,
    ).catch(() => null),
  ]);

  return mapChamberBootstrap({
    member,

    role_name: getRoleName(member, roles),

    team_name: getTeamName(member, organization),

    latest_run: latestRuns[0] ?? null,

    analysis_status: normalizeAnalysisStatus(member.analysis_status),
  });
};

export const getChamberOverview = async (
  memberId: string,
): Promise<ChamberOverview> =>
  mapChamberOverview(
    await fetchEnvelope<ChamberOverviewResponse>(
      `/members/${memberId}/profile/overview`,
    ),
  );

export const getChamberCompetency = async (
  memberId: string,

  filters?: { category?: string | null; maturity?: string | null },
): Promise<ChamberCompetency> =>
  mapChamberCompetency(
    await fetchEnvelope<ChamberCompetencyResponse>(
      `/members/${memberId}/profile/competency`,

      undefined,

      {
        category: filters?.category,

        maturity: filters?.maturity,
      },
    ),
  );

export const getChamberDimensionDetail = async (
  memberId: string,

  dimensionId: string,
): Promise<ChamberDimensionDetail> =>
  mapChamberDimensionDetail(
    await fetchEnvelope<ChamberDimensionDetailResponse>(
      `/members/${memberId}/profile/competency/${dimensionId}`,
    ),
  );

export const getChamberKpt = async (memberId: string): Promise<ChamberKpt> =>
  mapChamberKpt(
    await fetchEnvelope<ChamberKptResponse>(`/members/${memberId}/profile/kpt`),
  );

export const getChamberCases = async (
  memberId: string,
): Promise<ChamberCases> =>
  mapChamberCases(
    await fetchEnvelope<ChamberCasesResponse>(
      `/members/${memberId}/profile/cases`,
    ),
  );

export const getChamberCaseDetail = async (
  memberId: string,

  caseId: string,
): Promise<ChamberCase> =>
  mapChamberCase(
    await fetchEnvelope<ChamberCaseResponse>(
      `/members/${memberId}/profile/cases/${caseId}`,
    ),
  );

export const getChamberJourney = async (
  memberId: string,
): Promise<ChamberJourney> =>
  mapChamberJourney(
    await fetchEnvelope<ChamberJourneyResponse>(
      `/members/${memberId}/profile/journey`,
    ),
  );

export const getChamberValidationFlags = async (
  runId: string,
): Promise<ChamberValidationFlag[]> =>
  (
    await fetchEnvelope<ChamberValidationFlagResponse[]>(
      `/analysis-runs/${runId}/validation-flags`,
    )
  )

    .map(mapChamberValidationFlag);

export const createChamberValidationFlag = async (
  body: ChamberValidationFlagInput,
): Promise<ChamberValidationFlag> =>
  mapChamberValidationFlag(
    await postEnvelope<
      ChamberValidationFlagResponse,
      ChamberValidationFlagRequest
    >(
      "/validation-flags",

      mapChamberValidationFlagInput(body),
    ),
  );

// ─── Org / Team / Member CRUD ────────────────────────────────────────────────

export const listOrganizations = async (): Promise<
  ChamberOrganizationSummaryResponse[]
> => fetchEnvelope<ChamberOrganizationSummaryResponse[]>("/organizations");

export const getOrganizationDetail = async (
  orgId: string,
): Promise<ChamberOrganizationResponse> =>
  fetchEnvelope<ChamberOrganizationResponse>(`/organizations/${orgId}`);

export const createOrganization = async (
  name: string,
): Promise<ChamberOrganizationSummaryResponse> =>
  postEnvelope<ChamberOrganizationSummaryResponse, { name: string }>(
    "/organizations",

    { name },
  );

export const getOrgTeams = async (
  orgId: string,
): Promise<ChamberOrganizationTeamResponse[]> => {
  const detail = await getOrganizationDetail(orgId);

  return detail.teams;
};

export const createTeam = async (
  orgId: string,

  name: string,
): Promise<ChamberTeamCreateResponse> =>
  postEnvelope<ChamberTeamCreateResponse, { name: string }>(
    `/organizations/${orgId}/teams`,

    { name },
  );

export const createMember = async (
  orgId: string,

  teamId: string,

  data: ChamberCreateMemberRequest,
): Promise<ChamberMemberResponse> =>
  postEnvelope<ChamberMemberResponse, ChamberCreateMemberRequest>(
    `/organizations/${orgId}/teams/${teamId}/members`,

    data,
  );

// Trigger a fresh analysis run for a member. period defaults to the last 90 days.

export const triggerAnalysis = async (
  memberId: string,

  periodStart?: string,

  periodEnd?: string,
): Promise<ChamberAnalysisRunResponse> => {
  const end = periodEnd ?? new Date().toISOString().slice(0, 10);

  const start =
    periodStart ??
    new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  return postEnvelope<
    ChamberAnalysisRunResponse,
    ChamberTriggerAnalysisRequest
  >(
    "/analysis-runs",

    { member_id: memberId, period_start: start, period_end: end },
  );
};

// No search-by-external-id API exists, so we scan org trees client-side.

// TODO: replace with a dedicated search endpoint (e.g. GET /members?external_id=<handle>)

//       once the backend adds one — scanning all orgs is O(n_orgs) round-trips.

// ─── Member list (flat, across all orgs) ─────────────────────────────────────

export const getAllMembersAcrossOrgs = async (): Promise<FlatMemberRow[]> => {
  const [orgs, roles] = await Promise.all([
    fetchEnvelope<ChamberOrganizationSummaryResponse[]>("/organizations"),
    fetchEnvelope<ChamberRoleProfileResponse[]>("/role-profiles"),
  ]);

  const orgDetails = await Promise.all(
    orgs.map((org) =>
      fetchEnvelope<ChamberOrganizationResponse>(
        `/organizations/${org.organization_id}`,
      ),
    ),
  );

  const rows: FlatMemberRow[] = [];
  for (const org of orgDetails) {
    for (const team of org.teams) {
      for (const member of team.members) {
        rows.push({
          memberId: member.member_id,
          displayName: member.display_name,
          externalId: member.external_id,
          roleProfileId: member.role_profile_id,
          roleName:
            roles.find((r) => r.role_profile_id === member.role_profile_id)
              ?.role_name ?? null,
          teamId: team.team_id,
          teamName: team.name,
          orgId: org.organization_id,
          orgName: org.name,
          analysisStatus: normalizeAnalysisStatus(member.analysis_status),
          lastAnalysisAt: member.last_analysis_at,
        });
      }
    }
  }
  return rows;
};

// ─── Analysis run by ID (for polling) ────────────────────────────────────────

export const getAnalysisRunById = async (
  runId: string,
): Promise<ChamberAnalysisRun> =>
  mapChamberAnalysisRun(
    await fetchEnvelope<ChamberAnalysisRunResponse>(`/analysis-runs/${runId}`),
  );

// ─── Member run history ───────────────────────────────────────────────────────

export const getMemberAnalysisRuns = async (
  memberId: string,
  limit = 10,
): Promise<ChamberAnalysisRun[]> =>
  (
    await fetchEnvelope<ChamberAnalysisRunResponse[]>(
      `/members/${memberId}/analysis-runs`,
      undefined,
      { limit, offset: 0 },
    )
  ).map(mapChamberAnalysisRun);

// ─── GitHub handle lookup ─────────────────────────────────────────────────────

export const findMemberByGithubHandle = async (
  githubHandle: string,
): Promise<string | null> => {
  const orgs =
    await fetchEnvelope<ChamberOrganizationSummaryResponse[]>(
      "/organizations",
    );

  const handle = githubHandle.trim().toLowerCase();

  for (const org of orgs) {
    const detail = await fetchEnvelope<ChamberOrganizationResponse>(
      `/organizations/${org.organization_id}`,
    );

    for (const team of detail.teams) {
      const match = team.members.find(
        (m) => m.external_id?.toLowerCase() === handle,
      );

      if (match) return match.member_id;
    }
  }

  return null;
};
