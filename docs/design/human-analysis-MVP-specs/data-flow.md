# Data Flow Spec

**Developer Growth & Evidence-Based Performance Insight Platform — MVP**

---

## 1. End-to-End Data Flow Overview

```
User triggers analysis
        ↓
[1] Analysis Run created (status: pending)
        ↓
[2] Data Collection
    Raw source records collected from integrations
        ↓
[3] Evidence Extraction (P1 + P2)
    Raw records → EvidenceUnits → BehavioralEvents (deduplicated)
        ↓
[4] Dimension Inference (P3)
    BehavioralEvents → DimensionSignals (per dimension)
        ↓
[5] Scoring (Scoring Engine)
    DimensionSignals → DimensionScores + CategoryScores
        ↓
[6] Human Output Generation (P4 + P5 + P6 + P7)
    Scores → UI summaries, KPT, CaseFeedback, Overview/Journey text
        ↓
[7] Self-Critique (P8)
    Final output → overclaim / hallucination check → patch if needed
        ↓
[8] Persist AnalysisSnapshot
    All outputs stored; status → completed
        ↓
[9] UI renders profile tabs
```

---

## 2. Phase-by-Phase Detail

---

### Phase 1 — Analysis Run Creation

**Trigger:** User clicks Refresh or triggers new analysis.

**Input:**
- `member_id`
- `period_start`, `period_end`
- `run_type`

**Validation (app layer):**
- Period must not exceed 365 days
- No other active run for this member

**Output:**
- `AnalysisRun` record with `status = 'pending'`
- 202 Accepted returned to client
- Job enqueued for background processing

---

### Phase 2 — Data Collection

**Status update:** `collecting`

#### Data Collection Architecture — CLI-First

The backend **never makes direct HTTP connections to external services** (GitHub, Slack, Confluence, Jira). All data is collected via CLI tools that the operator has already authenticated. This eliminates token management inside the application.

**GitHub** — via `gh` CLI:
```
gh api /users/{handle}/events --paginate
gh api /users/{handle}/repos --paginate
```
The `gh` CLI must be authenticated on the host machine (`gh auth login`). The backend calls it as a subprocess. If `gh auth status` fails, the GitHub source is skipped with a logged warning.

**Slack / Confluence / Jira / other** — via LLM CLI + MCP:
The backend calls the LLM CLI (e.g. `claude -p "..."`) and instructs it to use its configured MCP servers to fetch activity for the member within the period. The LLM handles the actual MCP tool calls and returns structured JSON. The backend never holds Slack/Confluence/Jira tokens — the LLM CLI's MCP configuration does.

**MCP probe** (at collection start):
```bash
claude mcp list          # lists configured MCP server names
```
The runner reads this output to know which sources are available before constructing the collection prompt.

**Collection prompt sent to LLM CLI:**
```
Collect developer activity for:
  Name: {display_name}
  GitHub: {external_id}
  Period: {period_start} to {period_end}

Using your available MCP tools, collect messages, documents, and tickets
for this person in this period. Return ONLY a JSON object:
{
  "sources_queried": [...],
  "records": [{"source": "...", "type": "...", "content": "...", "timestamp": "...", "metadata": {...}}],
  "unavailable_sources": [...],
  "notes": "..."
}
```

**Process:**
1. Load member context (role profile, previous run refs)
2. Probe available CLI tools: `gh auth status`, `claude mcp list`
3. **GitHub source**: run `gh api` subprocesses; parse JSON output into records
4. **MCP sources**: send structured prompt to `claude -p "..."`; parse JSON response
5. Normalize raw data into `RawSourceRecord` format
6. Group into `SourcePayload` batches by source type
7. Store `SourcePayload` records

**Output:**
- `SourcePayload` records persisted (one per source type)
- Batched `RawSourceRecord` objects ready for P1

