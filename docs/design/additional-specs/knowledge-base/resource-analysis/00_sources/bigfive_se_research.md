---
source: "Big Five Personality Research in Software Engineering — Composite"
papers:
  - title: "A large-scale, in-depth analysis of developers' personalities in the Apache ecosystem"
    authors: ["Fabio Calefato", "Filippo Lanubile", "Bogdan Vasilescu"]
    arxiv: "1905.13062"
    year: 2019
  - title: "On Developers' Personality in Large-scale Distributed Projects: The Case of the Apache Ecosystem"
    authors: ["Fabio Calefato", "Giuseppe Iaffaldano", "Filippo Lanubile", "Bogdan Vasilescu"]
    venue: "ICGSE 2018"
    arxiv: "1803.01126"
    year: 2018
  - title: "The Type to Take Out a Loan? A Study of Developer Personality and Technical Debt"
    authors: ["Lorenz Graf-Vlachy", "Stefan Wagner"]
    arxiv: "2303.02244"
    year: 2023
  - title: "Personality, emotional intelligence and work preferences in software engineering: An empirical study"
    authors: ["Per Runeson", "Nils Brede Moe", "Aurelien Barreau"]
    venue: "Information and Software Technology"
    doi: "10.1016/j.infsof.2014.01.002"
    year: 2014
type: composite_source
relevance: resource_analysis
---

# Big Five / Five-Factor Model in Software Engineering

## The Big Five (OCEAN) Model

The **Five-Factor Model (FFM)** or **Big Five** is the most empirically validated personality framework in psychology and organizational research. It describes personality along five continuous dimensions:

| Trait | Acronym | Positive pole | Negative pole | Work context |
|-------|---------|--------------|--------------|--------------|
| **Openness to Experience** | O | Curious, creative, intellectually engaged | Conventional, closed to novelty | R&D fit, learning agility |
| **Conscientiousness** | C | Disciplined, reliable, organized, thorough | Careless, impulsive, disorganized | Delivery reliability, code quality |
| **Extraversion** | E | Sociable, assertive, energetic, talkative | Introverted, reserved, reflective | Leadership, stakeholder communication |
| **Agreeableness** | A | Cooperative, empathetic, trusting, warm | Competitive, suspicious, demanding | Teamwork, code review culture |
| **Neuroticism** (or Emotional Stability) | N / ES | Anxious, moody, emotionally reactive | Calm, stable, stress-resilient | Burnout risk, crisis handling |

> **Important:** Big Five scores are **continuous traits**, not types. A person is not "an Extravert" but scores at some point on a scale. Scores are relatively stable across adult life (after age 30).

---

## Research Findings in Software Engineering

### 1. Developer Personality in Apache Ecosystem (Calefato et al. 2018, 2019)

**Data source:** Code commits + email communications from Apache Software Foundation projects

**Key finding 1 — Personality profiles are stable:**
> "Developers' personality is stable over time" and does not vary with role, membership status, or contribution level.

This means personality traits observed early in a person's career are reliable predictors. A 3-month snapshot is not meaningfully different from a 3-year snapshot in terms of trait direction.

**Key finding 2 — Three distinct developer personality profiles emerged:**
Apache ecosystem analysis revealed three recurring archetypes (not labeled in standard FFM terms but distinguishable by trait combinations).

**Key finding 3 — Openness + Agreeableness predict contributor trajectory:**
> "More open and more agreeable developers are more likely to become project contributors."

High Openness → more likely to explore new codebases, pick up new issues, engage with unfamiliar domains.
High Agreeableness → more likely to collaborate, accept feedback, maintain relationships that lead to commit rights.

**Key finding 4 — Temporal shifts in Apache contributors:**
- Conscientiousness increases over time (more disciplined as tenure grows)
- Agreeableness increases over time (smoother collaboration)
- Neuroticism increases in later career stages (more anxiety, possibly due to greater responsibility/stakes)

**Measurement method:** Personality inferred from written communication artifacts (email + commit messages) using computational psycholinguistics. Not self-report questionnaires — this is the most relevant validation for our system which also uses text artifacts.

---

### 2. Personality and Technical Debt (Graf-Vlachy & Wagner, 2023)

**Data:** Survey-based self-report personality + 2,145 commits from 19 participants

**Results — OCEAN traits vs. Technical Debt introduction/removal:**

| Trait | Correlation with TD | Interpretation |
|-------|--------------------|-|
| Conscientiousness ↑ | Negative (reduces TD) | Conscientious devs write cleaner, more complete code |
| Emotional Stability ↑ | Negative (reduces TD) | Stable devs less likely to cut corners under pressure |
| Openness ↑ | Negative (reduces TD) | Open devs more likely to refactor, use better patterns |
| Extraversion | No significant effect | Social energy doesn't predict code quality |
| Agreeableness | No significant effect | Cooperativeness unrelated to debt behavior |

**Additional finding:** Prevention focus (avoiding failures) also negatively correlated with TD.

**Implication for staffing:** For projects where technical debt control is critical (e.g., core platform, security-sensitive code), prioritizing developers with high Conscientiousness + Emotional Stability signals is well-supported.

---

### 3. Personality, Emotional Intelligence, and Work Preferences (Runeson et al., 2014)

