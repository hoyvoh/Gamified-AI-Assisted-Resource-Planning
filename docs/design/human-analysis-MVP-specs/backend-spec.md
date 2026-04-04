# Backend API Functional Spec

**Developer Growth & Evidence-Based Performance Insight Platform — MVP**

---

## 1. Backend Architecture Overview

### Domains / Modules

| Module | Responsibility |
|--------|----------------|
| `org` | Organization, Team, Member management |
| `analysis` | Trigger, poll, and manage analysis runs |
| `profile` | Read member profile tabs (overview, competency, KPT, cases, journey) |
| `evidence` | Evidence trace read and validation flag write |
| `milestone` | Long-term milestone reads |
| `admin` | Role profiles, baseline management |

### General conventions

- All IDs are UUIDs
- All timestamps in ISO 8601 UTC
- Responses: `{ data, error, meta }` envelope
- Errors: `{ code, message, details }`
- Auth: Bearer token (implementation-specific, not in scope of this spec)
- Content-Type: `application/json`

---

## 2. API Resource Groups

```
/api/v1/
  organizations/
  organizations/:orgId/teams/
  organizations/:orgId/teams/:teamId/members/
  analysis-runs/
  members/:memberId/
  members/:memberId/profile/
  members/:memberId/profile/overview
  members/:memberId/profile/competency
  members/:memberId/profile/kpt
  members/:memberId/profile/cases
  members/:memberId/profile/journey
  evidence/:evidenceId
  validation-flags/
  milestones/
  role-profiles/
  members/:memberId/baseline
```

---

## 3. Organization Endpoints

### `POST /api/v1/organizations`

Create a new organization.

**Request:**
```json
{
  "name": "Acme Corp"
}
```

**Response 201:**
```json
{
  "data": {
    "organization_id": "...",
    "name": "Acme Corp",
    "created_at": "..."
  }
}
```

**Validation:**
- `name` required, max 255 chars

---

### `GET /api/v1/organizations`

List all organizations (with teams and member counts).

**Response 200:**
```json
{
  "data": [
    {
      "organization_id": "...",
      "name": "...",
      "team_count": 3,
      "member_count": 12
    }
  ]
}
```

---

### `GET /api/v1/organizations/:orgId`

Get a single organization with its full team/member tree.

**Response 200:**
```json
{
  "data": {
    "organization_id": "...",
    "name": "...",
    "teams": [
      {
        "team_id": "...",
        "name": "...",
        "members": [
          {
            "member_id": "...",
            "display_name": "...",
            "role_name": "...",
            "analysis_status": "ready | loading | not_analyzed | error"
          }
        ]
      }
    ]
  }
}
```

---

### `PATCH /api/v1/organizations/:orgId`

Rename an organization.

**Request:** `{ "name": "New Name" }`

---

### `DELETE /api/v1/organizations/:orgId`

Soft-delete an organization (and cascade teams/members).

---

## 4. Team Endpoints

### `POST /api/v1/organizations/:orgId/teams`

Create a team under an organization.

**Request:** `{ "name": "Backend Team" }`

---

### `GET /api/v1/organizations/:orgId/teams`

List teams in an organization.

---

### `PATCH /api/v1/organizations/:orgId/teams/:teamId`

Rename a team.

---

### `DELETE /api/v1/organizations/:orgId/teams/:teamId`

Delete a team (soft-delete; cascades to members).

---

## 5. Member Endpoints

### `POST /api/v1/organizations/:orgId/teams/:teamId/members`

Add a member to a team.

**Request:**
```json
{
  "display_name": "Nguyen Van A",
  "external_id": "nguyenvana",
  "role_profile_id": "..."
}
```

**Response 201:**
```json
{
  "data": {
    "member_id": "...",
    "display_name": "...",
    "team_id": "...",
    "role_profile_id": "...",
    "analysis_status": "not_analyzed"
  }
}
```

---

### `GET /api/v1/organizations/:orgId/teams/:teamId/members`

