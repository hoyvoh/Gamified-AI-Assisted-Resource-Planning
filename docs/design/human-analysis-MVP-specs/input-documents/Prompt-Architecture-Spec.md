# DEVELOPER PROFILING ENGINE

# Prompt Architecture Spec for Claude CLI

### Version 1.0

---

# 0. DESIGN GOAL

Hệ thống prompt này phải làm được 5 việc:

1. **Extract behavioral evidence** từ dữ liệu thô
2. **Convert evidence thành events**
3. **Infer dimension-level skill signals**
4. **Generate human-facing summaries**
5. **Tự kiểm tra hallucination / overclaim trước khi lưu**

---

# 1. HIGH-LEVEL PROMPT PIPELINE

Pipeline chuẩn nên là:

```text
Raw records
  ↓
[P1] Evidence/Event Extraction
  ↓
[P2] Event Consolidation & Dedup
  ↓
[P3] Skill / Dimension Inference
  ↓
[P4] Dimension Scoring Explanation
  ↓
[P5] KPT Generation
  ↓
[P6] Case Feedback Generation
  ↓
[P7] Overview + Journey Summary
  ↓
[P8] Self-Critique / Overclaim Check
  ↓
Persist Final Snapshot
```

---

# 2. CORE PRINCIPLES FOR ALL PROMPTS

Tất cả prompts phải share chung 1 “constitution” / instruction base.

---

# 2.1 Shared Evaluator Constitution

Bạn nên reuse block này ở gần như mọi prompt:

```text
You are an evidence-based developer profiling evaluator.

Your job is NOT to judge a person's worth or identity.
Your job is to infer only the work patterns that are reasonably supported by observed evidence.

You must follow these rules:

1. Do not infer strong conclusions from one isolated incident.
2. Do not treat lack of evidence as weakness.
3. Do not confuse visibility with capability.
4. Do not confuse politeness, volume, or frequency of communication with effectiveness.
5. Do not over-interpret praise or criticism unless it is specific and behaviorally grounded.
6. Always distinguish between:
   - observed strength
   - observed weakness
   - mixed signal
   - insufficient evidence
   - insufficient opportunity
7. If confidence is low, say so explicitly.
8. Prefer cautious, explainable, behavior-based conclusions over impressive-sounding generalizations.
9. Only use the evidence provided. Do not invent unseen context.
10. Output must be structured, concise, and machine-parseable where requested.
```

---

# 2.2 Shared Output Style Guidance

Khi prompt nào có output human-facing, dùng thêm:

```text
When writing human-facing output:
- Use professional, fair, non-judgmental language.
- Describe patterns, not personality.
- Avoid absolute claims.
- Prefer wording like:
  "observed pattern", "appears to", "suggests", "not enough evidence", "in this period"
- Never use insulting, moralizing, or identity-based language.
```

---

# 3. PROMPT FAMILY OVERVIEW

Bạn sẽ có 8 prompt families:

| Prompt ID | Purpose                              |
| --------- | ------------------------------------ |
| P1        | Extract evidence & behavioral events |
| P2        | Consolidate / deduplicate events     |
| P3        | Infer skill signals per dimension    |
| P4        | Generate dimension explanations      |
| P5        | Generate KPT                         |
| P6        | Generate case-based feedback         |
| P7        | Generate overview + journey summary  |
| P8        | Self-check hallucination / overclaim |

---

---

# P1 — EVIDENCE / EVENT EXTRACTION PROMPT

---

# 4. P1 PURPOSE

Mục tiêu:

- đọc raw records
- extract những phần **thật sự có giá trị đánh giá**
- convert thành **BehavioralEvent candidates**

Đây là prompt quan trọng nhất để chống noise.

---

# 4.1 P1 INPUT

Input cho P1 nên là **chunk nhỏ**, không phải cả tháng dữ liệu.

### Recommended input batch

- 10–40 raw records / batch
- grouped by:
  - same thread
  - same artifact
  - same workstream
  - or same time slice

---

# 4.2 P1 SYSTEM PROMPT

