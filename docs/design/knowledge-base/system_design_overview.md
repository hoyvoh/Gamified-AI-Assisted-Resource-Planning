---
title: "Knowledge Base System Design Overview"
type: system_design
version: "1.0"
date: "2026-03-27"
sources:
  - "project-analysis/01_project_analysis_methodology.md"
  - "project-analysis/02_project_radar_scoring_matrix.md"
  - "resource-analysis/01_resource_profile_methodology.md"
  - "resource-analysis/02_resource_radar_scoring_matrix.md"
  - "resource-analysis/03_data_collection_pipeline.md"
target_users:
  - PM/TL: "Project analysis (Pillar 1)"
  - BOD: "Resource profiling (Pillar 2)"
ai_role: "Decision support only — never makes investment or HR decisions"
---

# Knowledge Base System Design Overview

## System Purpose

This system provides two AI-assisted decision support pillars for the gamified resource planning platform:

| Pillar | Question answered | Primary user |
|--------|------------------|-------------|
| **Pillar 1 — Project Analysis** | Should we build this? How risky is it? How does it rank against alternatives? | PM / Tech Lead |
| **Pillar 2 — Resource Analysis** | Who should work on this? What is each developer's capability profile? | BOD only |

The two pillars are designed to **feed into each other**: project analysis output (required skills, risk profile, timeline) directly informs resource allocation decisions, and resource profiles inform which projects a team can realistically take on.

---

## User Journey A: Project Analysis (PM/TL)

### Trigger

PM wants to evaluate a proposed project before committing resources. This may be:
- A new product initiative proposed by stakeholders
- A technical improvement initiative proposed by the engineering team
- A portfolio prioritization exercise (comparing multiple candidates)

### Journey Steps

```
1. PM opens Project Analysis module
   → Selects: "Evaluate new project" or "Add to portfolio comparison"

2. PM enters project brief
   → Required fields: title, problem statement, solution description,
                      target users, success criteria, rough timeline
   → Optional: existing architecture notes, stakeholder list

3. System performs Layer 1 assessment (AI-assisted)
   → AI reads brief and prompts for missing elements
   → AI suggests assumption list from problem statement analysis
   → PM fills structured scoring form (L1: Problem-Solution Fit, Success Criteria)

4. PM and Tech Lead fill TELOS assessment (Layer 2)
   → Structured form for T, E, L, O, S sub-dimensions
   → Hard gate check runs automatically
   → If any dimension = 1: system surfaces warning and blocks progression

5. Tech Lead fills Architecture assessment (Layer 3)
   → Quality attribute prioritization (ISO 25010 checklist)
   → Architecture decision mapping
   → Risk identification with mitigation prompts

6. PM fills MCDA criteria scoring (Layer 4)
   → Strategic value, ROI, portfolio fit
   → If portfolio comparison mode: multiple projects scored in parallel

7. PM + TL fill Readiness assessment (Layer 5)
   → TRL, ORL, LRL, IRL, DRL

8. System generates output
   → Radar chart (10 axes, 1–5)
   → Composite score + weighted breakdown
   → Verdict label (Proceed / Conditional / Do Not Proceed)
   → Risk register (populated from low-scoring axes)
   → If portfolio mode: TOPSIS-ranked project list with CC scores

9. PM reviews and exports
   → PDF report for stakeholder sharing
   → Data persisted for historical comparison
```

### AI Touchpoints in Journey A

| Step | AI assistance |
|------|-------------|
| Brief analysis | Identifies missing required elements; suggests improvement |
| Assumption extraction | Prompts for assumptions not mentioned in brief |
| Risk pattern matching | Flags common anti-patterns based on architecture description |
| Scoring consistency | Flags if scoring is internally inconsistent (e.g., T=5 but S=1 due to team skill gap) |
| Historical comparison | Compares against past projects with similar profiles and their outcomes |
| Report drafting | Auto-populates risk register from scoring rationale |

**AI does NOT:** Set scores, override human scores, make go/no-go decisions, or access confidential data.

---

## User Journey B: Resource Analysis (BOD)

### Trigger

BOD needs to make a resource allocation decision:
- Assign developers to a newly approved project
- Identify growth investment candidates
- Assess team composition for an upcoming initiative
- Review developer capability profile before a promotion decision

### Journey Steps

