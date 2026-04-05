# Prompt & Analysis Pipeline Spec

**Developer Growth & Evidence-Based Performance Insight Platform**

---

## Pipeline Overview

```
[P1] Evidence / Event Extraction      per chunk (parallel, semaphore=4)
[P2] Event Consolidation / Dedup      once, on merged P1 output
[P3] Dimension Inference              per dimension (parallel, semaphore=4)
[P4] Dimension UI Explanation         per dimension (parallel, semaphore=4)
[P5] KPT Generation                   once
[P6] Case-Based Feedback              once
[P7] Overview + Journey Summary       once
[P8] Self-Critique / Overclaim Check  once, final gate
```

P5/P6/P7 run concurrently via `asyncio.gather`. P8 runs after them.

**Execution order (runner.py):**
1. Chunk raw records → P1 (parallel) → merge → P2 → store BehavioralEvents
2. P3 per dimension (parallel) → Scoring engine → DimensionScores + CategoryScores
3. P4 per dimension (parallel) → update `dimension_scores.ui_summary`
4. P5 + P6 + P7 (concurrent) → store kpt_items, case_feedbacks, analysis_snapshots
5. P8 → patch if needed → set `p8_approved`

---

## Shared Constitution (all prompts)

Included in every prompt via `app/infrastructure/analysis/prompts/constitution.py`.

**Core rules:**
1. Do not infer strong conclusions from one isolated incident.
2. Do not treat lack of evidence as weakness.
3. Do not confuse visibility with capability.
4. Do not confuse communication volume with effectiveness.
5. Do not over-interpret praise/criticism unless specific and behaviorally grounded.
6. Always distinguish: observed strength / observed weakness / mixed signal / insufficient evidence / insufficient opportunity.
7. If confidence is low, say so explicitly.
8. Prefer cautious, explainable, behavior-based conclusions.
9. Only use the evidence provided — do not invent context.
10. Output must be valid JSON.

**Human-facing addendum (P4, P5, P6, P7):**
- Use professional, fair, non-judgmental language.
- Describe patterns, not personality.
- Avoid absolute claims. Prefer: "observed pattern", "appears to", "suggests", "in this period".

---

## P1 — Evidence / Event Extraction

**Input:** chunks of 20 source records (sorted by source_type + timestamp)  
**Source:** `app/infrastructure/analysis/pipeline/p1_runner.py` + `chunker.py`

Each record is normalised by `chunker._prepare_record()` into:
```json
{ "record_id": "sha or PR#", "timestamp": "...", "source_type": "github", "title": "...", "content": "<build_content_excerpt output>" }
```

**Output schema:**
```json
{
  "events": [{
    "source_record_ids": ["sha_or_number"],
    "event_type": "review_feedback",
    "event_summary": "...",
    "polarity": "positive | negative | mixed | neutral",
    "severity": 0.0,
    "event_confidence": 0.8,
    "impact_level": "low | medium | high",
    "opportunity_level": "none | low | medium | high",
    "related_dimensions": [{"dimension_id": "...", "relation_strength": 0.7}],
    "ambiguity_notes": [],
    "why_it_matters": "..."
  }]
}
```

**Valid event types:** `task_ownership | delivery_completion | clarification | handoff | review_feedback | mistake_correction | root_cause_analysis | quality_check | risk_awareness | user_consideration | support_given | support_received | status_reporting | decision_reasoning | learning_adaptation | integration_handling | delivery_awareness | architecture_reasoning | ai_usage_pattern`

**Fallback:** if a chunk raises `LLMCallError`, it is skipped (logged as warning); the run continues with remaining chunks.

---

## P2 — Event Consolidation

**Input:** all merged P1 candidate events  
**Source:** `p2_runner.py`

Merges duplicates, removes low-value events, preserves source traceability.

**Output:** same schema as P1 `events[]`, with `merged_from_event_ids` added.

**Fallback:** if P2 fails, raw P1 events are used directly.

---

## P3 — Dimension Inference

**Input per call:** behavioral events filtered to a dimension + role profile + baseline  
**Source:** `p3_runner.py` (one call per `DIMENSION_IDS` entry)

**Output schema:**
```json
{
  "dimension_id": "...",
  "polarity": "positive | negative | mixed | neutral | insufficient",
  "signal_strength": 0.7,
  "signal_specificity": 0.6,
  "signal_confidence": 0.72,
  "opportunity_level": "medium",
  "explanation_summary": "..."
}
```

