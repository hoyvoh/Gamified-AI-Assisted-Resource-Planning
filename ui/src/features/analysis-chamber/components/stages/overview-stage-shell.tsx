"use client";

import { AnalysisChamberHeroSpotlight } from "@/features/analysis-chamber/components/analysis-chamber-hero-spotlight";
import { OverviewActionGrid } from "@/features/analysis-chamber/components/stages/overview/overview-action-grid";
import { OverviewFairnessBanner } from "@/features/analysis-chamber/components/stages/overview/overview-fairness-banner";
import { OverviewHeadlinePanel } from "@/features/analysis-chamber/components/stages/overview/overview-headline-panel";
import { OverviewInlineMetrics } from "@/features/analysis-chamber/components/stages/overview/overview-inline-metrics";
import {
  useAnalysisChamberOverviewData,
  useAnalysisChamberShellData,
} from "@/features/analysis-chamber/hooks/use-analysis-chamber-shell-data";
import {
  ANALYSIS_CHAMBER_SHELL_PALETTE as palette,
  OVERVIEW_TOKENS,
} from "@/features/analysis-chamber/lib/analysis-chamber-shell.constants";
import type { ChamberCategoryScore } from "@/features/analysis-chamber/api/analysis-chamber-api.view-models";

const CATEGORY_LABELS: Record<string, string> = {
  core_technical_execution: "Core technical execution",
  technical_depth_breadth: "Technical depth and breadth",
  engineering_mindset: "Engineering mindset",
  collaboration_growth: "Collaboration and growth",
};

const getCategoryLabel = (categoryId: string | null | undefined) => {
  if (!categoryId) {
    return "Chamber focus pending";
  }

  return CATEGORY_LABELS[categoryId] ?? categoryId.replaceAll("_", " ");
};

const getFocusCategory = (categories: ChamberCategoryScore[]) =>
  [...categories].sort((left, right) => {
    const leftIncluded = left.includedDimensions.length;
    const rightIncluded = right.includedDimensions.length;

    if (rightIncluded !== leftIncluded) {
      return rightIncluded - leftIncluded;
    }

    return right.confidenceScore - left.confidenceScore;
  })[0] ?? null;

const getCoverageLabel = (categories: ChamberCategoryScore[]) => {
  const included = categories.reduce(
    (total, category) => total + category.includedDimensions.length,
    0,
  );
  const excluded = categories.reduce(
    (total, category) => total + category.excludedDimensions.length,
    0,
  );

  if (included === 0 && excluded === 0) {
    return "No dimensional evidence has landed in the chamber yet.";
  }

  if (included === 0) {
    return `${excluded} dimensions were observed, but none are strong enough for scored inclusion yet.`;
  }

  return `${included} dimensions are actively contributing, while ${excluded} remain outside scoring coverage.`;
};

const getActiveDimensionCount = (categories: ChamberCategoryScore[]) =>
  categories.reduce(
    (total, category) => total + category.includedDimensions.length,
    0,
  );

const getOutsideCoverageCount = (categories: ChamberCategoryScore[]) =>
  categories.reduce(
    (total, category) => total + category.excludedDimensions.length,
    0,
  );

const getSummaryText = ({
  profileSummary,
  growthJourneySummary,
  categories,
  isCompleted,
}: {
  profileSummary: string | null | undefined;
  growthJourneySummary: string | null | undefined;
  categories: ChamberCategoryScore[];
  isCompleted: boolean;
}) => {
  if (profileSummary) {
    return profileSummary;
  }

  if (growthJourneySummary) {
    return growthJourneySummary;
  }

  const focusCategory = getFocusCategory(categories);
  if (!focusCategory) {
    return isCompleted
      ? "The chamber is open, but the record is still too thin to resolve a clear reading."
      : "The chamber is still gathering enough signal to reveal this hero cleanly.";
  }

  if (focusCategory.includedDimensions.length === 0) {
    return `The record leans toward ${getCategoryLabel(
      focusCategory.categoryId,
    )}, but the evidence is still too sparse to make that reading hold.`;
  }

  return `Early evidence clusters around ${getCategoryLabel(
    focusCategory.categoryId,
  )}, and that is the cleanest lane to open next.`;
};