List members in a team with their analysis status.

---

### `GET /api/v1/members/:memberId`

Get member detail and current analysis context.

**Response 200:**
```json
{
  "data": {
    "member_id": "...",
    "display_name": "...",
    "team_id": "...",
    "organization_id": "...",
    "role_profile_id": "...",
    "role_name": "...",
    "analysis_status": "ready",
    "last_analysis_run_id": "...",
    "last_analyzed_at": "...",
    "current_period": {
      "start_date": "2025-01-01",
      "end_date": "2025-06-30"
    }
  }
}
```

---

### `PATCH /api/v1/members/:memberId`

Update member display name or role.

---

### `DELETE /api/v1/members/:memberId`

Remove a member (soft-delete; preserves milestones for audit purposes).

---

## 6. Analysis Run Endpoints

### `POST /api/v1/analysis-runs`

Trigger a new analysis run for a member.

**Request:**
```json
{
  "member_id": "...",
  "period_start": "2025-01-01",
  "period_end": "2025-06-30",
  "run_type": "fresh"
}
```

**Validation:**
- `period_end - period_start` must not exceed 365 days
- If period exceeds 365 days: respond 422 with warning, include auto-corrected dates
- Only one run per member may be in `pending` or `analyzing` state at a time

**Response 202:**
```json
{
  "data": {
    "analysis_run_id": "...",
    "member_id": "...",
    "period_start": "2025-01-01",
    "period_end": "2025-06-30",
    "status": "pending",
    "created_at": "..."
  }
}
```

---

### `GET /api/v1/analysis-runs/:runId`

Poll analysis run status.

**Response 200:**
```json
{
  "data": {
    "analysis_run_id": "...",
    "status": "analyzing",
    "progress_stage": "generating_kpt",
    "created_at": "...",
    "completed_at": null,
    "error_message": null
  }
}
```

**Status values:** `pending | collecting | analyzing | completed | failed`

**Progress stages (informational):**
`collecting_data | extracting_evidence | inferring_dimensions | generating_kpt | generating_cases | generating_overview | self_checking | persisting`

---

### `GET /api/v1/members/:memberId/analysis-runs`

List all analysis runs for a member (for history/comparison).

**Query params:** `?limit=10&offset=0`

---

### `POST /api/v1/members/:memberId/refresh`

Re-trigger analysis for the current period (same-period refresh shortcut).

**Request:** `{ "period_start": "...", "period_end": "..." }` (optional override)

Same behavior as `POST /analysis-runs` with `run_type = "refresh_same_period"`.

---

## 7. Member Profile Endpoints

All profile endpoints require a completed analysis run. They derive from the most recent completed `AnalysisSnapshot` unless `?run_id=...` is specified.

---

### `GET /api/v1/members/:memberId/profile/overview`

Return Overview tab data.

**Query:** `?run_id=...` (optional — defaults to latest completed run)

**Response 200:**
```json
{
  "data": {
    "run_id": "...",
    "period": { "start_date": "...", "end_date": "..." },
    "profile_summary": "...",
    "category_scores": [
      {
        "category_id": "core_technical_execution",
        "score": 3.8,
        "confidence_label": "high"
      }
    ],
    "top_strengths": [
      {
        "dimension_id": "implementation_reliability",
        "dimension_name": "Implementation Reliability",
        "one_line": "...",
        "confidence_label": "high"
      }
    ],
    "top_growth_areas": [...],
    "delta_summary": {
      "improved": ["..."],
      "stable": ["..."],
      "regressing": [],
      "not_enough_comparison": false
    },
    "overall_confidence": 0.74,
    "fairness_notes": ["..."],
    "insufficient_dimensions": ["..."]
  }
}
```

---

### `GET /api/v1/members/:memberId/profile/competency`

Return Competency & Evidence tab data (all dimensions).

**Query:** `?run_id=...&category=...&confidence=...&opportunity=...`

