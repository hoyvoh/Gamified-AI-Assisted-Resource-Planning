"use client";

import { useMemo, useState } from "react";

import type {
  ChamberCategoryScoreResponse,
  ChamberDimensionScoreResponse,
} from "@/features/analysis-chamber/api/analysis-chamber-api.types";
import { useAnalysisChamberCompetencyData } from "@/features/analysis-chamber/hooks/use-analysis-chamber-shell-data";
import { useAnalysisChamberRouteState } from "@/features/analysis-chamber/hooks/use-analysis-chamber-route-state";
import { useCreateAnalysisChamberValidationFlag } from "@/features/analysis-chamber/hooks/use-analysis-chamber-data";
import { ANALYSIS_CHAMBER_SHELL_PALETTE as palette } from "@/features/analysis-chamber/lib/analysis-chamber-shell.constants";
import { CompetencyRadarChart } from "@/features/analysis-chamber/components/competency-radar-chart";

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
  dimensions: ChamberDimensionScoreResponse[],
  dimensionId: string | null,
) => {
  if (dimensions.length === 0) {
    return null;
  }

  if (dimensionId) {
    return (
      dimensions.find((dimension) => dimension.dimension_id === dimensionId) ??
      null
    );
  }

  return [...dimensions].sort((left, right) => {
    const leftScore = left.opportunity_score ?? left.normalized_score ?? 0;
    const rightScore = right.opportunity_score ?? right.normalized_score ?? 0;

    return rightScore - leftScore;
  })[0];
};

const getFallbackDimensionIds = (
  focusCategory: ChamberCategoryScoreResponse | null,
) => {
  if (!focusCategory) {
    return [];
  }

  return [
    ...focusCategory.included_dimensions,
    ...focusCategory.excluded_dimensions,
  ];
};

