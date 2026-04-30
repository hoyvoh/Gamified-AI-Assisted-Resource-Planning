import { CasesStageShell } from "@/features/analysis-chamber/components/stages/cases-stage-shell";

export default async function ProfileCasesPage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;

  return <CasesStageShell memberId={memberId} />;
}
