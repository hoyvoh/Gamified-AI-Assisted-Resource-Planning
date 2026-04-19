import {
  fetchEnvelope,
  postEnvelope,
} from "@/features/analysis-chamber/api/analysis-chamber-api.client";
import type {
  ChamberAnalysisRunResponse,
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
import {
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
  ChamberBootstrap,
  ChamberCase,
  ChamberCases,
  ChamberCompetency,
  ChamberDimensionDetail,
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
  ).map(mapChamberValidationFlag);

export const createChamberValidationFlag = async (
  body: ChamberValidationFlagInput,
): Promise<ChamberValidationFlag> =>
  mapChamberValidationFlag(
    await postEnvelope<ChamberValidationFlagResponse, ChamberValidationFlagRequest>(
      "/validation-flags",
      mapChamberValidationFlagInput(body),
    ),
  );
