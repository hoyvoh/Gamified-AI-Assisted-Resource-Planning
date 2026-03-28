---
title: "Project Radar Scoring Matrix"
type: synthesis
sources:
  - "01_project_analysis_methodology.md"
  - "00_sources/toc_logic_model.md"
  - "00_sources/telos_faf.md"
  - "00_sources/atam_cbam.md"
  - "00_sources/mcda_mcdm_ahp_topsis.md"
  - "00_sources/iso25010.md"
  - "00_sources/trl_readiness.md"
target_users: ["PM", "Tech Lead"]
output: "10-axis radar chart with weighted composite score"
---

# Project Radar Scoring Matrix

## Overview

This document defines the complete scoring system for the Project Analysis radar — the **10 axes, their rubrics, their weights, and the composite score formula** that produces the final project feasibility verdict.

Each axis is scored **1–5** by a cross-functional panel (PM + Tech Lead). The composite score drives the radar visualization and verdict label.

---

## The 10 Radar Axes

### Axis 1: Problem-Solution Fit
**Layer:** Theory of Change (L1)
**Weight:** 0.12
**Who scores:** PM with stakeholder input

| Score | Criteria |
|-------|----------|
| 1 | Problem undefined or vague; solution has no logical connection to a problem; solution-in-search-of-a-problem |
| 2 | Problem described but not validated with evidence; solution loosely connected; significant assumption dependency |
| 3 | Problem clear with some evidence; solution addresses the primary driver; basic mechanism articulated |
| 4 | Problem validated with data or user research; solution has credible mechanism; top assumptions identified |
| 5 | Problem is well-evidenced and quantified; solution is directly validated against user needs; all critical assumptions tested |

**Red flags triggering score 1–2:**
- Technology named before problem statement
- "We need an app" without user research
- "Everyone will benefit" (no defined population)

---

### Axis 2: Success Criterion Clarity
**Layer:** Theory of Change / Logic Model (L1)
**Weight:** 0.08
**Who scores:** PM

| Score | Criteria |
|-------|----------|
| 1 | No measurable outcomes defined; success undefined; KPIs absent |
| 2 | Vague success language ("better UX", "faster workflow"); no measurement plan |
| 3 | Some outcomes defined; not fully SMART; some KPIs identified but baseline missing |
| 4 | SMART outcomes defined; measurement plan described; baseline established for key metrics |
| 5 | Full Logic Model: SMART outcomes, measurement plan, baseline data, defined evaluation checkpoints |

---

### Axis 3: TELOS Feasibility Composite
**Layer:** Feasibility Gate (L2)
**Weight:** 0.15
**Who scores:** PM + Tech Lead + Legal (each sub-dimension)

This axis directly reflects the TELOS composite score, normalized to 1–5:

| Score | TELOS composite range | Meaning |
|-------|----------------------|---------|
| 1 | < 1.5 | Not feasible; structural blockers present |
| 2 | 1.5 – 2.4 | Marginal; significant restructuring required |
| 3 | 2.5 – 3.4 | Conditionally feasible; gaps must be addressed |
| 4 | 3.5 – 4.4 | Feasible; proceed with documented mitigations |
| 5 | 4.5 – 5.0 | Highly feasible; proceed with confidence |

**Sub-dimension scores (for drill-down visibility):**

| Sub-dimension | Score | Assessor |
|-------------|-------|----------|
| T — Technical | /5 | Tech Lead |
| E — Economic | /5 | PM + Finance |
| L — Legal | /5 | Legal |
| O — Operational | /5 | PM + Stakeholders |
| S — Schedule | /5 | Tech Lead + PM |

**Hard gate: if any sub-dimension = 1 → axis score = 1 regardless of average.**

---

### Axis 4: Quality Attribute Coverage
**Layer:** Architecture (L3)
**Weight:** 0.10
**Who scores:** Tech Lead

| Score | Criteria |
|-------|----------|
| 1 | No quality attributes identified; architecture is purely functional with no NFR specification |
| 2 | 1–2 quality attributes named but no measurable targets or architectural decisions linked |
| 3 | Key QAs identified (using ISO 25010 vocabulary); some architectural decisions linked; gaps exist |
| 4 | Top 3–5 QAs with measurable targets (SLAs); architectural decisions explicitly mapped; utility tree drafted |
| 5 | Full quality attribute analysis: all critical QAs with response measures, architectural patterns chosen for each, validation approach defined |

**Mandatory check:** If Reliability, Security, or Performance is High-priority for this project type and score < 3 → flag as blocking risk.

---

