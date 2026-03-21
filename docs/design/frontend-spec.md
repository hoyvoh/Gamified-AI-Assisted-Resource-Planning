# Frontend Specification

Stack: **Next.js 15 · React 19 · Three.js · TypeScript strict · Tailwind CSS v4**

---

## Screens & Routes

| Route | Screen | Component |
|-------|--------|-----------|
| `/` | Landing / Org selector | `app/page.tsx` |
| `/org/[orgId]` | Org dashboard — projects list | `app/org/[orgId]/page.tsx` |
| `/org/[orgId]/projects/new` | Create project + input proposal | `app/org/[orgId]/projects/new/page.tsx` |
| `/org/[orgId]/projects/[projectId]` | Project hub — scenario list | `app/org/[orgId]/projects/[projectId]/page.tsx` |
| `/org/[orgId]/projects/[projectId]/scenarios/[scenarioId]` | **Strategic Board** (main screen) | `app/.../scenarios/[scenarioId]/page.tsx` |
| `/org/[orgId]/projects/[projectId]/scenarios/[scenarioId]/gantt` | Gantt Chart view | `.../gantt/page.tsx` |
| `/org/[orgId]/projects/[projectId]/scenarios/[scenarioId]/deps` | Dependency Graph | `.../deps/page.tsx` |
| `/org/[orgId]/projects/[projectId]/execution` | Execution / Progress Tracking | `.../execution/page.tsx` |
| `/org/[orgId]/personnel` | Personnel management | `.../personnel/page.tsx` |

---

## Main Screen: Strategic Board

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
