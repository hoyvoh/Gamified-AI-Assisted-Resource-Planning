# DEVELOPER PROFILING ENGINE

# Scoring Engine Pseudo-Spec

### Version 1.0

---

# 0. DESIGN PRINCIPLES

Scoring engine này phải tuân thủ 6 nguyên tắc:

### P1. Pattern > Incident

Không chấm mạnh từ 1 sự kiện đơn lẻ.

### P2. Evidence > Surface signal

Không suy ra kỹ năng chỉ từ keyword hoặc lời khen mơ hồ.

### P3. Opportunity-aware > Silence penalty

Không có evidence ≠ yếu.

### P4. Role-relative > Universal score

Mỗi người phải được nhìn trong context vai trò của họ.

### P5. Confidence accompanies score

Mọi score phải đi kèm confidence.

### P6. Human-readable by design

Output phải giải thích được tại sao.

---

# 1. ENGINE OVERVIEW

Toàn bộ engine nên có flow logic như sau:

```text
Raw Source Records
    ↓
Normalization
    ↓
Evidence Units
    ↓
Behavioral Event Extraction
    ↓
Dimension Signal Mapping
    ↓
Signal Aggregation
    ↓
Dimension Scoring
    ↓
Confidence Scoring
    ↓
Category Scoring
    ↓
KPT / Case / Journey Derivation
    ↓
Persisted Analysis Snapshot
```

---

# 2. INPUT SCHEMA

---

# 2.1 Top-level Analysis Input

Mỗi lần phân tích một member nên được represent như sau:

```yaml
AnalysisRunInput:
  analysis_run_id: string
  organization_id: string
  team_id: string
  member_id: string
  role_profile_id: string | null
  baseline_profile_id: string | null
  period:
    start_date: date
    end_date: date
  mode:
    type: enum["fresh", "refresh", "compare"]
  source_payloads:
    - SourcePayload
  previous_analysis_refs:
    - analysis_run_id
  config:
    scoring_version: string
    taxonomy_version: string
    max_analysis_window_days: integer
    milestone_retention_years: integer
```

---

# 2.2 SourcePayload Schema

Mỗi nguồn dữ liệu sau normalize bước đầu nên có dạng:

```yaml
SourcePayload:
  source_id: string
  source_type: enum["work_artifact", "conversation", "documentation", "review", "timeline"]
  source_name: string
  collected_at: datetime
  items:
    - RawSourceRecord
```

---

# 2.3 RawSourceRecord Schema

Đây là record thô sau khi pull xong, chưa infer.

```yaml
RawSourceRecord:
  record_id: string
  source_type: string
  timestamp: datetime
  author_member_id: string | null
  related_member_ids: [string]
  title: string | null
  content: string
  url_or_ref: string | null
  thread_context: string | null
  metadata:
    artifact_type: string | null
    tags: [string]
    importance_hint: float | null
    project_id: string | null
    workstream_id: string | null
    inferred_visibility: enum["low", "medium", "high"] | null
```

---

# 3. NORMALIZED EVIDENCE SCHEMA

Đây là lớp trung gian quan trọng nhất.

---

# 3.1 EvidenceUnit Schema

```yaml
EvidenceUnit:
  evidence_id: string
  member_id: string
  timestamp: datetime
  source_ref:
    source_type: string
    record_id: string
    url_or_ref: string | null
  context:
    project_id: string | null
    workstream_id: string | null
    artifact_type: string | null
    interaction_scope: enum["solo", "pair", "team", "cross-team", "org-wide"]
  content:
    excerpt: string
    summary: string
  parsing:
    extraction_confidence: float # 0.0 - 1.0
    ambiguity_notes: [string]
  evidence_meta:
    specificity: float # 0.0 - 1.0
    directness: float # 0.0 - 1.0
    strength: float # 0.0 - 1.0
    recency_weight: float # 0.0 - 1.0
    visibility_bias_risk: float # 0.0 - 1.0
```

---

# 4. EVENT SCHEMA

Đây là nơi raw evidence được “eventize” thành thứ có thể đánh giá được.

---

# 4.1 BehavioralEvent Schema

