# Design — FE-013

## Files to Create/Modify
- ui/src/components/CalendarView/index.tsx
- ui/src/components/CalendarView/CalendarGrid.tsx
- ui/src/components/CalendarView/DayCell.tsx
- ui/src/components/CalendarView/DayPopover.tsx
- ui/src/components/CalendarView/MilestoneMarker.tsx
- ui/src/hooks/useCalendarData.ts

## Technical Design

```typescript
// For each day in month:
// activeTasks = tasks where planned_start <= day <= planned_end
// For each activeTask: show colored dot for each assigned person
// milestoneTasks = tasks where planned_end === day && priority=critical

// DayCell:
// - shows up to 3 dots, "+N more" if overflow
// - red border on today
// - ⭐ marker for milestones
```

## Acceptance Criteria
- [ ] Monthly grid renders with correct day layout
- [ ] Colored dots match personnel assignments
- [ ] Click day → popover with active tasks + assigned people
- [ ] Milestone markers appear on critical task end dates
- [ ] Navigate prev/next month
