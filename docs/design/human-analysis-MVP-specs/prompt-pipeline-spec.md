# Prompt & Analysis Pipeline Spec

**Developer Growth & Evidence-Based Performance Insight Platform — MVP**

> Source: Prompt-Architecture-Spec.md + Scoring-Engine-Pseudo-spec.md

---

## 1. Pipeline Overview

8 prompt families (P1–P8) chained in sequence:

```
[P1] Evidence / Event Extraction       (per chunk, parallel)
[P2] Event Consolidation / Dedup       (once, on merged P1 output)
[P3] Skill / Dimension Inference       (per dimension or per small batch)
[P4] Dimension UI Explanation          (per dimension, parallel)
[P5] KPT Generation                    (once)
[P6] Case-Based Feedback Generation    (once)
[P7] Overview + Journey Summary        (once)
[P8] Self-Critique / Overclaim Check   (once, final gate)
```

MVP minimum set: **P1, P3, P5, P6, P8** (P2, P4, P7 add polish, ship after core).

---

## 2. Shared Constitution (all prompts)

Every prompt must include this base instruction block:

```
You are an evidence-based developer profiling evaluator.

Your job is NOT to judge a person's worth or identity.
Your job is to infer only the work patterns that are reasonably supported by observed evidence.

Rules:
1. Do not infer strong conclusions from one isolated incident.
2. Do not treat lack of evidence as weakness.
3. Do not confuse visibility with capability.
4. Do not confuse communication volume with effectiveness.
5. Do not over-interpret praise or criticism unless it is specific and behaviorally grounded.
6. Always distinguish between: observed strength / observed weakness / mixed signal /
   insufficient evidence / insufficient opportunity.
7. If confidence is low, say so explicitly.
8. Prefer cautious, explainable, behavior-based conclusions.
9. Only use the evidence provided. Do not invent unseen context.
10. Output must be structured and machine-parseable (valid JSON).
```

Human-facing prompts (P4, P5, P6, P7) add:

```
When writing human-facing output:
- Use professional, fair, non-judgmental language.
- Describe patterns, not personality.
- Avoid absolute claims.
- Prefer: "observed pattern", "appears to", "suggests", "in this period"
- Never use insulting, moralizing, or identity-based language.
```

---

## 3. P1 — Evidence / Event Extraction

### Purpose

Read raw work records and extract behaviorally meaningful evidence as candidate `BehavioralEvent` objects.

### Execution strategy

- Chunk input: 10–40 records per batch
- Group by thread / artifact / workstream / 3–7 day slice
- Run chunks in parallel

### Input per call

```json
{
  "member_id": "...",
  "role_name": "...",
  "period": { "start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD" },
  "raw_records": [
    {
      "record_id": "...",
      "timestamp": "...",
      "content": "...",
      "source_type": "...",
      "title": "...",
      "thread_context": "..."
    }
  ]
}
```

### System prompt (short form)

```
You are an evidence extraction engine for developer work-pattern analysis.

Extract only behaviorally meaningful evidence related to how a developer works.
You may extract zero, one, or multiple behavioral events from a record.

Do NOT extract:
- Acknowledgements
- Empty status pings
- Generic praise without specifics
- Administrative chatter

Each extracted event must be grounded in the provided text, describe concrete observed behavior,
include confidence and ambiguity notes, and map only to relevant dimensions.
```

### Output schema

```json
{
  "events": [
    {
      "source_record_ids": ["r1", "r2"],
      "event_type": "clarification",
      "event_summary": "The member proactively clarified implementation scope before proceeding.",
      "polarity": "positive",
      "severity": 0.35,
      "event_confidence": 0.82,
      "impact_level": "medium",
      "opportunity_level": "medium",
      "related_dimensions": [
        { "dimension_id": "technical_ownership", "relation_strength": 0.84 },
        { "dimension_id": "problem_solving", "relation_strength": 0.56 }
      ],
      "ambiguity_notes": ["Limited to one workstream context"],
      "why_it_matters": "Suggests active scope clarification before implementation."
    }
  ]
}
```

