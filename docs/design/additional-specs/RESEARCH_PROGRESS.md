# Research Progress Tracker

**Goal:** Build a reusable knowledge base in two pillars:
1. **Project Analysis** — quantitative framework to evaluate "should we build this, how, what are the risks"
2. **Resource Analysis** — profile individual developers from behavioral data (GitHub + Slack)

**Output root:** `docs/design/knowledge-base/`
**Approach:** Write source files directly from main thread using fetched content + training knowledge. No subagents (they lack WebFetch/Write permissions).

---

## Legend

- `✅ Done` — file written and complete
- `🔄 In progress` — content collected, pending write
- `📋 Pending` — not started, approach documented below
- `🔒 Blocked` — waiting on another file

---

## Phase 1 — Source Files

### A. Resource Analysis (`resource-analysis/00_sources/`)

| File | Status | Content source | Notes |
|------|--------|---------------|-------|
| `mla_ocean_acl2020.md` | ✅ Done | PDF extracted (pypdf) + ACL Anthology fetch | Full architecture, equations, dataset, application guide |
| `deeper_personality.md` | 🔄 In progress | PDF extracted (24 pages, pypdf) + arXiv HTML fetch | Dynamic persona modeling with RL; NOT classic OCEAN — see note below |
| `bigfive_se_research.md` | 📋 Pending | 3 arXiv fetches done | See collected content below |
| `soft_skills_se.md` | 📋 Pending | 2 arXiv fetches done | See collected content below |
| `competency_dreyfus.md` | 📋 Pending | blik360 fetched + training knowledge | 5-level Dreyfus + 10-dimension competency matrix |
| `performance_metrics_devops.md` | 📋 Pending | Training knowledge (DORA, SPACE frameworks) | MDPI fetch returned 403 |
| `developer_experience_code_quality.md` | 📋 Pending | Training knowledge | sol.sbc.org.br fetch was rejected by user — use training knowledge |
| `github_data_methodology.md` | 📋 Pending | Training knowledge + GitHub CLI docs | gh CLI commands inventory for data collection pipeline |

### B. Project Analysis (`project-analysis/00_sources/`)

All 6 files are from well-documented classical frameworks. Use training knowledge + cite original sources accurately.

| File | Status | Content source | Notes |
|------|--------|---------------|-------|
| `toc_logic_model.md` | ✅ Done | Training knowledge | Theory of Change + Logic Model; What/Who/Why/When/How Much; 3 scoring axes |
| `telos_faf.md` | ✅ Done | Training knowledge | TELOS 5 dimensions each with 1–5 rubric; composite score + hard gate rules; FAF extension |
| `atam_cbam.md` | ✅ Done | Training knowledge | ATAM quality attribute scenarios, utility tree, 4 output types; CBAM ROI calculation; 5 scoring axes |
| `mcda_mcdm_ahp_topsis.md` | ✅ Done | Training knowledge | AHP pairwise matrix + CR consistency check; TOPSIS 6-step algorithm; sensitivity analysis; 5-criteria set |
| `iso25010.md` | ✅ Done | Training knowledge | 8 product quality characteristics + 5 quality-in-use; scoring rubric; quality gap → ATAM risk mapping |
| `trl_readiness.md` | ✅ Done | Training knowledge | NASA TRL 1-9; ORL/LRL/IRL/DRL extended dimensions; composite readiness score; AI/ML TRL adaptation |

---

## Phase 2 — Synthesis Files

### A. Project Analysis synthesis

| File | Status | Blocked by | Notes |
|------|--------|-----------|-------|
| `project-analysis/01_project_analysis_methodology.md` | ✅ Done | All 6 project-analysis sources | 5-layer funnel framework; gate rules; who-does-what process; AI touchpoints |
| `project-analysis/02_project_radar_scoring_matrix.md` | ✅ Done | 01_methodology | 10 axes with full 1–5 rubrics; weights; composite formula; hard gate override rules; sensitivity analysis |

### B. Resource Analysis synthesis

| File | Status | Blocked by | Notes |
|------|--------|-----------|-------|
| `resource-analysis/01_resource_profile_methodology.md` | ✅ Done | All 8 resource-analysis sources | 5-layer model; OCEAN inference; DEEPER update mechanism; WFU multiplier formula; ethical constraints |
| `resource-analysis/02_resource_radar_scoring_matrix.md` | ✅ Done | 01_methodology | 5 radars × full 1–5 rubrics; confidence-weighted composites; scoring calendar; developer profile card format |
| `resource-analysis/03_data_collection_pipeline.md` | ✅ Done | github_data_methodology | 6-stage pipeline; gh CLI commands; LLM signal extraction; storage schema; audit trail; ethical checklist |

---

## Phase 3 — System Design

| File | Status | Blocked by | Notes |
|------|--------|-----------|-------|
| `docs/design/knowledge-base/system_design_overview.md` | ✅ Done | All Phase 2 | User journeys A+B; data flow diagram; access control; AI integration; Claude model config; 5 key design decisions; limitations |

---

## Collected Content (for pending files)

### deeper_personality.md

**Paper:** DEEPER: Directed Persona Refinement for Dynamic Persona Modeling
**Authors:** Aili Chen, Chengyu Du, Jiangjie Chen, Jinghan Xu, Yikai Zhang, Siyu Yuan, Zulong Chen, Liangyue Li, Yanghua Xiao
**Affiliations:** Fudan University, ByteDance Seed, Alibaba Group
**arXiv:** 2502.11078v2 (submitted Feb 2025, revised Jul 2025)
**GitHub:** https://github.com/sheep333c/DEEPER.git

