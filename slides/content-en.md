# Presentation Content — English
# Project Intelligence Platform

**Central positioning:**
> "The intelligence layer that turns your team's real data into confident project decisions."

---

## SLIDE 1 — Cover

**Title:** Project Intelligence Platform

**Subtitle:** AI-assisted planning & resource decisions — grounded in real team data

**Tag line:** For PM · Tech Lead · BOD

---

## SLIDE 2 — The Real Pain

**Title:** Everything runs smoothly... until it doesn't.

**Story:**

A new project is handed down. The PM opens a kick-off meeting.

Scope is estimated based on experience. The Tech Lead assigns tasks — this person is "strong in Backend," that person "knows React." Estimates are locked in during a 2-hour meeting, written to a spreadsheet, and everyone gets to work.

But nobody knows:
- The "React developer" switched to mobile 6 months ago
- The project has compliance requirements nobody noticed during estimation
- The person assigned the critical task is already carrying 3 other projects

**Nobody was wrong. But nobody had enough information at the moment of decision.**

And by the time anyone realizes — it's usually too late to change course without pain.

---

## SLIDE 3 — Why This Matters

**Title:** This isn't just inconvenient — it's costly.

**4 consequences:**

| Root Cause | Consequence |
|-----------|-------------|
| Wrong estimates | Overwork · Missed deadlines · Budget overrun |
| Wrong person for the job | Skill mismatch · Rework · Accumulated technical debt |
| Risks not caught early | Too-late intervention · No contingency options left |
| Relying on individual memory | Knowledge loss · Repeated mistakes · Can't scale |

**Closing:** And this cycle repeats — because nothing changes at the place where decisions are made.

---

## SLIDE 4 — The Core Insight

**Title:** The data was always there. It just was never ready for decisions.

**Central question:**
> "How do you turn scattered signals — commits, PR reviews, Slack threads, project history — into the right information, at the right time, for the right decision?"

**What's already in your systems:**
- In GitHub: real technical capability, work velocity, code quality, review patterns
- In Slack: collaboration style, breadth of cross-team reach, response cadence
- In project history: actual velocity, past risks, how the team handled them
- In a new project proposal: scope, tech stack, constraints, stakeholders, timeline

**It all already exists. It just hasn't been synthesized — at the moment it's needed.**

---

## SLIDE 5 — The Solution

**Title:** Four pillars. One ecosystem.

**One-line positioning:**
> We're building Project Intelligence Platform — a system that helps PMs, Tech Leads, and BODs make project decisions based on evidence, not gut feeling.

---

**Pillar 1 — Personnel Analysis** *(input)*
- Collects: GitHub commits, PR reviews, Slack signals — per username
- Analyzes: 5-layer developer profile (OCEAN personality · Behavioral · Technical · Soft Skills · Performance)
- Output: real capability, current form, match score with project — based on last 6–12 months of data

**Pillar 2 — Project Analysis** *(input)*
- Input: project proposal text
- Analyzes: LLM + 5 academic frameworks (ToC, TELOS, ATAM, MCDA/AHP, TRL) → 10-axis radar scoring
- Output: Verdict (Proceed / Conditional / Do Not Proceed) + Risk Register + Requirements Vector

**→ These two pillars are prerequisites. Without them, the next two are just ordinary planning boards.**

**Pillar 3 — Resource Planning**
- Kanban board: developer cards dragged into task cards
- COCOMO II: effort estimation from actual task breakdown
- WFU_effective: real capacity of each person on each specific task
- Scenario planning: Plan A/B/C, Normal/Full Resource/OT — compare and launch
- GA Optimizer: optimal allocation suggestions (makespan / budget)

**Pillar 4 — In-Execution Management**
- P(on_time): probability of on-time delivery, updated daily
- 3-layer Gantt: Baseline / Planned / Actual — see drift as it happens
- Scenario switching: when conditions change (member departure, tightened deadline, budget cut) — switch plans with evidence, without losing progress history
- EV Metrics: SPI, CPI, EAC — know early, act in time

---

## SLIDE 6 — Why This Is Trustworthy

