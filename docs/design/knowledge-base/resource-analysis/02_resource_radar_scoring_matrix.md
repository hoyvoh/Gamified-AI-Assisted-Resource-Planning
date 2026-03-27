---
title: "Resource Radar Scoring Matrix — 5 Radars with Rubrics"
type: synthesis
sources:
  - "01_resource_profile_methodology.md"
  - "00_sources/mla_ocean_acl2020.md"
  - "00_sources/bigfive_se_research.md"
  - "00_sources/competency_dreyfus.md"
  - "00_sources/soft_skills_se.md"
  - "00_sources/performance_metrics_devops.md"
  - "00_sources/developer_experience_code_quality.md"
target_users: ["BOD only"]
visibility: "BOD-only"
---

# Resource Radar Scoring Matrix

## Overview

The developer profile system produces **5 independent radar charts**, one per layer. Each axis within a radar is scored **1–5**, and each radar has a composite score.

This document specifies:
- Each radar's axes and their 1–5 scoring rubrics
- Confidence levels per axis
- Composite score formula per radar
- Interpretation guidance

---

## Radar 1: Personality Trait Profile (OCEAN)

**5 axes | Inference from text corpus | Confidence: Medium-High**

### Axis O: Openness to Experience

| Score | Observable behavioral signals |
|-------|-------------------------------|
| 1 | Never proposes alternative approaches; strictly follows existing patterns; no cross-domain exploration; no references to new technologies |
| 2 | Occasionally explores new approaches but defaults to familiar patterns; limited curiosity signals |
| 3 | Regularly engages with new ideas in PRs/reviews; occasionally references emerging technologies; some creative problem-solving visible |
| 4 | Frequently proposes novel solutions; champions new approaches in discussions; visible cross-domain curiosity; architecture-level thinking |
| 5 | Consistently innovates; introduces significant new approaches adopted by team; references broad range of technologies and domains; visible intellectual curiosity in written artifacts |

**Primary signals:** Novel solution proposals in PR descriptions, architecture discussion participation, technology mentions, cross-domain references

---

### Axis C: Conscientiousness

| Score | Observable behavioral signals |
|-------|-------------------------------|
| 1 | PRs consistently incomplete (no tests, missing documentation, broken CI); commits without review; high rework rate; technical debt accumulation visible |
| 2 | Inconsistent quality; some tests; documentation often missing; PR descriptions terse; misses review feedback |
| 3 | Adequate quality; tests present for most features; PR descriptions explain changes; responds to review feedback; occasional gaps |
| 4 | Consistently thorough; comprehensive tests; rich PR descriptions with motivation; proactively updates documentation; applies review feedback promptly |
| 5 | Exemplary; full test coverage including edge cases; self-documenting PRs; proactive quality improvements; visible quality standard-setting for team |

**Primary signals:** Test file ratio, PR description richness, CI failure rate, documentation PR frequency, review feedback uptake

---

### Axis E: Extraversion

| Score | Observable behavioral signals |
|-------|-------------------------------|
| 1 | Minimal written communication; rarely comments on others' work; no visible participation in discussions; communicates only when directly addressed |
| 2 | Infrequent comments; responds to direct questions; rarely initiates discussions; limited @-mention activity |
| 3 | Regular participation; responds to most review requests; occasional discussion initiation; moderate @-mention frequency |
| 4 | Active communicator; frequent comments; regularly initiates team-wide discussions; proactive @-mention patterns; visible contributor to group conversations |
| 5 | Highly visible; initiates discussions and decisions; frequent cross-team communication; natural catalyst for collaboration; vocal in async channels |

**Primary signals:** Comment frequency, discussion initiation rate, @-mention patterns, Slack message frequency

**Calibration note:** Low Extraversion is not a weakness — introverted developers may be high-quality contributors. This axis informs **communication style matching**, not value judgment.

---

### Axis A: Agreeableness