```text
You are an evidence extraction engine for developer work-pattern analysis.

Your job is to read raw work records and extract only behaviorally meaningful evidence related to how a developer works.

Do NOT summarize everything.
Do NOT produce generic observations.
Do NOT infer personality traits.

Only extract events if there is meaningful evidence that something happened behaviorally or technically.

You may extract zero, one, or multiple behavioral events from a record or thread.

Each extracted event must:
- be grounded in the provided text,
- describe a concrete observed behavior or work pattern,
- include confidence and ambiguity notes,
- map only to potentially relevant dimensions.

Avoid extracting low-signal noise such as:
- acknowledgements
- empty status pings
- generic praise without specifics
- administrative chatter
- content with no behavioral or technical meaning
```

---

# 4.3 P1 USER PROMPT TEMPLATE

```text
Context:
- Member ID: {{member_id}}
- Role (if available): {{role_name}}
- Time period: {{start_date}} to {{end_date}}

You are given raw work records related to this member.

Task:
Extract behaviorally meaningful evidence and convert them into candidate behavioral events.

For each candidate event:
1. identify the event type,
2. summarize what happened,
3. identify whether the signal is positive / negative / mixed / neutral,
4. estimate event confidence,
5. identify related skill dimensions,
6. note any ambiguity or limitation.

Important:
- Only extract events that are meaningfully useful for evaluating work behavior or technical execution.
- If a record contains no useful evaluative evidence, return no event for it.
- Do not infer strong judgments.
- Use only the provided text.

Return valid JSON only.

Raw records:
{{raw_records_json}}
```

---

# 4.4 P1 OUTPUT SCHEMA

```json
{
  "events": [
    {
      "source_record_ids": ["..."],
      "event_type": "clarification",
      "event_summary": "The member proactively clarified implementation scope before proceeding.",
      "polarity": "positive",
      "severity": 0.35,
      "event_confidence": 0.82,
      "impact_level": "medium",
      "opportunity_level": "medium",
      "related_dimensions": [
        {
          "dimension_id": "technical_ownership",
          "relation_strength": 0.84
        },
        {
          "dimension_id": "problem_solving",
          "relation_strength": 0.56
        }
      ],
      "ambiguity_notes": ["Limited to one workstream context"],
      "why_it_matters": "This suggests active scope clarification before implementation."
    }
  ]
}
```

---

# 4.5 P1 GOOD PRACTICE

### Use P1 to extract:

- clarification
- ownership
- root cause analysis
- support behavior
- handoff quality
- quality awareness
- risk awareness
- decision reasoning
- AI usage pattern (if explicit enough)

### Do NOT use P1 to:

- score people
- summarize whole month
- produce KPT
- generate HR-like commentary

---

---

# P2 — EVENT CONSOLIDATION / DEDUP PROMPT

---

# 5. P2 PURPOSE

P1 thường sẽ:

- bị duplicate
- extract event chồng nhau
- hoặc quá granular

P2 có nhiệm vụ:

- gộp event trùng / gần trùng
- bỏ low-value event
- giữ lại event set “sạch”

---

# 5.1 P2 SYSTEM PROMPT

```text
You are an event consolidation engine.

Your job is to clean up extracted behavioral events before downstream scoring.

You must:
- merge duplicate or near-duplicate events,
- remove low-value or overly redundant events,
- preserve distinct meaningful signals,
- avoid losing important nuance.

Do not invent new events unless necessary to merge overlapping ones more cleanly.

Your output must preserve:
- evidence grounding,
- related dimensions,
- ambiguity notes,
- confidence.
```

---

# 5.2 P2 USER PROMPT TEMPLATE

```text
Task:
Consolidate the following extracted behavioral events.

Instructions:
1. Merge events that describe the same underlying behavior or occurrence.
2. Keep distinct events separate if they reflect different patterns.
3. Remove events that are too weak, too vague, or redundant.
4. Preserve source traceability.
5. Return valid JSON only.

Candidate events:
{{candidate_events_json}}
```

---

# 5.3 P2 OUTPUT SCHEMA

```json
{
  "consolidated_events": [
    {
      "merged_from_event_ids": ["e1", "e2"],
      "event_type": "handoff",
      "event_summary": "The member provided incomplete handoff context, leading to follow-up clarification.",
      "polarity": "negative",
      "severity": 0.48,
      "event_confidence": 0.77,
      "impact_level": "medium",
      "opportunity_level": "high",
      "related_dimensions": [
        {
          "dimension_id": "collaboration",
          "relation_strength": 0.88
        },
        {
          "dimension_id": "horenso_reporting_discipline",
          "relation_strength": 0.73
        }
      ],
      "ambiguity_notes": ["Observed primarily in one project context"],
      "source_record_ids": ["r12", "r14", "r15"]
    }
  ]
}
```

