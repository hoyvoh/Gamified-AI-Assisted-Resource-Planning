# GAIARP — Project Proposal
## Gamified AI-Assisted Resource Planning

> **Format:** 4-pillar suite, each deployable as a standalone product.
> **Pitch target:** Board of Directors, C-suite, Engineering Leadership
> **Positioning:** Decision-support infrastructure for software project management

---

## The Overarching Problem

Software projects fail in predictable ways:

- A project that shouldn't have been approved consumes 6 months of engineering time before the team admits it won't work.
- The wrong developers are assigned to the wrong tasks because nobody has objective data on who can actually do what.
- Planning is done in spreadsheets that can't model constraints — over-allocation is invisible until someone burns out.
- Once execution begins, leadership is flying blind until the deadline is missed.

These are not edge cases. They are the default. Each one has a measurable cost.

**GAIARP** addresses each failure mode as a focused tool — connected into a single planning workflow.

---

## Pillar 1 — Project Analysis Engine

### The Pain

When a new project is proposed, the decision to proceed is made in a meeting room based on a slide deck and whoever speaks most confidently. There is no structured framework for evaluating feasibility, strategic fit, or risk exposure.

Six months later, the project is cancelled. The engineering cost is written off. The opportunity cost is never calculated because no baseline was ever established.

### The Cost

| Cost Category | Estimate |
|--------------|----------|
| Engineering time on cancelled/redirected projects | 15–30% of annual engineering spend (industry average) |
| Rework from risks identified too late | 2–5× the cost of fixing them at design time |
| Misaligned project scope approved without legal/compliance review | Regulatory exposure, fines, forced rework |
| Leadership time in unstructured feasibility debates | 3–8 hours per project proposal per stakeholder |

### How It Solves It

A structured **10-axis scoring system** — grounded in Theory of Change, TELOS feasibility, ATAM architecture assessment, MCDA strategic value, and TRL technology readiness — turns a subjective debate into a documented, reviewable decision.

Each axis is scored 1–5 by the appropriate stakeholder (PM, Tech Lead, Legal, Finance). The system applies weights, computes a composite score, and surfaces a **verdict with a risk register** automatically generated from low-scoring axes.

**AI assist:** For each axis, the system can read the project proposal and suggest a score with rationale — reducing the cognitive load on scoring panels and ensuring consistent interpretation of rubrics across projects.

**Hard gates:** If any single axis scores 1 (structural blocker), the verdict overrides regardless of the composite average. This prevents gaming the score.

```
Input:  Project proposal text + panel scores (PM, TL, Legal, Finance)
Output: Radar chart · Composite score · Verdict label · Risk register
Gate:   Planning Board locked until verdict = Proceed or Conditional
```

### Who Benefits

| Audience | Benefit |
|----------|---------|
| **Board of Directors** | Structured evidence for go/no-go decisions; audit trail of feasibility rationale |
| **CTO / CPO** | Consistent evaluation framework across all proposed projects; early risk visibility |
| **PM / Tech Lead** | AI-assisted scoring; auto-generated risk register with required actions |
| **Legal / Compliance** | Dedicated Legal/Regulatory axis (Axis 10) ensures review is not skipped |

### Why This Wins for BOD

Every capital allocation decision now has a documented evidence base. When the Board asks "why did we approve this?" — the answer is a radar chart, a composite score, and a risk register with action owners. That is auditable governance.

---

## Pillar 2 — Resource Analysis Engine

### The Pain

Two problems live here:

**Problem A — The UAT problem:** A senior developer is assigned to a critical module. Three months in, users flag issues in UAT that reveal the developer has a pattern of misunderstanding requirements — visible in their PR comments and review behavior for the past 18 months. Nobody caught it because nobody looked. The fix: a weeks-long stabilization sprint that delays the release.

**Problem B — The performance review problem:** Developer evaluations are annual, subjective, and based on manager impressions. A developer who is quietly excellent at code quality and mentoring junior colleagues is rated "meets expectations" because they don't self-promote. Another who is fast but introduces regressions is rated "exceeds expectations" because their throughput looks high on a dashboard.

### The Cost

