# Backend API Reference

Tài liệu này tổng hợp toàn bộ API hiện có trong `/be`, dựa trên các router và schema trong `be/app/interfaces`.

## Base URL

- Local: `http://localhost:8000`
- API prefix chính: `/api/v1`

## Response Envelope

Hầu hết endpoint API trả về theo dạng:

```json
{
  "data": {}
}
```

Schema tổng quát:

```ts
type DataEnvelope<T> = {
  data: T;
};
```

Ngoại lệ:

- `GET /health` trả về object thường.
- Các endpoint `DELETE` trả `204 No Content`.
- Một số lỗi trả:

```json
{
  "detail": "..."
}
```

## Common Error Codes

- `404`: Không tìm thấy resource
- `409`: Xung đột trạng thái nghiệp vụ
- `422`: Request không hợp lệ

---

## Shared Schemas

### `OrganizationResponse`

```json
{
  "organization_id": "string",
  "name": "string",
  "created_at": "string",
  "updated_at": "string"
}
```

### `OrganizationListItem`

```json
{
  "organization_id": "string",
  "name": "string",
  "team_count": 0,
  "member_count": 0,
  "created_at": "string"
}
```

### `MemberStatusItem`

```json
{
  "member_id": "string",
  "display_name": "string",
  "external_id": "string | null",
  "role_profile_id": "string | null",
  "analysis_status": "string",
  "last_analysis_at": "string | null"
}
```

### `TeamTreeItem`

```json
{
  "team_id": "string",
  "name": "string",
  "members": ["MemberStatusItem"]
}
```

### `OrganizationDetailResponse`

```json
{
  "organization_id": "string",
  "name": "string",
  "created_at": "string",
  "updated_at": "string",
  "teams": ["TeamTreeItem"]
}
```

### `TeamResponse`

```json
{
  "team_id": "string",
  "organization_id": "string",
  "name": "string",
  "created_at": "string",
  "updated_at": "string"
}
```

### `MemberResponse`

```json
{
  "member_id": "string",
  "team_id": "string",
  "organization_id": "string",
  "display_name": "string",
  "external_id": "string | null",
  "role_profile_id": "string | null",
  "analysis_status": "string",
  "last_analysis_at": "string | null",
  "created_at": "string",
  "updated_at": "string"
}
```

### `RoleProfileResponse`

```json
{
  "role_profile_id": "string",
  "role_name": "string",
  "expected_dimension_weights": {},
  "expected_opportunity_levels": {},
  "expected_maturity_ranges": {}
}
```

### `AnalysisRunResponse`

```json
{
  "analysis_run_id": "string",
  "member_id": "string",
  "period_start": "YYYY-MM-DD",
  "period_end": "YYYY-MM-DD",
  "run_type": "string",
  "status": "string",
  "progress_stage": "string | null",
  "progress_pct": 0,
  "error_message": "string | null",
  "scoring_version": "string | null",
  "created_at": "string",
  "updated_at": "string",
  "completed_at": "string | null"
}
```

### `PersonalBaselineResponse`

```json
{
  "baseline_id": "string",
  "member_id": "string",
  "baseline_dimensions": {
    "dimension_id": {
      "baseline_score": "number | null",
      "baseline_confidence": "number",
      "baseline_source": "string",
      "notes": "string | null"
    }
  },
  "created_at": "string",
  "updated_at": "string"
}
```

### `ValidationFlagResponse`

```json
{
  "flag_id": "string",
  "analysis_run_id": "string",
  "dimension_id": "string",
  "verdict": "accurate | questionable | incorrect",
  "note": "string | null",
  "flagged_at": "string"
}
```

### `CategoryScoreSchema`

```json
{
  "category_score_id": "string",
  "category_id": "string",
  "score": "number | null",
  "confidence_score": "number",
  "confidence_label": "string",
  "included_dimensions": ["string"],
  "excluded_dimensions": ["string"],
  "explanation_summary": "string | null"
}
```

### `DimensionScoreSchema`

```json
{
  "score_id": "string",
  "dimension_id": "string",
  "raw_score": "number | null",
  "normalized_score": "number | null",
  "maturity_level": "string",
  "confidence_score": "number",
  "confidence_label": "string",
  "opportunity_score": "number",
  "opportunity_label": "string",
  "delta_value": "number | null",
  "delta_label": "string",
  "total_signals": 0,
  "positive_signals": 0,
  "negative_signals": 0,
  "mixed_signals": 0,
  "explanation_summary": "string | null",
  "limitation_notes": ["string"],
  "top_supporting_evidence_ids": ["string"],
  "top_counter_evidence_ids": ["string"],
  "ui_summary": "string | null"
}
```

### `DimensionScoreDetailSchema`

