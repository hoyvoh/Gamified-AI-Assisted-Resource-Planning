"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

import type {
  ChamberCategoryScore,
  ChamberDimensionScore,
} from "@/features/analysis-chamber/api/analysis-chamber-api.view-models";
import { useAnalysisChamberCompetencyData } from "@/features/analysis-chamber/hooks/use-analysis-chamber-shell-data";
import { useAnalysisChamberRouteState } from "@/features/analysis-chamber/hooks/use-analysis-chamber-route-state";
import {
  useAnalysisChamberDimensionDetail,
  useCreateAnalysisChamberValidationFlag,
} from "@/features/analysis-chamber/hooks/use-analysis-chamber-data";
import { ANALYSIS_CHAMBER_SHELL_PALETTE as palette } from "@/features/analysis-chamber/lib/analysis-chamber-shell.constants";
import { CompetencyRadarChart } from "@/features/analysis-chamber/components/competency-radar-chart";

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

// Sigil per category — 4 archetypes
const CATEGORY_SIGIL: Record<string, string> = {
  core_technical_execution: "⟁",
  technical_depth_breadth: "◈",
  engineering_mindset: "⊕",
  collaboration_growth: "✦",
};

// Injected keyframes — drawerReveal (clip-path wipe), stampPress, signalPop
const DRAWER_KEYFRAMES = `
  @keyframes drawerReveal {
    from { clip-path: inset(0 100% 0 0); opacity: 0.5; }
    to   { clip-path: inset(0 0% 0 0);   opacity: 1; }
  }
  @keyframes signalPop {
    0%   { transform: scale(0.7) translateY(4px); opacity: 0; }
    70%  { transform: scale(1.08) translateY(-1px); opacity: 1; }
    100% { transform: scale(1) translateY(0); opacity: 1; }
  }
  @keyframes stampPress {
    0%   { transform: scale(1); }
    30%  { transform: scale(0.82); }
    65%  { transform: scale(1.12); }
    100% { transform: scale(1); }
  }
  @keyframes sealGlowPulse {
    0%, 100% { box-shadow: 0 0 0 2px var(--seal-glow), 0 0 14px var(--seal-glow); }
    50%       { box-shadow: 0 0 0 4px var(--seal-glow), 0 0 28px var(--seal-glow); }
  }
  @keyframes nodeReveal {
    0%   { opacity: 0; transform: translateY(14px) scale(0.88); filter: blur(2px); }
    40%  { filter: blur(0); }
    100% { opacity: 1; transform: translateY(var(--node-offset, 0px)) scale(1); }
  }
  @keyframes lineDrawForward {
    from { stroke-dashoffset: var(--seg-len, 300); }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes lineGlowFloat {
    0%, 100% { opacity: 0.22; }
    50%       { opacity: 0.62; }
  }
  @keyframes nodeDotAppear {
    from { opacity: 0; transform: scale(0); }
    to   { opacity: 1; transform: scale(1); }
  }
  @media (prefers-reduced-motion: reduce) {
    [data-drawer-reveal] { animation: none !important; }
    [data-signal-pop]    { animation: none !important; }
    [data-node-item]     { animation: none !important; }
    [data-lattice-line]  { animation: none !important; stroke-dashoffset: 0 !important; }
    [data-lattice-dot]   { animation: none !important; opacity: 1 !important; }
  }
` as const;

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

