import Link from "next/link";
import { notFound } from "next/navigation";

import { ChevronLeft } from "lucide-react";

import { getAnalysisChamberBootstrap } from "@/features/analysis-chamber/api/analysis-chamber-api";
import { isAnalysisChamberApiErrorStatus } from "@/features/analysis-chamber/api/analysis-chamber-api.client";
import { ScanLobby } from "@/features/analysis-chamber/components/scan-lobby";
import { MEDIEVAL_THEME } from "@/lib/theme/medieval-theme";

export default async function ScanLobbyPage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;

  try {
    await getAnalysisChamberBootstrap(memberId);
  } catch (error) {
    if (isAnalysisChamberApiErrorStatus(error, 404)) {
      notFound();
    }

    throw error;
  }

  return (
    <main
      className="min-h-screen px-4 py-6 md:px-8"
      style={{
        backgroundColor: MEDIEVAL_THEME.backgrounds.pageBase,
        backgroundImage: MEDIEVAL_THEME.gradients.page,
        color: MEDIEVAL_THEME.premiumNoir.pageText,
      }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/members"
            className="inline-flex items-center gap-1.5 font-mono text-xs transition hover:text-white/65 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"
            style={{ color: MEDIEVAL_THEME.premiumNoir.chromeMeta }}
          >
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Members
          </Link>
          <span style={{ color: "rgba(255, 255, 255, 0.15)" }}>/</span>
          <span
            className="font-mono text-xs"
            style={{ color: MEDIEVAL_THEME.premiumNoir.chromeMeta }}
          >
            Scan Lobby
          </span>
        </div>

        <ScanLobby memberId={memberId} />
      </div>
    </main>
  );
}
