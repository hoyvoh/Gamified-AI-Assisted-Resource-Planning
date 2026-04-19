"use client";

import Link from "next/link";

import { AnalysisChamberHeroSpotlight } from "@/features/analysis-chamber/components/analysis-chamber-hero-spotlight";
import {
  useAnalysisChamberOverviewData,
  useAnalysisChamberShellData,
} from "@/features/analysis-chamber/hooks/use-analysis-chamber-shell-data";
import { buildAnalysisChamberRouteHref } from "@/features/analysis-chamber/lib/analysis-chamber-route-links";
import {
  ANALYSIS_CHAMBER_SHELL_PALETTE as palette,
  DIMENSION_LABELS,
} from "@/features/analysis-chamber/lib/analysis-chamber-shell.constants";
import type { ChamberCategoryScoreResponse } from "@/features/analysis-chamber/api/analysis-chamber-api.types";

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

const getFocusCategory = (categories: ChamberCategoryScoreResponse[]) =>
  [...categories].sort((left, right) => {
    const leftIncluded = left.included_dimensions.length;
    const rightIncluded = right.included_dimensions.length;

    if (rightIncluded !== leftIncluded) {
      return rightIncluded - leftIncluded;
    }

    return right.confidence_score - left.confidence_score;
  })[0] ?? null;