```yaml
BehavioralEvent:
  event_id: string
  member_id: string
  timestamp: datetime
  source_evidence_ids: [string]

  event_type: enum[
    "task_ownership",
    "delivery_completion",
    "clarification",
    "handoff",
    "review_feedback",
    "mistake_correction",
    "root_cause_analysis",
    "quality_check",
    "risk_awareness",
    "user_consideration",
    "support_given",
    "support_received",
    "status_reporting",
    "decision_reasoning",
    "learning_adaptation",
    "integration_handling",
    "delivery_awareness",
    "architecture_reasoning",
    "ai_usage_pattern"
  ]

  event_summary: string

  polarity:
    type: enum["positive", "negative", "mixed", "neutral"]
    severity: float                # 0.0 - 1.0

  scope:
    project_id: string | null
    workstream_id: string | null
    impact_level: enum["low", "medium", "high"]
    opportunity_level: enum["none", "low", "medium", "high"]

  related_dimensions:
    - dimension_id: string
      relation_strength: float     # 0.0 - 1.0

  reliability:
    event_confidence: float        # 0.0 - 1.0
    ambiguity_notes: [string]

  tags:
    - string
```

---

# 4.2 Event Extraction Rules

Mỗi evidence có thể sinh:

- 0 event
- 1 event
- nhiều event

### Ví dụ

Một đoạn trao đổi có thể sinh:

- `clarification`
- `decision_reasoning`
- `collaboration`
- `user_consideration`

### Rule quan trọng

Không ép evidence nào cũng phải map thành event.

Nếu không đủ nghĩa:
→ bỏ qua hoặc đánh dấu low-signal.

---

# 5. DIMENSION SIGNAL SCHEMA

Đây là tầng signal trước khi chấm điểm dimension.

---

# 5.1 DimensionSignal Schema

```yaml
DimensionSignal:
  signal_id: string
  member_id: string
  dimension_id: string
  source_event_ids: [string]

  polarity: enum["positive", "negative", "neutral", "insufficient"]

  signal_strength: float # 0.0 - 1.0
  signal_specificity: float # 0.0 - 1.0
  signal_confidence: float # 0.0 - 1.0

  context:
    project_diversity_score: float # 0.0 - 1.0
    time_spread_score: float # 0.0 - 1.0
    opportunity_level: enum["none", "low", "medium", "high"]

  explanation_summary: string
```

---

# 5.2 Signal Mapping Logic

Mỗi `BehavioralEvent` có thể tạo nhiều `DimensionSignal`.

Ví dụ:

### Event

`mistake_correction` (negative)

### Có thể map tới:

- Careless Mistake Control
- Code Quality Discipline
- Self Management
- Quality Mindset

Nhưng mỗi mapping phải có:

- strength khác nhau
- confidence khác nhau

Không được equal-weight bừa.

---

# 6. SCORING FLOW

Đây là phần cốt lõi nhất.

---

# 6.1 End-to-End Scoring Flow

```text
1. Validate input period and member context
2. Normalize raw source records
3. Extract evidence units
4. Generate behavioral events
5. Map events to dimension signals
6. Aggregate signals per dimension
7. Compute opportunity level per dimension
8. Compute dimension score
9. Compute dimension confidence
10. Apply role/baseline normalization
11. Compute category scores
12. Generate derived outputs:
    - overview summary
    - KPT
    - case feedback
    - milestones
13. Persist analysis snapshot
```

---

# 7. DIMENSION SCORING LOGIC

---

# 7.1 Dimension Score Output Schema

```yaml
DimensionScore:
  member_id: string
  analysis_run_id: string
  dimension_id: string

  raw_score: float | null               # 0.0 - 5.0
  normalized_score: float | null        # 0.0 - 5.0
  maturity_level: enum[
    "emerging",
    "developing",
    "reliable",
    "strong",
    "advanced",
    "insufficient_evidence",
    "insufficient_opportunity"
  ]

  confidence_score: float               # 0.0 - 1.0
  confidence_label: enum["low", "moderate", "high"]

  opportunity_score: float              # 0.0 - 1.0
  opportunity_label: enum["none", "low", "medium", "high"]

  delta_vs_previous:
    value: float | null
    label: enum["improved", "stable", "emerging", "regressing", "not_enough_comparison"]

  evidence_summary:
    total_signals: integer
    positive_signals: integer
    negative_signals: integer
    mixed_signals: integer

  explanation_summary: string
  limitation_notes: [string]
  top_supporting_evidence_ids: [string]
  top_counter_evidence_ids: [string]
```

---

# 7.2 Raw Dimension Score Formula