export const CompetencyStageShell = ({ memberId }: { memberId: string }) => {
  const { state, updateQuery } = useAnalysisChamberRouteState();
  const competency = useAnalysisChamberCompetencyData(memberId, state.category);
  const runId = competency.data?.run_id ?? null;
  const dimensions = competency.data?.dimension_scores ?? [];
  const categoryScores = competency.data?.category_scores ?? [];
  const focusCategory = useMemo<ChamberCategoryScoreResponse | null>(
    () =>
      categoryScores.find(
        (category) => category.category_id === state.category,
      ) ??
      categoryScores[0] ??
      null,
    [categoryScores, state.category],
  );

  const selectedDimension = useMemo(
    () => getSelectedDimensionFromScores(dimensions, state.dimension),
    [dimensions, state.dimension],
  );

  const focusAccent = getCategoryAccent(focusCategory?.category_id);
  const hasMeasuredDimensions = dimensions.length > 0;
  const fallbackDimensionIds = useMemo(
    () => getFallbackDimensionIds(focusCategory),
    [focusCategory],
  );
  const selectedFallbackDimension =
    state.dimension && fallbackDimensionIds.includes(state.dimension)
      ? state.dimension
      : (fallbackDimensionIds[0] ?? null);
  const activeDimensionId =
    selectedDimension?.dimension_id ?? selectedFallbackDimension;
  const activeDimensionLabel = humanizeId(activeDimensionId);
  const evidenceSignalTotal =
    (selectedDimension?.positive_signals ?? 0) +
    (selectedDimension?.negative_signals ?? 0) +
    (selectedDimension?.mixed_signals ?? 0);
  const includedCount = focusCategory?.included_dimensions.length ?? 0;
  const excludedCount = focusCategory?.excluded_dimensions.length ?? 0;
  const radarData = categoryScores.slice(0, 4).map((cat) => ({
    categoryId: cat.category_id,
    score: normalizeScoreToPercent(cat.score) ?? 0,
    fullMark: 100,
  }));
  const seedDimensions = (
    hasMeasuredDimensions ? dimensions.slice(0, 6).map((dimension) => ({
          id: dimension.dimension_id,
          label: humanizeId(dimension.dimension_id),
          tone: getMaturityTone(dimension.maturity_level),
          subtitle: dimension.maturity_level,
        })) : fallbackDimensionIds.slice(0, 6).map((dimensionId) => ({
          id: dimensionId,
          label: humanizeId(dimensionId),
          tone: {
            border: "rgba(154,171,184,0.45)",
            background: "rgba(255,255,255,0.08)",
            text: palette.inkSoft,
          },
          subtitle: "Awaiting scored inclusion",
        }))
  ) as Array<{
    id: string;
    label: string;
    tone: { border: string; background: string; text: string };
    subtitle: string;
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
            {getCategoryLabel(focusCategory?.category_id)}
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
            className="rounded-[22px] border px-5 py-6 md:px-7"
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
                  {focusCategory?.confidence_label ?? "Awaiting confidence"}
                </span>
              </div>
            </div>
            <CompetencyRadarChart
              entries={radarData}
              focusCategoryId={focusCategory?.category_id ?? null}
              accentMap={CATEGORY_ACCENT}
              onSelectCategory={(id) =>
                updateQuery({ category: id, dimension: null, highlight: id })
              }
              inkColor={palette.ink}
              inkMuted={palette.inkMuted}
              goldColor={palette.gold}
            />

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div
                className="rounded-md border px-4 py-3"
                style={{
                  borderColor: "rgba(200,150,30,0.22)",
                  background: "rgba(255,255,255,0.05)",
                }}
              >
                <p
                  className="text-[10px] uppercase tracking-[0.16em]"
                  style={{ color: palette.inkMuted }}
                >
                  Included lanes
                </p>
                <p
                  className="mt-2 font-display text-sm uppercase tracking-[0.08em]"
                  style={{ color: palette.ink }}
                >
                  {includedCount}
                </p>
              </div>
              <div
                className="rounded-md border px-4 py-3"
                style={{
                  borderColor: "rgba(200,150,30,0.22)",
                  background: "rgba(255,255,255,0.05)",
                }}
              >
                <p
                  className="text-[10px] uppercase tracking-[0.16em]"
                  style={{ color: palette.inkMuted }}
                >
                  Awaiting proof
                </p>
                <p
                  className="mt-2 font-display text-sm uppercase tracking-[0.08em]"
                  style={{ color: palette.ink }}
                >
                  {excludedCount}
                </p>
              </div>
            </div>
          </div>

          <div
            className="rounded-[22px] border p-5"
            style={{
              borderColor: "rgba(200,150,30,0.25)",
              background:
                "linear-gradient(180deg, rgba(200,150,30,0.08), rgba(200,150,30,0.03))",
            }}
          >
            <p
              className="font-display text-[10px] uppercase tracking-[0.18em]"
              style={{ color: palette.gold }}
            >
              Branch lattice
            </p>
            <p
              className="mt-3 text-sm leading-7"
              style={{ color: palette.inkSoft }}
            >
              {hasMeasuredDimensions
                ? "These branches already carry scored readings, so the drawer can follow each node."
                : "These branches are known lanes inside the focus category, but they have not reached scored inclusion yet."}
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {seedDimensions.length > 0 ? (
                seedDimensions.map((dimension) => {
                  const isActive = activeDimensionId === dimension.id;

                  return (
                    <button
                      key={dimension.id}
                      className="rounded-md border px-4 py-4 text-left transition-all duration-200 hover:-translate-y-0.5"
                      onClick={() =>
                        updateQuery({
                          dimension: dimension.id,
                          highlight: dimension.id,
                        })
                      }
                      style={{
                        borderColor: isActive
                          ? palette.gold
                          : dimension.tone.border,
                        borderLeftWidth: "3px",
                        background: isActive
                          ? "linear-gradient(135deg, rgba(200,150,30,0.22), rgba(200,150,30,0.08))"
                          : dimension.tone.background,
                        color: isActive ? palette.ink : palette.inkMuted,
                        boxShadow: isActive
                          ? "0 0 28px rgba(200,150,30,0.24), 0 8px 24px rgba(200,150,30,0.16)"
                          : "none",
                      }}
                      type="button"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p
                          className="font-display text-xs uppercase tracking-[0.08em]"
                          style={{ color: isActive ? palette.gold : "inherit" }}
                        >
                          {dimension.label}
                        </p>
                        {isActive ? (
                          <span
                            className="shrink-0 rounded-full border px-2 py-1 text-[9px] uppercase tracking-[0.14em]"
                            style={{
                              borderColor: palette.gold,
                              color: palette.gold,
                            }}
                          >
                            Active
                          </span>
                        ) : null}
                      </div>
                      <p
                        className="mt-2 text-xs"
                        style={{
                          color: isActive
                            ? dimension.tone.text
                            : "rgba(138,112,88,0.6)",
                        }}
                      >
                        {dimension.subtitle}
                      </p>
                      <p
                        className="mt-3 text-xs leading-5"
                        style={{
                          color: isActive
                            ? palette.inkMuted
                            : "rgba(138,112,88,0.45)",
                        }}
                      >
                        {hasMeasuredDimensions
                          ? "This branch is ready to drive the evidence drawer."
                          : "Observed as a lane in this category, but still waiting for enough proof to score."}
                      </p>
                      {isActive &&
                      hasMeasuredDimensions &&
                      selectedDimension &&
                      evidenceSignalTotal > 0 ? (
                        <div className="mt-4 flex gap-2">
                          <div
                            className="min-w-11 rounded border px-2 py-2 text-center"
                            style={{
                              borderColor: "rgba(34,197,94,0.35)",
                              background: "rgba(34,197,94,0.10)",
                            }}
                          >
                            <p
                              className="text-[9px] uppercase"
                              style={{ color: "rgba(34,197,94,0.9)" }}
                            >
                              +
                            </p>
                            <p
                              className="mt-0.5 font-display text-sm"
                              style={{ color: palette.ink }}
                            >
                              {selectedDimension.positive_signals}
                            </p>
                          </div>
                          <div
                            className="min-w-11 rounded border px-2 py-2 text-center"
                            style={{
                              borderColor: "rgba(200,80,30,0.35)",
                              background: "rgba(200,80,30,0.10)",
                            }}
                          >
                            <p
                              className="text-[9px] uppercase"
                              style={{ color: palette.ember }}
                            >
                              &minus;
                            </p>
                            <p
                              className="mt-0.5 font-display text-sm"
                              style={{ color: palette.ink }}
                            >
                              {selectedDimension.negative_signals}
                            </p>
                          </div>
                          <div
                            className="min-w-11 rounded border px-2 py-2 text-center"
                            style={{
                              borderColor: "rgba(154,171,184,0.35)",
                              background: "rgba(154,171,184,0.10)",
                            }}
                          >
                            <p
                              className="text-[9px] uppercase"
                              style={{ color: palette.silver }}
                            >
                              ~
                            </p>
                            <p
                              className="mt-0.5 font-display text-sm"
                              style={{ color: palette.ink }}
                            >
                              {selectedDimension.mixed_signals}
                            </p>
                          </div>
                        </div>
                      ) : null}
                    </button>
                  );
                })
              ) : (
                <div
                  className="rounded-md border px-4 py-5 text-sm leading-7 sm:col-span-2 xl:col-span-3"
                  style={{
                    borderColor: "rgba(200,150,30,0.22)",
                    background: "rgba(255,255,255,0.05)",
                    color: palette.inkSoft,
                  }}
                >
                  No branches have landed in the chamber yet. The category layer
                  is still the only readable structure.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <aside
        className="border-t px-5 py-6 2xl:border-l 2xl:border-t-0"
        style={{
          background: palette.parchmentMid,
          borderColor: "rgba(200, 150, 30, 0.35)",
        }}
      >
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
          <>
            <div
              className="mt-4"
              style={{
                height: "2px",
                borderRadius: "1px",
                background: selectedDimension
                  ? getMaturityTone(selectedDimension.maturity_level).border
                  : palette.gold,
              }}
            />
            <p
              className="mt-4 font-display text-base uppercase tracking-[0.08em]"
              style={{ color: palette.ink }}
            >
              {activeDimensionLabel}
            </p>
            {selectedDimension?.maturity_level ? (
              <span
                className="mt-2 inline-block rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.12em]"
                style={{
                  borderColor: getMaturityTone(selectedDimension.maturity_level)
                    .border,
                  color: getMaturityTone(selectedDimension.maturity_level).text,
                }}
              >
                {selectedDimension.maturity_level}
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
            {selectedDimension?.normalized_score !== null &&
            selectedDimension?.normalized_score !== undefined ? (
              <p
                className="mt-3 font-display text-2xl"
                style={{ color: palette.gold }}
              >
                {Math.round(selectedDimension.normalized_score * 100)}
                <span
                  className="ml-1 text-sm"
                  style={{ color: palette.inkSoft }}
                >
                  /100
                </span>
              </p>
            ) : null}
          </>
        ) : (
          <p
            className="mt-4 text-sm leading-7"
            style={{ color: palette.inkMuted }}
          >
            Choose a branch from the lattice to open the evidence drawer.
          </p>
        )}

        <div
          className="mt-5 rounded-xl border px-4 py-4"
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
            {hasMeasuredDimensions ? "Dimension reading" : "Coverage reading"}
          </p>
          <p
            className="mt-3 text-sm leading-6"
            style={{ color: palette.inkSoft }}
          >
            {selectedDimension?.ui_summary ??
              selectedDimension?.explanation_summary ??
              (activeDimensionId
                ? hasMeasuredDimensions
                  ? "This branch is ready to drive the evidence drawer."
                  : "This lane is visible inside the chamber, but it is still waiting for enough evidence to become a scored dimension."
                : "Choose a branch to see how the chamber is reading it.")}
          </p>
        </div>

        {hasMeasuredDimensions &&
        selectedDimension &&
        evidenceSignalTotal > 0 ? (
          <div className="mt-4">
            <p
              className="mb-2 text-[10px] uppercase tracking-[0.16em]"
              style={{ color: palette.inkMuted }}
            >
              Signal breakdown
            </p>
            <div className="grid grid-cols-3 gap-2">
              <div
                className="rounded-lg border px-2 py-3 text-center"
                style={{
                  borderColor: "rgba(34,197,94,0.35)",
                  background: "rgba(34,197,94,0.08)",
                }}
              >
                <p
                  className="text-[9px] uppercase tracking-widest"
                  style={{ color: "rgba(34,197,94,0.9)" }}
                >
                  Pos
                </p>
                <p
                  className="mt-1 font-display text-lg"
                  style={{ color: palette.ink }}
                >
                  {selectedDimension.positive_signals}
                </p>
              </div>
              <div
                className="rounded-lg border px-2 py-3 text-center"
                style={{
                  borderColor: "rgba(200,80,30,0.35)",
                  background: "rgba(200,80,30,0.08)",
                }}
              >
                <p
                  className="text-[9px] uppercase tracking-widest"
                  style={{ color: palette.ember }}
                >
                  Neg
                </p>
                <p
                  className="mt-1 font-display text-lg"
                  style={{ color: palette.ink }}
                >
                  {selectedDimension.negative_signals}
                </p>
              </div>
              <div
                className="rounded-lg border px-2 py-3 text-center"
                style={{
                  borderColor: "rgba(154,171,184,0.35)",
                  background: "rgba(154,171,184,0.08)",
                }}
              >
                <p
                  className="text-[9px] uppercase tracking-widest"
                  style={{ color: palette.silver }}
                >
                  Mix
                </p>
                <p
                  className="mt-1 font-display text-lg"
                  style={{ color: palette.ink }}
                >
                  {selectedDimension.mixed_signals}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-4 grid gap-3">
          {[
            {
              label: "Confidence",
              value:
                selectedDimension?.confidence_label ??
                focusCategory?.confidence_label ??
                "Awaiting confidence",
            },
            {
              label: "Coverage",
              value: `${includedCount} included | ${excludedCount} pending`,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-lg border px-4 py-3"
              style={{
                borderColor: "rgba(200,150,30,0.22)",
                background: "rgba(255,255,255,0.05)",
              }}
            >
              <p
                className="text-[10px] uppercase tracking-[0.16em]"
                style={{ color: palette.inkMuted }}
              >
                {item.label}
              </p>
              <p
                className="mt-2 font-display text-xs uppercase tracking-[0.08em]"
                style={{ color: palette.ink }}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Wax seal verdict — ritual interaction */}
        {hasMeasuredDimensions && activeDimensionId && runId ? (
          <WaxSealVerdict
            memberId={memberId}
            runId={runId}
            dimensionId={activeDimensionId}
          />
        ) : null}
      </aside>
    </section>
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
}: {
  memberId: string;
  runId: string;
  dimensionId: string;
}) => {
  const [pending, setPending] = useState<Verdict | null>(null);
  const [sealed, setSealed] = useState<Verdict | null>(null);
  const createFlag = useCreateAnalysisChamberValidationFlag(memberId, runId);

  const handleSeal = async (verdict: Verdict) => {
    if (sealed !== null || createFlag.isPending) return;
    setPending(verdict);
    try {
      await createFlag.mutateAsync({
        analysis_run_id: runId,
        dimension_id: dimensionId,
        verdict,
        note: null,
      });
      setSealed(verdict);
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="mt-5">
      <p
        className="mb-1 text-[10px] uppercase tracking-[0.16em]"
        style={{ color: palette.inkMuted }}
      >
        Seal verdict
      </p>
      <p
        className="mb-4 text-[11px] leading-5"
        style={{ color: "rgba(138,112,88,0.65)" }}
      >
        {sealed
          ? `Chamber sealed — ${sealed}`
          : "Stamp the council's judgment on this reading."}
      </p>

      <div className="flex items-end gap-4">
        {SEAL_META.map(({ verdict, sigil, label, color, border, glow }) => {
          const isSealed = sealed === verdict;
          const isPending = pending === verdict;
          const isDisabled = sealed !== null || createFlag.isPending;

          return (
            <button
              key={verdict}
              disabled={isDisabled}
              onClick={() => void handleSeal(verdict)}
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                border: `2px solid ${isSealed ? color : border}`,
                background: isSealed
                  ? `radial-gradient(circle, ${glow} 0%, rgba(0,0,0,0) 70%)`
                  : "rgba(255,255,255,0.04)",
                color: isSealed ? color : `${color}90`,
                boxShadow: isSealed
                  ? `0 0 0 3px ${glow}, 0 0 16px ${glow}`
                  : "none",
                cursor: isDisabled ? "not-allowed" : "pointer",
                opacity: isDisabled && !isSealed ? 0.35 : 1,
                transform: isPending ? "scale(0.92)" : "scale(1)",
                transition:
                  "transform 180ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 200ms ease, opacity 150ms ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "inherit",
                fontSize: isSealed ? 20 : 16,
              }}
              title={label}
              type="button"
            >
              {sigil}
            </button>
          );
        })}
      </div>

      {sealed ? (
        <p
          className="mt-3 font-display text-[10px] uppercase tracking-[0.14em]"
          style={{
            color:
              SEAL_META.find((s) => s.verdict === sealed)?.color ??
              palette.gold,
          }}
        >
          {sealed.toUpperCase()} · Sealed
        </p>
      ) : null}
    </div>
  );
};
