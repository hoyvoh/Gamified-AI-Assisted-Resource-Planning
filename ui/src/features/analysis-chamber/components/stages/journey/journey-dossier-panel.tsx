"use client";

import type { JourneyMilestoneViewModel } from "@/features/analysis-chamber/components/stages/journey/journey-stage.types";
import {
  formatMilestoneDate,
  humanizeMilestoneType,
} from "@/features/analysis-chamber/components/stages/journey/journey-stage.utils";
import {
  ANALYSIS_CHAMBER_SHELL_PALETTE as palette,
  JOURNEY_TOKENS,
} from "@/features/analysis-chamber/lib/analysis-chamber-shell.constants";

const stateLabel = {
  conquered: "Secured stronghold",
  frontier: "Frontier command",
  unconquered: "Locked approach",
} as const;

export const JourneyDossierPanel = ({
  focusedMilestone,
  previousMilestone,
  nextMilestone,
  journeySummary,
  currentGrowthPath,
  onSelectMilestone,
}: {
  focusedMilestone: JourneyMilestoneViewModel | null;
  previousMilestone: JourneyMilestoneViewModel | null;
  nextMilestone: JourneyMilestoneViewModel | null;
  journeySummary: string | null;
  currentGrowthPath: string | null;
  onSelectMilestone: (milestoneId: string) => void;
}) => (
  <aside
    className="flex h-full flex-col rounded-[28px] border px-5 py-5"
    style={{
      borderColor: JOURNEY_TOKENS.dossierBorder,
      background: JOURNEY_TOKENS.dossierSurface,
      boxShadow: JOURNEY_TOKENS.dossierInset,
    }}
  >
    {focusedMilestone ? (
      <>
        <div>
          <p
            className="font-display text-[10px] uppercase tracking-[0.2em]"
            style={{ color: palette.gold }}
          >
            Command dossier
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span
              className="rounded-full border px-2.5 py-1 text-[9px] uppercase tracking-[0.18em]"
              style={{
                borderColor: JOURNEY_TOKENS.dossierChipBorder,
                color: palette.ink,
              }}
            >
              {focusedMilestone.landmarkLabel}
            </span>
            <span
              className="rounded-full border px-2.5 py-1 text-[9px] uppercase tracking-[0.18em]"
              style={{
                borderColor: JOURNEY_TOKENS.stateLockedBorder,
                color:
                  focusedMilestone.state === "frontier" ? palette.goldLight : palette.inkMuted,
              }}
            >
              {stateLabel[focusedMilestone.state]}
            </span>
          </div>
          <p
            className="mt-4 font-display text-lg uppercase tracking-[0.08em] leading-7"
            style={{ color: palette.ink }}
          >
            {focusedMilestone.milestone.title}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.16em]">
            <span style={{ color: JOURNEY_TOKENS.dossierMeta }}>
              {focusedMilestone.archetypeLabel}
            </span>
            <span style={{ color: JOURNEY_TOKENS.dossierMetaDivider }}>•</span>
            <span style={{ color: palette.inkMuted }}>
              {humanizeMilestoneType(focusedMilestone.milestone.milestoneType)}
            </span>
            {formatMilestoneDate(focusedMilestone.milestone.timestamp) ? (
              <>
                <span style={{ color: JOURNEY_TOKENS.dossierMetaDivider }}>•</span>
                <span style={{ color: palette.inkMuted }}>
                  {formatMilestoneDate(focusedMilestone.milestone.timestamp)}
                </span>
              </>
            ) : null}
          </div>
        </div>

        <div
          className="mt-5 rounded-2xl border px-4 py-4"
          style={{
            borderColor: JOURNEY_TOKENS.dossierBorder,
            background: JOURNEY_TOKENS.dossierImpactBg,
          }}
        >
          <p
            className="text-[9px] uppercase tracking-[0.18em]"
            style={{ color: palette.inkMuted }}
          >
            Impact score
          </p>
          <p className="mt-2 font-display text-3xl leading-none" style={{ color: palette.gold }}>
            {focusedMilestone.milestone.impactScore !== null &&
            focusedMilestone.milestone.impactScore !== undefined
              ? Math.round(focusedMilestone.milestone.impactScore * 100)
              : "—"}
            <span className="ml-1 text-sm" style={{ color: palette.inkSoft }}>
              /100
            </span>
          </p>
        </div>

        <div className="mt-5 flex-1 space-y-4">
          <div>
            <p
              className="text-[9px] uppercase tracking-[0.18em]"
              style={{ color: palette.inkMuted }}
            >
              Milestone summary
            </p>
            <p className="mt-2 text-sm leading-6" style={{ color: JOURNEY_TOKENS.dossierBody }}>
              {focusedMilestone.milestone.summary ??
                "This stronghold is marked on the route, but its field notes have not been written yet."}
            </p>
          </div>

          {currentGrowthPath ? (
            <div>
              <p
                className="text-[9px] uppercase tracking-[0.18em]"
                style={{ color: palette.inkMuted }}
              >
                Current growth path
              </p>
              <p className="mt-2 text-sm leading-6" style={{ color: JOURNEY_TOKENS.dossierBody }}>
                {currentGrowthPath}
              </p>
            </div>
          ) : null}

          {journeySummary ? (
            <div>
              <p
                className="text-[9px] uppercase tracking-[0.18em]"
                style={{ color: palette.inkMuted }}
              >
                Expedition brief
              </p>
              <p className="mt-2 text-sm leading-6" style={{ color: JOURNEY_TOKENS.dossierBody }}>
                {journeySummary}
              </p>
            </div>
          ) : null}
        </div>

        {(previousMilestone ?? nextMilestone) ? (
          <div className="mt-5 flex items-center gap-2">
            {previousMilestone ? (
              <button
                type="button"
                className="cursor-pointer rounded-full border px-3 py-2 text-[10px] uppercase tracking-[0.16em] transition duration-150 hover:brightness-110"
                onClick={() => onSelectMilestone(previousMilestone.milestone.id)}
                style={{
                  borderColor: JOURNEY_TOKENS.dossierButtonIdleBorder,
                  color: palette.inkMuted,
                  background: JOURNEY_TOKENS.dossierButtonIdleBg,
                }}
              >
                Prev stronghold
              </button>
            ) : null}
            {nextMilestone ? (
              <button
                type="button"
                className="cursor-pointer rounded-full border px-3 py-2 text-[10px] uppercase tracking-[0.16em] transition duration-150 hover:brightness-110"
                onClick={() => onSelectMilestone(nextMilestone.milestone.id)}
                style={{
                  borderColor: JOURNEY_TOKENS.dossierButtonActiveBorder,
                  color: palette.ink,
                  background: JOURNEY_TOKENS.dossierButtonActiveBg,
                }}
              >
                Next frontier
              </button>
            ) : null}
          </div>
        ) : null}
      </>
    ) : (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <p
          className="font-display text-[10px] uppercase tracking-[0.2em]"
          style={{ color: palette.gold }}
        >
          Command dossier
        </p>
        <p className="mt-3 text-sm leading-6" style={{ color: palette.inkMuted }}>
          {journeySummary ??
            "Select a visible landmark to review the selected stronghold dossier."}
        </p>
      </div>
    )}
  </aside>
);