| Cost Category | Estimate |
|--------------|----------|
| UAT defects from misaligned developer skill/communication profile | 20–40% of UAT cycles are preventable with better upfront matching |
| Time-to-discover a developer's actual weaknesses | Typically 3–6 months into a project (too late to restructure) |
| Subjective performance reviews → wrong promotion/retention decisions | High performers leave; underperformers stay; org loses institutional knowledge |
| Senior time mentoring the wrong person for a role | 10–20% overhead on mismatched pairing |

### How It Solves It

The system aggregates behavioral data from **GitHub** (commit patterns, PR descriptions, code review comments, issue activity) and **Slack** (communication cadence, collaboration network, cross-team reach) and runs it through a **5-layer developer profile inference engine** using LLM analysis.

**5 Profile Layers:**
1. **OCEAN Personality** — Openness, Conscientiousness, Extraversion, Agreeableness, Emotional Stability (inferred from writing patterns)
2. **Behavioral Preferences** — work rhythm, collaboration intensity, domain preference, response time
3. **Technical Capability** — per-skill Dreyfus level (Novice → Expert) inferred from code contribution depth
4. **Soft Skills** — communication clarity, mentoring behavior, initiative, conflict handling signals
5. **Performance & Growth** — delivery reliability, code quality trend, team impact, growth trajectory

**For each project**, the system computes a **match score** between each developer and the project's requirements vector (generated by Pillar 1). It then recommends the **top 3 team compositions** that cover required skills, balance OCEAN profiles, and maximize effective capacity.

**For UAT prevention**, the profile surfaces communication and comprehension patterns before assignment — not after three months of UAT issues.

```
Input:  GitHub repos (date range) + Slack workspace + project requirements vector
Output: 5-layer developer profile · Project-developer match score · Top 3 team configs
        WFU effective factors per developer per project
```

### Who Benefits

| Audience | Benefit |
|----------|---------|
| **Board of Directors** | Objective, data-driven developer evaluation for promotion and retention decisions |
| **Engineering Director / HR** | Performance signals that complement (or challenge) subjective manager reviews |
| **PM / Tech Lead** | Objective team composition recommendations; know skill gaps before project starts |
| **Developers** | Career data — know which projects grow which skills; growth opportunity scoring |

### Why This Wins for BOD

This turns developer evaluation from a political process into a data process. The Board can see, for any project, why this team was selected, what their predicted effective capacity is, and where the skill gaps are before a euro is spent — not after.

---

## Pillar 3 — Planning Board

### The Pain

Resource planning lives in spreadsheets. Or in someone's head.

A PM allocates a developer to three projects at 40%, 40%, and 30% simultaneously. On paper that's 110% — but the spreadsheet doesn't flag it. The developer starts missing deadlines on all three projects six weeks in.

Meanwhile, "adding more people" is the default escalation response. Nobody models whether adding a person actually helps. Brooks' Law exists — everyone knows it — but nobody enforces it systematically because no tool makes the constraint visible in real time.

When leadership asks "what happens if we lose Alice next month?" — the PM spends two days rebuilding the spreadsheet to model the scenario. By the time the answer is ready, the decision has already been made.

### The Cost

| Cost Category | Estimate |
|--------------|----------|
| Over-allocated developers → burnout → attrition | 1 senior engineer exit = 6–12 months of productivity loss (recruitment + ramp) |
| "Add more people" decisions that slow projects down | Average 15–25% schedule extension from late staffing additions |
| Scenario planning time (manual, per what-if question) | 4–8 hours per scenario; typically 2–4 scenarios per project = 8–32 hours lost |
| Undetected budget overruns (personnel cost vs. project budget) | Discovered at invoice time, not planning time |

### How It Solves It

An **interactive planning board** where developers and tasks are cards. Drag a developer onto a task — the system immediately computes effective capacity (WFU), checks all 8 constraint types, and surfaces warnings.

**8 Real-time Warnings:**

