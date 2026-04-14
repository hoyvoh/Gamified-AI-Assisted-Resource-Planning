"use client";

import {
  CONTRAST,
  DOSSIER_COLORS,
  TYPO,
} from "@/features/dossier/constants/dossier.constants";
import { getKptGroups } from "@/features/dossier/lib/dossier-contract.helpers";
import type { ProfileKptResponse } from "@/features/dossier/types/dossier.types";

interface KptDeckProps {
  data: ProfileKptResponse;
}

const KPT_META = {
  keep: {
    label: "Keep",
    color: CONTRAST.successGlow,
    background: "rgba(8, 24, 18, 0.74)",
  },
  problem: {
    label: "Problem",
    color: CONTRAST.warningGlow,
    background: "rgba(20, 14, 8, 0.74)",
  },
  try: {
    label: "Try",
    color: CONTRAST.primaryGlow,
    background: "rgba(8, 14, 22, 0.74)",
  },
} as const;

export const KptDeck = ({ data }: KptDeckProps) => {
  const grouped = getKptGroups(data);

  return (
    <div className="space-y-3.5">
      <section
        className="rounded-[28px] border px-5 py-4 backdrop-blur-xl"
        style={{
          borderColor: DOSSIER_COLORS.panelBorder,
          background:
            "linear-gradient(160deg, rgba(9, 18, 28, 0.94), rgba(7, 13, 22, 0.88))",
        }}
      >
        <p
          style={{
            fontSize: TYPO.eyebrow.fontSize,
            lineHeight: TYPO.eyebrow.lineHeight,
            letterSpacing: TYPO.eyebrow.letterSpacing,
            color: CONTRAST.textTertiary,
          }}
        >
          Coaching Deck
        </p>
        <h2
          className="mt-2 font-display uppercase md:text-lg"
          style={{
            fontSize: TYPO.sectionTitle.fontSize,
            lineHeight: TYPO.sectionTitle.lineHeight,
            letterSpacing: TYPO.sectionTitle.letterSpacing,
            color: CONTRAST.signalBright,
          }}
        >
          Keep, pressure, and next experiments in one surface
        </h2>
      </section>

      <section className="grid gap-3 xl:grid-cols-3">
        {(["keep", "problem", "try"] as const).map((type) => {
          const meta = KPT_META[type];

          return (
            <article
              key={type}
              className="rounded-[24px] border px-4 py-4 backdrop-blur-xl"
              style={{
                borderColor: `${meta.color}45`,
                background: `linear-gradient(180deg, ${meta.background}, rgba(7, 13, 22, 0.84))`,
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <p
                  style={{
                    fontSize: TYPO.badge.fontSize,
                    lineHeight: TYPO.badge.lineHeight,
                    letterSpacing: TYPO.badge.letterSpacing,
                    color: meta.color,
                  }}
                >
                  {meta.label}
                </p>
                <span
                  className="font-semibold tabular-nums"
                  style={{
                    fontSize: TYPO.valueMd.fontSize,
                    lineHeight: TYPO.valueMd.lineHeight,
                    color: meta.color,
                  }}
                >
                  {grouped[type].length}
                </span>
              </div>
              <div className="mt-3.5 space-y-2.5">
                {grouped[type].length > 0 ? (
                  grouped[type].map((item) => (
                    <div
                      key={item.kptId}
                      className="rounded-[18px] border px-4 py-3.5"
                      style={{
                        borderColor: "rgba(255,255,255,0.07)",
                        backgroundColor: "rgba(255,255,255,0.03)",
                      }}
                    >
                      <p
                        style={{
                          fontSize: TYPO.cardBody.fontSize,
                          lineHeight: TYPO.cardBody.lineHeight,
                          color: CONTRAST.textPrimary,
                        }}
                      >
                        {item.title}
                      </p>
                      {item.summary ? (
                        <p
                          className="mt-2"
                          style={{
                            fontSize: TYPO.bodySm.fontSize,
                            lineHeight: TYPO.bodySm.lineHeight,
                            color: CONTRAST.textSecondary,
                          }}
                        >
                          {item.summary}
                        </p>
                      ) : null}
                      {item.linkedDimensionIds.length > 0 && (
                        <p
                          className="mt-2.5"
                          style={{
                            fontSize: TYPO.badge.fontSize,
                            lineHeight: TYPO.badge.lineHeight,
                            letterSpacing: TYPO.badge.letterSpacing,
                            color: CONTRAST.textTertiary,
                          }}
                        >
                          Linked dimension surface
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div
                    className="rounded-[18px] border px-4 py-3.5"
                    style={{
                      borderColor: "rgba(255,255,255,0.07)",
                      backgroundColor: "rgba(255,255,255,0.03)",
                    }}
                  >
                    <p
                      style={{
                        fontSize: TYPO.bodySm.fontSize,
                        lineHeight: TYPO.bodySm.lineHeight,
                        color: CONTRAST.textSecondary,
                      }}
                    >
                      No {meta.label.toLowerCase()} items are available for this scan yet.
                    </p>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
};