**Failure behavior:**
- `gh` not authenticated: skip GitHub, log `"GitHub CLI not authenticated — skipping"`
- LLM CLI not found: skip MCP sources, log `"LLM CLI unavailable — skipping MCP sources"`
- Individual source timeout (>60s): log warning, proceed with remaining sources
- If no sources return any records: set `status = 'failed'` with descriptive message

---

### Phase 3 — Evidence Extraction (P1 + P2)

**Status update:** `analyzing` (substage: `extracting_evidence`)

#### P1 — Behavioral Event Extraction

Run **per chunk** (10–40 raw records grouped by thread/artifact/workstream):

**Input:**
```json
{
  "member_id": "...",
  "role_name": "...",
  "period": { "start": "...", "end": "..." },
  "raw_records": [...]
}
```

**Process:**
- LLM extracts behavioral events from each chunk
- Each event: type, summary, polarity, confidence, related dimensions
- Zero, one, or multiple events per record

**Output:** `BehavioralEvent` candidates (JSON array)

#### P2 — Event Consolidation / Dedup

Run **once** on the merged P1 output:

**Input:** All P1 candidate events

**Process:**
- Merge near-duplicate events
- Remove low-value / overly redundant events
- Preserve source traceability

**Output:** Cleaned `BehavioralEvent` set → persisted to DB

---

### Phase 4 — Dimension Inference (P3)

**Substage:** `inferring_dimensions`

Run **per dimension** (or per small group of 3–5 related dimensions):

**Input per call:**
```json
{
  "dimension_id": "...",
  "dimension_description": "...",
  "role_profile_summary": "...",
  "baseline_summary": "...",
  "dimension_related_events": [...]
}
```

**Process:**
- LLM infers maturity state, positive/negative patterns, opportunity, confidence
- Returns structured JSON

**Output per dimension:**
```json
{
  "dimension_id": "...",
  "observed_pattern_summary": "...",
  "positive_indicators": [...],
  "development_indicators": [...],
  "counter_evidence_or_limitations": [...],
  "opportunity_assessment": { "label": "...", "reason": "..." },
  "maturity_state": "reliable",
  "confidence_label": "moderate",
  "confidence_score": 0.68,
  "top_supporting_event_ids": [...],
  "top_counter_event_ids": [...]
}
```

→ Used to compute `DimensionSignal` records

---

### Phase 5 — Scoring (Scoring Engine)

**Substage:** `scoring`

Runs deterministically (no LLM calls) on P3 output:

#### 5.1 Signal Mass Computation

For each signal:
```
SignalMass =
  signal_strength × signal_specificity × signal_confidence
  × event_confidence × evidence_strength × evidence_directness
  × evidence_specificity × recency_weight × opportunity_adjustment
```

**Recency weights:**
- 0–90 days: 1.00
- 91–180 days: 0.85
- 181–365 days: 0.65

#### 5.2 Dimension Score Computation

```
RawSignalBalance = PositiveMass - NegativeMass
normalized_score = clamp(3 + 2 * tanh(balance), 1, 5)
```

Maturity mapping:
- 1.0–1.9 → emerging
- 2.0–2.7 → developing
- 2.8–3.5 → reliable
- 3.6–4.3 → strong
- 4.4–5.0 → advanced

#### 5.3 Opportunity Gate

```
If OpportunityScore < 0.25:
  maturity_level = "insufficient_opportunity"
  normalized_score = null
```

#### 5.4 Confidence Score

```
ConfidenceScore =
  0.30 * EvidenceSufficiency
  + 0.30 * PatternConsistency
  + 0.20 * ContextDiversity
  + 0.20 * CrossSignalAgreement
```

Labels: 0–0.39 = low, 0.40–0.69 = moderate, 0.70–1.00 = high

#### 5.5 Delta Computation

```
DeltaValue = current_normalized_score - previous_normalized_score

>= +0.40 → improved
-0.39 to +0.39 → stable
no previous, new signal present → emerging
<= -0.40 → regressing
no valid comparison → not_enough_comparison
```

#### 5.6 Category Scoring

```
CategoryScore = weighted_average(
  valid_dimension_scores,
  role_adjusted_dimension_weights
)
```

