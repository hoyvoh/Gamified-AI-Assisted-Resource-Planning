# Frontend Implementation Plan — MVP for Competition Demo

---

## 🤖 AI Agent Spec — Project Context & Screen Definitions

> Phần này dành cho AI agent (GitHub Copilot, Claude, v.v.) để hiểu toàn bộ context dự án trước khi generate UI/UX hoặc implement code.

### Dự Án Là Gì?

**Gamified AI-Assisted Resource Planning** — một công cụ lập kế hoạch phân bổ nhân sự dự án phần mềm, được gamify theo theme **"Desert Empire"** (sa mạc chiến lược). Hệ thống kết hợp:

- **COCOMO II** — ước lượng effort tự động từ mô tả dự án
- **LLM (Claude/AI)** — phân tích proposal, generate tasks, phân tích rủi ro
- **Genetic Algorithm** — tối ưu hóa lịch phân bổ (makespan / budget)
- **P(on_time)** — xác suất hoàn thành đúng hạn, tính realtime dựa trên SPI + risk factors
- **Three.js** — bàn cờ 3D trực quan hóa nhân sự + tasks như quân cờ + doanh trại

**Mục tiêu sản phẩm:** PM + Tech Lead họp realtime, kéo thả nhân sự vào tasks trên bàn cờ 3D, thấy ngay xác suất dự án có kịp deadline không — và AI gợi ý cách tối ưu.

---

### Khái Niệm Miền (Domain Concepts) Cần Biết

| Khái niệm        | Ý nghĩa                                                                        |
| ---------------- | ------------------------------------------------------------------------------ |
| **WFU**          | Workforce Unit = 1 ngày làm việc = 7h. Đơn vị đo tải trọng nhân sự             |
| **WFU Mode**     | `standard` (×1.0) / `fast` (×1.2) / `quality` (×1.5) — chỉ bật khi skill match |
| **P(on_time)**   | Xác suất hoàn thành đúng hạn (0-100%). 🟢≥80% / 🟡50-80% / 🔴<50%              |
| **EAC**          | Estimated At Completion — ngày dự kiến hoàn thành theo velocity thực tế        |
| **COCOMO II**    | Công thức ước lượng effort: `PM = A × Size^E × ∏EM`                            |
| **Brooks' Law**  | Thêm người vào task đã >50% done sẽ làm chậm hơn, không nhanh hơn              |
| **Scenario**     | Một phương án phân bổ (có thể có nhiều scenario song song để so sánh)          |
| **Seniority**    | Junior (×0.8 WFU) / Mid / Senior (có thể dùng fast/quality mode)               |
| **Skill Matrix** | Mỗi nhân sự có bảng kỹ năng rated ★/★★/★★★ — quyết định WFU mode               |
| **Camp**         | 3D object đại diện cho task trên bàn cờ (BoxGeometry, kích thước ∝ effort)     |
| **Unit**         | 3D object đại diện cho nhân sự trên bàn cờ (ConeGeometry)                      |
| **Fortress**     | Thành trì 3D ở chân trời = deadline dự án (glow mạnh khi nguy cấp)             |

---

### Design System — Desert Empire Theme

```
Colors:
  --dusk:   #1E1B2E   (background tối)
  --sand:   #C2956C   (primary accent — sand/gold)
  --stone:  #4A3728   (secondary surfaces)
  --amber:  #F59E0B   (warning, CTA, highlight)
  --oasis:  #10B981   (success, on-track, done)
  --danger: #EF4444   (critical, error)

Typography:
  Headings:  Cinzel (serif, fantasy medieval feel)
  Body:      Inter (sans-serif, readable)
  Code/data: JetBrains Mono

Spacing: 4px base unit
Border radius: 8px (cards), 4px (inputs), 9999px (chips/badges)

Animations:
  pulse-slow:  opacity/scale pulse 3s ease
  glow:        box-shadow amber glow
  float:       translateY subtle -4px loop
```

---

### User Roles (Cho Màn Hình / Permission Context)

| Role                | Màn hình chính                  | Quyền                           |
| ------------------- | ------------------------------- | ------------------------------- |
| **Project Manager** | Create Project, Strategic Board | Tạo project, snapshot, finalize |
| **Tech Lead**       | Strategic Board (edit tasks)    | Adjust effort, approve tasks    |
| **Team Member**     | (Phase 5+) Execution Tracker    | Update daily progress           |
| **Org Admin**       | (Phase 5+) Personnel Mgmt       | Manage personnel                |

