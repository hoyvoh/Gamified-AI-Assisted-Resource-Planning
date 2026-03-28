# Frontend Specification

Stack: **Next.js 15 · React 19 · TypeScript strict · Tailwind CSS v4 · React DnD**

---

## Screens & Routes

| Route | Screen | Role | Component |
|-------|--------|------|-----------|
| `/` | Landing / Org selector | All | `app/page.tsx` |
| `/org/[orgId]` | Org dashboard — projects list | All | `app/org/[orgId]/page.tsx` |
| `/org/[orgId]/projects/new` | Create project + input proposal | PM | `app/org/[orgId]/projects/new/page.tsx` |
| `/org/[orgId]/projects/[projectId]` | Project hub — scenario list + mode navigation | All | `app/org/[orgId]/projects/[projectId]/page.tsx` |
| `/org/[orgId]/projects/[projectId]/evaluate` | **Mode 1: Project Analysis** (10-axis radar) | PM, TL | `.../evaluate/page.tsx` |
| `/org/[orgId]/projects/[projectId]/team-analysis` | **Mode 2: HR Analysis** (developer profiles + match) | PM, TL | `.../team-analysis/page.tsx` |
| `/org/[orgId]/projects/[projectId]/scenarios/[scenarioId]` | **Mode 3: Strategic Board** | PM, TL | `app/.../scenarios/[scenarioId]/page.tsx` |
| `/org/[orgId]/projects/[projectId]/scenarios/[scenarioId]/gantt` | Gantt Chart view | PM, TL, Member | `.../gantt/page.tsx` |
| `/org/[orgId]/projects/[projectId]/scenarios/[scenarioId]/deps` | Dependency Graph | PM, TL | `.../deps/page.tsx` |
| `/org/[orgId]/projects/[projectId]/execution` | **Mode 4: Execution / Progress Tracking** | All | `.../execution/page.tsx` |
| `/org/[orgId]/personnel` | Personnel management | Admin | `.../personnel/page.tsx` |

### Project Hub Navigation (mode switcher)

```
┌─────────────────────────────────────────────────────────────────┐
│  [Project Name]                                    [Status Badge] │
├────────────┬──────────────┬──────────────┬──────────────────────┤
│ 📋 Analyze │  👥 HR Match │  🎯 Plan     │  ▶ Execute           │
│ (Mode 1)   │  (Mode 2)    │  (Mode 3)    │  (Mode 4)            │
│ PM + TL    │  PM + TL     │  PM + TL     │  All                 │
│ ✅ Done    │  ⚠️ Pending  │  🔒 Locked   │  🔒 Locked           │
└────────────┴──────────────┴──────────────┴──────────────────────┘
```

Mode 3 locked until Mode 1 verdict = Proceed/Conditional.
Mode 4 locked until Mode 3 has an active scenario.

---

## Mode 1: Project Analysis Screen

**Route:** `/org/[orgId]/projects/[projectId]/evaluate`
**Access:** PM, Tech Lead

### Layout

```
┌───────────────────────────────────────────────────────────────────┐
│ TopBar: [Project Name] > Project Analysis        [Save] [Finalize] │
├──────────────────────────────┬────────────────────────────────────┤
│                              │                                    │
│   10-Axis Radar Chart        │  Axis Scoring Panel                │
│   (spider chart, live)       │                                    │
│                              │  ┌─ Axis 1: Problem-Solution Fit  │
│   Composite: 3.7 / 5.0       │  │  Score: [1][2][3][4][5]        │
│   Verdict: ⚠️ Conditional    │  │  Rationale: [text input]       │
│                              │  │  [🤖 AI Assist]                │
│   Color zones:               │  ├─ Axis 2: Success Criteria ...  │
│   Red < 2 / Amber 2–3        │  ├─ Axis 3: TELOS Composite       │
│   Green > 3.5                │  │    T:[_] E:[_] L:[_] O:[_] S:[_]│
│                              │  ├─ Axis 4–10 ...                 │
│                              │  └────────────────────────────────│
│                              │                                    │
│                              │  Risk Register (auto-populated)    │
│                              │  🔴 Axis 3 TELOS (2.0) →          │
│                              │     Legal review required [owner]  │
│                              │  🟠 Axis 8 TRL (2.5) →            │
│                              │     PoC needed [owner]             │
└──────────────────────────────┴────────────────────────────────────┘
```

