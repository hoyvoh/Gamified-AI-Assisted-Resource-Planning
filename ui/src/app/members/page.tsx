import Link from "next/link";

import { MembersWarRoom } from "@/features/analysis-chamber/components/members-war-room";

export default function MembersPage() {
  return (
    <main className="min-h-screen bg-[#0c0907] bg-[radial-gradient(circle_at_14%_0%,rgba(170,120,52,0.15),transparent_24%),radial-gradient(circle_at_80%_12%,rgba(103,54,42,0.12),transparent_18%),linear-gradient(180deg,#17110c_0%,#080605_100%)] px-4 py-6 text-[#f3e3c1] sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 opacity-[0.04] [background-image:url('/journey-map/backgrounds/base-paper-bg.png')] [background-size:520px_520px]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-5 flex items-center gap-3">
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-[0.14em] text-[#d5bf90]/55 transition hover:text-[#f3e3c1]/80"
          >
            Back To Launcher
          </Link>
        </div>

        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#d1ac67]/80">
          Analysis Chamber / Medieval Members Direction
        </p>
        <h1 className="mt-2 font-body-serif text-5xl leading-none text-[#f4e6c8] md:text-6xl">
          Members as a War Council
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[#e4d3af]/62">
          Reframing the members page as a medieval campaign room: champions,
          houses, banners, campaign states, and royal dossiers. The interface
          should feel game-like, but still behave like a fast operating surface.
        </p>

        <div className="mt-8">
          <MembersWarRoom />
        </div>
      </div>
    </main>
  );
}
