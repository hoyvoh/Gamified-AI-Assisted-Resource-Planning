import { JourneyStageShell } from "@/features/analysis-chamber/components/stages/journey-stage-shell";

export default async function ProfileJourneyPage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;

  return <JourneyStageShell memberId={memberId} />;
}
