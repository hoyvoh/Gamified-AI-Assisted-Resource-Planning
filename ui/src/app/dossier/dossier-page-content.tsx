"use client";

import { useSearchParams } from "next/navigation";

import { DossierScreen } from "@/features/dossier/components/dossier-screen";
import { normalizeAnalysisStatus } from "@/types/organization";

const DEFAULT_DOSSIER_MEMBER = {
  memberId: "mem-001",
  memberName: "An Vy Nguyen",
  roleName: "Senior Frontend Engineer",
  teamName: "Orbit Forge",
  analysisStatus: normalizeAnalysisStatus("completed"),
  confidence: 0.92,
} as const;

export function DossierPageContent() {
  const searchParams = useSearchParams();
  const memberId = searchParams.get("id") ?? DEFAULT_DOSSIER_MEMBER.memberId;

  return (
    <DossierScreen
      memberId={memberId}
      memberName={DEFAULT_DOSSIER_MEMBER.memberName}
      roleName={DEFAULT_DOSSIER_MEMBER.roleName}
      teamName={DEFAULT_DOSSIER_MEMBER.teamName}
      analysisStatus={DEFAULT_DOSSIER_MEMBER.analysisStatus}
      confidence={DEFAULT_DOSSIER_MEMBER.confidence}
    />
  );
}