### Valid event types

```
task_ownership | delivery_completion | clarification | handoff
review_feedback | mistake_correction | root_cause_analysis | quality_check
risk_awareness | user_consideration | support_given | support_received
status_reporting | decision_reasoning | learning_adaptation
integration_handling | delivery_awareness | architecture_reasoning | ai_usage_pattern
```

---

## 4. P2 — Event Consolidation / Dedup

### Purpose

Clean up merged P1 output: merge duplicates, remove low-value events, preserve distinct signals.

### Input

All merged P1 candidate events (JSON array).

### System prompt (short form)

```
You are an event consolidation engine.

Merge duplicate or near-duplicate events.
Remove low-value or overly redundant events.
Preserve distinct meaningful signals and source traceability.
Do not invent new events.
```

### Output schema

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
      "related_dimensions": [...],
      "ambiguity_notes": ["Observed primarily in one project context"],
      "source_record_ids": ["r12", "r14", "r15"]
    }
  ]
}
```

---

## 5. P3 — Skill / Dimension Inference

### Purpose

Given behavioral events related to a specific dimension, infer maturity state, confidence, patterns.

### Execution strategy

- Run 1 prompt per dimension (preferred) or 1 prompt per 3–5 related dimensions
- Parallel execution across dimensions
- Provide role context and baseline summary per call

### Input per call

```json
{
  "dimension_id": "implementation_reliability",
  "dimension_description": "Ability to execute technical work reliably, completing tasks correctly with minimal rework.",
  "role_profile_summary": "Junior Backend: implementation and code quality are primary expectations.",
  "baseline_summary": "No baseline available.",
  "behavioral_events": [...]
}
```

### System prompt (short form)

```
You are a skill inference evaluator for developer profiling.
You are evaluating ONE skill dimension at a time.

Determine what is reasonably supported from the provided events.
Distinguish positive, negative, mixed, and insufficient evidence.
Identify repeated patterns, not isolated incidents.
Note limitations and uncertainty explicitly.
Avoid overclaiming.