### Axis 5: Architecture Risk and Tradeoff Awareness
**Layer:** Architecture (L3)
**Weight:** 0.08
**Who scores:** Tech Lead

| Score | Criteria |
|-------|----------|
| 1 | No architectural risks identified; "we'll figure it out" approach; no alternatives considered |
| 2 | 1–2 risks mentioned informally; no mitigation plans; no alternatives evaluated |
| 3 | Key risks identified with basic mitigations; 1–2 alternatives evaluated; tradeoffs named |
| 4 | Comprehensive risk register; alternatives formally compared (CBAM-style); tradeoff decisions documented with rationale |
| 5 | Full ATAM or equivalent: risks, non-risks, sensitivity points, tradeoff points all identified; ADRs written; stakeholders aligned on tradeoffs |

**Common anti-patterns that drive score down:**
- "We'll use microservices from day one" (premature distribution)
- "Security will be added after launch" (security as afterthought)
- No load/performance testing plan for performance-critical system

---

### Axis 6: Strategic Value
**Layer:** MCDA (L4)
**Weight:** 0.12
**Who scores:** PM + Executive stakeholder

| Score | Criteria |
|-------|----------|
| 1 | No connection to organizational strategy; reactive or ad hoc request |
| 2 | Loosely aligned; not on roadmap; limited stakeholder backing |
| 3 | On the roadmap; addresses stated strategic objectives; mid-priority |
| 4 | High-priority roadmap item; enables multiple strategic goals; broad stakeholder support |
| 5 | Mission-critical; directly enables primary strategic objective; executive sponsorship; time-sensitive competitive opportunity |

---

### Axis 7: Financial Return (ROI)
**Layer:** MCDA (L4)
**Weight:** 0.10
**Who scores:** PM + Finance

| Score | Criteria |
|-------|----------|
| 1 | ROI clearly negative or undefined; no financial justification; costs will exceed any plausible benefit |
| 2 | ROI marginally positive (<25%); based on unvalidated assumptions; payback > 24 months |
| 3 | ROI 25–100%; reasonable assumptions; payback 12–24 months; NPV positive in base case |
| 4 | ROI 100–300%; validated assumptions; payback 6–12 months; positive NPV across scenarios |
| 5 | ROI > 300% or mission-critical cost avoidance; validated assumptions; payback < 6 months; sensitivity analysis done |

**Special cases:**
- **Infrastructure/platform projects:** ROI via cost avoidance and developer productivity; requires TCO calculation
- **Regulatory compliance projects:** ROI via penalty avoidance; quantify the regulatory risk cost
- **Experimental/R&D projects:** ROI defined by option value; require a separate scoring approach

---

### Axis 8: Technology Maturity (TRL)
**Layer:** Delivery Readiness (L5)
**Weight:** 0.12
**Who scores:** Tech Lead

| Score | Criteria |
|-------|----------|
| 1 | Core technology at TRL 1–3; proof-of-concept only; production delivery is speculative |
| 2 | Core technology at TRL 4–5; validated in lab; significant unknowns remain for production |
| 3 | Core technology at TRL 6–7; demonstrated in relevant environment; some production risk |
| 4 | Core technology at TRL 7–8; near-production or production-proven; minor gaps only |
| 5 | Core technology at TRL 9; proven at required scale in production globally; well-understood failure modes |

---

### Axis 9: Organizational Readiness (ORL)
**Layer:** Delivery Readiness (L5)
**Weight:** 0.07
**Who scores:** PM + stakeholder representative

| Score | Criteria |
|-------|----------|
| 1 | No organizational preparation; key stakeholders unaware the project exists; no operational owner |
| 2 | Leadership aware; initial discussions; no concrete preparation; change management absent |
| 3 | Stakeholders briefed; ownership assigned; change management plan drafted; training timeline defined |
| 4 | Change management executed; operational owner trained; pilot user group identified and prepared |
| 5 | Full organizational readiness: pilot completed; lessons incorporated; support processes live; success metrics baselined |

---

### Axis 10: Legal and Regulatory Readiness (LRL)
**Layer:** Delivery Readiness (L5)
**Weight:** 0.06
**Who scores:** PM + Legal

| Score | Criteria |
|-------|----------|
| 1 | Applicable regulations not identified; no legal review; potential violations unknown |
| 2 | Regulations identified; no review conducted; potential blockers unresolved |
| 3 | Legal review in progress; key requirements identified; some gaps remain unresolved |
| 4 | Legal review complete; all requirements mapped to technical controls; minor items pending |
| 5 | Full legal sign-off; all requirements addressed; compliance evidence available; audit trail designed |

