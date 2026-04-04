---
source: "Technology Readiness Levels (TRL) + Extended Readiness Dimensions"
references:
  - title: "Technology Readiness Levels Demystified"
    authors: ["Mankins, John C."]
    venue: "NASA / Acta Astronautica"
    year: 2009
  - title: "Technology Readiness Level: A White Paper"
    authors: ["Héder, Mihály"]
    venue: "Hungarian Journal of Industry and Chemistry"
    doi: "10.1515/hjic-2017-0013"
    year: 2017
  - title: "EU Horizon 2020 TRL Definitions"
    venue: "European Commission"
    year: 2014
  - title: "Organizational Readiness for Change: A Review of Measurement Tools"
    authors: ["Weiner, B.J.", "Amick, H.", "Lee, S.Y."]
    venue: "Implementation Science"
    doi: "10.1186/1748-5908-3-67"
    year: 2008
  - title: "DoD Technology Readiness Assessment Guidance"
    venue: "U.S. Department of Defense"
    year: 2011
type: composite_source
relevance: project_analysis
---

# Technology Readiness Levels (TRL) and Extended Readiness Dimensions

## Overview

Technology Readiness Level (TRL) is a systematic metric framework developed by NASA (John Mankins, 1995) for **assessing the maturity of a technology** from basic research to full operational deployment.

Originally a 1–9 scale for aerospace technologies, TRL has been adopted across industries — EU Horizon 2020 uses it for research funding decisions; the DoD uses it for defense procurement; the tech industry uses adapted versions for software and AI systems.

In project evaluation, TRL answers:
> *"Is the technology underlying this project mature enough to deliver at the required capability, scale, and reliability?"*

Extended readiness dimensions (Organizational Readiness, Legal/Regulatory Readiness, Integration Readiness) extend TRL to cover non-technical barriers to deployment.

---

## Part 1: NASA/DoD TRL Scale (1–9)

### TRL Definitions

| TRL | Name | Definition | Software equivalent |
|-----|------|------------|---------------------|
| **1** | Basic principles observed | Lowest readiness; scientific fundamentals only | Research concept; no implementation |
| **2** | Technology concept formulated | Practical application identified but unproven | Paper design; algorithm defined but not coded |
| **3** | Experimental proof of concept | Active R&D; first demonstrations | Prototype function works in isolation (lab conditions) |
| **4** | Technology validated in lab | Component integration in lab environment | Working prototype in controlled environment |
| **5** | Technology validated in relevant environment | Integration in operationally relevant environment | Alpha system integrated with real data |
| **6** | Technology demonstrated in relevant environment | System model/prototype demonstrated | Beta system with real users in near-production environment |
| **7** | System prototype demonstrated in operational environment | Prototype near final form | Feature-complete system in staging/pre-production |
| **8** | System complete and qualified | Technology proven to work; ready for deployment | Production-ready system; acceptance testing complete |
| **9** | Actual system proven in operational environment | Fielded and operational | System in production; proven at scale |

### TRL Thresholds for Investment Decisions

| TRL at project start | Risk level | Investment guidance |
|---------------------|------------|---------------------|
| TRL 1–3 | Very high | R&D investment only; no production commitment |
| TRL 4–5 | High | Proof-of-concept investment; go/no-go gate at TRL 6 |
| TRL 6–7 | Medium | Development investment; production target achievable |
| TRL 7–8 | Low | Production investment; low technology risk |
| TRL 8–9 | Very low | Operational investment; scaling risk only |

**For software projects, we typically expect:**
- Core language/framework: TRL 9 (proven in production globally)
- Key dependencies: TRL 7–9 (stable releases)
- Novel AI/ML components: TRL 4–6 (research or early adoption)
- Experimental features: TRL 3–5 (not suitable for production commitment)

---

## Part 2: EU Horizon 2020 TRL Definitions (Software-focused)

The European Commission adapted TRL for research and innovation funding, with software-specific language:

