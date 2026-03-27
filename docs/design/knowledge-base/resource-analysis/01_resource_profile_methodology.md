---
title: "Resource Profile Methodology — 5-Layer Developer Assessment Framework"
type: synthesis
sources:
  - "00_sources/mla_ocean_acl2020.md"
  - "00_sources/deeper_personality.md"
  - "00_sources/bigfive_se_research.md"
  - "00_sources/soft_skills_se.md"
  - "00_sources/competency_dreyfus.md"
  - "00_sources/performance_metrics_devops.md"
  - "00_sources/developer_experience_code_quality.md"
  - "00_sources/github_data_methodology.md"
target_users: ["BOD only"]
visibility: "BOD-only — never visible to individual developers or their managers"
output: "5-layer developer profile with radar charts per layer"
ai_role: "Infers signals from data; human validates; no automated decisions"
---

# Resource Profile Methodology: 5-Layer Developer Assessment

## Purpose and Scope

This document defines the unified methodology for building behavioral developer profiles from GitHub and Slack data. These profiles support **resource planning, team composition, and growth investment decisions** — they are **not** used for performance reviews, compensation, or disciplinary actions.

**Visibility:** BOD only. Raw scores and inferred traits are never shared with the individual developers being profiled, their managers, or external parties.

**AI role:** Signals are inferred by the AI from behavioral data. All inferences carry uncertainty. Human validation is required before any profile is acted upon.

---

## The 5-Layer Model

The developer profile is organized as five distinct analytical layers, each answering a different question:

```
Layer 1: Trait Profile         "What are their natural tendencies?"
         (Big Five / OCEAN via MLA-OCEAN)

Layer 2: Behavioral Preferences  "How do they actually work?"
         (Dynamic persona via DEEPER mechanism)

Layer 3: Capability Profile    "What can they do technically?"
         (Dreyfus + SFIA + T-shaped skills)

Layer 4: Soft Skills Profile   "How do they work with others?"
         (Communication, Collaboration, Initiative, Mentorship)

Layer 5: Performance and Growth "What are their outcomes and trajectory?"
         (DORA-derived, SPACE framework, growth trajectory)
```

Layers are designed to be **independent but complementary**. A developer might be high on Layer 1 (high Conscientiousness) but low on Layer 4 (poor communication) — each layer provides distinct actionable information.

---

## Layer 1: Personality Trait Profile (OCEAN)

**Source framework:** MLA-OCEAN (ACL 2020), Big Five SE research
**Data sources:** PR descriptions, issue descriptions, review comments, commit messages, Slack messages
**Update frequency:** Monthly (or triggered by significant new data volume)

### The Five Traits

| Trait | Abbreviation | Relevance to software work |
|-------|-------------|---------------------------|
| **Openness to Experience** | O | Creativity, adoption of new tech, architectural innovation |
| **Conscientiousness** | C | Code quality discipline, documentation, testing habits, technical debt |
| **Extraversion** | E | Communication frequency, visibility, social energy in collaboration |
| **Agreeableness** | A | Feedback receptiveness, team harmony, conflict navigation |
| **Emotional Stability** (reverse of Neuroticism) | ES | Stress resilience, consistent performance under pressure |

### Evidence Base for Trait-Outcome Relationships

From Big Five SE research (bigfive_se_research.md):

| Trait | Outcome correlation | Evidence strength |
|-------|---------------------|------------------|
| C (Conscientiousness) | Negative correlation with technical debt | Strong (arXiv 2303.02244) |
| ES (Emotional Stability) | Negative correlation with technical debt | Strong (arXiv 2303.02244) |
| O (Openness) | Negative correlation with technical debt | Moderate |
| O + A (Open + Agreeable) | Positive correlation with contributor trajectory | Moderate (Apache ecosystems) |
| Personality overall | Stable over time; not correlated with role level | Strong (Apache studies) |

### MLA-OCEAN Inference Architecture

Infer OCEAN scores from text corpora using the hierarchical attention mechanism:

```
Input: corpus of developer messages (PR bodies, review comments, issue descriptions, Slack)

Step 1: Word-level attention
  h_j^i = GRU(word_embeddings)
  α_j^i = exp(score(h_j^i)) / Σ exp(score(h_k^i))
  s_i = Σ α_k^i · h_k^i   [message representation]

Step 2: Message-level attention
  β_i = exp(score(s_i)) / Σ exp(score(s_k))
  u = Σ β_k · h_k          [user/developer representation]

Step 3: OCEAN regression
  OCEAN_scores = W · u + b
```