**IMPORTANT NOTE:** DEEPER is NOT a classic OCEAN/Big Five personality model. It is a **dynamic persona modeling** system using LLMs + iterative RL to model user *behavioral preferences* (e.g., movie ratings, purchase behavior). The "persona" here = a natural-language description of user preferences, updated over time as new behavior data arrives.

**Relevance to our system:** DEEPER's methodology for **continually updating a user profile from streaming behavioral data** is highly applicable to updating a developer's profile as new GitHub/Slack data accumulates. The RL-based "direction search" for persona refinement can be adapted to developer profile updates.

**Core mechanism:**
- Persona = LLM-generated natural-language description of user preferences/behaviors
- Dynamic update problem: how to update persona when new behavior data arrives without degrading quality
- Three paradigms compared: Regeneration (replace), Extension (add), Refinement (DEEPER = optimize)
- DEEPER introduces "update direction" concept: find the direction in persona space that reduces prediction error
- Three goals: Previous Preservation + Current Reflection + Future Advancement
- Reward function: r = r_prev + r_curr + r_future (all = reduction in prediction error)
- Training: iterative offline RL with DPO fine-tuning (2 iterations)
- Evaluation: 4800 users, 10 domains, MAE metric
- Result: 32.2% avg reduction in user behavior prediction error; outperforms best baseline by 22.92%

**Key formula:**
- Persona update: St = f_refine(St-1, Ot, Ôt|St-1) — uses both actual behaviors AND prediction discrepancy
- Quality metric: εt+1|St = (1/n) Σ |ô_j_t+1|St - o_j_t+1| (MAE)
- Optimization objective: εt+1|St < εt|St-1 (each update should improve prediction)

### bigfive_se_research.md

**Papers collected:**
1. Calefato et al. (2019) "A large-scale, in-depth analysis of developers' personalities in the Apache ecosystem" (arXiv 1905.13062)
   - 3 distinct personality profiles among Apache developers
   - Personality is stable over time regardless of role/contribution level
   - More open + more agreeable developers more likely to become contributors
   - Measured from code commits + email messages
2. Calefato et al. (2018) "On Developers' Personality in Large-scale Distributed Projects: The Case of the Apache Ecosystem" (ICGSE'18, arXiv 1803.01126)
   - Personality shifts over time: increased conscientiousness, agreeableness; higher neuroticism in later career
   - Traits don't vary with role, membership, or contribution level
   - More open + more agreeable → more likely to become project contributors
3. Graf-Vlachy & Wagner (2023) "The Type to Take Out a Loan? Developer Personality and Technical Debt" (arXiv 2303.02244)
   - Conscientiousness → negative correlation with TD (reduces debt)
   - Emotional Stability → negative correlation with TD
   - Openness → negative correlation with TD
   - Extraversion, Agreeableness → no significant effect
   - Prevention focus also negatively correlated with TD

### soft_skills_se.md

**Papers collected:**
1. Capretz & Ahmed (2019) "A Call to Promote Soft Skills in Software Engineering" (arXiv 1901.01819)
   - Soft skills: Teamwork, Communication, Collaboration, Leadership, Problem-solving, Motivation, Commitment, Multi-culturalism, Emotional intelligence, Interpersonal skills, Critical thinking
   - "Both hard and soft skills are required to be successful"
   - Editorial manifesto, no measurement framework
2. Groeneveld et al. (2019) "Software Engineering Education Beyond the Technical" (arXiv 1910.09865)
   - Top skills from SLR: Self-reflection, Conflict resolution, Communication, Teamwork
   - Internships + capstone projects as teaching methods
   - Interdisciplinary teaching improves outcomes

### competency_dreyfus.md

**Source fetched:** blik360.com/dreyfus-model
**5 Dreyfus levels:**
1. Novice — rigid rule adherence, needs step-by-step
2. Advanced Beginner — recognizes patterns, situational judgment
3. Competent — develops mental models, prioritizes features
4. Proficient — holistic pattern recognition, intuition-guided
5. Expert — perception and response become intuitive

**10-dimension competency matrix from blik360:**
Technical Proficiency, Personality & Collaboration, Technical Breadth, Intrinsic Motivation, Engineering Maturity, Pragmatism, Team Cooperation, Communication, Growth Potential, Strategic Vision

---

## Decisions Made

1. **No more subagent spawning** — subagents are denied WebFetch/Write in background mode; all writing done from main thread
2. **No fetching academic PDFs behind paywalls** — use training knowledge + cite accurately (ATAM, TELOS, MCDA are all well-documented in training data)
3. **No fetching sol.sbc.org.br** — user rejected; use training knowledge for developer experience vs code quality
4. **DEEPER clarification** — DEEPER is dynamic persona modeling via RL, NOT a Big Five model; its value is the *update mechanism* not the *trait taxonomy*
5. **Writing order:** Complete all source files first (Phase 1) → then synthesis → then system design

---

## Writing Order (Phase 1 — Remaining)

Priority order based on dependencies:

1. `deeper_personality.md` ← content already in hand (PDF + arXiv)
2. `bigfive_se_research.md` ← 3 papers fetched
3. `soft_skills_se.md` ← 2 papers fetched
4. `competency_dreyfus.md` ← blik360 fetched
5. `performance_metrics_devops.md` ← training knowledge
6. `developer_experience_code_quality.md` ← training knowledge
7. `github_data_methodology.md` ← training knowledge
8. `toc_logic_model.md` ← training knowledge
9. `telos_faf.md` ← training knowledge
10. `atam_cbam.md` ← training knowledge
11. `mcda_mcdm_ahp_topsis.md` ← training knowledge
12. `iso25010.md` ← training knowledge
13. `trl_readiness.md` ← training knowledge

Then Phase 2 synthesis → Phase 3 system design.