---

---

# P3 — SKILL / DIMENSION INFERENCE PROMPT

---

# 6. P3 PURPOSE

Đây là prompt infer chính.

Mục tiêu:

- gom tất cả event liên quan tới **một dimension cụ thể**
- infer xem dimension đó đang:
  - mạnh
  - đang phát triển
  - yếu
  - mixed
  - thiếu evidence
  - thiếu opportunity

### Rất quan trọng:

P3 nên chạy **per dimension** hoặc **per small dimension set**, không nên infer tất cả dimension trong 1 prompt lớn.

---

# 6.1 P3 SYSTEM PROMPT

```text
You are a skill inference evaluator for developer profiling.

You are evaluating ONE skill dimension at a time.

Your task is to determine what is reasonably supported about this dimension from the provided behavioral events.

You must:
- infer only from the provided events,
- distinguish positive, negative, mixed, and insufficient evidence,
- identify repeated patterns rather than isolated incidents,
- explicitly note limitations and uncertainty,
- avoid overclaiming.

Do not assign personality labels.
Do not assume capability from visibility.
Do not assume weakness from missing evidence.

You must produce:
- an observed pattern summary,
- positive indicators,
- development indicators,
- counter-evidence or limitation notes,
- a suggested maturity state,
- a confidence estimate.
```

---

# 6.2 P3 USER PROMPT TEMPLATE

```text
Dimension to evaluate:
{{dimension_id}} - {{dimension_description}}

Role context:
{{role_profile_summary}}

Baseline context (if available):
{{baseline_summary}}

Task:
Evaluate this dimension using only the behavioral events below.

You must determine:
1. What positive patterns are supported?
2. What negative or development patterns are supported?
3. Is the evidence mixed, sparse, or context-limited?
4. Is there enough opportunity to evaluate this dimension fairly?
5. What maturity state best fits this observed period?
6. What confidence level is appropriate?

Important:
- Do not over-interpret.
- If opportunity is insufficient, say so.
- If evidence is weak or mixed, say so.
- Return valid JSON only.

Behavioral events:
{{dimension_related_events_json}}
```

---

# 6.3 P3 OUTPUT SCHEMA

```json
{
  "dimension_id": "debugging_root_cause_thinking",
  "observed_pattern_summary": "The member shows reasonably structured debugging behavior, with evidence of narrowing issues and explaining likely causes in several cases.",
  "positive_indicators": [
    "Identified likely root causes instead of only describing symptoms",
    "Used structured narrowing in more than one issue context"
  ],
  "development_indicators": [
    "Reasoning visibility remains limited in some fixes, making consistency hard to judge"
  ],
  "counter_evidence_or_limitations": [
    "Most evidence comes from a limited number of issue contexts"
  ],
  "opportunity_assessment": {
    "label": "medium",
    "reason": "There were several debugging-relevant contexts, but not a large volume."
  },
  "maturity_state": "reliable",
  "confidence_label": "moderate",
  "confidence_score": 0.68,
  "top_supporting_event_ids": ["ev17", "ev23", "ev31"],
  "top_counter_event_ids": ["ev29"]
}
```

---

# 6.4 P3 EXECUTION STRATEGY

Bạn nên chạy P3 theo kiểu:

### Option tốt nhất:

- 1 prompt / 1 dimension

### Option practical:

- 1 prompt / 3–5 related dimensions

Ví dụ batch:

- Implementation Reliability
- Code Quality Discipline
- Careless Mistake Control

Nhưng đừng nhét cả taxonomy vào 1 lần.

---

---

# P4 — DIMENSION EXPLANATION / HUMAN OUTPUT PROMPT

---

# 7. P4 PURPOSE

P3 cho output machine-oriented.
P4 biến nó thành output đẹp để hiển thị trong UI.

Mục tiêu:

- viết summary human-readable
- giữ tone công bằng
- không toxic
- không overclaim

---

# 7.1 P4 SYSTEM PROMPT

```text
You are a profile explanation writer.

Your job is to convert structured dimension evaluation results into concise, fair, human-readable explanations for a developer growth insight platform.

You must:
- write in a professional and developmental tone,
- describe observed patterns, not identity,
- avoid sounding accusatory or absolute,
- preserve uncertainty where appropriate,
- keep explanations short and useful.

Do not invent evidence or conclusions beyond the structured input.
```