**Practical implementation:** Use an LLM (Claude) with structured prompting against the message corpus, guided by OCEAN linguistic markers from the Big Five SE research. Full GRU training is infeasible without the original MLA-OCEAN model weights; LLM-based inference is the practical alternative.

### Linguistic Markers by Trait (GitHub/Slack specific)

| Trait | High-score markers | Low-score markers |
|-------|-------------------|-------------------|
| **O (Openness)** | Novel solutions proposed, references new tech, architecture discussions, "what if we tried..." | Strict pattern adherence, preference for known approaches |
| **C (Conscientiousness)** | Rich PR descriptions, test coverage, documentation updates, "I verified...", thorough checklists | Minimal PR bodies, missing tests, "WIP" PRs without follow-up |
| **E (Extraversion)** | Frequent comments, @-mentions, participation in discussions, proactive announcements | Fewer but longer messages, works quietly, low @-mention frequency |
| **A (Agreeableness)** | "Good point", "thanks for the suggestion", collaborative language, fast feedback uptake | Defensive review responses, "I disagree" without alternative, escalation patterns |
| **ES (Emotional Stability)** | Consistent tone under pressure, calm in incidents, constructive after rejections | Terse/curt messages during crunch, tone changes correlating with project stress |

### Layer 1 Output

```json
{
  "developer": "github_username",
  "assessed_at": "2026-03-01",
  "ocean_scores": {
    "openness":             {"score": 3.8, "confidence": 0.72},
    "conscientiousness":    {"score": 4.2, "confidence": 0.81},
    "extraversion":         {"score": 2.9, "confidence": 0.65},
    "agreeableness":        {"score": 3.5, "confidence": 0.70},
    "emotional_stability":  {"score": 4.0, "confidence": 0.75}
  },
  "corpus_size": 847,  // number of messages analyzed
  "last_update": "2026-03-01",
  "notes": "Low extraversion consistent across 6-month window"
}
```

---

## Layer 2: Behavioral Preference Model (Dynamic Persona)

**Source framework:** DEEPER (arXiv 2502.11078v2)
**Data sources:** Historical behavioral patterns extracted from GitHub activity
**Update frequency:** Quarterly (or triggered by significant role/project change)

### What This Layer Captures

Layer 2 models **how the developer actually behaves** — their revealed preferences rather than self-reported preferences. Unlike Layer 1 (stable personality traits), Layer 2 is designed to evolve as the developer's role, skills, and context change.

DEEPER's key insight: a developer's behavior in month 12 is not well-predicted by their behavior in month 1. The persona model must be **continually refined** using discrepancy signals (where predictions diverged from actual behavior).

### Behavioral Preference Dimensions

| Dimension | Observable behavior | Update signal |
|-----------|--------------------|--------------|
| **Work rhythm preference** | Consistent daily work vs. burst-intensive | Commit timestamp distribution |
| **Collaboration style** | Solo-focused vs. highly collaborative | Review-to-commit ratio over time |
| **Problem preference** | Prefers new features vs. bug fixing vs. refactoring | PR type distribution |
| **Domain preference** | Concentration vs. breadth of contributions | File path clustering |
| **Review style** | Thorough + educational vs. quick approval | Review comment density and content |
| **Communication preference** | Detailed written communication vs. terse/verbal | PR body length trend |

### DEEPER-Inspired Update Mechanism

When new behavioral data arrives (e.g., last 90 days of GitHub activity):

```
1. Generate prediction: what behavior does the current persona predict?
2. Observe actual behavior from new data
3. Compute discrepancy: δ = actual - predicted (for each dimension)
4. Direction search: find update direction that:
   a. Preserves well-predicted dimensions (Previous Preservation)
   b. Corrects the discrepancies (Current Reflection)
   c. Improves future prediction (Future Advancement)
5. Update persona description with LLM refinement guided by δ
6. Validate: new persona should yield lower prediction error
```

### Layer 2 Output Format

The behavioral preference model outputs a **natural language persona description** + a structured preference vector:

```
Behavioral persona (example):
"Developer prefers to work in focused, solo sprints on backend logic tasks.
High throughput during business hours; rarely commits in evenings/weekends.
Chooses bug fixing and refactoring over new features (~60% of PRs).
Review style is thorough and educational — typically provides 3–5 inline comments
with code examples. Communication is terse in Slack; detailed in PR descriptions."

Structured preferences:
  work_rhythm: {type: "consistent", peak_hours: "10:00-17:00", weekend_rate: 0.05}
  collaboration_intensity: 0.62  // 0=solo, 1=highly collaborative
  domain_concentration: 0.78     // 0=generalist, 1=deep specialist
  review_thoroughness: 0.85
  pr_type_distribution: {features: 0.3, bugs: 0.45, refactor: 0.25}
```

---

## Layer 3: Technical Capability Profile

**Source frameworks:** Dreyfus model, SFIA 8, T-Shaped skills
**Data sources:** GitHub PR diffs, review patterns, issue complexity, cross-domain contributions
**Update frequency:** Quarterly

### 8 Technical Axes (Dreyfus-Mapped)

| # | Axis | Dreyfus 1 (score 1) | Dreyfus 5 (score 5) |
|---|------|---------------------|---------------------|
| 1 | **Coding / Implementation** | Syntax-correct, happy path only | Elegant, reusable, performant |
| 2 | **System Design** | Cannot design beyond feature scope | Designs scalable, evolvable systems |
| 3 | **Debugging / Problem-solving** | Needs help beyond simple bugs | Diagnoses complex multi-system failures |
| 4 | **Testing and QA** | No tests or happy-path only | TDD, edge case coverage, testability design |
| 5 | **Architecture Thinking** | Follows existing patterns | Proposes and evaluates architectural tradeoffs |
| 6 | **DevOps / Delivery** | Cannot deploy independently | Owns full delivery pipeline, monitors production |
| 7 | **Security and Reliability** | Unaware of security concerns | Proactively designs for security and failure modes |
| 8 | **Domain / Business Knowledge** | No domain understanding | Deep business domain expertise |

### GitHub Signal → Capability Inference Map

| Axis | Primary GitHub signal | Inference approach |
|------|----------------------|--------------------|
| Coding | PR complexity, diff patterns, code review feedback | PR structure quality; frequency of "requested changes" |
| System Design | PRs touching multiple services; design-level comments | Design-scope PRs vs. feature PRs ratio |
| Debugging | Complexity of issues resolved; bug fix PR descriptions | Issue severity + resolution patterns |
| Testing | Test file ratio in PRs; test coverage trend | `test_files / total_files` per PR |
| Architecture | Review comments on design choices; ADR authorship | "why" comments vs. "what" comments in reviews |
| DevOps | CI/CD config PRs; infra code contributions | Presence of `.github/workflows`, `Dockerfile`, IaC changes |
| Security | Security PRs; SAST discussions; threat-model mentions | Keywords: auth, injection, sanitize, token, CVE |
| Domain | Contribution concentration to specific subdomain | File path clustering over time |

### T-Shaped Profile Assessment

Beyond Dreyfus levels, assess the **shape** of the capability profile:

```
T-shape assessment:
  vertical_bar:   identify the 1–2 axes with score ≥ 4 (depth)
  horizontal_bar: identify axes with score 2–3 (breadth)
  gaps:           identify axes with score 1 (blind spots)

Profile classification:
  Strong T-shape:  1–2 deep axes + moderate across others
  I-shape:         One deep axis, others very low (narrow specialist)
  π-shape:         Two deep axes (senior specialist/architect profile)
  Flat:            Consistent 2–3 across all (junior generalist)
```

### Experience Calibration (from developer_experience_code_quality.md)

Capability scores are **calibrated by experience profile**, not compared absolutely:

```
Experience profile = {
  project_tenure:      months on this specific codebase,
  domain_depth:        concentration of contributions to a specific subsystem,
  technology_portfolio: number of distinct technologies with meaningful contribution,
  learning_velocity:   rate of expanding into new areas over past 12 months
}

Calibrated score = raw_score × calibration_factor
  calibration_factor: 0.7 (new to project) → 1.2 (highly familiar)

A score of 3 for a developer with 3 months project tenure
is equivalent to a score of 4 for a developer with 12+ months.
```

---

## Layer 4: Soft Skills Profile

**Source framework:** Soft Skills SE research (soft_skills_se.md)
**Data sources:** PR descriptions, review comments, response patterns, issue writing, @-mention patterns
**Update frequency:** Quarterly

### 8 Soft Skill Axes