| Score | Observable behavioral signals |
|-------|-------------------------------|
| 1 | Frequently defensive in review threads; rarely acknowledges others' points; escalation patterns visible; adversarial language in disagreements |
| 2 | Sometimes dismissive; debates review comments without alternative proposals; infrequent acknowledgment of others' contributions |
| 3 | Generally cooperative; accepts most review feedback constructively; occasional pushback with reasoning; collaborative tone |
| 4 | Consistently collaborative; thanks reviewers; accepts feedback gracefully; proposes alternatives when disagreeing; visible positive impact on team climate |
| 5 | Exceptionally collaborative; models constructive disagreement; visible team harmony contribution; acknowledged by peers as easy to work with |

**Primary signals:** Sentiment in review threads, revision rate after feedback, "thank you" patterns, escalation frequency

---

### Axis ES: Emotional Stability

| Score | Observable behavioral signals |
|-------|-------------------------------|
| 1 | Dramatic tone changes correlating with project stress; terse/curt under pressure; visible emotional reactivity in written artifacts; inconsistent quality under deadlines |
| 2 | Some stress-response patterns; quality drops during crunch; occasional tone issues in review disagreements |
| 3 | Generally consistent; minor tone variations under pressure; maintains quality in most situations |
| 4 | Consistently calm; quality maintained through high-pressure periods; constructive under criticism; stable across project phases |
| 5 | Exemplary stability; actively calming in difficult situations; consistent quality through incidents and crunch; visible positive effect on team during stress |

**Primary signals:** Tone consistency across project phases, quality variance during sprints, incident response communication patterns

### Radar 1 Composite

```
OCEAN_composite = (O + C + E + A + ES) / 5

Interpretation by composite range:
  4.0–5.0: Strong personality match for collaborative, quality-focused work
  3.0–3.9: Balanced profile; specific trait gaps should inform team placement
  2.0–2.9: Notable gaps; consider team dynamics before assignment
  1.0–1.9: Significant flags; human review required before any action
```

---

## Radar 2: Behavioral Preference Profile

**6 axes | Inference from behavioral patterns | Confidence: High (behavioral patterns more observable than traits)**

### Axis BP1: Work Rhythm

| Score | Pattern |
|-------|---------|
| 1 | Highly irregular; large gaps; burst-and-crash; unreliable presence |
| 2 | Some regularity but frequent gaps; inconsistent contribution pace |
| 3 | Generally regular with some variance; typical developer rhythm |
| 4 | Consistent daily rhythm; reliable within agreed working hours |
| 5 | Highly predictable; optimal sustainable pace; no concerning overwork signals |

### Axis BP2: Collaboration Intensity

| Score | Pattern |
|-------|---------|
| 1 | Almost entirely solo; rarely engages with others' work |
| 2 | Mostly solo; occasional collaboration when required |
| 3 | Mixed; collaborates within immediate team; some cross-team |
| 4 | Actively collaborative; regular cross-team engagement |
| 5 | Highly collaborative; force multiplier; enables others |

### Axis BP3: Domain Preference (Specialization vs. Breadth)

*Note: This is a characterization axis, not a value judgment. Both specialists and generalists are valuable.*

| Score | Pattern |
|-------|---------|
| 1 | Extremely specialized; contributions concentrated in < 2 subsystems |
| 2 | Focused specialist; primary domain with minor adjacent work |
| 3 | Balanced T-shape; primary domain + active in 2–3 adjacent areas |
| 4 | Broad contributor; comfortable across most of the stack |
| 5 | True generalist; strong contributions across all domains |

### Axis BP4: Review Style (Thoroughness)

| Score | Pattern |
|-------|---------|
| 1 | Rubber-stamp reviews; approves without substantive feedback |
| 2 | Minimal feedback; style-level comments only |
| 3 | Adequate; catches obvious issues; some substantive feedback |
| 4 | Thorough; catches design issues; provides context and reasoning |
| 5 | Exceptional; deep reviews that improve code quality and developer growth |

