"use client";

import { useMemo } from "react";

import type { ChamberMilestone } from "@/features/analysis-chamber/api/analysis-chamber-api.view-models";
import { JourneyDossierPanel } from "@/features/analysis-chamber/components/stages/journey/journey-dossier-panel";
import { JourneyExpeditionLog } from "@/features/analysis-chamber/components/stages/journey/journey-expedition-log";
import { JourneyMapCanvas } from "@/features/analysis-chamber/components/stages/journey/journey-map-canvas";
import { buildJourneyMilestoneViewModels } from "@/features/analysis-chamber/components/stages/journey/journey-stage.utils";
import { useAnalysisChamberJourneyData } from "@/features/analysis-chamber/hooks/use-analysis-chamber-shell-data";
import { useAnalysisChamberRouteState } from "@/features/analysis-chamber/hooks/use-analysis-chamber-route-state";

const EMPTY_MILESTONES: ChamberMilestone[] = [];

export const JourneyStageShell = ({ memberId }: { memberId: string }) => {
  const journey = useAnalysisChamberJourneyData(memberId);
  const { state, updateQuery } = useAnalysisChamberRouteState();

  const milestones = journey.data?.milestones ?? EMPTY_MILESTONES;

  const focusedMilestone = useMemo(
    () =>
      milestones.find((milestone) => milestone.id === state.milestone) ??
      milestones[0] ??
      null,
    [milestones, state.milestone],
  );

  const focusedIndex = focusedMilestone
    ? milestones.findIndex((milestone) => milestone.id === focusedMilestone.id)
    : -1;

  const milestoneViewModels = useMemo(
    () => buildJourneyMilestoneViewModels(milestones, Math.max(focusedIndex, 0)),
    [focusedIndex, milestones],
  );

  const focusedMilestoneView =
    milestoneViewModels.find((item) => item.milestone.id === focusedMilestone?.id) ?? null;
  const previousMilestoneView =
    focusedIndex > 0 ? (milestoneViewModels[focusedIndex - 1] ?? null) : null;
  const nextMilestoneView =
    focusedIndex >= 0 && focusedIndex < milestoneViewModels.length - 1
      ? (milestoneViewModels[focusedIndex + 1] ?? null)
      : null;

  const handleSelectMilestone = (milestoneId: string) => {
    updateQuery({
      milestone: milestoneId,
      highlight: milestoneId,
    });
  };

  return (
    <section className="grid h-full gap-0 lg:grid-rows-[1fr_152px]">
      <div className="relative min-h-0 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 18% 22%, rgba(255,184,77,0.10), transparent 26%), radial-gradient(circle at 78% 16%, rgba(42,90,154,0.12), transparent 20%), linear-gradient(180deg, rgba(255,255,255,0.01) 0%, rgba(255,255,255,0.00) 100%)",
          }}
        />
        <div className="relative z-10 grid h-full gap-4 p-4 md:p-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <JourneyMapCanvas
            milestones={milestoneViewModels}
            focusedMilestoneId={focusedMilestone?.id ?? null}
            onSelectMilestone={handleSelectMilestone}
          />
          <JourneyDossierPanel
            focusedMilestone={focusedMilestoneView}
            previousMilestone={previousMilestoneView}
            nextMilestone={nextMilestoneView}
            journeySummary={journey.data?.growthJourneySummary ?? null}
            currentGrowthPath={journey.data?.currentGrowthPath ?? null}
            onSelectMilestone={handleSelectMilestone}
          />
        </div>
      </div>
      <JourneyExpeditionLog
        milestones={milestoneViewModels}
        focusedMilestoneId={focusedMilestone?.id ?? null}
        onSelectMilestone={handleSelectMilestone}
      />
    </section>
  );
};