Mỗi dimension nên bắt đầu từ aggregated positive vs negative signal.

### Base idea:

```text
RawDimensionSignalScore =
  WeightedPositiveSignalMass - WeightedNegativeSignalMass
```

Sau đó normalize sang thang 1–5.

---

## 7.2.1 Signal Mass Formula

```text
SignalMass =
  signal_strength
  × signal_specificity
  × signal_confidence
  × event_confidence
  × evidence_strength
  × evidence_directness
  × evidence_specificity
  × recency_weight
  × opportunity_adjustment
```

---

## 7.2.2 Positive / Negative Aggregation

```text
PositiveMass = Σ(all positive signal masses)
NegativeMass = Σ(all negative signal masses)
NeutralMass  = Σ(all neutral signal masses)
```

---

## 7.2.3 Raw Score Core

```text
RawSignalBalance = PositiveMass - NegativeMass
```

Sau đó scale thành 1–5.

Ví dụ pseudo:

```text
If total effective signal mass < minimum_threshold:
    score = null
    maturity = insufficient_evidence
Else:
    score = map_balance_to_scale(RawSignalBalance)
```

---

# 7.3 Suggested Score Mapping

### Nếu dùng thang 1–5:

```text
RawSignalBalance <= -0.75  -> 1.5 to 2.0
-0.75 < balance <= -0.25   -> 2.0 to 2.8
-0.25 < balance <= 0.25    -> 2.8 to 3.3
0.25 < balance <= 0.75     -> 3.3 to 4.2
balance > 0.75             -> 4.2 to 5.0
```

Nhưng tốt hơn là dùng sigmoid / smooth normalization.

### Pseudo formula:

```text
normalized_score = 3 + (2 * tanh(balance))
```

Sau đó clamp về [1, 5].

---

# 7.4 Maturity Level Mapping

```text
1.0 – 1.9   -> emerging
2.0 – 2.7   -> developing
2.8 – 3.5   -> reliable
3.6 – 4.3   -> strong
4.4 – 5.0   -> advanced
null        -> insufficient_evidence / insufficient_opportunity
```

---

# 8. CONFIDENCE SCORING LOGIC

Đây là thứ phải tách riêng khỏi score.

---

# 8.1 Confidence Components

Mỗi dimension confidence nên có 4 thành phần:

---

## C1. Evidence Sufficiency

```text
EvidenceSufficiency =
  min(1.0, total_effective_signal_count / target_signal_count)
```

Ví dụ:

- 1–2 signal → thấp
- 5–8 signal tốt → cao

---

## C2. Pattern Consistency

```text
PatternConsistency =
  repeated_pattern_mass / total_signal_mass
```

Nếu cùng một loại positive/negative pattern lặp lại ở nhiều event:
→ tăng

Nếu evidence conflict nhiều:
→ giảm

---

## C3. Context Diversity

```text
ContextDiversity =
  weighted_diversity(projects, workstreams, artifact_types, interaction_scopes)
```

Nếu tất cả evidence chỉ đến từ 1 project duy nhất:
→ confidence vừa phải

Nếu đến từ nhiều context:
→ confidence cao hơn

---

## C4. Cross-Signal Agreement

```text
CrossSignalAgreement =
  degree_to_which_different_signal_types_tell_same_story
```

Ví dụ:

- output + discussion + support behavior đều cùng support dimension
  → cao

Nếu conflict:
→ thấp

---

# 8.2 Confidence Formula

```text
ConfidenceScore =
  (
    0.30 * EvidenceSufficiency
    + 0.30 * PatternConsistency
    + 0.20 * ContextDiversity
    + 0.20 * CrossSignalAgreement
  )
```

### Label mapping

```text
0.00 – 0.39 -> low
0.40 – 0.69 -> moderate
0.70 – 1.00 -> high
```

---

# 9. OPPORTUNITY LOGIC

Cái này cực kỳ quan trọng.

---

# 9.1 Opportunity Output

Mỗi dimension phải có `opportunity_score`.

---

## 9.1.1 Opportunity Sources

Opportunity không phải từ “score”, mà từ:

- số lượng context phù hợp với dimension
- độ sâu exposure
- role relevance
- project relevance

Ví dụ:

- Security Awareness chỉ nên có opportunity cao nếu user thật sự đụng security-relevant context
- Mentoring chỉ nên có opportunity cao nếu có mentoring/support context

---