| # | Axis | Inference feasibility | Primary signal source |
|---|------|----------------------|--------------------|
| 1 | **Communication Clarity** | High | PR body quality, issue descriptions, review comment clarity |
| 2 | **Collaboration** | High | Review-to-commit ratio, cross-team PR activity, response time |
| 3 | **Feedback Receptiveness** | Medium | Revision rate after reviews; tone in review threads |
| 4 | **Initiative** | High | Self-assigned issues, unprompted improvements, proactive bug reports |
| 5 | **Mentorship** | Medium | Review comment depth; "why" explanations; co-authorship patterns |
| 6 | **Adaptability** | Medium | Technology breadth over time; ability to contribute across domains |
| 7 | **Problem Framing** | Medium | Issue description quality; ability to define problems before solutions |
| 8 | **Conflict Navigation** | Low | Sentiment in disagreement threads (high noise, needs human validation) |

### Inference Approach by Axis

**Communication Clarity (High feasibility)**
```
Signals:
  - PR description length AND quality (not just length)
  - Presence of: problem statement, solution rationale, reviewer context
  - Review comment specificity: actionable vs. vague
  - Issue reproducibility quality

Scoring:
  1: Consistently terse PRs (<50 chars body), vague comments, no documentation
  3: Adequate descriptions with some missing context; review comments specific
  5: Rich PR bodies with context + motivation; documentation proactive; comments actionable
```

**Collaboration (High feasibility)**
```
Signals:
  - review_given / review_received ratio (target > 0.7)
  - Cross-team PR activity (reviews outside own team's repos)
  - Response latency to review requests (< 4 hours = responsive)
  - @-mention response rate

Scoring:
  1: Only commits own code; never reviews; no responses to others
  3: Reviews own team's PRs when asked; responds within 24 hours
  5: Proactively reviews widely; responds quickly; cross-functional participation
```

**Initiative (High feasibility)**
```
Signals:
  - Self-assigned issue rate (issues picked up without assignment)
  - Issue creation rate (identifies and reports problems proactively)
  - PRs opened for improvements without being asked
  - Response to unowned bugs

Scoring:
  1: Only completes directly assigned tasks
  3: Occasionally picks up additional work; creates issues when directly affected
  5: Consistently identifies and addresses problems before being asked
```

### Confidence-Weighted Soft Skill Scores

Axes 6–8 have lower inference feasibility. Flag with uncertainty bands:

```json
{
  "soft_skills": {
    "communication_clarity":   {"score": 4.1, "confidence": 0.82},
    "collaboration":           {"score": 3.7, "confidence": 0.78},
    "feedback_receptiveness":  {"score": 3.2, "confidence": 0.61},
    "initiative":              {"score": 4.5, "confidence": 0.80},
    "mentorship":              {"score": 3.0, "confidence": 0.65},
    "adaptability":            {"score": 3.8, "confidence": 0.68},
    "problem_framing":         {"score": 3.5, "confidence": 0.63},
    "conflict_navigation":     {"score": null, "confidence": 0.30, "note": "Insufficient signal; requires human review"}
  }
}
```

---

## Layer 5: Performance and Growth Profile

**Source frameworks:** DORA (Forsgren et al. 2018), SPACE (Forsgren et al. 2021), OSS metrics
**Data sources:** GitHub PR outcomes, issue resolution, commit frequency, timestamps
**Update frequency:** Monthly

### 4 Performance Dimensions

**Dimension 1: Delivery Reliability**
```
Indicators:
  - PR merge rate (target > 85%)
  - On-time completion rate (actual merge vs. planned date)
  - Rework rate (PRs reopened after close, target < 10%)
  - Estimate accuracy (planned effort vs. actual)

Score 1: Consistently misses commitments; frequent abandoned PRs
Score 3: Meets commitments ~70% of time; occasional slippage
Score 5: Highly predictable; accurate estimates; rarely misses
```

**Dimension 2: Code Quality**
```
Indicators:
  - Bug escape rate (issues linked to person's merged PRs, target < 5%)
  - Review rejection rate (CHANGES_REQUESTED / total reviews, target < 20%)
  - Test coverage contribution (tests in > 70% of feature PRs)
  - Hotfix attribution (person's code in production incidents, target < 5%)

Score 1: Frequent bugs, no tests, high rejection rate
Score 3: Occasional bugs, reasonable coverage, ~30% rejection
Score 5: Rare bugs, comprehensive tests, first-pass approval common
```