> **MVP Demo chỉ cần PM + Tech Lead flow.**

---

### Demo User Flow (2.5 phút)

```
[1] Landing Page (10s)
    → User thấy Desert Empire hero, chọn "Acme Corp" org
    → Click "Get Started" → navigate to /create

[2] Create Project Wizard (25s)
    → Step 1: Nhập tên project "E-Commerce Platform v2",
              deadline Jun 30, budget $52,000,
              proposal text (AI đọc để generate tasks)
    → Click "Analyze with AI →"
    → Step 2: AI + COCOMO generate 11 tasks tự động
              Hiển thị effort breakdown (6 cột mỗi task)
              PM/Tech Lead chỉnh sửa inline
    → Step 3: Confirm → "Launch Project" → navigate to /board

[3] Strategic Board — HERO SCREEN (100s)
    → P(on_time) badge hiện 87% 🟢 trên TopBar
    → 3D desert scene: 11 task camps, 4 personnel units
    → Demo: kéo "Linh Nguyen" từ sidebar thả lên "Catalog UI" camp
    → P(on_time) update realtime → 91% ↑
    → Click task "Stripe Integration" → TaskDetailDrawer slide in
    → Chọn WFU mode "Quality ×1.5" cho Duc Vo
    → WarningBar hiện: ⚠️ CAPACITY — Duc Vo at 97%
    → Click P(on_time) badge → expand panel với 14-day sparkline
    → Click "Split Task" → SplitModal → AI suggests 3 subtasks
    → P(on_time) preview: 87% → 91% ↑

[4] Wrap (15s)
    → "This is intelligent resource planning, gamified."
```

---

### Screens Cần Implement (MVP — 3 màn hình)

#### Screen 1: Landing / Org Selector

- **Route:** `/`
- **File:** `app/page.tsx`
- **Mục đích:** Entry point — tạo ấn tượng ban đầu, chọn org
- **Key elements:**
  - SVG hero background: cát, dunes, thành trì xa, stars
  - Shimmer title: "Desert Empire Resource Planning"
  - Org selector cards: logo, tên, P(on_time) health badge
  - "Get Started" CTA → `/create`
- **Tone:** Epic, cinematic, dark fantasy

#### Screen 2: Create Project Wizard

- **Route:** `/create`
- **File:** `app/create/page.tsx`
- **Mục đích:** PM nhập thông tin + xem AI generate tasks + confirm
- **Key elements:**
  - Step progress bar (1 → 2 → 3)
  - Step 1: Form (name, deadline, budget) + **Proposal textarea** (PM mô tả dự án)
  - Step 2: Split layout — left COCOMO summary / right editable task list
    - Mỗi task card có 6 effort inputs: Inv / Des / Imp / Test / Rev / Rel
    - Tổng effort tự tính
  - Step 3: Summary + "Launch Project" CTA
- **Tone:** Professional, wizard-style, clean

#### Screen 3: Strategic Board ⭐

- **Route:** `/board` (hoặc `/org/[orgId]/projects/[projectId]/scenarios/[scenarioId]`)
- **File:** `app/board/page.tsx`
- **Mục đích:** Core planning screen — phân bổ nhân sự realtime trên bàn cờ 3D
- **Layout:**
  ```
  ┌─────────────────────────────────────────────────────────────┐
  │ TopBar: Logo | Breadcrumb | P(on_time)Badge | Tabs | Actions │
  ├───────────┬──────────────────────────────────┬──────────────┤
  │Personnel  │   THREE.JS 3D BOARD              │  Task Panel  │
  │Sidebar    │   (Desert Empire Scene)          │  (right)     │
  │(280px)    │   - Camps = Tasks (BoxGeometry)  │  (320px)     │
  │           │   - Units = Personnel (Cones)    │              │
  │           │   - Fortress = Deadline          │              │
  │           │   - Dependency Lines             │              │
  ├───────────┴──────────────────────────────────┴──────────────┤
  │ WarningBar (collapsible) — 🔴 Critical / 🟠 Warning / 🟡 Info│
  └─────────────────────────────────────────────────────────────┘
  ```
- **Sub-components (all render within this route):**
  - `TopBar` — P(on_time) badge, scenario selector, view tabs, AI prompt
  - `PersonnelSidebar` — draggable personnel cards, WFU bars
  - `StrategicBoard` — Three.js canvas (main focus)
  - `TaskPanel` — task list by status
  - `WarningBar` — collapsible warning badges
  - `TaskDetailDrawer` — slide-in khi click task
  - `PersonnelDetailDrawer` — slide-in khi click person
  - `AIPromptPanel` — expandable từ TopBar
  - `TaskSplitModal` — split task into subtasks
  - `TaskMergeModal` — merge tasks