### Key Components

**`ProjectRadarChart`** — SVG radar (10 axes, 1–5 scale)
- Live update on every score change
- Color fill: green zone (≥3.5), amber zone (2–3), red zone (<2)
- Hover axis: shows rubric definition tooltip
- Center label: composite score + verdict badge

**`AxisScoringPanel`** — Scrollable list of 10 axes
- Score selector (1–5 radio buttons with rubric labels on hover)
- Rationale textarea (required before finalize)
- `TELOS` axis expands into 5 sub-dimension sliders (T, E, L, O, S)
- `[🤖 AI Assist]` button → calls `POST /projects/{id}/evaluation/ai-assist` with current proposal + axis → streams scoring suggestion

**`RiskRegister`** — Auto-populated from axes ≤ 2
- Each risk: axis name, score, severity icon, action required field, owner dropdown
- Owner must be set before Finalize is enabled

**`VerdictBadge`**
```tsx
// proceed → ✅ green "Proceed"
// conditional → ⚠️ amber "Proceed with Conditions — N risks to resolve"
// do_not_proceed → ❌ red "Do Not Proceed — resolve blockers first"
// Hard gate: any axis = 1 → always do_not_proceed regardless of composite
```

---

## Mode 2: HR Analysis Screen

**Route:** `/org/[orgId]/projects/[projectId]/team-analysis`
**Access:** PM, Tech Lead

### Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ TopBar: [Project Name] > HR Analysis                    [Sync Profiles] │
├──────────────────────┬──────────────────────────────────────────────┤
│                      │                                              │
│  Developer Roster    │  Team Composition Panel                      │
│  (left, 340px)       │  (right, fills remaining)                    │
│                      │                                              │
│  🔍 Search / Filter  │  Recommended Teams:                          │
│                      │  ┌─ Team Config A (Match: 87%) ────────────┐│
│  ┌─ Alice N.  ──────┐│  │ Alice + Bob + Carol                      ││
│  │ ████████ 4.2/5   ││  │ Coverage: 95% skills · Cost: $X/sprint   ││
│  │ T-shape: Backend ││  │ WFU effective est: 8.4 total             ││
│  │ Match: ★★★★☆    ││  │ [Select this team]                       ││
│  └────────────────┘││  └──────────────────────────────────────────┘│
│                      │  ┌─ Team Config B (Match: 79%) ────────────┐│
│  ┌─ Bob T.   ──────┐│  │ ...                                       ││
│  │ ██████░░ 3.1/5   ││  └──────────────────────────────────────────┘│
│  │ T-shape: Full    ││                                              │
│  │ Match: ★★★☆☆   ││  Developer Detail (click any card)           │
│  └────────────────┘││  ┌────────────────────────────────────────┐ │
│                      │  │ 5-Radar Profile: Alice N.              │ │
│  [Match All →]       │  │ [OCEAN][Behavioral][Tech][Soft][Perf]  │ │
│                      │  │ Flags: none · WFU est: 1.15×           │ │
│                      │  └────────────────────────────────────────┘ │
└──────────────────────┴──────────────────────────────────────────────┘
```

### Key Components

**`DeveloperRosterPanel`** (left sidebar)
- Sorted by match score (default) or by layer score
- Each card: name, overall match bar, T-shape summary, top skill
- Click → opens `DeveloperProfileDrawer`
- Filter: by skill, seniority, availability, match score threshold

**`DeveloperProfileDrawer`**
- Tabbed 5-layer view: OCEAN | Behavioral | Technical | Soft Skills | Performance
- Each tab: mini radar + axis scores with confidence indicators
- Low-confidence axes (< 0.6) shown with `~` prefix and amber color
- Flags section: burnout risk 🔥, small corpus ⚠️, language calibration 🌐
- WFU factors breakdown: familiarity × tech_match × quality × reliability = effective multiplier

**`TeamCompositionPanel`** (main area)
- Top 3 team configurations from `POST /projects/{id}/team-match`
- Each config card: developers, skill coverage %, estimated WFU budget, OCEAN compatibility score, growth opportunity notes
- `[Select this team]` → pre-populates Mode 3 project membership with selected personnel
- Manual composition: drag developers from roster to build custom team

**`ProfileSyncStatus`** (top bar widget)
- Shows last sync date per developer
- `[Sync Profiles]` → triggers `POST /personnel/{id}/profile/refresh` for selected devs

---

## Mode 3: Planning Board Screen

**Route:** `/org/[orgId]/projects/[projectId]/scenarios/[scenarioId]`
**Access:** PM, Tech Lead

### Layout
```
┌───────────────────────────────────────────────────────────────────────┐
│ TopBar: [Project Name] > [Scenario selector ▾] [+New] [Compare] [🚀 Launch] │
├──────────────────┬────────────────────────────────────────────────────┤
│  Developer Panel │   Task Lanes (Kanban Board)                        │
│  (left 280px)    │                                                     │
│                  │  Unassigned      In Progress      Done             │
│  🔍 Search       │  ┌──────────┐   ┌──────────┐    ┌──────────┐      │
│                  │  │TaskCard  │   │TaskCard  │    │TaskCard  │      │
│  [Dev Card]      │  └──────────┘   └──────────┘    └──────────┘      │
│  [Dev Card]      │  ┌──────────┐   ┌──────────┐                      │
│  [Dev Card]      │  │TaskCard  │   │TaskCard  │                      │
│                  │  └──────────┘   └──────────┘                      │
│  P(on_time):     │                                                     │
│  🟢 84%          │                                                     │
├──────────────────┴────────────────────────────────────────────────────┤
│ Warning Bar (collapsible) — 🔴 2 Critical  🟠 1 Warning               │
└───────────────────────────────────────────────────────────────────────┘
```

### Scenario Selector (TopBar dropdown)
```
┌─ Scenarios ──────────────────────────────────────────────┐
│  ● Plan Normal          [draft]    P(on_time): 84%  ←active│
│  ○ Plan Full Resource   [draft]    P(on_time): 91%         │
│  ○ Plan OT              [contingency] P(on_time): 96%      │
│  ○ If Alice leaves      [what_if]  P(on_time): 67%         │
│  ────────────────────────────────────────────────────────  │
│  [+ New Scenario]  [Fork current]                          │
└────────────────────────────────────────────────────────────┘
```
- Switch scenario: board re-renders với assignments từ selected scenario
- `[+ New Scenario]`: modal → nhập name, type (planning/contingency/what_if)
- `[Fork current]`: tạo copy editable của scenario hiện tại

### Launch Button (`🚀 Launch`)
- Chỉ visible nếu: scenario.status = `draft` và ≥1 task có assignment
- Click → `LaunchConfirmModal`:
  ```
  ┌─ Launch Project ─────────────────────────────────────────┐
  │ Activating: Plan Normal                                    │
  │ Start date: today (28 Mar 2026)                           │
  │ Team: Alice, Bob, Carol (3 members assigned)              │
  │ Tasks: 12 tasks, 8 assigned                               │
  │                                                           │
  │ ⚠️  4 tasks unassigned — assign before launch or proceed  │
  │                                                           │
  │ [Cancel]                          [Launch & Notify Team]  │
  └───────────────────────────────────────────────────────────┘
  ```
- On confirm: scenario → `active`, project → `active`, team notified

### Panel Sizes
- Left developer panel: 280px (resizable, min 220px, persisted in localStorage)
- Center board: fills remaining space

---

## Components

### `PersonnelSidebar`
**File:** `src/components/PersonnelSidebar/`

- Danh sách nhân sự (cards) với: avatar, tên, seniority badge, WFU bar
- Mỗi card: draggable → kéo vào board/task để assign
- Click card → mở `PersonnelDetailDrawer`
- Filter: search, filter by skill, seniority
- WFU bar: visual indicator tổng tải trọng hiện tại (green/yellow/red)

### `PersonnelDetailDrawer`
- Skill matrix table
- Allocation breakdown: % dành cho từng project (doughnut chart)
- Daily hours bar (tổng tất cả projects)
- Buttons: chỉnh allocation %, xem lịch sử XP

### `TaskPanel`
**File:** `src/components/TaskPanel/`

- Danh sách tasks theo status (draft / todo / in_progress / done)
- Mỗi task card: tên, category icon, effort badge, assigned avatars, warning indicator
- Click task → mở `TaskDetailDrawer`
- Actions: "Add task", "AI suggest tasks", filter/sort

### `TaskDetailDrawer`
- Full task info: description, effort breakdown (investigate/design/implement/test/review/support) — **editable trong meeting**
- Techstack chips + required language chips
- Assigned personnel với allocation % + **WFU mode selector** (standard / fast ×1.2 / quality ×1.5)
  - fast/quality chỉ hiển thị khi nhân sự đó có matching skill với task techstack
- Dependency list (visualized as mini tree)
- Edit mode: chỉnh effort, dates, dependencies — realtime recalc trên Gantt khi thay đổi
- Prompt input: "Ask AI to re-estimate this task"

### `WFUModeSelector`
**File:** `src/components/AssignmentCard/WFUModeSelector.tsx`
```tsx
interface WFUModeSelectorProps {
  skillMatches: boolean          // true nếu personnel skill matches task techstack
  currentMode: 'standard' | 'fast' | 'quality'
  onChange: (mode) => void
}
// Renders: radio group với 3 options
// fast + quality disabled (greyed out) nếu skillMatches === false
// Tooltip khi disabled: "Enable by assigning someone with matching techstack"
```

### `PlanningBoard`
**File:** `src/components/PlanningBoard/`

Card-game kanban layout. No canvas/3D.

```
Components:
- PlanningBoard/index.tsx       — layout: developer panel + lane board
- PlanningBoard/TaskCard.tsx    — task card with badges, drag target
- PlanningBoard/DeveloperCard.tsx — developer card, drag source
- PlanningBoard/TaskLane.tsx    — lane column (Unassigned/In Progress/Done)
- PlanningBoard/AllocationModal.tsx — % + WFU mode selector on drop
- PlanningBoard/ScenarioBar.tsx — scenario selector + P(on_time) + Launch button
```

**TaskCard badges:**
- Effort badge: "3.5d"
- Techstack chips: [React] [TypeScript]
- Status badge: Unassigned / In Progress / Done
- P(on_time) badge: 🟢 84% / 🟡 68% / 🔴 43%
- Assignee avatar stack (click avatar → remove assignment)
- Warning indicator if task has active warnings

**TaskCard expand (click):**
- Effort breakdown table (investigate/design/implement/test/review/release) — editable
- Dependencies list with status icons
- Active warnings list
- LLM prompt input: "Split this task into 3 parallel subtasks"

**DeveloperCard:**
- Avatar + name + seniority badge
- Availability bar: daily hours used / 7h (green → amber → red)
- Skill match % (from Pillar 2, or "—" if unavailable)
- WFU effective multiplier

### `ScenarioSwitchBanner` (Execution Mode)
**File:** `src/components/ScenarioSwitchBanner/`

Hiển thị khi P(on_time) < 40% trong 3 ngày liên tiếp hoặc khi trigger condition auto-detected:

```
┌─ ⚠️  P(on_time) Critical (38%) ──────────────────────────────────────────────┐
│ Project has been at risk for 3 consecutive days.                               │
│ Trigger: RISK_ESCALATION                                                       │
│                          [Dismiss]  [Record condition]  [Switch to Plan OT ▾] │
└────────────────────────────────────────────────────────────────────────────────┘
```

`[Switch to Plan OT ▾]` dropdown shows all contingency scenarios with P(on_time) preview.
`[Record condition]` → modal: select trigger type + free text note → auto-fork from current state.

### `WarningBar`
- Positioned bottom of screen
- Badges nhóm theo severity: 🔴 Critical / 🟠 Warning / 🟡 Info
- Click badge → expand warning detail
- Acknowledge button per warning

### `CompletionProbabilityBadge`
**File:** `src/components/CompletionProbability/`

Hiển thị trên TopBar và board, cập nhật sau mỗi thay đổi:
```tsx
// Colors:
// p >= 0.8  → 🟢 "On Track — 87% on time"
// p 0.5-0.8 → 🟡 "At Risk — 63% on time"
// p < 0.5   → 🔴 "Critical — 34% on time"