**Title:** Not digitized gut feeling. Structured evidence.

**4 reasons:**

**1. Real data, not surveys**
- GitHub API + Slack API: actual behavior, not self-assessment
- Signals updated continuously — reflect current capability

**2. Academically validated frameworks**
- COCOMO II · OCEAN (Big Five) · Dreyfus Skill Model
- Theory of Change · TELOS · ATAM · MCDA/AHP · TRL
- Not ad-hoc heuristics

**3. Explainable results**
- Every score has a detailed breakdown
- Every recommendation has a reason
- No black box — PMs/TLs understand why the system suggests what it does

**4. Decisions with audit trails**
- Scenario switching logs the trigger reason (member departure, scope change, deadline change...)
- Daily P(on_time) history
- Nobody "misremembers" why the plan changed

---

## SLIDE 7 — Vision / Closing

**Title:** With AI — see clearer, decide faster.

**Vision statement:**

> "We believe the best projects aren't won by the biggest team — but by the team that sees the clearest.
>
> Project Intelligence Platform is the intelligence layer that turns scattered daily signals from your team's work into project decisions that are confident, transparent, and capable of learning over time."

**Closing line:**
> Better delivery starts with better decisions — and better decisions start with the right information.

---

## APPENDIX A — Decision & Estimation Logic

**Title:** How are results calculated?

**Project Analysis (Pillar 2):**
- 10 axes, 1–5 scale — PM + TL score with AI assist
- Composite score → Proceed / Conditional / Do Not Proceed
- Axes ≤ 2 → auto-generated risk register

**Resource Analysis (Pillar 1):**
- Feature extraction from raw GitHub/Slack signals
- LLM inference → 5-layer profile with confidence score
- Cosine similarity → match score between developer vector and project requirements vector

**WFU_effective:**
```
WFU_effective = base × familiarity_factor × tech_match_factor × quality_history_factor × delivery_reliability_factor
```

**P(on_time):**
Derived from SPI (Schedule Performance Index), velocity variance, active warnings count, critical path slack

---

## APPENDIX B — Data Foundation

**Title:** What data does this system consume?

| Source | Data |
|--------|------|
| GitHub API | Commits, PRs, code reviews, issue activity per developer |
| Slack API | Messages, thread responses, @mentions, reactions |
| Project proposal | Scope, tech stack, timeline, constraints, stakeholders |
| Manual input | Effort estimates, skill matrix, allocation %, WFU mode |
| Progress logs | Daily completion %, hours spent, notes |

**All data belongs to the org — it never leaves the system.**

---

## APPENDIX C — High-Level Architecture

**Title:** How does it run when built for real?

```
GitHub API ──┐
Slack API  ──┤→ Data Pipeline → Feature Extraction
             │                        ↓
             │                 LLM Profile Inference (Claude API)
             │                        ↓
             │                 Developer Profiles (5-layer)
             │
Project Brief ──→ LLM Scoring Engine (Claude API)
                        ↓
               10-axis Radar + Verdict + Risk Register
                        ↓
           ┌──────────────────────────────────┐
           │     Planning Board               │
           │  COCOMO II · WFU Engine          │
           │  GA Optimizer · Warning Engine   │
           │  Scenario State Machine          │
           └──────────────────────────────────┘
                        ↓
              Execution Mode
           Earned Value · P(on_time) · Scenario Switch
```

**Stack:** Next.js 15 · FastAPI · PostgreSQL · Claude API · GitHub API · Slack API

---

## APPENDIX D — Roadmap

**Title:** This is just the beginning.

| Phase | Capability |
|-------|-----------|
| v1 — Foundation | HR profiling + Project analysis + Planning board |
| v2 — Execution | P(on_time) tracking + Scenario switching + EV metrics |
| v3 — Learning | XP system + velocity calibration + cross-project pattern recognition |
| v4 — Intelligence | Predictive risk detection + proactive recommendations + org-level portfolio view |

**Long-term vision:**
Every completed project makes the system understand your team better — and helps the next project start from a stronger foundation.
