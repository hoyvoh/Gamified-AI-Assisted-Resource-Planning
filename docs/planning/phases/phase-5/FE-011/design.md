# Design — FE-011

## Components to Develop

| Component | Purpose |
|-----------|---------|
| `GanttChart` | Root container — manages layout, filters, scroll |
| `GanttHeader` | Date axis (X), filter controls |
| `GanttRow` | Single task row with all 3 bar layers |
| `GanttBar` | Individual bar (baseline / planned / actual) |
| `GanttMilestone` | Diamond marker at milestone date |
| `GanttMarker` | Vertical line (Today / Deadline / EAC / ScenarioSwitch) |
| `GanttTooltip` | Hover tooltip on bars |
| `GanttFilters` | By-person / by-milestone / by-status filter controls |

## Component Relationships
```
GanttChart
  ├── GanttFilters (top bar)
  ├── GanttHeader (date axis)
  └── ScrollableBody
        ├── GanttMarker × N (Today, Deadline, EAC, scenario switches)
        └── GanttRow × N (one per task)
              ├── GanttBar (baseline — grey, thin)
              ├── GanttBar (planned — blue)
              ├── GanttBar (actual — green/amber/red, overlaps planned)
              └── GanttMilestone (if task is milestone)
```

## Data Flow
```
GanttChart receives:
  - tasks[]: id, planned_start, planned_end, completion_pct, status, assignees
  - baseline[]: task_id → baseline_start, baseline_end (null before launch)
  - progressLogs[]: task_id → completion_pct, updated_at
  - scenarioSwitches[]: switched_at, trigger, scenario_name
  - project: deadline, started_at, eac_date

Bar position calculation (no code — describe logic):
  - X position = (date - timeline_start) / total_days × canvas_width
  - Planned bar width = (planned_end - planned_start) / total_days × canvas_width
  - Actual bar width = planned_bar_width × completion_pct

Bar color (actual):
  - completion_pct on track (vs today) → green
  - behind schedule (planned_end < today and < 100%) → red
  - at risk → amber

Drag-to-reschedule:
  - User drags planned bar right/left
  - New dates computed from drag delta
  - Optimistic update in local state
  - PATCH /tasks/{id} with new dates
  - On success: warnings recomputed (DEADLINE_CHANGE may trigger)
  - On failure: rollback to original dates
```

## Filter Behaviors
| Filter | Effect |
|--------|--------|
| By Person | Show swimlane per person — each person gets their own row group |
| By Milestone | Group task rows under their milestone header |
| By Status | Toggle visibility: hide done / show only at-risk / show all |

## Acceptance Criteria
- [ ] All tasks render with correct planned bar dates
- [ ] Baseline bars visible (grey) after project launch, hidden before
- [ ] Actual bars overlay planned bars from ProgressLogs data
- [ ] Actual bar color: green=on track, amber=at risk, red=behind
- [ ] Scenario switch markers appear on correct dates with trigger tooltip
- [ ] Today / Deadline / EAC markers visible and correctly positioned
- [ ] EAC marker: green if before deadline, red if after
- [ ] Drag planned bar → new dates saved, warning may trigger
- [ ] Filter by person → swimlane view per person
- [ ] Click bar → TaskDetailDrawer opens
- [ ] `pnpm type-check` passes
