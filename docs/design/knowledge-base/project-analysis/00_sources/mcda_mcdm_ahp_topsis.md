---
source: "MCDA / MCDM / AHP / TOPSIS — Composite"
references:
  - title: "How to Make a Decision: The Analytic Hierarchy Process"
    authors: ["Saaty, Thomas L."]
    venue: "European Journal of Operational Research"
    doi: "10.1016/0377-2217(90)90057-I"
    year: 1990
  - title: "A New Approach to Multiple Attribute Decision Making"
    authors: ["Hwang, C.L.", "Yoon, K."]
    venue: "Lecture Notes in Economics and Mathematical Systems, Springer"
    year: 1981
  - title: "Multiple Criteria Decision Analysis: State of the Art Surveys"
    authors: ["Figueira, J.", "Greco, S.", "Ehrgott, M."]
    venue: "Springer"
    year: 2005
  - title: "Application of AHP and TOPSIS for Software Project Evaluation"
    venue: "IEEE Transactions on Engineering Management / Composite synthesis"
    year: 2020
type: composite_source
relevance: project_analysis
---

# Multi-Criteria Decision Analysis: AHP and TOPSIS for Project Evaluation

## Overview

**MCDA (Multi-Criteria Decision Analysis)** / **MCDM (Multi-Criteria Decision Making)** are families of decision support methods for evaluating alternatives against multiple, often conflicting, criteria. They are the mathematical foundation for converting qualitative assessments into defensible, quantitative rankings.

For software project evaluation, MCDA answers:
> *"Given N candidate projects, each scored against M criteria with different importance weights, which project has the highest overall expected value?"*

Two methods are central to our system:
- **AHP (Analytic Hierarchy Process):** Derives criterion weights via pairwise comparison
- **TOPSIS (Technique for Order Preference by Similarity to Ideal Solution):** Ranks alternatives by geometric distance from best and worst ideal solutions

---

## Part 1: AHP — Analytic Hierarchy Process

### Developed by Thomas Saaty (1980)

AHP is a structured method for organizing and analyzing complex decisions by breaking them into a **hierarchy**:

```
Level 1 (Goal):       Overall project value / priority
Level 2 (Criteria):   Feasibility | Strategic Fit | Technical Soundness | ROI | Risk
Level 3 (Sub-criteria): Per criterion, detailed sub-dimensions
Level 4 (Alternatives): Project A | Project B | Project C
```

### Step 1: Construct the Pairwise Comparison Matrix

For N criteria, each pair is compared using Saaty's 1–9 scale:

| Scale | Interpretation |
|-------|----------------|
| 1 | Equal importance |
| 3 | Moderate importance of one over another |
| 5 | Strong importance |
| 7 | Very strong importance |
| 9 | Extreme importance |
| 2, 4, 6, 8 | Intermediate values |

**Example pairwise matrix for 4 criteria** (ROI vs. Feasibility vs. Strategy vs. Risk):

```
         ROI   Feasibility  Strategy  Risk
ROI    [ 1       3           5        2  ]
Feas.  [ 1/3     1           3        1  ]
Strat. [ 1/5     1/3         1        1/2]
Risk   [ 1/2     1           2        1  ]
```

*Interpretation: ROI is 3× more important than Feasibility; ROI is 5× more important than Strategy.*

### Step 2: Calculate Priority Vector (Weights)

1. Normalize each column by dividing each element by the column sum
2. Calculate the row average — this is the weight (w_i) for each criterion

```
Normalized matrix → Row averages:
  ROI:         w₁ = 0.48
  Feasibility: w₂ = 0.20
  Strategy:    w₃ = 0.10
  Risk:        w₄ = 0.22
               ─────────
  Sum:              1.00
```

### Step 3: Consistency Check

AHP includes a built-in consistency check to ensure the pairwise comparisons are logically coherent (if A > B and B > C, then A > C should hold transitively).

```
Consistency Ratio (CR) = Consistency Index (CI) / Random Index (RI)

CI = (λ_max - n) / (n - 1)
  where λ_max = weighted sum of each column × weight / n

RI values by matrix size:
  n=3: RI=0.58, n=4: RI=0.90, n=5: RI=1.12, n=6: RI=1.24, n=7: RI=1.32

Acceptable: CR < 0.10
If CR ≥ 0.10: revise pairwise comparisons
```

### Step 4: Score Each Alternative Against Each Criterion

For each criterion, repeat the pairwise comparison process across the alternatives (projects) to get relative scores. Alternatively, use direct scoring (1–5 scale or 0–100 scale) per criterion.

### Step 5: Calculate Overall Score

