"use client";

import gsap from "gsap";
import { useEffect, useRef, useState } from "react";

import { AnalysisLauncher } from "@/features/dossier/components/analysis-launcher";
import { CasesDeck } from "@/features/dossier/components/cases-deck";
import { CompetencyDeck } from "@/features/dossier/components/competency-deck";
import { DossierTabs } from "@/features/dossier/components/dossier-tabs";
import { EvidenceDrawer } from "@/features/dossier/components/evidence-drawer";
import { JourneyDeck } from "@/features/dossier/components/journey-deck";
import { KptDeck } from "@/features/dossier/components/kpt-deck";
import { LeftBriefPanel } from "@/features/dossier/components/left-brief-panel";
import { MemberHeaderPanel } from "@/features/dossier/components/member-header-panel";
import { OverviewDeck } from "@/features/dossier/components/overview-deck";
import { DossierSurfaceSkeleton } from "@/features/dossier/components/dossier-surface-skeleton";
import { ReviewOverlay } from "@/features/dossier/components/review-overlay";
import { TrustStrip } from "@/features/dossier/components/trust-strip";
import {
  CONTRAST,
  DOSSIER_COLORS,
  DOSSIER_MOTION,
  TYPO,
} from "@/features/dossier/constants/dossier.constants";
import {
  getOverviewBriefViewModel,
  getTrustStripViewModel,
} from "@/features/dossier/lib/dossier-contract.helpers";
import { useDossierData } from "@/features/dossier/hooks/use-dossier-data";
import { useDossierUiState } from "@/features/dossier/hooks/use-dossier-ui-state";
import type {
  DossierHeaderViewModel,
  DossierTab,
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

const isDefinedHTMLElement = (
  value: HTMLDivElement | HTMLElement | null,
): value is HTMLDivElement | HTMLElement => value !== null;

export const DossierScreen = ({
  memberId,
  memberName,
  roleName,
  teamName,
  analysisStatus,
  confidence,
}: DossierScreenProps) => {
  const { overview, competency, kpt, cases, journey } =
    useDossierData(memberId);
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
  const [displayedTab, setDisplayedTab] = useState<DossierTab>(activeTab);
  const deckMotionRef = useRef<HTMLDivElement | null>(null);
  const deckTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const pendingTabRef = useRef<DossierTab>(activeTab);
  const briefClusterRef = useRef<HTMLDivElement | null>(null);
  const rightClusterRef = useRef<HTMLElement | null>(null);
  const stageCaptionRef = useRef<HTMLDivElement | null>(null);

  const headerViewModel: DossierHeaderViewModel = {
    memberName,
    roleName: roleName ?? "Role pending",
    teamName,
    status: analysisStatus,
  };

  const briefViewModel = overview.data
    ? getOverviewBriefViewModel(overview.data)
    : null;

  const trustViewModel = overview.data
    ? getTrustStripViewModel(overview.data)
    : null;

  const activePanel = {
    overview,
    competency,
    kpt,
    cases,
    journey,
  }[displayedTab];

  useEffect(() => {
    pendingTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    const deckNode = deckMotionRef.current;

    if (!deckNode || displayedTab === activeTab) {
      return;
    }

    deckTimelineRef.current?.kill();

    const exitTween = gsap.to(deckNode, {
      x: DOSSIER_MOTION.deckExitOffset,
      opacity: 0,
      filter: `blur(${DOSSIER_MOTION.deckExitBlur}px)`,
      scale: 0.975,
      duration: DOSSIER_MOTION.deckExitDuration,
      ease: "power3.inOut",
      overwrite: true,
      onComplete: () => {
        setDisplayedTab(pendingTabRef.current);
      },
    });

    deckTimelineRef.current = gsap.timeline();
    deckTimelineRef.current.add(exitTween, 0);

    return () => {
      exitTween.kill();
    };
  }, [activeTab, displayedTab]);

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
  }, [displayedTab]);

  useEffect(() => {
    const panelTargets = [
      briefClusterRef.current,
      rightClusterRef.current,
      stageCaptionRef.current,
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

  const renderActiveDeck = () => {
    if (!activePanel.data) {
      return null;
    }

    switch (displayedTab) {
      case "overview":
        return overview.data ? <OverviewDeck data={overview.data} /> : null;
      case "competency":
        return competency.data ? (
          <CompetencyDeck
            data={competency.data.dimensionScores}
            onSelectDimension={setSelectedDimensionId}
            selectedDimensionId={selectedDimensionId}
          />
        ) : null;
      case "kpt":
        return kpt.data ? <KptDeck data={kpt.data} /> : null;
      case "cases":
        return cases.data ? <CasesDeck data={cases.data} /> : null;
      case "journey":
        return journey.data ? <JourneyDeck data={journey.data} /> : null;
      default:
        return null;
    }
  };

  return (
    <main
      className="relative min-h-screen overflow-hidden dossier-chamber-bg xl:flex xl:h-dvh xl:flex-col"
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

      <div className="relative z-10 mx-auto max-w-[1880px] px-4 pb-5 pt-3 md:px-6 xl:flex-1 xl:min-h-0 xl:w-full xl:overflow-hidden xl:pb-4">
        <div className="flex flex-col gap-3 xl:h-full xl:min-h-0 xl:flex-row xl:items-stretch xl:gap-2">
          {briefViewModel ? (
            <div
              className="xl:flex xl:h-full xl:items-start"
              ref={briefClusterRef}
            >
              <LeftBriefPanel brief={briefViewModel} />
            </div>
          ) : null}

          <section className="relative xl:h-full xl:min-h-0 xl:w-[46%] xl:pt-3">
            <CharacterStage
              confidence={confidence}
              isFocusMode={isEvidenceOpen}
              status={analysisStatus}
            />
            <div
              className="mt-[-1.5rem] flex items-center justify-between gap-3 px-3"
              ref={stageCaptionRef}
            >
              <div>
                <p
                  style={{
                    fontSize: TYPO.eyebrow.fontSize,
                    lineHeight: TYPO.eyebrow.lineHeight,
                    letterSpacing: TYPO.eyebrow.letterSpacing,
                    color: CONTRAST.textTertiary,
                  }}
                >
                  Hero Presence
                </p>
                <p
                  className="mt-1"
                  style={{
                    fontSize: TYPO.heroCaption.fontSize,
                    lineHeight: TYPO.heroCaption.lineHeight,
                    color: CONTRAST.textSecondary,
                  }}
                >
                  Free-standing stage, aura-first silhouette, and linked
                  attribute pressure.
                </p>
              </div>
              <div className="text-right">
                <p
                  style={{
                    fontSize: TYPO.eyebrow.fontSize,
                    lineHeight: TYPO.eyebrow.lineHeight,
                    letterSpacing: TYPO.eyebrow.letterSpacing,
                    color: CONTRAST.textTertiary,
                  }}
                >
                  Confidence
                </p>
                <p
                  className="text-xl font-semibold"
                  style={{
                    fontSize: TYPO.valueLg.fontSize,
                    lineHeight: TYPO.valueLg.lineHeight,
                    letterSpacing: TYPO.valueLg.letterSpacing,
                    color: CONTRAST.signalBright,
                  }}
                >
                  {Math.round(confidence * 100)}%
                </p>
              </div>
            </div>
          </section>

          <section
            className="relative xl:h-full xl:min-h-0 xl:w-[40%] xl:min-w-[480px] xl:pt-3"
            ref={rightClusterRef}
          >
            <div className="dossier-scroll xl:h-full xl:min-h-0 xl:overflow-x-hidden xl:overflow-y-auto xl:pr-2 xl:overscroll-contain">
              <div className="mb-3 xl:sticky xl:top-0 xl:z-20 xl:mb-2 xl:bg-[linear-gradient(180deg,rgba(6,13,21,0.96),rgba(6,13,21,0.82)_72%,transparent)] xl:pb-3">
                <DossierTabs activeTab={activeTab} onTabChange={setActiveTab} />
              </div>

              <div
                className="relative rounded-[24px] border px-5 pb-5 pt-4 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-xl"
                style={{
                  borderColor: DOSSIER_COLORS.panelBorderStrong,
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.025))",
                  boxShadow: `0 26px 84px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06), 0 0 1px rgba(63,211,255,0.1)`,
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
                  <div className="mb-3">
                    <TrustStrip
                      onOpenReview={openReview}
                      trust={trustViewModel}
                    />
                  </div>
                ) : null}

                <div className="overflow-x-hidden" ref={deckMotionRef}>
                  <div className="border-b border-white/6 pb-3">
                    <p
                      style={{
                        fontSize: TYPO.eyebrow.fontSize,
                        lineHeight: TYPO.eyebrow.lineHeight,
                        letterSpacing: TYPO.eyebrow.letterSpacing,
                        color: CONTRAST.textTertiary,
                      }}
                    >
                      {ACTIVE_PANEL_COPY[displayedTab].eyebrow}
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
                          {ACTIVE_PANEL_COPY[displayedTab].title}
                        </h2>
                        <p
                          className="mt-1.5 max-w-xl"
                          style={{
                            fontSize: TYPO.bodySm.fontSize,
                            lineHeight: TYPO.bodySm.lineHeight,
                            color: CONTRAST.textSecondary,
                          }}
                        >
                          {ACTIVE_PANEL_COPY[displayedTab].description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3.5">
                    {activePanel.isLoading ? (
                      <DossierSurfaceSkeleton />
                    ) : (
                      renderActiveDeck()
                    )}
                  </div>
                </div>

                <AnalysisLauncher
                  analysisStatus={analysisStatus}
                  onOpenEvidence={openEvidence}
                />
              </div>
            </div>
          </section>
        </div>
      </div>

      <EvidenceDrawer
        isOpen={isEvidenceOpen}
        onClose={closeEvidence}
        selectedDimensionId={selectedDimensionId}
      />
      <ReviewOverlay
        isOpen={isReviewOpen}
        onClose={closeReview}
        selectedDimensionId={selectedDimensionId}
      />
    </main>
  );
};
