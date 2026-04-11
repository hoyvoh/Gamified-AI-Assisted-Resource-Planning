"use client";

import { useQuery } from "@tanstack/react-query";

import { getDossierRepository } from "@/features/dossier/api/dossier-repository.factory";

const Q = {
  overview: (id: string) => ["dossier", id, "overview"] as const,
  competency: (id: string) => ["dossier", id, "competency"] as const,
  kpt: (id: string) => ["dossier", id, "kpt"] as const,
  cases: (id: string) => ["dossier", id, "cases"] as const,
  journey: (id: string) => ["dossier", id, "journey"] as const,
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

export const useDossierData = (memberId: string) => {
  const overview = useDossierOverview(memberId);
  const competency = useDossierCompetency(memberId);
  const kpt = useDossierKpt(memberId);
  const cases = useDossierCases(memberId);
  const journey = useDossierJourney(memberId);

  return { overview, competency, kpt, cases, journey };
};
