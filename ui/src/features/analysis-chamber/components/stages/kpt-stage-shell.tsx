"use client";

import Link from "next/link";

import type { ChamberKptItem } from "@/features/analysis-chamber/api/analysis-chamber-api.view-models";
import { useAnalysisChamberKptData } from "@/features/analysis-chamber/hooks/use-analysis-chamber-shell-data";
import { ANALYSIS_CHAMBER_SHELL_PALETTE as palette } from "@/features/analysis-chamber/lib/analysis-chamber-shell.constants";
import { buildAnalysisChamberRouteHref } from "@/features/analysis-chamber/lib/analysis-chamber-route-links";

/** Per-column identity: rhythm, sigil, intent label, empty prompt */
const COLUMN_META = {
  Keep: {
    sigil: "✦",
    intent: "Mastery to preserve",
    emptyPrompt: "No observed strengths have been recorded for this period.",
    bgFrom: "rgba(255,255,255,0.05)",
    bgTo: "rgba(255,255,255,0.02)",
  },
  Problem: {
    sigil: "⚡",
    intent: "Friction to resolve",
    emptyPrompt: "No friction patterns were identified in this period.",
    bgFrom: "rgba(255,255,255,0.06)",
    bgTo: "rgba(255,255,255,0.02)",
  },
  Try: {
    sigil: "→",
    intent: "Direction to pursue",
    emptyPrompt: "No next moves have been charted yet.",
    bgFrom: "rgba(255,255,255,0.05)",
    bgTo: "rgba(255,255,255,0.02)",
  },
} as const;

type ColumnKey = keyof typeof COLUMN_META;

export const KptStageShell = ({ memberId }: { memberId: string }) => {
  const kpt = useAnalysisChamberKptData(memberId);

  const columns: Array<{
    key: ColumnKey;
    items: ChamberKptItem[];
    tone: string;
  }> = [
    { key: "Keep", items: kpt.data?.keepItems ?? [], tone: palette.vert },
    {
      key: "Problem",
      items: kpt.data?.problemItems ?? [],
      tone: palette.crimson,
    },
    { key: "Try", items: kpt.data?.tryItems ?? [], tone: palette.azure },
  ];

  return (
    <section className="dossier-scroll h-full px-4 pb-6 pt-4 md:px-5">
      {/* Three scrolls */}
      <div className="grid h-full gap-4 xl:grid-cols-3">
        {columns.map(({ key, items, tone }) => {
          const meta = COLUMN_META[key];
          const limitedItems = items.slice(0, 5);

          return (
            <article
              key={key}
              className="flex flex-col rounded-[18px] border"
              style={{
                background: `linear-gradient(180deg, ${meta.bgFrom}, ${meta.bgTo})`,
                borderColor: `${tone}44`,
                borderLeftWidth: "3px",
                borderLeftColor: tone,
              }}
            >
              {/* Scroll header */}
              <div
                className="flex items-center gap-3 border-b px-5 py-4"
                style={{ borderColor: `${tone}25` }}
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm"
                  style={{
                    borderColor: `${tone}55`,
                    background: `${tone}14`,
                    color: tone,
                  }}
                >
                  {meta.sigil}
                </span>
                <div className="min-w-0">
                  <p
                    className="font-display text-sm uppercase tracking-[0.14em]"
                    style={{ color: tone }}
                  >
                    {key}
                  </p>
                </div>
                {limitedItems.length > 0 ? (
                  <span
                    className="ml-auto shrink-0 rounded-full border px-2 py-0.5 font-display text-[10px]"
                    style={{
                      borderColor: `${tone}44`,
                      color: tone,
                    }}
                  >
                    {limitedItems.length}
                  </span>
                ) : null}
              </div>

              {/* Scroll entries */}
              <div className="flex flex-col gap-3 px-4 py-4">
                {limitedItems.length > 0 ? (
                  limitedItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="rounded-md border px-4 py-4"
                      style={{
                        borderColor: `${tone}28`,
                        borderLeftWidth: "2px",
                        borderLeftColor: `${tone}60`,
                        background: "rgba(255,255,255,0.04)",
                      }}
                    >
                      {/* Entry number */}
                      <p
                        className="mb-2 font-display text-[9px] uppercase tracking-widest"
                        style={{ color: `${tone}80` }}
                      >
                        {key} {String(index + 1).padStart(2, "0")}
                      </p>
                      <p
                        className="font-display text-xs uppercase tracking-[0.08em] leading-5"
                        style={{ color: palette.ink }}
                      >
                        {item.title}
                      </p>
                      {item.summary ? (
                        <p
                          className="mt-2 text-sm leading-6"
                          style={{ color: palette.inkSoft }}
                        >
                          {item.summary}
                        </p>
                      ) : null}
                      {/* Linked problem badges (Try items) */}
                      {key === "Try" && item.linkedProblemIds.length > 0 ? (
                        <p
                          className="mt-3 text-[10px] uppercase tracking-widest"
                          style={{ color: palette.crimson }}
                        >
                          Addresses {item.linkedProblemIds.length}{" "}
                          {item.linkedProblemIds.length === 1
                            ? "problem"
                            : "problems"}
                        </p>
                      ) : null}
                      {/* Competency link */}
                      {item.linkedDimensionIds[0] ? (
                        <Link
                          className="mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-display text-[10px] uppercase tracking-[0.12em] transition-opacity hover:opacity-80"
                          href={buildAnalysisChamberRouteHref(
                            memberId,
                            "competency",
                            {
                              dimension: item.linkedDimensionIds[0],
                              highlight: item.linkedDimensionIds[0],
                            },
                          )}
                          style={{
                            borderColor: `${tone}55`,
                            color: tone,
                          }}
                        >
                          <span>⚔</span>
                          <span>Open in competency</span>
                        </Link>
                      ) : null}
                    </div>
                  ))
                ) : (
                  /* Per-column empty state */
                  <div
                    className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-md border px-4 py-6 text-center"
                    style={{
                      borderColor: `${tone}20`,
                      background: "rgba(255,255,255,0.02)",
                      borderStyle: "dashed",
                    }}
                  >
                    <span className="text-xl" style={{ color: `${tone}40` }}>
                      {meta.sigil}
                    </span>
                    <p
                      className="text-xs leading-5"
                      style={{ color: "rgba(138,112,88,0.5)" }}
                    >
                      {meta.emptyPrompt}
                    </p>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
