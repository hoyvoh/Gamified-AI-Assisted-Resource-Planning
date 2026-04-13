export const ANALYSIS_STATUS_VALUES = [
  "not_analyzed",
  "analyzing",
  "completed",
  "failed",
] as const;

export type AnalysisStatus = (typeof ANALYSIS_STATUS_VALUES)[number];

export const DEFAULT_ANALYSIS_STATUS: AnalysisStatus = "not_analyzed";

const ANALYSIS_STATUS_ALIASES: Record<string, AnalysisStatus> = {
  idle: "not_analyzed",
  not_started: "not_analyzed",
  not_analyzed: "not_analyzed",
  pending: "not_analyzed",
  queued: "not_analyzed",
  collecting: "analyzing",
  collecting_data: "analyzing",
  extracting_evidence: "analyzing",
  inferring_dimensions: "analyzing",
  scoring: "analyzing",
  generating_kpt: "analyzing",
  self_checking: "analyzing",
  analyzing: "analyzing",
  running: "analyzing",
  completed: "completed",
  success: "completed",
  failed: "failed",
  error: "failed",
} as const;

export const isAnalysisStatus = (value: string): value is AnalysisStatus =>
  ANALYSIS_STATUS_VALUES.includes(value as AnalysisStatus);

export const normalizeAnalysisStatus = (
  value: string | null | undefined,
): AnalysisStatus =>
  value
    ? ANALYSIS_STATUS_ALIASES[value.toLowerCase()] ?? DEFAULT_ANALYSIS_STATUS
    : DEFAULT_ANALYSIS_STATUS;
