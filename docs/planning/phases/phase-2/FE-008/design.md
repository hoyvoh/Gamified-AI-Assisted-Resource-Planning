# Design — FE-008

## Components to Develop

| Component | Location | Purpose |
|-----------|----------|---------|
| `ScenarioBar` | TopBar | Scenario selector dropdown + Launch button |
| `ScenarioDropdown` | TopBar | List scenarios with state + P(on_time) |
| `NewScenarioModal` | Modal | Name + type input for new/fork scenario |
| `ScenarioComparePanel` | Full-width overlay | Side-by-side comparison of 2 scenarios |
| `LaunchConfirmModal` | Modal | Launch confirmation with team + unassigned task summary |
| `ScenarioStateBadge` | Inline | draft / active / archived indicator |

## Component Relationships
```
TopBar
  └── ScenarioBar
        ├── ScenarioDropdown (list + select)
        │     └── ScenarioStateBadge (per item)
        ├── [+ New] → NewScenarioModal
        ├── [Fork] → NewScenarioModal (pre-filled as fork)
        ├── [Compare] → ScenarioComparePanel
        └── [🚀 Launch] → LaunchConfirmModal
```

## Data Flow — Scenario Selection
```
User selects scenario from ScenarioDropdown
  → scenarioStore.setActiveScenario(id)
  → PlanningBoard re-fetches tasks for selected scenario
  → board re-renders with new data
  → ScenarioStateBadge shows: active scenario has lock icon on edit actions
```

## Data Flow — Launch
```
PM clicks [🚀 Launch]
  → LaunchConfirmModal opens:
      shows: scenario name, start date (today), assigned members, unassigned tasks count
      if unassigned tasks exist: warning count shown, proceed allowed
  → PM confirms
  → POST /scenarios/{id}/launch
  → On success: project status → active, Mode 4 unlocked
  → TopBar [🚀 Launch] button → replaced with [Execution →] link
  → Board edit actions locked (task cards read-only for active scenario)
```

## Data Flow — Compare
```
PM clicks [Compare]
  → ScenarioComparePanel opens
  → PM selects 2 scenarios from dropdowns
  → GET /scenarios/{a}/summary + GET /scenarios/{b}/summary
  → Renders side-by-side table:
      Makespan (days), Est. cost, Team size, P(on_time), Warnings count
  → No editing in this view — read only
```

## ScenarioDropdown Layout
```
● Plan Normal        [active]  🟢 84%
○ Plan Full Resource [draft]   🟡 91%
○ Plan OT            [contingency] 🟢 96%
○ If Alice leaves    [what_if] 🔴 67%
─────────────────────────────────────
[+ New Scenario]   [Fork current]
```

## Acceptance Criteria
- [ ] ScenarioDropdown lists all scenarios with status badge + P(on_time)
- [ ] Switch scenario → board re-renders with correct data
- [ ] Create new scenario (name + type) → appears in dropdown as draft
- [ ] Fork current → new draft scenario with same tasks/assignments
- [ ] Compare panel: shows makespan, cost, P(on_time), warnings for both
- [ ] Launch modal: shows team members, unassigned task count warning
- [ ] On launch: board edit actions locked, [Execution →] link appears
- [ ] Archived scenarios: visible in dropdown, edit actions disabled
- [ ] `pnpm type-check` passes
