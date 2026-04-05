---
title: "Project Analysis Methodology — 5-Layer Evaluation Framework"
type: synthesis
sources:
  - "00_sources/toc_logic_model.md"
  - "00_sources/telos_faf.md"
  - "00_sources/atam_cbam.md"
  - "00_sources/mcda_mcdm_ahp_topsis.md"
  - "00_sources/iso25010.md"
  - "00_sources/trl_readiness.md"
target_users: ["PM", "Tech Lead"]
output: "Radar chart + feasibility verdict per project"
ai_role: "Decision support only — AI assists, does not decide"
---

# Project Analysis Methodology: 5-Layer Evaluation Framework

## Purpose

This document defines the unified methodology for evaluating software projects before resource commitment. It synthesizes six frameworks into a **structured, repeatable, quantitative evaluation process** that produces:

1. A **radar chart** (10 axes, scored 1–5) capturing the project's profile across all dimensions
2. A **feasibility verdict** (Proceed / Conditional / Do Not Proceed) with documented rationale
3. A **risk register** highlighting the most critical gaps and mitigation requirements

**Target users:** PM and Tech Lead conducting project pre-qualification.
**AI role:** Assists in scoring consistency and pattern recognition; does not make investment decisions.

---

## Framework Architecture

The five evaluation layers are designed as a **sequential funnel**: earlier layers act as gates that must clear before later layers provide meaningful signal.

```
Layer 1: Theory of Change (WHY)
        ↓ Gate: Problem-solution fit ≥ 3 required
Layer 2: TELOS Feasibility (CAN WE)
        ↓ Gate: No dimension = 1; Legal ≥ 2 required
Layer 3: Architecture/Technology (HOW)
        ↓ Gate: No blocking architectural risks
Layer 4: MCDA Prioritization (SHOULD WE, RELATIVE TO ALTERNATIVES)
        ↓ (produces ranked score for portfolio comparison)
Layer 5: Readiness Assessment (ARE WE READY)
        ↓ Gate: TRL ≥ 4; Legal readiness ≥ 3
```

A project that fails Layer 1 or 2 does not need Layer 3–5 analysis — proceed with "Conditional" verdict pending resolution of the fundamental gap.

---

## Layer 1: Theory of Change (What/Who/Why)

**Framework source:** `toc_logic_model.md`
**Purpose:** Validate that the project has a coherent causal theory linking the intervention to the desired outcome.

### Inputs Required

Before Layer 1 can be assessed, the project brief must contain:
- A problem statement with supporting evidence
- A defined target user/beneficiary population
- A proposed intervention (what will be built)
- A success definition with at least one measurable outcome

If any of these is missing, **the project brief is incomplete** and evaluation cannot proceed.

### Assessment Questions

| Dimension | Key questions |
|-----------|-------------|
| **Problem clarity** | Is the problem specific? Is there evidence it exists? Is the root cause identified? |
| **Solution fitness** | Is there a plausible mechanism linking the software to the outcome? Has the solution been validated against user need? |
| **Population definition** | Is the target user group clear and reachable? Is their need validated? |
| **Causal chain** | Does the logic model hold from inputs → activities → outputs → outcomes → impact? |
| **Assumption vulnerability** | Are critical assumptions identified? Any single-point-of-failure assumptions? |

### Layer 1 Scoring Axes

| Axis | Label | What it measures |
|------|-------|-----------------|
| L1a | Problem-Solution Fit | Is the intervention causally connected to the problem? |
| L1b | Success Criterion Clarity | Are outcomes measurable and defined? |
| L1c | Stakeholder Alignment | Are key stakeholders identified and aligned? |

### Layer 1 Gate Rule

```
IF L1a < 3:
    VERDICT = "Conditional — problem-solution fit insufficient"
    STOP evaluation (Layer 2–5 premature)
```

---

## Layer 2: TELOS Feasibility (Can We Do This?)

**Framework source:** `telos_faf.md`
**Purpose:** Identify whether structural blockers exist across five dimensions that would prevent the project from succeeding regardless of how well it's designed.

