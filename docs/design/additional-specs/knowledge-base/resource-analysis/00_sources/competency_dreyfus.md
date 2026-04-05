---
source: "Dreyfus Model + Engineering Competency Frameworks — Composite"
papers:
  - title: "A Five-Stage Model of the Mental Activities Involved in Directed Skill Acquisition"
    authors: ["Stuart E. Dreyfus", "Hubert L. Dreyfus"]
    venue: "University of California Berkeley Operations Research Center"
    year: 1980
  - title: "Mind over Machine: The Power of Human Intuition and Expertise in the Era of the Computer"
    authors: ["Hubert L. Dreyfus", "Stuart E. Dreyfus"]
    venue: "Free Press"
    year: 1986
  - title: "Developer Competency Framework: Dreyfus Model for Performance Reviews"
    url: "https://www.blik360.com/dreyfus-model/"
    type: industry_framework
  - title: "T-Shaped Skills Model"
    url: "https://www.alci.dev/en/que-es/t-shaped"
    type: industry_framework
  - title: "Skills Framework for the Information Age (SFIA)"
    url: "https://sfia-online.org"
    version: "SFIA 8"
    type: industry_standard
type: composite_source
relevance: resource_analysis
---

# Competency Frameworks for Software Engineers: Dreyfus, T-Shaped Skills, and SFIA

## The Dreyfus Model of Skill Acquisition

Originally developed by Stuart and Hubert Dreyfus (1980) in the context of chess players and airline pilots, the Dreyfus model describes **five stages of progression** from novice to expert. The model is now foundational in engineering competency frameworks worldwide.

### The Five Levels

| Level | # | Thinking Style | Decision-making | Characteristic behaviour |
|-------|---|----------------|-----------------|--------------------------|
| **Novice** | 1 | Rule-based, context-free | Follows instructions literally | Needs step-by-step guidance; cannot handle unexpected situations |
| **Advanced Beginner** | 2 | Recognizes recurrent patterns | Applies situational judgment | Starts to see meaningful aspects of situations; still relies on rules |
| **Competent** | 3 | Builds deliberate mental models | Plans and prioritizes features | Chooses approach consciously; goal-oriented; feels responsibility |
| **Proficient** | 4 | Holistic situational perception | Intuition guides, then deliberation | Immediately struck by the right approach; can deviate from rules wisely |
| **Expert** | 5 | Fluid, intuitive perception-response | Deep situational mastery | Sees intuitively what to do; rules feel like "training wheels" |

### What Changes Between Levels

| Dimension | Novice → Expert transition |
|-----------|---------------------------|
| Rules | Strict adherence → fluid, context-aware deviation |
| Context | Context-free → deeply context-sensitive |
| Decision | Analytical → intuitive |
| Problem size | Small, well-defined → large, ill-defined, novel |
| Error handling | Needs external help → self-corrects automatically |

---

## Engineering Competency Matrix

### Mapping Dreyfus Levels to Engineering Career Stages

| Dreyfus Level | Typical Engineering Title | Autonomy |
|---------------|--------------------------|---------|
| Novice | Intern, Junior I | Needs pairing |
| Advanced Beginner | Junior II, Mid I | Works with guidance |
| Competent | Mid II, Senior I | Works independently |
| Proficient | Senior II, Staff | Guides others |
| Expert | Principal, Distinguished | Sets direction |

### 10-Dimension Competency Framework (from blik360 industry synthesis)

| # | Dimension | What it measures |
|---|-----------|-----------------|
| 1 | **Technical Proficiency** | Code quality, problem-solving ability, technical depth in primary domain |
| 2 | **Technical Breadth** | Cross-domain knowledge; ability to work across stack layers |
| 3 | **Engineering Maturity** | Consistent use of testing, design patterns, SOLID principles, agile disciplines |
| 4 | **Pragmatism** | Balancing technical ideals with business constraints; knowing when "good enough" is right |
| 5 | **Team Cooperation** | Mentoring, code review quality, force multiplication (does presence make others better?) |
| 6 | **Communication** | Explaining technical concepts to varied audiences; written and verbal clarity |
| 7 | **Personality & Collaboration** | Teamwork, interpersonal dynamics, cultural adaptability |
| 8 | **Intrinsic Motivation** | Passion and curiosity beyond compensation; self-driven learning |
| 9 | **Growth Potential** | Learning velocity, feedback responsiveness, adaptability to change |
| 10 | **Strategic Vision** | Product thinking, architectural foresight, business impact awareness |

### Code Quality Indicators by Dreyfus Level

| Level | Code characteristics |
|-------|---------------------|
| Novice (1) | Works for happy path; hard-coded values; minimal error handling; no tests |
| Advanced Beginner (2) | Follows style guides; basic error handling; readable; some tests |
| Competent (3) | Well-structured modules; comprehensive error handling; edge cases; good test coverage |
| Proficient (4) | Clear separation of concerns; excellent coverage; self-documenting; SOLID applied |
| Expert (5) | Elegant, reusable; deep performance/maintainability tradeoffs; designs for unknowns |

---

## Core Competency Radar Axes for Technical Assessment

Based on Dreyfus + industry competency matrix, the recommended 8 technical axes:

