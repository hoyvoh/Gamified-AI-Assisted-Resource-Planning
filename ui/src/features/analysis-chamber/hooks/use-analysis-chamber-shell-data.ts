"use client";

import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getAnalysisChamberBootstrap,
  getChamberCases,
  getChamberCompetency,
  getChamberJourney,
  getChamberKpt,
  getChamberOverview,
} from "@/features/analysis-chamber/api/analysis-chamber-api";

const Q = {
  bootstrap: (memberId: string) =>
    ["analysis-chamber", memberId, "bootstrap"] as const,

  overview: (memberId: string) =>
    ["analysis-chamber", memberId, "overview"] as const,

  competency: (memberId: string, category: string | null) =>
    ["analysis-chamber", memberId, "competency", category ?? "all"] as const,

  kpt: (memberId: string) => ["analysis-chamber", memberId, "kpt"] as const,

  cases: (memberId: string) => ["analysis-chamber", memberId, "cases"] as const,

  journey: (memberId: string) =>
    ["analysis-chamber", memberId, "journey"] as const,
};

export const useAnalysisChamberShellData = (memberId: string) =>
  useQuery({
    queryKey: Q.bootstrap(memberId),

    queryFn: () => getAnalysisChamberBootstrap(memberId),

    staleTime: 60_000,

    // Poll while analysis is running so the shell auto-advances to completed state

    refetchInterval: (query) => {
      const status = query.state.data?.analysisStatus;

      return status === "analyzing" ? 8_000 : false;
    },
  });

export const useAnalysisChamberOverviewData = (memberId: string) =>
  useQuery({
    queryKey: Q.overview(memberId),

    queryFn: () => getChamberOverview(memberId),

    staleTime: 60_000,
  });

export const useAnalysisChamberCompetencyData = (
  memberId: string,

  category: string | null,
) =>
  useQuery({
    queryKey: Q.competency(memberId, category),

    queryFn: () => getChamberCompetency(memberId, { category }),

    placeholderData: keepPreviousData,

    staleTime: 60_000,
  });

export const useAnalysisChamberKptData = (memberId: string) =>
  useQuery({
    queryKey: Q.kpt(memberId),

    queryFn: () => getChamberKpt(memberId),

    staleTime: 60_000,
  });

export const useAnalysisChamberCasesData = (memberId: string) =>
  useQuery({
    queryKey: Q.cases(memberId),

    queryFn: () => getChamberCases(memberId),

    staleTime: 60_000,
  });

export const useAnalysisChamberJourneyData = (memberId: string) =>
  useQuery({
    queryKey: Q.journey(memberId),

    queryFn: () => getChamberJourney(memberId),

    staleTime: 60_000,
  });

export const useRefreshChamber = (memberId: string) => {
  const queryClient = useQueryClient();

  return () =>
    queryClient.invalidateQueries({
      queryKey: ["analysis-chamber", memberId],
    });
};
