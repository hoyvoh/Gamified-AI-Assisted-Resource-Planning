export type BranchTier = "intermediate" | "advanced" | "master";

/** @deprecated Use TIER_MASTER_CRIMSON from branch-tier-colors instead */
export { TIER_MASTER_CRIMSON as MASTER_CRIMSON } from "@/features/analysis-chamber/lib/branch-tier-colors";

/** Resolve a raw maturity level string into one of the three canonical tiers */
export function resolveTier(maturityLevel: string): BranchTier {
  const n = maturityLevel.toLowerCase();
  if (n.includes("master")) return "master";
  if (n.includes("advanced") || n.includes("proficient")) return "advanced";
  return "intermediate";
}

export interface TierEffects {
  /** Sparkle particles shown in the modal (sliced from the full SPARKLES array) */
  sparkleCount: number;
  /** Ember/ash particles shown in the modal aura (sliced from EMBER_PARTICLES) */
  emberCount: number;
  /** Multiplier on each ember's peak opacity — higher = brighter cloud */
  emberPeakMultiplier: number;
  /** Duration (ms) for the modal vertical float bob */
  floatDuration: number;
  /** Whether to fire the crimson secondary bloom on modal open (master only) */
  hasCrimsonBloom: boolean;
  /** Duration (ms) for the modal breath-glow cycle */
  modalBreathDuration: number;
}

export function getTierEffects(tier: BranchTier): TierEffects {
  switch (tier) {
    case "master":
      return {
        sparkleCount: 10,
        emberCount: 20,
        emberPeakMultiplier: 1.4,
        floatDuration: 3200,
        hasCrimsonBloom: true,
        modalBreathDuration: 2800,
      };
    case "advanced":
      return {
        sparkleCount: 6,
        emberCount: 14,
        emberPeakMultiplier: 1.0,
        floatDuration: 4400,
        hasCrimsonBloom: false,
        modalBreathDuration: 4000,
      };
    default:
      return {
        sparkleCount: 3,
        emberCount: 8,
        emberPeakMultiplier: 0.7,
        floatDuration: 5200,
        hasCrimsonBloom: false,
        modalBreathDuration: 5200,
      };
  }
}
