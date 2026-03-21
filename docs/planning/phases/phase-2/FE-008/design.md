# Design — FE-008

## Files to Create/Modify
- ui/src/components/TopBar/index.tsx
- ui/src/components/ScenarioSelector/index.tsx
- ui/src/components/ScenarioSelector/SnapshotModal.tsx
- ui/src/hooks/useScenarios.ts
- ui/src/lib/api/scenarios.ts (add snapshot, fork)

## Technical Design

```tsx
// ScenarioSelector renders in TopBar
<Select value={currentScenarioId} onChange={switchScenario}>
  {scenarios.map(s => (
    <Option key={s.id} value={s.id}>
      {s.is_snapshot && <LockIcon />} {s.name}
    </Option>
  ))}
</Select>
<Button onClick={() => setShowSnapshotModal(true)}>Snapshot</Button>
```

## Acceptance Criteria
- [ ] Dropdown lists all project scenarios
- [ ] Lock icon on immutable snapshots
- [ ] Switching scenario reloads board with new data
- [ ] "Snapshot" → modal → name → API → switch to new editable fork
- [ ] Edit actions (drag, delete task) disabled on snapshot
- [ ] pnpm test:unit:run passes
