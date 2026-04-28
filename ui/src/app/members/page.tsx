import Link from "next/link";

import { MembersWarRoom } from "@/features/analysis-chamber/components/members-war-room";
import { MEDIEVAL_THEME } from "@/lib/theme/medieval-theme";

export default function MembersPage() {
  return (
    <main
      className="min-h-screen px-4 py-6 sm:px-6 lg:px-8"
      style={{
        backgroundColor: MEDIEVAL_THEME.backgrounds.pageBase,
        backgroundImage: MEDIEVAL_THEME.gradients.page,
        color: MEDIEVAL_THEME.text.primary,
      }}
    >
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.04] [background-size:520px_520px]"
        style={{ backgroundImage: MEDIEVAL_THEME.effects.parchmentOverlay }}
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-5 flex items-center gap-3">
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-[0.14em] transition"
            style={{ color: "rgba(213, 191, 144, 0.55)" }}
          >
            Back To Launcher
          </Link>
        </div>

        <p
          className="font-mono text-[11px] uppercase tracking-[0.22em]"
          style={{ color: "rgba(209, 172, 103, 0.8)" }}
        >
          Analysis Chamber / Medieval Members Direction
        </p>
        <h1
          className="mt-2 font-body-serif text-5xl leading-none md:text-6xl"
          style={{ color: MEDIEVAL_THEME.text.heading }}
        >
          Members as a War Council
        </h1>
        <p
          className="mt-4 max-w-3xl text-sm leading-7"
          style={{ color: "rgba(228, 211, 175, 0.62)" }}
        >
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
