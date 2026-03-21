# Design — INT-001

## Files to Create/Modify
- ui/src/types/api.ts  (generated, do not hand-edit)
- ui/src/lib/api/orgs.ts
- ui/src/lib/api/personnel.ts  (complete)
- ui/src/lib/api/projects.ts
- ui/src/lib/api/scenarios.ts
- ui/src/lib/api/tasks.ts
- ui/src/store/scenarioStore.ts
- ui/src/store/personnelStore.ts
- ui/.env.local.example

## Technical Design

### Generate Types
```bash
cd ui
npx openapi-typescript http://localhost:8000/openapi.json -o src/types/api.ts
```

### Zustand Store
```typescript
// src/store/scenarioStore.ts
interface ScenarioStore {
  scenario: ScenarioDetail | null
  tasks: Task[]
  assignments: ResourceAssignment[]
  warnings: Warning[]
  selectedTaskId: string | null
  isLoading: boolean

  loadScenario: (scenarioId: string) => Promise<void>
  assignPersonnel: (taskId, personnelId, pct, mode) => Promise<void>
  removeAssignment: (assignmentId) => Promise<void>
  updateTask: (taskId, patch) => Promise<void>
  snapshotScenario: (name) => Promise<string>
}
```

### API Client Pattern
```typescript
// All functions use fetch with typed responses
export async function fetchScenario(id: string): Promise<components['schemas']['ScenarioDetail']> {
  const res = await fetch(`${API_BASE}/scenarios/${id}`)
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json()
}
```

## Acceptance Criteria
- [ ] npx openapi-typescript ... generates src/types/api.ts without error
- [ ] Personnel sidebar loads real data from running backend
- [ ] Task panel loads real data from running backend
- [ ] Creating a task via FE form persists and survives page refresh
- [ ] Manual smoke test: create org → personnel → project → scenario → tasks → view in UI
- [ ] pnpm type-check passes with generated types
