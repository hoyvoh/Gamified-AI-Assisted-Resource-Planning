"use client";

import { useSearchParams } from "next/navigation";

import { DossierScreen } from "@/features/dossier/components/dossier-screen";

export default function DossierPage() {
  const searchParams = useSearchParams();
  const memberId = searchParams.get("id") ?? "mem-001";

  return (
    <DossierScreen
      memberId={memberId}
      memberName="An Vy Nguyen"
      roleName="Senior Frontend Engineer"
      teamName="Orbit Forge"
      analysisStatus="completed"
      confidence={0.92}
    />
  );
}
