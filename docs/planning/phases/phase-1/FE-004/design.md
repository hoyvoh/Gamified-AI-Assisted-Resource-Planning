# Design — FE-004

## Files to Create/Modify
- ui/src/components/TaskPanel/index.tsx
- ui/src/components/TaskPanel/TaskCard.tsx
- ui/src/components/TaskPanel/TaskStatusGroup.tsx
- ui/src/components/TaskPanel/TaskDetailDrawer.tsx
- ui/src/components/TaskPanel/EffortBreakdown.tsx
- ui/src/components/TaskPanel/AddTaskForm.tsx
- ui/src/hooks/useTasks.ts
- ui/src/lib/api/tasks.ts
- ui/src/__tests__/components/TaskPanel/TaskCard.test.tsx

## Technical Design

### Category Icons
```tsx
const CATEGORY_ICONS: Record<TaskCategory, string> = {
  backend: 'mdi:server',
  frontend: 'mdi:monitor',
  devops: 'mdi:cloud',
  qa: 'mdi:bug',
  research: 'mdi:magnify',
  design: 'mdi:pencil',
  pm: 'mdi:chart-gantt',
}
```

### TaskDetailDrawer tabs
1. Overview — description, dates, priority, status
2. Effort — breakdown chart (investigate/design/implement/test/review/support)
3. Team — assigned personnel with allocation %
4. Dependencies — list with status chips

## Acceptance Criteria
- [ ] Tasks load from API, grouped by status
- [ ] TaskCard shows: name, category icon, effort total, assigned avatar count
- [ ] Warning badge shows on tasks with active warnings
- [ ] Click task → drawer opens with all 4 tabs
- [ ] Edit mode: change name, description, dates, effort values
- [ ] Add task form creates task via API
- [ ] pnpm test:unit:run passes
