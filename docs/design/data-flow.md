# Data Flow Specification

---

## Flow 1 — Project Onboarding & Task Generation

```
PM nhập Project Proposal (text)
  │
  ▼
POST /projects  →  lưu raw_proposal, tạo project (status=draft)
  │
  ▼
POST /projects/{id}/analyze  →  LLM Service
  │   Input: raw_proposal + org personnel context + techstack hints
  │   Prompt: "Analyze this proposal, extract tasks with effort estimates"
  │
  ▼
LLM Response → Task List (JSON)
  │   Mỗi task: name, category, techstacks, effort_breakdown, dependencies, priority
  │
  ▼
COCOMO II Service  →  validate & refine effort estimates
  │   Áp dụng scale factors, effort multipliers
  │
  ▼
POST /scenarios (auto-create "Draft Scenario")
  +  POST /tasks (bulk)  →  tasks saved với status=draft, positions tự động layout
  │
  ▼
WebSocket push → FE nhận danh sách task → hiển thị right panel + board
```

---

## Flow 2 — Resource Assignment (Drag & Drop)

```
User kéo nhân sự A vào Task T trên board
  │
  ▼
FE state update optimistic (immediate visual feedback)
  │
  ▼
POST /scenarios/{id}/assignments  →  { task_id, personnel_id, allocation_pct, wfu_mode }
  │
  ▼
Assignment Service
  ├── Tính effective_wfu = base_wfu × skill_multiplier × allocation_pct
  ├── Cập nhật planned_end của task
  └── Trigger Warning Engine
         │
         ├── Check: total daily hours > 7 → CAPACITY warning
         ├── Check: junior alone → JUNIOR_ALONE warning
         ├── Check: budget recalculation → BUDGET warning
         └── Check: critical path → TIME_RISK warning
  │
  ▼
Response: { assignment, warnings[], updated_task_dates }
  │
  ▼
FE: update board state + hiển thị warnings toast/badge
```

---

## Flow 3 — Optimization Request

```
User nhấn "Optimize" (chọn mode: makespan | budget)
  │
  ▼
POST /scenarios/{id}/optimize  →  { mode, constraints }
  │
  ▼
Optimization Service
  ├── Build chromosome representation (task × personnel matrix)
  ├── Genetic Algorithm:
  │     Population: 100, Generations: 500
  │     Fitness: makespan hoặc budget cost
  │     Constraints: capacity, dependencies, junior_rule
  └── Return top 3 solutions
  │
  ▼ (background job, ~5-30s)
WebSocket push → { solutions: [{ score, assignments[], warnings[] }] }
  │
  ▼
FE: hiển thị comparison panel
User: accept all | accept partial | dismiss
  │
  ▼
PATCH /scenarios/{id}/assignments (bulk)  →  áp dụng phân bổ mới
```

---

## Flow 4 — Scenario Snapshot

```
User nhấn "Snapshot as Plan A"
  │
  ▼
POST /scenarios/{id}/snapshot  →  { name: "Plan A" }
  │
  ▼
Backend: deep copy scenario + tasks + assignments
  is_snapshot=true  →  immutable, không thể edit
  │
  ▼
Response: { new_scenario_id }
  │
  ▼
FE: mở scenario mới (editable fork) để tiếp tục deal
  Sidebar hiển thị danh sách scenarios để switch/compare
```

---

## Flow 5 — Progress Tracking (Execution Mode)

```
Member mở task của mình
  │
  ▼
Input: completion_pct (0-100), hours_spent, notes
  │
  ▼
POST /tasks/{id}/progress  →  { personnel_id, log_date, completion_pct, hours_spent }
  │
  ▼
Progress Service
  ├── Lưu log
  ├── Tính Earned Value (EV = BAC × completion_pct)
  ├── Tính Earned Value Metrics:
  │     SPI = EV / PV (Schedule Performance Index)
  │     CPI = EV / AC (Cost Performance Index)
  │     EAC = BAC / CPI (Estimate at Completion)
  └── Nếu EAC > deadline → trigger TIME_RISK warning
  │
  ▼
WebSocket push → PM dashboard update
  Gantt chart auto-update
  Calendar view update
```

---

## Flow 6 — Risk Analysis (LLM)

```
User prompt: "Analyze risks for current scenario"
  │
  ▼
POST /scenarios/{id}/risk-analysis
  │
  ▼
Context builder:
  ├── Tasks + assignments + dependencies
  ├── Personnel skill matrix
  ├── Current warnings
  └── Project deadline + budget
  │
  ▼
LLM Service  →  prompt với full context
  │
  ▼
LLM Response: structured risks[]
  Mỗi risk: { type, description, probability, impact, mitigation_suggestion }
  │
  ▼
POST lưu vào llm_sessions
  │
  ▼
FE: Risk panel với danh sách rủi ro, có thể click từng rủi ro để xem detail
```

---