const getCoverageLabel = (categories: ChamberCategoryScoreResponse[]) => {
  const included = categories.reduce(
    (total, category) => total + category.included_dimensions.length,
    0,
  );
  const excluded = categories.reduce(
    (total, category) => total + category.excluded_dimensions.length,
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

const getSummaryText = ({
  profileSummary,
  growthJourneySummary,
  categories,
  isCompleted,
}: {
  profileSummary: string | null | undefined;
  growthJourneySummary: string | null | undefined;
  categories: ChamberCategoryScoreResponse[];
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

  if (focusCategory.included_dimensions.length === 0) {
    return `The record leans toward ${getCategoryLabel(
      focusCategory.category_id,
    )}, but the evidence is still too sparse to make that reading hold.`;
  }

  return `Early evidence clusters around ${getCategoryLabel(
    focusCategory.category_id,
  )}, and that is the cleanest lane to open next.`;
};

const getGrowthPathLabel = ({
  currentGrowthPath,
  focusCategory,
  isCompleted,
}: {
  currentGrowthPath: string | null | undefined;
  focusCategory: ChamberCategoryScoreResponse | null;
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

  return focusCategory.included_dimensions.length > 0
    ? `Advance ${getCategoryLabel(focusCategory.category_id)}`
    : `Open ${getCategoryLabel(focusCategory.category_id)} first`;
};

const getReadinessLabel = ({
  confidence,
  isCompleted,
  categories,
}: {
  confidence: number | null | undefined;
  isCompleted: boolean;
  categories: ChamberCategoryScoreResponse[];
}) => {
  if (confidence !== null && confidence !== undefined && confidence > 0) {
    return `${Math.round(confidence * 100)}% confidence`;
  }

  const included = categories.reduce(
    (total, category) => total + category.included_dimensions.length,
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
  focusCategory: ChamberCategoryScoreResponse | null;
  isCompleted: boolean;
}) => {
  if ((confidence ?? 0) >= 0.75) {
    return "This chamber can now name the hero with conviction.";
  }

  if ((confidence ?? 0) > 0.25) {
    return "A clearer working profile is starting to emerge.";
  }

  if (focusCategory) {
    return `${getCategoryLabel(
      focusCategory.category_id,
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
  focusCategory: ChamberCategoryScoreResponse | null;
  coverageLabel: string;
  isCompleted: boolean;
}) => {
  if (!focusCategory) {
    return isCompleted
      ? "The archive is active, but no dominant reading has taken shape yet."
      : "The hero is still emerging while the chamber gathers enough signal.";
  }

  if (focusCategory.included_dimensions.length === 0) {
    return `${getCategoryLabel(
      focusCategory.category_id,
    )} is the leading lane so far, but it still needs stronger proof.`;
  }

  return coverageLabel;
};

export const OverviewStageShell = ({ memberId }: { memberId: string }) => {
  const overview = useAnalysisChamberOverviewData(memberId);
  const shell = useAnalysisChamberShellData(memberId);
  const categories = overview.data?.category_scores ?? [];
  const focusCategory = getFocusCategory(categories);
  const isCompleted = shell.data?.analysis_status === "completed";
  const realConfidence = overview.data?.overall_confidence ?? null;
  const confidence = realConfidence ?? 0;
  const memberName = shell.data?.member.display_name ?? "Analysis Chamber";
  const roleName = shell.data?.role_name ?? "Role pending";
  const teamName = shell.data?.team_name ?? "Team pending";
  const status = shell.data?.analysis_status ?? "not_analyzed";
  const summaryText = getSummaryText({
    profileSummary: overview.data?.profile_summary,
    growthJourneySummary: overview.data?.growth_journey_summary,
    categories,
    isCompleted,
  });
  const growthPathLabel = getGrowthPathLabel({
    currentGrowthPath: overview.data?.current_growth_path,
    focusCategory,
    isCompleted,
  });
  const readinessLabel = getReadinessLabel({
    confidence: overview.data?.overall_confidence,
    isCompleted,
    categories,
  });
  const headline = getHeadline({
    confidence: overview.data?.overall_confidence,
    focusCategory,
    isCompleted,
  });
  const fairnessNotes =
    overview.data?.fairness_notes.filter(Boolean).slice(0, 3) ?? [];
  const strengthDimIds = overview.data?.top_strength_dimension_ids ?? [];
  const growthDimIds = overview.data?.top_growth_dimension_ids ?? [];
  const archetypeBadge = overview.data?.current_growth_path ?? null;
  const categoryTarget =
    focusCategory?.category_id ?? categories[0]?.category_id ?? null;
  const coverageLabel = getCoverageLabel(categories);
  const heroCaption = getHeroCaption({
    focusCategory,
    coverageLabel,
    isCompleted,
  });

  return (
    <section className="relative h-full overflow-hidden">
      {/* Atmosphere glow — between columns */}
      <div
        className="pointer-events-none absolute inset-x-[32%] top-8 h-52 rounded-full blur-3xl"
        style={{ background: "rgba(200,150,30,0.07)" }}
      />

      <div className="relative grid h-full lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        {/* ── Left column: headline · CTAs · signal strip ── */}
        <div className="dossier-scroll flex h-full flex-col gap-5 px-6 py-6 md:px-8 xl:px-10">
          {/* Headline block */}
          <div>
            {/* Archetype badge — prominent, status-gated */}
            {archetypeBadge ? (
              <div
                className="mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5"
                style={{
                  borderColor: "rgba(255,149,0,0.4)",
                  background:
                    "linear-gradient(135deg, rgba(255,149,0,0.12), rgba(255,149,0,0.06))",
                  color: palette.gold,
                  boxShadow: "0 0 12px rgba(255,149,0,0.15)",
                }}
              >
                <span className="text-[11px]">◆</span>
                <span className="font-display text-[10px] uppercase tracking-[0.18em]">
                  {archetypeBadge}
                </span>
              </div>
            ) : null}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em]"
                style={{
                  borderColor: "rgba(154,171,184,0.3)",
                  background: "rgba(255,255,255,0.04)",
                  color: palette.silver,
                }}
              >
                {getCategoryLabel(categoryTarget)}
              </span>
            </div>
            <h1
              className="mt-3 font-display text-[1rem] tracking-[0.03em] leading-[1.45] md:text-[1.08rem] xl:text-[1.16rem]"
              style={{ color: palette.ink }}
            >
              {headline}
            </h1>
            {/* Strength + Growth dimension chips — above summary as context setter */}
            {strengthDimIds.length > 0 || growthDimIds.length > 0 ? (
              <div className="mt-3 space-y-2">
                {strengthDimIds.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className="shrink-0 font-display text-[9px] uppercase tracking-[0.14em]"
                      style={{ color: "rgba(74,138,90,0.8)" }}
                    >
                      Strengths
                    </span>
                    {strengthDimIds.slice(0, 4).map((id) => (
                      <span
                        key={id}
                        className="rounded-full border px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.1em]"
                        style={{
                          borderColor: "rgba(42,106,58,0.4)",
                          background: "rgba(42,106,58,0.1)",
                          color: palette.vertLight,
                        }}
                      >
                        {DIMENSION_LABELS[id] ?? id.replaceAll("_", " ")}
                      </span>
                    ))}
                  </div>
                )}
                {growthDimIds.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className="shrink-0 font-display text-[9px] uppercase tracking-[0.14em]"
                      style={{ color: "rgba(74,122,186,0.8)" }}
                    >
                      Growth areas
                    </span>
                    {growthDimIds.slice(0, 4).map((id) => (
                      <span
                        key={id}
                        className="rounded-full border px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.1em]"
                        style={{
                          borderColor: "rgba(42,90,154,0.4)",
                          background: "rgba(42,90,154,0.1)",
                          color: palette.azureLight,
                        }}
                      >
                        {DIMENSION_LABELS[id] ?? id.replaceAll("_", " ")}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
            <p
              className="font-body-serif mt-3 text-sm leading-7"
              style={{ color: palette.inkMuted }}
            >
              {summaryText}
            </p>
          </div>

          {/* CTAs */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <Link
              className="group rounded-xl border px-5 py-5 transition-all duration-200 hover:-translate-y-0.5 border-[rgba(200,150,30,0.18)] bg-[rgba(255,255,255,0.03)] shadow-[inset_0_1px_0_rgba(200,150,30,0.08),inset_0_-1px_0_rgba(0,0,0,0.3),0_4px_16px_rgba(0,0,0,0.2)] hover:border-[#ff9500] hover:bg-[linear-gradient(180deg,rgba(200,150,30,0.24),rgba(200,150,30,0.1))] hover:shadow-[inset_0_1px_0_rgba(200,150,30,0.22),inset_0_-2px_0_rgba(0,0,0,0.45),0_18px_38px_rgba(200,150,30,0.24)]"
              href={buildAnalysisChamberRouteHref(memberId, "competency", {
                category: categoryTarget,
              })}
              style={{ color: palette.ink }}
            >
              <p
                className="font-display text-[10px] uppercase tracking-[0.2em] transition-colors duration-200"
                style={{ color: "rgba(154,171,184,0.65)" }}
              >
                Primary chamber entry
              </p>
              <p className="mt-2 font-display text-[0.95rem] uppercase tracking-widest group-hover:text-[#ffb84d] transition-colors duration-200">
                Enter competency chamber
              </p>
              <p
                className="font-body-serif mt-2 text-xs leading-5"
                style={{ color: palette.inkSoft }}
              >
                Open the leading lane first and inspect where the evidence wants
                to settle.
              </p>
            </Link>
            <Link
              className="group rounded-xl border px-5 py-4 transition-all duration-200 hover:-translate-y-0.5 border-[rgba(200,150,30,0.18)] bg-[rgba(255,255,255,0.03)] shadow-[inset_0_1px_0_rgba(200,150,30,0.08),inset_0_-1px_0_rgba(0,0,0,0.3),0_4px_16px_rgba(0,0,0,0.2)] hover:border-[#ff9500] hover:bg-[linear-gradient(180deg,rgba(200,150,30,0.24),rgba(200,150,30,0.1))] hover:shadow-[inset_0_1px_0_rgba(200,150,30,0.22),inset_0_-2px_0_rgba(0,0,0,0.45),0_18px_38px_rgba(200,150,30,0.24)]"
              href={buildAnalysisChamberRouteHref(memberId, "journey")}
              style={{ color: palette.ink }}
            >
              <p
                className="font-display text-[10px] uppercase tracking-[0.18em] transition-colors duration-200 group-hover:text-[#ffb84d]"
                style={{ color: palette.gold }}
              >
                Route ahead
              </p>
              <p className="mt-2 font-display text-sm uppercase tracking-[0.08em] group-hover:text-[#ffe8c0] transition-colors duration-200">
                Survey journey map
              </p>
              <p
                className="font-body-serif mt-2 text-xs leading-5 transition-colors duration-200 group-hover:text-[#ffb84d]"
                style={{ color: palette.inkSoft }}
              >
                Read the path as a sequence of milestones instead of a fixed
                score.
              </p>
            </Link>
            <Link
              className="group rounded-xl border px-5 py-4 transition-all duration-200 hover:-translate-y-0.5 border-[rgba(200,150,30,0.18)] bg-[rgba(255,255,255,0.03)] shadow-[inset_0_1px_0_rgba(200,150,30,0.08),inset_0_-1px_0_rgba(0,0,0,0.3),0_4px_16px_rgba(0,0,0,0.2)] hover:border-[#ff9500] hover:bg-[linear-gradient(180deg,rgba(200,150,30,0.24),rgba(200,150,30,0.1))] hover:shadow-[inset_0_1px_0_rgba(200,150,30,0.22),inset_0_-2px_0_rgba(0,0,0,0.45),0_18px_38px_rgba(200,150,30,0.24)]"
              href={buildAnalysisChamberRouteHref(memberId, "kpt")}
              style={{ color: palette.ink }}
            >
              <p
                className="font-display text-[10px] uppercase tracking-[0.18em] transition-colors duration-200 group-hover:text-[#ffb84d]"
                style={{ color: palette.gold }}
              >
                Council reading
              </p>
              <p className="mt-2 font-display text-sm uppercase tracking-[0.08em] group-hover:text-[#ffe8c0] transition-colors duration-200">
                Open council notes
              </p>
              <p
                className="font-body-serif mt-2 text-xs leading-5 transition-colors duration-200 group-hover:text-[#ffb84d]"
                style={{ color: palette.inkSoft }}
              >
                Move from profile reading into keep, problem, and try guidance.
              </p>
            </Link>
          </div>

          {/* Signal strip — always visible, no scroll needed */}
          <div className="flex flex-wrap gap-3">
            <div
              className="rounded-lg border px-4 py-2.5"
              style={{
                borderColor: "rgba(200,150,30,0.2)",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              <p
                className="text-[10px] uppercase tracking-[0.12em]"
                style={{ color: palette.inkMuted }}
              >
                Growth path
              </p>
              <p
                className="mt-1 font-display text-xs uppercase tracking-[0.08em]"
                style={{ color: palette.inkSoft }}
              >
                {growthPathLabel}
              </p>
            </div>
            <div
              className="rounded-lg border px-4 py-2.5"
              style={{
                borderColor: "rgba(200,150,30,0.2)",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <p
                  className="text-[10px] uppercase tracking-[0.12em]"
                  style={{ color: palette.inkMuted }}
                >
                  Readiness
                </p>
                {realConfidence != null && (
                  <span
                    className="font-display text-[10px]"
                    style={{ color: palette.goldLight }}
                  >
                    {Math.round(realConfidence * 100)}%
                  </span>
                )}
              </div>
              {/* Diegetic rune progress bar — confidence encoded as glowing amber fill */}
              <div
                className="relative mt-2 h-1.5 overflow-hidden rounded-full"
                style={{
                  background: "rgba(200,150,30,0.1)",
                  border: "1px solid rgba(200,150,30,0.14)",
                }}
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.round(confidence * 100)}%`,
                    background:
                      "linear-gradient(90deg, #8b6914, #c8961e, #e8b840)",
                    boxShadow:
                      "0 0 8px rgba(200,150,30,0.5), 0 0 16px rgba(200,150,30,0.2)",
                  }}
                />
                {/* Quintile tick marks */}
                {[25, 50, 75].map((pct) => (
                  <div
                    key={pct}
                    className="absolute inset-y-0 w-px"
                    style={{ left: `${pct}%`, background: "rgba(0,0,0,0.35)" }}
                  />
                ))}
              </div>
              <p
                className="font-body-serif mt-1.5 text-[10px] leading-4 italic"
                style={{ color: palette.inkMuted }}
              >
                {readinessLabel}
              </p>
            </div>
            <div
              className="rounded-lg border px-4 py-2.5"
              style={{
                borderColor: "rgba(200,150,30,0.2)",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              <p
                className="text-[10px] uppercase tracking-[0.12em]"
                style={{ color: palette.inkMuted }}
              >
                Focus
              </p>
              <p
                className="mt-1 font-display text-xs uppercase tracking-[0.08em]"
                style={{ color: palette.inkSoft }}
              >
                {getCategoryLabel(categoryTarget)}
              </p>
            </div>
          </div>

          {/* Fairness banner */}
          {fairnessNotes.length > 0 ? (
            <div
              className="rounded-lg border px-4 py-3"
              style={{
                borderColor: "rgba(255,149,0,0.3)",
                background: "rgba(255,149,0,0.06)",
              }}
            >
              <div className="flex items-start gap-2.5">
                <span
                  className="mt-0.5 shrink-0 text-sm"
                  style={{ color: palette.ember }}
                >
                  ⚑
                </span>
                <div className="space-y-1">
                  {fairnessNotes.map((note) => (
                    <p
                      key={note}
                      className="font-body-serif text-xs leading-5"
                      style={{ color: palette.inkSoft }}
                    >
                      {note}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* ── Right column: hero character ── */}
        <div
          className="relative hidden lg:block"
          style={{ borderLeft: "1px solid rgba(200,150,30,0.1)" }}
        >
          {/* Ground shadow */}
          <div
            className="pointer-events-none absolute inset-x-[12%] bottom-20 h-10 rounded-full blur-2xl"
            style={{ background: "rgba(0,0,0,0.38)" }}
          />

          <AnalysisChamberHeroSpotlight
            confidence={confidence}
            status={status}
          />

          {/* Fade + name */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-[#1e1712] via-[#1e1712e8] to-transparent" />
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