// If EAC < deadline → show: "🟢 ~N days ahead of deadline"
// If EAC > deadline → show: "🔴 ~N days behind deadline"
```

Click badge → expand panel showing:
- P(on_time) gauge chart
- EAC date vs deadline
- Contributing risk factors list
- "Add Support" button → triggers Add WFU flow

### `AddWFUModal`
**File:** `src/components/ProgressTracking/AddWFUModal.tsx`

Triggered when `p_on_time < 0.5` or from CompletionProbabilityBadge:
- Cho phép assign thêm nhân sự hoặc tăng allocation %
- Realtime: sau mỗi thay đổi → gọi `GET /completion-probability` → update P(on_time) preview
- Nếu task >50% done → hiển thị Brooks' Law warning:
  `"⚠️ Adding people at this stage (65% done) is likely to slow the task down"`

### `TopBar`
- Project name + breadcrumb
- Scenario selector dropdown (với snapshot indicator 🔒)
- **`CompletionProbabilityBadge`** — hiển thị prominent ở giữa TopBar
- View switcher — **3 views chính** + 1 bổ sung:
  - `Board` (primary — planning)
  - `Gantt` (primary — timeline)
  - `Deps` (primary — dependencies)
  - `Calendar` (supplemental)
- Actions: "Snapshot", "Optimize", "Risk Analysis", "Finalize"
- AI prompt input (expandable)

### `AIPromptPanel`
- Expandable panel (triggered from TopBar)
- Textarea for free-form prompt
- Quick actions: "Generate tasks", "Analyze risks", "Suggest optimization"
- Response area: structured cards + raw text

### `GanttChart`
**File:** `src/components/GanttChart/`

Custom SVG Gantt — no heavy lib. Used in both Mode 3 (planning) and Mode 4 (execution).

**3-layer bar system:**

| Layer | Visual | Source | When visible |
|-------|--------|--------|-------------|
| Baseline | Grey bar (thin, background) | `execution_baseline` snapshot | After project launch |
| Planned | Blue bar (solid) | Active scenario task dates | Always |
| Actual | Green/Amber/Red bar (overlay) | `ProgressLogs` % complete | After launch, execution mode |

**Layout:**
```
┌──────────────────────────────────────────────────────────────────────┐
│  Filter: [All] [By Person ▾] [By Milestone ▾] [Status ▾]            │
├────────────────────┬────────────────────────────────────────────┬────┤
│ Task name          │ Mar 28   Apr 4   Apr 11   Apr 18   Apr 25  │P% │
├────────────────────┼────────────────────────────────────────────┼────┤
│ ▸ Milestone 1      │                  ◆                         │    │
│   Auth API         │ ████████░░░░     (planned: blue)           │72% │
│                    │ ▓▓▓▓▓▓▓▓         (actual: green)           │    │
│                    │ ░░░░░░░░░░░░     (baseline: grey)          │    │
│   DB Schema        │      ████████                              │100%│
├────────────────────┼────────────────────────────────────────────┼────┤
│  Today ──────────────────────────↑──────────────────────────────│    │
│  Deadline ────────────────────────────────────────────────────→ │    │
└────────────────────┴────────────────────────────────────────────┴────┘
```

**Markers:**
- `Today` — vertical dashed line (dark)
- `Deadline` — vertical red line with label
- `EAC` — vertical line: 🟢 green if ahead, 🔴 red if behind, label "±N days"
- `◆` — milestone diamonds at milestone deadlines
- `🔀` — scenario switch markers with tooltip (trigger reason + date)

**Interaction:**
- Drag planned bar → reschedule task (triggers DEADLINE_CHANGE warning)
- Click bar → `TaskDetailDrawer` opens
- Hover → tooltip: task name, planned dates, actual %, EAC, assignee(s)
- Right-click → context menu: "Reassign", "Split task", "View dependencies"

**Filters:**
- By person: show swimlane per person
- By milestone: group tasks under milestone headers
- By status: hide done / show only at-risk

### `DependencyGraph`
**File:** `src/components/DependencyGraph/`
- Dagre layout (DAG visualization)
- Nodes: task cards với status color
- Edges: dependency arrows
- Highlight: critical path (longest path to deadline) in red
- Zoom + pan

### `CalendarView`
**File:** `src/components/CalendarView/`
- Monthly calendar grid
- Cells: colored dots/bars per person per day
- Click day: popover với tasks active on that day
- Milestone markers

### `ProgressInputForm`
**File:** `src/components/ProgressTracking/`
- Dropdown: chọn task từ assigned tasks của user
- Slider: completion % (0–100)
- Input: hours spent today
- Textarea: notes / blockers
- Submit → realtime update Gantt actual bar + warnings recompute

---

## Mode 4: Execution Screen

**Route:** `/org/[orgId]/projects/[projectId]/execution`
**Access:** All (PM, TL, Members)

### Layout
```
┌───────────────────────────────────────────────────────────────────┐
│ TopBar: [Project Name] > Execution  [🟢 P(on_time): 84%]  [Switch Plan ▾] │
├──────────────────────────────────────────────────────────────────┤
│ [ScenarioSwitchBanner — shown if P(on_time) critical]            │
├───────────────────┬──────────────────────────────────────────────┤
│  My Tasks         │  Gantt — Full Team View                      │
│  (left, 300px)    │                                              │
│                   │  [Filter ▾] [By Person ▾] [By Milestone ▾]  │
│  Today's updates: │                                              │
│  ┌─────────────┐  │  ░░████████░░  Auth API        Alice  72%  │
│  │Auth API     │  │  ░░░░████████  DB Schema       Bob   100%  │
│  │ [████░] 72% │  │  ░░░░░░████    Frontend UI     Carol  40%  │
│  │ [Update]    │  │                                              │
│  └─────────────┘  │  Today ──────────↑──────────────────────── │
│  ┌─────────────┐  │  Deadline ──────────────────────────────→  │
│  │Frontend UI  │  │  🔀 Switched to Plan OT (Apr 2)            │
│  │ [██░░░] 40% │  │                                              │
│  │ [Update]    │  │                                              │
│  └─────────────┘  │                                              │
└───────────────────┴──────────────────────────────────────────────┘
```

### `MyTasksPanel` (left)
- Chỉ hiển thị tasks assigned to current user, trong active scenario
- Mỗi task: tên, progress bar, [Update] button → mở `ProgressInputForm`
- Overdue indicator nếu planned_end < today và < 100%

### `ExecutionGantt`
- Same `GanttChart` component với mode=`execution`
- Hiện đủ 3 bar layers (baseline, planned, actual)
- Scenario switch markers visible
- PM view: full team, all tasks
- Member view: only their tasks highlighted, others dimmed

### `SwitchPlanDropdown` (TopBar, PM only)
```
[Switch Plan ▾]
  ├─ Fork from current state → plan adjustment flow
  ├─ Plan Full Resource   (P: 91%) [contingency]
  ├─ Plan OT              (P: 96%) [contingency]
  └─ + New contingency plan
