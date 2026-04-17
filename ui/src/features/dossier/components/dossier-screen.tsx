"use client";

import { useMemo } from "react";

import { DossierSigilWheel } from "@/features/dossier/components/dossier-sigil-wheel";
import { MemberHeaderPanel } from "@/features/dossier/components/member-header-panel";
import { TYPO } from "@/features/dossier/constants/dossier.constants";
import {
  DOSSIER_SCREEN_CHAPTERS,
  DOSSIER_SCREEN_COPY,
  DOSSIER_SCREEN_PALETTE,
} from "@/features/dossier/constants/dossier-screen.constants";
import {
  useAnalysisRunStatus,
  useDossierData,
} from "@/features/dossier/hooks/use-dossier-data";
import { useDossierSceneController } from "@/features/dossier/hooks/use-dossier-scene-controller";
import {
  formatPercentLabel,
  getOverviewBriefViewModel,
  normalizeConfidenceValue,
} from "@/features/dossier/lib/dossier-contract.helpers";
import type {
  AnalysisRun,
  DossierHeaderViewModel,
  ProfileOverviewResponse,
} from "@/features/dossier/types/dossier.types";
import type { AnalysisStatus } from "@/types/organization";
import { CharacterStage } from "@/systems/character/character-stage";

interface DossierScreenProps {
  memberId: string;
  memberName: string;
  roleName: string | null;
  teamName: string;
  analysisStatus: AnalysisStatus;
  confidence: number;
  initialOverview: ProfileOverviewResponse | null;
  latestRun: AnalysisRun | null;
}

const DossierBriefPanel = ({
  confidenceLabel,
  flaggedLabel,
  growthJourneySummary,
  growthTrack,
}: {
  confidenceLabel: string;
  flaggedLabel: string;
  growthJourneySummary: string;
  growthTrack: string;
}) => (
  <section
    className="rounded-[28px] border px-5 py-5"
    style={{
      borderColor: `${DOSSIER_SCREEN_PALETTE.border}70`,
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.015))",
      boxShadow:
        "0 18px 44px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.05)",
    }}
  >
    <p
      style={{
        color: DOSSIER_SCREEN_PALETTE.icyBlue,
        fontSize: TYPO.eyebrow.fontSize,
        letterSpacing: TYPO.eyebrow.letterSpacing,
        lineHeight: TYPO.eyebrow.lineHeight,
      }}
    >
      Chamber Status
    </p>
    <h2
      className="mt-3 font-display uppercase"
      style={{
        color: DOSSIER_SCREEN_PALETTE.text,
        fontSize: TYPO.sectionTitleMd.fontSize,
        letterSpacing: TYPO.sectionTitle.letterSpacing,
        lineHeight: TYPO.sectionTitle.lineHeight,
      }}
    >
      {growthTrack}
    </h2>
    <p
      className="mt-2"
      style={{
        color: DOSSIER_SCREEN_PALETTE.textMuted,
        fontSize: TYPO.bodySm.fontSize,
        lineHeight: TYPO.bodySm.lineHeight,
      }}
    >
      {growthJourneySummary}
    </p>

    <div className="mt-4 grid grid-cols-2 gap-3">
      {[
        {
          label: "Confidence",
          value: confidenceLabel,
          tone: DOSSIER_SCREEN_PALETTE.icyBlue,
        },
        {
          label: "Flagged",
          value: flaggedLabel,
          tone: DOSSIER_SCREEN_PALETTE.goldSoft,
        },
      ].map((item) => (
        <div
          key={item.label}
          className="rounded-[18px] border px-3 py-3"
          style={{
            borderColor: `${item.tone}28`,
            backgroundColor: "rgba(255,255,255,0.02)",
          }}
        >
          <p
            style={{
              color: DOSSIER_SCREEN_PALETTE.textDim,
              fontSize: TYPO.badge.fontSize,
              letterSpacing: TYPO.badge.letterSpacing,
              lineHeight: TYPO.badge.lineHeight,
            }}
          >
            {item.label}
          </p>
          <p
            className="mt-2 font-display uppercase"
            style={{
              color: item.tone,
              fontSize: TYPO.cardTitle.fontSize,
              letterSpacing: TYPO.cardTitle.letterSpacing,
              lineHeight: TYPO.cardTitle.lineHeight,
            }}
          >
            {item.value}
          </p>
        </div>
      ))}
    </div>
  </section>
);

