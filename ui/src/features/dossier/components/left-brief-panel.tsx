"use client";

import { CONTRAST, TYPO } from "@/features/dossier/constants/dossier.constants";
import type { DossierBriefViewModel } from "@/features/dossier/types/dossier.types";

interface LeftBriefPanelProps {
  brief: DossierBriefViewModel;
}

export const LeftBriefPanel = ({ brief }: LeftBriefPanelProps) => {
  return (
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

        <div className="flex flex-wrap gap-1.5">
          {brief.strengthDimensionLabels.slice(0, 3).map((item) => (
            <span
              key={item}
              className="rounded-full border px-3 py-1.5"
              style={{
                fontSize: TYPO.briefPill.fontSize,
                lineHeight: TYPO.briefPill.lineHeight,
                borderColor: `${CONTRAST.successBright}35`,
                backgroundColor: `${CONTRAST.successBright}12`,
                color: CONTRAST.textPrimary,
              }}
            >
              {item}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {brief.growthDimensionLabels.slice(0, 2).map((item) => (
            <span
              key={item}
              className="rounded-full border px-3 py-1.5"
              style={{
                fontSize: TYPO.briefPill.fontSize,
                lineHeight: TYPO.briefPill.lineHeight,
                borderColor: `${CONTRAST.warningBright}40`,
                backgroundColor: `${CONTRAST.warningBright}12`,
                color: "#f0dcc0",
              }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
};
