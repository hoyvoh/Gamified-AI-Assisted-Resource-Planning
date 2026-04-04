# Frontend Specification

Stack: **Next.js 15 · React 19 · Three.js · TypeScript strict · Tailwind CSS v4**

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

## Main Screen: Strategic Board (Mode 3)

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ TopBar: [Project name] [Scenario selector] [Views] [Actions] │
├────────────┬─────────────────────────────────┬──────────────┤
│            │                                 │              │
│ Personnel  │     Three.js Strategic Board    │  Task Panel  │
│  Sidebar   │     (Desert Empire Theme)       │  (right)     │
│  (left)    │                                 │              │
│            │  [board occupies center 60%]    │              │
│            │                                 │              │
├────────────┴─────────────────────────────────┴──────────────┤
│ Warning Bar (collapsible) — Warning badges                   │
└─────────────────────────────────────────────────────────────┘
```

### Panel Sizes
- Left sidebar: 280px (resizable, persisted in localStorage)
- Right panel: 320px (resizable, persisted)
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

### `StrategicBoard` (Three.js)
**File:** `src/components/StrategicBoard/`

```typescript
// Core Three.js scene
- Scene: desert environment (sand ground, sky gradient, distant fortress silhouette)
- Lights: directional (sunlight), ambient
- Camera: perspective, orbitable (mouse drag/scroll)

// Task objects (camps)
- Geometry: BoxGeometry (doanh trại) — mỗi task = 1 camp
- Color coding by status: draft=gray, todo=tan, in_progress=amber, done=green
- Size: proportional to effort_total_days
- Label: floating text above camp (task name)
- Click: select task → highlight + open TaskDetailDrawer
- Hover: tooltip với key metrics

// Personnel objects (units)
- Geometry: ConeGeometry or CylinderGeometry (chiến binh)
- Color: per-person unique color
- Position: orbiting/standing next to assigned camp
- Unassigned: standing area on left

// Connections
- Lines between dependent tasks (glowing path)
- Lines between personnel and their tasks

// Fortress (deadline marker)
- Background mesh: distant castle silhouette
- Animated: glowing pulse based on urgency
```

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
- Build custom trên SVG/Canvas (tránh heavy lib dependencies)
- X-axis: timeline theo ngày
- Y-axis: tasks (grouped by category)
- Bars: planned (solid) vs actual (striped overlay)
- **Deadline marker:** vertical red dashed line tại `project.deadline`
- **EAC marker:** vertical line tại EAC date:
  - 🟢 Green nếu EAC < deadline (ahead) — label: "+N days"
  - 🔴 Red nếu EAC > deadline (behind) — label: "−N days"
- Milestones: diamond markers
- Filters: by person, by category, by status
- Click bar: open TaskDetailDrawer
- **Realtime update:** khi deadline của task thay đổi trong meeting → bars shift immediately (optimistic)

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
- Cho execution mode
- Dropdown: chọn task
- Slider: completion %
- Input: hours spent today
- Textarea: notes
- Submit → realtime update Gantt + warnings

---

## Interactions

### Drag & Drop (Board)
- Kéo `PersonnelCard` từ sidebar → thả lên `CampObject` trong Three.js
- Three.js detect drop via raycasting + pointer events
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