**Response 200:**
```json
{
  "data": {
    "run_id": "...",
    "dimensions": [
      {
        "dimension_id": "implementation_reliability",
        "dimension_name": "Implementation Reliability",
        "category": "core_technical_execution",
        "maturity_level": "reliable",
        "normalized_score": 3.4,
        "confidence_score": 0.72,
        "confidence_label": "high",
        "opportunity_label": "high",
        "delta_label": "stable",
        "explanation_summary": "...",
        "ui_summary": "...",
        "limitation_notes": ["..."],
        "positive_indicator_count": 5,
        "negative_indicator_count": 1,
        "top_supporting_evidence_ids": ["...", "..."],
        "top_counter_evidence_ids": ["..."]
      }
    ],
    "summary": {
      "total_evaluated": 25,
      "high_confidence_count": 10,
      "insufficient_count": 4
    }
  }
}
```

---

### `GET /api/v1/members/:memberId/profile/competency/:dimensionId`

Dimension detail with full evidence list.

**Response 200:**
```json
{
  "data": {
    "dimension_id": "...",
    "dimension_name": "...",
    "maturity_level": "...",
    "ui_summary": "...",
    "observed_pattern_summary": "...",
    "positive_indicators": ["...", "..."],
    "development_indicators": ["...", "..."],
    "counter_evidence_notes": ["..."],
    "opportunity_assessment": {
      "label": "medium",
      "reason": "..."
    },
    "supporting_evidence": [
      {
        "evidence_id": "...",
        "short_title": "...",
        "timestamp": "...",
        "source_tag": "...",
        "excerpt": "...",
        "strength_label": "medium"
      }
    ]
  }
}
```

---

### `GET /api/v1/members/:memberId/profile/kpt`

Return KPT tab data.

**Response 200:**
```json
{
  "data": {
    "run_id": "...",
    "period_summary": "...",
    "keep_items": [
      {
        "kpt_id": "...",
        "title": "...",
        "summary": "...",
        "linked_dimension_ids": ["..."],
        "linked_evidence_ids": ["..."]
      }
    ],
    "problem_items": [...],
    "try_items": [
      {
        "kpt_id": "...",
        "title": "...",
        "summary": "...",
        "linked_problem_ids": ["..."]
      }
    ],
    "development_focus": ["..."]
  }
}
```

---

### `GET /api/v1/members/:memberId/profile/cases`

Return Case-Based Feedback tab data.

**Response 200:**
```json
{
  "data": {
    "run_id": "...",
    "case_count": 5,
    "recurring_pattern_count": 3,
    "cases": [
      {
        "case_id": "...",
        "title": "...",
        "category": "communication_handoff",
        "impact_level": "medium",
        "summary": "...",
        "confidence_score": 0.77
      }
    ]
  }
}
```

---

### `GET /api/v1/members/:memberId/profile/cases/:caseId`

Get full case detail.

**Response 200:**
```json
{
  "data": {
    "case_id": "...",
    "title": "...",
    "category": "...",
    "impact_level": "...",
    "summary": "...",
    "why_it_matters": "...",
    "observed_pattern": "...",
    "better_alternative": "...",
    "next_time_guidance": "...",
    "linked_dimension_ids": ["..."],
    "supporting_events": [
      {
        "event_id": "...",
        "event_summary": "...",
        "timestamp": "..."
      }
    ]
  }
}
```

---

### `GET /api/v1/members/:memberId/profile/journey`

Return Journey & Milestones tab data.

**Response 200:**
```json
{
  "data": {
    "current_growth_path": "Emerging Owner",
    "growth_journey_summary": "...",
    "milestones": [
      {
        "milestone_id": "...",
        "timestamp": "...",
        "milestone_type": "major_delivery",
        "title": "...",
        "summary": "...",
        "impact_score": 0.8
      }
    ],
    "growth_pattern_summary": {
      "recurring_strengths": ["..."],
      "recurring_struggles": ["..."],
      "meaningful_shifts": ["..."]
    }
  }
}
```