```
1. BOD opens Resource Analysis module (BOD-only access)

2. System shows current developer roster
   → Each developer card shows: radar thumbnail (5 layers), last updated date,
     flags (if any), WFU multiplier estimate

3. BOD selects a developer for detailed view
   → Full 5-radar profile: OCEAN, Behavioral, Technical, Soft Skills, Performance
   → Layer-by-layer breakdown with confidence indicators
   → Trend charts (6-month and 12-month trajectory)
   → Flags panel (burnout risk, low confidence, human review needed)

4. BOD selects a project (from Pillar 1 output) to match against
   → System shows skill requirements from project analysis
   → Generates match score for each developer against project requirements
   → Highlights gaps between developer profile and project needs

5. BOD reviews team composition options
   → System suggests team configurations optimizing for:
     (a) Skill coverage of project requirements
     (b) OCEAN compatibility (collaborative team composition)
     (c) WFU budget efficiency
     (d) Growth opportunity alignment

6. BOD makes staffing decision (human decision, AI supports)
   → Decision logged in audit trail

7. Data collection pipeline runs (quarterly / on-demand)
   → BOD can trigger manual collection update for specific developer
   → System runs pipeline, generates updated profile
   → Changes highlighted vs. previous profile
```

### AI Touchpoints in Journey B

| Step | AI assistance |
|------|-------------|
| Profile summarization | Natural language summary of each developer's profile |
| Project-developer matching | Cosine similarity scoring against project requirements vector |
| Team composition | Multi-constraint optimization suggesting team configurations |
| Anomaly detection | Flags unusual patterns (score drops, burnout signals, profile drift) |
| Growth recommendation | Identifies what project assignment would best accelerate a developer's growth |
| Tenure risk | Flags if developer profile shows disengagement signals |

**AI does NOT:** Make hiring/firing/promotion decisions, override BOD judgment, share profile data outside BOD context.

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   PILLAR 1: PROJECT ANALYSIS             │
│                                                          │
│  PM/TL Input → [5-Layer Scoring Engine] → Radar + Score │
│                         ↓                               │
│              [Project Requirements Vector]               │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼ (required skills, risk profile, timeline)
┌─────────────────────────────────────────────────────────┐
│                   PILLAR 2: RESOURCE ANALYSIS            │
│                                                          │
│  GitHub CLI ─┐                                           │
│  Slack API  ─┤→ [Data Pipeline] → [Feature Extraction]  │
│              │         ↓                                 │
│              │  [5-Layer Profile Engine]                 │
│              │         ↓                                 │
│              └→ Developer Profiles (BOD-only)            │
│                         ↓                               │
│              [Project-Developer Match Engine]            │
│                         ↓                               │
│              Team Composition Recommendations            │
└─────────────────────────────────────────────────────────┘
```

### Data Sources by Layer

| Data source | Layer fed | Frequency |
|-------------|-----------|-----------|
| GitHub PRs (authored) | L1 OCEAN, L4 Soft Skills, L5 Delivery | Quarterly batch |
| GitHub Reviews (given) | L4 Soft Skills (Collaboration, Mentorship) | Quarterly batch |
| GitHub Commits | L5 Performance (Work rhythm, Burnout signals) | Monthly batch |
| GitHub Issues | L1 OCEAN (Problem Framing), L4 Initiative | Quarterly batch |
| GitHub Review Comments | L4 Communication, L3 Technical | Quarterly batch |
| Slack Messages | L1 OCEAN (supplementary) | Quarterly batch |
| PM/TL input (Pillar 1) | Project requirements vector | Per evaluation |

---

## Architecture Integration Points

### Integration with Existing System

The knowledge base layer integrates with the existing gamified resource planning stack:

```
Next.js 15 (Frontend)
    │
    ├── /project-analysis route → Project scoring UI (Journey A)
    │       Uses: Three.js for radar chart visualization
    │
    └── /resource-analysis route → Developer profile UI (Journey B, BOD-only)
            Uses: Three.js for 5-radar profile visualization

FastAPI (Backend)
    │
    ├── POST /api/projects/evaluate → 5-layer scoring engine
    ├── GET  /api/projects/{id}/radar → Radar chart data
    ├── GET  /api/developers/{id}/profile → Full 5-layer profile (BOD-only)
    ├── POST /api/developers/match → Project-developer matching
    └── POST /api/pipeline/run → Trigger data collection pipeline

PostgreSQL (Database)
    ├── project_evaluations table → Layer scores, verdicts, history
    ├── developer_profiles table → Current profile per developer
    ├── profile_history table → Snapshot per update cycle
    └── audit_log table → All profile changes with timestamp + operator

Claude API
    ├── Brief analysis (Journey A, Step 3)
    ├── Assumption extraction (Journey A)
    ├── OCEAN inference from corpus (Journey B, Layer 1)
    ├── LLM-based quality signals (Journey B, Stages 4–5)
    └── Profile summarization (Journey B, Step 3)

External (data collection only, not real-time)
    ├── GitHub CLI (gh) → REST + GraphQL API calls
    └── Slack API / Export → Channel message extraction
```

### Access Control

| Role | Access |
|------|--------|
| **BOD** | Full access: both pillars, all developer profiles, pipeline triggers |
| **PM** | Pillar 1 full access; Pillar 2 read-only aggregate (no individual profiles) |
| **Tech Lead** | Pillar 1 full access; Pillar 2 read own profile only |
| **Developer** | None by default; can request own profile view (right to access) |
| **Manager** | No access to Pillar 2 (individual profiles never visible to managers) |

---

## AI Model Configuration

### Model Selection

```
Model: claude-sonnet-4-6 (claude-sonnet-4-6)

