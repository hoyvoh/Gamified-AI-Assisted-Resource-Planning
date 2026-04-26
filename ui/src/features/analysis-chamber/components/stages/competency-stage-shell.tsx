"use client";

import React, { useEffect, useMemo, useState } from "react";

import type {
  ChamberCategoryScore,
  ChamberDimensionScore,
} from "@/features/analysis-chamber/api/analysis-chamber-api.view-models";
import { useAnalysisChamberCompetencyData } from "@/features/analysis-chamber/hooks/use-analysis-chamber-shell-data";
import { useAnalysisChamberRouteState } from "@/features/analysis-chamber/hooks/use-analysis-chamber-route-state";

import { ANALYSIS_CHAMBER_SHELL_PALETTE as palette } from "@/features/analysis-chamber/lib/analysis-chamber-shell.constants";
import { TIER_MASTER_GOLD, TIER_MASTER_PLATE_BG, TIER_ADVANCED_BRASS, TIER_ADVANCED_PLATE_BG, TIER_INTER_SILVER, TIER_INTER_PLATE_BG } from "@/features/analysis-chamber/lib/branch-tier-colors";
import { CompetencyRadarChart } from "@/features/analysis-chamber/components/competency-radar-chart";
import { BranchLattice } from "@/features/analysis-chamber/components/branch-lattice";
import type { BranchNodeData } from "@/features/analysis-chamber/components/branch-lattice";

const EMPTY_DIMENSION_SCORES: ChamberDimensionScore[] = [];
const EMPTY_CATEGORY_SCORES: ChamberCategoryScore[] = [];

const CATEGORY_LABELS: Record<string, string> = {
  core_technical_execution: "Core technical execution",
  technical_depth_breadth: "Technical depth and breadth",
  engineering_mindset: "Engineering mindset",
  collaboration_growth: "Collaboration and growth",
};

const CATEGORY_ACCENT = {
  core_technical_execution: {
    color: palette.gold,
    border: palette.gold,
    glow: "rgba(200,150,30,0.45)",
    bg: "linear-gradient(145deg, rgba(200,150,30,0.32), rgba(200,150,30,0.14))",
    centerBg:
      "radial-gradient(circle, rgba(200,150,30,0.22), rgba(200,150,30,0.07))",
    centerGlow: "0 16px 32px rgba(200,150,30,0.18)",
  },
  technical_depth_breadth: {
    color: palette.azureLight,
    border: palette.azure,
    glow: "rgba(42,90,154,0.4)",
    bg: "linear-gradient(145deg, rgba(42,90,154,0.28), rgba(42,90,154,0.12))",
    centerBg:
      "radial-gradient(circle, rgba(42,90,154,0.22), rgba(42,90,154,0.07))",
    centerGlow: "0 16px 32px rgba(42,90,154,0.18)",
  },
  engineering_mindset: {
    color: palette.emberLight,
    border: palette.ember,
    glow: "rgba(255,122,31,0.4)",
    bg: "linear-gradient(145deg, rgba(255,122,31,0.24), rgba(255,122,31,0.10))",
    centerBg:
      "radial-gradient(circle, rgba(255,122,31,0.20), rgba(255,122,31,0.06))",
    centerGlow: "0 16px 32px rgba(255,122,31,0.16)",
  },
  collaboration_growth: {
    color: palette.vertLight,
    border: palette.vert,
    glow: "rgba(42,106,58,0.4)",
    bg: "linear-gradient(145deg, rgba(42,106,58,0.28), rgba(42,106,58,0.12))",
    centerBg:
      "radial-gradient(circle, rgba(42,106,58,0.22), rgba(42,106,58,0.07))",
    centerGlow: "0 16px 32px rgba(42,106,58,0.18)",
  },
} as const;

type CategoryAccent = (typeof CATEGORY_ACCENT)[keyof typeof CATEGORY_ACCENT];
const DEFAULT_ACCENT: CategoryAccent = CATEGORY_ACCENT.core_technical_execution;
const getCategoryAccent = (
  categoryId: string | null | undefined,
): CategoryAccent => {
  const key = categoryId ?? "";
  return key in CATEGORY_ACCENT
    ? CATEGORY_ACCENT[key as keyof typeof CATEGORY_ACCENT]
    : DEFAULT_ACCENT;
};

