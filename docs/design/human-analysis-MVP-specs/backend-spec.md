# Backend API Spec

**Developer Growth & Evidence-Based Performance Insight Platform — MVP**

> All IDs: UUIDs. All timestamps: ISO 8601 UTC. Response envelope: `{ "data": ... }`. Errors: `{ "detail": "..." }`.

---

## Implemented Endpoints

### Organization / Team / Member

| Method | Path | Status |
|--------|------|--------|
| `POST` | `/api/v1/organizations` | ✓ |
| `GET` | `/api/v1/organizations` | ✓ |
| `GET` | `/api/v1/organizations/:orgId` | ✓ |
| `PATCH` | `/api/v1/organizations/:orgId` | ✓ |
| `DELETE` | `/api/v1/organizations/:orgId` | ✓ |
| `POST` | `/api/v1/organizations/:orgId/teams` | ✓ |
| `GET` | `/api/v1/organizations/:orgId/teams` | ✓ |
| `PATCH` | `/api/v1/organizations/:orgId/teams/:teamId` | ✓ |
| `DELETE` | `/api/v1/organizations/:orgId/teams/:teamId` | ✓ |
| `POST` | `/api/v1/organizations/:orgId/teams/:teamId/members` | ✓ |
| `GET` | `/api/v1/organizations/:orgId/teams/:teamId/members` | ✓ |
| `GET` | `/api/v1/members/:memberId` | ✓ |
| `PATCH` | `/api/v1/members/:memberId` | ✓ |
| `DELETE` | `/api/v1/members/:memberId` | ✓ |

### Analysis

| Method | Path | Status |
|--------|------|--------|
| `POST` | `/api/v1/analysis-runs` | ✓ |
| `GET` | `/api/v1/analysis-runs/:runId` | ✓ |
| `GET` | `/api/v1/members/:memberId/analysis-runs` | ✓ |
| `POST` | `/api/v1/members/:memberId/refresh` | ✓ |
| `PUT` | `/api/v1/members/:memberId/baseline` | ✓ |
| `POST` | `/api/v1/validation-flags` | ✓ |
| `GET` | `/api/v1/analysis-runs/:runId/validation-flags` | ✓ |

### Profile (read-only, requires completed run)

| Method | Path | Status |
|--------|------|--------|
| `GET` | `/api/v1/members/:memberId/profile/overview` | ✓ |
| `GET` | `/api/v1/members/:memberId/profile/competency` | ✓ |
| `GET` | `/api/v1/members/:memberId/profile/competency/:dimensionId` | ✓ |
| `GET` | `/api/v1/members/:memberId/profile/kpt` | ✓ |
| `GET` | `/api/v1/members/:memberId/profile/cases` | ✓ |
| `GET` | `/api/v1/members/:memberId/profile/cases/:caseId` | ✓ |
| `GET` | `/api/v1/members/:memberId/profile/journey` | ✓ |
| `GET` | `/api/v1/members/:memberId/profile/evidence` | ✓ |
| `GET` | `/api/v1/evidence/:evidenceId` | ✓ |
| `GET` | `/api/v1/members/:memberId/milestones` | ✓ |

---

## Key Request / Response Shapes

### `POST /api/v1/analysis-runs` → 202

```json
// Request
{ "member_id": "...", "period_start": "2025-01-01", "period_end": "2025-06-30", "run_type": "fresh" }

// Response (same shape as GET)
{
  "data": {
    "analysis_run_id": "...",
    "member_id": "...",
    "period_start": "...", "period_end": "...",
    "run_type": "fresh",
    "status": "pending",
    "progress_stage": null,
    "progress_pct": 0,
    "error_message": null,
    "scoring_version": "1.0",
    "created_at": "...", "updated_at": "...", "completed_at": null
  }
}
```

**Validation:**
- `period_end - period_start` ≤ 365 days → 422 otherwise
- One active run per member at a time → 409 if already running

---

### `GET /api/v1/analysis-runs/:runId`

Poll for status. Key fields for UI:

| Field | Values |
|-------|--------|
| `status` | `pending \| collecting \| analyzing \| completed \| failed` |
| `progress_stage` | `collecting_data \| extracting_evidence \| inferring_dimensions \| scoring \| generating_kpt \| self_checking \| null` |
| `progress_pct` | `0–100` |

---

### `POST /api/v1/members/:memberId/refresh` → 202

```json
// Request (period optional — defaults to last completed run's period)
{ "period_start": "2025-01-01", "period_end": "2025-06-30" }
```

Same response shape as trigger. Creates a new run with `run_type="refresh_same_period"`.

---

### `POST /api/v1/validation-flags` → 201

```json
// Request
{
  "analysis_run_id": "...",
  "dimension_id": "implementation_reliability",
  "verdict": "questionable",
  "note": "This doesn't reflect workload during the period"
}

// Response
{ "data": { "flag_id": "...", "analysis_run_id": "...", "dimension_id": "...", "verdict": "questionable", "note": "...", "flagged_at": "..." } }
```