Rationale:
  - Strong analytical and structured reasoning for scoring rubric application
  - Large context window for processing PR/review corpus
  - JSON output reliability for structured signal extraction
  - Cost-effective for quarterly batch processing

Alternative (higher quality, higher cost):
  - claude-opus-4-6 for OCEAN inference (higher quality NLP analysis)
  - Use only for developers with >= 500 message corpus
```

### Prompt Design Principles

1. **Structured output:** All AI calls return JSON for deterministic downstream processing
2. **Calibrated uncertainty:** Prompt explicitly asks for confidence scores, not just point estimates
3. **Rubric-anchored:** Scoring prompts include the full rubric text to prevent AI drift
4. **Few-shot examples:** Include 2–3 examples of high/medium/low scores before the target
5. **Audit trail:** All AI inference calls are logged with prompt hash, model version, response

### Hallucination Mitigations

| Risk | Mitigation |
|------|-----------|
| AI invents GitHub signals | Provide explicit extracted signals as JSON; AI only interprets, doesn't access raw data |
| AI overconfident on low-signal axes | Require confidence score; apply regression-to-mean for confidence < 0.5 |
| AI scores drift across updates | Store rubric hash; flag when rubric version changes |
| AI output inconsistency | Use temperature=0 for scoring calls; structured JSON output format enforced |

---

## Key Design Decisions

### Decision 1: 5 Separate Radars vs. 1 Unified Radar

**Chosen:** 5 separate radars (one per layer)
**Rationale:** The layers measure fundamentally different things (stable personality traits vs. dynamic performance). Combining them into one score would obscure important nuance. BOD needs to see each dimension independently to make good decisions.

### Decision 2: GitHub-Primary with Slack-Supplementary

**Chosen:** GitHub is the primary data source; Slack is optional supplement
**Rationale:** GitHub provides the richest behavioral record with inherent structure. Slack adds OCEAN signal volume but has higher privacy sensitivity. The system should function without Slack access.

### Decision 3: Batch Collection vs. Real-Time Monitoring

**Chosen:** Batch (quarterly full + monthly performance)
**Rationale:** Real-time monitoring is surveillance; batch collection is proportionate. Quarterly is sufficient for planning decisions; monthly performance metrics meet operational needs without continuous surveillance.

### Decision 4: LLM-Based OCEAN vs. Re-training MLA-OCEAN

**Chosen:** LLM-based inference (Claude) using MLA-OCEAN linguistic markers as guides
**Rationale:** Training the full MLA-OCEAN GRU model requires the original training weights (not publicly available) and labeled personality data. LLM-based inference using the published linguistic markers achieves practical utility without requiring training infrastructure. Lower accuracy than original model but operationally viable.

### Decision 5: WFU Multiplier as Composite (not simple seniority mapping)

**Chosen:** `WFU_effective = base × familiarity × tech_match × quality × reliability`
**Rationale:** Research shows years-of-experience is a weak proxy for code quality and delivery reliability. The multi-factor WFU formula incorporates the dimensions that actually predict delivery outcomes (project familiarity, technology match, quality history).

---

## Limitations and Known Gaps

| Limitation | Impact | Mitigation |
|-----------|--------|-----------|
| GitHub activity only reflects visible work | Developers doing high-value mentoring, meetings, planning may score lower on activity-based signals | Human validation required; supplement with self/peer assessment |
| Non-native English speakers score lower on communication clarity | Systematic bias against non-native speakers | Language barrier flag triggers calibration adjustment |
| New team members have thin profiles | Low confidence scores for first 3 months | Require longer observation window before acting on profile |
| Small teams with few repos limit signal diversity | Low accuracy for specialized developers with narrow contribution surface | Flag minimum corpus size; defer low-confidence decisions |
| AI inference inherits training biases | Unknown biases in Claude's language understanding | Regular bias audits; human review for flagged edge cases |
| Slack data may not be available | OCEAN corpus smaller for non-Slack orgs | System designed to function GitHub-only; note reduced OCEAN confidence |

---

## Success Metrics for the System

| Metric | Target | Measurement |
|--------|--------|------------|
| Project evaluation completion rate | > 80% of proposed projects evaluated before resource commitment | Tracking in project evaluations table |
| Profile coverage | > 90% of active developers have a current profile (< 120 days old) | Profile freshness monitoring |
| BOD satisfaction with profiles | > 4/5 in quarterly review | BOD survey |
| False positive rate on burnout flags | < 15% (flag triggered but no burnout occurred) | Retrospective review |
| WFU estimate accuracy | Estimates within ±25% of actual for > 70% of projects | Post-project comparison |
| Time to team composition decision | < 2 hours from project approval to staffing proposal | Process timing |