---

**Tech Stack:** Next.js 15 · React 19 · Three.js · TypeScript strict · Tailwind CSS v4

**Target Screens (3 total):**

1. ✅ **Landing / Org Selector** — Context
2. ✅ **Create Project Wizard** — AI COCOMO estimation (value prop)
3. ✅ **Strategic Board** ⭐ — Core feature (3D board, drag-drop, realtime P(on_time))

**Cut (Phase 6 - Future enhancement):**

- ❌ Org Dashboard
- ❌ Project Hub
- ❌ Gantt Chart
- ❌ Dependency Graph
- ❌ Execution Tracker
- ❌ Personnel Management

**Timeline:** ~2-3 weeks (down from 6 weeks)

---

## Phase 1: Foundation & Core Layout (Week 1)

### Components to Build

- [ ] **LandingPage** — Org selector landing with Desert Empire theme
- [ ] **CreateProjectWizard** — 3-step form (details → COCOMO review → confirm)
- [ ] **StrategicBoardLayout** — Main layout wrapper (TopBar, PersonnelSidebar, 3DBoardCanvas, TaskPanel, WarningBar)
- [ ] **TopBar** — Logo, P(on_time) badge, scenario selector, view tabs, AI prompt button

### Routes Setup

- [ ] Configure Next.js App Router structure (3 routes only):
  - [ ] `/` → Landing page
  - [ ] `/create` → Create project wizard
  - [ ] `/board` → Strategic board (pre-loaded with demo scenario)
- [ ] Setup dynamic route parameters: `[orgId]`, `[scenarioId]` (optional, can use mock data)
- [ ] Create layout.tsx for root + /board levels

### State Management

- [ ] Initialize Zustand store: `scenarioStore.ts`
  - [ ] `scenario: ScenarioDetail | null`
  - [ ] `tasks: Task[]`
  - [ ] `assignments: ResourceAssignment[]`
  - [ ] `warnings: Warning[]`
  - [ ] `selectedTaskId: string | null`
  - [ ] `projectData: ProjectDetail | null` (for demo mode)
- [ ] Create API integration layer OR mock data provider: `lib/api/scenarios.ts`
- [ ] Setup React Query for server state sync (or stub for demo)

### Styling Foundation

