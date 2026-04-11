import {
  MOCK_CASES_RESPONSE,
  MOCK_COMPETENCY_RESPONSE,
  MOCK_DOSSIER_OVERVIEW,
  MOCK_JOURNEY_RESPONSE,
  MOCK_KPT_RESPONSE,
} from "@/features/dossier/data/dossier.mock-data";
import type { DossierRepository } from "@/features/dossier/api/dossier.repository";

export const createMockDossierRepository = (): DossierRepository => ({
  async getOverview() {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return MOCK_DOSSIER_OVERVIEW;
  },
  async getCompetency() {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return MOCK_COMPETENCY_RESPONSE;
  },
  async getKpt() {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return MOCK_KPT_RESPONSE;
  },
  async getCases() {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return MOCK_CASES_RESPONSE;
  },
  async getJourney() {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return MOCK_JOURNEY_RESPONSE;
  },
});
