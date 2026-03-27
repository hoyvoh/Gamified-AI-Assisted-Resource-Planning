---
source: "TELOS Feasibility Framework + Feasibility Assessment Framework (FAF)"
references:
  - title: "Systems Analysis and Design"
    authors: ["Whitten, J.L.", "Bentley, L.D.", "Dittman, K.C."]
    venue: "McGraw-Hill"
    edition: "7th"
    year: 2004
  - title: "Feasibility Study Framework for IT Projects"
    venue: "PMI / PRINCE2 / Composite industry synthesis"
    year: 2020
  - title: "IT Project Feasibility Analysis: A Structured Approach"
    venue: "IEEE Software Engineering Practitioner Body of Knowledge"
    year: 2019
type: composite_source
relevance: project_analysis
---

# TELOS Feasibility Framework for Software Projects

## Overview

TELOS is a **multi-dimensional feasibility assessment framework** used in systems analysis to evaluate whether a proposed project should proceed past the concept phase. It pre-dates the software industry but has become the dominant structured feasibility lens for IT and software projects.

**TELOS = Technical + Economic + Legal + Operational + Schedule**

Each dimension must clear a minimum threshold for the project to be considered viable. A project that fails any single dimension has a structural blocker that must be resolved before investment continues.

---

## The Five TELOS Dimensions

### T — Technical Feasibility

**Question:** Can the project be built with available or acquirable technology?

| Sub-question | Assessment areas |
|-------------|-----------------|
| **Technology availability** | Does the required technology exist? Is it mature enough for production use? |
| **Infrastructure compatibility** | Can the project integrate with existing systems and infrastructure? |
| **Team capability** | Does the team have, or can it acquire, the skills to build this? |
| **Scalability** | Will the solution scale to the required load? |
| **Security** | Can the security and privacy requirements be met technically? |

**Common technical blockers:**
- Dependency on technology in alpha/beta state
- Required integration with systems that have no public API
- Performance requirements that current architecture cannot meet
- Team lacks required skills AND training/hiring timeline exceeds project window

**Scoring 1–5:**

| Score | Criteria |
|-------|----------|
| 1 | Core technology does not exist; fundamental capability gap; no credible path to resolution |
| 2 | Technology exists but is immature (pre-1.0, experimental); significant skill gaps with no plan |
| 3 | Technology proven but with known limitations; skill gaps addressable within timeline |
| 4 | Technology mature and well-understood; team has most required skills; minor gaps coverable |
| 5 | Technology proven at required scale; team has full capability; no known blockers |

---

### E — Economic Feasibility

**Question:** Is the financial investment justified by the expected return?

This is the most quantitative dimension and typically involves cost-benefit analysis.

#### Cost Categories

| Category | Items |
|----------|-------|
| **Development costs** | Developer time (WFU × rate), tooling, infrastructure setup |
| **Operational costs** | Hosting, monitoring, support, maintenance per year |
| **Opportunity costs** | What else could the team be building? |
| **Risk costs** | Estimated cost of rework, delays, failure modes |

#### Benefit Categories

| Category | Measurement approach |
|----------|---------------------|
| **Direct revenue** | New revenue enabled by the feature/product |
| **Cost reduction** | Manual work hours eliminated × hourly cost |
| **Risk mitigation** | Probability × cost of avoided incidents |
| **Strategic optionality** | Value of future capabilities unlocked |

#### Key Economic Ratios

```
ROI = (Total Benefits - Total Costs) / Total Costs × 100%

NPV = Σ [Cash Flow_t / (1 + discount_rate)^t]  for t = 0 to N

Payback Period = Total Investment / Annual Net Benefit
```

**Scoring 1–5:**

| Score | Criteria |
|-------|----------|
| 1 | No benefit analysis; costs vastly exceed any credible benefit; ROI clearly negative |
| 2 | Benefits identified but unquantified; costs underestimated; ROI unclear |
| 3 | Rough cost-benefit with positive ROI projection; some assumptions unvalidated |
| 4 | Detailed cost estimate; quantified benefits with reasonable assumptions; positive NPV |
| 5 | Full financial model; sensitivity analysis; NPV positive across scenarios; payback period defined |

