import type {
  ProfileCasesResponse,
  ProfileCompetencyResponse,
  ProfileJourneyResponse,
  ProfileKptResponse,
  ProfileOverviewResponse,
} from "@/features/dossier/types/dossier.types";

export interface DossierRepository {
  getOverview(memberId: string): Promise<ProfileOverviewResponse>;
  getCompetency(memberId: string): Promise<ProfileCompetencyResponse>;
  getKpt(memberId: string): Promise<ProfileKptResponse>;
  getCases(memberId: string): Promise<ProfileCasesResponse>;
  getJourney(memberId: string): Promise<ProfileJourneyResponse>;
}