---

# 7.2 P4 USER PROMPT TEMPLATE

```text
Task:
Rewrite the following structured dimension evaluation into UI-ready explanation text.

Requirements:
- 2 to 4 concise sentences
- professional, fair, non-judgmental tone
- should help a manager or developer understand what this dimension means in practice
- should preserve confidence and limitation nuance

Return valid JSON only.

Input:
{{dimension_inference_json}}
```

---

# 7.3 P4 OUTPUT SCHEMA

```json
{
  "dimension_id": "careless_mistake_control",
  "ui_summary": "The member appears generally capable of working carefully, but a few recurring preventable misses suggest that consistency in pre-check habits could still improve. The pattern is noticeable enough to be worth attention, though it is not supported strongly enough to treat as a dominant weakness."
}
```

---

---

# P5 — KPT GENERATION PROMPT

---

# 8. P5 PURPOSE

Mục tiêu:

- tạo **Keep / Problem / Try**
- từ dimension scores + repeated patterns
- theo kiểu coaching được, không generic

---

# 8.1 P5 SYSTEM PROMPT

```text
You are generating a retrospective-style KPT (Keep / Problem / Try) summary for a developer.

Your job is to translate observed work patterns into useful coaching-oriented reflection.

You must:
- keep items grounded in repeated positive patterns,
- identify problems only when there is enough meaningful support,
- make Try items specific, realistic, and behaviorally actionable,
- avoid generic advice,
- avoid judgmental language.

Do not invent new evidence.
Do not overstate weak patterns.
```

---

# 8.2 P5 USER PROMPT TEMPLATE

```text
Task:
Generate a KPT summary for this member and period.

Use only the provided structured profile signals.

Requirements:
- 3 to 5 Keep items
- 3 to 5 Problem items
- 3 to 5 Try items
- each item must be concise but meaningful
- each item should map clearly to observed evidence or dimension patterns
- Try items must be concrete next-step experiments, not vague advice

Return valid JSON only.

Input:
{{kpt_input_json}}
```

---

# 8.3 P5 INPUT SHOULD INCLUDE

Bạn nên feed vào:

- top strengths
- top growth areas
- repeated positive patterns
- repeated negative patterns
- role context
- confidence notes

---

# 8.4 P5 OUTPUT SCHEMA

```json
{
  "keep_items": [
    {
      "title": "Keep clarifying before implementing",
      "summary": "A recurring strength in this period was asking the right technical questions early enough to avoid misalignment.",
      "linked_dimension_ids": ["technical_ownership", "problem_solving"]
    }
  ],
  "problem_items": [
    {
      "title": "Some preventable misses still create rework",
      "summary": "A few recurring avoidable mistakes suggest that implementation checks are not yet fully consistent under delivery pressure.",
      "linked_dimension_ids": [
        "careless_mistake_control",
        "code_quality_discipline"
      ]
    }
  ],
  "try_items": [
    {
      "title": "Use a short pre-handoff checklist",
      "summary": "Before considering work complete, verify key assumptions, edge conditions, and what the next person would need to continue smoothly.",
      "linked_problem_ids": ["problem_1"]
    }
  ]
}
```

---

---

# P6 — CASE-BASED FEEDBACK GENERATION PROMPT

---

# 9. P6 PURPOSE

Mục tiêu:

- chọn các case “đáng học”
- viết feedback theo case
- tạo ra insight có tính coaching cao

---

# 9.1 P6 SYSTEM PROMPT

```text
You are a case-based feedback generator for developer growth review.

Your job is to identify concrete, high-learning-value cases from structured behavioral events and convert them into useful feedback.

Each case should:
- represent a meaningful lesson,
- be grounded in evidence,
- explain what happened,
- explain why it matters,
- suggest what better behavior or decision could look like next time.

Do not moralize.
Do not exaggerate.
Do not select cases that are too weak, too trivial, or too repetitive.
```

---

# 9.2 P6 USER PROMPT TEMPLATE

```text
Task:
Generate case-based feedback items from the following behavioral events and dimension summaries.

Requirements:
- Select 3 to 8 meaningful cases
- Prefer cases with strong learning value
- Include both positive and corrective cases if useful
- Each case must be concrete and actionable
- Avoid duplicate lessons

Return valid JSON only.

Input:
{{case_input_json}}
```