### Axis BP5: Written Communication Style

| Score | Pattern |
|-------|---------|
| 1 | Consistently minimal; one-line PR descriptions; no context provided |
| 2 | Below average; some description but missing critical context |
| 3 | Adequate; covers what was done; sometimes missing why |
| 4 | Strong; covers what, why, and context; reviewers can understand quickly |
| 5 | Exemplary; PRs are self-contained documentation; future developers benefit |

### Axis BP6: Problem Type Preference

*Characterization only — informs task assignment, not performance.*

Scored as distribution (not 1–5):

```json
{
  "problem_preference": {
    "new_features":  0.45,  // 45% of PRs
    "bug_fixing":    0.30,
    "refactoring":   0.20,
    "infrastructure": 0.05
  }
}
```

### Radar 2 Composite

```
Behavioral_composite = (BP1 + BP2 + BP3 + BP4 + BP5) / 5

Note: BP3 is neutral (neither high nor low is "better") — use for matching,
not for quality assessment. BP6 is a distribution, not scored 1–5.
```

---

## Radar 3: Technical Capability Profile

**8 axes | Inference from GitHub artifacts | Confidence: Medium (artifact quality limits)**

### Dreyfus-Mapped Rubric (Applied to All 8 Axes)

| Score | Dreyfus Level | General Description |
|-------|--------------|---------------------|
| 1 | Novice | Follows rules; cannot handle unexpected situations; needs pairing |
| 2 | Advanced Beginner | Recognizes patterns; works with guidance; some autonomy |
| 3 | Competent | Works independently on well-defined tasks; meets team standards |
| 4 | Proficient | Guides others; handles ambiguity; improves team practices |
| 5 | Expert | Sets direction; innovative; organizational impact |

### Axis TC1: Coding / Implementation

**1-5 with GitHub evidence:**

| Score | Evidence |
|-------|---------|
| 1 | PRs frequently require basic corrections; no error handling; happy-path only; CI failures common |
| 2 | Code works but with rough edges; inconsistent style; limited error handling; reviewer corrections needed |
| 3 | Clean, readable code; consistent style; adequate error handling; edge cases addressed; tests present |
| 4 | Elegant solutions; clear separation of concerns; good abstraction level; comprehensive testing; SOLID principles applied |
| 5 | Exceptional code; design patterns applied appropriately; deep performance/maintainability tradeoffs; code becomes reference implementations |

### Axis TC2: System Design

| Score | Evidence |
|-------|---------|
| 1 | PRs limited to file/function scope; no awareness of cross-service implications |
| 2 | Aware of direct dependencies; limited ability to reason about system-level effects |
| 3 | Can design module-level solutions; understands key system interactions; adequate data modeling |
| 4 | Designs services with clean interfaces; considers scalability and failure modes; can lead technical design for a feature |
| 5 | Designs for unknowns; evaluates architectural tradeoffs; architects full systems or subsystems; contributes to platform-level decisions |

### Axis TC3: Debugging and Problem-Solving

| Score | Evidence |
|-------|---------|
| 1 | Can only fix bugs when the cause is obvious; requires help for any non-trivial issue |
| 2 | Can debug within their own code; struggles with multi-component failures |
| 3 | Diagnoses most bugs independently; uses systematic approaches; occasionally needs help for complex issues |
| 4 | Diagnoses complex multi-component issues; identifies root causes vs. symptoms; writes detailed post-mortems |
| 5 | Diagnoses complex distributed system failures; develops debugging tools and techniques; teaches debugging methodology |

### Axis TC4: Testing and QA

| Score | Evidence |
|-------|---------|
| 1 | No tests in PRs; or only copy-paste tests; no understanding of test structure |
| 2 | Basic happy-path tests; no edge cases; tests are brittle or require frequent updates |
| 3 | Comprehensive unit tests; some integration tests; edge cases covered; tests are maintainable |
| 4 | TDD approach visible; property-based thinking; test architecture designed for maintainability; reviews others' tests critically |
| 5 | Full testing strategy (unit, integration, e2e, performance); contributes testing infrastructure; advocates and models test quality for team |

