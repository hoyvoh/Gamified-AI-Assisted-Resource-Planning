"use client";

import {
  CONTRAST,
  DOSSIER_COLORS,
  TYPO,
} from "@/features/dossier/constants/dossier.constants";
import { isCurrentMilestone } from "@/features/dossier/lib/dossier-contract.helpers";
import type { ProfileJourneyResponse } from "@/features/dossier/types/dossier.types";

interface JourneyDeckProps {
  data: ProfileJourneyResponse;
}

export const JourneyDeck = ({ data }: JourneyDeckProps) => {
  return (
    <div className="space-y-4">
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
          Journey Timeline
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
          {data.growthJourneySummary ??
            "Progression is a path through milestones, not a checklist table"}
        </h2>
      </section>

      <section className="relative pl-5 sm:pl-8">
        <div className="absolute left-1.5 top-1 bottom-1 w-px bg-white/10 sm:left-3" />
        <div className="space-y-3.5">
          {data.milestones.map((milestone) => {
            const isCurrent = isCurrentMilestone(milestone, data.milestones);
            const isAchieved = milestone.milestoneType === "achieved";

            return (
            <article key={milestone.milestoneId} className="relative pl-5 sm:pl-8">
              <div
                className="absolute left-[-1px] top-5 size-3.5 rounded-full border sm:left-0"
                style={{
                  borderColor: isCurrent
                    ? CONTRAST.warningGlow
                    : isAchieved
                      ? CONTRAST.timeline
                      : "rgba(255,255,255,0.2)",
                  backgroundColor: isCurrent
                    ? `${CONTRAST.warningGlow}33`
                    : isAchieved
                      ? `${CONTRAST.timeline}33`
                      : "rgba(255,255,255,0.05)",
                  boxShadow: isCurrent
                    ? `0 0 16px ${CONTRAST.warningGlow}50`
                    : "none",
                }}
              />

              <div
                className="rounded-[24px] border px-4 py-4 backdrop-blur-xl"
                style={{
                  borderColor: isCurrent
                    ? `${CONTRAST.warningGlow}45`
                    : isAchieved
                      ? `${CONTRAST.timeline}40`
                      : DOSSIER_COLORS.panelBorder,
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.02))",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                }}
              >
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3
                    className="font-display uppercase"
                    style={{
                      fontSize: TYPO.milestone.fontSize,
                      lineHeight: TYPO.milestone.lineHeight,
                      letterSpacing: TYPO.milestone.letterSpacing,
                      color: CONTRAST.textPrimary,
                    }}
                    >
                    {milestone.title}
                  </h3>
                  {isCurrent && (
                    <span
                      className="rounded-full border px-2.5 py-0.5 uppercase"
                      style={{
                        fontSize: TYPO.badge.fontSize,
                        lineHeight: TYPO.badge.lineHeight,
                        letterSpacing: TYPO.badge.letterSpacing,
                        color: CONTRAST.warningGlow,
                        borderColor: `${CONTRAST.warningGlow}45`,
                        backgroundColor: `${CONTRAST.warningGlow}15`,
                      }}
                    >
                      Current vector
                    </span>
                  )}
                </div>

                <p
                  className="mt-2"
                  style={{
                    fontSize: TYPO.cardBody.fontSize,
                    lineHeight: TYPO.cardBody.lineHeight,
                    color: CONTRAST.textSecondary,
                  }}
                >
                  {milestone.summary ?? "No summary available"}
                </p>

                <p
                  className="mt-3"
                  style={{
                    fontSize: TYPO.milestoneDate.fontSize,
                    lineHeight: TYPO.milestoneDate.lineHeight,
                    letterSpacing: TYPO.milestoneDate.letterSpacing,
                    color: CONTRAST.textTertiary,
                  }}
                >
                  {isAchieved
                    ? `Achieved ${new Date(
                        milestone.timestamp,
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}`
                    : "Future checkpoint"}
                </p>
              </div>
            </article>
          )})}
        </div>
      </section>
    </div>
  );
};