### Five TELOS Dimensions

| Dimension | Core question | Assessed by |
|-----------|--------------|-------------|
| **Technical (T)** | Can it be built with available technology and team skills? | Tech Lead |
| **Economic (E)** | Is the financial investment justified by expected return? | PM + Finance |
| **Legal (L)** | Can it be built and operated within applicable law? | Legal + PM |
| **Operational (O)** | Will the organization adopt and operate it? | PM + Stakeholders |
| **Schedule (S)** | Can it be delivered in the required timeframe? | Tech Lead + PM |

### Hard Gate Rules (Non-Negotiable)

```
IF any dimension = 1:
    VERDICT = "Do Not Proceed — structural blocker present"
    REQUIRED: Resolve the blocker before re-evaluation

IF L_score < 2 (Legal):
    VERDICT = "Conditional — legal review required immediately"
    REQUIRED: Legal sign-off before any development begins

IF T_score < 2 (Technical):
    VERDICT = "Conditional — fundamental technical capability gap"
    REQUIRED: Proof of concept or technology validation first
```

### TELOS Composite

```
TELOS_composite = (T + E + L + O + S) / 5

4.5–5.0: Highly Feasible → proceed
3.5–4.4: Feasible → proceed with documented mitigations
2.5–3.4: Conditionally Feasible → address gaps before committing
1.5–2.4: Marginal → significant restructuring required
< 1.5:   Not Feasible → do not proceed
```

---

## Layer 3: Architecture and Technology Evaluation (How?)

**Framework sources:** `atam_cbam.md`, `iso25010.md`
**Purpose:** Validate that the proposed technical approach can deliver the required quality attributes, and that architectural risks are identified and manageable.

### Step 1: Quality Attribute Prioritization (ISO 25010)

Before assessing the architecture, stakeholders must agree on which quality attributes matter most for this specific project:

```
Quality attribute priority (H/M/L) for this project:
  □ Functional Suitability
  □ Performance Efficiency
  □ Compatibility / Interoperability
  □ Usability
  □ Reliability / Availability
  □ Security
  □ Maintainability
  □ Portability
```

Any attribute rated **High** but not addressed in the architecture is automatically an architectural risk.

### Step 2: Architecture Assessment (ATAM-derived)

For each High-priority quality attribute, assess the architecture:

| Question | Good answer | Red flag |
|----------|------------|---------|
| What architectural decision addresses this QA? | Named pattern/component | "We'll handle it later" |
| What is the measurable target? | Specific SLA/threshold | Vague ("fast", "secure") |
| What could go wrong with this decision? | Known risks identified | Not considered |
| Has this been validated (PoC, benchmark, load test)? | Evidence exists | Assumption only |

### Step 3: CBAM — Architecture Investment Prioritization

For projects with multiple viable architectural approaches, CBAM logic applies:

```
For each architectural alternative:
  Expected_benefit = Σ (QA_importance × quality_improvement_achieved)
  ROI = Expected_benefit / Implementation_cost_in_WFU_days

Choose: highest ROI alternative that meets minimum QA thresholds
```

### Layer 3 Scoring Axes

| Axis | Label | What it measures |
|------|-------|-----------------|
| L3a | Quality Attribute Coverage | Are critical QAs addressed with measurable targets? |
| L3b | Tradeoff Awareness | Have architectural tradeoffs been consciously evaluated? |
| L3c | Risk Identification | Have architectural risks been identified with mitigations? |

### Layer 3 Gate Rule

```
IF any High-priority QA has no architectural coverage:
    → Flag as architectural risk (mandatory, not blocking)

IF L3c = 1 (no risks identified for a complex system):
    → Treat as evaluation failure (risks certainly exist; they haven't been found)
```

---

## Layer 4: MCDA Prioritization (Should We, Relative to Alternatives?)

**Framework source:** `mcda_mcdm_ahp_topsis.md`
**Purpose:** Provide a quantitative ranking when multiple project candidates compete for the same resources. Converts multi-criteria assessments into a comparable composite score.