### Axis TC5: Architecture Thinking

| Score | Evidence |
|-------|---------|
| 1 | No visible architectural awareness; implements only what's specified |
| 2 | Follows existing patterns; raises architectural questions but doesn't propose solutions |
| 3 | Can work within established architectural patterns; proposes sensible patterns for new features |
| 4 | Evaluates architectural tradeoffs; writes ADRs; influences technical direction; considers long-term implications |
| 5 | Proposes and drives architectural initiatives; evaluates cross-system tradeoffs; leads architectural review sessions |

### Axis TC6: DevOps / Delivery

| Score | Evidence |
|-------|---------|
| 1 | Cannot deploy independently; CI/CD is a black box; no infrastructure contributions |
| 2 | Can trigger existing deployments; understands the pipeline at a high level |
| 3 | Can modify CI/CD pipelines; understands deployment process; handles own deployments |
| 4 | Owns delivery pipeline for a service; implements monitoring; handles production incidents |
| 5 | Designs delivery architecture; improves team-wide delivery practices; leads incident response; develops platform tooling |

### Axis TC7: Security and Reliability

| Score | Evidence |
|-------|---------|
| 1 | No security awareness visible in PRs; hardcoded credentials; no error handling |
| 2 | Aware of basic security concepts; avoids obvious vulnerabilities when prompted |
| 3 | Applies security principles (input validation, parameterized queries, proper auth); considers failure modes |
| 4 | Proactively designs for security; conducts security reviews; considers threat models; designs for failure |
| 5 | Develops security guidelines; leads threat modeling; proactively identifies systemic vulnerabilities; reliability engineering mindset |

### Axis TC8: Domain / Business Knowledge

| Score | Evidence |
|-------|---------|
| 1 | No domain understanding; implements purely from technical spec without business context |
| 2 | Basic domain awareness; can implement specified requirements |
| 3 | Good domain knowledge for their primary area; understands business rules |
| 4 | Deep domain expertise; translates business requirements to technical decisions; can clarify requirements with stakeholders |
| 5 | Expert domain knowledge; recognized by stakeholders as technical domain authority; bridges business and engineering |

### Radar 3 Composite

```
Technical_composite = Σ (axis_weight × axis_score)

Default weights (equal; adjust by role):
  TC1-TC8: weight = 0.125 each (uniform)

Role-adjusted weights:
  Backend engineer:     TC1×1.3, TC2×1.2, TC6×1.1
  Frontend engineer:    TC1×1.2, TC5×0.8
  Tech Lead:            TC2×1.4, TC5×1.5, TC8×1.3
  SRE/DevOps:          TC6×1.8, TC7×1.6
  Data Engineer:        TC1×1.1, TC3×1.3, TC4×1.2

T-Shape visualization:
  Axes ≥ 4: vertical bars (depth)
  Axes 2–3: horizontal bar (breadth)
  Axes = 1: gaps (flag for role-critical dimensions)
```

---

## Radar 4: Soft Skills Profile

**8 axes | Confidence varies by axis**

| Axis | Confidence | Key signals |
|------|-----------|------------|
| Communication Clarity | High (0.80) | PR body quality, issue descriptions |
| Collaboration | High (0.78) | Review ratio, response patterns |
| Feedback Receptiveness | Medium (0.61) | Revision rate, review thread sentiment |
| Initiative | High (0.80) | Self-assignment, proactive PRs |
| Mentorship | Medium (0.65) | Review comment depth and teaching orientation |
| Adaptability | Medium (0.68) | Technology breadth over time |
| Problem Framing | Medium (0.63) | Issue description quality |
| Conflict Navigation | Low (0.30) | Thread sentiment during disagreements |