Do not assign personality labels.
Do not assume capability from visibility.
Do not assume weakness from missing evidence.
```

### Output schema

```json
{
  "dimension_id": "implementation_reliability",
  "observed_pattern_summary": "...",
  "positive_indicators": ["...", "..."],
  "development_indicators": ["..."],
  "counter_evidence_or_limitations": ["..."],
  "opportunity_assessment": {
    "label": "medium",
    "reason": "Several relevant contexts observed."
  },
  "maturity_state": "reliable",
  "confidence_label": "moderate",
  "confidence_score": 0.68,
  "top_supporting_event_ids": ["ev17", "ev23"],
  "top_counter_event_ids": ["ev29"]
}
```

---

## 6. P4 — Dimension UI Explanation

### Purpose

Convert P3 inference JSON into concise, fair, human-readable UI text for the Competency tab.

### Input per call

P3 output for a single dimension.

### Output schema

```json
{
  "dimension_id": "careless_mistake_control",
  "ui_summary": "The member appears generally capable of working carefully, but a few recurring preventable misses suggest that consistency in pre-check habits could still improve. The pattern is noticeable enough to be worth attention, though not supported strongly enough to treat as a dominant weakness."
}
```

---

## 7. P5 — KPT Generation

### Purpose

Generate Keep / Problem / Try retrospective from dimension scores and patterns.

### Input

```json
{
  "member_id": "...",
  "period": { "start": "...", "end": "..." },
  "role_name": "...",
  "top_strengths": [...],
  "top_growth_areas": [...],
  "positive_patterns": [...],
  "negative_patterns": [...],
  "confidence_notes": [...]
}
```

### Requirements

- 3–5 Keep items (grounded in repeated positive patterns)
- 3–5 Problem items (only where meaningful evidence exists)
- 3–5 Try items (specific, realistic, behavioral next steps — NOT generic advice)
- Max 2 development focus themes

### Output schema

```json
{
  "keep_items": [
    {
      "title": "Keep clarifying before implementing",
      "summary": "A recurring strength this period was asking the right technical questions early to avoid misalignment.",
      "linked_dimension_ids": ["technical_ownership", "problem_solving"]
    }
  ],
  "problem_items": [
    {
      "title": "Some preventable misses still create rework",
      "summary": "A few recurring avoidable mistakes suggest implementation checks are not yet fully consistent.",
      "linked_dimension_ids": ["careless_mistake_control", "code_quality_discipline"]
    }
  ],
  "try_items": [
    {
      "title": "Use a short pre-handoff checklist",
      "summary": "Before considering work complete, verify key assumptions, edge conditions, and next-person handoff needs.",
      "linked_problem_ids": ["problem_1"]
    }
  ],
  "development_focus": [
    "Focus next quarter: reliability under ambiguity",
    "Focus next quarter: stronger delivery communication"
  ]
}
```

---

## 8. P6 — Case-Based Feedback Generation

### Purpose

Identify concrete, high-learning-value cases from behavioral event clusters and produce coaching-oriented feedback.

### Input

```json
{
  "member_id": "...",
  "period": { "start": "...", "end": "..." },
  "role_name": "...",
  "behavioral_events": [...],
  "dimension_summaries": [...],
  "top_growth_areas": [...]
}
```

### Requirements

- Select 3–8 cases with meaningful learning value
- Include both corrective and positive cases
- Each case must be concrete and actionable
- Avoid duplicate lessons across cases

### Output schema

```json
{
  "cases": [
    {
      "title": "Clarification came after implementation had already started",
      "category": "communication_handoff",
      "impact_level": "medium",
      "summary": "Key assumptions were clarified only after work had already progressed, creating avoidable rework.",
      "why_it_matters": "Late clarification increases friction and makes delivery less predictable.",
      "observed_pattern": "Reflects a broader need to front-load uncertainty handling in ambiguous tasks.",
      "better_alternative": "Clarify missing assumptions before implementation enters a committed path.",
      "next_time_guidance": "When scope is partially ambiguous, pause briefly to confirm unknowns before continuing.",
      "linked_dimension_ids": ["problem_solving", "technical_ownership", "horenso_reporting_discipline"],
      "supporting_event_ids": ["ev88", "ev91"]
    }
  ]
}
```

---

## 9. P7 — Overview + Journey Summary

### Purpose

Generate Tab 1 overview narrative and Tab 5 growth journey summary.

### Input

```json
{
  "member_id": "...",
  "period": { "start": "...", "end": "..." },
  "role_name": "...",
  "top_strength_dimensions": [...],
  "top_growth_dimensions": [...],
  "category_scores": [...],
  "delta_summary": {...},
  "milestone_history": [...],
  "overall_confidence": 0.74,
  "fairness_notes": [...]
}
```

### Output schema

```json
{
  "overview_summary": "During this period, the member appears as a generally reliable technical contributor with stronger execution than strategic breadth. There are visible signs of growing ownership and structured problem handling, especially in implementation-focused contexts. Some recurring improvement opportunities remain around communication consistency and preventable execution friction.",
  "growth_journey_summary": "Across recent milestones, this person appears to be moving from dependable execution toward more active ownership. The most meaningful growth signal is not output volume, but increasing responsibility in carrying work through with more structure and awareness.",
  "current_growth_path": "Emerging Owner"
}
```

---

## 10. P8 — Self-Critique / Overclaim Check

### Purpose

Final gate before persisting. Audit generated output for hallucination, overclaiming, unfair inference.

### Input

```json
{
  "dimension_scores": [...],
  "generated_outputs": {
    "overview_summary": "...",
    "kpt_items": [...],
    "cases": [...]
  },
  "supporting_event_index": {
    "dimension_id_to_event_count": {...},
    "dimension_id_to_confidence": {...}
  }
}
```

### Checks performed

1. Are any conclusions too strong for the evidence?
2. Are any weaknesses inferred from too little evidence?
3. Are any statements unfairly broad or identity-like?
4. Are there dimensions that should be marked insufficient instead of scored?
5. What exact wording should be softened?

### Output schema

```json
{
  "overall_profile_risk": "low | moderate | high",
  "issues": [
    {
      "issue_type": "overclaim | insufficient_opportunity_misclassification | unfair_inference",
      "target": "dimension_summary:careless_mistake_control",
      "problem": "Wording implies a stable weakness, but evidence is limited and context-specific.",
      "recommended_fix": "Change to: 'A few recurring preventable misses suggest this may be an area worth monitoring, though the pattern is not yet strong enough to treat as a dominant issue.'"
    }
  ],
  "approved": true
}
```

### Decision rule

```
If approved = false:
  → Apply recommended_fix patches to affected summaries
  → Re-run P8 once more
  → If still not approved: persist with p8_approved = false, p8_issues populated
     (flag for human review, do not block render)