| Warning | Trigger | Severity |
|---------|---------|---------|
| CAPACITY | Person exceeds 7h/day across all projects | 🔴 Critical |
| JUNIOR_ALONE | No senior on a critical/high-priority task | 🔴 Critical |
| LANGUAGE_BARRIER | Developer lacks task's required working language | 🟠 Warning |
| SKILL_MISMATCH | >50% of assignees lack the required tech stack | 🟡 Info |
| DEPENDENCY_RISK | Successor task starting before predecessor finishes | 🟠 Warning |
| TIME_RISK | Current plan won't meet deadline (P(on_time) < 50%) | 🟠 Warning |
| BUDGET | Personnel cost exceeds project budget | 🟠 Warning |
| LICENSE | Tool seat allocation exceeds licensed capacity | 🟠 Warning |

**Scenario planning in seconds:** Snapshot the current plan → fork → adjust → compare. "What if Alice leaves?" takes 30 seconds to model, not 2 days.

**AI Optimizer (Genetic Algorithm):** One click → system finds the near-optimal allocation for either shortest duration or lowest cost. Returns top 3 solutions — PM cherry-picks or accepts all.

**Completion probability:** Every scenario has a live `P(on_time)` score that accounts for SPI, warning penalties, and critical path slack. Planning decisions are made against a real number, not a feeling.

```
Input:  Team (from Pillar 2 recommendation) · Tasks (from Pillar 1 + LLM generation) · Budget · Deadline
Output: Live-warning board · Gantt · Dependency graph · Scenario comparisons · GA-optimized allocation
Gate:   One scenario must reach P(on_time) acceptable before Launch
```

### Who Benefits

| Audience | Benefit |
|----------|---------|
| **Board of Directors** | Side-by-side scenario comparison with objective P(on_time), cost, and timeline metrics |
| **PM / Tech Lead** | Interactive board replaces spreadsheets; constraints enforced automatically |
| **Finance** | Real-time budget vs. personnel cost tracking; no end-of-month surprises |
| **HR / Resource Managers** | Cross-project allocation visibility; over-allocation flagged before damage occurs |

### Why This Wins for BOD

The Board can now demand, for any project, a scenario analysis with quantified tradeoffs — not a slide with a traffic light. "What does adding 2 more people cost vs. what does it save in schedule?" becomes a 30-second answer, not a weekend analysis.

---

## Pillar 4 — Execution Mode

### The Pain

The plan is launched. The project starts. Within two weeks, the plan is already wrong — someone is slower than expected, a dependency slipped, a team member got pulled to another project. But nobody sees it until the deadline is three weeks away and the project is 40% done.

At that point, the PM either:
- Manually rebuilds the plan (losing all historical progress context), or
- Pushes the same broken plan forward hoping it self-corrects.

Neither works. Both are avoidable.

### The Cost

| Cost Category | Estimate |
|--------------|----------|
| Late detection of project-at-risk status | Every 2 weeks of delay in detection adds 4–8 weeks of deadline slip (compounding) |
| Mid-execution plan switch without progress continuity | Team re-onboarding to new plan: 1–3 days of confusion, double-counting, lost logs |
| Missed escalation triggers | Risks that could have been mitigated with a 2-week earlier intervention become crisis recoveries |
| Leadership visibility gap | Leadership finds out project is failing at the same time as the customer |

### How It Solves It

After launch, the system activates **Execution Mode** — a live dashboard for the PM and a daily update interface for each team member.

**Daily progress tracking:** Each team member logs % complete for their tasks. The system computes:
- **SPI** (Schedule Performance Index) — are we delivering on schedule?
- **CPI** (Cost Performance Index) — are we delivering within budget per unit of work?
- **EAC** (Estimate at Completion) — at current velocity, when do we actually finish?
- **P(on_time)** — updated daily, accounts for velocity variance and all active warnings

**Three-threshold P(on_time) alert system:**

| Probability | Status | System Action |
|------------|--------|---------------|
| > 80% | 🟢 On track | No action |
| 50–80% | 🟡 At risk | Warning surfaced; suggestions shown |
| < 50% for 3 days | 🔴 Critical | "Consider switching plan" banner escalated to PM |

**Mid-execution scenario switch — with continuity:**

