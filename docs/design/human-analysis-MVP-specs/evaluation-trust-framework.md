# Evaluation / QA / Trust Framework

**Developer Growth & Evidence-Based Performance Insight Platform — MVP**

---

## 1. Core Principle

This product will fail if users do not trust it.

Trust must be **designed in**, not bolted on. The following framework defines how the system:
- measures quality of its own outputs,
- detects and corrects overclaiming,
- handles insufficient evidence fairly,
- invites human review and correction.

---

## 2. Evaluation Metrics

### 2.1 Insight Quality Metrics (automated)

For every dimension score and summary, compute:

#### A. Evidence Sufficiency
How many meaningful evidence units support this dimension?

| Signal count | Label |
|-------------|-------|
| 1–2 signals | Low |
| 3–5 signals | Medium |
| 6+ diverse signals | High |

#### B. Pattern Consistency
Is the signal a repeating pattern or an isolated incident?

```
PatternConsistency = repeated_pattern_mass / total_signal_mass
```

- 1 occurrence: Low consistency → flag as incident, not trait
- 3+ occurrences across different contexts: High consistency

#### C. Context Diversity
Do the signals come from multiple projects/workstreams/interaction types?

```
ContextDiversity = diversity(projects, artifact_types, interaction_scopes)
```

- All from one project: Medium confidence cap
- From multiple contexts: No cap

#### D. Cross-Source Agreement
Do different signal types tell the same story?

- output + discussion + behavior all align → confidence boosted
- output says one thing, feedback says opposite → confidence reduced, conflict noted

### 2.2 Human Agreement Metrics (collected via ValidationFlags)

| Metric | Definition |
|--------|-----------|
| Agreement Rate | % insights flagged as "accurate" by users |
| Dispute Rate | % insights flagged as "questionable" or "incorrect" |
| Correction Acceptance | % flagged items where description could be improved based on feedback |

**Target thresholds (post-launch monitoring):**
- Agreement Rate > 70% for high-confidence insights
- Dispute Rate < 20% for any single dimension pattern
- Flag/dispute signals feed into prompt refinement backlog

### 2.3 Actionability Metric (collected via user feedback)

For key insights, optionally ask users to rate:

- Understandable (1–5)
- Fair (1–5)
- Useful (1–5)
- Actionable (1–5)

A technically correct insight that is not actionable is **not yet good enough**.

---

## 3. Confidence Calibration Method

### Formula

```
ConfidenceScore =
  0.30 × EvidenceSufficiency
  + 0.30 × PatternConsistency
  + 0.20 × ContextDiversity
  + 0.20 × CrossSignalAgreement
```

### Labels

| Score range | Label |
|-------------|-------|
| 0.00–0.39 | Low |
| 0.40–0.69 | Moderate |
| 0.70–1.00 | High |

### Confidence ≠ Correctness

Confidence is the system's estimate of how well-supported a conclusion is — not a claim that the conclusion is definitely true.

**Always communicate this distinction in the UI** with language like:
- "High confidence" = multiple diverse signals consistently support this
- "Low confidence" = limited evidence; treat as a starting point for conversation

---

## 4. Unsupported Claim Detection (P8 Criteria)

The P8 self-critique prompt audits for:

### 4.1 Overclaim from Weak Evidence

```
IF confidence_score < 0.40
AND generated_summary uses strong claim language:
  flag as: "overclaim"
  recommend_fix: soften wording
```

### 4.2 Weakness Inferred from Absence

```
IF dimension has insufficient_evidence
AND generated_summary describes a negative pattern:
  flag as: "unfair_inference"
  recommend_fix: replace with "Insufficient evidence found in this period"
```

### 4.3 Insufficient Opportunity Misclassification

```
IF opportunity_score < 0.25
AND maturity_level != "insufficient_opportunity":
  flag as: "insufficient_opportunity_misclassification"
  recommend_fix: set maturity_level = insufficient_opportunity, score = null
```

### 4.4 Identity Language

```
IF summary uses phrases like:
  "this person is ...", "they always ...", "they tend to be ..."
  → flag as identity language
  recommend_fix: replace with pattern-based wording
```

### 4.5 Single-Event Generalization

```
IF top_supporting_event_count = 1
AND maturity_level IN ["strong", "advanced", "emerging", "developing"]:
  flag as: "single-event generalization"
  recommend_fix: lower confidence, add limitation note
```

---

## 5. Guardrails (Hard-Coded in Engine)

These are non-negotiable and must always be enforced:

| Guardrail | Rule |
|-----------|------|
| G1 | Never assign low maturity score if `opportunity_score < 0.25` |
| G2 | Never use strong summary language if `confidence_score < 0.40` |
| G3 | Never generate strong inference from single isolated event |
| G4 | Never surface growth area as "important weakness" if `confidence < 0.40` or `opportunity < 0.25` |
| G5 | Always store counter-evidence if present; reflect in confidence reduction |
| G6 | Never treat output volume as impact |
| G7 | Never treat communication frequency as effectiveness |
| G8 | Absence of evidence is not evidence of weakness |

