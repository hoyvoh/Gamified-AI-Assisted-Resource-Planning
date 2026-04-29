import {
  ANALYSIS_CHAMBER_SHELL_PALETTE as palette,
  CHAMBER_CHROME_TOKENS,
} from "@/features/analysis-chamber/lib/analysis-chamber-shell.constants";

export default function ProfileMemberLoading() {
  return (
    <div className="flex h-full min-h-130 items-center justify-center px-6 text-center">
      <div>
        <p
          className="font-display text-sm uppercase tracking-[0.18em]"
          style={{ color: palette.ink }}
        >
          Loading chamber stage
        </p>
        <p className="mt-2 text-sm" style={{ color: palette.inkSoft }}>
          The profile route is preparing its current chamber view.
        </p>
        <div
          className="mx-auto mt-8 h-24 w-24 rounded-full border"
          style={{
            borderColor: CHAMBER_CHROME_TOKENS.loadingOrbBorder,
            background: CHAMBER_CHROME_TOKENS.loadingOrbBg,
          }}
        />
      </div>
    </div>
  );
}
