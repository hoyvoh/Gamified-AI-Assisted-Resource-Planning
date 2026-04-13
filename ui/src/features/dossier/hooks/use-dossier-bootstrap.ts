"use client";

import { useQuery } from "@tanstack/react-query";

import { getDossierBootstrapData } from "@/features/dossier/api/dossier-bootstrap.api";
import { shouldUseMockDossierData } from "@/features/dossier/config/dossier-runtime.config";
import type { DossierBootstrapData } from "@/features/dossier/types/dossier.types";
import { normalizeAnalysisStatus } from "@/types/organization";

const DEFAULT_DOSSIER_BOOTSTRAP: DossierBootstrapData = {
  memberId: "mem-001",
  memberName: "An Vy Nguyen",
  roleName: "Senior Frontend Engineer",
  teamName: "Orbit Forge",
  analysisStatus: normalizeAnalysisStatus("completed"),
  confidence: 0.92,
  latestRun: null,
};

export const useDossierBootstrap = (memberId: string) =>
  useQuery({
    queryKey: ["dossier-bootstrap", memberId],
    queryFn: () =>
      shouldUseMockDossierData()
        ? Promise.resolve({
            ...DEFAULT_DOSSIER_BOOTSTRAP,
            memberId,
          })
        : getDossierBootstrapData(memberId),
    staleTime: 60_000,
  });