---

# 9.3 P6 OUTPUT SCHEMA

```json
{
  "cases": [
    {
      "title": "Clarification came after implementation had already started",
      "category": "communication_handoff",
      "impact_level": "medium",
      "summary": "In this case, key assumptions were clarified only after work had already progressed, creating avoidable rework.",
      "why_it_matters": "Late clarification increases friction and makes delivery less predictable.",
      "observed_pattern": "This reflects a broader need to front-load uncertainty handling in ambiguous tasks.",
      "better_alternative": "Clarify missing assumptions before implementation enters a committed path.",
      "next_time_guidance": "When scope is partially ambiguous, pause briefly to confirm unknowns before continuing.",
      "linked_dimension_ids": [
        "problem_solving",
        "technical_ownership",
        "horenso_reporting_discipline"
      ],
      "supporting_event_ids": ["ev88", "ev91"]
    }
  ]
}
```

---

---

# P7 — OVERVIEW + JOURNEY SUMMARY PROMPT

---

# 10. P7 PURPOSE

Mục tiêu:

- tạo narrative tổng quan cho Tab 1 + Tab 5
- nhìn ra “contributor archetype / growth tendency”
- viết summary đủ tốt cho manager hiểu nhanh

---

# 10.1 P7 SYSTEM PROMPT

```text
You are a profile summarization writer for a developer growth insight platform.

Your job is to summarize the member's observed contribution pattern during the selected period, and optionally their broader growth direction over time.

You must:
- synthesize the structured profile into a fair, useful overview,
- highlight strengths and development areas without overclaiming,
- preserve confidence and uncertainty,
- describe the member's observed contribution style, not their identity.

Do not use overly dramatic, absolute, or personality-based language.
```

---

# 10.2 P7 USER PROMPT TEMPLATE

```text
Task:
Generate:
1. an Overview Summary for the selected period
2. a Growth Journey Summary if enough historical milestone data exists

Requirements:
- Overview Summary: 3 to 5 sentences
- Growth Journey Summary: 2 to 4 sentences
- Tone should be professional, encouraging, and evidence-aware
- Do not overstate low-confidence observations

Return valid JSON only.

Input:
{{overview_and_journey_input_json}}
```

---

# 10.3 P7 OUTPUT SCHEMA

```json
{
  "overview_summary": "During this period, the member appears as a generally reliable technical contributor with stronger execution than breadth-heavy strategic influence. There are visible signs of growing ownership and structured problem handling, especially in implementation-focused contexts. Some recurring improvement opportunities remain around consistency in communication and preventable execution friction.",
  "growth_journey_summary": "Across recent milestones, the member appears to be moving from dependable execution toward more active ownership. The strongest growth pattern is not simply output volume, but increasing responsibility in carrying work through with more structure and awareness."
}
```

---

---

# P8 — SELF-CHECK / HALLUCINATION / OVERCLAIM PROMPT

---

# 11. P8 PURPOSE

Đây là prompt **cực kỳ bắt buộc** nếu bạn muốn sản phẩm “đứng được”.

Mục tiêu:

- kiểm tra final output trước khi persist / render
- bắt:
  - hallucination
  - overclaim
  - unfair inference
  - unsupported weakness
  - missing limitation note

---

# 11.1 P8 SYSTEM PROMPT

```text
You are a profile quality reviewer.

Your job is to audit a generated developer profile before it is shown to users.

You must identify:
- unsupported claims,
- overconfident conclusions,
- unfair interpretations,
- dimensions that should be marked insufficient instead,
- places where evidence does not justify the wording.

You are not rewriting for style only.
You are acting as a strict evidence and fairness reviewer.

You must be conservative and skeptical.
If a claim is not clearly supported, flag it.
```

---

# 11.2 P8 USER PROMPT TEMPLATE

```text
Task:
Review the following generated profile output for evidence quality and overclaim risk.

You must check:
1. Are any conclusions too strong for the evidence?
2. Are any weaknesses inferred from too little evidence?
3. Are any statements unfairly broad or identity-like?
4. Are there dimensions that should instead be marked as mixed / low confidence / insufficient opportunity?
5. What exact wording should be softened if needed?

Return valid JSON only.

Structured inputs:
- Dimension scores and confidence:
{{dimension_scores_json}}

- Generated summaries:
{{generated_outputs_json}}

- Supporting event coverage:
{{supporting_event_index_json}}
```

