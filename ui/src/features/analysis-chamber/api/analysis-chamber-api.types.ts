import type { AnalysisStatus } from "@/types/organization";

export interface DataEnvelope<T> {
  data: T;
}

export interface ApiErrorResponse {
  detail?: string;
}

export interface ChamberMemberResponse {
  member_id: string;
  team_id: string;
  organization_id: string;
  display_name: string;
  external_id: string | null;
  role_profile_id: string | null;
  analysis_status: string;
  last_analysis_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChamberRoleProfileResponse {
  role_profile_id: string;
  role_name: string;
  expected_dimension_weights: Record<string, number>;
  expected_opportunity_levels: Record<string, string>;
  expected_maturity_ranges: Record<string, string>;
}

export interface ChamberOrganizationTeamResponse {
  team_id: string;
  name: string;
}

export interface ChamberOrganizationResponse {
  organization_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  teams: ChamberOrganizationTeamResponse[];
}

export interface ChamberAnalysisRunResponse {
  analysis_run_id: string;
  member_id: string;
  period_start: string;
  period_end: string;
  run_type: string;
  status: string;
  progress_stage: string | null;
  progress_pct: number;
  error_message: string | null;
  scoring_version: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface ChamberCategoryScoreResponse {
  category_score_id: string;
  category_id: string;
  score: number | null;
  confidence_score: number;
  confidence_label: string;
  included_dimensions: string[];
  excluded_dimensions: string[];
  explanation_summary: string | null;
}

export interface ChamberOverviewResponse {
  run_id: string;
  member_id: string;
  period_start: string;
  period_end: string;
  scoring_version: string | null;
  p8_approved: boolean;
  overall_confidence: number | null;
  profile_summary: string | null;
  growth_journey_summary: string | null;
  current_growth_path: string | null;
  top_strength_dimension_ids: string[];
  top_growth_dimension_ids: string[];
  insufficient_dimensions: string[];
  fairness_notes: string[];
  category_scores: ChamberCategoryScoreResponse[];
}

export interface ChamberDimensionScoreResponse {
  score_id: string;
  dimension_id: string;
  raw_score: number | null;
  normalized_score: number | null;
  maturity_level: string;
  confidence_score: number;
  confidence_label: string;
  opportunity_score: number;
  opportunity_label: string;
  delta_value: number | null;
  delta_label: string;
  total_signals: number;
  positive_signals: number;
  negative_signals: number;
  mixed_signals: number;
  explanation_summary: string | null;
  limitation_notes: string[];
  top_supporting_evidence_ids: string[];
  top_counter_evidence_ids: string[];
  ui_summary: string | null;
}

export interface ChamberCompetencyResponse {
  run_id: string;
  dimension_scores: ChamberDimensionScoreResponse[];
  category_scores: ChamberCategoryScoreResponse[];
}

export interface ChamberDimensionScoreDetailResponse
  extends ChamberDimensionScoreResponse {
  p3_inference: Record<string, unknown>;
}

export interface ChamberEvidenceUnitResponse {
  evidence_id: string;
  analysis_run_id: string;
  member_id: string;
  timestamp: string;
  source_type: string | null;
  record_type: string | null;
  record_id: string | null;
  content_excerpt: string;
  content_summary: string;
  extraction_confidence: number | null;
  ambiguity_notes: string[];
  created_at: string;
}

export interface ChamberBehavioralEventResponse {
  event_id: string;
  timestamp: string;
  event_type: string;
  event_summary: string | null;
  polarity: string;
  severity: number | null;
  event_confidence: number | null;
  impact_level: string | null;
  opportunity_level: string | null;
  related_dimensions: Array<Record<string, string | number>>;
  why_it_matters: string | null;
}

export interface ChamberDimensionDetailResponse {
  dimension_score: ChamberDimensionScoreDetailResponse;
  supporting_evidence: ChamberEvidenceUnitResponse[];
  counter_evidence: ChamberEvidenceUnitResponse[];
  behavioral_events: ChamberBehavioralEventResponse[];
}

export interface ChamberKptItemResponse {
  kpt_id: string;
  item_type: "keep" | "problem" | "try" | string;
  title: string;
  summary: string | null;
  linked_dimension_ids: string[];
  linked_problem_ids: string[];
  display_order: number;
}

export interface ChamberKptResponse {
  run_id: string;
  keep_items: ChamberKptItemResponse[];
  problem_items: ChamberKptItemResponse[];
  try_items: ChamberKptItemResponse[];
}

export interface ChamberCaseResponse {
  case_id: string;
  analysis_run_id: string;
  title: string;
  category: string | null;
  impact_level: string | null;
  summary: string | null;
  why_it_matters: string | null;
  observed_pattern: string | null;
  better_alternative: string | null;
  next_time_guidance: string | null;
  linked_dimension_ids: string[];
  supporting_event_ids: string[];
  confidence_score: number | null;
  display_order: number;
}

export interface ChamberCasesResponse {
  run_id: string;
  cases: ChamberCaseResponse[];
}

export interface ChamberMilestoneResponse {
  milestone_id: string;
  member_id: string;
  source_analysis_run_id: string | null;
  timestamp: string;
  milestone_type: string;
  title: string;
  summary: string | null;
  impact_score: number | null;
  supporting_event_ids: string[];
  created_at: string;
}

export interface ChamberJourneyResponse {
  run_id: string;
  growth_journey_summary: string | null;
  current_growth_path: string | null;
  milestones: ChamberMilestoneResponse[];
}

export interface ChamberValidationFlagResponse {
  flag_id: string;
  analysis_run_id: string;
  dimension_id: string;
  verdict: "accurate" | "questionable" | "incorrect";
  note: string | null;
  flagged_at: string;
}

export interface ChamberValidationFlagRequest {
  analysis_run_id: string;
  dimension_id: string;
  verdict: "accurate" | "questionable" | "incorrect";
  note: string | null;
}

export interface ChamberBootstrapData {
  member: ChamberMemberResponse;
  role_name: string | null;
  team_name: string;
  latest_run: ChamberAnalysisRunResponse | null;
  analysis_status: AnalysisStatus;
}