## Flow 7 — XP Assignment (End of Project)

```
PM/Admin đánh dấu project = completed
  │
  ▼
XP Engine tính toán cho từng member:
  ├── Foreach task assigned to member:
  │     + task completed on time → base XP
  │     + early delivery → bonus XP
  │     + techstack mới → skill XP + level up check
  │     + quality (ít bug reports) → quality bonus
  └── Foreach mentoring activity (senior kèm junior) → mentoring XP
  │
  ▼
POST /projects/{id}/finalize  →  bulk xp_events created
  │
  ▼
Personnel skill_matrix_entries update (level up nếu đủ XP)
  │
  ▼
FE: End-of-project summary screen, mỗi member xem XP + skill progress
  │
  ▼
VelocityCalibrationService:
  Foreach member: compute actual_wfu = actual_hours / planned_hours
  Update personnel.velocity_baseline (EMA: 0.7 × old + 0.3 × actual)
  → Improves WFU accuracy for future project estimates
```

---

## Flow 8 — Completion Probability Computation

```
Trigger: after assignment change / after progress log / on demand
  │
  ▼
CompletionProbabilityService.compute(scenario_id)
  ├── Get SPI + SPI variance (last 7 days velocity logs)
  ├── Get critical path float (CriticalPathService)
  ├── Get active warnings + risk weights:
  │     CAPACITY: -0.15  JUNIOR_ALONE: -0.12
  │     LANGUAGE_BARRIER: -0.10  SKILL_MISMATCH: -0.08
  ├── Compute: p_on_time = f(SPI, variance, slack, risks)
  ├── Compute: eac_date, days_delta (positive = ahead)
  └── Save to scenario_completion_snapshots
  │
  ▼
Response: { p_on_time, eac_date, days_delta, confidence_level }
  │
  ▼
FE: CompletionProbabilityBadge updates in TopBar
    If days_delta > 0: show "🟢 +N days ahead"
    If days_delta < 0: show "🔴 -N days behind"
    If p_on_time < 0.5: show "Add Support" button → AddWFUModal
```

---

## Flow 9 — Add WFU Mid-Execution

```
PM sees p_on_time < 0.5 warning
  │
  ▼
Click "Add Support" → AddWFUModal opens
  │
  ├── Option A: Add new personnel to task
  │     PATCH /scenarios/{id}/assignments (new person)
  │
  └── Option B: Increase existing allocation %
        PATCH /assignments/{id} { allocation_pct: new_value }
  │
  ▼
For each change:
  Warning Engine recomputes → Capacity check
  CompletionProbabilityService.compute() → new P(on_time)
  │
  ├── If task.completion_pct > 50% → Brooks' Law check:
  │     POST body or computed flag: task_late_addition = true
  │     Warning: "Task is 65% done — adding people now may slow it down"
  │
  └── P(on_time) preview updates in modal realtime
  │
  ▼
PM accepts → FE closes modal, board/Gantt refresh
```

---

## Flow 10 — In-Meeting Deadline Negotiation

```
PM/Tech Lead changes task planned_end in TaskDetailDrawer
  │
  ▼
PATCH /tasks/{id} { planned_end: new_date }
  │
  ▼
Task schedule recalculated:
  ├── Downstream task planned_start adjusted (dependency propagation)
  ├── CriticalPathService recomputed
  └── CompletionProbabilityService.compute() triggered
  │
  ▼
WebSocket push → all session participants receive:
  { updated_tasks[], new_critical_path, new_p_on_time }
  │
  ▼
FE: Gantt bars shift immediately for all participants
    CompletionProbabilityBadge updates
    Dependency deadline markers shift
```

---

## Warning Engine — Trigger Map

```
Sự kiện                         → Warnings kiểm tra
────────────────────────────────────────────────────
Assignment thêm/sửa/xóa         → Capacity, Junior alone, Budget, Language barrier,
                                   License, Skill mismatch, Time risk
Task dates thay đổi             → Dependency, Time risk
Task required_language thay đổi → Language barrier
Personnel allocation % thay đổi → Capacity (across all projects)
Budget thay đổi                 → Budget
Tool seat assigned/removed      → License
Progress log thêm               → Time risk (EAC recalc) + P(on_time) snapshot
Scenario switch                 → Recompute all warnings + P(on_time)
```

---

## State Management (Frontend)

```
Global State (Zustand / React Context)
  ├── currentScenario: ScenarioDetail
  │     ├── tasks: Task[]
  │     ├── assignments: ResourceAssignment[]
  │     ├── warnings: Warning[]
  │     └── completionProbability: CompletionProbabilityResult | null
  ├── personnel: Personnel[]  (org-level, loaded once)
  ├── boardCamera: { position, zoom }
  ├── selectedTaskId: string | null
  ├── activeView: 'board' | 'gantt' | 'dependency' | 'calendar'
  └── llmSession: { loading, lastPrompt, lastResponse }
```