```
Overall_score(Alternative_j) = Σ (w_i × score_ij)  for all criteria i
```

---

## Part 2: TOPSIS

### Developed by Hwang and Yoon (1981)

TOPSIS selects the alternative that is **simultaneously closest to the ideal best solution** and **farthest from the ideal worst solution**.

Unlike simple weighted scoring (which only measures distance from the best), TOPSIS uses geometric distance in N-dimensional criteria space, accounting for both directions.

### Step 1: Construct Decision Matrix

```
         Criterion 1  Criterion 2  Criterion 3  Criterion 4
Alt. A  [   8            6            7            9      ]
Alt. B  [   5            9            6            7      ]
Alt. C  [   7            5            8            6      ]
```

Rows = alternatives (projects), Columns = criteria, Values = scores.

### Step 2: Normalize the Decision Matrix

```
r_ij = x_ij / √(Σ x_kj²)  for all k
```

This converts scores to unit vectors, making criteria comparable regardless of scale.

### Step 3: Apply Criterion Weights

```
v_ij = w_j × r_ij
```

where w_j is the weight for criterion j (from AHP or direct assignment).

### Step 4: Determine Ideal Best and Ideal Worst Solutions

```
Ideal Best (A+):   A+ = { max(v_ij) for benefit criteria, min(v_ij) for cost criteria }
Ideal Worst (A-):  A- = { min(v_ij) for benefit criteria, max(v_ij) for cost criteria }
```

Note: "benefit criteria" = higher is better (e.g., ROI); "cost criteria" = lower is better (e.g., Risk).

### Step 5: Calculate Separation Distances

```
Distance from ideal best:
  D+_i = √(Σ (v_ij - v_j+)²)  for all j

Distance from ideal worst:
  D-_i = √(Σ (v_ij - v_j-)²)  for all j
```

### Step 6: Calculate Closeness Coefficient and Rank

```
CC_i = D-_i / (D+_i + D-_i)

Range: 0 ≤ CC_i ≤ 1
  CC_i = 1 → Alternative i IS the ideal best solution
  CC_i = 0 → Alternative i IS the ideal worst solution

Rank alternatives by CC_i (descending) → highest CC = best choice
```

### TOPSIS Example Output

```
Project   D+     D-     CC     Rank
───────────────────────────────────
Project A  0.12   0.31   0.72    1st  ← Best overall
Project B  0.24   0.18   0.43    3rd
Project C  0.18   0.22   0.55    2nd
```

---

## Part 3: Sensitivity Analysis

Any MCDA result should include a **sensitivity analysis** to test whether the ranking changes if weights shift.

### Weight Perturbation Test

```python
# For each criterion i, vary weight by ±20% and check if ranking changes
for criterion in criteria:
    w_low = weights.copy(); w_low[criterion] *= 0.8; normalize(w_low)
    w_high = weights.copy(); w_high[criterion] *= 1.2; normalize(w_high)
    rank_low = topsis(alternatives, w_low)
    rank_high = topsis(alternatives, w_high)
    if rank_low != rank_high:
        print(f"Ranking is sensitive to {criterion} weight")
```

A **robust decision** is one where the top-ranked alternative remains first across all ±20% weight perturbations.

### Breakeven Analysis

For each competing pair of alternatives (A, B), find the weight value at which B overtakes A:

```
Find w* such that: CC_A(w*) = CC_B(w*)
```

If w* is far from the current weight estimate, the decision is robust. If w* is close, the decision is sensitive.

---

## Part 4: AHP + TOPSIS Combined Workflow for Project Ranking

### Recommended Combined Workflow

```
Step 1: Define criteria hierarchy via stakeholder workshop
        → Output: criterion list with sub-criteria

Step 2: AHP pairwise comparison (by PM + TL + key stakeholders)
        → Output: weight vector W = [w₁, w₂, ..., wₙ]
        → Verify: CR < 0.10

Step 3: Score each project on each criterion (1–5 or 0–100)
        → Method: structured rubrics (see scoring guides)
        → Who: cross-functional panel (PM, TL, Tech Lead)

Step 4: TOPSIS ranking with weights from Step 2
        → Output: ranked list with CC scores

Step 5: Sensitivity analysis
        → Output: confidence in ranking (robust vs. sensitive)

Step 6: Present to stakeholders with full rationale
        → Not a black box: show the matrix, weights, and raw scores
```

---

## Part 5: Criteria Set for Software Project MCDA

### Recommended Criteria Set (5 top-level, 18 sub-criteria)

