"use client";

import {
  CONTRAST,
  DOSSIER_COLORS,
  getMaturityMeta,
  TYPO,
} from "@/features/dossier/constants/dossier.constants";
import {
  formatPercentLabel,
  getDimensionDisplayName,
  getDisplayScore,
  hasDimensionOpportunity,
  isDimensionFlagged,
} from "@/features/dossier/lib/dossier-contract.helpers";
import type { DimensionScore } from "@/features/dossier/types/dossier.types";

interface CompetencyDeckProps {
  data: DimensionScore[];
  selectedDimensionId?: string | null;
  onSelectDimension?: (dimensionId: string) => void;
}

export const CompetencyDeck = ({
  data,
  selectedDimensionId,
  onSelectDimension,
}: CompetencyDeckProps) => {
  const sorted = [...data].sort(
    (left, right) =>
      (getDisplayScore(right.normalizedScore ?? right.rawScore) ?? 0) -
      (getDisplayScore(left.normalizedScore ?? left.rawScore) ?? 0),
  );
  const strongest = sorted[0];
  const growthEdge =
    [...sorted].reverse().find(hasDimensionOpportunity) ?? sorted.at(-1);
  const spotlightCards: Array<{
    label: string;
    value: string;
    detail: string;
    tone: string;
  }> = [];

  if (strongest) {
    spotlightCards.push({
      label: "Primary Edge",
      value: getDimensionDisplayName(strongest),
      detail: `${getDisplayScore(strongest.normalizedScore ?? strongest.rawScore) ?? "—"} signal / ${formatPercentLabel(strongest.confidenceScore)} confidence`,
      tone: CONTRAST.successGlow,
    });
  }

  if (growthEdge) {
    spotlightCards.push({
      label: "Growth Edge",
      value: getDimensionDisplayName(growthEdge),
      detail: `${getDisplayScore(growthEdge.normalizedScore ?? growthEdge.rawScore) ?? "—"} signal / ${formatPercentLabel(growthEdge.confidenceScore)} confidence`,
      tone: isDimensionFlagged(growthEdge)
        ? CONTRAST.warningGlow
        : CONTRAST.primaryGlow,
    });
  }

  return (
    <div className="space-y-3.5">
      <section
        className="rounded-[22px] border px-5 py-4 backdrop-blur-xl"
        style={{
          borderColor: DOSSIER_COLORS.panelBorder,
          background:
            "linear-gradient(160deg, rgba(9, 18, 28, 0.94), rgba(7, 13, 22, 0.88))",
        }}
      >
        <div className="grid gap-4 xl:grid-cols-[1.18fr_0.82fr]">
          <div>
            <p
              style={{
                fontSize: TYPO.eyebrow.fontSize,
                lineHeight: TYPO.eyebrow.lineHeight,
                letterSpacing: TYPO.eyebrow.letterSpacing,
                color: CONTRAST.textTertiary,
              }}
            >
              Attribute Modules
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
              {data.length} operative attributes
            </h2>
            <p
              className="mt-2 max-w-2xl"
              style={{
                fontSize: TYPO.bodySm.fontSize,
                lineHeight: TYPO.bodySm.lineHeight,
                color: CONTRAST.textSecondary,
              }}
            >
              Compact stat surfaces linked back to the hero.
            </p>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-1">
            {spotlightCards.map((item) => (
              <div
                key={item.label}
                className="rounded-[16px] border px-4 py-3"
                style={{
                  borderColor: `${item.tone}45`,
                  backgroundColor: "rgba(255,255,255,0.025)",
                }}
              >
                <p
                  style={{
                    fontSize: TYPO.badge.fontSize,
                    lineHeight: TYPO.badge.lineHeight,
                    letterSpacing: TYPO.badge.letterSpacing,
                    color: item.tone,
                  }}
                >
                  {item.label}
                </p>
                <p
                  className="mt-1.5 font-display uppercase"
                  style={{
                    fontSize: TYPO.cardTitle.fontSize,
                    lineHeight: TYPO.cardTitle.lineHeight,
                    letterSpacing: TYPO.cardTitle.letterSpacing,
                    color: CONTRAST.textPrimary,
                  }}
                >
                  {item.value}
                </p>
                <p
                  className="mt-1.5"
                  style={{
                    fontSize: TYPO.cardBody.fontSize,
                    lineHeight: TYPO.cardBody.lineHeight,
                    color: CONTRAST.textSecondary,
                  }}
                >
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        {sorted.map((dimension) => {
          const maturity = getMaturityMeta(dimension.maturityLevel);
          const isSelected = selectedDimensionId === dimension.dimensionId;
          const isFlagged = isDimensionFlagged(dimension);
          const hasOpportunity = hasDimensionOpportunity(dimension);
          const displayScore =
            getDisplayScore(dimension.normalizedScore ?? dimension.rawScore) ?? 0;

          return (
            <button
              key={dimension.dimensionId}
              className="rounded-[18px] border px-4 py-4 text-left backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1"
              style={{
                borderColor: isSelected
                  ? `${CONTRAST.primaryGlow}60`
                  : isFlagged
                    ? `${CONTRAST.warningGlow}55`
                    : DOSSIER_COLORS.panelBorder,
                background:
                  "linear-gradient(180deg, rgba(10, 20, 35, 0.88), rgba(7, 14, 23, 0.82))",
                boxShadow: isSelected
                  ? `0 0 0 1px ${CONTRAST.primaryGlow}25, 0 18px 40px rgba(0, 0, 0, 0.24)`
                  : isFlagged
                    ? `0 0 0 1px ${CONTRAST.warningGlow}25, 0 18px 40px rgba(0, 0, 0, 0.22)`
                    : "0 18px 40px rgba(0, 0, 0, 0.22)",
              }}
              onClick={() => onSelectDimension?.(dimension.dimensionId)}
              type="button"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-[70%]">
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className="font-display uppercase"
                      style={{
                        fontSize: TYPO.cardTitle.fontSize,
                        lineHeight: TYPO.cardTitle.lineHeight,
                        letterSpacing: TYPO.cardTitle.letterSpacing,
                        color: CONTRAST.textPrimary,
                      }}
                    >
                      {getDimensionDisplayName(dimension)}
                    </p>
                    <span
                      className="rounded-full border px-2.5 py-0.5 uppercase"
                      style={{
                        fontSize: TYPO.badge.fontSize,
                        lineHeight: TYPO.badge.lineHeight,
                        letterSpacing: TYPO.badge.letterSpacing,
                        color: maturity.color,
                        borderColor: `${maturity.color}50`,
                        backgroundColor: `${maturity.color}15`,
                      }}
                    >
                      {maturity.label}
                    </span>
                    {isFlagged && (
                      <span
                        className="rounded-full border px-2.5 py-0.5 uppercase"
                        style={{
                          fontSize: TYPO.badge.fontSize,
                          lineHeight: TYPO.badge.lineHeight,
                          letterSpacing: TYPO.badge.letterSpacing,
                          color: CONTRAST.warningGlow,
                          borderColor: `${CONTRAST.warningGlow}50`,
                          backgroundColor: `${CONTRAST.warningGlow}15`,
                        }}
                      >
                        Flagged
                      </span>
                    )}
                  </div>
                  <p
                    className="mt-1.5"
                    style={{
                      fontSize: TYPO.badge.fontSize,
                      lineHeight: TYPO.badge.lineHeight,
                      letterSpacing: TYPO.badge.letterSpacing,
                      color: CONTRAST.textTertiary,
                    }}
                  >
                    {dimension.confidenceLabel}
                  </p>
                </div>

                <div className="text-right">
                  <p
                    className="font-semibold tabular-nums"
                    style={{
                      fontSize: TYPO.valueLg.fontSize,
                      lineHeight: TYPO.valueLg.lineHeight,
                      letterSpacing: TYPO.valueLg.letterSpacing,
                      color: maturity.color,
                    }}
                  >
                    {displayScore}
                  </p>
                  <p
                    className="mt-1"
                    style={{
                      fontSize: TYPO.badge.fontSize,
                      lineHeight: TYPO.badge.lineHeight,
                      letterSpacing: TYPO.badge.letterSpacing,
                      color: CONTRAST.textTertiary,
                    }}
                  >
                    {formatPercentLabel(dimension.confidenceScore)} confidence
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {hasOpportunity && (
                    <span
                      className="rounded-full border px-2.5 py-0.5 uppercase"
                      style={{
                        fontSize: TYPO.badge.fontSize,
                        lineHeight: TYPO.badge.lineHeight,
                        letterSpacing: TYPO.badge.letterSpacing,
                        color: CONTRAST.primaryGlow,
                        borderColor: `${CONTRAST.primaryGlow}40`,
                        backgroundColor: `${CONTRAST.primaryGlow}15`,
                      }}
                    >
                      {dimension.opportunityLabel}
                    </span>
                  )}
                  <span
                    className="rounded-full border px-2.5 py-0.5 uppercase"
                    style={{
                      fontSize: TYPO.badge.fontSize,
                      lineHeight: TYPO.badge.lineHeight,
                      letterSpacing: TYPO.badge.letterSpacing,
                      color: CONTRAST.textSecondary,
                      borderColor: "rgba(255,255,255,0.1)",
                      backgroundColor: "rgba(255,255,255,0.04)",
                    }}
                  >
                    {isSelected ? "Focused signal" : "Select to focus"}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${displayScore}%`,
                      background: `linear-gradient(90deg, ${maturity.color}70, ${maturity.color})`,
                      boxShadow: `0 0 20px ${maturity.color}40`,
                    }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </section>
    </div>
  );
};
