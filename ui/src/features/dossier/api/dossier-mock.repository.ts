import {
  MOCK_CASES_RESPONSE,
  MOCK_COMPETENCY_RESPONSE,
  MOCK_DOSSIER_OVERVIEW,
  MOCK_DIMENSION_DETAIL_RESPONSE,
  MOCK_JOURNEY_RESPONSE,
  MOCK_KPT_RESPONSE,
  MOCK_VALIDATION_FLAGS,
} from "@/features/dossier/data/dossier.mock-data";
import type { DossierRepository } from "@/features/dossier/api/dossier.repository";
import { normalizeAnalysisStatus } from "@/types/organization";

export const createMockDossierRepository = (): DossierRepository => ({
  async getOverview() {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return MOCK_DOSSIER_OVERVIEW;
  },
  async getCompetency() {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return MOCK_COMPETENCY_RESPONSE;
  },
  async getDimensionDetail() {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return MOCK_DIMENSION_DETAIL_RESPONSE;
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
  async listValidationFlags() {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return MOCK_VALIDATION_FLAGS;
  },
  async createValidationFlag(input) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return {
      flagId: `flag-${Date.now()}`,
      analysisRunId: input.analysisRunId,
      dimensionId: input.dimensionId,
      verdict: input.verdict,
      note: input.note,
      flaggedAt: new Date().toISOString(),
    };
  },
  async createAnalysisRun(input) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return {
      analysisRunId: "run-mock-refresh",
      memberId: input.memberId,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      runType: input.runType,
      status: normalizeAnalysisStatus("analyzing"),
      progressStage: "collecting_data",
      progressPct: 15,
      errorMessage: null,
      scoringVersion: "mock-v1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
    };
  },
  async getAnalysisRun(runId) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return {
      analysisRunId: runId,
      memberId: MOCK_DOSSIER_OVERVIEW.memberId,
      periodStart: MOCK_DOSSIER_OVERVIEW.periodStart,
      periodEnd: MOCK_DOSSIER_OVERVIEW.periodEnd,
      runType: "fresh",
      status: normalizeAnalysisStatus("completed"),
      progressStage: null,
      progressPct: 100,
      errorMessage: null,
      scoringVersion: MOCK_DOSSIER_OVERVIEW.scoringVersion,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };
  },
});