Only includes dimensions with sufficient opportunity and valid scores.

**Default category weights (adjustable by role):**

| Category | Default Weight |
|----------|---------------|
| Core Technical Execution | 30% |
| Domain Technical Capability | 30% |
| Technical Mindset | 20% |
| Professional & Team Effectiveness | 20% |

**Output:** `DimensionScore` and `CategoryScore` records persisted.

---

### Phase 6 — Human Output Generation

**Substage:** `generating_kpt`, `generating_cases`, `generating_overview`

#### P4 — Dimension UI Summary

Run per dimension. Converts P3 inference JSON into human-readable UI summary text (2–4 sentences). Non-judgmental, fair tone.

#### P5 — KPT Generation

**Input:** Top strengths, top growth areas, repeated patterns, role context, confidence notes.

**Output:**
- 3–5 Keep items (with linked dimensions + evidence)
- 3–5 Problem items (with frequency/confidence)
- 3–5 Try items (actionable experiments mapping to problems)
- 1–2 Development focus themes

Persisted as `KPTItem` records.

#### P6 — Case-Based Feedback Generation

**Input:** Behavioral events, dimension summaries, pattern clusters.

**Output:** 3–8 case feedback items with:
- What happened / why it matters / observed pattern / better alternative / next-time guidance

Persisted as `CaseFeedback` records.

#### P7 — Overview + Journey Summary

**Input:** Dimension scores, category scores, top strengths, top growth areas, milestone history.

**Output:**
- Profile summary (3–5 sentences, Tab 1)
- Growth journey summary (2–4 sentences, Tab 5, if historical data available)
- Current growth path archetype (nullable)

---

### Phase 7 — Self-Critique (P8)

**Substage:** `self_checking`

**Input:**
- All dimension scores + confidence
- All generated summaries (P4, P5, P6, P7 outputs)
- Supporting event coverage index

**Process:**
- LLM audits final output for:
  - Unsupported claims
  - Overclaiming from weak evidence
  - Unfair inferences from absence of evidence
  - Dimensions that should be marked insufficient instead of scored

**Output:**
```json
{
  "overall_profile_risk": "low | moderate | high",
  "issues": [
    {
      "issue_type": "overclaim | insufficient_opportunity_misclassification | unfair_inference",
      "target": "...",
      "problem": "...",
      "recommended_fix": "..."
    }
  ],
  "approved": true | false
}
```

**Decision rule:**
- If `approved = false`: apply recommended patches (adjust wording / suppress scores)
- Retry P8 once after patching
- If still not approved: persist with `p8_approved = false` and `p8_issues` populated (human review recommended)

---

### Phase 8 — Persist AnalysisSnapshot

**Substage:** `persisting`

1. Assemble `AnalysisSnapshot` object from all outputs
2. Derive milestone candidates from high-impact event clusters
3. Persist / append new `Milestone` records (never overwrite existing)
4. Update `AnalysisRun.status = 'completed'`, set `completed_at`
5. On same-period refresh: overwrite snapshot, overwrite scores/KPT/cases, preserve flags

---

## 3. Data Flow Diagram (text representation)

```
USER
  │ triggers analysis
  ▼
[API: POST /analysis-runs]
  │ creates AnalysisRun (pending)
  ▼
[Job Queue]
  │
  ├─► [Data Collector]
  │     │ pulls raw records from integrations
  │     ▼ SourcePayload, RawSourceRecord
  │
  ├─► [P1: Evidence Extraction] (per chunk, parallel)
  │     │ raw records → candidate BehavioralEvents
  │     ▼
  │   [P2: Event Consolidation]
  │     │ deduplicated BehavioralEvents → DB
  │     ▼
  │   [Scoring Engine: Signal Mapping]
  │     │ events → DimensionSignals → DB
  │     ▼
  │   [P3: Dimension Inference] (per dimension, parallel)
  │     │ events → dimension inference JSON
  │     ▼
  │   [Scoring Engine: Score Computation]
  │     │ DimensionScores, CategoryScores → DB
  │     ▼
  ├─► [P4: Dimension UI Summaries] (per dimension, parallel)
  │     ▼
  ├─► [P5: KPT Generation]
  │     ▼ KPTItems → DB
  ├─► [P6: Case Feedback Generation]
  │     ▼ CaseFeedbacks → DB
  ├─► [P7: Overview + Journey Summary]
  │     ▼
  └─► [P8: Self-Critique]
        │ patch if needed
        ▼
  [AnalysisSnapshot assembled → DB]
  [Milestones derived → DB (append only)]
  [AnalysisRun.status = completed]

USER
  │ polls GET /analysis-runs/:id
  │ → status: completed
  │ → fetches profile tabs
  ▼
[Profile Tab APIs → read from DB]
```

