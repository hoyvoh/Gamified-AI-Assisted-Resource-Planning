export const ANALYSIS_STATUS_VALUES = [
  "not_analyzed",
  "analyzing",
  "completed",
  "failed",
] as const;

export type AnalysisStatus = (typeof ANALYSIS_STATUS_VALUES)[number];

export const DEFAULT_ANALYSIS_STATUS: AnalysisStatus = "not_analyzed";

export const isAnalysisStatus = (value: string): value is AnalysisStatus =>
  ANALYSIS_STATUS_VALUES.includes(value as AnalysisStatus);

export const normalizeAnalysisStatus = (
  value: string | null | undefined,
): AnalysisStatus =>
  value && isAnalysisStatus(value) ? value : DEFAULT_ANALYSIS_STATUS;
