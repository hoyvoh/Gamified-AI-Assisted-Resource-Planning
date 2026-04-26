import type { ChamberMilestone } from "@/features/analysis-chamber/api/analysis-chamber-api.view-models";

import type {
  JourneyMapPosition,
  JourneyMilestoneState,
  JourneyMilestoneViewModel,
} from "@/features/analysis-chamber/components/stages/journey/journey-stage.types";

const MAP_ROWS = [72, 54, 30, 42, 20, 46, 66, 36];

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const humanizeMilestoneType = (milestoneType: string) =>
  milestoneType
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const formatMilestoneDate = (timestamp: string) => {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
};

const getLandmarkArchetype = (milestoneType: string) => {
  const normalized = milestoneType.toLowerCase();

  if (normalized.includes("ownership")) {
    return "Command Keep";
  }

  if (normalized.includes("quality")) {
    return "Bastion Tower";
  }

  if (normalized.includes("collaboration")) {
    return "Signal Fort";
  }

  if (normalized.includes("growth")) {
    return "Training Barracks";
  }

  if (normalized.includes("challenge")) {
    return "Frontier Outpost";
  }

  return "Stronghold";
};

const getLandmarkAsset = (milestoneType: string) => {
  const normalized = milestoneType.toLowerCase();

  if (normalized.includes("ownership")) {
    return "/journey-map/landmarks/castle.png";
  }

  if (normalized.includes("quality")) {
    return "/journey-map/landmarks/castle.png";
  }

  if (normalized.includes("collaboration")) {
    return "/journey-map/landmarks/castle.png";
  }

  if (normalized.includes("growth")) {
    return "/journey-map/landmarks/castle.png";
  }

  if (normalized.includes("challenge")) {
    return "/journey-map/landmarks/castle.png";
  }

  return "/journey-map/landmarks/castle.png";
};

export const getJourneyMapPosition = (
  index: number,
  total: number,
): JourneyMapPosition => {
  if (total <= 1) {
    return { left: 18, top: 54 };
  }

  const progress = index / (total - 1);
  const left = 12 + progress * 74;
  const row = MAP_ROWS[index % MAP_ROWS.length] ?? 50;

  return {
    left: clamp(left, 10, 88),
    top: row,
  };
};

export const getJourneyMilestoneState = (
  milestoneIndex: number,
  focusedIndex: number,
): JourneyMilestoneState => {
  // The backend does not provide explicit progress state yet.
  // Per the approved spec, the UI derives state from milestone order.
  if (milestoneIndex < focusedIndex) {
    return "conquered";
  }

  if (milestoneIndex === focusedIndex) {
    return "frontier";
  }

  return "unconquered";
};

export const buildJourneyMilestoneViewModels = (
  milestones: ChamberMilestone[],
  focusedIndex: number,
): JourneyMilestoneViewModel[] =>
  milestones.map((milestone, index) => ({
    milestone,
    index,
    state: getJourneyMilestoneState(index, focusedIndex),
    position: getJourneyMapPosition(index, milestones.length),
    archetypeLabel: getLandmarkArchetype(milestone.milestoneType),
    landmarkLabel: `Stronghold ${String(index + 1).padStart(2, "0")}`,
    landmarkAsset: getLandmarkAsset(milestone.milestoneType),
  }));
