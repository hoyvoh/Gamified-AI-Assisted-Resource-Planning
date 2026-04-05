---
source: "Theory of Change and Logic Model — Composite"
references:
  - title: "Theory of Change: A Practical Tool for Action, Results and Learning"
    authors: ["Annie E. Casey Foundation"]
    year: 2004
  - title: "Developing a Theory of Change"
    authors: ["Brest, Paul"]
    venue: "Stanford Social Innovation Review"
    year: 2010
  - title: "W.K. Kellogg Foundation Logic Model Development Guide"
    venue: "W.K. Kellogg Foundation"
    year: 2004
  - title: "Theory of Change in Software Project Evaluation"
    venue: "Software Engineering Institute / PMI Practitioner Synthesis"
    year: 2022
type: composite_source
relevance: project_analysis
---

# Theory of Change and Logic Model for Software Project Evaluation

## Overview

Theory of Change (ToC) and Logic Models are program evaluation tools adapted here for **evaluating whether a proposed software project has a coherent, achievable rationale**. They answer the most fundamental project planning question before any technical assessment:

> *"Why do we believe this project will produce the desired outcomes — and is that belief grounded?"*

A project that cannot articulate a clear ToC is a risk before a single line of code is written.

---

## Part 1: Theory of Change

### What It Is

Theory of Change is a participatory planning and evaluation methodology that describes:

1. **The long-term goal** (the ultimate change desired in the world)
2. **The preconditions** necessary for that goal to be achieved
3. **The interventions** (what the project actually does)
4. **The causal logic** linking interventions → preconditions → goal
5. **The assumptions** that must hold for the chain to work

It is fundamentally an **if-then chain:** "If we do X, then Y will happen, because we assume Z."

### ToC Structure

```
[Context / Problem Statement]
        ↓
[Inputs] → [Activities] → [Outputs] → [Short-term Outcomes] → [Long-term Impact]
                                              ↑
                                       [Assumptions at each step]
```

### The Five Core Questions (adapted for software projects)

| Question | What it asks | Why it matters |
|----------|-------------|----------------|
| **WHAT** | What is the project building? | Defines scope and deliverable |
| **WHO** | Who are the target beneficiaries/users? | Defines impact pathway |
| **WHY** | Why will this intervention cause the desired change? | Tests causal logic |
| **WHEN** | What is the timeline for outcomes to materialize? | Tests realism of impact claims |
| **HOW MUCH** | What is the expected magnitude of change? | Tests scale of ambition vs. resources |

---

## Part 2: Logic Model

### Difference from ToC

A **Logic Model** is more operational and linear than a ToC. It focuses on the resource-to-outcome chain without requiring full causal theory specification. It is commonly used for **program evaluation** and grant reporting.

| Component | Definition | Example (software project) |
|-----------|------------|---------------------------|
| **Inputs** | Resources invested | Developer time, budget, infrastructure, data |
| **Activities** | What the project does | Build feature X, integrate API Y, train model Z |
| **Outputs** | Direct products of activities | Working software, documentation, tests |
| **Short-term outcomes** | Immediate results | Users adopt tool, process time reduced 20% |
| **Medium-term outcomes** | Changes in behavior/practice | Team decision-making improves, errors reduced |
| **Long-term impact** | Ultimate goal | Revenue increase, operational cost reduction |

### Logic Model Template for Software Projects

```
INPUTS                 ACTIVITIES              OUTPUTS              OUTCOMES                IMPACT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dev team (N WFU)    →  Sprint planning      → Backlog             → Team alignment        → Faster delivery
Budget ($X)         →  Feature development  → Working features    → Reduced manual work   → Cost savings
Existing codebase   →  Code review          → Merged PRs          → Lower defect rate     → User trust
User research       →  User testing         → Test results        → Better UX             → Adoption
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Part 3: Assumptions Analysis

The most critical (and most neglected) element of ToC is the **assumptions** embedded in the causal chain. For software projects, common assumption categories:

### Technical Assumptions
- "The existing API will be stable and available"
- "Performance will be acceptable at the target scale"
- "The chosen technology will support the required features"

### Human/Behavioral Assumptions
- "Users will adopt the tool without significant change management"
- "The team has sufficient skill in the required technologies"
- "Stakeholders will provide timely feedback during development"

### Organizational Assumptions
- "Management will prioritize this over competing initiatives"
- "The political support for this project will persist through delivery"
- "Cross-team dependencies will be resolved cooperatively"

### Market/Environment Assumptions
- "The regulatory environment will not change during delivery"
- "The competitive landscape will not shift the need for this product"

### Assumption Risk Matrix

```
Criticality of Assumption
HIGH │  ★ TEST FIRST   │  ⚠ MONITOR        │
     │  (blocks ToC)   │  (watch carefully) │