const normalizeScoreToPercent = (score: number | null | undefined) => {
  if (score === null || score === undefined) {
    return null;
  }

  const percent = score <= 1 ? score * 100 : score <= 10 ? score * 10 : score;

  return Math.max(0, Math.min(100, Math.round(percent)));
};

const formatScore = (score: number | null | undefined) => {
  const normalizedScore = normalizeScoreToPercent(score);

  return normalizedScore === null ? "Unscored" : `${normalizedScore} / 100`;
};

const humanizeId = (value: string | null | undefined) => {
  if (!value) {
    return "Pending";
  }

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const getCategoryLabel = (categoryId: string | null | undefined) =>
  CATEGORY_LABELS[categoryId ?? ""] ?? humanizeId(categoryId);

const DIMENSION_SHORT_LABELS: Record<string, string> = {
  implementation_reliability: "Reliability",
  code_quality_discipline: "Code Quality",
  debugging_root_cause: "Debugging",
  careless_mistake_control: "Mistake Control",
  technical_ownership: "Ownership",
  technical_learning_adaptability: "Learning",
  backend_capability: "Backend",
  frontend_capability: "Frontend",
  devops_delivery_capability: "DevOps",
  system_integration_capability: "Integration",
  data_interface_handling: "Data Interface",
  architecture_exposure: "Architecture",
  quality_mindset: "Quality Mindset",
  performance_awareness: "Performance",
  security_awareness: "Security",
  maintainability_thinking: "Maintainability",
  risk_awareness: "Risk",
  decision_hygiene: "Decision Hygiene",
  problem_solving: "Problem Solving",
  self_management: "Self Management",
  horenso_reporting_discipline: "Horenso",
  user_first: "User First",
  collaboration: "Collaboration",
  mentoring_knowledge_support: "Mentoring",
  ai_leverage_ability: "AI Leverage",
};

const getDimensionShortLabel = (dimensionId: string) =>
  DIMENSION_SHORT_LABELS[dimensionId] ?? humanizeId(dimensionId);

const getMaturityTone = (maturityLevel: string) => {
  const normalized = maturityLevel.toLowerCase();

  if (normalized.includes("master")) {
    // Deep antique gold with blood-red soul — sovereign, legendary
    return {
      border: TIER_MASTER_GOLD,
      background: TIER_MASTER_PLATE_BG,
      text: TIER_MASTER_GOLD,
    };
  }

  if (normalized.includes("proficient") || normalized.includes("advanced")) {
    // Warm brass-gold — refined, earned
    return {
      border: TIER_ADVANCED_BRASS,
      background: TIER_ADVANCED_PLATE_BG,
      text: TIER_ADVANCED_BRASS,
    };
  }

  // Silver steel — nascent, unpolished
  return {
    border: TIER_INTER_SILVER,
    background: TIER_INTER_PLATE_BG,
    text: TIER_INTER_SILVER,
  };
};

const getSelectedDimensionFromScores = (
  dimensions: ChamberDimensionScore[],
  dimensionId: string | null,
) => {
  if (dimensions.length === 0) {
    return null;
  }

  if (dimensionId) {
    return (
      dimensions.find((dimension) => dimension.dimensionId === dimensionId) ??
      null
    );
  }

  return [...dimensions].sort((left, right) => {
    const leftScore = left.opportunityScore ?? left.normalizedScore ?? 0;
    const rightScore = right.opportunityScore ?? right.normalizedScore ?? 0;

    return rightScore - leftScore;
  })[0];
};

const getFallbackDimensionIds = (
  focusCategory: ChamberCategoryScore | null,
) => {
  if (!focusCategory) {
    return [];
  }

  return [
    ...focusCategory.includedDimensions,
    ...focusCategory.excludedDimensions,
  ];
};

export const CompetencyStageShell = ({ memberId }: { memberId: string }) => {
  const { state, updateQuery } = useAnalysisChamberRouteState();
  const [selectedDimensionId, setSelectedDimensionId] = useState<string | null>(
    state.dimension,
  );
  const competency = useAnalysisChamberCompetencyData(memberId, state.category);
  const dimensions = competency.data?.dimensionScores ?? EMPTY_DIMENSION_SCORES;
  const categoryScores = competency.data?.categoryScores ?? EMPTY_CATEGORY_SCORES;
  const focusCategory = useMemo<ChamberCategoryScore | null>(
    () =>
      categoryScores.find(
        (category) => category.categoryId === state.category,
      ) ??
      categoryScores[0] ??
      null,
    [categoryScores, state.category],
  );

  useEffect(() => {
    if (state.dimension) {
      setSelectedDimensionId(state.dimension);
    }
  }, [state.dimension]);

  useEffect(() => {
    if (state.dimension || state.highlight) {
      updateQuery({ dimension: null, highlight: null });
    }
  }, [state.dimension, state.highlight, updateQuery]);

  const selectedDimension = useMemo(
    () => getSelectedDimensionFromScores(dimensions, selectedDimensionId),
    [dimensions, selectedDimensionId],
  );

  const focusAccent = getCategoryAccent(focusCategory?.categoryId);
  const hasMeasuredDimensions = dimensions.length > 0;
  const fallbackDimensionIds = useMemo(
    () => getFallbackDimensionIds(focusCategory),
    [focusCategory],
  );
  const selectedFallbackDimension =
    selectedDimensionId && fallbackDimensionIds.includes(selectedDimensionId)
      ? selectedDimensionId
      : (fallbackDimensionIds[0] ?? null);
  const activeDimensionId =
    selectedDimension?.dimensionId ?? selectedFallbackDimension;
  const activeDimensionLabel = humanizeId(activeDimensionId);
  const isReadingCategory = competency.isFetching && Boolean(competency.data);
  const radarData = categoryScores.slice(0, 4).map((cat) => ({
    categoryId: cat.categoryId,
    score: normalizeScoreToPercent(cat.score) ?? 0,
    fullMark: 100,
  }));
  const categoryDimensionIds = useMemo(
    () => new Set(getFallbackDimensionIds(focusCategory)),
    [focusCategory],
  );
  const branchNodes = useMemo<BranchNodeData[]>(() => {
    if (hasMeasuredDimensions) {
      return dimensions
        .filter((d) =>
          focusCategory ? categoryDimensionIds.has(d.dimensionId) : true,
        )
        .slice(0, 6)
        .map((dimension) => {
          const tone = getMaturityTone(dimension.maturityLevel);
          const score =
            dimension.normalizedScore !== null &&
            dimension.normalizedScore !== undefined
              ? Math.round(dimension.normalizedScore * 100)
              : null;
          return {
            id: dimension.dimensionId,
            label: humanizeId(dimension.dimensionId),
            shortLabel: getDimensionShortLabel(dimension.dimensionId),
            tier: dimension.maturityLevel,
            score,
            scored: true,
            positiveSignals: dimension.positiveSignals,
            negativeSignals: dimension.negativeSignals,
            mixedSignals: dimension.mixedSignals,
            totalSignals: dimension.totalSignals,
            summary:
              dimension.uiSummary ??
              dimension.explanationSummary ??
              null,
            confidenceScore: dimension.confidenceScore,
            confidenceLabel: dimension.confidenceLabel,
            opportunityScore: dimension.opportunityScore,
            opportunityLabel: dimension.opportunityLabel,
            deltaValue: dimension.deltaValue,
            deltaLabel: dimension.deltaLabel,
            limitationNotes: dimension.limitationNotes,
            toneColor: tone.text,
            toneBorder: tone.border,
            toneBackground: tone.background,
          };
        });
    }
    return fallbackDimensionIds.slice(0, 6).map((dimensionId) => ({
      id: dimensionId,
      label: humanizeId(dimensionId),
      shortLabel: getDimensionShortLabel(dimensionId),
      tier: "Awaiting scored inclusion",
      score: null,
      scored: false,
      positiveSignals: 0,
      negativeSignals: 0,
      mixedSignals: 0,
      summary: null,
      toneColor: palette.inkSoft,
      toneBorder: "rgba(154,171,184,0.45)",
      toneBackground: "rgba(255,255,255,0.08)",
    }));
  }, [
    hasMeasuredDimensions,
    dimensions,
    focusCategory,
    categoryDimensionIds,
    fallbackDimensionIds,
  ]);

  return (
    <section className="grid h-full gap-0 2xl:grid-cols-[1fr_320px]">
      <div className="dossier-scroll px-5 py-6 md:px-7">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs italic" style={{ color: palette.inkMuted }}>
            Focus category:
          </span>
          <span
            className="rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.12em]"
            style={{
              borderColor: focusAccent.border,
              color: focusAccent.color,
            }}
          >
            {getCategoryLabel(focusCategory?.categoryId)}
          </span>
          {activeDimensionId ? (
            <span
              className="rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.12em]"
              style={{ borderColor: palette.azure, color: palette.azure }}
            >
              {activeDimensionLabel}
            </span>
          ) : null}
        </div>

        <div className="mt-6 grid gap-5">
          <div
            className="relative rounded-[22px] border px-5 py-6 md:px-7"
            style={{
              borderColor: "rgba(200,150,30,0.25)",
              background:
                "radial-gradient(circle at 50% 45%, rgba(255,149,0,0.13), rgba(255,149,0,0.055) 42%, rgba(255,149,0,0.02) 72%, transparent 100%)",
              boxShadow: "inset 0 0 64px rgba(255,149,0,0.04)",
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">

              <div className="flex gap-2">
                {isReadingCategory ? (
                  <span
                    className="rounded-md border px-3 py-1 text-[10px] uppercase tracking-[0.14em]"
                    style={{
                      borderColor: "rgba(74,122,186,0.34)",
                      color: palette.azureLight,
                      background: "rgba(42,90,154,0.08)",
                    }}
                  >
                    Reading...
                  </span>
                ) : null}
                <span
                  className="rounded-md border px-3 py-1 text-[10px] uppercase tracking-[0.14em]"
                  style={{
                    borderColor: "rgba(255,149,0,0.34)",
                    color: palette.inkSoft,
                    background: "rgba(255,149,0,0.06)",
                  }}
                >
                  {formatScore(focusCategory?.score ?? null)}
                </span>
                <span
                  className="rounded-md border px-3 py-1 text-[10px] uppercase tracking-[0.14em]"
                  style={{
                    borderColor: "rgba(154,171,184,0.28)",
                    color: palette.silver,
                    background: "rgba(154,171,184,0.06)",
                  }}
                >
                  {focusCategory?.confidenceLabel ?? "Awaiting confidence"}
                </span>
              </div>
            </div>
            <CompetencyRadarChart
              entries={radarData}
              focusCategoryId={focusCategory?.categoryId ?? null}
              accentMap={CATEGORY_ACCENT}
              onSelectCategory={(id) => {
                setSelectedDimensionId(null);
                updateQuery({ category: id, dimension: null, highlight: null });
              }}
              inkColor={palette.ink}
              inkMuted={palette.inkMuted}
              goldColor={palette.gold}
            />

            <div
              className="overflow-hidden rounded-2xl border px-4 py-4"
              style={{
                borderColor: "rgba(255,149,0,0.20)",
                background:
                  "linear-gradient(180deg, rgba(255,149,0,0.055), rgba(255,255,255,0.02))",
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p
                    className="font-display text-[10px] uppercase tracking-[0.18em]"
                    style={{ color: palette.gold }}
                  >
                    Branch lattice
                  </p>
                  <p
                    className="mt-1 text-xs leading-5"
                    style={{ color: palette.inkMuted }}
                  >
                    {hasMeasuredDimensions
                      ? "Scored nodes route into the evidence drawer."
                      : "Category is scored, but branch-level evidence is still pending."}
                  </p>
                </div>
                <span
                  className="rounded-md border px-2.5 py-1 text-[9px] uppercase tracking-[0.14em]"
                  style={{
                    borderColor: hasMeasuredDimensions
                      ? "rgba(74,122,186,0.34)"
                      : "rgba(154,171,184,0.28)",
                    color: hasMeasuredDimensions
                      ? palette.azureLight
                      : palette.silver,
                    background: hasMeasuredDimensions
                      ? "rgba(42,90,154,0.08)"
                      : "rgba(154,171,184,0.06)",
                  }}
                >
                  {hasMeasuredDimensions ? "Scored nodes" : "Awaiting proof"}
                </span>
              </div>

              <BranchLattice
                key={focusCategory?.categoryId ?? "lattice"}
                branches={branchNodes}
                activeBranchId={activeDimensionId}
                hasMeasuredDimensions={hasMeasuredDimensions}
                onSelectBranch={(id) => setSelectedDimensionId(id)}
              />
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};