---

### L — Legal Feasibility

**Question:** Can the project be built and operated within applicable legal and regulatory constraints?

| Area | Examples |
|------|---------|
| **Data privacy** | GDPR, CCPA, PDPA, LGPD — data collection, retention, deletion requirements |
| **IP / licensing** | Open source license compatibility; third-party IP risk |
| **Contractual obligations** | SLA requirements; terms of service of dependency APIs |
| **Industry regulations** | HIPAA (healthcare), PCI-DSS (payments), SOC 2 (B2B SaaS), FDA (medical software) |
| **Employment law** | Data monitoring of employees; consent requirements for behavioral tracking |
| **Export controls** | Encryption export regulations; sanctions list checks for user data |

**Key questions:**

1. Has legal reviewed the proposed data collection scope?
2. Does the project involve processing of personal data? (triggers GDPR/similar)
3. Are all third-party API/data licenses compatible with commercial use?
4. Is explicit user consent required and achievable?
5. Has IP ownership of outputs been established?

**Scoring 1–5:**

| Score | Criteria |
|-------|----------|
| 1 | Known legal violations; project as scoped is not legally permissible |
| 2 | Significant legal uncertainty; no legal review conducted; potential blockers unresolved |
| 3 | Legal review initiated; primary requirements identified; some gaps remain |
| 4 | Legal review complete; known requirements accommodated in design; minor items pending |
| 5 | Full legal sign-off; all regulatory requirements mapped to technical controls; audit trail designed |

---

### O — Operational Feasibility

**Question:** Will the solution work within the organization's operational context, and will people actually use it?

This dimension is the most frequently underestimated. A technically perfect solution that doesn't fit into existing workflows or organizational culture will fail operationally.

| Sub-dimension | Questions |
|--------------|-----------|
| **Organizational readiness** | Does the organization have processes to support this system? |
| **Change management** | Is there a plan to help users adopt the new tool? |
| **Support capacity** | Can the organization support and maintain the system post-launch? |
| **Workflow integration** | Does the solution integrate into existing work practices, or does it require radical change? |
| **Political feasibility** | Do key decision-makers support this? Are there internal opponents? |
| **Cultural fit** | Does the solution align with how the organization actually works? |

**Common operational failure modes:**
- System requires users to change deeply ingrained habits with no change management
- No designated owner/team for ongoing support post-launch
- Internal champion leaves; project loses organizational backing
- Solution optimizes for edge case; typical user workflow not supported

**Scoring 1–5:**

| Score | Criteria |
|-------|----------|
| 1 | Project requires significant organizational change with no change management plan; no operational owner identified |
| 2 | Operational gaps identified but not addressed; change management absent; support plan missing |
| 3 | Basic change management plan; support team identified; some workflow integration risks acknowledged |
| 4 | Detailed change management plan; operational owner assigned; support processes defined; workflow integration validated |
| 5 | Full organizational readiness assessment; change management executed; pilot user group validated; support processes live |

---

### S — Schedule Feasibility

**Question:** Can the project be delivered within the required timeframe?

| Sub-dimension | Assessment areas |
|--------------|-----------------|
| **Timeline realism** | Is the proposed delivery date achievable given scope and resources? |
| **Dependency risk** | Are there external dependencies that could delay the critical path? |
| **Resource availability** | Are the required team members available for the full duration? |
| **Estimation accuracy** | Has the effort been estimated with appropriate rigor? |
| **Buffer / contingency** | Is there adequate time buffer for unknowns? |

**Schedule feasibility heuristics:**

```
Estimation quality levels:
  Rough Order of Magnitude (ROM):    ±50% accuracy
  Preliminary Estimate:              ±25% accuracy
  Definitive Estimate:               ±10% accuracy

Recommended contingency by estimate type:
  ROM estimate → 50% contingency buffer
  Preliminary estimate → 25% buffer
  Definitive estimate → 10% buffer
```

**Common schedule blockers:**
- Key dependencies on other teams or vendors with different priorities
- Underestimated integration complexity
- Regulatory approval timelines not factored in
- Team member availability constrained by competing projects

**Scoring 1–5:**

