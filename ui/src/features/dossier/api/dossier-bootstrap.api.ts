import {
  toAnalysisRun,
  toBootstrapData,
  toProfileOverview,
  toRoleName,
  toTeamName,
} from "@/features/dossier/api/dossier-api.adapter";
import { fetchEnvelope } from "@/features/dossier/api/dossier-api.client";
import type {
  RawAnalysisRunResponse,
  RawMemberResponse,
  RawOrganizationDetailResponse,
  RawProfileOverviewResponse,
  RawRoleProfileResponse,
} from "@/features/dossier/api/dossier-api.types";
import type { DossierBootstrapData } from "@/features/dossier/types/dossier.types";

export const getDossierBootstrapData = async (
  memberId: string,
): Promise<DossierBootstrapData> => {
  const member = await fetchEnvelope<RawMemberResponse>(`/members/${memberId}`);

  const [roles, latestRuns, overview, organization] = await Promise.all([
    fetchEnvelope<RawRoleProfileResponse[]>("/role-profiles"),
    fetchEnvelope<RawAnalysisRunResponse[]>(
      `/members/${memberId}/analysis-runs`,
      undefined,
      { limit: 1, offset: 0 },
    ),
    fetchEnvelope<RawProfileOverviewResponse>(`/members/${memberId}/profile/overview`)
      .then((raw) => toProfileOverview(raw))
      .catch(() => null),
    fetchEnvelope<RawOrganizationDetailResponse>(
      `/organizations/${member.organization_id}`,
    ).catch(() => null),
  ]);

  const latestRun = latestRuns[0] ? toAnalysisRun(latestRuns[0]) : null;

  return toBootstrapData({
    member,
    roleName: toRoleName(member, roles),
    teamName: toTeamName(member, organization?.teams ?? null),
    latestRun,
    overview,
  });
};
