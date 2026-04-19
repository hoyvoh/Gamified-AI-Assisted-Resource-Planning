import type {
  ChamberAnalysisRunResponse,
  ChamberBehavioralEventResponse,
  ChamberBootstrapData,
  ChamberCaseResponse,
  ChamberCasesResponse,
  ChamberCategoryScoreResponse,
  ChamberCompetencyResponse,
  ChamberDimensionDetailResponse,
  ChamberDimensionScoreDetailResponse,
  ChamberDimensionScoreResponse,
  ChamberEvidenceUnitResponse,
  ChamberJourneyResponse,
  ChamberKptItemResponse,
  ChamberKptResponse,
  ChamberMemberResponse,
  ChamberOverviewResponse,
  ChamberValidationFlagRequest,
  ChamberValidationFlagResponse,
} from "@/features/analysis-chamber/api/analysis-chamber-api.types";
import type {
  ChamberAnalysisRun,
  ChamberBehavioralEvent,
  ChamberBootstrap,
  ChamberCase,
  ChamberCases,
  ChamberCategoryScore,
  ChamberCompetency,
  ChamberDimensionDetail,
  ChamberDimensionScore,
  ChamberDimensionScoreDetail,
  ChamberEvidenceUnit,
  ChamberJourney,
  ChamberKpt,
  ChamberKptItem,
  ChamberMember,
  ChamberMilestone,
  ChamberOverview,
  ChamberValidationFlag,
  ChamberValidationFlagInput,
} from "@/features/analysis-chamber/api/analysis-chamber-api.view-models";
import { normalizeAnalysisStatus } from "@/types/organization";

export const mapChamberMember = (
  member: ChamberMemberResponse,
): ChamberMember => ({
  id: member.member_id,
  teamId: member.team_id,
  organizationId: member.organization_id,
  displayName: member.display_name,
  externalId: member.external_id,
  roleProfileId: member.role_profile_id,
  analysisStatus: normalizeAnalysisStatus(member.analysis_status),
  lastAnalysisAt: member.last_analysis_at,
  createdAt: member.created_at,
  updatedAt: member.updated_at,
});

export const mapChamberAnalysisRun = (
  run: ChamberAnalysisRunResponse,
): ChamberAnalysisRun => ({
  id: run.analysis_run_id,
  memberId: run.member_id,
  periodStart: run.period_start,
  periodEnd: run.period_end,
  runType: run.run_type,
  status: run.status,
  progressStage: run.progress_stage,
  progressPct: run.progress_pct,
  errorMessage: run.error_message,
  scoringVersion: run.scoring_version,
  createdAt: run.created_at,
  updatedAt: run.updated_at,
  completedAt: run.completed_at,
});

export const mapChamberCategoryScore = (
  category: ChamberCategoryScoreResponse,
): ChamberCategoryScore => ({
  id: category.category_score_id,
  categoryId: category.category_id,
  score: category.score,
  confidenceScore: category.confidence_score,
  confidenceLabel: category.confidence_label,
  includedDimensions: category.included_dimensions,
  excludedDimensions: category.excluded_dimensions,
  explanationSummary: category.explanation_summary,
});

export const mapChamberOverview = (
  overview: ChamberOverviewResponse,
): ChamberOverview => ({
  runId: overview.run_id,
  memberId: overview.member_id,
  periodStart: overview.period_start,
  periodEnd: overview.period_end,
  scoringVersion: overview.scoring_version,
  p8Approved: overview.p8_approved,
  overallConfidence: overview.overall_confidence,
  profileSummary: overview.profile_summary,
  growthJourneySummary: overview.growth_journey_summary,
  currentGrowthPath: overview.current_growth_path,
  topStrengthDimensionIds: overview.top_strength_dimension_ids,
  topGrowthDimensionIds: overview.top_growth_dimension_ids,
  insufficientDimensions: overview.insufficient_dimensions,
  fairnessNotes: overview.fairness_notes,
  categoryScores: overview.category_scores.map(mapChamberCategoryScore),
});

export const mapChamberDimensionScore = (
  dimension: ChamberDimensionScoreResponse,
): ChamberDimensionScore => ({
  id: dimension.score_id,
  dimensionId: dimension.dimension_id,
  rawScore: dimension.raw_score,
  normalizedScore: dimension.normalized_score,
  maturityLevel: dimension.maturity_level,
  confidenceScore: dimension.confidence_score,
  confidenceLabel: dimension.confidence_label,
  opportunityScore: dimension.opportunity_score,
  opportunityLabel: dimension.opportunity_label,
  deltaValue: dimension.delta_value,
  deltaLabel: dimension.delta_label,
  totalSignals: dimension.total_signals,
  positiveSignals: dimension.positive_signals,
  negativeSignals: dimension.negative_signals,
  mixedSignals: dimension.mixed_signals,
  explanationSummary: dimension.explanation_summary,
  limitationNotes: dimension.limitation_notes,
  topSupportingEvidenceIds: dimension.top_supporting_evidence_ids,
  topCounterEvidenceIds: dimension.top_counter_evidence_ids,
  uiSummary: dimension.ui_summary,
});

const mapChamberDimensionScoreDetail = (
  dimension: ChamberDimensionScoreDetailResponse,
): ChamberDimensionScoreDetail => ({
  ...mapChamberDimensionScore(dimension),
  p3Inference: dimension.p3_inference,
});