### When to Apply Layer 4

Layer 4 is most valuable when:
- Multiple projects are competing for the same resource pool (portfolio prioritization)
- A single project has multiple scoping options that need comparison
- Stakeholders disagree on relative importance and need a structured way to align

For single-project go/no-go decisions, Layer 4 provides the composite score but the gate logic comes from Layers 1–3.

### AHP Weight Derivation

Stakeholders use pairwise comparison to derive weights. Default starting weights (adjust via AHP):

| Criterion | Default Weight |
|-----------|--------------|
| Strategic Value | 0.30 |
| Financial Return (ROI) | 0.25 |
| Feasibility (TELOS composite) | 0.20 |
| Delivery Risk | 0.15 |
| Organizational Impact | 0.10 |

### TOPSIS Ranking

Using scores from all layers:

```python
# Simplified TOPSIS for project ranking

criteria = {
    'strategic_value':     {'weight': 0.30, 'type': 'benefit'},
    'financial_return':    {'weight': 0.25, 'type': 'benefit'},
    'feasibility':         {'weight': 0.20, 'type': 'benefit'},
    'delivery_risk':       {'weight': 0.15, 'type': 'cost'},    # lower = better
    'org_impact':          {'weight': 0.10, 'type': 'cost'},    # lower = better
}

# Closeness coefficient (CC):
# CC closer to 1.0 = closest to ideal best; rank by CC descending
```

### Layer 4 Scoring Axes

| Axis | Label | What it measures |
|------|-------|-----------------|
| L4a | Strategic Value | Alignment to organizational strategy and roadmap |
| L4b | Financial Return | ROI and payback period quality |
| L4c | Portfolio Fit | How well this fits the current project portfolio |

---

## Layer 5: Delivery Readiness (Are We Ready?)

**Framework source:** `trl_readiness.md`
**Purpose:** Assess whether the technology, organization, legal framework, integration dependencies, and data are sufficiently mature to support production delivery.

### Five Readiness Dimensions

| Dimension | Acronym | Scope | Assessed by |
|-----------|---------|-------|-------------|
| Technology Readiness Level | TRL | Core technology maturity (1–9) | Tech Lead |
| Organizational Readiness Level | ORL | Change management and adoption preparation (1–6) | PM |
| Legal/Regulatory Readiness Level | LRL | Regulatory compliance status (1–6) | Legal + PM |
| Integration Readiness Level | IRL | External system dependency maturity (1–6) | Tech Lead |
| Data Readiness Level | DRL | Data availability, quality, governance (1–6) | Data Lead / Tech Lead |

### Readiness Composite Score

```
Readiness_composite = 0.35 × TRL_normalized
                    + 0.20 × ORL_normalized
                    + 0.20 × LRL_normalized
                    + 0.15 × IRL_normalized
                    + 0.10 × DRL_normalized
```

(All dimensions normalized to 1–5 scale before combining.)

### Layer 5 Gate Rules

```
IF TRL_normalized < 2 (core technology not production-validated):
    VERDICT = "Conditional — technology risk too high for production commitment"
    REQUIRED: Proof of concept at TRL ≥ 5 before proceeding

IF LRL_normalized < 2 (legal review not initiated):
    VERDICT = "Conditional — legal assessment required before development"
```

### Layer 5 Scoring Axes

| Axis | Label | What it measures |
|------|-------|-----------------|
| L5a | Technology Maturity | TRL of core stack components |
| L5b | Organizational Readiness | ORL: change management preparation |
| L5c | Legal/Regulatory Readiness | LRL: compliance coverage |

---

## Composite Verdict Logic

### 10 Radar Axes Summary

