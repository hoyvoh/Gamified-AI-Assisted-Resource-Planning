---
source: "Soft Skills in Software Engineering — Composite"
papers:
  - title: "A Call to Promote Soft Skills in Software Engineering"
    authors: ["Luiz Fernando Capretz", "Faheem Ahmed"]
    arxiv: "1901.01819"
    year: 2019
  - title: "Software Engineering Education Beyond the Technical: A Systematic Literature Review"
    authors: ["Wouter Groeneveld", "Joost Vennekens", "Kris Aerts"]
    arxiv: "1910.09865"
    year: 2019
  - title: "A Systematic Mapping Study on Soft Skills in Software Engineering"
    authors: ["Fabio Q.B. da Silva", "A. César C. França", "Marcos Kalinowski", "Emilia Mendes"]
    venue: "ResearchGate / EASE 2019"
    year: 2019
  - title: "Skills development for software engineers: Systematic literature review"
    venue: "Information and Software Technology"
    doi: "10.1016/j.infsof.2023.107225"
    year: 2024
type: composite_source
relevance: resource_analysis
---

# Soft Skills in Software Engineering

## Why Soft Skills Matter (and Are Under-Measured)

Capretz & Ahmed (2019) identify a persistent gap: software engineering education and performance evaluation focuses almost exclusively on technical skills, yet industry consistently reports that failures in software projects are more often caused by **communication breakdowns, team dynamics failures, and leadership gaps** than by technical shortcomings.

> "Soft skills are the missing link of software engineering."

Groeneveld et al. (2019) found through systematic literature review that the most frequently cited non-technical abilities required in SE practice are:
1. Self-reflection
2. Conflict resolution
3. Communication
4. Teamwork

The key argument: a developer who can write excellent code but cannot communicate constraints, negotiate scope, or handle conflict is a bottleneck — not an asset — in collaborative projects.

---

## Taxonomy: Categories of Soft Skills in SE

### Category 1 — Interpersonal Skills (team-facing)
Skills for working effectively with other people:
- **Communication:** Expressing ideas clearly in writing and speech; adapting to technical and non-technical audiences
- **Collaboration:** Working effectively within and across teams; contributing to shared goals
- **Conflict Navigation:** Resolving disagreements productively; de-escalating tension
- **Empathy:** Understanding others' perspectives; recognizing impact of one's actions on teammates
- **Feedback Receptiveness:** Accepting criticism constructively; acting on review comments without defensiveness

### Category 2 — Intrapersonal Skills (self-management)
Skills for managing oneself:
- **Self-reflection:** Awareness of one's own strengths, weaknesses, and growth areas
- **Adaptability:** Adjusting to changing requirements, technologies, team structures
- **Initiative / Proactiveness:** Taking ownership; identifying problems before being asked
- **Commitment / Follow-through:** Delivering on promises; maintaining accountability

### Category 3 — Cognitive Skills (problem approach)
Higher-order thinking skills:
- **Critical Thinking:** Analyzing trade-offs; questioning assumptions; evidence-based reasoning
- **Problem Framing:** Defining problems clearly before jumping to solutions
- **Creative Thinking:** Generating novel solutions; thinking outside established patterns
- **Systems Thinking:** Understanding complex interdependencies; foreseeing second-order effects

### Category 4 — Professional Skills (organizational-facing)
Skills for operating within organizations:
- **Leadership:** Guiding and motivating others; creating direction; handling ambiguity
- **Stakeholder Management:** Managing expectations across technical and non-technical stakeholders
- **Organizational Awareness:** Understanding how decisions affect the broader organization
- **Mentorship:** Actively developing others; knowledge transfer; coaching

---

## Top Soft Skills by Research Frequency

Across systematic mappings of SE soft skills literature, the most frequently cited skills (by number of studies mentioning them as critical):

| Rank | Skill | Reason frequently cited |
|------|-------|------------------------|
| 1 | Communication | Required in all roles, at all seniority levels |
| 2 | Teamwork / Collaboration | Modern SE is team-based, rarely solo |
| 3 | Problem-solving | Broad skill that underlies effective technical work |
| 4 | Leadership | Critical for senior+ roles, often underdeveloped |
| 5 | Critical Thinking | Required for design, debugging, architecture |
| 6 | Adaptability | Tech changes rapidly; environment changes |
| 7 | Initiative | Distinguishes high-performers from average |
| 8 | Self-reflection | Required for growth; often hard to assess |

---

## Observing Soft Skills from Developer Work Artifacts

This is the most critical section for our system: how to **infer soft skills from GitHub/Slack data** without self-report surveys.

### Communication

**GitHub signals:**
- PR description quality: Is the problem explained? Is the solution justified? Are reviewers given context?
- Comment clarity: Are review comments specific and actionable, or vague and terse?
- Issue writing quality: Is the bug report reproducible? Is the feature request clear?
- Documentation contributions: Do commits include docstrings, README updates, inline comments?

**Slack signals:**
- Message clarity (readability score, structure)
- Appropriate use of threading and channels
- Explanation of technical decisions in non-technical terms

**Scoring proxy:**
- 1: Consistently terse PRs, unclear comments, no documentation
- 3: Adequate descriptions, sometimes missing context
- 5: Rich PR bodies with context, clear commit messages, proactive documentation

### Collaboration

**GitHub signals:**
- Review-to-commit ratio: high ratio → actively contributes to team quality
- Cross-team PR activity: reviews code outside own domain
- Response time to review requests
- Incorporating review feedback without argument
- @-mention patterns: helps others, answers questions

