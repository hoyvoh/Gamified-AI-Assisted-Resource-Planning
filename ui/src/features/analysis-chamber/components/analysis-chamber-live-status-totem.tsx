"use client";

import Link from "next/link";

import type {
  ChamberBootstrap,
  ChamberCase,
  ChamberCategoryScore,
  ChamberDimensionScore,
  ChamberMilestone,
} from "@/features/analysis-chamber/api/analysis-chamber-api.view-models";
import { CharacterStage } from "@/systems/character/character-stage";
import { getStatusColor } from "@/systems/character/character-shared";
import {
  useAnalysisChamberCasesData,
  useAnalysisChamberCompetencyData,
  useAnalysisChamberJourneyData,
  useAnalysisChamberKptData,
  useAnalysisChamberOverviewData,
} from "@/features/analysis-chamber/hooks/use-analysis-chamber-shell-data";
import { useAnalysisChamberRouteState } from "@/features/analysis-chamber/hooks/use-analysis-chamber-route-state";
import { buildAnalysisChamberRouteHref } from "@/features/analysis-chamber/lib/analysis-chamber-route-links";
import {
  ANALYSIS_CHAMBER_SHELL_PALETTE as palette,
  DIMENSION_LABELS,
} from "@/features/analysis-chamber/lib/analysis-chamber-shell.constants";
import type { AnalysisChamberRouteKey } from "@/features/analysis-chamber/lib/analysis-chamber-shell.types";
import { normalizeAnalysisStatus } from "@/types/organization";

type TotemSignal = {
  title: string;
  value: string;
};

type TotemAction =
  | {
      kind: "button";
      label: string;
      onClick: () => void;
      variant?: "primary" | "secondary";
    }
  | {
      href: string;
      kind: "link";
      label: string;
      variant?: "primary" | "secondary";
    };

type RoutePanelConfig = {
  accentColor: string;
  chamberLabel: string;
  signal: TotemSignal;
  stateBadge: string;
  action: TotemAction;
};

const CATEGORY_LABELS: Record<string, string> = {
  core_technical_execution: "Core Technical Execution",
  technical_depth_breadth: "Technical Depth and Breadth",
  engineering_mindset: "Engineering Mindset",
  collaboration_growth: "Collaboration and Growth",
};

const EMPTY_DIMENSIONS: ChamberDimensionScore[] = [];
const EMPTY_CATEGORIES: ChamberCategoryScore[] = [];
const EMPTY_CASES: ChamberCase[] = [];
const EMPTY_MILESTONES: ChamberMilestone[] = [];

const formatConfidenceLabel = (confidence: number | null | undefined) => {
  const safe = confidence ?? 0;
  return `${Math.round(Math.max(0, Math.min(safe, 1)) * 100)}% confidence`;
};

const getStatusBadge = ({
  hasSignal,
  status,
}: {
  hasSignal: boolean;
  status: ChamberBootstrap["analysisStatus"];
}) => {
  if (!hasSignal) {
    return "Signal thin";
  }

  const normalized = normalizeAnalysisStatus(status);

  if (normalized === "not_analyzed") {
    return "Pending";
  }

  if (normalized === "analyzing") {
    return "In progress";
  }

  if (normalized === "failed") {
    return "Failed";
  }

  return "Completed";
};

