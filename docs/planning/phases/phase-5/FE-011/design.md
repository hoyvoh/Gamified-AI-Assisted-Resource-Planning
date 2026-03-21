# Design — FE-011

## Files to Create/Modify
- ui/src/components/GanttChart/index.tsx
- ui/src/components/GanttChart/GanttCanvas.tsx — SVG rendering
- ui/src/components/GanttChart/GanttBar.tsx
- ui/src/components/GanttChart/GanttHeader.tsx — date axis
- ui/src/components/GanttChart/GanttFilters.tsx
- ui/src/components/GanttChart/MilestoneDiamond.tsx
- ui/src/hooks/useGanttData.ts
- ui/src/lib/api/gantt.ts

## Technical Design

### Layout
```
Header: [Category] [Task Name] | [day1][day2][day3]...
Row:    [Backend]  [Auth API]  | [====planned====]
                               |    [==actual==]
```

### SVG Bar Rendering
```typescript
// For each task:
// x = (planned_start - minDate) * dayWidth
// width = effort_total_days * dayWidth
// Actual: same x, width = completion_pct * planned_width, fill=striped pattern

// Milestone: diamond at planned_end of critical tasks
```

## Acceptance Criteria
- [ ] All tasks shown with correct planned dates
- [ ] Actual progress bars show current completion %
- [ ] Filter by person shows only that person's assigned tasks
- [ ] Click bar → TaskDetailDrawer opens
- [ ] Milestone diamonds at critical task end dates
- [ ] pnpm test:unit:run passes