export const DossierScreen = ({
  memberId,
  memberName,
  roleName,
  teamName,
  analysisStatus,
  confidence,
  initialOverview,
  latestRun,
}: DossierScreenProps) => {
  const { overview } = useDossierData(memberId, initialOverview);
  const { activeIndex, rootRef, setActiveIndex } = useDossierSceneController();
  const activeRun = useAnalysisRunStatus(
    latestRun?.analysisRunId ?? null,
    latestRun?.status === "analyzing",
  );
  const currentRun = activeRun.data ?? latestRun;
  const activeAnalysisStatus = currentRun?.status ?? analysisStatus;
  const activeChapter = DOSSIER_SCREEN_CHAPTERS[activeIndex];
  const displayConfidence =
    currentRun?.status === "analyzing"
      ? normalizeConfidenceValue(currentRun.progressPct)
      : normalizeConfidenceValue(
          overview.data?.overallConfidence ?? confidence,
        );

  const headerViewModel: DossierHeaderViewModel = useMemo(
    () => ({
      memberName,
      roleName: roleName ?? "Role pending",
      teamName,
      status: activeAnalysisStatus,
    }),
    [activeAnalysisStatus, memberName, roleName, teamName],
  );

  const briefViewModel = overview.data
    ? getOverviewBriefViewModel(overview.data)
    : null;

  return (
    <main
      className="relative h-screen overflow-hidden"
      ref={rootRef}
      style={{ backgroundColor: DOSSIER_SCREEN_PALETTE.bg }}
    >
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 22% 34%, rgba(114,176,213,0.18) 0%, rgba(15,30,48,0.58) 16%, rgba(9,18,29,0.9) 40%, rgba(7,13,22,0.98) 68%, #060d15 100%)",
          }}
        />
        <div
          className="absolute left-[18%] top-[28%] h-[34rem] w-[34rem] rounded-full blur-3xl"
          style={{ backgroundColor: "rgba(157, 232, 255, 0.1)" }}
        />
        <div
          className="absolute bottom-[8%] left-[34%] h-[18rem] w-[18rem] rounded-full blur-3xl"
          style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
        />
        <div
          className="absolute right-[12%] top-[16%] h-[26rem] w-[26rem] rounded-full blur-3xl"
          style={{ backgroundColor: `${activeChapter.accentColor}18` }}
        />
      </div>

      <MemberHeaderPanel header={headerViewModel} />

      <div className="relative z-10 mx-auto flex h-[calc(100vh-65px)] max-w-[1920px] gap-5 px-4 pb-6 pt-3 md:px-6">
        <aside className="flex w-[20%] min-w-[18rem] flex-col gap-5">
          <DossierSigilWheel
            activeIndex={activeIndex}
            onSelectChapter={setActiveIndex}
          />
          {briefViewModel ? (
            <DossierBriefPanel
              confidenceLabel={formatPercentLabel(displayConfidence)}
              flaggedLabel={`${overview.data?.insufficientDimensions.length ?? 0}`}
              growthJourneySummary={briefViewModel.growthJourneySummary}
              growthTrack={briefViewModel.currentGrowthPath}
            />
          ) : null}
          <p
            className="max-w-[15rem] pl-1"
            style={{
              color: DOSSIER_SCREEN_PALETTE.textMuted,
              fontSize: TYPO.bodySm.fontSize,
              lineHeight: TYPO.bodySm.lineHeight,
            }}
          >
            {DOSSIER_SCREEN_COPY.scrollHint}
          </p>
        </aside>

        <section className="relative flex-1" aria-label="Experimental Character Chamber">
          <div className="relative h-full overflow-visible">
            <CharacterStage
              confidence={displayConfidence}
              isFocusMode={false}
              status={activeAnalysisStatus}
            />
          </div>
        </section>
      </div>
    </main>
  );
};