The scoring engine (`domain/analysis/scoring_engine.py`) then computes:
- `raw_score` and `normalized_score` (0–5, tanh normalization)
- `maturity_level`: `novice | developing | capable | reliable | expert | insufficient_evidence | insufficient_opportunity`
- `confidence_score / confidence_label`
- `opportunity_score / opportunity_label`
- `delta_value / delta_label` vs personal baseline

**Fallback:** if P3 fails for a dimension, `maturity_level = "insufficient_data"`.

---

## P4 — Dimension UI Explanation

**Input:** `dimension_scores.p3_inference` (raw P3 JSON) for a single dimension  
**Source:** `output_runner._run_p4_parallel()`

**Output:**
```json
{ "ui_summary": "<2–4 sentence professional summary for the Competency tab>" }
```

Stored in `dimension_scores.ui_summary`.

---

## P5 — KPT Generation

**Input:** dimension summaries, top_strength_ids, top_growth_ids  
**Source:** `output_runner._run_p5()`

**Output:**
```json
{
  "keep_items": [{ "title": "...", "summary": "...", "linked_dimension_ids": [...] }],
  "problem_items": [{ "title": "...", "summary": "...", "linked_dimension_ids": [...] }],
  "try_items":    [{ "title": "...", "summary": "...", "linked_problem_titles": [...] }]
}
```

Rules: 3–5 items per type. Try items must reference Problem items they address.

---

## P6 — Case-Based Feedback

**Input:** behavioral events (capped at 60), dimension summaries, top_growth_ids  
**Source:** `output_runner._run_p6()`

**Output:**
```json
{
  "cases": [{
    "title": "...", "category": "...", "impact_level": "low|medium|high",
    "summary": "...", "why_it_matters": "...", "observed_pattern": "...",
    "better_alternative": "...", "next_time_guidance": "...",
    "linked_dimension_ids": [...], "supporting_event_ids": [...]
  }]
}
```

Rules: 3–8 cases. Include both corrective and positive cases. No duplicate lessons.

---

## P7 — Overview + Journey Summary

**Input:** dimension scores, top strengths/growth, overall confidence, milestone history  
**Source:** `output_runner._run_p7()`

**Output:**
```json
{
  "overview_summary": "...",
  "growth_journey_summary": "...",
  "current_growth_path": "Early-Stage Practitioner"
}
```

---

## P8 — Self-Critique Gate

**Input:** dimension scores + snapshot  
**Source:** `p8_runner.py`

**Output:**
```json
{
  "approved": true,
  "issues": [{ "dimension_id": "...", "verdict": "questionable", "note": "..." }]
}
```

**Decision rule:**
- `approved=true` → set `p8_approved=1`, store issues (if any) in `p8_issues`
- `approved=false` → patch scores, retry once → if still not approved: persist with `p8_approved=0`, flag for human review — **does not block run completion**

---

## Chunking

**P1:** Records grouped by `source_type`, sorted by timestamp, split into chunks of 20. Parallel with semaphore=4.

**P3:** One prompt per dimension. All dimensions run in parallel with semaphore=4.

**P5/P6/P7:** Run concurrently via `asyncio.gather`. Each has its own `try/except LLMCallError` — failure in one does not affect others.

---

## Retry / Fallback Summary

| Stage | On failure |
|-------|-----------|
| P1 chunk | Skip chunk; continue with remaining (logged as warning) |
| P2 | Use merged raw P1 events |
| P3 dimension | `maturity_level = "insufficient_data"` for that dimension |
| P4 dimension | `ui_summary` left null for that dimension |
| P5/P6/P7 | Section empty; run still completes |
| P8 | Persist with `p8_approved=false`; run still completes |
| Full pipeline timeout | `run.status = "failed"` |

**`FileNotFoundError` in LLM subprocess:** retried (not treated as permanent) — transient on Windows under concurrent subprocess load.

---

## Golden Rules

1. **Output JSON only** — all prompts. No explanatory prose.
2. **Separate concerns:** P1 extracts, P2 deduplicates, P3 infers, P4/P5/P6/P7 summarize, P8 critiques.
3. **Always keep source trace IDs** in intermediate outputs.
4. **Summaries may not introduce new facts** — paraphrase existing inference only.
5. **P8 is mandatory** — runs must pass through P8 before `p8_approved` is set.