const humanizeValue = (value: string | null | undefined) => {
  if (!value) {
    return "Pending";
  }

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const getDimensionLabel = (dimensionId: string | null | undefined) => {
  if (!dimensionId) {
    return "Awaiting branch";
  }

  return DIMENSION_LABELS[dimensionId] ?? humanizeValue(dimensionId);
};

const getCategoryLabel = (categoryId: string | null | undefined) => {
  if (!categoryId) {
    return "Pending focus";
  }

  return CATEGORY_LABELS[categoryId] ?? humanizeValue(categoryId);
};

const getImpactScoreValue = (score: number | null | undefined) => {
  if (score === null || score === undefined) {
    return null;
  }

  return `${Math.round(score * 100)}/100 impact`;
};

const getTopCompetencyDimension = (dimensions: ChamberDimensionScore[]) =>
  [...dimensions].sort((left, right) => {
    const leftScore = left.opportunityScore ?? left.normalizedScore ?? 0;
    const rightScore = right.opportunityScore ?? right.normalizedScore ?? 0;

    return rightScore - leftScore;
  })[0] ?? null;

const RouteSignalContent = ({
  bootstrap,
  confidence,
  memberId,
  route,
  status,
}: {
  bootstrap: ChamberBootstrap;
  confidence: number;
  memberId: string;
  route: AnalysisChamberRouteKey;
  status: ChamberBootstrap["analysisStatus"];
}) => {
  const overview = useAnalysisChamberOverviewData(memberId);
  const routeState = useAnalysisChamberRouteState();
  const competency = useAnalysisChamberCompetencyData(
    memberId,
    routeState.state.category,
  );
  const kpt = useAnalysisChamberKptData(memberId);
  const cases = useAnalysisChamberCasesData(memberId);
  const journey = useAnalysisChamberJourneyData(memberId);

  const currentPath = overview.data?.currentGrowthPath ?? "Path still forming";
  const confidenceLabel = formatConfidenceLabel(
    overview.data?.overallConfidence ?? null,
  );

  let config: RoutePanelConfig;

  if (route === "journey") {
    const milestones = journey.data?.milestones ?? EMPTY_MILESTONES;
    const focusedMilestone =
      milestones.find(
        (milestone) => milestone.id === routeState.state.milestone,
      ) ??
      milestones[0] ??
      null;
    const focusedIndex = focusedMilestone
      ? milestones.findIndex(
          (milestone) => milestone.id === focusedMilestone.id,
        )
      : -1;
    const nextMilestone =
      focusedIndex >= 0 && focusedIndex < milestones.length - 1
        ? (milestones[focusedIndex + 1] ?? null)
        : null;

    config = {
      accentColor: palette.azureLight,
      action: nextMilestone
        ? {
            kind: "button",
            label: "Next frontier",
            onClick: () =>
              routeState.updateQuery({
                highlight: nextMilestone.id,
                milestone: nextMilestone.id,
              }),
          }
        : {
            href: buildAnalysisChamberRouteHref(memberId, "overview"),
            kind: "link",
            label: "Hero state",
          },
      chamberLabel: "Expedition Chamber",
      signal: focusedMilestone
        ? {
            title: "Frontier signal",
            value: `${milestones.length} milestones secured`,
          }
        : {
            title: "Frontier signal",
            value: `${milestones.length} milestones secured`,
          },
      stateBadge: getStatusBadge({
        hasSignal:
          milestones.length > 0 || Boolean(journey.data?.growthJourneySummary),
        status,
      }),
    };
  } else if (route === "competency") {
    const categories = competency.data?.categoryScores ?? EMPTY_CATEGORIES;
    const dimensions = competency.data?.dimensionScores ?? EMPTY_DIMENSIONS;
    const focusCategory =
      categories.find(
        (category) => category.categoryId === routeState.state.category,
      ) ??
      categories[0] ??
      null;
    const selectedDimension =
      dimensions.find(
        (dimension) => dimension.dimensionId === routeState.state.dimension,
      ) ?? getTopCompetencyDimension(dimensions);

    config = {
      accentColor: palette.gold,
      action: selectedDimension
        ? {
            kind: "button",
            label: "Focus branch",
            onClick: () =>
              routeState.updateQuery({
                category: focusCategory?.categoryId ?? null,
                dimension: selectedDimension.dimensionId,
                highlight: selectedDimension.dimensionId,
              }),
          }
        : {
            href: buildAnalysisChamberRouteHref(memberId, "overview"),
            kind: "link",
            label: "Hero state",
          },
      chamberLabel: "Competency Chamber",
      signal: selectedDimension
        ? {
            title: "Dominant competency signal",
            value: getDimensionLabel(selectedDimension.dimensionId),
          }
        : {
            title: "Dominant competency signal",
            value: getCategoryLabel(focusCategory?.categoryId),
          },
      stateBadge: getStatusBadge({
        hasSignal: Boolean(selectedDimension || focusCategory),
        status,
      }),
    };
  } else if (route === "kpt") {
    const priorityItem =
      kpt.data?.problemItems[0] ??
      kpt.data?.tryItems[0] ??
      kpt.data?.keepItems[0] ??
      null;
    const lensLabel = priorityItem
      ? `${priorityItem.itemType} focus`
      : "Reflection pending";

    config = {
      accentColor:
        priorityItem?.itemType === "problem"
          ? palette.crimsonLight
          : priorityItem?.itemType === "try"
            ? palette.azureLight
            : palette.vertLight,
      action: priorityItem?.linkedDimensionIds[0]
        ? {
            href: buildAnalysisChamberRouteHref(memberId, "competency", {
              category: null,
              dimension: priorityItem.linkedDimensionIds[0],
              highlight: priorityItem.linkedDimensionIds[0],
            }),
            kind: "link",
            label: "Open competency",
          }
        : {
            href: buildAnalysisChamberRouteHref(memberId, "overview"),
            kind: "link",
            label: "Hero state",
          },
      chamberLabel: "Council Chamber",
      signal: priorityItem
        ? {
            title: "Active council signal",
            value: priorityItem.title,
          }
        : {
            title: "Active council signal",
            value: "Reflection still forming",
          },
      stateBadge: getStatusBadge({
        hasSignal: Boolean(priorityItem),
        status,
      }),
    };

    return (
      <TotemLayout
        accentColor={config.accentColor}
        action={config.action}
        chamberLabel={config.chamberLabel}
        confidenceLabel={confidenceLabel}
        currentPathLabel={currentPath}
        identityLabel={lensLabel}
        memberName={bootstrap.member.displayName}
        roleName={bootstrap.roleName ?? "Role pending"}
        signal={config.signal}
        stateBadge={config.stateBadge}
        status={bootstrap.analysisStatus}
        confidence={confidence}
      />
    );
  } else {
    const caseList = cases.data?.cases ?? EMPTY_CASES;
    const selectedCase =
      caseList.find((entry) => entry.id === routeState.state.caseId) ??
      caseList[0] ??
      null;

    config = {
      accentColor: palette.emberLight,
      action: {
        href: buildAnalysisChamberRouteHref(memberId, "overview"),
        kind: "link",
        label: "Hero state",
      },
      chamberLabel: "Archive Chamber",
      signal: selectedCase
        ? {
            title: "Active evidence signal",
            value: selectedCase.category ?? "Open record selected",
          }
        : {
            title: "Active evidence signal",
            value: "Archive awaiting signal",
          },
      stateBadge: getStatusBadge({
        hasSignal: Boolean(selectedCase),
        status,
      }),
    };

    const caseIdentity = selectedCase?.impactLevel
      ? (getImpactScoreValue(selectedCase.confidenceScore ?? null) ??
        selectedCase.impactLevel)
      : "Case archive";

    return (
      <TotemLayout
        accentColor={config.accentColor}
        action={config.action}
        chamberLabel={config.chamberLabel}
        confidenceLabel={confidenceLabel}
        currentPathLabel={currentPath}
        identityLabel={caseIdentity}
        memberName={bootstrap.member.displayName}
        roleName={bootstrap.roleName ?? "Role pending"}
        signal={config.signal}
        stateBadge={config.stateBadge}
        status={bootstrap.analysisStatus}
        confidence={confidence}
      />
    );
  }

  const routeIdentity =
    route === "journey"
      ? `${journey.data?.milestones.length ?? 0} milestones secured`
      : route === "competency"
        ? getCategoryLabel(
            competency.data?.categoryScores.find(
              (category) => category.categoryId === routeState.state.category,
            )?.categoryId ??
              competency.data?.categoryScores[0]?.categoryId ??
              null,
          )
        : "Hero state";

  return (
    <TotemLayout
      accentColor={config.accentColor}
      action={config.action}
      chamberLabel={config.chamberLabel}
      confidenceLabel={confidenceLabel}
      currentPathLabel={currentPath}
      identityLabel={routeIdentity}
      memberName={bootstrap.member.displayName}
      roleName={bootstrap.roleName ?? "Role pending"}
      signal={config.signal}
      stateBadge={config.stateBadge}
      status={bootstrap.analysisStatus}
      confidence={confidence}
    />
  );
};

const TotemLayout = ({
  accentColor,
  action,
  chamberLabel,
  confidenceLabel,
  confidence,
  currentPathLabel,
  identityLabel,
  memberName,
  roleName,
  signal,
  stateBadge,
  status,
}: {
  accentColor: string;
  action: TotemAction;
  chamberLabel: string;
  confidenceLabel: string;
  confidence: number;
  currentPathLabel: string;
  identityLabel: string;
  memberName: string;
  roleName: string;
  signal: TotemSignal;
  stateBadge: string;
  status: ChamberBootstrap["analysisStatus"];
}) => {
  return (
    <>
      <div className="relative px-3 pb-4 pt-4">
        <div
          className="pointer-events-none absolute inset-x-4 top-7 h-28 rounded-full blur-3xl"
          style={{ background: `${accentColor}26` }}
        />
        <div
          className="relative overflow-hidden rounded-[22px] border"
          style={{
            borderColor: "rgba(200,150,30,0.28)",
            background:
              "radial-gradient(circle at 50% 24%, rgba(255,255,255,0.06) 0%, transparent 24%), linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.01) 100%)",
            boxShadow:
              "inset 0 1px 0 rgba(255,232,192,0.05), 0 14px 28px rgba(0,0,0,0.24)",
          }}
        >
          <div
            className="flex items-start justify-between gap-3 border-b px-4 py-4"
            style={{ borderColor: "rgba(200,150,30,0.12)" }}
          >
            <div className="min-w-0">
              <p
                className="font-display text-[9px] uppercase tracking-[0.18em]"
                style={{ color: palette.gold }}
              >
                {chamberLabel}
              </p>
              <p
                className="mt-2 font-display text-[11px] uppercase leading-5 tracking-[0.08em]"
                style={{ color: palette.ink }}
              >
                Live Status Totem
              </p>
            </div>
            <span
              className="rounded-full border px-2.5 py-1 text-[9px] uppercase tracking-[0.16em]"
              style={{
                borderColor:
                  stateBadge === "Completed"
                    ? "rgba(91,184,122,0.34)"
                    : stateBadge === "In progress"
                      ? "rgba(74,122,186,0.34)"
                      : "rgba(255,184,77,0.24)",
                color:
                  stateBadge === "Completed"
                    ? "#69cf88"
                    : stateBadge === "In progress"
                      ? palette.azureLight
                      : palette.inkMuted,
              }}
            >
              {stateBadge}
            </span>
          </div>

          <div className="relative h-56 overflow-hidden">
            <div
              className="pointer-events-none absolute inset-x-8 top-8 h-28 rounded-full blur-3xl"
              style={{ background: `${accentColor}22` }}
            />
            <CharacterStage
              accentColor={accentColor}
              confidence={confidence}
              isFocusMode={false}
              stageMode="portrait"
              status={status}
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
              style={{
                background:
                  "linear-gradient(180deg, rgba(30,21,14,0) 0%, rgba(28,19,12,0.96) 100%)",
              }}
            />
            <div className="absolute inset-x-4 bottom-4 z-10 flex items-center justify-center gap-2">
              <span
                className="inline-flex min-h-8 max-w-[calc(50%-4px)] items-center justify-center rounded-full border px-3 py-1.5 text-center font-display text-[8px] uppercase tracking-[0.12em]"
                style={{
                  borderColor: "rgba(200,150,30,0.18)",
                  background: "rgba(23,14,10,0.72)",
                  color: palette.ink,
                  backdropFilter: "blur(8px)",
                }}
              >
                {confidenceLabel}
              </span>
              <span
                className="inline-flex min-h-8 max-w-[calc(50%-4px)] items-center justify-center rounded-full border px-3 py-1.5 text-center font-display text-[8px] uppercase tracking-[0.12em]"
                style={{
                  borderColor: "rgba(200,150,30,0.18)",
                  background: "rgba(23,14,10,0.72)",
                  color: palette.ink,
                  backdropFilter: "blur(8px)",
                }}
              >
                {currentPathLabel}
              </span>
            </div>
          </div>

          <div className="px-4 pb-5 pt-3">
            <div className="mt-1 text-center">
              <p
                className="break-words font-display text-[11px] uppercase tracking-[0.08em]"
                style={{ color: palette.ink }}
              >
                {memberName}
              </p>
              <p
                className="mt-1 text-[12px] italic"
                style={{ color: palette.inkMuted }}
              >
                {roleName}
              </p>
              <p
                className="mt-3 break-words font-display text-[8px] uppercase tracking-[0.12em]"
                style={{ color: palette.inkSoft }}
              >
                {identityLabel}
              </p>
            </div>

            <div
              className="mt-4 rounded-[18px] border px-4 py-3.5"
              style={{
                borderColor: "rgba(200,150,30,0.18)",
                background: "rgba(255,255,255,0.025)",
              }}
            >
              <p
                className="text-[9px] uppercase tracking-[0.18em]"
                style={{ color: palette.gold }}
              >
                {signal.title}
              </p>
              <p
                className="mt-2.5 break-all font-display text-[10px] uppercase leading-5 tracking-[0.04em]"
                style={{ color: palette.ink }}
              >
                {signal.value}
              </p>
            </div>

            <div className="mt-4">
              {action.kind === "link" ? (
                <Link
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-full border px-3 py-2 font-display text-[10px] uppercase tracking-[0.14em] transition hover:brightness-110"
                  href={action.href}
                  style={{
                    borderColor: "rgba(255,184,77,0.28)",
                    background: "rgba(255,184,77,0.10)",
                    color: palette.ink,
                  }}
                >
                  {action.label}
                </Link>
              ) : (
                <button
                  className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-full border px-3 py-2 font-display text-[10px] uppercase tracking-[0.14em] transition hover:brightness-110"
                  onClick={action.onClick}
                  style={{
                    borderColor: "rgba(255,184,77,0.28)",
                    background: "rgba(255,184,77,0.10)",
                    color: palette.ink,
                  }}
                  type="button"
                >
                  {action.label}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const AnalysisChamberLiveStatusTotem = ({
  bootstrap,
  confidence,
  memberId,
  route,
}: {
  bootstrap: ChamberBootstrap;
  confidence: number;
  memberId: string;
  route: Exclude<AnalysisChamberRouteKey, "overview">;
}) => {
  const statusColor = getStatusColor(bootstrap.analysisStatus);

  return (
    <aside
      className="relative hidden min-w-0 border-l xl:flex xl:flex-col"
      style={{
        background:
          "linear-gradient(180deg, rgba(35,26,18,0.92) 0%, rgba(20,10,9,0.98) 100%)",
        borderColor: "rgba(200, 150, 30, 0.24)",
        boxShadow: "-12px 0 40px rgba(0,0,0,0.22)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${statusColor}16 0%, transparent 72%)`,
        }}
      />
      <RouteSignalContent
        bootstrap={bootstrap}
        confidence={confidence}
        memberId={memberId}
        route={route}
        status={bootstrap.analysisStatus}
      />
    </aside>
  );
};