---

## 4. Intermediate Artifact Storage Strategy

| Artifact | Storage | Retention |
|----------|---------|-----------|
| Raw source records | In-memory during run only (not persisted to DB) | Discarded after evidence extraction |
| P1 candidate events | In-memory / temp file | Used by P2, then discarded |
| P2 consolidated events | DB (`behavioral_events`) | Retained per run |
| P3 dimension inference JSON | In-memory | Used by scoring engine and P4 |
| P4 UI summaries | Stored in `dimension_scores.ui_summary` | Retained |
| P5 KPT output | DB (`kpt_items`) | Retained |
| P6 case feedback | DB (`case_feedbacks`) | Retained |
| P7 overview/journey | DB (`analysis_snapshots`) | Retained |
| P8 issues | DB (`analysis_snapshots.p8_issues`) | Retained |
| Milestones | DB (`milestones`) | Long-term, append-only |

---

## 5. Refresh Flow

### Same-period refresh

```
User clicks Refresh with same date range
  ↓
POST /analysis-runs (run_type: refresh_same_period)
  ↓
New AnalysisRun created
  ↓
Pipeline runs again (full re-collection + re-analysis)
  ↓
Persisting phase:
  - Overwrite analysis_snapshots (upsert on analysis_run_id → actually creates new snapshot for new run)
  - Delete old kpt_items, case_feedbacks, dimension_scores for previous run? 
    No — each run is independent. Previous run's data remains.
  - Append new milestones (no overwrite)
  - Preserve validation_flags (linked to previous run's targets; new run may produce new flaggable items)
```

### New-period analysis

```
User selects different date range, clicks Run Analysis
  ↓
POST /analysis-runs (run_type: refresh_new_period or fresh)
  ↓
New AnalysisRun created
  ↓
Pipeline runs for new period
  ↓
New snapshot persisted
  ↓
Previous run data untouched
  ↓
Delta computed vs previous closest valid run
```

---

## 6. Polling Flow (client-side)

```
Client: POST /analysis-runs → 202 { analysis_run_id, status: "pending" }
Client: GET /analysis-runs/:id every 3–5s

status: pending     → "Waiting to start..."
status: collecting  → "Collecting work data..."
status: analyzing   → show progress stage label
  - extracting_evidence
  - inferring_dimensions
  - scoring
  - generating_kpt
  - generating_cases
  - generating_overview
  - self_checking
  - persisting
status: completed   → fetch profile tabs
status: failed      → show error + retry option
```

---

## 7. Evidence Trace Flow

```
User clicks evidence link in Competency tab
  ↓
GET /evidence/:evidenceId
  ↓
Right Drawer opens with:
  - Source details
  - Content excerpt
  - Related dimensions
  - Confidence / ambiguity notes
  - Original reference URL (if available)
```

---

## 8. Validation Flag Flow

```
User clicks "Questionable" on a dimension score
  ↓
Validation Flag form opens
  ↓
User submits (flag_type + optional note)
  ↓
POST /validation-flags
  ↓
Flag stored in DB (linked to analysis_run_id + target)
  ↓
Dimension card shows yellow flag icon
  ↓
Flagged count updated in Competency Summary Header
```
