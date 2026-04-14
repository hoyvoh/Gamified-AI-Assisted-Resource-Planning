import {
  DOSSIER_MATURITY_VALUES,
  type RawAnalysisRunResponse,
  type RawBehavioralEvent,
  type RawCaseFeedback,
  type RawCategoryScore,
  type RawDimensionDetailResponse,
  type RawDimensionScore,
  type RawDimensionScoreDetail,
  type RawEvidenceUnit,
  type RawKptItem,
  type RawMemberResponse,
  type RawMilestone,
  type RawProfileCasesResponse,
  type RawProfileCompetencyResponse,
  type RawProfileJourneyResponse,
  type RawProfileKptResponse,
  type RawProfileOverviewResponse,
  type RawRoleProfileResponse,
  type RawValidationFlagResponse,
} from "@/features/dossier/api/dossier-api.types";
import type {
  AnalysisRun,
  BehavioralEvent,
  CaseFeedback,
  CategoryScore,
  DimensionDetailResponse,
  DimensionScore,
  DimensionScoreDetail,
  DossierBootstrapData,
  DossierMaturity,
  EvidenceUnit,
  KptItem,
  Milestone,
  ProfileCasesResponse,
  ProfileCompetencyResponse,
  ProfileJourneyResponse,
  ProfileKptResponse,
  ProfileOverviewResponse,
  ValidationFlag,
} from "@/features/dossier/types/dossier.types";
import { normalizeAnalysisStatus } from "@/types/organization";

const DEFAULT_DOSSIER_MATURITY: DossierMaturity = "developing";
const DEFAULT_TEAM_NAME = "Team pending";
const DEFAULT_CONFIDENCE = 0;

const normalizeMaturityLevel = (
  value: string | null | undefined,
): DossierMaturity =>
  DOSSIER_MATURITY_VALUES.includes(value as DossierMaturity)
    ? (value as DossierMaturity)
    : DEFAULT_DOSSIER_MATURITY;

export const toCategoryScore = (raw: RawCategoryScore): CategoryScore => ({
  categoryScoreId: raw.category_score_id,
  categoryId: raw.category_id,
  score: raw.score,
  confidenceScore: raw.confidence_score,
  confidenceLabel: raw.confidence_label,
  includedDimensions: raw.included_dimensions,
  excludedDimensions: raw.excluded_dimensions,
  explanationSummary: raw.explanation_summary,
});

export const toDimensionScore = (raw: RawDimensionScore): DimensionScore => ({
  scoreId: raw.score_id,
  dimensionId: raw.dimension_id,
  rawScore: raw.raw_score,
  normalizedScore: raw.normalized_score,
  maturityLevel: normalizeMaturityLevel(raw.maturity_level),
  confidenceScore: raw.confidence_score,
  confidenceLabel: raw.confidence_label,
  opportunityScore: raw.opportunity_score,
  opportunityLabel: raw.opportunity_label,
  deltaValue: raw.delta_value,
  deltaLabel: raw.delta_label,
  totalSignals: raw.total_signals,
  positiveSignals: raw.positive_signals,
  negativeSignals: raw.negative_signals,
  mixedSignals: raw.mixed_signals,
  explanationSummary: raw.explanation_summary,
  limitationNotes: raw.limitation_notes,
  topSupportingEvidenceIds: raw.top_supporting_evidence_ids,
  topCounterEvidenceIds: raw.top_counter_evidence_ids,
  uiSummary: raw.ui_summary,
});

export const toProfileOverview = (
  raw: RawProfileOverviewResponse,
): ProfileOverviewResponse => ({
  runId: raw.run_id,
  memberId: raw.member_id,
  periodStart: raw.period_start,
  periodEnd: raw.period_end,
  scoringVersion: raw.scoring_version,
  p8Approved: raw.p8_approved,
  overallConfidence: raw.overall_confidence,
  profileSummary: raw.profile_summary,
  growthJourneySummary: raw.growth_journey_summary,
  currentGrowthPath: raw.current_growth_path,
  topStrengthDimensionIds: raw.top_strength_dimension_ids,
  topGrowthDimensionIds: raw.top_growth_dimension_ids,
  insufficientDimensions: raw.insufficient_dimensions,
  fairnessNotes: raw.fairness_notes,
  categoryScores: raw.category_scores.map(toCategoryScore),
});

export const toProfileCompetency = (
  raw: RawProfileCompetencyResponse,
): ProfileCompetencyResponse => ({
  runId: raw.run_id,
  dimensionScores: raw.dimension_scores.map(toDimensionScore),
  categoryScores: raw.category_scores.map(toCategoryScore),
});

const toKptItem = (raw: RawKptItem): KptItem => ({
  kptId: raw.kpt_id,
  itemType:
    raw.item_type === "keep" || raw.item_type === "problem" || raw.item_type === "try"
      ? raw.item_type
      : "try",
  title: raw.title,
  summary: raw.summary,
  linkedDimensionIds: raw.linked_dimension_ids,
  linkedProblemIds: raw.linked_problem_ids,
  displayOrder: raw.display_order,
});

export const toProfileKpt = (raw: RawProfileKptResponse): ProfileKptResponse => ({
  runId: raw.run_id,
  keepItems: raw.keep_items.map(toKptItem),
  problemItems: raw.problem_items.map(toKptItem),
  tryItems: raw.try_items.map(toKptItem),
});