**Slack signals:**
- Responds to questions from teammates
- Shares relevant findings/learnings unprompted
- Participates in discussions rather than only broadcasting

**Scoring proxy:**
- 1: Only commits own code, rarely reviews, does not respond to others
- 3: Reviews own team's PRs, responds when directly asked
- 5: Proactively reviews widely, volunteers help, cross-functional participation

### Initiative / Proactiveness

**GitHub signals:**
- Self-assigned issue rate: picks up work without being assigned
- Issue creation rate: identifies and documents problems
- Opens PRs without being asked for improvements/refactors
- Responds to unowned issues (fixes bugs others reported)

**Scoring proxy:**
- 1: Only completes assigned tasks
- 3: Occasionally picks up additional work
- 5: Consistently identifies and addresses problems proactively

### Feedback Receptiveness

**GitHub signals:**
- Revision rate after code review: does PR get updated after reviewer comments?
- Response tone in review threads (requires NLP sentiment analysis)
- Number of review cycles per PR (lower is better — applies feedback effectively)
- "Thank you" acknowledgments in review comments (proxy for gracious acceptance)

**Scoring proxy:**
- 1: Rarely revises after reviews, defensive tone in comments
- 3: Revises when required but may debate unnecessarily
- 5: Quick iterations, acknowledges reviewer input, applies feedback across PRs not just the current one

### Conflict Navigation

**GitHub signals:**
- Sentiment in issue/PR discussion threads when disagreements arise
- Resolution patterns: does discussion reach consensus, or stall?
- Constructive tone: "I think X because Y" vs. "This is wrong"

**Slack signals:**
- Response to disagreements: does person de-escalate or escalate?
- Use of "we" vs. blame language

**Note:** Conflict navigation is the hardest to infer from artifacts and has highest false positive risk. Treat inferred scores here with high uncertainty margins.

### Mentorship

**GitHub signals:**
- Review comment helpfulness: does reviewer explain *why* as well as *what* to change?
- Comments that include code examples or links to documentation
- Response to questions from junior developers in issues/PRs
- Pairing patterns (commit co-authorship)

**Scoring proxy:**
- 1: No evidence of knowledge sharing
- 3: Answers direct questions but rarely volunteers teaching moments
- 5: Review comments consistently educational, creates documentation others can learn from

---

## Recommended Radar Axes for Soft Skills Layer

Eight axes based on research frequency and inference feasibility:

| # | Axis | What it measures | Inference feasibility |
|---|------|------------------|-----------------------|
| 1 | **Communication Clarity** | Written communication quality across PRs, issues, docs | High — directly measurable from text |
| 2 | **Collaboration** | Active participation in team quality; review contributions | High — measurable from review patterns |
| 3 | **Feedback Receptiveness** | Graceful handling of criticism; iteration speed | Medium — needs sentiment analysis |
| 4 | **Initiative** | Self-directed work; proactive problem identification | High — measurable from self-assignment, issue creation |
| 5 | **Mentorship** | Teaching orientation; knowledge sharing | Medium — review comment quality |
| 6 | **Adaptability** | Breadth of technologies contributed to over time | Medium — inferred from diversity of contributions |
| 7 | **Problem Framing** | Issue description quality; ability to define problems well | Medium — issue writing quality |
| 8 | **Conflict Navigation** | Constructive behavior in disagreements | Low — high noise, sentiment analysis needed |

**Recommendation:** Score axes 1–5 with higher confidence. Axes 6–8 should have wider uncertainty bands or require manual review validation.

---

## Scoring Rubric (1–5 scale, all axes)

| Score | Meaning |
|-------|---------|
| 1 | No observable evidence of this skill in artifact history |
| 2 | Rare or inconsistent evidence; skill present but not reliably demonstrated |
| 3 | Adequate — meets baseline expectations for role and seniority level |
| 4 | Consistently demonstrated; visible positive impact on team |
| 5 | Exceptional — proactive, high-quality, notably above peer group |

---

## Critical Ethical Constraints

1. **Soft skill inferences are proxies, not measurements.** No GitHub metric perfectly captures "communication skill" — treat all inferences as approximate signals requiring human review.
2. **Context dependence.** A developer with low PR description quality may be working in a team culture that doesn't value documentation — this reflects culture, not individual skill.
3. **Seniority calibration.** A junior developer scoring 3 on communication is performing well for their level; compare within seniority groups, not absolutely.
4. **Language bias.** Non-native English speakers may score lower on "communication clarity" in English codebases — flag language as a moderating factor.
5. **Visibility limited to BOD.** Soft skill inferences are particularly sensitive — never expose raw scores to individuals without framing and context.

---

## Citations

1. Capretz, L. F., & Ahmed, F. (2019). A Call to Promote Soft Skills in Software Engineering. *arXiv:1901.01819*.
2. Groeneveld, W., Vennekens, J., & Aerts, K. (2019). Software Engineering Education Beyond the Technical: A Systematic Literature Review. *arXiv:1910.09865*.
3. da Silva, F. Q. B., França, A. C. C., Kalinowski, M., & Mendes, E. (2019). A Systematic Mapping Study on Soft Skills in Software Engineering. *EASE 2019*.
4. Skills development for software engineers: Systematic literature review. (2024). *Information and Software Technology*. DOI: 10.1016/j.infsof.2023.107225.