export const mapChamberCompetency = (
  competency: ChamberCompetencyResponse,
): ChamberCompetency => ({
  runId: competency.run_id,
  dimensionScores: competency.dimension_scores.map(mapChamberDimensionScore),
  categoryScores: competency.category_scores.map(mapChamberCategoryScore),
});

const mapChamberEvidenceUnit = (
  evidence: ChamberEvidenceUnitResponse,
): ChamberEvidenceUnit => ({
  id: evidence.evidence_id,
  analysisRunId: evidence.analysis_run_id,
  memberId: evidence.member_id,
  timestamp: evidence.timestamp,
  sourceType: evidence.source_type,
  recordType: evidence.record_type,
  recordId: evidence.record_id,
  contentExcerpt: evidence.content_excerpt,
  contentSummary: evidence.content_summary,
  extractionConfidence: evidence.extraction_confidence,
  ambiguityNotes: evidence.ambiguity_notes,
  createdAt: evidence.created_at,
});

const mapChamberBehavioralEvent = (
  event: ChamberBehavioralEventResponse,
): ChamberBehavioralEvent => ({
  id: event.event_id,
  timestamp: event.timestamp,
  eventType: event.event_type,
  eventSummary: event.event_summary,
  polarity: event.polarity,
  severity: event.severity,
  eventConfidence: event.event_confidence,
  impactLevel: event.impact_level,
  opportunityLevel: event.opportunity_level,
  relatedDimensions: event.related_dimensions,
  whyItMatters: event.why_it_matters,
});

export const mapChamberDimensionDetail = (
  detail: ChamberDimensionDetailResponse,
): ChamberDimensionDetail => ({
  dimensionScore: mapChamberDimensionScoreDetail(detail.dimension_score),
  supportingEvidence: detail.supporting_evidence.map(mapChamberEvidenceUnit),
  counterEvidence: detail.counter_evidence.map(mapChamberEvidenceUnit),
  behavioralEvents: detail.behavioral_events.map(mapChamberBehavioralEvent),
});

const mapChamberKptItem = (item: ChamberKptItemResponse): ChamberKptItem => ({
  id: item.kpt_id,
  itemType: item.item_type,
  title: item.title,
  summary: item.summary,
  linkedDimensionIds: item.linked_dimension_ids,
  linkedProblemIds: item.linked_problem_ids,
  displayOrder: item.display_order,
});

export const mapChamberKpt = (kpt: ChamberKptResponse): ChamberKpt => ({
  runId: kpt.run_id,
  keepItems: kpt.keep_items.map(mapChamberKptItem),
  problemItems: kpt.problem_items.map(mapChamberKptItem),
  tryItems: kpt.try_items.map(mapChamberKptItem),
});

export const mapChamberCase = (entry: ChamberCaseResponse): ChamberCase => ({
  id: entry.case_id,
  analysisRunId: entry.analysis_run_id,
  title: entry.title,
  category: entry.category,
  impactLevel: entry.impact_level,
  summary: entry.summary,
  whyItMatters: entry.why_it_matters,
  observedPattern: entry.observed_pattern,
  betterAlternative: entry.better_alternative,
  nextTimeGuidance: entry.next_time_guidance,
  linkedDimensionIds: entry.linked_dimension_ids,
  supportingEventIds: entry.supporting_event_ids,
  confidenceScore: entry.confidence_score,
  displayOrder: entry.display_order,
});

export const mapChamberCases = (cases: ChamberCasesResponse): ChamberCases => ({
  runId: cases.run_id,
  cases: cases.cases.map(mapChamberCase),
});

const mapChamberMilestone = (
  milestone: ChamberJourneyResponse["milestones"][number],
): ChamberMilestone => ({
  id: milestone.milestone_id,
  memberId: milestone.member_id,
  sourceAnalysisRunId: milestone.source_analysis_run_id,
  timestamp: milestone.timestamp,
  milestoneType: milestone.milestone_type,
  title: milestone.title,
  summary: milestone.summary,
  impactScore: milestone.impact_score,
  supportingEventIds: milestone.supporting_event_ids,
  createdAt: milestone.created_at,
});

export const mapChamberJourney = (
  journey: ChamberJourneyResponse,
): ChamberJourney => ({
  runId: journey.run_id,
  growthJourneySummary: journey.growth_journey_summary,
  currentGrowthPath: journey.current_growth_path,
  milestones: journey.milestones.map(mapChamberMilestone),
});

export const mapChamberValidationFlag = (
  flag: ChamberValidationFlagResponse,
): ChamberValidationFlag => ({
  id: flag.flag_id,
  analysisRunId: flag.analysis_run_id,
  dimensionId: flag.dimension_id,
  verdict: flag.verdict,
  note: flag.note,
  flaggedAt: flag.flagged_at,
});

export const mapChamberValidationFlagInput = (
  input: ChamberValidationFlagInput,
): ChamberValidationFlagRequest => ({
  analysis_run_id: input.analysisRunId,
  dimension_id: input.dimensionId,
  verdict: input.verdict,
  note: input.note,
});

export const mapChamberBootstrap = (
  bootstrap: ChamberBootstrapData,
): ChamberBootstrap => ({
  member: mapChamberMember(bootstrap.member),
  roleName: bootstrap.role_name,
  teamName: bootstrap.team_name,
  latestRun: bootstrap.latest_run
    ? mapChamberAnalysisRun(bootstrap.latest_run)
    : null,
  analysisStatus: bootstrap.analysis_status,
});