const toCaseFeedback = (raw: RawCaseFeedback): CaseFeedback => ({
  caseId: raw.case_id,
  analysisRunId: raw.analysis_run_id,
  title: raw.title,
  category: raw.category,
  impactLevel: raw.impact_level,
  summary: raw.summary,
  whyItMatters: raw.why_it_matters,
  observedPattern: raw.observed_pattern,
  betterAlternative: raw.better_alternative,
  nextTimeGuidance: raw.next_time_guidance,
  linkedDimensionIds: raw.linked_dimension_ids,
  supportingEventIds: raw.supporting_event_ids,
  confidenceScore: raw.confidence_score,
  displayOrder: raw.display_order,
});

export const toProfileCases = (
  raw: RawProfileCasesResponse,
): ProfileCasesResponse => ({
  runId: raw.run_id,
  cases: raw.cases.map(toCaseFeedback),
});

const toMilestone = (raw: RawMilestone): Milestone => ({
  milestoneId: raw.milestone_id,
  memberId: raw.member_id,
  sourceAnalysisRunId: raw.source_analysis_run_id,
  timestamp: raw.timestamp,
  milestoneType: raw.milestone_type,
  title: raw.title,
  summary: raw.summary,
  impactScore: raw.impact_score,
  supportingEventIds: raw.supporting_event_ids,
  createdAt: raw.created_at,
});

export const toProfileJourney = (
  raw: RawProfileJourneyResponse,
): ProfileJourneyResponse => ({
  runId: raw.run_id,
  growthJourneySummary: raw.growth_journey_summary,
  currentGrowthPath: raw.current_growth_path,
  milestones: raw.milestones.map(toMilestone),
});

const toEvidenceUnit = (raw: RawEvidenceUnit): EvidenceUnit => ({
  evidenceId: raw.evidence_id,
  analysisRunId: raw.analysis_run_id,
  memberId: raw.member_id,
  timestamp: raw.timestamp,
  sourceType: raw.source_type,
  recordType: raw.record_type,
  recordId: raw.record_id,
  contentExcerpt: raw.content_excerpt,
  contentSummary: raw.content_summary,
  extractionConfidence: raw.extraction_confidence,
  ambiguityNotes: raw.ambiguity_notes,
  createdAt: raw.created_at,
});

const toBehavioralEvent = (raw: RawBehavioralEvent): BehavioralEvent => ({
  eventId: raw.event_id,
  timestamp: raw.timestamp,
  eventType: raw.event_type,
  eventSummary: raw.event_summary,
  polarity: raw.polarity,
  severity: raw.severity,
  eventConfidence: raw.event_confidence,
  impactLevel: raw.impact_level,
  opportunityLevel: raw.opportunity_level,
  relatedDimensions: raw.related_dimensions,
  whyItMatters: raw.why_it_matters,
});

const toDimensionScoreDetail = (
  raw: RawDimensionScoreDetail,
): DimensionScoreDetail => ({
  ...toDimensionScore(raw),
  p3Inference: raw.p3_inference,
});

export const toDimensionDetail = (
  raw: RawDimensionDetailResponse,
): DimensionDetailResponse => ({
  dimensionScore: toDimensionScoreDetail(raw.dimension_score),
  supportingEvidence: raw.supporting_evidence.map(toEvidenceUnit),
  counterEvidence: raw.counter_evidence.map(toEvidenceUnit),
  behavioralEvents: raw.behavioral_events.map(toBehavioralEvent),
});

export const toValidationFlag = (
  raw: RawValidationFlagResponse,
): ValidationFlag => ({
  flagId: raw.flag_id,
  analysisRunId: raw.analysis_run_id,
  dimensionId: raw.dimension_id,
  verdict: raw.verdict,
  note: raw.note,
  flaggedAt: raw.flagged_at,
});

export const toAnalysisRun = (raw: RawAnalysisRunResponse): AnalysisRun => ({
  analysisRunId: raw.analysis_run_id,
  memberId: raw.member_id,
  periodStart: raw.period_start,
  periodEnd: raw.period_end,
  runType: raw.run_type,
  status: normalizeAnalysisStatus(raw.status),
  progressStage: raw.progress_stage,
  progressPct: raw.progress_pct,
  errorMessage: raw.error_message,
  scoringVersion: raw.scoring_version,
  createdAt: raw.created_at,
  updatedAt: raw.updated_at,
  completedAt: raw.completed_at,
});

export const toTeamName = (
  member: RawMemberResponse,
  organizationTeams: Array<{ team_id: string; name: string }> | null,
): string =>
  organizationTeams?.find((team) => team.team_id === member.team_id)?.name ??
  DEFAULT_TEAM_NAME;

export const toRoleName = (
  member: RawMemberResponse,
  roles: RawRoleProfileResponse[],
): string | null =>
  roles.find((role) => role.role_profile_id === member.role_profile_id)?.role_name ??
  null;

export const toBootstrapData = ({
  member,
  roleName,
  teamName,
  latestRun,
  overview,
}: {
  member: RawMemberResponse;
  roleName: string | null;
  teamName: string;
  latestRun: AnalysisRun | null;
  overview: ProfileOverviewResponse | null;
}): DossierBootstrapData => ({
  memberId: member.member_id,
  memberName: member.display_name,
  roleName,
  teamName,
  analysisStatus: normalizeAnalysisStatus(member.analysis_status),
  confidence: overview?.overallConfidence ?? DEFAULT_CONFIDENCE,
  initialOverview: overview,
  latestRun,
});