```json
{
  "...DimensionScoreSchema": true,
  "p3_inference": {}
}
```

### `EvidenceUnitSchema`

```json
{
  "evidence_id": "string",
  "analysis_run_id": "string",
  "member_id": "string",
  "timestamp": "string",
  "source_type": "string | null",
  "record_type": "string | null",
  "record_id": "string | null",
  "content_excerpt": "string",
  "content_summary": "string",
  "extraction_confidence": "number | null",
  "ambiguity_notes": ["string"],
  "created_at": "string"
}
```

### `BehavioralEventSchema`

```json
{
  "event_id": "string",
  "timestamp": "string",
  "event_type": "string",
  "event_summary": "string | null",
  "polarity": "string",
  "severity": "number | null",
  "event_confidence": "number | null",
  "impact_level": "string | null",
  "opportunity_level": "string | null",
  "related_dimensions": [{}],
  "why_it_matters": "string | null"
}
```

### `KptItemSchema`

```json
{
  "kpt_id": "string",
  "item_type": "string",
  "title": "string",
  "summary": "string | null",
  "linked_dimension_ids": ["string"],
  "linked_problem_ids": ["string"],
  "display_order": 0
}
```

### `CaseFeedbackSchema`

```json
{
  "case_id": "string",
  "analysis_run_id": "string",
  "title": "string",
  "category": "string | null",
  "impact_level": "string | null",
  "summary": "string | null",
  "why_it_matters": "string | null",
  "observed_pattern": "string | null",
  "better_alternative": "string | null",
  "next_time_guidance": "string | null",
  "linked_dimension_ids": ["string"],
  "supporting_event_ids": ["string"],
  "confidence_score": "number | null",
  "display_order": 0
}
```

### `MilestoneSchema`

```json
{
  "milestone_id": "string",
  "member_id": "string",
  "source_analysis_run_id": "string | null",
  "timestamp": "string",
  "milestone_type": "string",
  "title": "string",
  "summary": "string | null",
  "impact_score": "number | null",
  "supporting_event_ids": ["string"],
  "created_at": "string"
}
```

---

## Health API

### `GET /health`

- Mục đích: health check của service
- Request body: không có
- Response:

```json
{
  "status": "ok"
}
```

---

## Organization APIs

### `POST /api/v1/organizations`

- Mục đích: tạo organization mới
- Request body:

```json
{
  "name": "string"
}
```

- Validation:
  - `name`: 1–255 ký tự
- Response: `DataEnvelope<OrganizationResponse>`

### `GET /api/v1/organizations`

- Mục đích: lấy danh sách organization
- Query params: không có
- Response: `DataEnvelope<OrganizationListItem[]>`

### `GET /api/v1/organizations/{org_id}`

- Mục đích: lấy chi tiết organization và cây team/member
- Path params:
  - `org_id: string`
- Response: `DataEnvelope<OrganizationDetailResponse>`
- Errors:
  - `404`

### `PATCH /api/v1/organizations/{org_id}`

- Mục đích: cập nhật tên organization
- Path params:
  - `org_id: string`
- Request body:

```json
{
  "name": "string"
}
```

- Response: `DataEnvelope<OrganizationResponse>`
- Errors:
  - `404`

### `DELETE /api/v1/organizations/{org_id}`

- Mục đích: xóa organization
- Path params:
  - `org_id: string`
- Response:
  - `204 No Content`
- Errors:
  - `404`

### `POST /api/v1/organizations/{org_id}/teams`

- Mục đích: tạo team trong organization
- Path params:
  - `org_id: string`
- Request body:

```json
{
  "name": "string"
}
```

- Response: `DataEnvelope<TeamResponse>`
- Errors:
  - `404`

### `PATCH /api/v1/organizations/{org_id}/teams/{team_id}`

- Mục đích: cập nhật team
- Path params:
  - `org_id: string`
  - `team_id: string`
- Request body:

```json
{
  "name": "string"
}
```

- Response: `DataEnvelope<TeamResponse>`
- Errors:
  - `404`

### `DELETE /api/v1/organizations/{org_id}/teams/{team_id}`

- Mục đích: xóa team
- Path params:
  - `org_id: string`
  - `team_id: string`
- Response:
  - `204 No Content`
- Errors:
  - `404`

### `POST /api/v1/organizations/{org_id}/teams/{team_id}/members`

- Mục đích: tạo member mới trong team
- Path params:
  - `org_id: string`
  - `team_id: string`
- Request body:

```json
{
  "display_name": "string",
  "external_id": "string | null",
  "role_profile_id": "string | null"
}
```

- Response: `DataEnvelope<MemberResponse>`
- Errors:
  - `404`

### `PATCH /api/v1/organizations/{org_id}/teams/{team_id}/members/{member_id}`