| TRL | EU Definition |
|-----|---------------|
| 1 | Basic research |
| 2 | Technology concept and/or application formulated |
| 3 | Analytical and experimental critical function and/or characteristic proof of concept |
| 4 | Technology validated in lab (industrially relevant environment in the case of key enabling technologies) |
| 5 | Technology validated in relevant environment (industrially relevant environment in the case of key enabling technologies) |
| 6 | Technology demonstrated in relevant environment (industrially relevant environment in the case of key enabling technologies) |
| 7 | System prototype demonstration in operational environment |
| 8 | System complete and qualified |
| 9 | Actual system proven in operational environment (competitive manufacturing in the case of key enabling technologies; or in space) |

---

## Part 3: Extended Readiness Dimensions

TRL alone is insufficient for software project evaluation. We extend it with four additional readiness dimensions:

### ORL — Organizational Readiness Level

*Is the organization ready to absorb and operate this system?*

Based on Weiner et al. (2008) organizational readiness for change framework:

| ORL | Description |
|-----|-------------|
| **1** | No awareness of the change required; key stakeholders uninformed |
| **2** | Leadership aware but no concrete preparation underway |
| **3** | Stakeholders briefed; initial planning for change management begun |
| **4** | Change management plan defined; ownership assigned; training planned |
| **5** | Full organizational preparation: processes updated, training delivered, pilot completed |
| **6** | Post-pilot optimization; lessons incorporated; organization fully transitioned |

**Assessment questions for ORL:**
- Do the end users understand why this system is being built?
- Has anyone been designated as the operational owner?
- Is there a training and onboarding plan?
- Do current processes accommodate the new system?
- Has a pilot or early adopter program been planned?

---

### LRL — Legal/Regulatory Readiness Level

*Are the legal and regulatory requirements addressed?*

| LRL | Description |
|-----|-------------|
| **1** | Applicable regulations not identified |
| **2** | Regulations identified but not assessed for impact |
| **3** | Legal review initiated; key requirements identified |
| **4** | Legal requirements mapped to technical controls; gaps identified |
| **5** | All legal requirements addressed in design; DPA signed if required |
| **6** | Legal sign-off obtained; compliance evidence available for audit |

**Key regulation areas to assess:**
- **Data privacy:** GDPR (EU), CCPA (California), PDPA (Thailand), LGPD (Brazil)
- **Industry-specific:** HIPAA, PCI-DSS, SOX, FDA 21 CFR Part 11
- **AI/ML:** EU AI Act (2024), algorithmic accountability requirements
- **Labor law:** Employee monitoring consent requirements
- **IP/licensing:** Open source license compatibility, data licensing

---

### IRL — Integration Readiness Level

*Are the system integration dependencies ready?*

| IRL | Description |
|-----|-------------|
| **1** | Integration requirements not defined |
| **2** | External systems identified but not engaged |
| **3** | APIs/interfaces documented; integration feasibility assessed |
| **4** | Integration design complete; contracts/SLAs established with external systems |
| **5** | Integration tested in staging environment; error scenarios handled |
| **6** | Integration proven in production; monitoring in place |

**Integration risk assessment:**
- How many external system dependencies exist?
- Are those systems stable and maintained?
- Do SLAs for external systems meet our reliability requirements?
- What happens if a dependency goes down?

---

### DRL — Data Readiness Level

*Is the data required for this system available and suitable?*

Particularly relevant for AI/ML projects and analytics systems.

| DRL | Description |
|-----|-------------|
| **1** | Required data not identified |
| **2** | Data sources identified; availability and quality unknown |
| **3** | Data access confirmed; initial quality assessment done |
| **4** | Data quality meets minimum threshold; pipeline design started |
| **5** | Data pipeline built and validated; data governance established |
| **6** | Data in production pipeline; quality monitoring active |

**Data readiness questions:**
- Is the required data available in sufficient volume?
- Is data quality adequate (completeness, accuracy, freshness)?
- Are there consent and licensing issues with the data?
- Is there a data governance process?

---

## Part 4: Composite Readiness Score

### Multi-Readiness Assessment

For each project, assess all five dimensions:

| Dimension | Score (1–6 or 1–9) | Normalized (1–5) |
|-----------|--------------------|-----------------|
| TRL | /9 | /5 |
| ORL | /6 | /5 |
| LRL | /6 | /5 |
| IRL | /6 | /5 |
| DRL | /6 | /5 |

### Composite Formula

