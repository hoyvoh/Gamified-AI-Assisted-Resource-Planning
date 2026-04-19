import { ANALYSIS_CHAMBER_SHELL_PALETTE as palette } from "@/features/analysis-chamber/lib/analysis-chamber-shell.constants";

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
            borderColor: "rgba(200, 150, 30, 0.35)",
            background:
              "radial-gradient(circle, rgba(200,150,30,0.18) 0%, rgba(200,150,30,0.06) 55%, transparent 70%)",
          }}
        />
      </div>
    </div>
  );
}
