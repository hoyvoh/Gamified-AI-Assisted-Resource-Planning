"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getDossierRepository } from "@/features/dossier/api/dossier-repository.factory";

const Q = {
  overview: (id: string) => ["dossier", id, "overview"] as const,
  competency: (id: string) => ["dossier", id, "competency"] as const,
  kpt: (id: string) => ["dossier", id, "kpt"] as const,
  cases: (id: string) => ["dossier", id, "cases"] as const,
  journey: (id: string) => ["dossier", id, "journey"] as const,
  dimensionDetail: (memberId: string, dimensionId: string) =>
    ["dossier", memberId, "dimension-detail", dimensionId] as const,
  validationFlags: (runId: string) => ["dossier", "validation-flags", runId] as const,
};

export const useDossierOverview = (memberId: string) =>
  useQuery({
    queryKey: Q.overview(memberId),
    queryFn: () => getDossierRepository().getOverview(memberId),
    staleTime: 60_000,
  });

export const useDossierCompetency = (memberId: string) =>
  useQuery({
    queryKey: Q.competency(memberId),
    queryFn: () => getDossierRepository().getCompetency(memberId),
    staleTime: 60_000,
  });

export const useDossierKpt = (memberId: string) =>
  useQuery({
    queryKey: Q.kpt(memberId),
    queryFn: () => getDossierRepository().getKpt(memberId),
    staleTime: 60_000,
  });

export const useDossierCases = (memberId: string) =>
  useQuery({
    queryKey: Q.cases(memberId),
    queryFn: () => getDossierRepository().getCases(memberId),
    staleTime: 60_000,
  });

export const useDossierJourney = (memberId: string) =>
  useQuery({
    queryKey: Q.journey(memberId),
    queryFn: () => getDossierRepository().getJourney(memberId),
    staleTime: 60_000,
  });

export const useDossierDimensionDetail = (
  memberId: string,
  dimensionId: string | null,
) =>
  useQuery({
    enabled: dimensionId !== null,
    queryKey: Q.dimensionDetail(memberId, dimensionId ?? "none"),
    queryFn: () =>
      getDossierRepository().getDimensionDetail(memberId, dimensionId ?? ""),
    staleTime: 60_000,
  });

export const useDossierValidationFlags = (runId: string | null) =>
  useQuery({
    enabled: runId !== null,
    queryKey: Q.validationFlags(runId ?? "none"),
    queryFn: () => getDossierRepository().listValidationFlags(runId ?? ""),
    staleTime: 30_000,
  });

export const useCreateValidationFlag = (memberId: string, runId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      analysisRunId: string;
      dimensionId: string;
      verdict: "accurate" | "questionable" | "incorrect";
      note: string | null;
    }) => getDossierRepository().createValidationFlag(input),
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

export const useCreateAnalysisRun = (memberId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      periodStart: string;
      periodEnd: string;
      runType: "fresh" | "refresh_same_period";
    }) =>
      getDossierRepository().createAnalysisRun({
        memberId,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        runType: input.runType,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["dossier-bootstrap", memberId],
      });
    },
  });
};

export const useAnalysisRunStatus = (runId: string | null, enabled: boolean) =>
  useQuery({
    enabled: enabled && runId !== null,
    queryKey: ["analysis-run", runId],
    queryFn: () => getDossierRepository().getAnalysisRun(runId ?? ""),
    refetchInterval: (query) =>
      query.state.data && query.state.data.status !== "completed" && query.state.data.status !== "failed"
        ? 3_000
        : false,
    staleTime: 0,
  });

export const useDossierData = (memberId: string) => {
  const overview = useDossierOverview(memberId);
  const competency = useDossierCompetency(memberId);
  const kpt = useDossierKpt(memberId);
  const cases = useDossierCases(memberId);
  const journey = useDossierJourney(memberId);

  return { overview, competency, kpt, cases, journey };
};
