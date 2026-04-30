import { CompetencyStageShell } from "@/features/analysis-chamber/components/stages/competency-stage-shell";

export default async function ProfileCompetencyPage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;

  return <CompetencyStageShell memberId={memberId} />;
}