### Axis SS1: Communication Clarity (1–5)

| Score | Description |
|-------|-------------|
| 1 | Consistently terse; one-line PR descriptions; comments are vague or absent; no documentation contributions |
| 2 | Some description present but missing context; comments sometimes specific; documentation rare |
| 3 | Adequate; covers what and how; sometimes missing why; review comments actionable |
| 4 | Clear and structured; includes problem statement, solution, and context; comments specific and actionable; documentation contributions present |
| 5 | Exemplary; PRs are self-contained; reviews are educational; documentation proactive and high-quality |

### Axis SS2: Collaboration (1–5)

| Score | Description |
|-------|-------------|
| 1 | Only works on own tasks; reviews not given; never helps others; slow/no response to requests |
| 2 | Reviews only when explicitly assigned; responds eventually; limited cross-team engagement |
| 3 | Reviews own team's PRs; responds within 24 hours; some cross-team contribution |
| 4 | Proactively reviews beyond own team; responds quickly; volunteers to help; visible team contributor |
| 5 | Drives team quality through reviews; cross-functional collaborator; unblocks others; force multiplier for team velocity |

### Axis SS3: Feedback Receptiveness (1–5)

| Score | Description |
|-------|-------------|
| 1 | Rarely updates PRs after reviews; dismissive or defensive tone; applies minimal feedback |
| 2 | Updates required feedback but debates optional suggestions; slow to iterate |
| 3 | Applies requested changes; occasional constructive debate; generally gracious |
| 4 | Quick iterations; applies feedback thoroughly; acknowledges reviewers; applies lessons across future PRs |
| 5 | Demonstrates active learning from reviews; visibly improves over time; thanks reviewers; references past feedback |

### Axis SS4: Initiative (1–5)

| Score | Description |
|-------|-------------|
| 1 | Only completes directly assigned tasks; never self-assigns; no proactive problem identification |
| 2 | Occasionally picks up additional tasks; sometimes creates issues for observed problems |
| 3 | Regularly self-assigns; creates issues for problems encountered; occasional proactive improvements |
| 4 | Consistently proactive; creates and resolves issues proactively; identifies risks before asked |
| 5 | Highly proactive; shapes team priorities through issue creation; anticipates and resolves technical problems at scale |

### Axis SS5–SS8: Abbreviated

| Axis | Score 1 | Score 3 | Score 5 |
|------|---------|---------|---------|
| Mentorship | No knowledge sharing | Answers direct questions | Review comments are educational; creates team documentation |
| Adaptability | Refuses to leave comfort tech | Adapts when required | Actively expands into new domains; models adaptability |
| Problem Framing | Issues are descriptions, not problems | Issues include some root cause analysis | Issues are well-defined problems with evidence and proposed scope |
| Conflict Navigation | Escalates; adversarial tone | Avoids conflict; defers | Mediates constructively; "I think X because Y" language |

### Radar 4 Composite

```
Soft_skills_composite = Σ (axis_weight × axis_score × confidence_weight)

confidence_weight adjusts for uncertainty:
  High confidence (0.78–0.82): use score at face value
  Medium confidence (0.61–0.70): apply 0.85 × score + 0.15 × 3 (regression to mean)
  Low confidence (< 0.40): replace score with null; human review required

Default axis weights: SS1×0.15 + SS2×0.18 + SS3×0.12 + SS4×0.15
                    + SS5×0.12 + SS6×0.10 + SS7×0.10 + SS8×0.08
```

---

## Radar 5: Performance and Growth Profile

**5 axes | Confidence: Medium-High (outcome-based signals)**

### Axis PG1: Delivery Reliability (1–5)

| Score | Key indicators |
|-------|---------------|
| 1 | PR merge rate < 60%; frequent abandoned PRs; deadline misses > 40% |
| 2 | Merge rate 60–75%; some delivery reliability |
| 3 | Merge rate 75–85%; meets commitments ~70% of time |
| 4 | Merge rate > 85%; on-time ~80%; estimate accuracy within 30% |
| 5 | Merge rate > 90%; highly predictable; estimate accuracy within 20%; rarely misses |

