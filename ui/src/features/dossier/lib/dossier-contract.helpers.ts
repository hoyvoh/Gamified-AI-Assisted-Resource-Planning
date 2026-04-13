import type {
  CaseFeedback,
  CategoryScore,
  DimensionScore,
  DossierBriefViewModel,
  DossierTrustStripViewModel,
  KptItem,
  Milestone,
  ProfileOverviewResponse,
} from "@/features/dossier/types/dossier.types";

const EMPTY_LABEL = "Unlabeled";
const EMPTY_SUMMARY = "No summary available";
const REVIEW_REQUIRED_LABEL = "Required";
const REVIEW_CLEAR_LABEL = "Clear";
const LOW_OPPORTUNITY_LABEL = "low";
const EMPTY_CONFIDENCE_LABEL = "N/A";
const ONE_HUNDRED_PERCENT = 100;
const PERCENT_SCALE_THRESHOLD = 1;
const SCORE_MAX = 100;
const SCORE_MIN = 0;

const DIMENSION_LABELS: Record<string, string> = {
  "dim-tech": "Technical Skill",
  "dim-comm": "Communication",
  "dim-owner": "Ownership",
  "dim-design": "System Design",
  "dim-mentor": "Mentorship",
  "dim-docs": "Documentation",
};

const CATEGORY_LABELS: Record<string, string> = {
  execution: "Exec",
  communication: "Comm",
  design: "Design",
  growth: "Growth",
  core: "Core",
  behavioral: "Behavioral",
  process: "Process",
};

export const getDimensionLabel = (dimensionId: string): string =>
  DIMENSION_LABELS[dimensionId] ?? dimensionId ?? EMPTY_LABEL;

export const getCategoryLabel = (categoryId: string): string =>
  CATEGORY_LABELS[categoryId] ?? categoryId ?? EMPTY_LABEL;

export const toPercentValue = (value: number | null | undefined): number | null => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return null;
  }

  if (value <= PERCENT_SCALE_THRESHOLD) {
    return Math.min(
      Math.max(value * ONE_HUNDRED_PERCENT, SCORE_MIN),
      SCORE_MAX,
    );
  }

  return Math.min(Math.max(value, SCORE_MIN), SCORE_MAX);
};

export const formatPercentLabel = (
  value: number | null | undefined,
  emptyLabel = EMPTY_CONFIDENCE_LABEL,
): string => {
  const percentValue = toPercentValue(value);

  return percentValue === null ? emptyLabel : `${Math.round(percentValue)}%`;
};

export const getOverviewBriefViewModel = (
  overview: ProfileOverviewResponse,
): DossierBriefViewModel => ({
  currentGrowthPath: overview.currentGrowthPath ?? EMPTY_LABEL,
  growthJourneySummary:
    overview.growthJourneySummary ?? overview.profileSummary ?? EMPTY_SUMMARY,
  strengthDimensionLabels: overview.topStrengthDimensionIds.map(
    getDimensionLabel,
  ),
  growthDimensionLabels: overview.topGrowthDimensionIds.map(getDimensionLabel),
});

export const getTrustStripViewModel = (
  overview: ProfileOverviewResponse,
): DossierTrustStripViewModel => ({
  confidenceLabel: formatPercentLabel(overview.overallConfidence),
  flaggedLabel: `${overview.insufficientDimensions.length}`,
  reviewLabel:
    overview.p8Approved && overview.fairnessNotes.length === 0
      ? REVIEW_CLEAR_LABEL
      : REVIEW_REQUIRED_LABEL,
  fairnessNote: overview.fairnessNotes[0] ?? null,
});

export const getOverviewSignalGroups = (
  categoryScores: CategoryScore[],
): Array<{ label: string; value: number | null }> =>
  categoryScores.slice(0, 4).map((categoryScore) => ({
    label: getCategoryLabel(categoryScore.categoryId),
    value: categoryScore.score,
  }));

export const getDimensionDisplayName = (dimension: DimensionScore): string =>
  getDimensionLabel(dimension.dimensionId);

export const isDimensionFlagged = (dimension: DimensionScore): boolean =>
  dimension.topCounterEvidenceIds.length > 0 ||
  dimension.limitationNotes.length > 0;

export const hasDimensionOpportunity = (dimension: DimensionScore): boolean =>
  dimension.opportunityLabel.toLowerCase() !== LOW_OPPORTUNITY_LABEL &&
  (toPercentValue(dimension.opportunityScore) ?? 0) > 0;

export const getDisplayScore = (
  value: number | null | undefined,
): number | null => toPercentValue(value);

export const getKptGroups = (response: {
  keepItems: KptItem[];
  problemItems: KptItem[];
  tryItems: KptItem[];
}) => ({
  keep: response.keepItems,
  problem: response.problemItems,
  try: response.tryItems,
});

export const getCaseTitle = (caseItem: CaseFeedback): string => caseItem.title;

export const getCaseSummary = (caseItem: CaseFeedback): string =>
  caseItem.summary ?? caseItem.whyItMatters ?? EMPTY_SUMMARY;

export const isCurrentMilestone = (
  milestone: Milestone,
  allMilestones: Milestone[],
): boolean => {
  const currentVector = allMilestones.find(
    (item) => item.milestoneType === "current_vector",
  );

  return currentVector?.milestoneId === milestone.milestoneId;
};
