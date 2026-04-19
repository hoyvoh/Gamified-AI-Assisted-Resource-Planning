import {
  fetchEnvelope,
  postEnvelope,
} from "@/features/analysis-chamber/api/analysis-chamber-api.client";
import type {
  ChamberAnalysisRunResponse,
  ChamberBootstrapData,
  ChamberCaseResponse,
  ChamberCasesResponse,
  ChamberCompetencyResponse,
  ChamberDimensionDetailResponse,
  ChamberJourneyResponse,
  ChamberKptResponse,
  ChamberMemberResponse,
  ChamberOrganizationResponse,
  ChamberOverviewResponse,
  ChamberRoleProfileResponse,
  ChamberValidationFlagRequest,
  ChamberValidationFlagResponse,
} from "@/features/analysis-chamber/api/analysis-chamber-api.types";
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
): Promise<ChamberBootstrapData> => {
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

  return {
    member,
    role_name: getRoleName(member, roles),
    team_name: getTeamName(member, organization),
    latest_run: latestRuns[0] ?? null,
    analysis_status: normalizeAnalysisStatus(member.analysis_status),
  };
};

export const getChamberOverview = (memberId: string) =>
  fetchEnvelope<ChamberOverviewResponse>(
    `/members/${memberId}/profile/overview`,
  );

export const getChamberCompetency = (
  memberId: string,
  filters?: { category?: string | null; maturity?: string | null },
) =>
  fetchEnvelope<ChamberCompetencyResponse>(
    `/members/${memberId}/profile/competency`,
    undefined,
    {
      category: filters?.category,
      maturity: filters?.maturity,
    },
  );

export const getChamberDimensionDetail = (
  memberId: string,
  dimensionId: string,
) =>
  fetchEnvelope<ChamberDimensionDetailResponse>(
    `/members/${memberId}/profile/competency/${dimensionId}`,
  );

export const getChamberKpt = (memberId: string) =>
  fetchEnvelope<ChamberKptResponse>(`/members/${memberId}/profile/kpt`);

export const getChamberCases = (memberId: string) =>
  fetchEnvelope<ChamberCasesResponse>(`/members/${memberId}/profile/cases`);

export const getChamberCaseDetail = (memberId: string, caseId: string) =>
  fetchEnvelope<ChamberCaseResponse>(
    `/members/${memberId}/profile/cases/${caseId}`,
  );

export const getChamberJourney = (memberId: string) =>
  fetchEnvelope<ChamberJourneyResponse>(`/members/${memberId}/profile/journey`);

export const getChamberValidationFlags = (runId: string) =>
  fetchEnvelope<ChamberValidationFlagResponse[]>(
    `/analysis-runs/${runId}/validation-flags`,
  );

export const createChamberValidationFlag = (
  body: ChamberValidationFlagRequest,
) =>
  postEnvelope<ChamberValidationFlagResponse, ChamberValidationFlagRequest>(
    "/validation-flags",
    body,
  );
