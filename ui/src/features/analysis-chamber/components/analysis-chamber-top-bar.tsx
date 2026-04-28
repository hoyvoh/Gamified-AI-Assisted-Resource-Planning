"use client";

import Link from "next/link";

import {
  ANALYSIS_CHAMBER_ROUTE_TITLE,
  ANALYSIS_CHAMBER_SHELL_PALETTE as palette,
} from "@/features/analysis-chamber/lib/analysis-chamber-shell.constants";
import type { AnalysisChamberRouteKey } from "@/features/analysis-chamber/lib/analysis-chamber-shell.types";
import type { ChamberBootstrap } from "@/features/analysis-chamber/api/analysis-chamber-api.view-models";
import { MEDIEVAL_THEME } from "@/lib/theme/medieval-theme";

export const AnalysisChamberTopBar = ({
  bootstrap,
  route,
  onRefresh,
}: {
  bootstrap: ChamberBootstrap;
  route: AnalysisChamberRouteKey;
  onRefresh?: () => void;
}) => (
  <header
    className="relative z-10 flex min-h-14 items-center gap-3 border-b px-3 py-2.5 md:px-5"
    style={{
      background: MEDIEVAL_THEME.gradients.topBar,
      borderColor: "rgba(141, 105, 52, 0.5)",
      color: palette.ink,
    }}
  >
    <div className="flex items-center gap-3">
      <Link
        href="/members"
        className="font-mono text-[10px] uppercase tracking-[0.12em] transition-opacity opacity-40 hover:opacity-80"
        style={{ color: palette.gold }}
        title="Back to members"
      >
        ← Members
      </Link>
      <div
        className="h-8 w-px"
        style={{ background: "rgba(209, 172, 103, 0.15)" }}
      />
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full border text-[11px] font-semibold tracking-[0.16em]"
        style={{
          borderColor: palette.gold,
          color: palette.gold,
          boxShadow: "0 0 18px rgba(209,172,103,0.16)",
        }}
      >
        AC
      </div>
      <div
        className="hidden h-8 w-px md:block"
        style={{ background: "rgba(209, 172, 103, 0.22)" }}
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
        style={{ color: "rgba(209,172,103,0.58)" }}
      >
        Chamber mode
      </p>
    </div>

    <div className="flex items-center gap-2">
      {onRefresh ? (
        <button
          className="rounded-md border px-2.5 py-1 text-sm font-display transition-all duration-150 hover:brightness-125 active:scale-95"
          onClick={onRefresh}
          style={{
            borderColor: "rgba(161, 119, 55, 0.35)",
            color: palette.gold,
            background: "rgba(209, 172, 103, 0.06)",
          }}
          title="Refresh data"
          type="button"
        >
          ↺
        </button>
      ) : null}

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
    </div>
  </header>
);