`verdict`: `accurate | questionable | incorrect`. One flag per (run, dimension) — upserted.

---

### `GET /api/v1/members/:memberId/profile/overview`

```json
{
  "data": {
    "run_id": "...",
    "p8_approved": true,
    "overall_confidence": 0.74,
    "profile_summary": "...",
    "growth_journey_summary": "...",
    "current_growth_path": "Emerging Owner",
    "top_strength_dimension_ids": ["..."],
    "top_growth_dimension_ids": ["..."],
    "insufficient_dimensions": ["..."],
    "fairness_notes": ["..."],
    "category_scores": [
      { "category_id": "...", "score": 3.8, "confidence_score": 0.72, "confidence_label": "high", "included_dimensions": [...] }
    ]
  }
}
```

---

### `GET /api/v1/members/:memberId/profile/competency`

Query: `?category=<category_id>&maturity=<maturity_level>`

```json
{
  "data": {
    "run_id": "...",
    "dimension_scores": [
      {
        "dimension_id": "...", "maturity_level": "reliable",
        "normalized_score": 3.4, "confidence_score": 0.72, "confidence_label": "high",
        "opportunity_score": 0.8, "opportunity_label": "high",
        "delta_value": 0.2, "delta_label": "improved",
        "total_signals": 5, "positive_signals": 4, "negative_signals": 1,
        "explanation_summary": "...", "ui_summary": "...", "limitation_notes": ["..."],
        "top_supporting_evidence_ids": ["..."], "top_counter_evidence_ids": ["..."]
      }
    ],
    "category_scores": [...]
  }
}
```

---

### `GET /api/v1/members/:memberId/profile/kpt`

```json
{
  "data": {
    "run_id": "...",
    "keep_items": [{ "kpt_id": "...", "item_type": "keep", "title": "...", "summary": "...", "linked_dimension_ids": [...], "display_order": 0 }],
    "problem_items": [...],
    "try_items": [{ ..., "linked_problem_ids": ["problem title..."] }]
  }
}
```

---

### `GET /api/v1/members/:memberId/profile/cases`

```json
{
  "data": {
    "run_id": "...",
    "cases": [
      { "case_id": "...", "title": "...", "category": "...", "impact_level": "medium", "summary": "...", "display_order": 0 }
    ]
  }
}
```

---

### `GET /api/v1/members/:memberId/profile/cases/:caseId`

```json
{
  "data": {
    "case_id": "...", "title": "...", "category": "...", "impact_level": "...",
    "summary": "...", "why_it_matters": "...", "observed_pattern": "...",
    "better_alternative": "...", "next_time_guidance": "...",
    "linked_dimension_ids": [...], "supporting_event_ids": [...]
  }
}
```

---

### `GET /api/v1/members/:memberId/profile/journey`

```json
{
  "data": {
    "run_id": "...",
    "growth_journey_summary": "...",
    "current_growth_path": "Emerging Owner",
    "milestones": [
      { "milestone_id": "...", "timestamp": "...", "milestone_type": "delivery_completion", "title": "...", "summary": "...", "impact_score": 0.85 }
    ]
  }
}
```

---

### `GET /api/v1/members/:memberId/profile/evidence`

Query: `?search=<keyword>&source=github,mcp&record_type=pr_authored,commit&limit=50&offset=0`

```json
{
  "data": {
    "run_id": "...",
    "items": [{ "evidence_id": "...", "record_type": "pr_authored", "timestamp": "...", "content_excerpt": "..." }],
    "total": 142, "limit": 50, "offset": 0
  }
}
```

---

## Async Job Flow

```
POST /analysis-runs → 202 { analysis_run_id, status: "pending" }
    └─ BackgroundTask: run_analysis_job(run_id)
            └─ polling: GET /analysis-runs/:runId
                    status: pending → collecting → analyzing → completed | failed
    └─ On completed: fetch profile tabs
```

Polling: every 3–5 s while `pending/collecting`; every 5–10 s while `analyzing`.

---

## Business Rules Summary

| Rule | Enforcement |
|------|-------------|
| Period max 365 days | App layer → 422 |
| One active run per member | App layer → 409 |
| Member must belong to a team | DB NOT NULL FK |
| Score 0–5, confidence 0–1 | Scoring engine + app layer |
| P8 gate before every persist | Pipeline (non-blocking — run completes even if P8 flags issues) |
| P5/P6/P7 failure | Section empty; run still completes as `completed` |

---

## Error States

| Scenario | Result |
|----------|--------|
| All collectors return `status != "collected"` | `run.status = "failed"` |
| All P1 chunks fail | 0 events → 0 scores → empty analysis (still `completed`) |
| P2 fails | Falls back to raw P1 events |
| P3 fails for a dimension | `maturity_level = "insufficient_data"` |
| P5/P6/P7 fail | Section empty; run still completes |
| P8 fails | `p8_approved = false`; run still completes |
| Server restart mid-run | `cleanup_orphaned_runs()` at startup marks stale runs `failed` |
