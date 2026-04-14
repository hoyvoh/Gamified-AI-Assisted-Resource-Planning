"use client";

import { useSearchParams } from "next/navigation";

import { DossierScreen } from "@/features/dossier/components/dossier-screen";
import { useDossierBootstrap } from "@/features/dossier/hooks/use-dossier-bootstrap";

// TODO: Remove default member ID and handle missing/invalid IDs properly
const DEFAULT_MEMBER_ID = "95822897-33ad-4aa7-aa7c-1bd3ca8081cd";

export function DossierPageContent() {
  const searchParams = useSearchParams();
  const memberId = searchParams.get("id") ?? DEFAULT_MEMBER_ID;
  const bootstrap = useDossierBootstrap(memberId);

  if (bootstrap.isLoading || !bootstrap.data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#05070d] px-6 text-center text-[#b8cde0]">
        Loading dossier chamber...
      </main>
    );
  }

  if (bootstrap.isError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#05070d] px-6 text-center text-[#fca5a5]">
        Failed to bootstrap dossier data. Please verify the backend API.
      </main>
    );
  }

  return (
    <DossierScreen
      memberId={bootstrap.data.memberId}
      memberName={bootstrap.data.memberName}
      roleName={bootstrap.data.roleName}
      teamName={bootstrap.data.teamName}
      analysisStatus={bootstrap.data.analysisStatus}
      confidence={bootstrap.data.confidence}
      initialOverview={bootstrap.data.initialOverview}
      latestRun={bootstrap.data.latestRun}
    />
  );
}