```
- Chọn plan → `SwitchPlanConfirmModal`:
  - Hiện trigger reason selector (MEMBER_DEPARTURE / SCOPE_CHANGE / DEADLINE_CHANGE / BUDGET_CUT / RISK_ESCALATION)
  - Free-text note cho audit trail
  - Preview: P(on_time) change (old → new)
  - Confirm → old scenario archived, new scenario activated, Gantt re-renders

### EV Metrics Summary (PM only)
- Hiển thị sidebar hoặc expandable drawer:
  - **SPI** (Schedule Performance Index): actual EV / planned EV
  - **CPI** (Cost Performance Index): earned value / actual cost
  - **EAC** (Estimate at Completion): projected finish date
  - **P(on_time)** gauge
  - Trend chart: P(on_time) over last 14 days

---

## Interactions

### Drag & Drop (Board)
- Kéo `DeveloperCard` từ panel → thả lên `TaskCard`
- Highlight drop zone khi hovering valid target
- Optimistic update → API call → rollback nếu fail

### Resize Panels
- Divider giữa sidebar và board: draggable
- Sizes lưu vào `localStorage` key `grp-panel-left`, `grp-panel-right`

### Context Menu (Right-click task)
- "Edit task"
- "Split into subtasks"
- "Merge with..."
- "View dependencies"
- "Remove all assignments"

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `?` | Show shortcuts help |
| `Esc` | Deselect / close drawer |
| `G` | Switch to Gantt |
| `D` | Switch to Dependencies |
| `C` | Switch to Calendar |
| `B` | Switch to Board |
| `O` | Open Optimize |
| `S` | Snapshot current scenario |

---

## State Management

```typescript
// src/store/scenarioStore.ts — Zustand
interface ScenarioStore {
  scenario: ScenarioDetail | null
  tasks: Task[]
  assignments: ResourceAssignment[]
  warnings: Warning[]
  selectedTaskId: string | null

