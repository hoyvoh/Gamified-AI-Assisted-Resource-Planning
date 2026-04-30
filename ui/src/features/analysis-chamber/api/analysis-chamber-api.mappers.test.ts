import { describe, expect, it } from "vitest";

import {
  mapChamberBootstrap,
  mapChamberCompetency,
  mapChamberDimensionDetail,
  mapChamberOverview,
  mapChamberValidationFlagInput,
} from "@/features/analysis-chamber/api/analysis-chamber-api.mappers";
import type {
  ChamberBootstrapData,
  ChamberCompetencyResponse,
  ChamberDimensionDetailResponse,
  ChamberOverviewResponse,
} from "@/features/analysis-chamber/api/analysis-chamber-api.types";

const categoryScore = {
  category_score_id: "category-score-1",
  category_id: "core_technical_execution",
  score: 0.72,
  confidence_score: 0.81,
  confidence_label: "high",
  included_dimensions: ["implementation_reliability"],
  excluded_dimensions: ["debugging_root_cause"],
  explanation_summary: "Strong delivery signal.",
};

const dimensionScore = {
  score_id: "score-1",
  dimension_id: "implementation_reliability",
  raw_score: 7,
  normalized_score: 0.7,
  maturity_level: "proficient",
  confidence_score: 0.8,
  confidence_label: "high",
  opportunity_score: 0.3,
  opportunity_label: "moderate",
  delta_value: null,
  delta_label: "steady",
  total_signals: 6,
  positive_signals: 4,
  negative_signals: 1,
  mixed_signals: 1,
  explanation_summary: "Reliable implementation evidence.",
  limitation_notes: ["Small sample"],
  top_supporting_evidence_ids: ["evidence-1"],
  top_counter_evidence_ids: ["evidence-2"],
  ui_summary: "Reliable delivery branch.",
};

describe("analysis chamber API mappers", () => {
  it("normalizes bootstrap data for shell components", () => {
    const raw: ChamberBootstrapData = {
      member: {
        member_id: "member-1",
        team_id: "team-1",
        organization_id: "org-1",
        display_name: "Ada",
        external_id: null,
        role_profile_id: "role-1",
        analysis_status: "completed",
        last_analysis_at: "2026-04-01T00:00:00Z",
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-04-01T00:00:00Z",
      },
      role_name: "Engineer",
      team_name: "Planning",
      latest_run: {
        analysis_run_id: "run-1",
        member_id: "member-1",
        period_start: "2026-03-01",
        period_end: "2026-03-31",
        run_type: "scheduled",
        status: "completed",
        progress_stage: null,
        progress_pct: 100,
        error_message: null,
        scoring_version: "v1",
        created_at: "2026-04-01T00:00:00Z",
        updated_at: "2026-04-01T00:00:00Z",
        completed_at: "2026-04-01T01:00:00Z",
      },
      analysis_status: "completed",
    };

    expect(mapChamberBootstrap(raw)).toMatchObject({
      member: {
        id: "member-1",
        displayName: "Ada",
        analysisStatus: "completed",
      },
      roleName: "Engineer",
      teamName: "Planning",
      latestRun: {
        id: "run-1",
        progressPct: 100,
      },
      analysisStatus: "completed",
    });
  });

  it("maps overview and competency payloads to camelCase view models", () => {
    const overview: ChamberOverviewResponse = {
      run_id: "run-1",
      member_id: "member-1",
      period_start: "2026-03-01",
      period_end: "2026-03-31",
      scoring_version: "v1",
      p8_approved: true,
      overall_confidence: 0.82,
      profile_summary: "Profile summary",
      growth_journey_summary: "Growth summary",
      current_growth_path: "Technical ownership",
      top_strength_dimension_ids: ["implementation_reliability"],
      top_growth_dimension_ids: ["debugging_root_cause"],
      insufficient_dimensions: [],
      fairness_notes: ["Review with evidence"],
      category_scores: [categoryScore],
    };
    const competency: ChamberCompetencyResponse = {
      run_id: "run-1",
      dimension_scores: [dimensionScore],
      category_scores: [categoryScore],
    };

    expect(mapChamberOverview(overview)).toMatchObject({
      runId: "run-1",
      overallConfidence: 0.82,
      currentGrowthPath: "Technical ownership",
      topStrengthDimensionIds: ["implementation_reliability"],
      categoryScores: [
        {
          categoryId: "core_technical_execution",
          confidenceScore: 0.81,
          includedDimensions: ["implementation_reliability"],
        },
      ],
    });
    expect(mapChamberCompetency(competency)).toMatchObject({
      runId: "run-1",
      dimensionScores: [
        {
          dimensionId: "implementation_reliability",
          normalizedScore: 0.7,
          positiveSignals: 4,
          uiSummary: "Reliable delivery branch.",
        },
      ],
    });
  });

  it("maps dimension detail evidence and validation flag input at the API boundary", () => {
    const detail: ChamberDimensionDetailResponse = {
      dimension_score: {
        ...dimensionScore,
        p3_inference: { evidenceWeight: 0.7 },
      },
      supporting_evidence: [
        {
          evidence_id: "evidence-1",
          analysis_run_id: "run-1",
          member_id: "member-1",
          timestamp: "2026-03-15T00:00:00Z",
          source_type: "ticket",
          record_type: "task",
          record_id: "TASK-1",
          content_excerpt: "Delivered the service migration.",
          content_summary: "Migration delivered.",
          extraction_confidence: 0.9,
          ambiguity_notes: [],
          created_at: "2026-03-16T00:00:00Z",
        },
      ],
      counter_evidence: [],
      behavioral_events: [
        {
          event_id: "event-1",
          timestamp: "2026-03-15T00:00:00Z",
          event_type: "delivery",
          event_summary: "Delivered migration.",
          polarity: "positive",
          severity: null,
          event_confidence: 0.8,
          impact_level: "medium",
          opportunity_level: null,
          related_dimensions: [],
          why_it_matters: "Shows ownership.",
        },
      ],
    };

    expect(mapChamberDimensionDetail(detail)).toMatchObject({
      dimensionScore: {
        dimensionId: "implementation_reliability",
        p3Inference: { evidenceWeight: 0.7 },
      },
      supportingEvidence: [
        {
          id: "evidence-1",
          contentSummary: "Migration delivered.",
        },
      ],
      behavioralEvents: [
        {
          id: "event-1",
          eventType: "delivery",
          whyItMatters: "Shows ownership.",
        },
      ],
    });
    expect(
      mapChamberValidationFlagInput({
        analysisRunId: "run-1",
        dimensionId: "implementation_reliability",
        verdict: "accurate",
        note: null,
      }),
    ).toEqual({
      analysis_run_id: "run-1",
      dimension_id: "implementation_reliability",
      verdict: "accurate",
      note: null,
    });
  });
});
