"use client";

import {
  ANALYSIS_CHAMBER_SHELL_PALETTE as palette,
  CHAMBER_CHROME_TOKENS,
} from "@/features/analysis-chamber/lib/analysis-chamber-shell.constants";

export default function ProfileMemberError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      className="flex h-full min-h-130 items-center justify-center px-6 text-center"
      style={{ color: palette.crimson }}
    >
      <div>
        <p className="font-display text-sm uppercase tracking-[0.18em]">
          Chamber stage unavailable
        </p>
        <p className="mt-2 text-sm" style={{ color: palette.inkSoft }}>
          This chamber view could not be loaded.
        </p>
        <button
          className="mt-6 rounded-md border px-4 py-2 text-xs uppercase tracking-[0.14em] transition hover:brightness-110"
          onClick={reset}
          style={{
            borderColor: CHAMBER_CHROME_TOKENS.pendingActionBorder,
            background: CHAMBER_CHROME_TOKENS.actionBg,
            color: palette.ink,
          }}
          type="button"
        >
          Retry stage
        </button>
      </div>
    </div>
  );
}