**Venue:** Information and Software Technology (DOI: 10.1016/j.infsof.2014.01.002)

**Key findings:**
- Big Five traits correlate with **work environment preferences** in software engineering
- Emotional intelligence moderates performance beyond Big Five alone
- Work preferences (structured vs. exploratory, solo vs. collaborative) can be predicted from personality

**Work preference mapping:**

| Profile | Preferred work type |
|---------|-------------------|
| High Openness + High Extraversion | Research, exploration, cross-team coordination |
| High Conscientiousness + Low Neuroticism | Delivery, maintenance, production support |
| High Agreeableness + High Extraversion | Code review, mentoring, technical leadership |
| Low Extraversion + High Openness | Deep technical work, architecture, R&D |

---

## Inferring Big Five from Developer Artifacts

**Critical note:** Unlike survey-based assessments, our system infers personality from *natural language and behavioral patterns*. This approach is validated by computational psycholinguistics research (Pennebaker et al., Schwartz et al.) and applied in the MLA-OCEAN paper.

### Language-based signals per trait

| Trait | GitHub/code signals | Slack/chat signals |
|-------|--------------------|--------------------|
| **Openness** | Varied technology exposure, exploration of new APIs, creative commit messages, asks "why" questions in reviews | Uses rich vocabulary, engages with abstract ideas, asks curious questions |
| **Conscientiousness** | Consistent commit frequency, thorough PR descriptions, systematic test coverage, clean commit history | Organized messages, follow-up on tasks, acknowledges deadlines explicitly |
| **Extraversion** | Participates in many code reviews, comments on others' issues, @-mentions frequently | High message volume, initiates conversations, uses emojis, social language |
| **Agreeableness** | Constructive review tone ("consider..." vs. "you must..."), accommodates reviewer requests, avoids conflict in issue threads | Warm language, compliments, agreement expressions, low conflict vocabulary |
| **Emotional Stability** | Consistent behavior under deadline pressure, calm tone in crisis issues, avoids reactive commits | Neutral tone in difficult discussions, no escalation patterns |

### Behavioral signals

| Trait | GitHub behavioral signals |
|-------|--------------------------|
| Conscientiousness | PR description completeness, test coverage consistency, response time to review requests |
| Openness | Number of distinct technologies in contributions, diversity of repos contributed to |
| Extraversion | Review-to-commit ratio, comments-per-PR, participation in discussions |
| Agreeableness | Review comment tone analysis, willingness to revise based on feedback |
| Emotional Stability | Commit frequency under high-pressure periods, tone stability across time |

---

## Radar Axes for Personality Layer

Based on the research above, the recommended 5-axis personality radar:

| Axis | What it measures | Scale anchor 1 | Scale anchor 5 |
|------|-----------------|---------------|---------------|
| **Openness** | Intellectual curiosity, novelty-seeking, creative engagement | Highly conventional, resistant to change | Highly exploratory, curious, creative |
| **Conscientiousness** | Reliability, discipline, thoroughness | Impulsive, careless, inconsistent | Highly disciplined, reliable, thorough |
| **Extraversion** | Social energy, assertiveness, external orientation | Highly introverted, prefers solitary deep work | Highly sociable, energized by interaction |
| **Agreeableness** | Cooperativeness, empathy, collaborative orientation | Competitive, skeptical, direct to conflict | Highly cooperative, empathetic, team-first |
| **Emotional Stability** | Stress resilience, mood stability, calm under pressure | High anxiety, emotional reactivity, burnout-prone | Highly stable, calm under pressure, resilient |

**Scoring guidance (1–5):**
- 1–2: Below population mean, trait is noticeably absent
- 3: Population average
- 4–5: Above population mean, trait is noticeably present

---

## Critical Ethical Constraints

1. **Big Five is NOT a performance score.** High Conscientiousness does NOT mean "good developer." Agreeableness does NOT mean "better team member."
2. **Use as fit indicator only.** Big Five should inform *task fit* and *environment fit*, never be used to rank, promote, or penalize.
3. **Avoid discrimination risk.** Neuroticism scores should never be used in hiring or compensation decisions.
4. **Confidence intervals matter.** Text-inferred Big Five has significant error margins (~0.3–0.4 Pearson r). Present scores as ranges, not point estimates.
5. **BOD-only visibility.** This layer is the most sensitive — never expose to individuals or managers.

---

## Citations

1. Calefato, F., Lanubile, F., & Vasilescu, B. (2019). A large-scale, in-depth analysis of developers' personalities in the Apache ecosystem. *arXiv:1905.13062*.
2. Calefato, F., Iaffaldano, G., Lanubile, F., & Vasilescu, B. (2018). On Developers' Personality in Large-scale Distributed Projects: The Case of the Apache Ecosystem. *ICGSE 2018. arXiv:1803.01126*.
3. Graf-Vlachy, L., & Wagner, S. (2023). The Type to Take Out a Loan? A Study of Developer Personality and Technical Debt. *arXiv:2303.02244*.
4. Runeson, P., Moe, N. B., & Barreau, A. (2014). Personality, emotional intelligence and work preferences in software engineering. *Information and Software Technology*. DOI: 10.1016/j.infsof.2014.01.002.