- Mục đích: cập nhật member
- Path params:
  - `org_id: string`
  - `team_id: string`
  - `member_id: string`
- Request body:

```json
{
  "display_name": "string",
  "external_id": "string | null",
  "role_profile_id": "string | null"
}
```

- Response: `DataEnvelope<MemberResponse>`
- Errors:
  - `404`

### `DELETE /api/v1/organizations/{org_id}/teams/{team_id}/members/{member_id}`

- Mục đích: xóa member
- Path params:
  - `org_id: string`
  - `team_id: string`
  - `member_id: string`
- Response:
  - `204 No Content`
- Errors:
  - `404`

### `GET /api/v1/members/{member_id}`

- Mục đích: lấy chi tiết member
- Path params:
  - `member_id: string`
- Response: `DataEnvelope<MemberResponse>`
- Errors:
  - `404`

---

## Role Profile APIs

### `GET /api/v1/role-profiles`

- Mục đích: lấy danh sách role profile
- Response: `DataEnvelope<RoleProfileResponse[]>`

### `GET /api/v1/role-profiles/{role_profile_id}`

- Mục đích: lấy chi tiết role profile
- Path params:
  - `role_profile_id: string`
- Response: `DataEnvelope<RoleProfileResponse>`
- Errors:
  - `404`

---

## Analysis APIs

### `POST /api/v1/analysis-runs`

- Mục đích: tạo analysis run mới và đưa job vào background task
- Request body:

```json
{
  "member_id": "string",
  "period_start": "YYYY-MM-DD",
  "period_end": "YYYY-MM-DD",
  "run_type": "fresh | refresh_same_period"
}
```

- Response: `202 Accepted` + `DataEnvelope<AnalysisRunResponse>`
- Errors:
  - `404`
  - `409`
  - `422`

### `GET /api/v1/analysis-runs/{run_id}`

- Mục đích: lấy trạng thái chi tiết của một analysis run
- Path params:
  - `run_id: string`
- Response: `DataEnvelope<AnalysisRunResponse>`
- Errors:
  - `404`

### `GET /api/v1/members/{member_id}/analysis-runs`

- Mục đích: lấy danh sách analysis runs của một member
- Path params:
  - `member_id: string`
- Query params:
  - `limit: int` mặc định `10`, min `1`, max `50`
  - `offset: int` mặc định `0`, min `0`
- Response: `DataEnvelope<AnalysisRunResponse[]>`
- Errors:
  - `404`

### `POST /api/v1/members/{member_id}/refresh`

- Mục đích: chạy lại analysis cho cùng member theo period mới truyền vào
- Path params:
  - `member_id: string`
- Request body:

```json
{
  "period_start": "YYYY-MM-DD",
  "period_end": "YYYY-MM-DD"
}
```

- Response: `202 Accepted` + `DataEnvelope<AnalysisRunResponse>`
- Errors:
  - `404`
  - `409`
  - `422`

### `PUT /api/v1/members/{member_id}/baseline`

- Mục đích: tạo hoặc cập nhật baseline cá nhân
- Path params:
  - `member_id: string`
- Request body:

```json
{
  "baseline_dimensions": {
    "dimension_id": {
      "baseline_score": "number | null",
      "baseline_confidence": "number",
      "baseline_source": "string",
      "notes": "string | null"
    }
  }
}
```

- Response: `DataEnvelope<PersonalBaselineResponse>`
- Errors:
  - `404`

### `POST /api/v1/validation-flags`

- Mục đích: tạo hoặc cập nhật validation flag cho một dimension trong run
- Request body:

```json
{
  "analysis_run_id": "string",
  "dimension_id": "string",
  "verdict": "accurate | questionable | incorrect",
  "note": "string | null"
}
```

- Response: `201 Created` + `DataEnvelope<ValidationFlagResponse>`
- Errors:
  - `404`
  - `422`

### `GET /api/v1/analysis-runs/{run_id}/validation-flags`

- Mục đích: lấy toàn bộ validation flags của một analysis run
- Path params:
  - `run_id: string`
- Response: `DataEnvelope<ValidationFlagResponse[]>`
- Errors:
  - `404`

---

## Profile APIs

### `GET /api/v1/members/{member_id}/profile/overview`

- Mục đích: lấy overview tổng hợp của dossier
- Path params:
  - `member_id: string`
- Response: `DataEnvelope<ProfileOverviewResponse>`