| # | Criterion | Sub-criteria | Type |
|---|-----------|-------------|------|
| 1 | **Strategic Value** | Business alignment, Market differentiation, Stakeholder priority | Benefit |
| 2 | **Financial Return** | ROI, Payback period, Risk-adjusted NPV | Benefit |
| 3 | **Feasibility** | TELOS composite score, Architecture readiness | Benefit |
| 4 | **Delivery Risk** | Schedule risk, Technical risk, Team capability | Cost |
| 5 | **Organizational Impact** | Change management burden, Operational complexity, Regulatory exposure | Cost |

### Default Weight Distribution (starting point, to be adjusted via AHP)

| Criterion | Default Weight | Justification |
|-----------|---------------|---------------|
| Strategic Value | 0.30 | Alignment to vision is primary filter |
| Financial Return | 0.25 | ROI justifies resource allocation |
| Feasibility | 0.20 | Must-pass gate prevents infeasible projects |
| Delivery Risk | 0.15 | Risk-adjusted value |
| Organizational Impact | 0.10 | Change management cost often underweighted |

---

## Part 6: Scoring Matrix for Project MCDA

### Criterion 1: Strategic Value

| Score | Description |
|-------|-------------|
| 1 | No connection to strategic objectives; ad hoc request |
| 2 | Loosely aligned; not on roadmap |
| 3 | Aligned to stated objectives; included in roadmap |
| 4 | High-priority roadmap item; multiple strategic goals served |
| 5 | Mission-critical; directly enables organizational strategy; executive-sponsored |

### Criterion 2: Financial Return (ROI)

| Score | Description |
|-------|-------------|
| 1 | ROI clearly negative or unknown; no financial justification |
| 2 | ROI marginally positive (<25%) or based on unvalidated assumptions |
| 3 | ROI 25–100%; reasonable assumptions; payback < 18 months |
| 4 | ROI 100–300%; validated assumptions; payback < 12 months |
| 5 | ROI > 300% or mission-critical cost avoidance; payback < 6 months |

### Criterion 3: Feasibility (TELOS composite)

| Score | Description |
|-------|-------------|
| 1 | TELOS < 2.0; fundamental blockers |
| 2 | TELOS 2.0–2.4; significant gaps |
| 3 | TELOS 2.5–3.4; conditionally feasible |
| 4 | TELOS 3.5–4.4; feasible with documented risks |
| 5 | TELOS ≥ 4.5; highly feasible |

### Criterion 4: Delivery Risk (cost criterion — lower is better)

| Score | Description |
|-------|-------------|
| 1 | Extremely high risk; novel technology, unknown scope, team skill gaps |
| 2 | High risk; significant unknowns or dependencies |
| 3 | Medium risk; some unknowns; team capable but stretched |
| 4 | Low risk; well-understood technology; experienced team |
| 5 | Very low risk; proven approach; team has done it before |

*Note: For TOPSIS, this is a cost criterion — lower score = lower risk = better.*

### Criterion 5: Organizational Impact (cost criterion)

| Score | Description |
|-------|-------------|
| 1 | Major organizational change required; significant process disruption |
| 2 | Significant change management burden; multiple teams affected |
| 3 | Moderate change; clear ownership; manageable scope |
| 4 | Minor change; primarily technical; low process disruption |
| 5 | No organizational change required; drop-in addition to existing workflow |

---

## Part 7: Limitations and Ethical Considerations

| Limitation | Implication |
|-----------|-------------|
| **Garbage in, garbage out** | If scoring is biased or inconsistent, TOPSIS output is wrong. Use structured rubrics and multiple scorers. |
| **Weight subjectivity** | AHP weights reflect stakeholder values, not objective truth. Transparency and multi-party consensus are essential. |
| **Rank reversal problem** | Adding or removing alternatives can change rankings of unrelated alternatives (known TOPSIS limitation). |
| **False precision** | A CC score of 0.72 vs. 0.68 does not mean one project is definitively better — the difference may be within measurement noise. |
| **Not a replacement for judgment** | MCDA is a **decision support** tool. The output should inform, not replace, stakeholder deliberation. |

---

## Citations

1. Saaty, T. L. (1990). How to make a decision: The analytic hierarchy process. *European Journal of Operational Research*, 48(1), 9–26. DOI: 10.1016/0377-2217(90)90057-I
2. Hwang, C. L., & Yoon, K. (1981). *Multiple Attribute Decision Making: Methods and Applications*. Springer.
3. Figueira, J., Greco, S., & Ehrgott, M. (Eds.). (2005). *Multiple Criteria Decision Analysis: State of the Art Surveys*. Springer.
4. Triantaphyllou, E. (2000). *Multi-Criteria Decision Making Methods: A Comparative Study*. Springer.
