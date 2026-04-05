# Frontend Screen Spec

**Developer Growth & Evidence-Based Performance Insight Platform — MVP**

> Source: Information-Architecture.md (Part A). This doc is the implementation-ready handoff version.

---

## 1. App Shell Layout

```
┌─────────────────────────────────────────────────────┐
│  TOP HEADER                                         │
├────────────┬────────────────────────────────────────┤
│            │                                        │
│  LEFT      │  MAIN CONTENT AREA                     │
│  SIDEBAR   │                                        │
│            ├────────────────────────────────────────┤
│            │  RIGHT DRAWER (conditional overlay)    │
└────────────┴────────────────────────────────────────┘
```

### Zones:

| Zone | Purpose | Visibility |
|------|---------|------------|
| Top Header | App identity, time range, refresh, status | Always visible |
| Left Sidebar | Org → Team → Member navigation tree | Always visible |
| Main Content | Dashboard or Member profile workspace | Always visible |
| Right Drawer | Evidence trace, flag form, detail panels | Opens on demand |

---

## 2. Top Header

### Components:

- App name / logo
- Current workspace label (e.g. "Acme Corp / Backend Team")
- Time range selector (date picker, max 1 year)
- Refresh button (triggers re-analysis)
- Analysis status badge (not analyzed / loading / ready / error)
- Optional: quick search / member jump

### Time range behavior:

- If user selects range > 1 year:
  - Auto-reset to max valid range
  - Show warning toast: "Maximum analysis window is 1 year. Range adjusted automatically."

---

## 3. Left Sidebar

### Structure:

```
[App Logo]  [+ Create Org]

▼ Acme Corp
  ▼ Backend Team  (4 members)
    ● Nguyen Van A        [ready]
    ● Tran Thi B          [loading]
    ● Le Van C            [not_analyzed]
    ● Pham D              [error]
  ▶ Frontend Team  (3 members)

▼ Beta Inc
  ...
```

### Component A — Sidebar Header

- App name/logo
- "Create Organization" button

### Component B — Organization Node

- Organization name
- Expand/collapse toggle
- Context menu: Create Team | Rename | Delete

### Component C — Team Node

- Team name
- Member count badge
- Expand/collapse toggle
- Context menu: Add Member | Rename | Delete

### Component D — Member Node

- Avatar (initials fallback)
- Member display name
- Optional role tag (e.g. "BE Mid")
- Status icon:
  - `not_analyzed` — grey dot
  - `loading` — spinner
  - `ready` — green dot
  - `error` — red dot

**On click:** Open member profile workspace in main content area.

---

## 4. Dashboard (no member selected)

Shown in main content when no member is selected.

### Content:

- Welcome / intro message
- Quick stats (total orgs, teams, members)
- Recent analyses list
- Getting started guide (if no orgs yet)

### Empty state (no orgs):

- "Create your first organization to get started"
- Primary CTA button

---

## 5. Member Profile Workspace

Shown when a member is selected. Contains:

1. Member Workspace Header
2. Member Summary Strip
3. Tab navigation (5 tabs)
4. Tab content

---

### 5.1 Member Workspace Header

```
[Avatar] Nguyen Van A                  [Refresh] [↻ Analyzed 2h ago]
         Acme Corp / Backend Team / BE Mid
         ◉ Ready  |  Jan 1, 2025 – Jun 30, 2025
         [Flag Profile]  [Export (future)]
```

Fields:
- Member name (large)
- Breadcrumb: Org / Team / Role
- Analysis status badge
- Last analyzed timestamp
- Current time window
- Refresh button
- Secondary actions: Flag Profile, Export (future)

---

### 5.2 Member Summary Strip

Appears below header, above tabs.

```
┌─────────────────────────────────────────────────────────┐
│ "Reliable technical contributor with growing ownership"  │
│ 💪 Strong: Backend Capability, Technical Ownership       │
│ 📈 Growing: HoRenSo, Careless Mistake Control            │
│ Confidence: High  |  Coverage: 18 / 25 dimensions       │
└─────────────────────────────────────────────────────────┘
```