**Dimension 3: Operational Stability**
```
Indicators:
  - Incident involvement rate (< 2/quarter attributable to person's changes)
  - MTTR contribution (active in incident resolution)
  - Rollback rate (person's deployments rolled back, target < 3%)
  - Observability contributions (monitoring/alerting PRs)

Score 1: Frequent incidents; never participates in resolution
Score 3: Occasional incidents; responds when assigned
Score 5: Rare incidents; proactively improves observability; leads resolution
```

**Dimension 4: Team and Organizational Impact**
```
Indicators:
  - Review contribution ratio (reviews given / reviews received, target > 0.7)
  - Review quality (avg comment depth + helpfulness)
  - Knowledge sharing (documentation PRs > 1/month)
  - Response time to questions (< 4 hour average)
  - Mentoring signal (review comments explaining "why", target > 30%)

Score 1: Only works on own tasks; no reviews; no documentation
Score 3: Reviews when asked; occasional documentation
Score 5: Proactive reviewer; consistent documentation; unblocks team regularly
```

### Growth Trajectory Assessment

The most important longitudinal signal: is the developer improving?

```
Growth signals (track over 3-month windows):

  Improving trajectory:
    ✓ Bug escape rate decreasing
    ✓ Review rejection rate decreasing
    ✓ PR cycle time decreasing (faster iterations)
    ✓ Test coverage in PRs increasing
    ✓ Review comment depth increasing

  Plateau or declining:
    ✗ Flat bug rate over 12 months
    ✗ High variance in quality (inconsistent)
    ✗ Shrinking domain breadth

Growth Trajectory Score (1–5):
  1: No improvement in 12 months; same mistakes repeated; no new skills
  2: Slow improvement; mostly comfortable patterns
  3: Steady improvement; applies review feedback; some new areas
  4: Clear upward trajectory; proactively expanding; consistently improves
  5: Rapid consistent growth; measurably improving team quality; high learning velocity
```

### Sustainable Performance Flag

Flag burnout risk signals from SPACE wellbeing research:

```
IF commit_activity.evening_weekend_rate > 0.4:
    → Flag: "High after-hours work rate — possible overload signal"

IF quality_trend == "declining" AND activity_trend == "increasing":
    → Flag: "Quality-speed tradeoff pattern — possible fatigue signal"

IF burst_pattern (high activity for 2 weeks, then silence):
    → Flag: "Burst-and-crash pattern — sustainable pace risk"
```

---

## Cross-Layer Integration

### WFU Calibration

The full 5-layer profile feeds WFU estimation for resource planning:

```
WFU_effective = WFU_nominal
              × project_familiarity_factor    # from Layer 3 experience profile
              × technology_match_factor        # from Layer 3 T-shaped skills
              × quality_history_factor         # from Layer 5 code quality score
              × delivery_reliability_factor    # from Layer 5 dimension 1
              × collaboration_overhead_factor  # from Layer 4 collaboration score

project_familiarity_factor: 0.7 (new) → 1.2 (highly familiar)
technology_match_factor:    0.8 (new tech) → 1.5 (expert match)
quality_history_factor:     0.9 (quality concerns) → 1.1 (high quality)
delivery_reliability_factor: 0.8 (unreliable) → 1.1 (highly reliable)
collaboration_overhead_factor: varies by team size and collaboration needs
```

### Project-to-Developer Matching

Given a project's requirements (from project analysis output), match against developer profiles:

```
Required skills vector = {
  technical_axes: [axis_name → minimum_score],
  soft_skills: [axis_name → minimum_score],
  ocean_preferences: [trait → preferred_range]  // e.g., C > 3.5 for quality-critical project
}

Match score = cosine_similarity(developer_profile_vector, project_requirement_vector)
             × availability_factor
             × growth_suitability_factor  // is this assignment a good growth opportunity?
```

---

## Ethical Constraints

1. **BOD-only visibility:** Profile data is never shown to developers, their managers, or external parties
2. **No automated decisions:** Profiles inform human judgment — no automated hiring, firing, assignment, or promotion decisions
3. **Inference uncertainty:** All inferred scores must include confidence levels; low-confidence scores require human validation
4. **Calibration by context:** Scores are calibrated by seniority, project tenure, team culture, and language factors
5. **Right to own data:** Individual developers can request to see their own profile
6. **Audit trail:** All profile updates must be logged with timestamp and trigger event
7. **Non-native language flag:** Communication scores flagged when developer operates in a non-native language (reduces bias)
8. **Data retention:** Raw behavioral data deleted after feature extraction; only structured profile retained
