"use client";

import Link from "next/link";

import {
  ANALYSIS_CHAMBER_ROUTE_TITLE,
  ANALYSIS_CHAMBER_SHELL_PALETTE as palette,
  CHAMBER_CHROME_TOKENS,
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
      borderColor: MEDIEVAL_THEME.premiumNoir.divider,
      color: palette.ink,
    }}
  >
    <div className="flex items-center gap-3">
      <Link
        href="/members"
        className="font-mono text-[10px] uppercase tracking-[0.12em] transition-opacity opacity-40 hover:opacity-80"
        style={{ color: MEDIEVAL_THEME.premiumNoir.chromeLabel }}
        title="Back to members"
      >
        ← Members
      </Link>
      <div
        className="h-8 w-px"
        style={{ background: MEDIEVAL_THEME.premiumNoir.divider }}
      />
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full border text-[11px] font-semibold tracking-[0.16em]"
        style={{
          borderColor: palette.gold,
          color: palette.gold,
          boxShadow: `0 0 18px ${CHAMBER_CHROME_TOKENS.goldGlowSoft}`,
        }}
      >
        AC
      </div>
      <div
        className="hidden h-8 w-px md:block"
        style={{ background: CHAMBER_CHROME_TOKENS.railActiveBorder }}
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
        style={{ color: MEDIEVAL_THEME.premiumNoir.chromeLabel }}
      >
        {ANALYSIS_CHAMBER_ROUTE_TITLE[route]}
      </p>
      <p
        className="mt-0.5 text-[9px] uppercase tracking-[0.16em]"
        style={{ color: CHAMBER_CHROME_TOKENS.railLabelIdle }}
      >
        Profile route
      </p>
    </div>

    <div className="flex items-center gap-2">
      {onRefresh ? (
        <button
          className="rounded-md border px-2.5 py-1 text-sm font-display transition-all duration-150 hover:brightness-125 active:scale-95"
          onClick={onRefresh}
          style={{
            borderColor: CHAMBER_CHROME_TOKENS.railActiveBorder,
            color: palette.gold,
            background: CHAMBER_CHROME_TOKENS.refreshBg,
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
          borderColor: CHAMBER_CHROME_TOKENS.statusReadyBorder,
          color: CHAMBER_CHROME_TOKENS.statusReadyText,
          background: CHAMBER_CHROME_TOKENS.statusReadyBg,
        }}
      >
        {bootstrap.analysisStatus}
      </div>
    </div>
  </header>
);