```
Readiness_composite = w_TRL × TRL_normalized
                    + w_ORL × ORL_normalized
                    + w_LRL × LRL_normalized
                    + w_IRL × IRL_normalized
                    + w_DRL × DRL_normalized

Default weights:
  w_TRL = 0.35  (technology maturity is primary readiness dimension)
  w_ORL = 0.20  (organizational readiness frequently underweighted)
  w_LRL = 0.20  (legal readiness is a hard gate, not a spectrum)
  w_IRL = 0.15  (integration risk)
  w_DRL = 0.10  (data readiness, weighted lower for non-data projects)
```

### Hard Gate Rules

| Rule | Condition |
|------|-----------|
| **TRL floor** | TRL_normalized < 2 (TRL < 4) → project is at research stage; not suitable for production commitment |
| **LRL floor** | LRL < 3 → legal review not initiated; must not proceed without it |
| **ORL floor** | ORL < 2 → organizational awareness not established; high adoption failure risk |

---

## Part 5: TRL Assessment for AI/ML Components

AI/ML systems require specialized TRL interpretation because the "operational environment" for AI is harder to define:

| TRL | AI/ML specific definition |
|-----|--------------------------|
| 1 | Research concept; no model exists |
| 2 | Algorithm designed on paper; performance theoretically estimated |
| 3 | Proof of concept model trained on curated dataset |
| 4 | Model validated on held-out test set; benchmark results reported |
| 5 | Model tested on data representative of production distribution |
| 6 | Model deployed in limited production with human oversight |
| 7 | Model in production at reduced scale; feedback loops established |
| 8 | Model in full production; performance monitoring active |
| 9 | Model proven at scale; adversarial robustness validated; bias audit passed |

**AI-specific risks at lower TRL levels:**
- Distribution shift: training data ≠ production data
- Concept drift: model accuracy degrades over time
- Adversarial vulnerability: model outputs manipulable by crafted inputs
- Bias and fairness: model systematically disadvantages protected groups

---

## Part 6: Scoring Rubric (1–5) for Project Assessment Layer

### Axis: Technology Maturity (TRL-derived)

| Score | Criteria |
|-------|----------|
| 1 | Core technology at TRL 1–3; proof-of-concept only; production not achievable |
| 2 | Core technology at TRL 4–5; lab validated; significant unknowns remain |
| 3 | Core technology at TRL 6–7; demonstrated in relevant environment; some risk |
| 4 | Core technology at TRL 7–8; near-production or production-proven with minor gaps |
| 5 | Core technology at TRL 9; proven at required scale in production globally |

### Axis: Organizational Readiness (ORL-derived)

| Score | Criteria |
|-------|----------|
| 1 | No organizational preparation; stakeholders unaware |
| 2 | Awareness only; no concrete preparation |
| 3 | Plan in place; ownership assigned; basic preparation underway |
| 4 | Change management executed; pilot group ready; training complete |
| 5 | Full organizational readiness validated by pilot; processes updated |

### Axis: Regulatory/Legal Readiness (LRL-derived)

| Score | Criteria |
|-------|----------|
| 1 | Applicable regulations not identified |
| 2 | Regulations identified; no review conducted |
| 3 | Legal review in progress; key requirements identified |
| 4 | All requirements mapped; design accommodates them; legal review complete |
| 5 | Legal sign-off obtained; compliance evidence documented; audit-ready |

---

## Citations

1. Mankins, J. C. (1995). *Technology Readiness Levels: A White Paper*. NASA Office of Space Access and Technology.
2. Mankins, J. C. (2009). Technology readiness and risk assessments: A new approach. *Acta Astronautica*, 65(9–10), 1208–1215.
3. Héder, M. (2017). From NASA to EU: The evolution of the TRL scale in Public Sector Innovation. *Hungarian Journal of Industry and Chemistry*, 45(1), 3–8. DOI: 10.1515/hjic-2017-0013
4. European Commission. (2014). *Technology Readiness Levels (TRL): HORIZON 2020 — Work Programme 2014–2015*. European Commission Decision C(2014)4995.
5. Weiner, B. J., Amick, H., & Lee, S.-Y. D. (2008). Conceptualization and measurement of organizational readiness for change. *Implementation Science*, 3, 67. DOI: 10.1186/1748-5908-3-67
