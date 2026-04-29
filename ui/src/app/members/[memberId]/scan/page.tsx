import Link from "next/link";

import { ChevronLeft } from "lucide-react";

import { ScanLobby } from "@/features/analysis-chamber/components/scan-lobby";

export default async function ScanLobbyPage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_50%_0%,rgba(214,168,79,0.12),transparent_34%),linear-gradient(180deg,#0b0707,#050405)] px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/members"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-white/35 transition hover:text-white/65 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"
          >
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Members
          </Link>
          <span className="text-white/15">/</span>
          <span className="font-mono text-xs text-white/35">
            Scout Dispatch Chamber
          </span>
        </div>

        <ScanLobby memberId={memberId} />
      </div>
    </main>
  );
}