Fields:
- 1-sentence profile archetype
- Top 2–3 strengths
- Top 2 growth areas
- Confidence badge
- Dimension coverage count

---

### 5.3 Tab Navigation

```
[ Overview ] [ Competency & Evidence ] [ KPT ] [ Case Feedback ] [ Journey ]
```

Active tab is highlighted. All tabs are accessible once analysis is complete.

---

## 6. Tab 1 — Overview

### Layout:

```
Row 1: [ Overview Hero Card ]       [ Radar Chart ]
Row 2: [ Contribution Stats ]       [ Top Strengths ]
Row 3: [ Growth Areas ]             [ Delta Card ]
Row 4: [ Encouragement Summary ]
```

### Component 1 — Overview Hero Card

- 3–5 sentence professional summary (P7 output)
- Tone: professional, encouraging, evidence-aware
- Should not overclaim

### Component 2 — Radar Chart

- 4 axes: Core Technical Execution | Domain Technical | Technical Mindset | Team Effectiveness
- Each axis: category score
- Confidence legend (low = dashed segment)
- Previous period overlay (future, grayed)
- Clickable axis → jump to Competency tab filtered to that category

### Component 3 — Contribution Stats

Stat cards (not vanity metrics):

- Major workstreams involved
- Items directly owned
- Delivery completions
- Milestone-worthy contributions

### Component 4 — Top Strengths

Card with 3–5 items:

- Dimension name
- One-line explanation
- Confidence badge (High / Moderate / Low)
- Clickable → open Evidence Drawer

### Component 5 — Growth Areas

Card with 3 items:

- Dimension name
- One-line developmental explanation
- Opportunity note (if insufficient opportunity, show that instead of "weakness")
- Tone: never judgmental

### Component 6 — Delta from Previous Period

- Improved / Stable / Emerging / Watch areas
- If no previous data: "Not enough previous comparison yet" (no score shown)

### Component 7 — Encouragement / Summary Reflection

- 1 motivational paragraph suitable for use as opening in a 1:1
- Manager-friendly tone

### States:

| State | Display |
|-------|---------|
| No analysis yet | "Run an analysis to see this member's overview" |
| Analysis loading | Skeleton placeholders with spinner |
| Analysis failed | Error message + retry button |
| No previous period | Delta card shows "Insufficient comparison data" |
| Low overall confidence | Trust note: "Some insights may have limited evidence support" |

---

## 7. Tab 2 — Competency & Evidence

### Layout:

```
[ Filter Panel ] | [ Competency Summary Header ]
                 | [ Dimension Card List ]
                                             ↓
                          [Evidence Trace Drawer] (right overlay)
```

### Component 1 — Filter Panel (left sidebar of tab)

Filters:
- Category: All | Core Technical | Domain Technical | Technical Mindset | Team Effectiveness
- Confidence: All | High | Moderate | Low
- Opportunity: All | High | Medium | Low | Insufficient
- Search dimension name

### Component 2 — Competency Summary Header

- Total dimensions evaluated
- High confidence count
- Insufficient evidence/opportunity count
- User-flagged count

### Component 3 — Dimension Card (expandable)

**Collapsed state:**
```
[ Implementation Reliability ]  Reliable  ●High confidence  ↑Stable  [Medium Opportunity]
"Observed as a generally reliable implementer across multiple delivery contexts."
```

**Expanded state:**

A. Observed Pattern Summary (1–2 sentences)

B. Positive Indicators (bulleted list)

C. Development Indicators (bulleted list, if any)

D. Counter-Evidence / Limitation Note (italic, subdued)
- Example: "Most evidence comes from one project context"

E. Supporting Evidence List
- Each item: short title | timestamp | source tag | excerpt | [View trace] button

F. Assessment Validation Actions
- [✓ Looks accurate] [? Questionable] [✗ Incorrect] [+ Add note]

### Component 4 — Evidence Trace Drawer (right panel)

Opened by clicking "View trace" on any evidence item.