---

## 6. Fairness Safeguards

### Role-Relative Evaluation

Every dimension must be evaluated in the context of the member's role:

- Junior developers are not penalized for low mentoring/architecture scores
- Frontend engineers are not penalized for low DevOps scores if role has low DevOps exposure
- A person with no security-relevant context should get `insufficient_opportunity` not a low security score

### Opportunity Baseline

Track per-dimension opportunity:

```
OpportunityScore =
  0.40 × RoleRelevance
  + 0.30 × ContextExposure
  + 0.30 × EventOpportunityMass
```

If `OpportunityScore < 0.25`: set `maturity_level = insufficient_opportunity`.

### Visibility Bias Prevention

- High communication volume ≠ high effectiveness
- Quiet contributors with deep technical work must not appear "weaker" than verbose contributors
- Social signals (praise, emoji reactions, general positive comments) must not be treated as high-strength evidence

---

## 7. Evidence Support Rate Criteria

For a dimension conclusion to be surfaced with confidence:

| Level | Minimum criteria |
|-------|-----------------|
| High confidence (0.70+) | 6+ diverse signals, multiple contexts, consistent polarity, cross-source agreement |
| Moderate confidence (0.40–0.69) | 3–5 signals, some consistency, limited context diversity allowed |
| Low confidence (<0.40) | 1–2 signals, or conflict across sources, or single-context only |
| Insufficient evidence | < 1 meaningful signal |
| Insufficient opportunity | Role/context didn't expose member to this dimension |

---

## 8. Human Review Workflow

### When to flag for human review

The system should recommend human review when:

- `p8_approved = false` after one retry
- `overall_profile_risk = high` from P8
- `dispute_rate` for this member's profile exceeds 30% across past analyses
- Member's analysis contains more than 40% `insufficient_evidence` dimensions

### Reviewer responsibilities

A human reviewer (typically the manager or admin) should:

1. Review the flagged insights
2. Submit validation flags for any inaccurate assessments
3. Optionally update the member's Personal Baseline or Role Profile if the issue is systemic
4. Re-trigger analysis if source data gaps are identified

### Reviewer validation loop

```
Analysis completes
  ↓
[If p8_approved = false] → Show "Needs review" banner on profile
  ↓
Reviewer opens profile
  ↓
Flags inaccurate dimensions via validation form
  ↓
System stores flags (linked to analysis_run_id)
  ↓
On next refresh: flags are preserved; P8 output should improve
  ↓
Reviewer re-evaluates profile
```

---

## 9. QA Checklist for Generated Outputs

Before shipping any analysis result to users, verify:

**Evidence quality:**
- [ ] Every surfaced strength has at least 3 supporting evidence units
- [ ] Every surfaced growth area has documented pattern repetition
- [ ] No strong claim is based on a single event

**Confidence:**
- [ ] Low confidence dimensions are not surfaced as primary strengths or major weaknesses
- [ ] High confidence labels are only assigned when criteria are met

**Opportunity fairness:**
- [ ] Dimensions with insufficient opportunity are labeled accordingly (not scored)
- [ ] No dimension is scored low purely due to role-level exposure gap

**Language:**
- [ ] All summaries use pattern-based language, not identity language
- [ ] No moralizing or judgmental phrasing
- [ ] Uncertainty is acknowledged in the UI

**P8 gate:**
- [ ] P8 ran and produced output
- [ ] If `approved = false`: patches were applied and p8_issues stored

---

## 10. Post-Release Improvement Loop

After launch, the system should improve through:

### 10.1 Dispute Signal Collection

- Collect `validation_flags` from all users
- Aggregate by dimension pattern type
- Identify systematic overclaims or unfair inferences

### 10.2 Prompt Refinement Backlog

- Disputed outputs → analyzed → prompt improvements added to backlog
- P8 false negative patterns → sharpen P8 critique rules

### 10.3 Gold Test Case Set (to be defined)

Create a set of representative test inputs for regression testing:

| Category | Description | Expected output type |
|----------|-------------|---------------------|
| Clear positive | Strong, diverse, repeated positive evidence | High confidence strength |
| Clear negative | Repeated negative patterns, multiple contexts | Moderate confidence growth area |
| Mixed | Conflicting signals | Low confidence, mixed |
| Insufficient evidence | Very few relevant records | `insufficient_evidence` state |
| Insufficient opportunity | Low role/context exposure | `insufficient_opportunity` state |
| Role-bias risk | Junior with no mentoring exposure | No mentoring penalty |
| Visibility bias risk | High communication volume, low depth | Not over-rewarded |

> **Status: Gold test case content TBD.** This is a remaining open item — requires representative sample data from real or synthetic cases.

### 10.4 Scoring Version Tracking

- Each analysis run records `scoring_version` and `taxonomy_version`
- When prompt or scoring changes are made, bump the version
- This allows comparison of outputs across engine versions for the same member