const getGrowthPathLabel = ({
  currentGrowthPath,
  focusCategory,
  isCompleted,
}: {
  currentGrowthPath: string | null | undefined;
  focusCategory: ChamberCategoryScore | null;
  isCompleted: boolean;
}) => {
  if (currentGrowthPath) {
    return currentGrowthPath;
  }

  if (!focusCategory) {
    return isCompleted
      ? "Awaiting stronger evidence alignment"
      : "Analysis still gathering";
  }

  return focusCategory.includedDimensions.length > 0
    ? `Advance ${getCategoryLabel(focusCategory.categoryId)}`
    : `Open ${getCategoryLabel(focusCategory.categoryId)} first`;
};

const getReadinessLabel = ({
  confidence,
  isCompleted,
  categories,
}: {
  confidence: number | null | undefined;
  isCompleted: boolean;
  categories: ChamberCategoryScore[];
}) => {
  if (confidence !== null && confidence !== undefined && confidence > 0) {
    return `${Math.round(confidence * 100)}% confidence`;
  }

  const included = categories.reduce(
    (total, category) => total + category.includedDimensions.length,
    0,
  );

  if (included > 0) {
    return "Confidence forming from partial evidence";
  }

  return isCompleted
    ? "Coverage is still too thin for a reliable confidence read"
    : "Confidence still forming";
};

const getHeadline = ({
  confidence,
  focusCategory,
  isCompleted,
}: {
  confidence: number | null | undefined;
  focusCategory: ChamberCategoryScore | null;
  isCompleted: boolean;
}) => {
  if ((confidence ?? 0) >= 0.75) {
    return "A reliable growth profile has emerged.";
  }

  if ((confidence ?? 0) > 0.25) {
    return "A clearer working profile is starting to emerge.";
  }

  if (focusCategory) {
    return `${getCategoryLabel(
      focusCategory.categoryId,
    )} is the strongest reading in the chamber right now.`;
  }

  return isCompleted
    ? "The chamber is open, but the record still needs stronger proof."
    : "The chamber is still gathering enough signal to reveal the hero.";
};

const getHeroCaption = ({
  focusCategory,
  coverageLabel,
  isCompleted,
}: {
  focusCategory: ChamberCategoryScore | null;
  coverageLabel: string;
  isCompleted: boolean;
}) => {
  if (!focusCategory) {
    return isCompleted
      ? "The archive is active, but no dominant reading has taken shape yet."
      : "The hero is still emerging while the chamber gathers enough signal.";
  }

  if (focusCategory.includedDimensions.length === 0) {
    return `${getCategoryLabel(
      focusCategory.categoryId,
    )} is the leading lane so far, but it still needs stronger proof.`;
  }

  return coverageLabel;
};

