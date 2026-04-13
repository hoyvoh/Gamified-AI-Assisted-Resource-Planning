import type {
  AnalysisRun,
  DimensionDetailResponse,
  ProfileCasesResponse,
  ProfileCompetencyResponse,
  ProfileJourneyResponse,
  ProfileKptResponse,
  ProfileOverviewResponse,
  ValidationFlag,
} from "@/features/dossier/types/dossier.types";

export interface DossierRepository {
  getOverview(memberId: string): Promise<ProfileOverviewResponse>;
  getCompetency(memberId: string): Promise<ProfileCompetencyResponse>;
  getDimensionDetail(
    memberId: string,
    dimensionId: string,
  ): Promise<DimensionDetailResponse>;
  getKpt(memberId: string): Promise<ProfileKptResponse>;
  getCases(memberId: string): Promise<ProfileCasesResponse>;
  getJourney(memberId: string): Promise<ProfileJourneyResponse>;
  listValidationFlags(runId: string): Promise<ValidationFlag[]>;
  createValidationFlag(input: {
    analysisRunId: string;
    dimensionId: string;
    verdict: "accurate" | "questionable" | "incorrect";
    note: string | null;
  }): Promise<ValidationFlag>;
  createAnalysisRun(input: {
    memberId: string;
    periodStart: string;
    periodEnd: string;
    runType: "fresh" | "refresh_same_period";
  }): Promise<AnalysisRun>;
  getAnalysisRun(runId: string): Promise<AnalysisRun>;
}