Fields:
- Evidence title
- Context summary
- Timestamp
- Source type + artifact type
- Related dimensions (linked chips)
- Supporting excerpt (quoted)
- Why this evidence matters
- Optional nearby context snippet
- Actions: [Mark relevant] [Mark irrelevant] [Flag misinterpretation]

### States:

| State | Display |
|-------|---------|
| Insufficient opportunity | Card shows "Insufficient Opportunity" label instead of score |
| Low confidence | Score shown with Low confidence badge + caution note |
| No evidence | "Not enough evidence found in this period" |
| User flagged | Yellow flag icon on dimension card |

---

## 8. Tab 3 — KPT

### Layout:

3-section stacked or 3-column grid:

```
[ KEEP ]          [ PROBLEM ]         [ TRY ]
[ items... ]      [ items... ]        [ items... ]

[ Development Focus Box ]
```

### Component 1 — KPT Header

- Intro: "This retrospective is generated from observed patterns during the selected period."
- Reminder note: "Use as coaching support, not absolute judgment."

### Component 2 — KEEP Section

3–6 items, each:
- Title
- Why it matters
- Supporting pattern (1 line)
- [View evidence] button (optional)

Example: "Keep clarifying before implementing"

### Component 3 — PROBLEM Section

3–6 items, each:
- Problem title
- Observed pattern explanation
- Why it creates friction
- Frequency tag (recurring / occasional)
- Confidence badge
- [View evidence] button

**Tone rule:** Language must describe patterns, not identity. Never "you are bad at X."

### Component 4 — TRY Section

3–6 items, each:
- Actionable experiment title
- Why this is the right next step
- Which problem it maps to
- Expected improvement

Example: "Before handoff, add a short completion status + open risk note"

### Component 5 — Development Focus Box

- Max 2 themes for next period
- Example: "Focus next quarter: reliability under ambiguity"

### States:

| State | Display |
|-------|---------|
| No analysis | Empty state with CTA |
| Sparse data | "Limited evidence available. KPT may be incomplete." |
| No problems found | PROBLEM section shows "No major recurring patterns identified" |

---

## 9. Tab 4 — Case-Based Feedback

### Layout:

```
[ Case Summary Header ]

[ Case List (cards) ]  |  [ Case Detail Panel ]
```

### Component 1 — Case Summary Header

- Number of notable cases
- Number of recurring patterns
- Number of high-impact lessons

### Component 2 — Case List

Each case card:
- Case title
- Category tag (e.g. "Communication / Handoff")
- Impact level badge (Low / Medium / High)
- Confidence badge
- Date or period
- One-line summary

**Categories:**
- Communication / handoff
- Quality miss
- Ownership gap
- Good recovery
- Strong technical decision
- Debugging lesson
- Collaboration lesson
- Delivery / reliability lesson

### Component 3 — Case Detail Panel

Opened when user clicks a case card:

**A. What Happened** — short situation description

**B. Why It Matters** — significance of the case

**C. Observed Pattern** — the broader pattern this case represents

**D. Better Alternative** — what could have been done differently

**E. Next-Time Guidance** — specific actionable advice for next time

**F. Related Dimensions** — linked chips → click opens competency drawer

**G. Supporting Evidence** — list of evidence snippets with [View trace] button

### Component 4 — Improvement Theme Summary

At bottom of tab:
- "Most recurring lessons from this period"
- 3–5 bullet summary

### States:

| State | Display |
|-------|---------|
| No cases | "No notable cases identified in this period" |
| No analysis | Empty state with CTA |

---

## 10. Tab 5 — Journey & Milestones

### Layout:

```
[ Journey Header ]

[ Timeline Visualization ]

[ Milestone Detail Card ] (opens on click)

[ Growth Pattern Summary ]

[ Development Path Interpretation ]
```

### Component 1 — Journey Header

- Current growth path archetype (e.g. "Emerging Owner")
- Trajectory sentence (e.g. "Trend: strengthening implementation discipline")
- Time span covered (e.g. "Tracking 18 months of milestones")

### Component 2 — Timeline Visualization

Vertical or horizontal timeline, nodes for:

- Major deliveries
- Ownership shifts
- Learning breakthroughs
- Quality lessons
- Recovery cases
- Role / scope changes