## 9.1.2 Opportunity Formula

```text
OpportunityScore =
  (
    0.40 * RoleRelevance
    + 0.30 * ContextExposure
    + 0.30 * EventOpportunityMass
  )
```

### Label mapping

```text
0.00 – 0.19 -> none
0.20 – 0.39 -> low
0.40 – 0.69 -> medium
0.70 – 1.00 -> high
```

---

# 9.2 Opportunity Gate Rule

```text
If OpportunityScore < 0.25:
    maturity_level = insufficient_opportunity
    normalized_score = null
```

Đây là guardrail bắt buộc.

---

# 10. BASELINE + ROLE NORMALIZATION LOGIC

Đây là lớp fairness.

---

# 10.1 Role Profile Schema

```yaml
RoleProfile:
  role_profile_id: string
  role_name: string
  expected_dimension_weights:
    dimension_id: float
  expected_opportunity_levels:
    dimension_id: enum["none", "low", "medium", "high"]
  expected_maturity_ranges:
    dimension_id:
      min: float
      max: float
```

---

# 10.2 Personal Baseline Schema

```yaml
PersonalBaseline:
  baseline_profile_id: string
  member_id: string
  baseline_created_at: datetime
  baseline_dimensions:
    dimension_id:
      baseline_score: float | null
      baseline_confidence: float
      baseline_source: enum["manager_seed", "self_seed", "observed_seed", "mixed"]
      notes: string | null
```

---

# 10.3 Normalized Score Logic

### Raw score = what was observed

### Normalized score = how that observation should be interpreted relative to context

```text
NormalizedScore =
  adjust_for_role_and_baseline(raw_score, role_profile, personal_baseline, opportunity)
```

---

## 10.3.1 Practical interpretation

Ví dụ:

- raw mentoring thấp
- nhưng role junior + opportunity thấp
  → normalized không bị xem là yếu

Ví dụ:

- raw ownership vừa
- nhưng baseline trước đó rất thấp, hiện đã cải thiện rõ
  → delta nên highlight tích cực

---

# 11. CATEGORY SCORING LOGIC

Sau khi có dimension scores, gộp thành category.

---

# 11.1 CategoryScore Schema

```yaml
CategoryScore:
  category_id: string
  analysis_run_id: string
  member_id: string

  score: float | null
  confidence_score: float
  confidence_label: enum["low", "moderate", "high"]

  included_dimensions: [string]
  excluded_dimensions: [string]

  explanation_summary: string
```

---

# 11.2 Category Formula

Chỉ include những dimension:

- có đủ opportunity
- có score hợp lệ

```text
CategoryScore =
  weighted_average(valid_dimension_scores, role_adjusted_dimension_weights)
```

### Ví dụ

```text
Core Technical Execution =
  0.20 * Implementation Reliability
+ 0.15 * Code Quality Discipline
+ 0.20 * Debugging & Root Cause
+ 0.15 * Careless Mistake Control
+ 0.15 * Technical Ownership
+ 0.15 * Learning Adaptability
```

---

# 11.3 Category Confidence

```text
CategoryConfidence =
  average(weighted dimension confidence scores)
```

Hoặc weighted by dimension importance.

---

# 12. RANKING LOGIC

# (Top Strengths / Growth Areas / Priority Suggestions)

Đây là logic để hiển thị thứ gì trước.

---

# 12.1 Top Strength Ranking

Không nên sort đơn giản theo score cao nhất.

Phải rank theo:

```text
StrengthRankScore =
  normalized_score
  × confidence_score
  × opportunity_score
  × category_importance_weight
```

### Mục tiêu

Ưu tiên:

- mạnh thật
- đáng tin
- có đủ opportunity
- quan trọng với role

---

# 12.2 Growth Area Ranking

Tương tự, không nên sort score thấp nhất một cách ngây thơ.

```text
GrowthPriorityScore =
  (
    (5 - normalized_score)
    × confidence_score
    × opportunity_score
    × role_importance_weight
    × recurrence_weight
  )
```

### Tức là:

Một dimension chỉ nên được đưa lên “growth area quan trọng” nếu:

- thật sự có pattern cần cải thiện
- có confidence đủ cao
- có đủ cơ hội để kỳ vọng
- và quan trọng với role

---

# 12.3 “Do Not Surface” Rule

Không nên surface vào Top Strength / Growth Area nếu:

```text
confidence_score < 0.40
OR opportunity_score < 0.25
```

Trừ khi explicit show trong “Not enough evidence yet”.

---

# 13. KPT DERIVATION LOGIC

---

# 13.1 Keep Extraction

### Input

- top strengths
- repeated positive patterns
- positive milestone events

### Rule

Chỉ chọn những pattern:

- lặp lại
- confidence đủ
- có meaning development

```text
KeepCandidateScore =
  positive_pattern_strength
  × confidence
  × recurrence
  × usefulness_for_growth
```

---

# 13.2 Problem Extraction

### Input

- growth priorities
- repeated negative signals
- case clusters

```text
ProblemCandidateScore =
  negative_pattern_strength
  × confidence
  × recurrence
  × friction_impact
```

---

# 13.3 Try Extraction

“Try” không nên là generic advice.

Nó phải map từ:

- problem pattern
- improvement mechanism
- role relevance
- realistic next-step

```text
TryItem = generate_behavioral_experiment(problem_pattern, role_context)
```

### Ví dụ

Không nói:

- “Improve communication”

Mà nói:

- “Before handoff, add a short completion status + open risk note to reduce follow-up ambiguity”

---

# 14. CASE-BASED FEEDBACK LOGIC

---

# 14.1 Case Candidate Extraction

Case nên được tạo từ event cluster có:

- impact đủ cao
- learning value cao
- represent pattern

```text
CaseCandidateScore =
  impact_level_weight
  × pattern_representativeness
  × evidence_strength
  × learning_value
```

---

# 14.2 Case Selection Rules

Chỉ chọn case nếu:

- không quá trùng nhau
- có evidence đủ mạnh
- actionable

### Mỗi period nên giữ:

- 3–8 notable cases

---

# 15. JOURNEY & MILESTONE LOGIC

Đây là lớp long-term memory.

---

# 15.1 Milestone Schema

```yaml
Milestone:
  milestone_id: string
  member_id: string
  timestamp: datetime
  milestone_type: enum[
    "major_delivery",
    "ownership_shift",
    "learning_breakthrough",
    "quality_lesson",
    "recovery_case",
    "support_impact",
    "growth_transition",
    "notable_setback"
  ]
  title: string
  summary: string
  impact_score: float
  source_analysis_run_id: string
  supporting_event_ids: [string]
  supporting_evidence_ids: [string]
```

---

# 15.2 Milestone Derivation Logic

Milestone được tạo khi một cluster event vượt threshold:

```text
MilestoneScore =
  impact
  × uniqueness
  × growth_relevance
  × evidence_strength
```

### Chỉ giữ milestone nếu:

```text
MilestoneScore >= milestone_threshold
```

---

# 16. UPDATE LOGIC THEO PERIOD

Đây là phần cực quan trọng cho refresh và longitudinal tracking.

---

# 16.1 Analysis Run Types

```yaml
AnalysisRunType:
  - fresh
  - refresh_same_period
  - refresh_new_period
  - compare_period
```

---

# 16.2 Same-period Refresh Logic

Khi user refresh cùng period:

### System should:

- recollect data
- recompute evidence / events / scores
- overwrite latest analysis snapshot
- preserve validation flags
- preserve milestone history if still relevant

---

# 16.3 New-period Refresh Logic

Khi user chọn period mới:

### System should:

- create new analysis snapshot
- compute delta vs nearest previous valid snapshot
- reuse long-term milestone memory
- not overwrite previous historical analysis

---

# 16.4 Period Delta Logic

### Delta Formula

```text
DeltaValue = current_normalized_score - previous_normalized_score
```

### Delta Labels

```text
DeltaValue >= +0.40 -> improved
-0.39 to +0.39     -> stable
if current had no previous but now has enough signal -> emerging
DeltaValue <= -0.40 -> regressing
if insufficient -> not_enough_comparison
```

---

# 16.5 Time Decay Logic

Dữ liệu gần hơn nên có trọng số cao hơn.

---

## Suggested Recency Weight

```text
0–90 days      -> 1.00
91–180 days    -> 0.85
181–365 days   -> 0.65
>365 days      -> milestone-only usage
```

### Formula form

```text
recency_weight = exp(-lambda * age_in_days)
```

Nhưng business-friendly hơn là bucket.

---

# 17. ANALYSIS OUTPUT SNAPSHOT SCHEMA

Đây là object cuối cùng để render UI.

