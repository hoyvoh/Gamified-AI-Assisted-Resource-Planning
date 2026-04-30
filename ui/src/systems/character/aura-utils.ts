/**
 * Aura Component Utilities
 * Status/color constants (shader functions removed - aura rings deprecated)
 */

import { normalizeAnalysisStatus, type AnalysisStatus } from "@/types/organization";

/**
 * Status codes for GPU uniforms (since GPUs don't support enums)
 */
export const STATUS_CODES: Record<AnalysisStatus, number> = {
  not_analyzed: 0,
  analyzing: 1,
  completed: 2,
  failed: 3,
} as const;

/**
 * Status to primary color mapping for aura mid-layer
 */
export const STATUS_TO_COLOR: Record<AnalysisStatus, string> = {
  not_analyzed: "#64748b", // Slate gray
  analyzing: "#06b6d4", // Bright cyan
  completed: "#6ee7b7", // Emerald
  failed: "#dc2626", // Red
} as const;

export const getStatusCode = (status: string | null | undefined): number =>
  STATUS_CODES[normalizeAnalysisStatus(status)];

export const getStatusColorToken = (status: string | null | undefined): string =>
  STATUS_TO_COLOR[normalizeAnalysisStatus(status)];