- [ ] Configure Tailwind v4 with custom theme tokens
  - [ ] Color palette (Dusk #1E1B2E, Sand #C2956C, Stone #4A3728, Amber #F59E0B, Oasis #10B981)
  - [ ] Typography (Cinzel headings, Inter body)
- [ ] Create `globals.css` with animations (`pulse-slow`, `glow`, `float`)
- [ ] Setup `prefers-reduced-motion` media query

---

## Phase 2: Landing, Create Project & Strategic Board UI Components (Week 1-2)

### Landing Page Components

- [ ] **LandingHero** — Desert Empire hero section
  - [ ] SVG background (dunes, fortress, stars)
  - [ ] Shimmer animation on title + tagline
  - [ ] "Get Started" CTA button

- [ ] **OrgSelector** — Organization selector cards
  - [ ] Card layout (org logo, name, P(on_time) health badge)
  - [ ] Click card → navigate to /create
  - [ ] Demo org pre-selected ("Acme Corp")

### Create Project Wizard Components

- [ ] **CreateProjectForm** — 3-step wizard
  - [ ] **Step 1:** Form inputs (project name, deadline, budget, proposal)
  - [ ] **Step 2:** COCOMO AI estimation
    - [ ] Left sidebar: proposal summary + COCOMO calculation display
    - [ ] Right panel: generated task cards with effort breakdown (6 columns)
    - [ ] AI estimation logic (can be mock)
  - [ ] **Step 3:** Confirmation + launch CTA
  - [ ] JavaScript: `showStep(n)` navigation function

### Strategic Board — Core Components

- [ ] **PersonnelSidebar**
  - [ ] Card layout (avatar, name, seniority badge, WFU bar)
  - [ ] Search + filter inputs
  - [ ] Click → open PersonnelDetailDrawer
  - [ ] Draggable (enable for drop onto board)

- [ ] **PersonnelDetailDrawer** (slide-in panel, right)
  - [ ] Avatar + name + badge + email header
  - [ ] XP section (level, progress bar, recent events)
  - [ ] Skill matrix table (clickable cells to cycle ★)
  - [ ] Allocation doughnut chart (SVG)
  - [ ] WFU load bar with warnings

- [ ] **TaskPanel**
  - [ ] Task cards grouped by status (draft/todo/in_progress/done)
  - [ ] Each card: name, category icon, effort badge, assigned avatars, warning indicator
  - [ ] Click → open TaskDetailDrawer
  - [ ] "Add task" + "AI suggest" buttons
  - [ ] Filter/sort dropdowns

- [ ] **TaskDetailDrawer** (slide-in panel, right)
  - [ ] Description textarea
  - [ ] Effort breakdown editor (6 columns: Inv/Des/Imp/Test/Rev/Rel)
  - [ ] Techstack chips + language filters
  - [ ] Assignment section with PersonalAssignmentCard (loop)
  - [ ] Dependency mini-tree
  - [ ] AI re-estimate prompt input
  - [ ] Save Changes button

- [ ] **WFUModeSelector** (component within assignment card)
  - [ ] 3 radio buttons: Standard / Fast ×1.2 / Quality ×1.5
  - [ ] Disable Fast/Quality if `skillMatches === false`
  - [ ] Tooltip on disabled state

- [ ] **CompletionProbabilityBadge**
  - [ ] Render P(on_time) % with color (🟢≥80% / 🟡50-80% / 🔴<50%)
  - [ ] Show EAC vs deadline delta
  - [ ] Click → expand detail panel (gauge, risk factors, "Add Support" CTA)
  - [ ] Auto-update after any task change

- [ ] **WarningBar**
  - [ ] Badges grouped by severity (🔴 Critical / 🟠 Warning / 🟡 Info)
  - [ ] Click to expand detail
  - [ ] Acknowledge button per warning

### Gap Fixes (from Feature Coverage Analysis — integrate here)

- [ ] **AIPromptPanel** — `POST /projects/{id}/analyze` + `POST /scenarios/{id}/risk-analysis`
  - [ ] Textarea ở Create Project Step 1: PM nhập proposal text → "Analyze with AI →" button
  - [ ] Expandable panel trên Strategic Board TopBar: Ask AI free-form input
  - [ ] Quick action buttons: "Generate tasks", "Analyze risks", "Suggest optimization"
  - [ ] Response area: structured cards + raw text

- [ ] **TaskSplitModal** — `POST /tasks/{id}/split`
  - [ ] Action button "🔀 Split Task" trong TaskDetailDrawer footer
  - [ ] Modal: chọn N subtasks (2/3/4) hoặc "Ask AI to suggest"
  - [ ] Preview list subtasks với effort phân chia
  - [ ] P(on_time) preview: before → after split
  - [ ] "Apply Split" → gọi API → cập nhật board

- [ ] **TaskMergeModal** — `POST /tasks/merge`
  - [ ] Action button "🔗 Merge With…" trong TaskDetailDrawer footer
  - [ ] Modal: chọn task(s) để merge vào
  - [ ] Preview merged task + tổng effort
  - [ ] "Apply Merge" → gọi API → cập nhật board

- [ ] **CompletionProbabilityBadge — Trend Sparkline** — `GET /scenarios/{id}/completion-history`
  - [ ] Expand panel khi click badge: bổ sung SVG sparkline 14-day trend
  - [ ] Y-axis: 0-100%, X-axis: ngày, data dots + line
  - [ ] Amber threshold line ở 80%
  - [ ] Annotation: "+Npp in 14 days", trend direction

---

## Phase 3: Three.js Strategic Board (Week 2-3)

### Three.js Core Implementation

- [ ] **StrategicBoard** (Three.js canvas component)
  - [ ] Create Three.js scene + camera + renderer
  - [ ] Desert environment setup:
    - [ ] PlaneGeometry: sand ground
    - [ ] Gradient sky (sunset colors)
    - [ ] Background mesh: fortress silhouette
    - [ ] Directional + ambient lighting

### Task Objects (Camps)

- [ ] BoxGeometry per task, size ∝ effort_total_days
- [ ] Color by status (draft=gray, todo=tan, in_progress=amber, done=green)
- [ ] Floating text label (task name) above each box
- [ ] Click detection (raycasting) → select task
- [ ] Hover: subtle glow + tooltip
- [ ] Selected: highlight + full glow

### Personnel Objects (Units)

- [ ] ConeGeometry or CylinderGeometry per person
- [ ] Unique color per person (from palette)
- [ ] Position: standing next to assigned camps
- [ ] Unassigned personnel: idle area on left
- [ ] Animate movement when reassigned (0.3s easing)

### Interactive Features

- [ ] **Drag & Drop (Raycasting)**
  - [ ] Enable pointer events on canvas
  - [ ] Detect hover on camp/unit objects
  - [ ] Implement pointerdown → pointermove → pointerup (drop)
  - [ ] Drag PersonnelCard from sidebar → drop on board
  - [ ] Optimistic UI update + API call

- [ ] **Connections Visualization**
  - [ ] Lines between dependent tasks (glowing amber/red paths)
  - [ ] Lines between personnel and their task camps
  - [ ] Animate edges during dependency changes

- [ ] **Camera & Controls**
  - [ ] OrbitControls: mouse drag to rotate, scroll to zoom
  - [ ] Double-click to focus on selected task

- [ ] **Deadline Indicator**
  - [ ] Fortress silhouette in background
  - [ ] Pulsing glow intensity ∝ urgency (P(on_time) %)
  - [ ] Color shift: green (on track) → amber → red (critical)

- [ ] **Panel Resize Handles**
  - [ ] Left sidebar divider: draggable (280px ↔ 350px range)
  - [ ] Right panel divider: draggable (320px ↔ 400px range)
  - [ ] Persist sizes to localStorage

- [ ] **Keyboard Shortcuts**
  - [ ] `Esc` → Deselect / close drawers
  - [ ] `?` → Show help modal

- [ ] **Real-time Updates**
  - [ ] Task edit → recalculate P(on_time) → update badge
  - [ ] Assignment change → update WFU bars
  - [ ] Brooks' Law warning trigger (>50% done + new assignment)

---

## Phase 4: Polish & Testing (Week 3)

### Performance

- [ ] Optimize Three.js:
  - [ ] Frustum culling for off-screen objects
  - [ ] Object pooling for camp/unit reuse
  - [ ] Debounce resize events

- [ ] Optimize React:
  - [ ] Memoize PersonnelSidebar, TaskPanel, StrategicBoard
  - [ ] Batch state updates (Zustand)
  - [ ] Code splitting for 3D bundle

### Accessibility

- [ ] Keyboard navigation (Tab through tasks, Enter to select)
- [ ] A11y labels for Three.js canvas
- [ ] WarningBar: `aria-live="polite"` for auto-announce
- [ ] WCAG 2.1 AA color contrast check
- [ ] Screen reader testing

### Error Handling

- [ ] Network error fallback UI
- [ ] Partial state sync (graceful degradation)
- [ ] Toast notifications for API errors
- [ ] Retry logic with exponential backoff

### Testing

- [ ] Component unit tests (Vitest) for:
  - [ ] Form validation (Create Project)
  - [ ] Zustand store mutations
  - [ ] Three.js raycasting

- [ ] Integration tests (React Testing Library):
  - [ ] Landing → Create Project → Strategic Board flow
  - [ ] Assign personnel → update P(on_time)
  - [ ] Edit task effort → realtime update
  - [ ] Drag-drop assignment

- [ ] Manual testing (critical for demo):
  - [ ] 3D board rendering on target device
  - [ ] Drag-drop responsiveness
  - [ ] P(on_time) update latency
  - [ ] Browser compatibility (Chrome, Safari, Edge)

### Demo Prep

- [ ] Create demo scenario with realistic data
- [ ] Prepare speaker notes for 2.5-min flow
- [ ] Test on demo device/display
- [ ] Create fallback (screenshot) if 3D rendering fails
- [ ] Video recording backup

---

## Key Implementation Considerations

### 1. P(on_time) Calculation

**Dependency:** Backend must provide endpoint `GET /scenarios/{scenarioId}/completion-probability`

Expected response:

```json
{
  "p_on_time": 0.87,
  "p_on_time_distribution": [0.68, 0.72, 0.70, ...],
  "eac_date": "2025-06-22",
  "deadline": "2025-06-30",
  "risk_factors": [
    { "type": "CAPACITY", "impact": -0.05, "task_id": "stripe" },
    { "type": "SKILL_MISMATCH", "impact": -0.03, "task_id": "mobile" }
  ]
}
```

### 2. Realtime Optimism

- Always update local state before API call
- Show loading indicator if API takes >300ms
- Rollback on error with toast notification
- Maintain task order/selection through updates

### 3. LocalStorage Schema

```javascript
// grp-panel-left: pixel width (min 240, max 400)
// grp-panel-right: pixel width (min 240, max 400)
// scenario-view: 'board' | 'gantt' | 'deps' | 'calendar'
// hidden-warnings: string[] (warning type IDs)
```

### 4. API Endpoints Required

| Method | Path                                             | Purpose                              |
| ------ | ------------------------------------------------ | ------------------------------------ |
| GET    | `/scenarios/{scenarioId}`                        | Fetch scenario + tasks + assignments |
| GET    | `/scenarios/{scenarioId}/completion-probability` | Real-time P(on_time) calc            |
| GET    | `/scenarios/{scenarioId}/completion-history`     | P(on_time) trend sparkline data      |
| POST   | `/assignments`                                   | Create assignment                    |
| DELETE | `/assignments/{assignmentId}`                    | Remove assignment                    |
| PATCH  | `/tasks/{taskId}`                                | Edit task (effort, dates, etc.)      |
| POST   | `/tasks/{taskId}/split`                          | Split task into N subtasks           |
| POST   | `/tasks/merge`                                   | Merge multiple tasks into one        |
| POST   | `/scenarios/{scenarioId}/snapshot`               | Save scenario snapshot               |
| POST   | `/scenarios/{scenarioId}/optimize`               | Genetic algorithm optimize           |
| POST   | `/scenarios/{scenarioId}/risk-analysis`          | LLM risk analysis                    |
| POST   | `/projects/{projectId}/analyze`                  | LLM task generation from proposal    |
| GET    | `/personnel/{personnelId}`                       | Personnel detail + XP history        |

### 5. Three.js Canvas Sizing

- Responsive to container resize (ResizeObserver)
- Maintain 60 FPS (requestAnimationFrame loop)
- Fallback 2D canvas fallback if WebGL unavailable
- Test on mobile (touch zoom support)

### 6. Skill Matching Logic (WFUModeSelector)

```typescript
function canUseFastMode(task: Task, personnel: Personnel): boolean {
  return task.techstack.every(
    (tech) =>
      personnel.skills[tech] && // has skill
      personnel.skills[tech] >= 2, // at least ★★ level
  );
}

function canUseQualityMode(task: Task, personnel: Personnel): boolean {
  return task.techstack.every(
    (tech) => personnel.skills[tech] && personnel.skills[tech] >= 3, // at least ★★★
  );
}
```

---

## Development Checklist

### Project Setup

- [ ] Clone repo, run `pnpm install`
- [ ] Create `.env.local` with `NEXT_PUBLIC_API_BASE` (backend URL)
- [ ] Test dev server: `pnpm dev`

### Component Development

- [ ] Create component.tsx in `src/components/ComponentName/`
- [ ] Create component.test.tsx alongside
- [ ] Export from `src/components/index.ts`
- [ ] Document props with TSDoc comments

### Storybook (Optional, for isolated testing)

- [ ] Setup Storybook with Next.js integration
- [ ] Create stories for: PersonnelSidebar, TaskPanel, WFUModeSelector, CompletionProbabilityBadge
- [ ] Test dark mode variations

### Code Quality

- [ ] ESLint: `pnpm lint` (should pass)
- [ ] Type check: `pnpm type-check` (strict mode)
- [ ] Format: `pnpm format` (Prettier)

### Performance Benchmarks (Target)

- [ ] First Contentful Paint (FCP): <2s
- [ ] Largest Contentful Paint (LCP): <3s
- [ ] Cumulative Layout Shift (CLS): <0.1
- [ ] Three.js frame rate: consistent 60 FPS

---

## Phase Milestones (Compressed for Competition)

| Phase | Duration | Deliverable                                                   | Status  |
| ----- | -------- | ------------------------------------------------------------- | ------- |
| 1     | Wk 1     | Routing, Zustand store, Tailwind tokens, base layouts         | 🔥 Hot  |
| 2     | Wk 1-2   | Landing + Create Project + all Strategic Board UI + Gap fixes | 🔥 Hot  |
| 3     | Wk 2-3   | Three.js 3D scene + drag-drop + realtime interactions         | ✅ MVP  |
| 4     | Wk 3     | Polish + demo testing + fallback prep                         | ✅ Demo |

**Cutline (Future Phases):**

- **Phase 5+** (if time permits after demo):
  - [ ] Gantt Chart view
  - [ ] Dependency Graph view
  - [ ] Org Dashboard + Project Hub screens
  - [ ] Execution Tracker
  - [ ] Personnel Management
  - [ ] Mobile responsiveness
  - [ ] Dark mode

---

## Notes for Team

### MVP Scope (for competition demo)

- **3 screens only:** Landing → Create Project → Strategic Board
- **Mock data allowed:** Can stub `/completion-probability` with hardcoded values
- **No backend required initially:** Demo can run fully in-browser with static scenario data
- **Performance critical:** Test on target device/projector early (3D rendering bottleneck)
- **Keyboard fallback:** If 3D rendering fails, ensure 2D layout is still usable

### Future Enhancements (Phase 5+)

- **Mobile responsiveness:** Current layout is desktop-only
- **Dark mode:** Tailwind tokens ready, toggle not implemented
- **Internationalization (i18n):** Backend spec requires it; use `next-intl` when ready
- **Gantt/Deps views:** Tab switching in TopBar can show placeholders until Phase 5
- **Personnel roster:** Hide until Phase 5 (lower priority for competition)

### Critical Dependencies

- **Backend API:** `/completion-probability` endpoint (can mock for demo)
- **Browser support:** Chrome, Safari, Edge (ensure WebGL support)
- **Three.js version:** Use latest stable (r161+) for OrbitControls compatibility
- **Tailwind v4:** Requires custom theme tokens for Desert Empire palette

---

## Feature Coverage Analysis vs. Backend

> Tổng số core feature groups từ BE spec: **~20**

| Group                  | Count | %   | Ghi chú                    |
| ---------------------- | ----: | --- | -------------------------- |
| ✅ Covered in MVP plan |    12 | 60% | Xem Phase 1-4              |
| 🟡 Intentionally Cut   |     5 | 25% | Đúng quyết định — Phase 5+ |
| 🔴 Missing Gap         |     3 | 15% | **Cần xem xét bổ sung**    |

---

### 🟡 Intentionally Cut (5/20 — 25%)

Các feature này đều có BE endpoint sẵn, nhưng **không phải core demo value** nên cut để tiết kiệm time:

| Feature                              | BE Endpoint                         | Lý Do Cut                                           | Phase    |
| ------------------------------------ | ----------------------------------- | --------------------------------------------------- | -------- |
| **Gantt Chart**                      | `GET /scenarios/{id}/gantt`         | Ít wow factor hơn 3D board                          | Phase 5+ |
| **Dependency Graph (full DAG)**      | `GET /scenarios/{id}/critical-path` | Complex render, không cần demo                      | Phase 5+ |
| **Execution Tracker + Progress Log** | `POST /tasks/{id}/progress`         | Daily logging workflow, không phải planning feature | Phase 5+ |
| **XP & Leveling UI**                 | `POST /projects/{id}/finalize`      | Gamification nice-to-have, không phải core          | Phase 5+ |
| **Personnel Management Screen**      | `GET/PATCH /orgs/{id}/personnel`    | Roster table, không ấn tượng trong demo             | Phase 5+ |

> **Nhận định:** Cắt 5 features này là đúng. Chúng thuộc tầng "workflow support" chứ không phải "intelligent planning" — là điểm mạnh cốt lõi của product.

---

### 🔴 Missing Gaps (3/20 — 15%) — Cần Xem Xét

#### Gap 1 — AI Prompt Panel (Độ ưu tiên: ⭐⭐⭐ HIGH)

**BE Support:** `POST /projects/{id}/analyze` (LLM task generation) · `POST /scenarios/{id}/risk-analysis` (LLM risk analysis)

**Vấn đề:** FE plan hiện tại có COCOMO estimation ở Step 2 của Create Project, nhưng **thiếu input giao diện để PM nhập proposal text** → LLM không có input để phân tích.

**Đề xuất feature screen / component:**

```
[Create Project — Step 1 Extension]
┌─────────────────────────────────────────────────────┐
│  Project Name: ________   Deadline: ________        │
│  Budget: ________                                   │
│                                                     │
│  📝 Project Proposal (AI sẽ đọc phần này)          │
│  ┌─────────────────────────────────────────────┐    │
│  │ Textarea — Mô tả dự án, yêu cầu kỹ thuật,  │    │
│  │ stack dự kiến, team size...                  │    │
│  └─────────────────────────────────────────────┘    │
│  [Analyze with AI →]  ← gọi POST /projects/analyze │
└─────────────────────────────────────────────────────┘
```

Và trong Strategic Board TopBar:

```
[AI Prompt Panel — expandable from TopBar]
┌─────────────────────────────────────────────────────┐
│  Ask AI: [_________________________________] [Send] │
│  Quick: [Generate tasks] [Analyze risks] [Optimize] │
│  ─────────────────────────────────────────────────  │
│  Response: structured cards hoặc raw text           │
└─────────────────────────────────────────────────────┘
```

**Fix location:** Phase 2 (Create Project Step 1) + Phase 3 (TopBar AIPromptPanel)

---

#### Gap 2 — Task Split / Merge (Độ ưu tiên: ⭐⭐⭐ HIGH)

**BE Support:** `POST /tasks/{id}/split` · `POST /tasks/merge`

**Vấn đề:** Business spec ghi rõ: _"Prompt AI: Tách task này thành 3 phần cho 3 người làm song song"_ — đây là WOW moment trong meeting demo, nhưng hoàn toàn thiếu trong FE plan.

**Đề xuất feature:** Thêm vào `TaskDetailDrawer` (context menu hoặc action button):

```
[TaskDetailDrawer — bottom action bar]
┌─────────────────────────────────────────────────────┐
│  [💾 Save Changes] [🔀 Split Task] [🔗 Merge With…] │
└─────────────────────────────────────────────────────┘

[Split Task Modal]
┌─────────────────────────────────────────────────────┐
│  Split "Catalog API" into N subtasks                │
│  N: [2] [3] [4]  or [Ask AI to suggest]            │
│                                                     │
│  👁 Preview                                         │
│  ├── Catalog API — Auth (3d, Minh)                 │
│  ├── Catalog API — Search (4d, Linh)               │
│  └── Catalog API — Webhook (2d, Duc)               │
│                                                     │
│  P(on_time) preview: 87% → 91% ↑ (+4pp)           │
│  [Cancel]  [Apply Split]                            │
└─────────────────────────────────────────────────────┘
```

**Fix location:** Phase 2 (TaskDetailDrawer) — thêm 2 buttons + 1 modal

---

#### Gap 3 — Completion History Trend Sparkline (Độ ưu tiên: ⭐⭐ MEDIUM)

**BE Support:** `GET /scenarios/{id}/completion-history` → `list[CompletionSnapshot]`

**Vấn đề:** P(on*time) badge hiện tại chỉ show current value. BE **đã có** lịch sử theo ngày nhưng FE không visualize. Judges muốn thấy *"system learns and adapts"\_ — trend line chứng minh điều đó.

**Đề xuất feature:** Expand panel khi click `CompletionProbabilityBadge`:

```
[CompletionProbabilityBadge — Expanded Panel]
┌─────────────────────────────────────────────────────┐
│  P(on_time): 87% 🟢  EAC: Jun 22 (+8d ahead)       │
│                                                     │
│  ── 14-Day Trend ──────────────────────────────    │
│  100% │                              ●●●            │
│   80% │ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─●●●───           (target) │
│   60% │         ●●●                           │
│   40% │●●●                                    │
│       └────────────────────────────────────   │
│        Jun 1        Jun 7       Jun 14        │
│  Trend: +23pp in 14 days ↑                    │
│                                               │
│  Risk Factors:                                │
│  ├── CAPACITY (Duc Vo): −5pp                  │
│  └── SKILL_MISMATCH (Mobile): −3pp            │
│                                               │
│  [⚡ Add Support]  [🤖 Ask AI]               │
└─────────────────────────────────────────────────────┘
```

**Fix location:** Phase 2 (`CompletionProbabilityBadge` expand panel) — thêm SVG sparkline

---

### 📋 Gap Resolution Plan

| Gap                        | Fix In                              | Effort                         | Impact                        |
| -------------------------- | ----------------------------------- | ------------------------------ | ----------------------------- |
| AI Prompt Panel            | Phase 2 (Create) + Phase 3 (TopBar) | Medium (1-2 days)              | ⭐⭐⭐ Critical for demo flow |
| Task Split/Merge           | Phase 2 (TaskDetailDrawer)          | Small (0.5 day per modal)      | ⭐⭐⭐ WOW moment             |
| P(on_time) Trend Sparkline | Phase 2 (Badge expand)              | Small (SVG sparkline ~0.5 day) | ⭐⭐ Convinces judges         |

> **Tổng effort thêm:** ~3-4 ngày dev, recommend add vào **Phase 2** trước khi bước sang Phase 3 Three.js.
