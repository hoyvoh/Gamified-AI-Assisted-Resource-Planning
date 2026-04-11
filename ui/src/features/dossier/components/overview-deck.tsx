"use client";

import { CONTRAST, TYPO } from "@/features/dossier/constants/dossier.constants";
import {
  getDimensionLabel,
  getOverviewSignalGroups,
} from "@/features/dossier/lib/dossier-contract.helpers";
import type { ProfileOverviewResponse } from "@/features/dossier/types/dossier.types";

interface OverviewDeckProps {
  data: ProfileOverviewResponse;
}

export const OverviewDeck = ({ data }: OverviewDeckProps) => {
  const signalGroups = getOverviewSignalGroups(data.categoryScores).map(
    (signal) => ({
      ...signal,
      tone:
        signal.value !== null && signal.value >= 80
          ? CONTRAST.successGlow
          : signal.value !== null && signal.value >= 65
            ? CONTRAST.warningGlow
            : CONTRAST.primaryGlow,
    }),
  );
  const strengthLabels = data.topStrengthDimensionIds
    .slice(0, 3)
    .map(getDimensionLabel);
  const growthLabels = data.topGrowthDimensionIds
    .slice(0, 2)
    .map(getDimensionLabel);

  return (
    <div className="space-y-3.5">
      <div>
        <p
          style={{
            fontSize: TYPO.eyebrow.fontSize,
            lineHeight: TYPO.eyebrow.lineHeight,
            letterSpacing: TYPO.eyebrow.letterSpacing,
            color: CONTRAST.textTertiary,
          }}
        >
          Active Growth Vector
        </p>
        <h3
          className="mt-2 font-display uppercase md:text-lg"
          style={{
            fontSize: TYPO.sectionTitle.fontSize,
            lineHeight: TYPO.sectionTitle.lineHeight,
            letterSpacing: TYPO.sectionTitle.letterSpacing,
            color: CONTRAST.confidence,
          }}
        >
          {data.currentGrowthPath ?? "Growth path unavailable"}
        </h3>
        <p
          className="mt-1.5"
          style={{
            fontSize: TYPO.body.fontSize,
            lineHeight: TYPO.body.lineHeight,
            color: CONTRAST.textSecondary,
          }}
        >
          {data.growthJourneySummary ?? data.profileSummary ?? "No summary available"}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {[
          {
            title: "Strengths",
            items: strengthLabels,
            tone: CONTRAST.successGlow,
          },
          {
            title: "Growth",
            items: growthLabels,
            tone: CONTRAST.warningGlow,
          },
        ].map((section) => (
          <div
            key={section.title}
            className="rounded-[16px] border px-4 py-3.5"
            style={{
              borderColor: `${section.tone}40`,
              backgroundColor: "rgba(255,255,255,0.025)",
            }}
          >
            <p
              style={{
                fontSize: TYPO.badge.fontSize,
                lineHeight: TYPO.badge.lineHeight,
                letterSpacing: TYPO.badge.letterSpacing,
                color: section.tone,
              }}
            >
              {section.title}
            </p>
            <ul className="mt-2.5 space-y-2">
              {section.items.map((item) => (
                <li
                  key={item}
                  className="border-l pl-3"
                  style={{
                    borderColor: `${section.tone}70`,
                    fontSize: TYPO.cardBody.fontSize,
                    lineHeight: TYPO.cardBody.lineHeight,
                    color: CONTRAST.textPrimary,
                  }}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div
        className="rounded-[16px] border px-4 py-3.5"
        style={{
          borderColor: `${CONTRAST.primaryGlow}20`,
          backgroundColor: "rgba(255,255,255,0.025)",
        }}
      >
        <p
          style={{
            fontSize: TYPO.badge.fontSize,
            lineHeight: TYPO.badge.lineHeight,
            letterSpacing: TYPO.badge.letterSpacing,
            color: CONTRAST.textTertiary,
          }}
        >
          Stat Cluster
        </p>
        <div className="mt-2.5 grid grid-cols-2 gap-2.5">
          {signalGroups.map((signal) => (
            <div
              key={signal.label}
              className="rounded-[14px] border px-3.5 py-2.5"
              style={{
                borderColor: `${signal.tone}35`,
                backgroundColor: `${signal.tone}10`,
              }}
            >
              <p
                style={{
                  fontSize: TYPO.badge.fontSize,
                  lineHeight: TYPO.badge.lineHeight,
                  letterSpacing: TYPO.badge.letterSpacing,
                  color: CONTRAST.textSecondary,
                }}
              >
                {signal.label}
              </p>
              <p
                className="mt-1.5 font-semibold tabular-nums"
                style={{
                  fontSize: TYPO.valueMd.fontSize,
                  lineHeight: TYPO.valueMd.lineHeight,
                  color: signal.tone,
                }}
              >
                {signal.value ?? "—"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
