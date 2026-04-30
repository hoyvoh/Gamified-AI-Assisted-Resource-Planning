import type { ChamberMilestone } from "@/features/analysis-chamber/api/analysis-chamber-api.view-models";

export type JourneyMilestoneState =
  | "conquered"
  | "frontier"
  | "unconquered";

export interface JourneyMapPosition {
  left: number;
  top: number;
}

export interface JourneyMilestoneViewModel {
  milestone: ChamberMilestone;
  index: number;
  state: JourneyMilestoneState;
  position: JourneyMapPosition;
  archetypeLabel: string;
  landmarkLabel: string;
  landmarkAsset: string;
}
