import type { ReactNode } from "react";

import { AnalysisChamberShell } from "@/features/analysis-chamber/components/analysis-chamber-shell";

export default async function ProfileMemberLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;

  return (
    <AnalysisChamberShell memberId={memberId}>{children}</AnalysisChamberShell>
  );
}