  // Actions
  assignPersonnel: (taskId: string, personnelId: string, pct: number) => void
  removeAssignment: (assignmentId: string) => void
  updateTask: (taskId: string, patch: Partial<Task>) => void
  snapshotScenario: (name: string) => Promise<string>
  optimizeScenario: (mode: 'makespan' | 'budget') => Promise<void>
}
```

---

## Three.js Integration

```typescript
// src/components/StrategicBoard/useBoard.ts
'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export function useBoard(containerRef: React.RefObject<HTMLDivElement>) {
  // Scene, camera, renderer initialization
  // Task objects management
  // Personnel objects management
  // Animation loop
  // Raycasting for click/hover/drop detection
  // Cleanup on unmount
}
```

---

## API Integration Pattern

```typescript
// src/lib/api/scenarios.ts
import type { components } from '@/types/api'
type Scenario = components['schemas']['ScenarioDetail']

export async function getScenario(scenarioId: string): Promise<Scenario> {
  const res = await fetch(`${API_BASE}/scenarios/${scenarioId}`)
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json()
}
```

Types luôn được generate từ OpenAPI schema — không hand-write DTO.

---

## Accessibility

- Board có **keyboard fallback**: Tab để navigate tasks, Enter để select, Arrow keys để move camera
- Tất cả interactive elements ngoài Three.js tuân thủ WCAG 2.1 AA
- Warning bar `aria-live="polite"` cho auto-announce warnings mới
- Three.js canvas có `aria-label` mô tả board state