export const OverviewStageShell = ({ memberId }: { memberId: string }) => {
  const overview = useAnalysisChamberOverviewData(memberId);
  const shell = useAnalysisChamberShellData(memberId);
  const categories = overview.data?.categoryScores ?? [];
  const focusCategory = getFocusCategory(categories);
  const isCompleted = shell.data?.analysisStatus === "completed";
  const realConfidence = overview.data?.overallConfidence ?? null;
  const confidence = realConfidence ?? 0;
  const activeDimensionCount = getActiveDimensionCount(categories);
  const outsideCoverageCount = getOutsideCoverageCount(categories);
  const memberName = shell.data?.member.displayName ?? "Analysis Chamber";
  const roleName = shell.data?.roleName ?? "Role pending";
  const teamName = shell.data?.teamName ?? "Team pending";
  const status = shell.data?.analysisStatus ?? "not_analyzed";
  const summaryText = getSummaryText({
    profileSummary: overview.data?.profileSummary,
    growthJourneySummary: overview.data?.growthJourneySummary,
    categories,
    isCompleted,
  });
  const growthPathLabel = getGrowthPathLabel({
    currentGrowthPath: overview.data?.currentGrowthPath,
    focusCategory,
    isCompleted,
  });
  const readinessLabel = getReadinessLabel({
    confidence: overview.data?.overallConfidence,
    isCompleted,
    categories,
  });
  const headline = getHeadline({
    confidence: overview.data?.overallConfidence,
    focusCategory,
    isCompleted,
  });
  const fairnessNotes = overview.data?.fairnessNotes.filter(Boolean) ?? [];
  const strengthDimIds = overview.data?.topStrengthDimensionIds ?? [];
  const growthDimIds = overview.data?.topGrowthDimensionIds ?? [];
  const archetypeBadge = overview.data?.currentGrowthPath ?? null;
  const categoryTarget =
    focusCategory?.categoryId ?? categories[0]?.categoryId ?? null;
  const coverageLabel = getCoverageLabel(categories);
  const heroCaption = getHeroCaption({
    focusCategory,
    coverageLabel,
    isCompleted,
  });

  if (overview.isError) {
    return (
      <section className="relative flex h-full items-center justify-center overflow-hidden px-6 py-10 text-center">
        <div
          className="pointer-events-none absolute inset-x-[28%] top-14 h-52 rounded-full blur-3xl"
          style={{ background: OVERVIEW_TOKENS.errorAura }}
        />
        <div
          className="relative max-w-xl rounded-xl border px-6 py-6"
          style={{
            background: OVERVIEW_TOKENS.errorSurface,
            borderColor: OVERVIEW_TOKENS.errorBorder,
            color: palette.ink,
          }}
        >
          <p
            className="font-display text-[10px] uppercase tracking-[0.18em]"
            style={{ color: palette.crimson }}
          >
            Overview unavailable
          </p>
          <h1 className="mt-3 font-display text-lg uppercase tracking-[0.08em]">
            The chamber could not load this reading.
          </h1>
          <p
            className="font-body-serif mt-3 text-sm leading-7"
            style={{ color: palette.inkMuted }}
          >
            Profile overview data failed to resolve. The shell is still active,
            but this mode needs another read from the archive.
          </p>
          <button
            className="mt-5 rounded-md border px-4 py-2 font-display text-[10px] uppercase tracking-[0.16em] transition enabled:hover:-translate-y-0.5 disabled:opacity-50"
            disabled={overview.isFetching}
            onClick={() => void overview.refetch()}
            style={{
              borderColor: OVERVIEW_TOKENS.retryBorder,
              color: palette.gold,
            }}
            type="button"
          >
            Retry overview
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-full overflow-hidden">
      {/* Atmosphere glow — between columns */}
      <div
        className="pointer-events-none absolute inset-x-[32%] top-8 h-52 rounded-full blur-3xl"
        style={{ background: OVERVIEW_TOKENS.stageAura }}
      />

      <div className="relative grid h-full lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        {/* ── Left column: headline · CTAs · signal strip ── */}
        <div className="dossier-scroll flex h-full flex-col px-6 py-7 md:px-8 md:py-8 xl:px-12 xl:py-10">
          <div className="max-w-5xl">
            <OverviewHeadlinePanel
              archetypeBadge={archetypeBadge ?? growthPathLabel}
              categoryLabel={getCategoryLabel(categoryTarget)}
              growthDimensionIds={growthDimIds}
              headline={headline}
              strengthDimensionIds={strengthDimIds}
              summaryText={summaryText}
            />
            <div className="mt-6">
              <OverviewInlineMetrics
                activeDimensionCount={activeDimensionCount}
                confidenceLabel={readinessLabel}
                outsideCoverageCount={outsideCoverageCount}
              />
            </div>
            <OverviewActionGrid
              categoryTarget={categoryTarget}
              memberId={memberId}
            />
            <OverviewFairnessBanner notes={fairnessNotes} />
          </div>
        </div>

        {/* ── Right column: hero character ── */}
        <div
          className="relative hidden lg:block"
          style={{ borderLeft: `1px solid ${OVERVIEW_TOKENS.sideDivider}` }}
        >
          {/* Ground shadow */}
          <div
            className="pointer-events-none absolute inset-x-[12%] bottom-20 h-10 rounded-full blur-2xl"
            style={{ background: OVERVIEW_TOKENS.groundShadow }}
          />

          <AnalysisChamberHeroSpotlight
            confidence={confidence}
            status={status}
          />

          {/* Fade + name */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
            style={{ background: OVERVIEW_TOKENS.portraitFade }}
          />
          <div className="absolute inset-x-0 bottom-5 z-10 text-center">
            <p
              className="font-display text-[1.6rem] uppercase tracking-[0.14em] md:text-[1.9rem]"
              style={{ color: palette.ink }}
            >
              {memberName}
            </p>
            <p
              className="font-body-serif mt-1 text-sm italic"
              style={{ color: palette.inkMuted }}
            >
              {roleName} | {teamName}
            </p>
            <p
              className="font-body-serif mx-auto mt-2 max-w-72 text-xs leading-6"
              style={{ color: palette.inkSoft }}
            >
              {heroCaption}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
