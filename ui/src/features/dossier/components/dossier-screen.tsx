"use client";

import { useQueryClient } from "@tanstack/react-query";
import gsap from "gsap";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { AnalysisLauncher } from "@/features/dossier/components/analysis-launcher";
import { CasesDeck } from "@/features/dossier/components/cases-deck";
import { CompetencyDeck } from "@/features/dossier/components/competency-deck";
import { DossierTabs } from "@/features/dossier/components/dossier-tabs";
import { DossierSurfaceSkeleton } from "@/features/dossier/components/dossier-surface-skeleton";
import { DossierSurfaceStatePanel } from "@/features/dossier/components/dossier-surface-state-panel";
import { EvidenceDrawer } from "@/features/dossier/components/evidence-drawer";
import { JourneyDeck } from "@/features/dossier/components/journey-deck";
import { KptDeck } from "@/features/dossier/components/kpt-deck";
import { LeftBriefPanel } from "@/features/dossier/components/left-brief-panel";
import { MemberHeaderPanel } from "@/features/dossier/components/member-header-panel";
import { OverviewDeck } from "@/features/dossier/components/overview-deck";
import { ReviewOverlay } from "@/features/dossier/components/review-overlay";
import { TrustStrip } from "@/features/dossier/components/trust-strip";
import {
  CONTRAST,
  DOSSIER_COLORS,
  DOSSIER_MOTION,
  TYPO,
} from "@/features/dossier/constants/dossier.constants";
import {
  useAnalysisRunStatus,
  useCreateAnalysisRun,
  useCreateValidationFlag,
  useDossierData,
  useDossierDimensionDetail,
  useDossierValidationFlags,
} from "@/features/dossier/hooks/use-dossier-data";
import { useDossierUiState } from "@/features/dossier/hooks/use-dossier-ui-state";
import {
  getOverviewBriefViewModel,
  normalizeConfidenceValue,
  getTrustStripViewModel,
} from "@/features/dossier/lib/dossier-contract.helpers";
import { resolveDossierSurfaceState } from "@/features/dossier/lib/dossier-surface-state";
import type {
  AnalysisRun,
  DossierHeaderViewModel,
  DossierTab,
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

const ACTIVE_PANEL_COPY: Record<
  DossierTab,
  { eyebrow: string; title: string; description: string }
> = {
  overview: {
    eyebrow: "Overview Surface",
    title: "Prime dossier readout",
    description:
      "Compact hero readout with the character holding primary attention.",
  },
  competency: {
    eyebrow: "Competency Surface",
    title: "Attribute signal field",
    description:
      "Focused modules that behave like operative attributes, not analytics widgets.",
  },
  kpt: {
    eyebrow: "Coaching Surface",
    title: "Behavior loops and experiments",
    description: "Keep, pressure, and next trials in one dense coaching layer.",
  },
  cases: {
    eyebrow: "Case Surface",
    title: "Evidence-led inspection",
    description:
      "Case evidence stays secondary to the hero while remaining readable and actionable.",
  },
  journey: {
    eyebrow: "Journey Surface",
    title: "Progression timeline",
    description:
      "A compressed progression path that supports, rather than dominates, the chamber.",
  },
};

const ANALYSIS_STAGE_LABELS: Record<string, string> = {
  collecting_data: "Collecting data...",
  extracting_evidence: "Extracting evidence...",
  inferring_dimensions: "Inferring dimensions...",
  scoring: "Scoring...",
  generating_kpt: "Generating coaching deck...",
  self_checking: "Self-check gate...",
};

const isDefinedHTMLElement = (
  value: HTMLDivElement | HTMLElement | null,
): value is HTMLDivElement | HTMLElement => value !== null;

const getDefaultScanWindow = (): { periodEnd: string; periodStart: string } => {
  const periodEnd = new Date();
  const periodStart = new Date(periodEnd);

  periodStart.setMonth(periodStart.getMonth() - 3);

  return {
    periodStart: periodStart.toISOString().slice(0, 10),
    periodEnd: periodEnd.toISOString().slice(0, 10),
  };
};

const DossierHeroAtmosphere = () => (
  <div className="pointer-events-none absolute inset-0 -z-10 overflow-visible">
    <div className="absolute inset-x-[8%] bottom-[18%] top-[9%] rounded-[50%] bg-[radial-gradient(circle,_rgba(96,238,226,0.16),_rgba(63,211,255,0.05)_34%,_transparent_68%)] blur-3xl" />
    <div className="absolute inset-x-[2%] bottom-[14%] top-0 bg-[radial-gradient(circle_at_50%_24%,_rgba(173,255,240,0.1),_transparent_22%),radial-gradient(circle_at_50%_78%,_rgba(63,211,255,0.08),_transparent_28%)]" />
    <div className="absolute inset-x-[24%] bottom-[16%] top-[10%] bg-[linear-gradient(180deg,rgba(191,255,247,0.08),rgba(63,211,255,0.03)_35%,transparent_80%)] blur-2xl" />
    <div className="absolute inset-x-[4%] bottom-[12%] top-[12%] bg-[radial-gradient(circle_at_50%_40%,_rgba(156,255,240,0.08),_transparent_30%),radial-gradient(circle_at_48%_76%,_rgba(63,211,255,0.12),_transparent_24%)] opacity-80" />
    <div className="absolute inset-x-[16%] bottom-[10%] h-28 rounded-[50%] bg-[radial-gradient(circle,_rgba(63,211,255,0.18),_rgba(28,91,118,0.08)_44%,_transparent_72%)] blur-2xl" />
    <div className="absolute inset-x-[6%] bottom-[8%] h-24 bg-[radial-gradient(ellipse_at_center,rgba(5,7,13,0.08)_0%,rgba(5,7,13,0.22)_42%,rgba(5,7,13,0.56)_68%,transparent_100%)] blur-xl" />
    <div className="absolute inset-x-[12%] bottom-[6%] h-28 rounded-[50%] border border-white/10 bg-[radial-gradient(circle,_rgba(213,252,246,0.14),_rgba(9,25,36,0.16)_45%,_transparent_75%)] shadow-[0_18px_60px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)]" />
    <div className="absolute inset-x-[19%] bottom-[9%] h-7 rounded-[50%] bg-[radial-gradient(circle,_rgba(140,247,232,0.34),_rgba(63,211,255,0.12)_58%,_transparent_90%)] blur-xl" />
    <div className="absolute inset-x-0 bottom-[7%] flex justify-center">
      <div className="h-px w-[72%] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  </div>
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
  const router = useRouter();
  const queryClient = useQueryClient();
  const { overview, competency, kpt, cases, journey } = useDossierData(
    memberId,
    initialOverview,
  );
  const {
    activeTab,
    isEvidenceOpen,
    isReviewOpen,
    selectedDimensionId,
    setActiveTab,
    openEvidence,
    closeEvidence,
    openReview,
    closeReview,
    setSelectedDimensionId,
  } = useDossierUiState();
  const [reviewErrorMessage, setReviewErrorMessage] = useState<string | null>(
    null,
  );
  const deckMotionRef = useRef<HTMLDivElement | null>(null);
  const briefClusterRef = useRef<HTMLDivElement | null>(null);
  const rightClusterRef = useRef<HTMLElement | null>(null);
  const stageClusterRef = useRef<HTMLDivElement | null>(null);

  const activeRun = useAnalysisRunStatus(
    latestRun?.analysisRunId ?? null,
    latestRun?.status === "analyzing",
  );
  const currentRun = activeRun.data ?? latestRun;
  const activeAnalysisStatus = currentRun?.status ?? analysisStatus;
  const displayConfidence =
    currentRun?.status === "analyzing"
      ? normalizeConfidenceValue(currentRun.progressPct)
      : normalizeConfidenceValue(overview.data?.overallConfidence ?? confidence);
  const dimensionDetail = useDossierDimensionDetail(memberId, selectedDimensionId);
  const validationFlags = useDossierValidationFlags(overview.data?.runId ?? null);
  const createValidationFlag = useCreateValidationFlag(
    memberId,
    overview.data?.runId ?? null,
  );
  const createAnalysisRun = useCreateAnalysisRun(memberId);

  const selectedValidationFlag = useMemo(
    () =>
      validationFlags.data?.find(
        (item) => item.dimensionId === selectedDimensionId,
      ) ?? null,
    [selectedDimensionId, validationFlags.data],
  );

  const headerViewModel: DossierHeaderViewModel = {
    memberName,
    roleName: roleName ?? "Role pending",
    teamName,
    status: activeAnalysisStatus,
  };

  const briefViewModel = overview.data
    ? getOverviewBriefViewModel(overview.data)
    : null;

  const trustViewModel = overview.data
    ? {
        ...getTrustStripViewModel(overview.data),
        flaggedLabel: `${validationFlags.data?.length ?? overview.data.insufficientDimensions.length}`,
      }
    : null;

  const activePanel = {
    overview,
    competency,
    kpt,
    cases,
    journey,
  }[activeTab];
  const activeSurfaceState = resolveDossierSurfaceState({
    tab: activeTab,
    analysisStatus: activeAnalysisStatus,
    data: activePanel.data,
    error: activePanel.error instanceof Error ? activePanel.error : null,
    isError: activePanel.isError,
  });

  useEffect(() => {
    if (
      activeRun.data &&
      (activeRun.data.status === "completed" || activeRun.data.status === "failed")
    ) {
      void queryClient.invalidateQueries({
        queryKey: ["dossier", memberId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["dossier-bootstrap", memberId],
      });
    }
  }, [activeRun.data, memberId, queryClient]);

  useEffect(() => {
    const deckNode = deckMotionRef.current;

    if (!deckNode) {
      return;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      gsap.fromTo(
        deckNode,
        {
          x: DOSSIER_MOTION.deckEnterOffset,
          opacity: 0,
          filter: `blur(${DOSSIER_MOTION.deckEnterBlur}px)`,
          scale: 1.03,
        },
        {
          x: 0,
          opacity: 1,
          filter: "blur(0px)",
          scale: 1,
          duration: DOSSIER_MOTION.deckEnterDuration,
          ease: "power3.out",
          overwrite: true,
        },
      );
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [activeTab]);

  const handleTabChange = (tab: DossierTab) => {
    if (tab === activeTab) {
      return;
    }

    setActiveTab(tab);
  };

  useEffect(() => {
    const panelTargets = [
      briefClusterRef.current,
      rightClusterRef.current,
      stageClusterRef.current,
    ].filter(isDefinedHTMLElement);

    if (panelTargets.length === 0) {
      return;
    }

    const tween = gsap.to(panelTargets, {
      opacity: isEvidenceOpen ? DOSSIER_MOTION.panelDimOpacity : 1,
      filter: isEvidenceOpen
        ? `blur(${DOSSIER_MOTION.panelBlur}px)`
        : "blur(0px)",
      x: (_index, target) => {
        if (target === briefClusterRef.current) {
          return isEvidenceOpen ? -DOSSIER_MOTION.panelShift : 0;
        }

        return isEvidenceOpen ? DOSSIER_MOTION.panelShift : 0;
      },
      duration: DOSSIER_MOTION.panelFocusDuration,
      ease: "power3.out",
      overwrite: true,
    });

    return () => {
      tween.kill();
    };
  }, [isEvidenceOpen]);

  const handleOpenEvidence = () => {
    const fallbackDimensionId =
      selectedDimensionId ?? competency.data?.dimensionScores[0]?.dimensionId ?? null;

    if (fallbackDimensionId) {
      setSelectedDimensionId(fallbackDimensionId);
      openEvidence();
    }
  };

  const handleSelectDimension = (dimensionId: string) => {
    setSelectedDimensionId(dimensionId);
    openEvidence();
  };

  const handleOpenReview = () => {
    const fallbackDimensionId =
      selectedDimensionId ??
      overview.data?.insufficientDimensions[0] ??
      competency.data?.dimensionScores[0]?.dimensionId ??
      null;

    if (fallbackDimensionId) {
      setSelectedDimensionId(fallbackDimensionId);
      openReview();
    }
  };

  const handleSubmitValidation = (input: {
    dimensionId: string;
    note: string | null;
    verdict: "accurate" | "questionable" | "incorrect";
  }) => {
    if (!overview.data?.runId) {
      setReviewErrorMessage("No analysis run is available for validation.");
      return;
    }

    setReviewErrorMessage(null);
    createValidationFlag.mutate(
      {
        analysisRunId: overview.data.runId,
        dimensionId: input.dimensionId,
        verdict: input.verdict,
        note: input.note,
      },
      {
        onError: (error) => {
          setReviewErrorMessage(
            error instanceof Error ? error.message : "Failed to save review.",
          );
        },
        onSuccess: () => {
          closeReview();
        },
      },
    );
  };

  const handleStartScan = () => {
    const { periodEnd, periodStart } = getDefaultScanWindow();

    createAnalysisRun.mutate({
      periodEnd,
      periodStart,
      runType: "fresh",
    });
  };

  const renderActiveDeck = () => {
    if (activeSurfaceState !== "ready") {
      return (
        <DossierSurfaceStatePanel
          onRetry={() => {
            void activePanel.refetch();
          }}
          onStartScan={handleStartScan}
          scanReady={
            !createAnalysisRun.isPending && activeAnalysisStatus !== "analyzing"
          }
          state={activeSurfaceState}
        />
      );
    }

    switch (activeTab) {
      case "overview":
        return <OverviewDeck data={overview.data!} />;
      case "competency":
        return (
          <CompetencyDeck
            data={competency.data!.dimensionScores}
            onSelectDimension={handleSelectDimension}
            selectedDimensionId={selectedDimensionId}
          />
        );
      case "kpt":
        return <KptDeck data={kpt.data!} />;
      case "cases":
        return <CasesDeck data={cases.data!} />;
      case "journey":
        return <JourneyDeck data={journey.data!} />;
      default:
        return null;
    }
  };

  return (
    <main
      className="relative min-h-screen overflow-x-hidden overflow-y-visible dossier-chamber-bg xl:flex xl:h-dvh xl:flex-col xl:overflow-x-hidden xl:overflow-y-visible"
      style={{ backgroundColor: DOSSIER_COLORS.bg }}
    >
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 34% 42%, #0a0f1a 0%, rgba(10,15,26,0.92) 26%, rgba(5,7,13,0.98) 64%, #05070d 100%)",
          }}
        />
        <div
          className="absolute left-[18%] top-[26%] h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{ backgroundColor: DOSSIER_COLORS.fog }}
        />
        <div
          className="absolute left-[34%] bottom-[6%] h-[26rem] w-[26rem] -translate-x-1/2 rounded-full blur-3xl"
          style={{ backgroundColor: "rgba(63, 211, 255, 0.08)" }}
        />
        <div
          className="absolute right-[-10rem] top-10 h-[24rem] w-[24rem] rounded-full blur-3xl"
          style={{ backgroundColor: "rgba(63, 211, 255, 0.04)" }}
        />
      </div>

      <MemberHeaderPanel header={headerViewModel} />

      <div className="relative z-10 mx-auto max-w-[1880px] px-4 pb-5 pt-3 md:px-6 xl:flex-1 xl:min-h-0 xl:w-full xl:overflow-visible xl:pb-4">
        <div
          className="pointer-events-none absolute inset-y-0 left-[clamp(10rem,12vw,13rem)] right-[40%] z-[15] hidden xl:block"
          ref={stageClusterRef}
        >
          <div className="pointer-events-none relative h-full overflow-visible pt-3">
            <DossierHeroAtmosphere />
            <CharacterStage
              confidence={displayConfidence}
              isFocusMode={isEvidenceOpen}
              status={activeAnalysisStatus}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 xl:h-full xl:min-h-0 xl:flex-row xl:items-stretch xl:gap-2 xl:overflow-visible">
          <div
            className="hidden xl:flex xl:h-full xl:w-[14%] xl:min-w-[168px] xl:max-w-[198px] xl:items-start xl:-mr-3"
            ref={briefClusterRef}
          >
            <LeftBriefPanel brief={briefViewModel} />
          </div>

          <section className="relative xl:w-[46%]" aria-hidden="true">
            <div className="pointer-events-none relative xl:hidden">
              <DossierHeroAtmosphere />
              <CharacterStage
                confidence={displayConfidence}
                isFocusMode={isEvidenceOpen}
                status={activeAnalysisStatus}
              />
            </div>
          </section>

          <section
            className="relative xl:h-full xl:min-h-0 xl:w-[40%] xl:min-w-[480px] xl:pt-3"
            ref={rightClusterRef}
          >
            <div className="xl:flex xl:h-full xl:min-h-0 xl:flex-col xl:pr-2">
              <div className="mb-3 xl:mb-2 xl:flex-shrink-0 xl:bg-[linear-gradient(180deg,rgba(6,13,21,0.96),rgba(6,13,21,0.82)_72%,transparent)] xl:pb-3">
                <DossierTabs
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                />
              </div>

              <div
                className="relative rounded-[24px] border px-5 pb-5 pt-4 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-xl xl:flex xl:h-full xl:min-h-0 xl:flex-col"
                style={{
                  borderColor: DOSSIER_COLORS.panelBorderStrong,
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.025))",
                  boxShadow:
                    "0 26px 84px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06), 0 0 1px rgba(63,211,255,0.1)",
                }}
              >
                <div
                  className="pointer-events-none absolute left-4 top-4 h-16 w-20 rounded-full blur-2xl"
                  style={{ backgroundColor: DOSSIER_COLORS.panelGlow }}
                />
                <div
                  className="pointer-events-none absolute bottom-4 right-4 h-14 w-20 rounded-full blur-2xl"
                  style={{ backgroundColor: "rgba(63, 211, 255, 0.08)" }}
                />
                {trustViewModel ? (
                  <div className="mb-3 xl:flex-shrink-0">
                    <TrustStrip
                      onOpenReview={handleOpenReview}
                      trust={trustViewModel}
                    />
                  </div>
                ) : null}

                <div className="overflow-x-hidden xl:min-h-0 xl:flex-1" ref={deckMotionRef}>
                  <div className="xl:flex xl:h-full xl:min-h-0 xl:flex-col">
                    <div className="border-b border-white/6 pb-3 xl:flex-shrink-0">
                      <p
                        style={{
                          fontSize: TYPO.eyebrow.fontSize,
                          lineHeight: TYPO.eyebrow.lineHeight,
                          letterSpacing: TYPO.eyebrow.letterSpacing,
                          color: CONTRAST.textTertiary,
                        }}
                      >
                        {ACTIVE_PANEL_COPY[activeTab].eyebrow}
                      </p>
                      <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
                        <div className="max-w-xl">
                          <h2
                            className="font-display uppercase md:text-lg"
                            style={{
                              fontSize: TYPO.sectionTitle.fontSize,
                              lineHeight: TYPO.sectionTitle.lineHeight,
                              letterSpacing: TYPO.sectionTitle.letterSpacing,
                              color: CONTRAST.textPrimary,
                            }}
                          >
                            {ACTIVE_PANEL_COPY[activeTab].title}
                          </h2>
                          <p
                            className="mt-1.5 max-w-xl"
                            style={{
                              fontSize: TYPO.bodySm.fontSize,
                              lineHeight: TYPO.bodySm.lineHeight,
                              color: CONTRAST.textSecondary,
                            }}
                          >
                            {ACTIVE_PANEL_COPY[activeTab].description}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3.5 xl:min-h-0 xl:flex-1 xl:overflow-x-hidden xl:overflow-y-auto xl:overscroll-contain">
                      {activePanel.isLoading ? (
                        <DossierSurfaceSkeleton />
                      ) : (
                        renderActiveDeck()
                      )}
                    </div>
                  </div>
                </div>

                <div className="xl:flex-shrink-0">
                  <AnalysisLauncher
                    analysisStatus={activeAnalysisStatus}
                    onOpenEvidence={handleOpenEvidence}
                    onReturnToWarRoom={() => router.push("/")}
                    onStartScan={handleStartScan}
                    scanReady={
                      !createAnalysisRun.isPending && activeAnalysisStatus !== "analyzing"
                    }
                    scanStageLabel={
                      currentRun?.progressStage
                        ? ANALYSIS_STAGE_LABELS[currentRun.progressStage] ??
                          currentRun.progressStage
                        : null
                    }
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <EvidenceDrawer
        data={dimensionDetail.data ?? null}
        errorMessage={
          dimensionDetail.error instanceof Error
            ? dimensionDetail.error.message
            : null
        }
        isLoading={dimensionDetail.isLoading}
        isOpen={isEvidenceOpen}
        onClose={closeEvidence}
        selectedDimensionId={selectedDimensionId}
      />
      <ReviewOverlay
        errorMessage={reviewErrorMessage}
        existingFlag={selectedValidationFlag}
        isOpen={isReviewOpen}
        isSubmitting={createValidationFlag.isPending}
        onClose={closeReview}
        onSubmit={handleSubmitValidation}
        selectedDimensionId={selectedDimensionId}
      />
    </main>
  );
};