```

---

## 11. Execution Order

```
1.  chunk raw records
2.  P1 on each chunk (parallel)
3.  merge all P1 outputs
4.  P2 (consolidation)
5.  store BehavioralEvents to DB
6.  split events by dimension relevance
7.  P3 per dimension (parallel)
8.  Scoring Engine: compute DimensionScores + CategoryScores
9.  P4 per dimension (parallel, generates ui_summary)
10. P5 (KPT)
11. P6 (Case Feedback)
12. P7 (Overview + Journey)
13. P8 (Self-Critique)
14. patch if needed, finalize
15. persist AnalysisSnapshot, Milestones
16. update AnalysisRun.status = completed
```

---

## 12. Chunking Strategy

### P1 chunking

Group by:
- Same conversation thread
- Same artifact / PR / ticket
- Same workstream
- Or 3–7 day time slice

Do NOT send a full month of raw data in one prompt.

### P3 grouping

Preferred: 1 prompt per dimension.
Acceptable: 1 prompt per 3–5 closely related dimensions.

Example related batches:
- `implementation_reliability + code_quality_discipline + careless_mistake_control`
- `collaboration + horenso_reporting_discipline + user_first`
- `backend_capability + system_integration_capability + data_interface_handling`

### P8 input

Must include:
- Final output (all summaries)
- Structured scores with confidence
- Event coverage index per dimension

Without these, P8 critique will be superficial.

---

## 13. Retry / Fallback Behavior

| Scenario | Behavior |
|----------|----------|
| P1 chunk parse failure | Retry up to 2 times; if fail, log and skip chunk |
| P2 failure | Retry up to 2 times; if fail, use merged P1 output as-is |
| P3 dimension failure | Retry up to 2 times; if fail, mark dimension as `insufficient_evidence` |
| P5/P6/P7 failure | Retry up to 2 times; if fail, leave section empty with note |
| P8 not approved | Apply patches, re-run once; if still not approved, persist with flag |
| Full pipeline timeout (>10 min) | Set run status to `failed` with error message |

---

## 14. File Naming Convention (when stored on disk)

```
prompts/
  constitution.txt          -- shared base instruction
  p1_event_extraction.txt
  p2_event_consolidation.txt
  p3_dimension_inference.txt
  p4_ui_explanation.txt
  p5_kpt_generation.txt
  p6_case_feedback.txt
  p7_overview_journey.txt
  p8_self_critique.txt
```

Prompt templates use `{{placeholder}}` for variable injection.

---

## 15. Golden Rules

1. **Output JSON only** for all machine-stage prompts (P1–P3, P8).
2. **Separate extraction from judgment**: P1 extracts, P3 infers, P5/P6/P7 summarize, P8 critiques.
3. **Always keep source trace IDs** in all intermediate outputs.
4. **Summaries may not introduce new facts** — they paraphrase existing inference only.
5. **P8 is mandatory**, not optional.