Each node:
- Title
- Date
- Short summary
- Impact tag (star / flag icons)

Nodes outside the current analysis window are shown in a muted style.

### Component 3 — Milestone Detail Card

On click of timeline node:
- Milestone title
- What changed
- Why it mattered
- Linked evidence / source references
- Related development themes

### Component 4 — Growth Pattern Summary

- Recurring long-term strengths
- Recurring long-term struggles
- Most meaningful developmental shifts

### Component 5 — Development Path Interpretation

- Current path archetype (not a fixed label, an "observed tendency"):
  - Reliable Executor
  - Emerging Owner
  - Quality Guardian
  - System Thinker
  - Cross-team Collaborator
  - Technical Mentor
  - Delivery Driver
- Why the system observes this path
- Suggested next-stage focus (1–2 sentences)

**Important UX note:** Must not feel like identity labeling. Use language like "observed growth tendency" not "you are a X."

### States:

| State | Display |
|-------|---------|
| No milestones yet | "No milestone data available yet. Milestones are built up over multiple analyses." |
| Only one analysis run | "Historical comparison not yet available. Journey will build over time." |
| Insufficient history | Growth pattern summary shows "Not enough history for pattern interpretation" |

---

## 11. Cross-Tab UX Behaviors

### 11.1 Shared Interactions (from any tab)

- Click evidence link → open Evidence Trace Drawer (right panel)
- Click "Flag" → open Validation Flag form
- Click dimension chip → jump to Competency tab, scroll to that dimension
- Click milestone link → jump to Journey tab, highlight that milestone
- Click radar segment → jump to Competency tab filtered by category

### 11.2 Global Loading States

| State | UI behavior |
|-------|-------------|
| No data yet | "Run an analysis to generate this member's profile." |
| Collecting data | Progress indicator with label "Collecting work data..." |
| Analyzing | Progress indicator with label "Analyzing patterns..." |
| Ready | Full profile rendered |
| Partial result | Profile shown with incomplete sections labeled |
| Failed | Error banner with retry action |

### 11.3 Shared Empty States

| Context | Empty state message |
|---------|---------------------|
| No evidence in period | "No evidence found in the selected period. Try expanding the date range." |
| Insufficient opportunity | "Not enough opportunity to evaluate this dimension in this period." |
| No milestones yet | "Milestones accumulate over multiple analysis runs." |
| No cases identified | "No notable recurring cases identified in this period." |

### 11.4 Shared Trust Notes

Each tab should display a subtle trust disclaimer:

- "Some insights may be low confidence due to limited evidence."
- "This profile reflects observed work patterns, not absolute ability."
- "Use as a starting point for conversation, not as a final judgment."

---

## 12. Forms & Modals

### 12.1 Create Organization Form

Fields: Organization name (required)
Validation: Non-empty, max 255 chars
Actions: Cancel | Create

### 12.2 Create Team Form

Fields: Team name (required)
Validation: Non-empty, max 255 chars
Actions: Cancel | Create Team

### 12.3 Add Member Form

Fields:
- Display name (required)
- External ID / handle (optional, e.g. GitHub username)
- Role profile (dropdown, optional)

Actions: Cancel | Add Member

### 12.4 Validation Flag Form

Triggered from any insight item.

Fields:
- Flag type: [Looks accurate] [Questionable] [Incorrect] (radio)
- Note (optional textarea)

Actions: Cancel | Submit

### 12.5 Time Range Picker

- Date from / Date to
- Quick select: Last 3 months | Last 6 months | Last year
- Warning displayed inline if range > 1 year (auto-corrects)

---

## 13. Error States

| Error | Display |
|-------|---------|
| Analysis failed | Red banner: "Analysis failed. [Retry] or check error details." |
| Network error on load | "Could not load data. Please check your connection and refresh." |
| Date range invalid | Inline warning on time picker: "Range adjusted to 1 year maximum." |
| Flagging failed | Toast: "Could not save feedback. Please try again." |
| Conflict (run already running) | Toast: "Analysis already in progress for this member." |
