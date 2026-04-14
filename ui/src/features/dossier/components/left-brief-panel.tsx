"use client";

import { CONTRAST, TYPO } from "@/features/dossier/constants/dossier.constants";
import type { DossierBriefViewModel } from "@/features/dossier/types/dossier.types";

interface LeftBriefPanelProps {
  brief: DossierBriefViewModel;
}

const BriefPills = ({
  items,
  tone,
}: {
  items: string[];
  tone: "growth" | "strength";
}) => (
  <div className="flex flex-wrap gap-1.5">
    {items.map((item) => (
      <span
        key={item}
        className="rounded-full border px-3 py-1.5"
        style={{
          fontSize: TYPO.briefPill.fontSize,
          lineHeight: TYPO.briefPill.lineHeight,
          borderColor:
            tone === "strength"
              ? `${CONTRAST.successBright}35`
              : `${CONTRAST.warningBright}40`,
          backgroundColor:
            tone === "strength"
              ? `${CONTRAST.successBright}12`
              : `${CONTRAST.warningBright}12`,
          color:
            tone === "strength" ? CONTRAST.textPrimary : CONTRAST.warningBright,
        }}
      >
        {item}
      </span>
    ))}
  </div>
);

export const LeftBriefPanel = ({ brief }: LeftBriefPanelProps) => {
  return (
    <>
      <section className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-4 backdrop-blur-xl xl:hidden">
        <div>
          <p
            style={{
              fontSize: TYPO.eyebrow.fontSize,
              lineHeight: TYPO.eyebrow.lineHeight,
              letterSpacing: TYPO.eyebrow.letterSpacing,
              color: CONTRAST.textTertiary,
            }}
          >
            Brief
          </p>
          <h2
            className="mt-2 font-display uppercase"
            style={{
              fontSize: TYPO.briefTitle.fontSize,
              lineHeight: TYPO.briefTitle.lineHeight,
              letterSpacing: TYPO.briefTitle.letterSpacing,
              color: CONTRAST.textPrimary,
            }}
          >
            {brief.currentGrowthPath}
          </h2>
          <p
            className="mt-1.5"
            style={{
              fontSize: TYPO.briefBody.fontSize,
              lineHeight: TYPO.briefBody.lineHeight,
              color: CONTRAST.textSecondary,
            }}
          >
            {brief.growthJourneySummary}
          </p>
        </div>

        <div className="mt-3 space-y-2.5">
          {brief.strengthDimensionLabels.length > 0 ? (
            <div>
              <p
                className="mb-1.5"
                style={{
                  fontSize: TYPO.badge.fontSize,
                  lineHeight: TYPO.badge.lineHeight,
                  letterSpacing: TYPO.badge.letterSpacing,
                  color: CONTRAST.textTertiary,
                }}
              >
                Strength Signals
              </p>
              <BriefPills
                items={brief.strengthDimensionLabels.slice(0, 2)}
                tone="strength"
              />
            </div>
          ) : null}

          {brief.growthDimensionLabels.length > 0 ? (
            <div>
              <p
                className="mb-1.5"
                style={{
                  fontSize: TYPO.badge.fontSize,
                  lineHeight: TYPO.badge.lineHeight,
                  letterSpacing: TYPO.badge.letterSpacing,
                  color: CONTRAST.textTertiary,
                }}
              >
                Growth Edge
              </p>
              <BriefPills
                items={brief.growthDimensionLabels.slice(0, 2)}
                tone="growth"
              />
            </div>
          ) : null}
        </div>
      </section>

      <aside className="hidden min-w-[168px] max-w-[198px] xl:block xl:w-[14%] xl:pt-10 xl:-mr-3">
        <div className="space-y-3">
          <div>
            <p
              style={{
                fontSize: TYPO.eyebrow.fontSize,
                lineHeight: TYPO.eyebrow.lineHeight,
                letterSpacing: TYPO.eyebrow.letterSpacing,
                color: CONTRAST.textTertiary,
              }}
            >
              Brief
            </p>
            <h2
              className="mt-2 font-display uppercase"
              style={{
                fontSize: TYPO.briefTitle.fontSize,
                lineHeight: TYPO.briefTitle.lineHeight,
                letterSpacing: TYPO.briefTitle.letterSpacing,
                color: CONTRAST.textPrimary,
              }}
            >
              {brief.currentGrowthPath}
            </h2>
            <p
              className="mt-1.5"
              style={{
                fontSize: TYPO.briefBody.fontSize,
                lineHeight: TYPO.briefBody.lineHeight,
                color: CONTRAST.textSecondary,
              }}
            >
              {brief.growthJourneySummary}
            </p>
          </div>

          <BriefPills
            items={brief.strengthDimensionLabels.slice(0, 3)}
            tone="strength"
          />
          <BriefPills
            items={brief.growthDimensionLabels.slice(0, 2)}
            tone="growth"
          />
        </div>
      </aside>
    </>
  );
};