─────┼─────────────────┼───────────────────┤
LOW  │  ✓ ACCEPT       │  ✓ ACCEPT         │
     │                 │                   │
     └─────────────────┴───────────────────┘
             LOW                HIGH
         Uncertainty of Assumption
```

---

## Part 4: Applying ToC to Software Project Pre-Evaluation

### Structured Questions for PM/TL Review

**1. Problem Clarity (does the problem statement make sense?)**
- Is the problem specific enough to bound the solution?
- Is there evidence the problem exists (data, user research, complaints)?
- Has the root cause been identified, not just the symptom?

**2. Solution Fitness (will this solution address the problem?)**
- Is there a plausible mechanism linking the software to the desired outcome?
- Have alternative solutions been considered and rejected (with rationale)?
- Is the scope appropriate for the problem scale?

**3. Population Definition (who exactly benefits?)**
- Is the target user population clearly defined?
- Is the population accessible (can we reach them)?
- Is the population's need actually validated, not assumed?

**4. Causal Chain Plausibility (will outcomes lead to impact?)**
- Does the short-term outcome logically follow from the output?
- Does the long-term impact logically follow from sustained outcomes?
- Are there alternative causal explanations that could undermine the theory?

**5. Assumption Vulnerability (what must be true for this to work?)**
- List top 5 assumptions; assess criticality and uncertainty for each
- Any single-point-of-failure assumptions?

---

## Part 5: ToC Scoring Rubric (Layer 1 of Project Analysis)

### Axis: Problem-Solution Fit

| Score | Criteria |
|-------|----------|
| 1 | Problem is vague or undefined; no evidence of user need; solution is speculative |
| 2 | Problem described but not validated; solution has weak logical connection to problem |
| 3 | Problem is clear with some supporting evidence; solution addresses at least the primary driver |
| 4 | Problem is validated (user research, data); solution has credible mechanism; assumptions identified |
| 5 | Problem is well-evidenced with quantified impact; solution is directly validated against user needs; assumptions tested |

### Axis: Clarity of Success Criteria

| Score | Criteria |
|-------|----------|
| 1 | No measurable outcomes defined; success is undefined |
| 2 | Vague success criteria ("users will be happier"); no measurement plan |
| 3 | Outcomes defined but not fully measurable; some KPIs identified |
| 4 | SMART outcomes defined; measurement plan described; baseline established |
| 5 | Full Logic Model with SMART outcomes, measurement plan, baseline data, and defined evaluation points |

### Axis: Stakeholder Alignment

| Score | Criteria |
|-------|----------|
| 1 | Key stakeholders unidentified; no buy-in evidence |
| 2 | Stakeholders identified but not engaged; potential conflict unaddressed |
| 3 | Primary stakeholders aligned; some secondary stakeholder gaps |
| 4 | Broad stakeholder alignment; conflict points identified and mitigated |
| 5 | Full stakeholder map with sign-off; shared ownership of outcomes; executive sponsorship confirmed |

---

## Part 6: Common Failure Modes in Software Project ToC

| Failure Mode | What goes wrong | Detection signal |
|-------------|-----------------|-----------------|
| **Solution in search of a problem** | Tech chosen before problem defined | Technology named in brief before problem statement |
| **Assumed adoption** | No plan for user change management | "Users will switch to the new tool" with no onboarding plan |
| **Activity-output confusion** | Shipping features ≠ achieving outcomes | Success defined as "features built" not "users helped" |
| **Unmeasured impact** | Impact claimed but cannot be demonstrated | No measurement plan or lagging indicators undefined |
| **Assumption blindness** | Critical assumptions never articulated | ToC has no assumptions section |
| **Scope-impact mismatch** | Tiny project expected to produce large impact | Impact claims vastly exceed scope of intervention |

---

## Citations

1. Annie E. Casey Foundation. (2004). *Theory of Change: A Practical Tool for Action, Results and Learning*. Baltimore.
2. Brest, P. (2010). The Power of Theories of Change. *Stanford Social Innovation Review*, Spring 2010.
3. W.K. Kellogg Foundation. (2004). *Logic Model Development Guide*. Battle Creek, MI.
4. Weiss, C. H. (1995). Nothing as practical as good theory: Exploring theory-based evaluation for comprehensive community initiatives for children and families. *New Approaches to Evaluating Community Initiatives*, 1, 65–92.