**Mandatory triggers for legal review:**
- Any personal data collected or processed
- Employee behavioral monitoring (GDPR Art. 88 / employment law)
- Cross-border data transfers
- AI/ML decision-making affecting individuals
- Healthcare, financial, or regulated industry scope

---

## Weight Summary

| # | Axis | Weight | Layer |
|---|------|--------|-------|
| 1 | Problem-Solution Fit | 0.12 | L1 |
| 2 | Success Criterion Clarity | 0.08 | L1 |
| 3 | TELOS Feasibility Composite | 0.15 | L2 |
| 4 | Quality Attribute Coverage | 0.10 | L3 |
| 5 | Architecture Risk & Tradeoff | 0.08 | L3 |
| 6 | Strategic Value | 0.12 | L4 |
| 7 | Financial Return (ROI) | 0.10 | L4 |
| 8 | Technology Maturity (TRL) | 0.12 | L5 |
| 9 | Organizational Readiness | 0.07 | L5 |
| 10 | Legal/Regulatory Readiness | 0.06 | L5 |
| | **TOTAL** | **1.00** | |

---

## Composite Score Formula

```
Project_composite = Σ (weight_i × score_i)  for i = 1..10

= 0.12×s1 + 0.08×s2 + 0.15×s3 + 0.10×s4 + 0.08×s5
+ 0.12×s6 + 0.10×s7 + 0.12×s8 + 0.07×s9 + 0.06×s10

Range: 1.0 – 5.0
```

---

## Composite Verdict Labels

| Composite Score | Verdict | Meaning |
|----------------|---------|---------|
| 4.5 – 5.0 | **Proceed with confidence** | Strongly aligned, feasible, ready |
| 4.0 – 4.4 | **Proceed** | Viable; document and monitor flagged risks |
| 3.0 – 3.9 | **Proceed with conditions** | Address specific gaps before full commitment |
| 2.0 – 2.9 | **Conditional hold** | Significant restructuring required; re-evaluate |
| 1.0 – 1.9 | **Do not proceed** | Fundamental blockers; must be resolved or project dropped |

---

## Hard Gate Override Rules

The following conditions override the composite score verdict regardless of average:

| Condition | Override verdict |
|-----------|----------------|
| Any axis = 1 | "Do Not Proceed — [axis name] has a structural blocker" |
| Axis 3 (TELOS) any sub-dimension = 1 | "Do Not Proceed — [T/E/L/O/S] has a structural blocker" |
| Axis 10 (Legal) < 2 AND data collection involved | "Conditional — legal review required before any data collection or development" |
| Axis 8 (TRL) < 2 AND core technology is novel | "Conditional — technology validation required before production commitment" |

---

## Sensitivity Analysis

After scoring, run a weight perturbation check:

```
For each axis i:
  Vary weight by ±20%; recalculate composite; check if verdict changes

If verdict changes when any single weight shifts ±20%:
  → Verdict is SENSITIVE; flag in report with the sensitive axis
  → Stakeholders should discuss the axis weighting explicitly

If verdict is stable across all ±20% perturbations:
  → Verdict is ROBUST; confidence in decision is high
```

---

## Radar Visualization Specification

### Chart Type
Radar (spider) chart with 10 axes, uniform 1–5 scale on each axis.

### Visual Encoding
- **Blue fill:** Current project scores
- **Red dashed line:** Minimum threshold line (score = 3.0 on all axes)
- **Green dashed line:** Recommended target line (score = 4.0 on all axes)
- **Dot markers:** Individual axis scores with numerical label

### Risk Overlay
Axes with score ≤ 2 are highlighted in amber on the radar chart to immediately draw attention to gaps.

### Comparison Mode
When comparing multiple projects, overlay 2–3 radars with different colors and opacity to visually identify which project has the strongest profile across which dimensions.

---

## Scoring Panel Guidelines

### Calibration
Before scoring a project, the scoring panel should:
1. Review the rubric for each axis
2. Score independently (before group discussion)
3. Discuss and resolve disagreements > 1 point gap
4. Document the rationale for scores ≤ 2 and ≥ 4

### Documentation Requirements
For each axis, the completed scorecard must include:
- **Score (1–5)**
- **1–2 sentence rationale**
- **Key risk or strength driving the score**
- **For scores ≤ 2:** Required action before re-evaluation
- **For scores ≥ 4:** Evidence supporting the high score

### Anti-Gaming Note

This scoring system is a **decision support tool**, not a gatekeeping mechanism to be optimized around. If scores are inflated to get a project approved, the system fails its purpose. The scoring panel is accountable for honest assessment. BOD review of scoring rationale (not just composite scores) is the audit mechanism.
