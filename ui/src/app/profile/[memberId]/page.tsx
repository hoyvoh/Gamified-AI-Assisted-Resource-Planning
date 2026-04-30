import { OverviewStageShell } from "@/features/analysis-chamber/components/stages/overview-stage-shell";

export default async function ProfileOverviewPage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;

  return <OverviewStageShell memberId={memberId} />;
}
