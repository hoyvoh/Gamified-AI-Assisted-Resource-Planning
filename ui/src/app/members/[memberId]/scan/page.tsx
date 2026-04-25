import Link from "next/link";

import { ScanLobby } from "@/features/analysis-chamber/components/scan-lobby";

export default async function ScanLobbyPage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/members"
            className="font-mono text-xs text-white/30 transition hover:text-white/60"
          >
            ← Members
          </Link>
          <span className="text-white/15">/</span>
          <span className="font-mono text-xs text-white/30">Scan Lobby</span>
        </div>

        <ScanLobby memberId={memberId} />
      </div>
    </main>
  );
}