---

# 17.1 AnalysisSnapshot Schema

```yaml
AnalysisSnapshot:
  analysis_run_id: string
  member_id: string
  period:
    start_date: date
    end_date: date
  generated_at: datetime

  overview:
    profile_summary: string
    top_strength_dimension_ids: [string]
    top_growth_dimension_ids: [string]
    category_scores: [CategoryScore]

  dimensions:
    - DimensionScore

  kpt:
    keep_items:
      - title: string
        summary: string
        linked_dimension_ids: [string]
        evidence_ids: [string]
    problem_items:
      - title: string
        summary: string
        linked_dimension_ids: [string]
        evidence_ids: [string]
    try_items:
      - title: string
        summary: string
        linked_problem_ids: [string]

  case_feedback:
    - case_id: string
      title: string
      summary: string
      why_it_matters: string
      better_alternative: string
      next_time_guidance: string
      linked_dimension_ids: [string]
      evidence_ids: [string]

  journey:
    current_growth_path: string | null
    milestones: [Milestone]

  trust_notes:
    overall_confidence: float
    fairness_notes: [string]
    insufficient_dimensions: [string]

  validation:
    flagged_items_count: integer
```

---

# 18. PSEUDO IMPLEMENTATION FLOW

Đây là bản dễ nhìn nhất để dev team / orchestration hiểu.

---

## 18.1 Pipeline Pseudocode

```text
function run_member_analysis(input):

    validate_period(input.period)
    member_context = load_member_context(input.member_id)

    raw_records = collect_and_normalize_sources(input.source_payloads)

    evidence_units = []
    for record in raw_records:
        evidence_units += extract_evidence_units(record, member_context)

    behavioral_events = []
    for evidence in evidence_units:
        behavioral_events += extract_behavioral_events(evidence, taxonomy)

    dimension_signals = []
    for event in behavioral_events:
        dimension_signals += map_event_to_dimension_signals(event, taxonomy)

    dimension_scores = []
    for dimension in taxonomy.dimensions:
        dimension_scores += score_dimension(
            dimension,
            dimension_signals,
            member_context.role_profile,
            member_context.personal_baseline,
            input.period
        )

    category_scores = score_categories(dimension_scores, member_context.role_profile)

    top_strengths = rank_top_strengths(dimension_scores, member_context.role_profile)
    top_growth_areas = rank_growth_areas(dimension_scores, member_context.role_profile)

    kpt = generate_kpt(dimension_scores, behavioral_events, evidence_units)
    cases = generate_case_feedback(behavioral_events, dimension_scores, evidence_units)
    milestones = derive_milestones(behavioral_events, previous_analysis_refs)

    overview = generate_overview_summary(
        dimension_scores,
        category_scores,
        top_strengths,
        top_growth_areas
    )

    snapshot = build_analysis_snapshot(
        input,
        overview,
        dimension_scores,
        category_scores,
        kpt,
        cases,
        milestones
    )

    persist_snapshot(snapshot)

    return snapshot
```

---

# 19. CRITICAL GUARDRAILS

# (BẮT BUỘC CHO ENGINE)

Đây là phần mình khuyên bạn nên hard-code vào logic / prompt evaluator.

---

## G1. Never assign low score if opportunity is insufficient

```text
if opportunity_score < threshold:
    score = null
    maturity = insufficient_opportunity
```

---

## G2. Never produce strong summary if confidence is low

```text
if confidence < 0.40:
    use cautious language only
```

---

## G3. Never use a single isolated event to create major conclusion

```text
if repeated_pattern_count < minimum_pattern_count:
    suppress strong inference
```

---

## G4. Never surface low-confidence growth area as “important weakness”

```text
if confidence < threshold or opportunity < threshold:
    do not include in growth priorities
```

---

## G5. Always store counter-evidence if present

Nếu có evidence contradict:

- phải lưu
- phải reflect vào confidence

Đây là thứ làm hệ thống có integrity.

---

# 20. KẾT LUẬN NGẮN GỌN

Nếu tóm Scoring Engine này thành một câu:

> **Engine này không “đọc dữ liệu rồi chấm điểm con người”.
> Nó “trích xuất các event hành vi từ lịch sử làm việc, gom chúng thành signal, rồi ước lượng các dimension năng lực với confidence, opportunity, role-awareness, và longitudinal memory.”**

Đó là cách build đúng.
