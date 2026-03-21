# Design — FE-006

## Files to Create/Modify
- ui/src/components/StrategicBoard/interactions/DragDropManager.ts
- ui/src/components/StrategicBoard/interactions/Raycaster.ts
- ui/src/components/PersonnelSidebar/PersonnelCard.tsx — add draggable
- ui/src/store/scenarioStore.ts — assignPersonnel action
- ui/src/lib/api/assignments.ts

## Technical Design

### Drop Flow
```
dragstart on PersonnelCard
  → dataTransfer.setData('personnelId', id)

drop on canvas element (pointer up)
  → raycaster.intersectObjects(campMeshes)
  → if hit camp: get taskId from camp.userData.taskId
  → open AllocationModal (enter %, mode)
  → optimistic: move PersonnelUnit to camp
  → POST /scenarios/{id}/assignments
  → success: keep position, update store
  → fail: rollback position, show error toast
```

### Keyboard Fallback
```typescript
// Press Space on PersonnelCard → selectedPersonnelId = id
// Press Enter on camp (focused) → trigger assignment modal
// TabIndex on camp HTML overlay elements
```

## Acceptance Criteria
- [ ] Drag PersonnelCard → camp glows/highlights on hover
- [ ] Drop → AllocationModal appears (% + mode selector)
- [ ] Confirm → API called, unit moves to camp position
- [ ] API failure → unit returns to sidebar, error toast shown
- [ ] Keyboard: Tab to PersonnelCard → Space → Tab to task → Enter assigns
