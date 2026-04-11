/**
 * Member Dossier types aligned with backend API contracts.
 */

import type { AnalysisStatus } from "@/types/organization";

export type DossierTab =
  | "overview"
  | "competency"
  | "kpt"
  | "cases"
  | "journey";
export type DossierMaturity =
  | "advanced"
  | "proficient"
  | "developing"
  | "emerging";

export interface DossierMember {
  memberId: string;
  displayName: string;
  roleName: string | null;
  teamName: string;
  analysisStatus: AnalysisStatus;
  latestRunId: string | null;
  latestRunProgress: number;
  latestRunStage: string | null;
}

export interface CategoryScore {
  categoryScoreId: string;
  categoryId: string;
  score: number | null;
  confidenceScore: number;
  confidenceLabel: string;
  includedDimensions: string[];
  excludedDimensions: string[];
  explanationSummary: string | null;
}

export interface ProfileOverviewResponse {
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
  categoryScores: CategoryScore[];
}

export interface DimensionScore {
  scoreId: string;
  dimensionId: string;
  rawScore: number | null;
  normalizedScore: number | null;
  maturityLevel: DossierMaturity;
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

export interface ProfileCompetencyResponse {
  runId: string;
  dimensionScores: DimensionScore[];
  categoryScores: CategoryScore[];
}

export interface KptItem {
  kptId: string;
  itemType: "keep" | "problem" | "try";
  title: string;
  summary: string | null;
  linkedDimensionIds: string[];
  linkedProblemIds: string[];
  displayOrder: number;
}

export interface ProfileKptResponse {
  runId: string;
  keepItems: KptItem[];
  problemItems: KptItem[];
  tryItems: KptItem[];
}

export interface CaseFeedback {
  caseId: string;
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

export interface ProfileCasesResponse {
  runId: string;
  cases: CaseFeedback[];
}

export interface Milestone {
  milestoneId: string;
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

export interface ProfileJourneyResponse {
  runId: string;
  growthJourneySummary: string | null;
  currentGrowthPath: string | null;
  milestones: Milestone[];
}

export interface EvidenceTrace {
  dimensionId: string;
  supportingCount: number;
  counterCount: number;
  summary: string;
}

export interface DossierTrustStripViewModel {
  confidenceLabel: string;
  flaggedLabel: string;
  reviewLabel: string;
  fairnessNote: string | null;
}

export interface DossierHeaderViewModel {
  memberName: string;
  roleName: string;
  teamName: string;
  status: AnalysisStatus;
}

export interface DossierBriefViewModel {
  currentGrowthPath: string;
  growthJourneySummary: string;
  strengthDimensionLabels: string[];
  growthDimensionLabels: string[];
}