```json
{
  "data": {
    "run_id": "string",
    "member_id": "string",
    "period_start": "string",
    "period_end": "string",
    "scoring_version": "string | null",
    "p8_approved": true,
    "overall_confidence": "number | null",
    "profile_summary": "string | null",
    "growth_journey_summary": "string | null",
    "current_growth_path": "string | null",
    "top_strength_dimension_ids": ["string"],
    "top_growth_dimension_ids": ["string"],
    "insufficient_dimensions": ["string"],
    "fairness_notes": ["string"],
    "category_scores": ["CategoryScoreSchema"]
  }
}
```

- Errors:
  - `404`

### `GET /api/v1/members/{member_id}/profile/competency`

- Mục đích: lấy danh sách competency dimensions
- Path params:
  - `member_id: string`
- Query params:
  - `category?: string`
  - `maturity?: string`
- Response: `DataEnvelope<ProfileCompetencyResponse>`

```json
{
  "data": {
    "run_id": "string",
    "dimension_scores": ["DimensionScoreSchema"],
    "category_scores": ["CategoryScoreSchema"]
  }
}
```

- Errors:
  - `404`

### `GET /api/v1/members/{member_id}/profile/competency/{dimension_id}`

- Mục đích: lấy chi tiết của một dimension
- Path params:
  - `member_id: string`
  - `dimension_id: string`
- Response: `DataEnvelope<DimensionDetailResponse>`

```json
{
  "data": {
    "dimension_score": "DimensionScoreDetailSchema",
    "supporting_evidence": ["EvidenceUnitSchema"],
    "counter_evidence": ["EvidenceUnitSchema"],
    "behavioral_events": ["BehavioralEventSchema"]
  }
}
```

- Errors:
  - `404`

### `GET /api/v1/members/{member_id}/profile/kpt`

- Mục đích: lấy dữ liệu Keep / Problem / Try
- Path params:
  - `member_id: string`
- Response: `DataEnvelope<ProfileKptResponse>`

```json
{
  "data": {
    "run_id": "string",
    "keep_items": ["KptItemSchema"],
    "problem_items": ["KptItemSchema"],
    "try_items": ["KptItemSchema"]
  }
}
```

- Errors:
  - `404`

### `GET /api/v1/members/{member_id}/profile/cases`

- Mục đích: lấy danh sách cases
- Path params:
  - `member_id: string`
- Response: `DataEnvelope<ProfileCasesResponse>`

```json
{
  "data": {
    "run_id": "string",
    "cases": ["CaseFeedbackSchema"]
  }
}
```

- Errors:
  - `404`

### `GET /api/v1/members/{member_id}/profile/cases/{case_id}`

- Mục đích: lấy chi tiết một case
- Path params:
  - `member_id: string`
  - `case_id: string`
- Response: `DataEnvelope<CaseFeedbackSchema>`
- Errors:
  - `404`

### `GET /api/v1/members/{member_id}/profile/journey`

- Mục đích: lấy growth journey của member
- Path params:
  - `member_id: string`
- Response: `DataEnvelope<ProfileJourneyResponse>`

```json
{
  "data": {
    "run_id": "string",
    "growth_journey_summary": "string | null",
    "current_growth_path": "string | null",
    "milestones": ["MilestoneSchema"]
  }
}
```

- Errors:
  - `404`

### `GET /api/v1/members/{member_id}/profile/evidence`

- Mục đích: lấy danh sách evidence đã lọc
- Path params:
  - `member_id: string`
- Query params:
  - `search?: string`
  - `source?: string` — comma-separated, ví dụ `github,jira`
  - `record_type?: string` — comma-separated, ví dụ `pr_authored,commit`
  - `limit: int` mặc định `50`, min `1`, max `200`
  - `offset: int` mặc định `0`, min `0`
- Response: `DataEnvelope<ProfileEvidenceResponse>`

```json
{
  "data": {
    "run_id": "string",
    "items": ["EvidenceUnitSchema"],
    "total": 0,
    "limit": 50,
    "offset": 0
  }
}
```

- Errors:
  - `404`

### `GET /api/v1/evidence/{evidence_id}`

- Mục đích: lấy chi tiết trace của một evidence
- Path params:
  - `evidence_id: string`
- Response: `DataEnvelope<EvidenceUnitSchema>`
- Errors:
  - `404`

### `GET /api/v1/members/{member_id}/milestones`

- Mục đích: lấy milestones độc lập của member
- Path params:
  - `member_id: string`
- Response: `DataEnvelope<MilestonesResponse>`

```json
{
  "data": {
    "milestones": ["MilestoneSchema"]
  }
}
```

- Errors:
  - `404`

---

## Notes for Frontend Integration

- FE nên parse `DataEnvelope<T>` trước khi map sang view model.
- FE hiện tại đang dùng mock repository cho dossier, nên chưa match trực tiếp response backend.
- Các endpoint profile trả schema phân tích chi tiết hơn UI hiện tại; nên dùng adapter layer giữa BE response và FE screen model.