### Axis PG2: Code Quality (1–5)

| Score | Key indicators |
|-------|---------------|
| 1 | Bug escape rate > 20%; review rejection > 50%; rarely tests |
| 2 | Bug escape rate 10–20%; rejection 30–50%; minimal testing |
| 3 | Bug escape rate 5–10%; rejection ~30%; tests most features |
| 4 | Bug escape rate < 5%; rejection < 20%; tests > 70% of features |
| 5 | Bug escape rate < 2%; rejection < 10%; comprehensive tests; sets quality bar |

### Axis PG3: Operational Stability (1–5)

| Score | Key indicators |
|-------|---------------|
| 1 | > 4 incidents/quarter attributable; no participation in resolution |
| 2 | 3–4 incidents/quarter; passive in resolution |
| 3 | 1–2 incidents/quarter; responds when assigned |
| 4 | < 1 incident/quarter; actively participates in resolution |
| 5 | Rare incidents; proactive observability improvements; leads incident resolution |

### Axis PG4: Team Impact (1–5)

| Score | Key indicators |
|-------|---------------|
| 1 | Review ratio < 0.3; no documentation; never unblocks others |
| 2 | Review ratio 0.3–0.5; rare documentation |
| 3 | Review ratio 0.5–0.7; occasional documentation; responds to help requests |
| 4 | Review ratio > 0.7; regular documentation; proactive unblocking |
| 5 | Review ratio > 1.0; consistent documentation; team velocity multiplier |

### Axis PG5: Growth Trajectory (1–5)

| Score | 6-month trend |
|-------|--------------|
| 1 | Flat or declining quality signals; same mistakes repeated; no new skills |
| 2 | Minimal improvement; mostly repetitive work |
| 3 | Steady improvement; applies review feedback across PRs; some new areas |
| 4 | Clear upward trajectory; proactively expanding; quality improving measurably |
| 5 | Rapid growth; measurably improving team quality; expanding domain across multiple dimensions |

### Radar 5 Composite

```
Performance_composite = 0.20×PG1 + 0.25×PG2 + 0.20×PG3 + 0.20×PG4 + 0.15×PG5

Sustainable performance flag:
  IF PG5 == 5 AND after_hours_rate > 0.4:
    → flag: "High growth but possible unsustainable pace"
  IF PG2 > 4 AND PG5 < 2:
    → flag: "Quality plateau — growth investment may help"
```

---

## Cross-Radar Profile Summary

### Developer Profile Card (BOD-only output)

```
Developer: [username]
Assessed:  [date]

OCEAN Composite:        [X.X/5]  — [Low/Med/High] confidence
Behavioral Preferences: [X.X/5]  — [style summary in 2 sentences]
Technical Capability:   [X.X/5]  — T-shape: [depth axis] / breadth: [N axes at 3+]
Soft Skills:            [X.X/5]  — Key strength: [axis], Key gap: [axis]
Performance & Growth:   [X.X/5]  — Trajectory: [improving/stable/declining]

Flags:
  [List any burnout risk signals, low-confidence axes requiring review,
   legal or ethical concerns in the data]

WFU Multiplier (estimated): [X.X] for [project type]
Best-fit project types: [description]
Growth opportunity: [description of what assignment would accelerate growth]
```

---

## Scoring Calendar

| Layer | Update frequency | Trigger events |
|-------|-----------------|----------------|
| OCEAN (Radar 1) | Monthly | New message corpus available |
| Behavioral (Radar 2) | Quarterly | Role change; project change |
| Technical (Radar 3) | Quarterly | Significant new GitHub data |
| Soft Skills (Radar 4) | Quarterly | New PR/review cycle complete |
| Performance (Radar 5) | Monthly | New performance data window |
