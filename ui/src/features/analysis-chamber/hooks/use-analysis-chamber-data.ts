"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createChamberValidationFlag,
  getChamberCaseDetail,
  getChamberDimensionDetail,
  getChamberValidationFlags,
} from "@/features/analysis-chamber/api/analysis-chamber-api";
import {
  useAnalysisChamberCasesData,
  useAnalysisChamberCompetencyData,
  useAnalysisChamberJourneyData,
  useAnalysisChamberKptData,
  useAnalysisChamberOverviewData,
  useAnalysisChamberShellData,
} from "@/features/analysis-chamber/hooks/use-analysis-chamber-shell-data";

const Q = {
  dimensionDetail: (memberId: string, dimensionId: string | null) =>
    ["analysis-chamber", memberId, "dimension", dimensionId ?? "none"] as const,
  caseDetail: (memberId: string, caseId: string | null) =>
    ["analysis-chamber", memberId, "case", caseId ?? "none"] as const,
  validationFlags: (runId: string | null) =>
    ["analysis-chamber", "validation-flags", runId ?? "none"] as const,
  overview: (memberId: string) => ["analysis-chamber", memberId, "overview"] as const,
};

export const useAnalysisChamberBootstrap = useAnalysisChamberShellData;

export const useAnalysisChamberSurfaceData = (
  memberId: string,
  category: string | null,
) => ({
  overview: useAnalysisChamberOverviewData(memberId),
  competency: useAnalysisChamberCompetencyData(memberId, category),
  kpt: useAnalysisChamberKptData(memberId),
  cases: useAnalysisChamberCasesData(memberId),
  journey: useAnalysisChamberJourneyData(memberId),
});

export const useAnalysisChamberDimensionDetail = (
  memberId: string,
  dimensionId: string | null,
) =>
  useQuery({
    enabled: dimensionId !== null,
    queryKey: Q.dimensionDetail(memberId, dimensionId),
    queryFn: () => getChamberDimensionDetail(memberId, dimensionId ?? ""),
    staleTime: 60_000,
  });

export const useAnalysisChamberCaseDetail = (
  memberId: string,
  caseId: string | null,
) =>
  useQuery({
    enabled: caseId !== null,
    queryKey: Q.caseDetail(memberId, caseId),
    queryFn: () => getChamberCaseDetail(memberId, caseId ?? ""),
    staleTime: 60_000,
  });

export const useAnalysisChamberValidationFlags = (runId: string | null) =>
  useQuery({
    enabled: runId !== null,
    queryKey: Q.validationFlags(runId),
    queryFn: () => getChamberValidationFlags(runId ?? ""),
    staleTime: 30_000,
  });

export const useCreateAnalysisChamberValidationFlag = (
  memberId: string,
  runId: string | null,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createChamberValidationFlag,
    onSuccess: async () => {
      if (runId) {
        await queryClient.invalidateQueries({
          queryKey: Q.validationFlags(runId),
        });
      }
      await queryClient.invalidateQueries({
        queryKey: Q.overview(memberId),
      });
    },
  });
};