| # | Axis | Layer | Source Framework |
|---|------|-------|----------------|
| 1 | Problem-Solution Fit | L1 | Theory of Change |
| 2 | Success Criterion Clarity | L1 | Logic Model |
| 3 | TELOS Feasibility Composite | L2 | TELOS/FAF |
| 4 | Quality Attribute Coverage | L3 | ISO 25010 + ATAM |
| 5 | Tradeoff & Risk Awareness | L3 | ATAM + CBAM |
| 6 | Strategic Value | L4 | MCDA/AHP |
| 7 | Financial Return | L4 | MCDA/AHP |
| 8 | Technology Maturity | L5 | TRL |
| 9 | Organizational Readiness | L5 | ORL |
| 10 | Legal/Regulatory Readiness | L5 | LRL |

### Verdict Decision Tree

```
START
  │
  ├─ Any axis = 1? ──────────────→ "Do Not Proceed — structural blocker"
  │                                 [List the axis and required action]
  │
  ├─ L1a (Problem-Solution) < 3? → "Conditional — clarify problem/solution first"
  │
  ├─ TELOS composite < 2.5? ─────→ "Conditional — feasibility gaps must be resolved"
  │
  ├─ Legal axis < 2? ────────────→ "Conditional — legal review required immediately"
  │
  ├─ TRL < 3? ───────────────────→ "Conditional — technology maturity insufficient"
  │
  ├─ Composite score ≥ 4.0? ─────→ "Proceed with confidence"
  │
  ├─ Composite score ≥ 3.0? ─────→ "Proceed with documented risk mitigations"
  │
  └─ Composite score < 3.0? ─────→ "Conditional — address gaps before committing resources"
```

### Overall Score Formula

```
Project_score = (Σ all 10 axis scores) / 10

Weighted variant:
  Project_score = Σ (axis_weight × axis_score)
  where default weights are defined in 02_project_radar_scoring_matrix.md
```

---

## Process: Who Does What

### Project Analysis Session (recommended format)

**Participants:** PM, Tech Lead, one domain expert
**Duration:** 2–4 hours for a full evaluation; 1 hour for a quick scan
**Output:** Completed radar, verdict, risk register

| Step | Who | Duration |
|------|-----|---------|
| 1. Review project brief; confirm completeness | PM | 15 min |
| 2. Layer 1 — ToC assessment | PM + TL | 30 min |
| 3. Layer 2 — TELOS assessment | PM + TL + Legal | 45 min |
| 4. Layer 3 — Architecture assessment | TL | 30 min |
| 5. Layer 4 — MCDA scoring | PM + TL | 20 min |
| 6. Layer 5 — Readiness assessment | PM + TL | 20 min |
| 7. Composite verdict + risk register | PM + TL | 20 min |

### Role Definitions

| Role | Responsibility |
|------|---------------|
| **PM** | Owns Layers 1, 4; inputs to Layers 2, 5 |
| **Tech Lead** | Owns Layers 3, 5 (TRL, IRL); inputs to Layer 2 (T, S) |
| **Legal** | Owns Layer 2 (L dimension) and Layer 5 (LRL) |
| **Finance** | Inputs to Layer 2 (E dimension) and Layer 4 (ROI) |

---

## AI Assistance Points

The AI (Claude) can assist in the following ways during project evaluation:

| Task | AI capability | Human override |
|------|-------------|----------------|
| Scoring rubric recall | Retrieve rubric definitions on demand | Human makes final score |
| Assumption identification | Prompt for missing assumptions based on project description | Human validates |
| Architectural risk pattern matching | Identify common anti-patterns in described architecture | Human confirms relevance |
| Historical comparison | Compare current project scores to past project patterns | Human interprets |
| Risk register drafting | Draft initial risk register from identified gaps | Human reviews and edits |

**AI does NOT:**
- Make investment decisions
- Override human judgment on scores
- Access or infer confidential project data beyond what is explicitly shared

---

## Relationship to Resource Analysis

Once a project receives a "Proceed" or "Conditional" verdict, the project profile feeds into resource allocation:

```
Project_score → required_skills_vector → match_against_developer_profiles
Project_timeline → WFU_budget → team_composition_recommendation
Project_risk_profile → required_seniority_minimum → staffing_constraints
```

The project analysis output is the primary input to the resource planning layer of the system.
