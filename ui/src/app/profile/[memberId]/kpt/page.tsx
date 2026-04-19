import { KptStageShell } from "@/features/analysis-chamber/components/stages/kpt-stage-shell";

export default async function ProfileKptPage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;

  return <KptStageShell memberId={memberId} />;
}
