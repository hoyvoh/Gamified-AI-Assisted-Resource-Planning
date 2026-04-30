"use client";

import {
  ANALYSIS_CHAMBER_SHELL_PALETTE as palette,
  CHAMBER_CHROME_TOKENS,
} from "@/features/analysis-chamber/lib/analysis-chamber-shell.constants";
import { OverviewDimensionChips } from "@/features/analysis-chamber/components/stages/overview/overview-dimension-chips";

interface OverviewHeadlinePanelProps {
  archetypeBadge: string | null;
  categoryLabel: string;
  growthDimensionIds: string[];
  headline: string;
  strengthDimensionIds: string[];
  summaryText: string;
}

export const OverviewHeadlinePanel = ({
  archetypeBadge,
  categoryLabel,
  growthDimensionIds,
  headline,
  strengthDimensionIds,
  summaryText,
}: OverviewHeadlinePanelProps) => (
  <section>
    <div className="flex flex-wrap items-center gap-2">
      {archetypeBadge ? (
        <div
          className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 md:px-4 md:py-2"
          style={{
            borderColor: CHAMBER_CHROME_TOKENS.actionBorder,
            background: CHAMBER_CHROME_TOKENS.actionBg,
            color: palette.gold,
            boxShadow: `0 0 12px ${CHAMBER_CHROME_TOKENS.goldGlowSoft}`,
          }}
        >
          <span className="text-[11px]">◆</span>
          <span className="font-display text-[10px] uppercase tracking-[0.18em]">
            {archetypeBadge}
          </span>
        </div>
      ) : null}
      <span
        className="rounded-full border px-3 py-1.5 font-display text-[10px] uppercase tracking-[0.16em] md:px-4 md:py-2"
        style={{
          borderColor: CHAMBER_CHROME_TOKENS.sidePanelInnerBorder,
          background: CHAMBER_CHROME_TOKENS.signalCardBg,
          color: palette.silver,
        }}
      >
        {categoryLabel}
      </span>
    </div>

    <div className="mt-6 max-w-4xl xl:mt-7">
      <h1
        className="font-display text-[1.85rem] uppercase leading-[1.1] tracking-normal md:text-[2.35rem] xl:text-[2.65rem]"
        style={{ color: palette.ink }}
      >
        {headline}
      </h1>
      <p
        className="font-body-serif mt-4 max-w-3xl text-base leading-7 md:text-lg"
        style={{ color: palette.inkMuted }}
      >
        {summaryText}
      </p>
    </div>

    <OverviewDimensionChips
      growthDimensionIds={growthDimensionIds}
      strengthDimensionIds={strengthDimensionIds}
    />
  </section>
);
