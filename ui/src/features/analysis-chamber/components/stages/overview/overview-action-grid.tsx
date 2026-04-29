"use client";

import Link from "next/link";
import { ArrowRight, Map, ScrollText } from "lucide-react";

import { buildAnalysisChamberRouteHref } from "@/features/analysis-chamber/lib/analysis-chamber-route-links";
import {
  ANALYSIS_CHAMBER_SHELL_PALETTE as palette,
  OVERVIEW_TOKENS,
} from "@/features/analysis-chamber/lib/analysis-chamber-shell.constants";

interface OverviewActionGridProps {
  categoryTarget: string | null;
  memberId: string;
}

interface OverviewActionCardConfig {
  href: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  title: string;
  variant: "primary" | "secondary";
}

const buildActionCards = (
  memberId: string,
  categoryTarget: string | null,
): OverviewActionCardConfig[] => [
  {
    href: buildAnalysisChamberRouteHref(memberId, "competency", {
      category: categoryTarget,
    }),
    icon: ArrowRight,
    title: "Enter Competency Chamber",
    variant: "primary",
  },
  {
    href: buildAnalysisChamberRouteHref(memberId, "journey"),
    icon: Map,
    title: "Journey Map",
    variant: "secondary",
  },
  {
    href: buildAnalysisChamberRouteHref(memberId, "kpt"),
    icon: ScrollText,
    title: "Council Notes",
    variant: "secondary",
  },
];

export const OverviewActionGrid = ({
  categoryTarget,
  memberId,
}: OverviewActionGridProps) => {
  const cards = buildActionCards(memberId, categoryTarget);
  const primaryAction = cards.find((card) => card.variant === "primary");
  const secondaryActions = cards.filter((card) => card.variant === "secondary");

  if (!primaryAction) {
    return null;
  }

  const PrimaryIcon = primaryAction.icon;

  return (
    <section className="mt-8 flex flex-wrap items-center gap-4">
      <Link
        className="group inline-flex min-h-20 w-full max-w-[390px] items-center justify-between gap-5 rounded-[18px] border px-5 py-4 transition-all duration-200 hover:-translate-y-0.5 md:px-6"
        href={primaryAction.href}
        style={{
          color: palette.ink,
          borderColor: OVERVIEW_TOKENS.primaryCardBorder,
          background: OVERVIEW_TOKENS.primaryCardSurface,
          boxShadow: OVERVIEW_TOKENS.primaryCardShadow,
        }}
      >
        <span>
          <span
            className="font-display text-[10px] uppercase tracking-[0.18em]"
            style={{ color: palette.goldLight }}
          >
            Primary chamber entry
          </span>
          <span
            className="mt-1.5 block font-display text-sm uppercase tracking-[0.12em] transition-colors duration-200 md:text-base"
            style={{ ["--overview-action-hover" as string]: OVERVIEW_TOKENS.actionHoverText }}
          >
            {primaryAction.title}
          </span>
        </span>
        <PrimaryIcon
          aria-hidden="true"
          className="shrink-0 transition-transform duration-200 group-hover:translate-x-1"
          size={22}
        />
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        {secondaryActions.map((card) => {
          const SecondaryIcon = card.icon;

          return (
            <Link
              key={card.title}
              className="group inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2.5 font-display text-[10px] uppercase tracking-[0.16em] transition-all duration-200 hover:-translate-y-0.5"
              href={card.href}
              style={{
                color: palette.inkSoft,
                borderColor: OVERVIEW_TOKENS.secondaryCardBorder,
                background: OVERVIEW_TOKENS.secondaryCardSurface,
                boxShadow: OVERVIEW_TOKENS.secondaryCardShadow,
              }}
            >
              <SecondaryIcon aria-hidden="true" size={14} />
              <span className="transition-colors duration-200">
                {card.title}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