| # | Axis | Dreyfus stage 1 (score 1) | Dreyfus stage 5 (score 5) |
|---|------|--------------------------|--------------------------|
| 1 | **Coding / Implementation** | Syntax-level correctness, happy path only | Elegant, reusable, performant solutions |
| 2 | **System Design** | Cannot design beyond feature scope | Designs scalable, evolvable systems |
| 3 | **Debugging / Problem-solving** | Needs help beyond simple bugs | Diagnoses complex, multi-system failures independently |
| 4 | **Testing & QA** | No tests or only happy-path tests | TDD, property-based testing, chaos testing awareness |
| 5 | **Architecture Thinking** | Follows existing patterns | Proposes and evaluates architectural trade-offs |
| 6 | **DevOps / Delivery** | Cannot deploy independently | Owns full delivery pipeline, monitors production |
| 7 | **Security & Reliability** | Unaware of security concerns | Proactively designs for security, failure modes |
| 8 | **Domain / Business Knowledge** | No domain understanding | Deep business domain expertise, translates to technical decisions |

---

## T-Shaped Skills Model

The T-shaped model visualizes the **shape of a developer's knowledge profile**:

```
← Breadth (horizontal bar) →
Frontend  Backend  Data  Infra  Mobile  QA  PM
  ○         ●         ○      ○       ○      ○    ○
            │
            │  ← Depth (vertical bar)
            │
          [Deep Backend Expertise]
```

- **Horizontal bar:** Sufficient knowledge in adjacent domains to collaborate, understand, and contribute modestly
- **Vertical bar:** Deep expertise in 1–2 domains — the area of primary value

### Why T-Shape Matters for Staffing

| Profile | Best fit |
|---------|---------|
| Deep vertical, narrow horizontal | Specialist tasks; platform, core infra |
| Broad horizontal, no depth | Risk: generalist who can't lead any domain |
| Strong T-shape | Cross-functional product teams, tech lead roles |
| π-shape (two deep pillars) | Senior specialists, architects |

### Radar Representation

A radar chart naturally visualizes T-shaped profiles:
- High spikes on 1–2 axes = depth
- Consistent moderate scores across all axes = breadth
- Gaps (score 1–2 on some axis) = potential risk if project requires that domain

---

## SFIA — Skills Framework for the Information Age

SFIA is an internationally recognized framework (SFIA 8, maintained by BCS/ISACA) that defines **IT skills at 7 responsibility levels**:

| SFIA Level | Description | Equivalent |
|------------|-------------|------------|
| 1 | Follow — executes under close supervision | Intern |
| 2 | Assist — executes with limited supervision | Junior |
| 3 | Apply — work independently on routine tasks | Mid |
| 4 | Enable — influences team, handles complex tasks | Senior |
| 5 | Ensure & Advise — owns outcomes, guides others | Staff/TL |
| 6 | Initiate & Influence — organizational impact | Principal |
| 7 | Set Strategy & Inspire — enterprise-level influence | VP/CTO |

SFIA complements Dreyfus by providing a **structured catalog of specific skills** (over 120 skill categories) with level descriptors. Most relevant for our system: SFIA levels 2–5 cover the majority of developer profiles.

---

## Inferring Competency Level from GitHub Artifacts

| Competency axis | GitHub signal | Inference approach |
|-----------------|--------------|-------------------|
| Coding / Implementation | PR complexity, diff size, code structure | Analyze PR diffs for structural patterns, not just LOC |
| System Design | PR scope (touches multiple services), architecture comments in PRs | Design-level PRs vs. feature-level PRs ratio |
| Debugging | Issues closed by person, complex bug fix PRs | Analyze resolved issue complexity |
| Testing | Test file ratio, test quality (coverage breadth) | Files changed ratio: test vs. implementation |
| Architecture Thinking | Review comments on design choices, RFC/ADR authorship | Look for review comments discussing "why" not just "what" |
| DevOps / Delivery | CI/CD config PRs, infra code contributions | Presence of workflow/pipeline file changes |
| Security | Security-related PR labels, SAST discussion | Keywords in PRs, security-focused review comments |
| Domain Knowledge | Consistency of contributions to same subdomain | Repo/path clustering of contributions |

---

## Scoring Rubric (1–5 all axes)

| Score | Dreyfus equivalent | Typical behavior |
|-------|-------------------|-----------------|
| 1 | Novice | Follows rules, cannot handle unknowns, needs pairing |
| 2 | Advanced Beginner | Recognizes patterns, works with guidance, some autonomy |
| 3 | Competent | Works independently on well-defined tasks, meets team standards |
| 4 | Proficient | Guides others, handles ambiguity, improves team practices |
| 5 | Expert | Sets direction, innovative solutions, organizational impact |

---

## Citations

1. Dreyfus, S. E., & Dreyfus, H. L. (1980). *A Five-Stage Model of the Mental Activities Involved in Directed Skill Acquisition*. University of California Berkeley Operations Research Center.
2. Dreyfus, H. L., & Dreyfus, S. E. (1986). *Mind over Machine*. Free Press.
3. Blik360. (2024). Developer Competency Framework: Dreyfus Model for Performance Reviews. https://www.blik360.com/dreyfus-model/
4. SFIA Foundation. (2021). *Skills Framework for the Information Age — SFIA 8*. https://sfia-online.org
