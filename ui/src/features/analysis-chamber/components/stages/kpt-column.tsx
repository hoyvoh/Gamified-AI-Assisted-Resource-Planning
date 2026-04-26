"use client";

import type { ChamberKptItem } from "@/features/analysis-chamber/api/analysis-chamber-api.view-models";
import { KptCard } from "@/features/analysis-chamber/components/stages/kpt-card";
import type { KptColumnKey } from "@/features/analysis-chamber/components/stages/kpt-card";
import { KPT_TOKENS } from "@/features/analysis-chamber/lib/analysis-chamber-shell.constants";

type KptColorTokens =
  | (typeof KPT_TOKENS)["keep"]
  | (typeof KPT_TOKENS)["problem"]
  | (typeof KPT_TOKENS)["try"];

interface ColumnMeta {
  sigil: string;
  intent: string;
  emptyPrompt: string;
}

const COLUMN_META: Record<KptColumnKey, ColumnMeta> = {
  Keep: {
    sigil: "✦",
    intent: "Mastery to preserve",
    emptyPrompt: "No observed strengths have been recorded for this period.",
  },
  Problem: {
    sigil: "⚠",
    intent: "Friction to resolve",
    emptyPrompt: "No friction patterns were identified in this period.",
  },
  Try: {
    sigil: "→",
    intent: "Direction to pursue",
    emptyPrompt: "No next moves have been charted yet.",
  },
};

interface KptColumnProps {
  columnKey: KptColumnKey;
  items: ChamberKptItem[];
  tokens: KptColorTokens;
  memberId: string;
}

export const KptColumn = ({
  columnKey,
  items,
  tokens,
  memberId,
}: KptColumnProps) => {
  const meta = COLUMN_META[columnKey];
  const limitedItems = items.slice(0, 5);
  const isTry = columnKey === "Try";

  return (
    <article
      className="kpt-column relative flex flex-col overflow-hidden rounded-[18px]"
      style={
        {
          background: KPT_TOKENS.bgColumn,
          border: `1px solid ${KPT_TOKENS.borderStrong}`,
          boxShadow:
            "inset 0 1px 0 rgba(255,232,192,0.04), 0 18px 40px rgba(0,0,0,0.22)",
        } as React.CSSProperties
      }
    >
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[4px]"
        style={{
          background: `linear-gradient(90deg, ${tokens.main} 0%, ${tokens.main}CC 65%, ${tokens.main}99 100%)`,
        }}
      />

      {/* Column header */}
      <div
        className="flex items-center gap-3 border-b px-5 py-4"
        style={{ borderColor: KPT_TOKENS.borderSubtle }}
      >
        {/* Sigil badge */}
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm"
          style={{
            borderColor: `${KPT_TOKENS.borderStrong}`,
            background: KPT_TOKENS.surfaceChip,
            color: tokens.main + "DD",
          }}
        >
          {meta.sigil}
        </span>

        <div className="min-w-0 flex-1">
          <p
            className="font-display text-sm uppercase tracking-[0.14em]"
            style={{ color: KPT_TOKENS.textPrimary }}
          >
            {columnKey}
            {isTry ? (
              <span
                className="ml-2 rounded-sm px-1.5 py-0.5 text-[8px] uppercase tracking-widest"
                style={{
                  background: KPT_TOKENS.surfaceChip,
                  color: tokens.main + "DD",
                  border: `1px solid ${KPT_TOKENS.borderSubtle}`,
                }}
              >
                Action
              </span>
            ) : null}
          </p>
          <p
            className="mt-0.5 text-[10px] leading-none tracking-wide"
            style={{ color: KPT_TOKENS.textMuted }}
          >
            {meta.intent}
          </p>
        </div>

        {limitedItems.length > 0 ? (
          <div className="flex shrink-0 flex-col items-end gap-0.5">
            <span
              className="rounded-full border px-2 py-0.5 font-display text-[10px]"
              style={{
                borderColor: KPT_TOKENS.borderSubtle,
                color: KPT_TOKENS.textSecondary,
                background: KPT_TOKENS.surfaceInset,
              }}
            >
              {limitedItems.length}
            </span>
            <span
              className="text-[8px] uppercase tracking-widest"
              style={{ color: KPT_TOKENS.textMuted }}
            >
              1 top
            </span>
          </div>
        ) : null}
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3 px-4 py-4">
        {limitedItems.length > 0 ? (
          limitedItems.map((item, index) => (
            <KptCard
              key={item.id}
              columnKey={columnKey}
              index={index}
              item={item}
              memberId={memberId}
              tokens={tokens}
            />
          ))
        ) : (
          <div
            className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl border px-4 py-6 text-center"
            style={{
              borderColor: KPT_TOKENS.borderSubtle,
              background: KPT_TOKENS.surfaceInset,
              borderStyle: "dashed",
            }}
          >
            <span className="text-xl" style={{ color: tokens.main + "60" }}>
              {meta.sigil}
            </span>
            <p
              className="text-xs leading-5"
              style={{ color: KPT_TOKENS.textMuted }}
            >
              {meta.emptyPrompt}
            </p>
          </div>
        )}
      </div>
    </article>
  );
};
