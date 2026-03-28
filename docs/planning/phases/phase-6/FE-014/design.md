# Design — FE-014

## Components to Develop

| Component | Purpose | Access |
|-----------|---------|--------|
| `ExecutionScreen` | Root layout: left panel + main Gantt + top bar | All |
| `MyTasksPanel` | Current user's assigned tasks with progress input | Members |
| `ProgressInputForm` | Completion % slider + hours + notes per task | Members |
| `ExecutionGantt` | GanttChart in execution mode (all 3 layers) | All |
| `EVMetricsSummary` | SPI, CPI, EAC, P(on_time) gauge + 14-day trend | PM only |
| `ScenarioSwitchBanner` | Critical P(on_time) alert + quick switch actions | PM only |
| `SwitchPlanDropdown` | List contingency scenarios with P(on_time) | PM only |
| `SwitchPlanConfirmModal` | Confirm switch: trigger reason + note + P(on_time) delta | PM only |

## Component Relationships
```
ExecutionScreen
  ├── TopBar (P(on_time) badge, [Switch Plan ▾] for PM)
  ├── ScenarioSwitchBanner (conditional, PM only)
  ├── MyTasksPanel (left, current user's tasks)
  │     └── ProgressInputForm × N (per assigned task)
  ├── ExecutionGantt (center — reuses GanttChart from FE-011)
  └── EVMetricsSummary (right panel or expandable drawer, PM only)
        └── P(on_time) trend chart (14-day history)
```

## Data Flow — Daily Progress Submission
```
Member selects task in MyTasksPanel
  → ProgressInputForm: set completion %, hours, notes
  → POST /tasks/{id}/progress
  → On success:
      - task completion % updates in MyTasksPanel
      - ExecutionGantt actual bar re-renders
      - P(on_time) badge in TopBar updates
      - If P(on_time) drops below threshold: EVMetricsSummary updates with amber/red
```

## Data Flow — Scenario Switch (PM)
```
Trigger A: ScenarioSwitchBanner auto-shown when P(on_time) critical
Trigger B: PM manually clicks [Switch Plan ▾] in TopBar

PM selects target scenario from SwitchPlanDropdown
  → shows: scenario name, type, P(on_time) preview, team delta
PM clicks [Confirm Switch]
  → SwitchPlanConfirmModal opens:
      - Trigger reason selector (MEMBER_DEPARTURE / SCOPE_CHANGE / DEADLINE_CHANGE / BUDGET_CUT / RISK_ESCALATION)
      - Free-text note for audit trail
      - P(on_time) change preview: 38% → 91%
  → PM confirms
  → POST /projects/{id}/scenario-switch (new_scenario_id, trigger_reason, note)
  → On success:
      - ExecutionGantt re-renders with new planned bars + new scenario switch marker
      - Old scenario archived (visible in Gantt history)
      - ScenarioSwitchBanner dismissed
```

## ScenarioSwitchBanner Layout
```
┌─ ⚠️ P(on_time) Critical (38%) ──────────────────────────────────┐
│ 3 consecutive days at risk. Suggested action: switch plan.        │
│                    [Dismiss]  [View options]  [Switch to Plan OT] │
└───────────────────────────────────────────────────────────────────┘
```

## EV Metrics Color Rules (display logic)
| Metric | Green | Amber | Red |
|--------|-------|-------|-----|
| SPI | > 0.9 | 0.7–0.9 | < 0.7 |
| CPI | > 0.9 | 0.7–0.9 | < 0.7 |
| EAC date | before deadline | within 3 days | after deadline |
| P(on_time) | > 80% | 50–80% | < 50% |

## Acceptance Criteria
- [ ] MyTasksPanel shows only current user's assigned tasks
- [ ] ProgressInputForm submits and ExecutionGantt actual bar updates
- [ ] P(on_time) badge updates after each progress submission
- [ ] EVMetricsSummary shows SPI/CPI/EAC with correct colors (PM only)
- [ ] ScenarioSwitchBanner appears when P(on_time) < 40% for 3 days
- [ ] SwitchPlanDropdown lists contingency scenarios with P(on_time)
- [ ] SwitchPlanConfirmModal: trigger reason required before confirm
- [ ] After switch: ExecutionGantt shows new planned bars + switch marker
- [ ] After switch: historical progress data still visible in Gantt
- [ ] Member view: EVMetricsSummary and SwitchPlan controls not visible
- [ ] `pnpm type-check` passes