| Score | Criteria |
|-------|----------|
| 1 | Deadline is arbitrary; scope clearly cannot be delivered in time; no estimation performed |
| 2 | Timeline based on optimistic assumptions; no contingency; dependencies unresolved |
| 3 | Rough estimate performed; timeline plausible but tight; some contingency; key dependencies identified |
| 4 | Detailed work breakdown with estimates; critical path mapped; contingency included; dependencies confirmed |
| 5 | Bottom-up estimates with historical calibration; critical path optimized; dependencies confirmed with owners; sufficient buffer |

---

## TELOS Composite Score and Threshold Rules

### Scoring Formula

```
TELOS_composite = (T_score + E_score + L_score + O_score + S_score) / 5

Weighted variant (if priorities differ):
TELOS_weighted = w_T × T + w_E × E + w_L × L + w_O × O + w_S × S
                 where Σw = 1
```

### Minimum Threshold Rules (hard gates)

These are **non-negotiable gates**. A project that fails any of these should not proceed:

| Rule | Condition | Rationale |
|------|-----------|-----------|
| **Legal floor** | L_score ≥ 2 | Legal violations cannot be offset by other strengths |
| **Technical floor** | T_score ≥ 2 | Fundamental technical impossibility cannot be overcome by other factors |
| **No single score = 1** | All dimensions ≥ 2 | A score of 1 indicates a structural blocker requiring resolution first |

### Composite Rating Labels

| Composite Score | Label | Recommendation |
|----------------|-------|----------------|
| 4.5 – 5.0 | **Highly Feasible** | Proceed with confidence |
| 3.5 – 4.4 | **Feasible** | Proceed with documented risk mitigation |
| 2.5 – 3.4 | **Conditionally Feasible** | Address identified gaps before committing resources |
| 1.5 – 2.4 | **Marginal** | Significant restructuring required; do not proceed as-is |
| 1.0 – 1.4 | **Not Feasible** | Do not proceed; fundamental blockers present |

---

## FAF — Feasibility Assessment Framework (extended)

The FAF extends TELOS with two additional dimensions relevant to modern software projects:

### +F — Financial Risk Adjusted

Beyond simple ROI, FAF adds:
- **Downside scenario:** What if the project delivers half the expected benefit?
- **Upside scenario:** What if adoption exceeds forecast?
- **Break-even analysis:** Minimum adoption/usage to recover investment
- **Sunk cost awareness:** Are decisions being made rationally or to justify past spend?

### +A — Alignment Feasibility

Does the project align with:
- **Strategic objectives:** Is this project on the organizational roadmap?
- **Priority stack rank:** Given current project portfolio, is this the highest-value use of resources?
- **Vision coherence:** Does this project reinforce or contradict the product vision?

### +F2 — Future Feasibility

A temporal dimension often missing from TELOS:
- Will the technology still be viable in 2–3 years?
- Will the user need still exist at the end of the delivery timeline?
- Is the regulatory environment moving toward or away from compliance?

---

## Application Notes for Our System

### Who completes TELOS assessments
- **Technical (T):** Tech Lead or Senior Engineer
- **Economic (E):** PM or Product Owner with finance input
- **Legal (L):** Legal/compliance team (or flagged for review)
- **Operational (O):** PM + stakeholder representative
- **Schedule (S):** Tech Lead + PM collaboratively

### Key integration point: TELOS → WFU estimation

Economic feasibility (E) directly informs WFU planning:
- ROI threshold sets the maximum acceptable WFU investment
- Schedule feasibility (S) constrains the WFU allocation per sprint

```
Max acceptable WFU budget = Expected_benefit / (hourly_rate × WFU_hours_per_day)
```

---

## Citations

1. Whitten, J. L., Bentley, L. D., & Dittman, K. C. (2004). *Systems Analysis and Design* (7th ed.). McGraw-Hill/Irwin.
2. Project Management Institute. (2021). *A Guide to the Project Management Body of Knowledge (PMBOK Guide)* (7th ed.).
3. AXELOS. (2017). *PRINCE2 Agile*. TSO (The Stationery Office).
4. IEEE Computer Society. (2014). *Guide to the Software Engineering Body of Knowledge (SWEBOK v3)*. IEEE.
