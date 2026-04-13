import { DossierApiError } from "@/features/dossier/api/dossier-api.client";
import type {
  DossierTab,
  ProfileCasesResponse,
  ProfileCompetencyResponse,
  ProfileJourneyResponse,
  ProfileKptResponse,
  ProfileOverviewResponse,
} from "@/features/dossier/types/dossier.types";
import type { AnalysisStatus } from "@/types/organization";

export type DossierSurfaceState =
  | "ready"
  | "not_analyzed"
  | "not_found"
  | "empty"
  | "server_error"
  | "failed_run";

type DossierSurfaceData =
  | ProfileOverviewResponse
  | ProfileCompetencyResponse
  | ProfileKptResponse
  | ProfileCasesResponse
  | ProfileJourneyResponse;

const isOverviewEmpty = (data: ProfileOverviewResponse): boolean =>
  !data.profileSummary &&
  !data.growthJourneySummary &&
  !data.currentGrowthPath &&
  data.categoryScores.length === 0 &&
  data.topStrengthDimensionIds.length === 0 &&
  data.topGrowthDimensionIds.length === 0;

const isCompetencyEmpty = (data: ProfileCompetencyResponse): boolean =>
  data.dimensionScores.length === 0 && data.categoryScores.length === 0;

const isKptEmpty = (data: ProfileKptResponse): boolean =>
  data.keepItems.length === 0 &&
  data.problemItems.length === 0 &&
  data.tryItems.length === 0;

const isCasesEmpty = (data: ProfileCasesResponse): boolean => data.cases.length === 0;

const isJourneyEmpty = (data: ProfileJourneyResponse): boolean =>
  data.milestones.length === 0 &&
  !data.growthJourneySummary &&
  !data.currentGrowthPath;

export const isSurfacePayloadEmpty = (
  tab: DossierTab,
  data: DossierSurfaceData,
): boolean => {
  switch (tab) {
    case "overview":
      return isOverviewEmpty(data as ProfileOverviewResponse);
    case "competency":
      return isCompetencyEmpty(data as ProfileCompetencyResponse);
    case "kpt":
      return isKptEmpty(data as ProfileKptResponse);
    case "cases":
      return isCasesEmpty(data as ProfileCasesResponse);
    case "journey":
      return isJourneyEmpty(data as ProfileJourneyResponse);
    default:
      return false;
  }
};

export const resolveDossierSurfaceState = ({
  analysisStatus,
  data,
  error,
  isError,
  tab,
}: {
  analysisStatus: AnalysisStatus;
  data:
    | ProfileOverviewResponse
    | ProfileCompetencyResponse
    | ProfileKptResponse
    | ProfileCasesResponse
    | ProfileJourneyResponse
    | undefined;
  error: Error | null;
  isError: boolean;
  tab: DossierTab;
}): DossierSurfaceState => {
  if (analysisStatus === "failed" && !data) {
    return "failed_run";
  }

  if (isError) {
    if (error instanceof DossierApiError && error.status === 404) {
      return analysisStatus === "not_analyzed" ? "not_analyzed" : "not_found";
    }

    return "server_error";
  }

  if (!data) {
    if (analysisStatus === "not_analyzed") {
      return "not_analyzed";
    }

    return "empty";
  }

  if (isSurfacePayloadEmpty(tab, data)) {
    return "empty";
  }

  return "ready";
};
