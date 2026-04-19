import type { AnalysisStatus } from "@/types/organization";

export interface ChamberMember {
  id: string;
  teamId: string;
  organizationId: string;
  displayName: string;
  externalId: string | null;
  roleProfileId: string | null;
  analysisStatus: AnalysisStatus;
  lastAnalysisAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChamberAnalysisRun {
  id: string;
  memberId: string;
  periodStart: string;
  periodEnd: string;
  runType: string;
  status: string;
  progressStage: string | null;
  progressPct: number;
  errorMessage: string | null;
  scoringVersion: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface ChamberCategoryScore {
  id: string;
  categoryId: string;
  score: number | null;
  confidenceScore: number;
  confidenceLabel: string;
  includedDimensions: string[];
  excludedDimensions: string[];
  explanationSummary: string | null;
}

export interface ChamberOverview {
  runId: string;
  memberId: string;
  periodStart: string;
  periodEnd: string;
  scoringVersion: string | null;
  p8Approved: boolean;
  overallConfidence: number | null;
  profileSummary: string | null;
  growthJourneySummary: string | null;
  currentGrowthPath: string | null;
  topStrengthDimensionIds: string[];
  topGrowthDimensionIds: string[];
  insufficientDimensions: string[];
  fairnessNotes: string[];
  categoryScores: ChamberCategoryScore[];
}

export interface ChamberDimensionScore {
  id: string;
  dimensionId: string;
  rawScore: number | null;
  normalizedScore: number | null;
  maturityLevel: string;
  confidenceScore: number;
  confidenceLabel: string;
  opportunityScore: number;
  opportunityLabel: string;
  deltaValue: number | null;
  deltaLabel: string;
  totalSignals: number;
  positiveSignals: number;
  negativeSignals: number;
  mixedSignals: number;
  explanationSummary: string | null;
  limitationNotes: string[];
  topSupportingEvidenceIds: string[];
  topCounterEvidenceIds: string[];
  uiSummary: string | null;
}

export interface ChamberCompetency {
  runId: string;
  dimensionScores: ChamberDimensionScore[];
  categoryScores: ChamberCategoryScore[];
}

export interface ChamberDimensionScoreDetail extends ChamberDimensionScore {
  p3Inference: Record<string, unknown>;
}

export interface ChamberEvidenceUnit {
  id: string;
  analysisRunId: string;
  memberId: string;
  timestamp: string;
  sourceType: string | null;
  recordType: string | null;
  recordId: string | null;
  contentExcerpt: string;
  contentSummary: string;
  extractionConfidence: number | null;
  ambiguityNotes: string[];
  createdAt: string;
}

export interface ChamberBehavioralEvent {
  id: string;
  timestamp: string;
  eventType: string;
  eventSummary: string | null;
  polarity: string;
  severity: number | null;
  eventConfidence: number | null;
  impactLevel: string | null;
  opportunityLevel: string | null;
  relatedDimensions: Array<Record<string, string | number>>;
  whyItMatters: string | null;
}

export interface ChamberDimensionDetail {
  dimensionScore: ChamberDimensionScoreDetail;
  supportingEvidence: ChamberEvidenceUnit[];
  counterEvidence: ChamberEvidenceUnit[];
  behavioralEvents: ChamberBehavioralEvent[];
}

export interface ChamberKptItem {
  id: string;
  itemType: "keep" | "problem" | "try" | string;
  title: string;
  summary: string | null;
  linkedDimensionIds: string[];
  linkedProblemIds: string[];
  displayOrder: number;
}

export interface ChamberKpt {
  runId: string;
  keepItems: ChamberKptItem[];
  problemItems: ChamberKptItem[];
  tryItems: ChamberKptItem[];
}

export interface ChamberCase {
  id: string;
  analysisRunId: string;
  title: string;
  category: string | null;
  impactLevel: string | null;
  summary: string | null;
  whyItMatters: string | null;
  observedPattern: string | null;
  betterAlternative: string | null;
  nextTimeGuidance: string | null;
  linkedDimensionIds: string[];
  supportingEventIds: string[];
  confidenceScore: number | null;
  displayOrder: number;
}

export interface ChamberCases {
  runId: string;
  cases: ChamberCase[];
}

export interface ChamberMilestone {
  id: string;
  memberId: string;
  sourceAnalysisRunId: string | null;
  timestamp: string;
  milestoneType: string;
  title: string;
  summary: string | null;
  impactScore: number | null;
  supportingEventIds: string[];
  createdAt: string;
}

export interface ChamberJourney {
  runId: string;
  growthJourneySummary: string | null;
  currentGrowthPath: string | null;
  milestones: ChamberMilestone[];
}

export interface ChamberValidationFlag {
  id: string;
  analysisRunId: string;
  dimensionId: string;
  verdict: "accurate" | "questionable" | "incorrect";
  note: string | null;
  flaggedAt: string;
}

export interface ChamberValidationFlagInput {
  analysisRunId: string;
  dimensionId: string;
  verdict: "accurate" | "questionable" | "incorrect";
  note: string | null;
}

export interface ChamberBootstrap {
  member: ChamberMember;
  roleName: string | null;
  teamName: string;
  latestRun: ChamberAnalysisRun | null;
  analysisStatus: AnalysisStatus;
}