const formatTraceTime = (timestamp: string | null | undefined) => {
  if (!timestamp) {
    return "Undated";
  }

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "Undated";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getEvidenceText = ({
  contentExcerpt,
  contentSummary,
}: {
  contentExcerpt?: string | null;
  contentSummary?: string | null;
}) => contentSummary || contentExcerpt || "No evidence excerpt available.";

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
    return {
      border: palette.gold,
      background: palette.goldPale,
      text: palette.ink,
    };
  }

  if (normalized.includes("proficient") || normalized.includes("advanced")) {
    return {
      border: palette.azure,
      background: "rgba(26,74,122,0.08)",
      text: palette.azure,
    };
  }

  return {
    border: palette.silver,
    background: "rgba(154,171,184,0.12)",
    text: palette.inkSoft,
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
  const runId = competency.data?.runId ?? null;
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
  const evidenceSignalTotal =
    (selectedDimension?.positiveSignals ?? 0) +
    (selectedDimension?.negativeSignals ?? 0) +
    (selectedDimension?.mixedSignals ?? 0);
  const includedCount = focusCategory?.includedDimensions.length ?? 0;
  const excludedCount = focusCategory?.excludedDimensions.length ?? 0;
  const isReadingCategory = competency.isFetching && Boolean(competency.data);
  const activeBranchAccent = selectedDimension
    ? getMaturityTone(selectedDimension.maturityLevel).border
    : focusAccent.border;
  const radarData = categoryScores.slice(0, 4).map((cat) => ({
    categoryId: cat.categoryId,
    score: normalizeScoreToPercent(cat.score) ?? 0,
    fullMark: 100,
  }));
  const dimensionDetail = useAnalysisChamberDimensionDetail(
    memberId,
    activeDimensionId,
  );
  const detailScore = dimensionDetail.data?.dimensionScore;
  const drawerSummary =
    detailScore?.uiSummary ??
    detailScore?.explanationSummary ??
    selectedDimension?.uiSummary ??
    selectedDimension?.explanationSummary ??
    (hasMeasuredDimensions
      ? "This branch is ready to drive the evidence drawer."
      : "This lane is visible inside the chamber, but it is still waiting for enough evidence to become a scored dimension.");
  const supportingEvidence = dimensionDetail.data?.supportingEvidence ?? [];
  const counterEvidence = dimensionDetail.data?.counterEvidence ?? [];
  const behavioralEvents = dimensionDetail.data?.behavioralEvents ?? [];
  const categoryDimensionIds = useMemo(
    () => new Set(getFallbackDimensionIds(focusCategory)),
    [focusCategory],
  );
  const seedDimensions = (
    hasMeasuredDimensions
      ? dimensions
          .filter((d) =>
            focusCategory ? categoryDimensionIds.has(d.dimensionId) : true,
          )
          .slice(0, 6)
          .map((dimension) => ({
            id: dimension.dimensionId,
            label: humanizeId(dimension.dimensionId),
            shortLabel: getDimensionShortLabel(dimension.dimensionId),
            tone: getMaturityTone(dimension.maturityLevel),
            subtitle: dimension.maturityLevel,
            scored: true,
            positiveSignals: dimension.positiveSignals,
            negativeSignals: dimension.negativeSignals,
            mixedSignals: dimension.mixedSignals,
          }))
      : fallbackDimensionIds.slice(0, 6).map((dimensionId) => ({
          id: dimensionId,
          label: humanizeId(dimensionId),
          shortLabel: getDimensionShortLabel(dimensionId),
          tone: {
            border: "rgba(154,171,184,0.45)",
            background: "rgba(255,255,255,0.08)",
            text: palette.inkSoft,
          },
          subtitle: "Awaiting scored inclusion",
          scored: false,
          positiveSignals: 0,
          negativeSignals: 0,
          mixedSignals: 0,
        }))
  ) as Array<{
    id: string;
    shortLabel: string;
    label: string;
    tone: { border: string; background: string; text: string };
    subtitle: string;
    scored: boolean;
    positiveSignals: number;
    negativeSignals: number;
    mixedSignals: number;
  }>;

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

        <div className="mt-6">
          <div
            className="rounded-3xl border px-5 py-5 md:px-6"
            style={{
              borderColor: "rgba(200,150,30,0.28)",
              background:
                "linear-gradient(180deg, rgba(200,150,30,0.10), rgba(200,150,30,0.04))",
              boxShadow: "0 20px 44px rgba(0, 0, 0, 0.36)",
            }}
          >
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div className="max-w-xl">
                <h2
                  className="font-display text-2xl uppercase tracking-[0.08em]"
                  style={{ color: palette.ink }}
                >
                  Skill constellation
                </h2>
              </div>
            </div>
          </div>
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
              <p
                className="font-display text-[10px] uppercase tracking-[0.18em]"
                style={{ color: palette.gold }}
              >
                Skill constellation
              </p>
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

              <div className="relative mt-5 overflow-x-auto pb-2">
                {hasMeasuredDimensions && seedDimensions.length > 0 ? (
                  <div
                    key={focusCategory?.categoryId ?? "lattice"}
                    className="relative flex min-w-max items-start gap-8 px-4 py-4"
                  >
                    {seedDimensions.length > 1 &&
                      (() => {
                        const step = 144; // w-28(112) + gap-8(32)
                        const pts = seedDimensions.map((_, i) => ({
                          x: 72 + i * step, // px-4(16) + half-w-28(56) + i*step
                          y: i % 2 === 0 ? 48 : 64, // py-4(16)+h-16/2(32) ± offset(16)
                        }));
                        const svgW =
                          72 + (seedDimensions.length - 1) * step + 56;
                        return (
                          <svg
                            aria-hidden="true"
                            className="pointer-events-none absolute left-0 top-0"
                            height={90}
                            style={{ overflow: "visible" }}
                            width={svgW}
                          >
                            {pts.slice(0, -1).map((p1, i) => {
                              const p2 = pts[i + 1];
                              const len = Math.round(
                                Math.hypot(p2.x - p1.x, p2.y - p1.y),
                              );
                              const delay = (i + 1) * 80 + 300;
                              return (
                                <g key={i}>
                                  {/* ghost trail — always visible */}
                                  <line
                                    stroke="rgba(255,149,0,0.09)"
                                    strokeWidth="1"
                                    x1={p1.x}
                                    x2={p2.x}
                                    y1={p1.y}
                                    y2={p2.y}
                                  />
                                  {/* draw line */}
                                  <line
                                    data-lattice-line=""
                                    stroke="rgba(255,149,0,0.75)"
                                    strokeDasharray={len}
                                    strokeWidth="1"
                                    x1={p1.x}
                                    x2={p2.x}
                                    y1={p1.y}
                                    y2={p2.y}
                                    style={
                                      {
                                        "--seg-len": len,
                                        animation: `lineDrawForward 340ms ease-out ${delay}ms both`,
                                      } as React.CSSProperties
                                    }
                                  />
                                  {/* glow halo */}
                                  <line
                                    data-lattice-line=""
                                    stroke="rgba(255,149,0,0.28)"
                                    strokeDasharray={len}
                                    strokeLinecap="round"
                                    strokeWidth="6"
                                    x1={p1.x}
                                    x2={p2.x}
                                    y1={p1.y}
                                    y2={p2.y}
                                    style={
                                      {
                                        "--seg-len": len,
                                        animation: `lineDrawForward 340ms ease-out ${delay}ms both, lineGlowFloat 2.6s ease-in-out ${delay + 340}ms infinite`,
                                      } as React.CSSProperties
                                    }
                                  />
                                </g>
                              );
                            })}
                            {pts.map((p, i) => (
                              <circle
                                key={i}
                                data-lattice-dot=""
                                cx={p.x}
                                cy={p.y}
                                fill="rgba(255,149,0,0.70)"
                                r="3.5"
                                style={
                                  {
                                    transformBox: "fill-box",
                                    transformOrigin: "center",
                                    animation: `nodeDotAppear 360ms cubic-bezier(0.22, 1, 0.36, 1) ${i * 90 + 200}ms both`,
                                  } as React.CSSProperties
                                }
                              />
                            ))}
                          </svg>
                        );
                      })()}
                    {seedDimensions.map((dimension, index) => {
                      const isActive = activeDimensionId === dimension.id;
                      const nodeColor = isActive
                        ? palette.gold
                        : dimension.scored
                          ? dimension.tone.border
                          : "rgba(154,171,184,0.42)";

                      const nodeOffset = index % 2 === 0 ? 0 : 16;

                      return (
                        <button
                          key={dimension.id}
                          data-node-item
                          className="group relative flex w-28 shrink-0 flex-col items-center text-center hover:-translate-y-1"
                          onClick={() => setSelectedDimensionId(dimension.id)}
                          style={
                            {
                              "--node-offset": `${nodeOffset}px`,
                              animation: `nodeReveal 600ms cubic-bezier(0.22, 1, 0.36, 1) ${index * 90}ms both`,
                            } as React.CSSProperties
                          }
                          type="button"
                        >
                          {isActive ? (
                            <span
                              className="pointer-events-none absolute top-11 h-14 w-px"
                              style={{
                                background:
                                  "linear-gradient(180deg, rgba(255,149,0,0.80), transparent)",
                              }}
                            />
                          ) : null}
                          <span
                            className="relative flex h-16 w-16 rotate-45 items-center justify-center border transition-all duration-200"
                            style={{
                              borderColor: nodeColor,
                              background: isActive
                                ? "radial-gradient(circle, rgba(255,149,0,0.30), rgba(255,149,0,0.08))"
                                : dimension.scored
                                  ? "radial-gradient(circle, rgba(42,90,154,0.20), rgba(255,255,255,0.035))"
                                  : "radial-gradient(circle, rgba(154,171,184,0.10), rgba(255,255,255,0.02))",
                              boxShadow: isActive
                                ? "0 0 32px rgba(255,149,0,0.28)"
                                : "0 10px 22px rgba(0,0,0,0.20)",
                            }}
                          >
                            <span
                              className="-rotate-45 font-display text-xs uppercase tracking-[0.12em]"
                              style={{ color: nodeColor }}
                            >
                              {dimension.scored ? "◆" : "◇"}
                            </span>
                          </span>
                          <span
                            className="mt-4 min-h-10 font-display text-[10px] uppercase leading-5 tracking-[0.10em]"
                            style={{
                              color: isActive ? palette.gold : palette.ink,
                            }}
                          >
                            {dimension.shortLabel}
                          </span>
                          <span
                            className="mt-1 rounded-full border px-2 py-0.5 text-[8px] uppercase tracking-[0.12em]"
                            style={{
                              borderColor: dimension.scored
                                ? dimension.tone.border
                                : "rgba(154,171,184,0.26)",
                              color: dimension.scored
                                ? dimension.tone.text
                                : palette.silver,
                            }}
                          >
                            {dimension.scored ? dimension.subtitle : "Proof"}
                          </span>
                          {dimension.scored ? (
                            <span
                              className="mt-2 text-[9px] uppercase tracking-[0.08em]"
                              style={{ color: "rgba(255,184,77,0.58)" }}
                            >
                              +{dimension.positiveSignals} -
                              {dimension.negativeSignals} ~
                              {dimension.mixedSignals}
                            </span>
                          ) : (
                            <span
                              className="mt-2 text-[9px] uppercase tracking-[0.08em]"
                              style={{ color: "rgba(255,184,77,0.44)" }}
                            >
                              Not sealed
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : seedDimensions.length > 0 ? (
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
                    <div
                      className="rounded-xl border px-4 py-4"
                      style={{
                        borderColor: "rgba(154,171,184,0.24)",
                        background:
                          "linear-gradient(180deg, rgba(154,171,184,0.08), rgba(255,255,255,0.025))",
                      }}
                    >
                      <p
                        className="font-display text-xs uppercase tracking-[0.14em]"
                        style={{ color: palette.ink }}
                      >
                        Branch proof pending
                      </p>
                      <p
                        className="mt-3 text-sm leading-6"
                        style={{ color: palette.inkSoft }}
                      >
                        This category has a readable score, but its individual
                        dimensions have not gathered enough evidence for scored
                        branch readings yet.
                      </p>
                    </div>
                    <div
                      className="rounded-xl border px-4 py-4"
                      style={{
                        borderColor: "rgba(255,149,0,0.18)",
                        background: "rgba(255,149,0,0.035)",
                      }}
                    >
                      <p
                        className="font-display text-[10px] uppercase tracking-[0.16em]"
                        style={{ color: palette.gold }}
                      >
                        Known lanes
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {seedDimensions.map((dimension) => (
                          <button
                            key={dimension.id}
                            className="rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.10em] transition-colors"
                            onClick={() => setSelectedDimensionId(dimension.id)}
                            style={{
                              borderColor:
                                activeDimensionId === dimension.id
                                  ? palette.gold
                                  : "rgba(154,171,184,0.30)",
                              color:
                                activeDimensionId === dimension.id
                                  ? palette.gold
                                  : palette.silver,
                              background:
                                activeDimensionId === dimension.id
                                  ? "rgba(255,149,0,0.10)"
                                  : "rgba(154,171,184,0.055)",
                            }}
                            type="button"
                          >
                            {dimension.shortLabel}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className="rounded-md border px-4 py-5 text-sm leading-7"
                    style={{
                      borderColor: "rgba(200,150,30,0.22)",
                      background: "rgba(255,255,255,0.05)",
                      color: palette.inkSoft,
                    }}
                  >
                    No branches have landed in the chamber yet. The category
                    layer is still the only readable structure.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{DRAWER_KEYFRAMES}</style>

      <aside
        className="border-t px-5 py-6 2xl:border-l 2xl:border-t-0"
        style={{
          background: palette.parchmentMid,
          borderColor: "rgba(200, 150, 30, 0.35)",
          boxShadow: `inset 3px 0 0 ${activeBranchAccent}40`,
        }}
      >
        {/* Title zone */}
        <div className="flex items-center gap-3">
          <p
            className="font-display text-[10px] uppercase tracking-[0.18em]"
            style={{ color: palette.gold }}
          >
            Evidence drawer
          </p>
          <span
            className="rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.12em]"
            style={{
              borderColor: hasMeasuredDimensions
                ? palette.azure
                : "rgba(154,171,184,0.4)",
              color: hasMeasuredDimensions ? palette.azure : palette.silver,
            }}
          >
            {hasMeasuredDimensions ? "Scored" : "Coverage"}
          </span>
        </div>

        {activeDimensionId ? (
          /* Wipe-in wrapper — key causes re-mount → clip-path wipe animation */
          <div
            key={activeDimensionId}
            data-drawer-reveal
            style={{
              animation: "drawerReveal 340ms cubic-bezier(0.4,0,0.2,1) both",
            }}
          >
            {/* Accent rule */}
            <div
              className="mt-4"
              style={{
                height: "2px",
                borderRadius: "1px",
                background: activeBranchAccent,
                boxShadow: `0 0 8px ${activeBranchAccent}66`,
              }}
            />

            {/* Sigil + dimension title */}
            <div className="mt-4 flex items-start gap-2">
              <span
                className="mt-0.5 flex-none text-base leading-none"
                style={{ color: focusAccent.color, opacity: 0.85 }}
                aria-hidden="true"
              >
                {CATEGORY_SIGIL[focusCategory?.categoryId ?? ""] ?? "◈"}
              </span>
              <p
                className="font-display text-base uppercase tracking-[0.08em]"
                style={{ color: palette.ink }}
              >
                {activeDimensionLabel}
              </p>
            </div>

            {/* Maturity badge */}
            {selectedDimension?.maturityLevel ? (
              <span
                className="mt-2 inline-block rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.12em]"
                style={{
                  borderColor: getMaturityTone(selectedDimension.maturityLevel)
                    .border,
                  color: getMaturityTone(selectedDimension.maturityLevel).text,
                }}
              >
                {selectedDimension.maturityLevel}
              </span>
            ) : (
              <span
                className="mt-2 inline-block rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.12em]"
                style={{
                  borderColor: "rgba(154,171,184,0.3)",
                  color: palette.inkMuted,
                }}
              >
                Pending scoring
              </span>
            )}

            {/* Score — large number + animated bar */}
            {selectedDimension?.normalizedScore !== null &&
            selectedDimension?.normalizedScore !== undefined ? (
              <>
                <p
                  className="mt-3 font-display text-3xl leading-none"
                  style={{ color: palette.gold }}
                >
                  {Math.round(selectedDimension.normalizedScore * 100)}
                  <span
                    className="ml-1 text-sm"
                    style={{ color: palette.inkSoft }}
                  >
                    /100
                  </span>
                </p>
                <ScoreBar
                  key={activeDimensionId}
                  score={Math.round(selectedDimension.normalizedScore * 100)}
                  accentColor={focusAccent.color}
                />
              </>
            ) : null}

            {/* Dimension reading parchment */}
            <div
              className="mt-4 rounded-xl border px-4 py-4"
              style={{
                borderColor: "rgba(200,150,30,0.25)",
                background:
                  "linear-gradient(180deg, rgba(200,150,30,0.10), rgba(200,150,30,0.04))",
                boxShadow: "0 16px 30px rgba(0,0,0,0.16)",
              }}
            >
              <p
                className="text-[10px] uppercase tracking-[0.16em]"
                style={{ color: palette.gold }}
              >
                {hasMeasuredDimensions
                  ? "Dimension reading"
                  : "Coverage reading"}
              </p>
              <p
                className="mt-3 text-sm leading-6"
                style={{ color: palette.inkSoft }}
              >
                {drawerSummary}
              </p>
            </div>

            {hasMeasuredDimensions ? (
              <div
                className="mt-4 rounded-xl border px-4 py-4"
                style={{
                  borderColor: "rgba(154,171,184,0.24)",
                  background: "rgba(255,255,255,0.035)",
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <p
                    className="text-[10px] uppercase tracking-[0.16em]"
                    style={{ color: palette.azure }}
                  >
                    Evidence trace
                  </p>
                  {dimensionDetail.isFetching ? (
                    <span
                      className="text-[9px] uppercase tracking-[0.12em]"
                      style={{ color: palette.inkMuted }}
                    >
                      Reading
                    </span>
                  ) : null}
                </div>

                {dimensionDetail.isError ? (
                  <p
                    className="mt-3 text-xs leading-5"
                    style={{ color: palette.crimson }}
                  >
                    Evidence trace could not be loaded for this dimension.
                  </p>
                ) : supportingEvidence.length === 0 &&
                  counterEvidence.length === 0 &&
                  behavioralEvents.length === 0 &&
                  !dimensionDetail.isFetching ? (
                  <p
                    className="mt-3 text-xs leading-5"
                    style={{ color: palette.inkMuted }}
                  >
                    No trace-level evidence has been attached to this dimension
                    yet.
                  </p>
                ) : (
                  <div className="mt-3 space-y-3">
                    {supportingEvidence.slice(0, 2).map((evidence) => (
                      <div
                        key={evidence.id}
                        className="rounded-md border px-3 py-3"
                        style={{
                          borderColor: "rgba(42,106,58,0.3)",
                          background: "rgba(42,106,58,0.08)",
                        }}
                      >
                        <p
                          className="text-[9px] uppercase tracking-[0.12em]"
                          style={{ color: palette.vert }}
                        >
                          Supporting proof |{" "}
                          {formatTraceTime(evidence.timestamp)}
                        </p>
                        <p
                          className="mt-1.5 text-xs leading-5"
                          style={{ color: palette.inkSoft }}
                        >
                          {getEvidenceText(evidence)}
                        </p>
                      </div>
                    ))}

                    {counterEvidence.slice(0, 2).map((evidence) => (
                      <div
                        key={evidence.id}
                        className="rounded-md border px-3 py-3"
                        style={{
                          borderColor: "rgba(182,68,53,0.3)",
                          background: "rgba(182,68,53,0.08)",
                        }}
                      >
                        <p
                          className="text-[9px] uppercase tracking-[0.12em]"
                          style={{ color: palette.crimson }}
                        >
                          Counter proof | {formatTraceTime(evidence.timestamp)}
                        </p>
                        <p
                          className="mt-1.5 text-xs leading-5"
                          style={{ color: palette.inkSoft }}
                        >
                          {getEvidenceText(evidence)}
                        </p>
                      </div>
                    ))}

                    {behavioralEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className="rounded-md border px-3 py-3"
                        style={{
                          borderColor: "rgba(200,150,30,0.22)",
                          background: "rgba(200,150,30,0.06)",
                        }}
                      >
                        <p
                          className="text-[9px] uppercase tracking-[0.12em]"
                          style={{ color: palette.gold }}
                        >
                          Event | {humanizeId(event.eventType)} |{" "}
                          {formatTraceTime(event.timestamp)}
                        </p>
                        <p
                          className="mt-1.5 text-xs leading-5"
                          style={{ color: palette.inkSoft }}
                        >
                          {event.eventSummary ??
                            event.whyItMatters ??
                            "No event summary available."}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {/* Signal counters */}
            {hasMeasuredDimensions &&
            selectedDimension &&
            evidenceSignalTotal > 0 ? (
              <SignalCounters
                key={activeDimensionId}
                positive={selectedDimension.positiveSignals ?? 0}
                negative={selectedDimension.negativeSignals ?? 0}
                mixed={selectedDimension.mixedSignals ?? 0}
              />
            ) : null}

            {/* Confidence + Coverage meters */}
            <div className="mt-4 grid gap-3">
              <MeterStrip
                key={`confidence-${activeDimensionId}`}
                label="Confidence"
                text={
                  selectedDimension?.confidenceLabel ??
                  focusCategory?.confidenceLabel ??
                  "Awaiting"
                }
                fill={
                  CONFIDENCE_FILL[
                    (
                      selectedDimension?.confidenceLabel ??
                      focusCategory?.confidenceLabel ??
                      ""
                    ).toLowerCase()
                  ] ?? 40
                }
                accentColor={focusAccent.color}
              />
              <MeterStrip
                key={`coverage-${focusCategory?.categoryId}`}
                label="Coverage"
                text={`${includedCount} of ${includedCount + excludedCount}`}
                fill={
                  includedCount + excludedCount > 0
                    ? Math.round(
                        (includedCount / (includedCount + excludedCount)) * 100,
                      )
                    : 0
                }
                accentColor={palette.silver}
              />
            </div>

            {/* Wax seal verdict — ritual interaction */}
            {hasMeasuredDimensions && runId ? (
              <WaxSealVerdict
                memberId={memberId}
                runId={runId}
                dimensionId={activeDimensionId}
                accentColor={focusAccent.color}
              />
            ) : null}
          </div>
        ) : (
          <p
            className="mt-4 text-sm leading-7"
            style={{ color: palette.inkMuted }}
          >
            Choose a branch from the lattice to open the evidence drawer.
          </p>
        )}
      </aside>
    </section>
  );
};

// ─── Score Bar — animates from 0 on dimensionId change (via key) ─────────────

const ScoreBar = ({
  score,
  accentColor,
}: {
  score: number;
  accentColor: string;
}) => {
  const [fill, setFill] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    setFill(0);
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => setFill(score));
    });
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [score]);

  return (
    <div className="mt-3">
      <div
        className="relative h-1.5 w-full overflow-hidden rounded-full"
        style={{ background: "rgba(154,171,184,0.15)" }}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: "100%",
            transform: `scaleX(${fill / 100})`,
            transformOrigin: "left",
            transition: "transform 640ms cubic-bezier(0.4, 0, 0.2, 1)",
            background: `linear-gradient(90deg, ${accentColor}99, ${accentColor})`,
            boxShadow: `0 0 8px ${accentColor}66`,
          }}
        />
      </div>
    </div>
  );
};

// ─── Signal Counter — staggered pop-in per signal type ───────────────────────

const SIGNAL_CONFIG = [
  {
    key: "positive" as const,
    icon: "▲",
    label: "Pos",
    color: "rgba(34,197,94,0.9)",
    border: "rgba(34,197,94,0.35)",
    bg: "rgba(34,197,94,0.08)",
  },
  {
    key: "negative" as const,
    icon: "▼",
    label: "Neg",
    color: "rgba(230,80,40,0.9)",
    border: "rgba(230,80,40,0.35)",
    bg: "rgba(230,80,40,0.08)",
  },
  {
    key: "mixed" as const,
    icon: "◆",
    label: "Mix",
    color: "rgba(154,171,184,0.9)",
    border: "rgba(154,171,184,0.35)",
    bg: "rgba(154,171,184,0.08)",
  },
] as const;

const SignalCounters = ({
  positive,
  negative,
  mixed,
}: {
  positive: number;
  negative: number;
  mixed: number;
}) => {
  const values = { positive, negative, mixed };

  return (
    <div className="mt-4">
      <p
        className="mb-2 text-[10px] uppercase tracking-[0.16em]"
        style={{ color: palette.inkMuted }}
      >
        Signal breakdown
      </p>
      <div className="grid grid-cols-3 gap-2">
        {SIGNAL_CONFIG.map(({ key, icon, label, color, border, bg }, i) => (
          <div
            key={key}
            data-signal-pop
            className="rounded-lg border px-2 py-3 text-center"
            style={{
              borderColor: border,
              background: bg,
              animation: `signalPop 320ms cubic-bezier(0.34,1.56,0.64,1) ${i * 60}ms both`,
            }}
          >
            <p
              className="flex items-center justify-center gap-1 text-[9px] uppercase tracking-widest"
              style={{ color }}
            >
              <span style={{ fontSize: 7 }}>{icon}</span>
              {label}
            </p>
            <p
              className="mt-1 font-display text-lg"
              style={{ color: palette.ink }}
            >
              {values[key]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Meter Strip — confidence / coverage ─────────────────────────────────────

const CONFIDENCE_FILL: Record<string, number> = {
  high: 90,
  medium: 58,
  low: 28,
};

const MeterStrip = ({
  label,
  text,
  fill,
  accentColor,
}: {
  label: string;
  text: string;
  fill: number;
  accentColor: string;
}) => {
  const [width, setWidth] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    setWidth(0);
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => setWidth(fill));
    });
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [fill]);

  return (
    <div
      className="rounded-lg border px-4 py-3"
      style={{
        borderColor: "rgba(200,150,30,0.22)",
        background: "rgba(255,255,255,0.04)",
      }}
    >
      <div className="flex items-center justify-between">
        <p
          className="text-[10px] uppercase tracking-[0.16em]"
          style={{ color: palette.inkMuted }}
        >
          {label}
        </p>
        <p
          className="text-[10px] font-medium"
          style={{ color: palette.inkSoft }}
        >
          {text}
        </p>
      </div>
      <div
        className="relative mt-2 h-1 w-full overflow-hidden rounded-full"
        style={{ background: "rgba(154,171,184,0.12)" }}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: "100%",
            transform: `scaleX(${width / 100})`,
            transformOrigin: "left",
            transition: "transform 560ms cubic-bezier(0.4, 0, 0.2, 1) 80ms",
            background: `linear-gradient(90deg, ${accentColor}66, ${accentColor}99)`,
          }}
        />
      </div>
    </div>
  );
};

// ─── Wax Seal Verdict ritual ─────────────────────────────────────────────────

type Verdict = "accurate" | "questionable" | "incorrect";

const SEAL_META: Array<{
  verdict: Verdict;
  sigil: string;
  label: string;
  color: string;
  border: string;
  glow: string;
}> = [
  {
    verdict: "accurate",
    sigil: "✓",
    label: "Accurate",
    color: palette.vert,
    border: `${palette.vert}80`,
    glow: "rgba(42,106,58,0.35)",
  },
  {
    verdict: "questionable",
    sigil: "?",
    label: "Questionable",
    color: palette.ember,
    border: `${palette.ember}80`,
    glow: "rgba(200,90,30,0.35)",
  },
  {
    verdict: "incorrect",
    sigil: "✗",
    label: "Incorrect",
    color: palette.crimsonLight,
    border: `${palette.crimson}80`,
    glow: "rgba(139,26,26,0.35)",
  },
];

const WaxSealVerdict = ({
  memberId,
  runId,
  dimensionId,
  accentColor: _accentColor,
}: {
  memberId: string;
  runId: string;
  dimensionId: string;
  accentColor?: string;
}) => {
  const [sealed, setSealed] = useState<Verdict | null>(null);
  const [hovered, setHovered] = useState<Verdict | null>(null);
  const [pressing, setPressing] = useState<Verdict | null>(null);
  const createFlag = useCreateAnalysisChamberValidationFlag(memberId, runId);

  const handleSeal = async (verdict: Verdict) => {
    if (sealed !== null || createFlag.isPending) return;
    setPressing(verdict);
    // stamp-press animation plays via CSS keyframe (220ms), then reset
    setTimeout(() => setPressing(null), 220);
    try {
      await createFlag.mutateAsync({
        analysisRunId: runId,
        dimensionId: dimensionId,
        verdict,
        note: null,
      });
      setSealed(verdict);
    } finally {
      // no-op
    }
  };

  const sealedMeta = SEAL_META.find((s) => s.verdict === sealed);

  return (
    <div
      className="mt-6 border-t pt-5"
      style={{ borderColor: "rgba(200,150,30,0.18)" }}
    >
      <p
        className="mb-1 text-[10px] uppercase tracking-[0.16em]"
        style={{ color: palette.inkMuted }}
      >
        Seal verdict
      </p>
      <p
        className="mb-5 text-[11px] leading-5"
        style={{ color: "rgba(138,112,88,0.65)" }}
      >
        {sealed
          ? `Chamber sealed — ${sealed}`
          : "Stamp the council's judgment on this reading."}
      </p>

      <div className="flex items-center gap-5">
        {SEAL_META.map(({ verdict, sigil, label, color, border, glow }) => {
          const isSealed = sealed === verdict;
          const isPressing = pressing === verdict;
          const isHovered = hovered === verdict;
          const isOtherSealed = sealed !== null && !isSealed;
          const isDisabled = sealed !== null || createFlag.isPending;

          // FLIP: when something is sealed, non-selected shrink away
          const scale = isOtherSealed
            ? 0
            : isSealed
              ? 1.35
              : isHovered
                ? 1.08
                : 1;
          const size = isSealed ? 64 : 48;

          return (
            <button
              aria-label={`Seal verdict as ${label}`}
              key={verdict}
              disabled={isDisabled}
              onClick={() => void handleSeal(verdict)}
              onMouseEnter={() => !isDisabled && setHovered(verdict)}
              onMouseLeave={() => setHovered(null)}
              title={label}
              type="button"
              style={
                {
                  "--seal-glow": glow,
                  width: size,
                  height: size,
                  flexShrink: 0,
                  borderRadius: "50%",
                  border: `2px solid ${isSealed || isHovered ? color : border}`,
                  background: isSealed
                    ? `radial-gradient(circle at 50% 50%, ${glow} 0%, rgba(0,0,0,0) 72%)`
                    : isHovered
                      ? `radial-gradient(circle, ${glow} 0%, rgba(0,0,0,0) 80%)`
                      : "rgba(255,255,255,0.04)",
                  color: isSealed ? color : isHovered ? color : `${color}90`,
                  boxShadow: isSealed
                    ? `0 0 0 3px ${glow}, 0 0 22px ${glow}`
                    : isHovered
                      ? `0 0 0 2px ${glow}, 0 0 14px ${glow}`
                      : "none",
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  opacity: isOtherSealed
                    ? 0
                    : isDisabled && !isSealed
                      ? 0.35
                      : 1,
                  transform: `scale(${scale})`,
                  transition: isOtherSealed
                    ? "transform 260ms cubic-bezier(0.4,0,1,1), opacity 220ms ease"
                    : "transform 280ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 200ms ease, opacity 180ms ease, width 260ms ease, height 260ms ease",
                  animation: isPressing
                    ? "stampPress 220ms cubic-bezier(0.34,1.56,0.64,1) both"
                    : undefined,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "inherit",
                  fontSize: isSealed ? 22 : 16,
                } as React.CSSProperties
              }
            >
              {sigil}
            </button>
          );
        })}
      </div>

      {sealed && sealedMeta ? (
        <p
          className="mt-4 font-display text-[10px] uppercase tracking-[0.14em]"
          style={{
            color: sealedMeta.color,
            animation: "signalPop 320ms cubic-bezier(0.34,1.56,0.64,1) both",
          }}
        >
          {sealed.toUpperCase()} · Sealed
        </p>
      ) : null}
    </div>
  );
};
