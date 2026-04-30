"use client";

import Link from "next/link";

import type { ChamberKptItem } from "@/features/analysis-chamber/api/analysis-chamber-api.view-models";
import {
  DIMENSION_TO_CATEGORY,
  KPT_TOKENS,
} from "@/features/analysis-chamber/lib/analysis-chamber-shell.constants";
import { buildAnalysisChamberRouteHref } from "@/features/analysis-chamber/lib/analysis-chamber-route-links";

export type KptColumnKey = "Keep" | "Problem" | "Try";

type KptColorTokens =
  | (typeof KPT_TOKENS)["keep"]
  | (typeof KPT_TOKENS)["problem"]
  | (typeof KPT_TOKENS)["try"];

interface KptCardProps {
  item: ChamberKptItem;
  columnKey: KptColumnKey;
  index: number;
  tokens: KptColorTokens;
  memberId: string;
}

const CTA_LABEL: Record<KptColumnKey, string> = {
  Keep: "View Detail",
  Problem: "Investigate",
  Try: "Execute",
};

const CTA_ICON: Record<KptColumnKey, string> = {
  Keep: "⚔",
  Problem: "⚠",
  Try: "→",
};

export const KptCard = ({
  item,
  columnKey,
  index,
  tokens,
  memberId,
}: KptCardProps) => {
  const isPrimary = index === 0;
  const entryLabel = `${columnKey} ${String(index + 1).padStart(2, "0")}`;

  return (
    <div
      className={`kpt-card group relative overflow-hidden rounded-xl px-4 pb-5 pt-4 transition-all duration-200${
        isPrimary ? " kpt-card--top" : ""
      }`}
      style={
        {
          background: KPT_TOKENS.bgCard,
          border: `1px solid ${isPrimary ? KPT_TOKENS.borderStrong : KPT_TOKENS.borderSubtle}`,
          boxShadow: KPT_TOKENS.cardInset,
          "--card-glow": KPT_TOKENS.cardGlow,
          animationDelay: `${index * 60}ms`,
        } as React.CSSProperties
      }
    >
      {/* Colored bottom accent bar — matches reference style */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[3px] rounded-b-xl"
        style={{ background: tokens.main, opacity: isPrimary ? 0.9 : 0.4 }}
      />

      {/* Entry label row */}
      <div className="mb-2 flex items-center gap-2">
        <p
          className="font-display text-[9px] uppercase tracking-widest"
          style={{ color: KPT_TOKENS.textLabel }}
        >
          {entryLabel}
        </p>
        {isPrimary ? (
          <span
            className="rounded-sm px-1.5 py-0.5 font-display text-[8px] uppercase tracking-widest"
            style={{
              background: `${KPT_TOKENS.accentTop}18`,
              color: KPT_TOKENS.accentTop,
              border: `1px solid ${KPT_TOKENS.borderSubtle}`,
            }}
          >
            ⭐ Top
          </span>
        ) : null}
      </div>

      {/* Title — bold white, like reference */}
      <p
        className="text-sm font-bold leading-snug"
        style={{ color: KPT_TOKENS.textPrimary }}
      >
        {toSentenceCase(item.title)}
      </p>

      {/* Summary — warm muted support text */}
      {item.summary ? (
        <p
          className="mt-2 text-xs leading-[1.6]"
          style={{ color: KPT_TOKENS.textSecondary }}
        >
          {item.summary}
        </p>
      ) : null}

      {/* Footer row */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {/* Try → Problem link badge */}
        {columnKey === "Try" && item.linkedProblemIds.length > 0 ? (
          <span
            className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-display text-[10px] uppercase tracking-widest"
            style={{
              borderColor: KPT_TOKENS.borderSubtle,
              background: KPT_TOKENS.surfaceChip,
              color: KPT_TOKENS.problem.main,
            }}
          >
            <span>⚡</span>
            <span>
              Fix for {item.linkedProblemIds.length}{" "}
              {item.linkedProblemIds.length === 1 ? "problem" : "problems"}
            </span>
          </span>
        ) : null}

        {/* Contextual CTA */}
        {item.linkedDimensionIds[0] ? (
          <Link
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-display text-[10px] uppercase tracking-[0.1em] transition-all duration-150 hover:opacity-90"
            href={buildAnalysisChamberRouteHref(memberId, "competency", {
              category: DIMENSION_TO_CATEGORY[item.linkedDimensionIds[0]] ?? null,
              dimension: item.linkedDimensionIds[0],
              highlight: item.linkedDimensionIds[0],
            })}
            style={{
              borderColor: KPT_TOKENS.borderSubtle,
              background: KPT_TOKENS.surfaceChip,
              color: KPT_TOKENS.textPrimary,
            }}
          >
            <span>{CTA_ICON[columnKey]}</span>
            <span>{CTA_LABEL[columnKey]}</span>
          </Link>
        ) : null}
      </div>

      <style>{`
        .kpt-card {
          animation: kptCardIn 0.3s ease both;
        }
        .kpt-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--card-glow);
          background: ${KPT_TOKENS.bgCardHover} !important;
        }
        .kpt-card--top {
          animation: kptCardIn 0.3s ease both;
        }
        .kpt-card--top:hover {
          transform: translateY(-3px);
          box-shadow: var(--card-glow);
          background: ${KPT_TOKENS.bgCardHover} !important;
        }
        @keyframes kptCardIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .kpt-card, .kpt-card--top { animation: none; transition: none; }
          .kpt-card:hover, .kpt-card--top:hover { transform: none; }
        }
      `}</style>
    </div>
  );
};

function toSentenceCase(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