---

## 8. Evidence Trace Endpoint

### `GET /api/v1/evidence/:evidenceId`

Get full evidence trace detail.

**Response 200:**
```json
{
  "data": {
    "evidence_id": "...",
    "timestamp": "...",
    "source_type": "...",
    "artifact_type": "...",
    "interaction_scope": "...",
    "content_excerpt": "...",
    "content_summary": "...",
    "url_or_ref": "...",
    "related_dimensions": ["..."],
    "why_it_matters": "...",
    "extraction_confidence": 0.82,
    "ambiguity_notes": ["..."]
  }
}
```

---

## 9. Validation Flag Endpoints

### `POST /api/v1/validation-flags`

Submit a validation flag for an insight.

**Request:**
```json
{
  "member_id": "...",
  "analysis_run_id": "...",
  "target_type": "dimension_score",
  "target_id": "...",
  "flag_type": "questionable",
  "user_note": "This doesn't reflect actual workload during the period"
}
```

**Response 201:**
```json
{
  "data": {
    "flag_id": "...",
    "submitted_at": "..."
  }
}
```

**Validation:**
- `flag_type` must be one of `accurate | questionable | incorrect`
- `target_type` must be one of valid target types

---

### `GET /api/v1/analysis-runs/:runId/validation-flags`

Get all validation flags for a run.

---

## 10. Milestone Endpoints

### `GET /api/v1/members/:memberId/milestones`

Get all milestones for a member (long-term history).

**Query params:** `?from=...&to=...&type=...`

---

### `GET /api/v1/milestones/:milestoneId`

Get milestone detail with evidence.

---

## 11. Role Profile & Baseline Endpoints

### `GET /api/v1/role-profiles`

List all available role profiles.

---

### `GET /api/v1/role-profiles/:roleId`

Get role profile detail.

---

### `GET /api/v1/members/:memberId/baseline`

Get personal baseline for a member.

---

### `PUT /api/v1/members/:memberId/baseline`

Create or update personal baseline.

---

## 12. Backend Validation & Business Rules

| Rule | Enforcement |
|------|-------------|
| Period max 365 days | Validate in `POST /analysis-runs` + DB CHECK |
| One active run per member | Check in `POST /analysis-runs` before inserting |
| Member must belong to a team | DB NOT NULL FK constraint |
| Score between 1–5 | DB CHECK constraint + scoring engine |
| Confidence between 0–1 | DB CHECK + engine |
| No strong claim without evidence | P8 self-critique gate (pipeline level) |
| Opportunity < threshold → suppress score | Scoring engine guardrail |

---

## 13. Async Job Flow / Polling

The analysis pipeline is asynchronous.

### Flow:

```
1. Client POST /analysis-runs → 202 Accepted { analysis_run_id, status: "pending" }
2. Job worker picks up run
3. Client polls GET /analysis-runs/:runId for status
4. status: pending → collecting → analyzing → completed (or failed)
5. On completed: client fetches profile tabs
```

### Polling recommendations:
- Poll every 3–5 seconds while status is `pending` or `collecting`
- Poll every 5–10 seconds while `analyzing`
- Stop polling on `completed` or `failed`

---

## 14. Retry / Failure / Timeout Behavior

| Scenario | Behavior |
|----------|----------|
| Source collection timeout | Mark stage as partial; continue analysis with available data |
| Prompt stage failure (P1–P7) | Retry up to 3 times with backoff; log error |
| P8 fails (self-critique) | Mark p8_approved = false; persist snapshot with issues listed |
| Full run failure | Set `status = 'failed'`, store `error_message` |
| Same-period re-trigger | Allowed; creates new run with `refresh_same_period` |
| Duplicate active run | Return 409 Conflict |

**Timeouts:**
- Evidence collection: 30s per source
- Per prompt stage: 60s
- Full run max: 10 minutes (then auto-fail)