When conditions change (a team member leaves, scope expands, deadline is pulled in), PM can switch to a contingency plan already prepared in Pillar 3 — or fork the current plan from today's state. Progress logs are attached to tasks, not plans — so switching plans never loses recorded work.

```
P(on_time) < 40% for 3 days
  → System surfaces switch banner
  → PM selects: activate contingency plan | fork current state
  → Old plan archived with switch reason + timestamp
  → New plan inherits all ProgressLogs; Gantt shows switch marker
  → Team continues without re-entering historical data
```

**Gantt — 3-layer execution view:**
- **Baseline** (grey) — what the original plan said at launch
- **Planned** (blue) — what the current active plan says
- **Actual** (green/red) — what ProgressLogs show happened

This gives leadership three lines at a glance: what was promised, what is planned now, and what is actually happening.

```
Input:  Daily progress logs · Current active scenario · Warning state
Output: Live EV metrics (SPI/CPI/EAC) · P(on_time) trend · 3-layer Gantt · Switch triggers
        Scenario switch history (audit trail on Gantt)
```

### Who Benefits

| Audience | Benefit |
|----------|---------|
| **Board of Directors** | Real-time project health in a single number (P(on_time)); switch triggers before crisis, not during |
| **PM** | Daily execution dashboard; scenario switch flow preserves all prior work |
| **Team members** | Clear daily interface; no ambiguity about what to report |
| **Stakeholders / Clients** | Honest, data-backed status updates at any point in the project |

### Why This Wins for BOD

The Board's worst nightmare is finding out a project is failing at the same time as the customer does. This system gives leadership a daily `P(on_time)` and a documented switch trail — so they can intervene two weeks before a deadline miss, not two days after.

---

## System as a Whole

The 4 pillars are designed to connect — but each stands alone:

```
Pillar 1 ──────────────────────────────────────────┐
  "Is this project worth doing?"                    │
  Output: Requirements vector · Risk register       │
                                                    ▼
Pillar 2 ───────────────────────────────────► Pillar 3
  "Who should work on it?"                  "How should we plan it?"
  Output: Developer profiles · Team recs    Output: Allocated plan · P(on_time) · Scenarios
                                                    │
                                                    ▼
                                            Pillar 4
                                            "How are we actually doing?"
                                            Output: EV metrics · Switch triggers · Audit trail
```

**Each pillar eliminates a specific class of project failure:**

| Pillar | Failure eliminated |
|--------|-------------------|
| 1 | Approving projects that shouldn't be approved |
| 2 | Assigning the wrong people to the wrong roles |
| 3 | Planning without real constraint modeling |
| 4 | Discovering problems too late to course-correct |

---

## For the Hackathon Pitch

**Recommendation:** Present Pillar 3 as the demo centerpiece. It has the highest visual impact, immediately understandable value, and the widest audience (every PM, every team lead, every engineering director has had the spreadsheet problem). Build the pitch structure as:

1. **Open with the spreadsheet failure story** (everyone in the room has lived it)
2. **Show Pillar 3 live** — drag a developer onto a task, watch CAPACITY warning fire, show scenario fork in 30 seconds
3. **Frame Pillars 1, 2, 4 as the intelligence layer** — "the board knows this plan is real because Pillar 1 approved the project, Pillar 2 picked the right people, and Pillar 4 will alert us the moment it starts to slip"
4. **Close with the BOD value statement** — "At any point in any project, you have one number: P(on_time). And you have a documented reason for every decision that led to it."

**Target audience alignment:**

| Audience | Entry point | Core value |
|----------|-------------|------------|
| Board / C-suite | Pillar 1 verdict + Pillar 4 P(on_time) | Governance, risk, accountability |
| Engineering Director | Pillar 2 profiles + Pillar 3 optimizer | Objective evaluation, constraint modeling |
| PM / Tech Lead | Pillar 3 board + Pillar 4 dashboard | Daily operational tool |
| HR | Pillar 2 developer profiles | Data-driven performance evidence |

---

*GAIARP — Biến mọi quyết định phân bổ nhân sự thành bằng chứng có thể kiểm chứng.*
*Turn every resource allocation decision into auditable evidence.*
