import {
  ANALYSIS_CHAMBER_ROUTE_TITLE,
  ANALYSIS_CHAMBER_SHELL_PALETTE as palette,
} from "@/features/analysis-chamber/lib/analysis-chamber-shell.constants";
import type { AnalysisChamberRouteKey } from "@/features/analysis-chamber/lib/analysis-chamber-shell.types";
import type { ChamberBootstrap } from "@/features/analysis-chamber/api/analysis-chamber-api.view-models";

export const AnalysisChamberTopBar = ({
  bootstrap,
  route,
}: {
  bootstrap: ChamberBootstrap;
  route: AnalysisChamberRouteKey;
}) => (
  <header
    className="relative z-10 flex min-h-14 items-center gap-3 border-b px-3 py-2.5 md:px-5"
    style={{
      background:
        "linear-gradient(90deg, rgba(255,149,0,0.08), rgba(27,15,10,0.98) 28%, rgba(21,9,10,0.98) 100%)",
      borderColor: "rgba(120, 80, 20, 0.5)",
      color: palette.ink,
    }}
  >
    <div className="flex items-center gap-3">
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full border text-[11px] font-semibold tracking-[0.16em]"
        style={{
          borderColor: palette.gold,
          color: palette.gold,
          boxShadow: "0 0 18px rgba(255,149,0,0.16)",
        }}
      >
        AC
      </div>
      <div
        className="hidden h-8 w-px md:block"
        style={{ background: "rgba(255,149,0,0.22)" }}
      />
    </div>

    <div className="min-w-0 flex-1">
      <p className="truncate font-display text-sm uppercase tracking-[0.18em]">
        {bootstrap.member.displayName}
      </p>
      <p
        className="truncate text-xs italic"
        style={{ color: palette.inkMuted }}
      >
        {bootstrap.roleName ?? "Role pending"} | {bootstrap.teamName}
      </p>
    </div>

    <div className="hidden text-right md:block">
      <p
        className="font-display text-[10px] uppercase tracking-[0.18em]"
        style={{ color: palette.gold }}
      >
        {ANALYSIS_CHAMBER_ROUTE_TITLE[route]}
      </p>
      <p
        className="mt-0.5 text-[9px] uppercase tracking-[0.16em]"
        style={{ color: "rgba(255,184,77,0.58)" }}
      >
        Chamber mode
      </p>
    </div>

    <div
      className="rounded-md border px-2.5 py-1 text-[10px] font-display uppercase tracking-[0.14em]"
      style={{
        borderColor: palette.vert,
        color: palette.vert,
        background: "rgba(42,106,58,0.08)",
      }}
    >
      {bootstrap.analysisStatus}
    </div>
  </header>
);