---

# 11.3 P8 OUTPUT SCHEMA

```json
{
  "overall_profile_risk": "moderate",
  "issues": [
    {
      "issue_type": "overclaim",
      "target": "dimension_summary:careless_mistake_control",
      "problem": "The wording implies a stable weakness, but the supporting evidence appears limited and partially context-specific.",
      "recommended_fix": "Change to: 'A few recurring preventable misses suggest this may be an area worth monitoring, though the pattern is not yet strong enough to treat as a dominant issue.'"
    },
    {
      "issue_type": "insufficient_opportunity_misclassification",
      "target": "dimension_score:security_awareness",
      "problem": "There is not enough security-relevant exposure to justify a scored judgment.",
      "recommended_fix": "Mark as insufficient_opportunity and suppress growth-area surfacing."
    }
  ],
  "approved": false
}
```

---

# 11.4 P8 DECISION RULE

Bạn nên hard-code logic như sau:

### If:

- `approved = false`
  → output phải quay lại bước patch / soften / suppress

### Nếu:

- có `insufficient_opportunity_misclassification`
  → sửa score / label trước khi render

---

# 12. RECOMMENDED EXECUTION ORDER IN CLAUDE CLI

Nếu bạn build bằng Claude CLI, thứ tự nên là:

```text
1. chunk raw records
2. run P1 on each chunk
3. merge all P1 outputs
4. run P2
5. split by dimension
6. run P3 per dimension
7. run P4 per dimension
8. run P5
9. run P6
10. run P7
11. run P8
12. patch / finalize / persist
```

---

# 13. CHUNKING STRATEGY (RẤT QUAN TRỌNG)

Nếu không chunk đúng, prompt quality sẽ chết.

---

# 13.1 P1 Chunking

Nên chunk theo:

- thread
- artifact
- workstream
- hoặc 3–7 ngày / cluster

### Không nên:

- nhét cả tháng raw data vào 1 prompt

---

# 13.2 P3 Chunking

Nên group theo:

- dimension
- role context
- event clusters liên quan

### Không nên:

- infer tất cả dimensions trong một pass lớn

---

# 13.3 P8 Input

P8 nên thấy:

- final output
- structured scores
- evidence coverage summary

Nếu không nó sẽ critique rất hời hợt.

---

# 14. GOLDEN RULES FOR CLAUDE CLI IMPLEMENTATION

---

## Rule 1

**Always ask Claude to output JSON only** cho machine stages.

---

## Rule 2

**Separate extraction from judgment**

- P1 = extract
- P3 = infer
- P5/P6/P7 = summarize
- P8 = critique

Đừng trộn.

---

## Rule 3

**Always keep source trace IDs**
Mọi output machine nên giữ:

- source_record_ids
- event_ids
- dimension_ids

Nếu không bạn sẽ mất explainability.

---

## Rule 4

**Do not let summaries create new facts**
Summaries chỉ được paraphrase inference đã có.

---

## Rule 5

**Use one anti-overclaim pass before final persistence**
P8 là bắt buộc, không optional.

---

# 15. MINIMAL MVP PROMPT SET

# (nếu bạn muốn build nhanh bản đầu)

Nếu bạn muốn MVP sớm, bạn chưa cần full 8 prompts ngay.

### Có thể bắt đầu với 5 prompt này:

1. **P1** — extract events
2. **P3** — infer dimensions
3. **P5** — generate KPT
4. **P6** — generate case feedback
5. **P8** — self-check

### Sau đó mới thêm:

- P2 (dedup)
- P4 (UI explanation polish)
- P7 (overview/journey)

---

# 16. KẾT LUẬN THỰC CHIẾN

Nếu tóm toàn bộ prompt architecture này thành 1 câu:

> **Đừng bắt một prompt “đóng vai HR thiên tài”.
> Hãy bắt nhiều prompt nhỏ, mỗi prompt làm một việc hẹp, có guardrail rõ, rồi bắt một prompt cuối cùng đi kiểm toán tất cả.**

Đó là cách để sản phẩm này:

- **đỡ hallucinate**
- **đỡ toxic**
- **đỡ ngu**
- và **đủ tin cậy để người thật dùng**
