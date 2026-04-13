import {
  toAnalysisRun,
  toDimensionDetail,
  toProfileCases,
  toProfileCompetency,
  toProfileJourney,
  toProfileKpt,
  toProfileOverview,
  toValidationFlag,
} from "@/features/dossier/api/dossier-api.adapter";
import {
  fetchEnvelope,
  postEnvelope,
} from "@/features/dossier/api/dossier-api.client";
import type {
  RawAnalysisRunResponse,
  RawCreateAnalysisRunRequest,
  RawCreateValidationFlagRequest,
  RawDimensionDetailResponse,
  RawProfileCasesResponse,
  RawProfileCompetencyResponse,
  RawProfileJourneyResponse,
  RawProfileKptResponse,
  RawProfileOverviewResponse,
  RawValidationFlagResponse,
} from "@/features/dossier/api/dossier-api.types";
import type { DossierRepository } from "@/features/dossier/api/dossier.repository";

export const createHttpDossierRepository = (): DossierRepository => ({
  async getOverview(memberId) {
    const raw = await fetchEnvelope<RawProfileOverviewResponse>(
      `/members/${memberId}/profile/overview`,
    );
    return toProfileOverview(raw);
  },
  async getCompetency(memberId) {
    const raw = await fetchEnvelope<RawProfileCompetencyResponse>(
      `/members/${memberId}/profile/competency`,
    );
    return toProfileCompetency(raw);
  },
  async getDimensionDetail(memberId, dimensionId) {
    const raw = await fetchEnvelope<RawDimensionDetailResponse>(
      `/members/${memberId}/profile/competency/${dimensionId}`,
    );
    return toDimensionDetail(raw);
  },
  async getKpt(memberId) {
    const raw = await fetchEnvelope<RawProfileKptResponse>(
      `/members/${memberId}/profile/kpt`,
    );
    return toProfileKpt(raw);
  },
  async getCases(memberId) {
    const raw = await fetchEnvelope<RawProfileCasesResponse>(
      `/members/${memberId}/profile/cases`,
    );
    return toProfileCases(raw);
  },
  async getJourney(memberId) {
    const raw = await fetchEnvelope<RawProfileJourneyResponse>(
      `/members/${memberId}/profile/journey`,
    );
    return toProfileJourney(raw);
  },
  async listValidationFlags(runId) {
    const raw = await fetchEnvelope<RawValidationFlagResponse[]>(
      `/analysis-runs/${runId}/validation-flags`,
    );
    return raw.map(toValidationFlag);
  },
  async createValidationFlag(input) {
    const raw = await postEnvelope<
      RawValidationFlagResponse,
      RawCreateValidationFlagRequest
    >("/validation-flags", {
      analysis_run_id: input.analysisRunId,
      dimension_id: input.dimensionId,
      verdict: input.verdict,
      note: input.note,
    });
    return toValidationFlag(raw);
  },
  async createAnalysisRun(input) {
    const raw = await postEnvelope<
      RawAnalysisRunResponse,
      RawCreateAnalysisRunRequest
    >("/analysis-runs", {
      member_id: input.memberId,
      period_start: input.periodStart,
      period_end: input.periodEnd,
      run_type: input.runType,
    });
    return toAnalysisRun(raw);
  },
  async getAnalysisRun(runId) {
    const raw = await fetchEnvelope<RawAnalysisRunResponse>(
      `/analysis-runs/${runId}`,
    );
    return toAnalysisRun(raw);
  },
});
