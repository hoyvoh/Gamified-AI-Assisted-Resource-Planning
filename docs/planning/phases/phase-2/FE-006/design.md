# Design — FE-006

## Files to Create/Modify
- `ui/src/components/PlanningBoard/TaskCard.tsx` — add drop target logic
- `ui/src/components/PlanningBoard/DeveloperCard.tsx` — add drag source logic
- `ui/src/components/PlanningBoard/AllocationModal.tsx` — % slider + WFU mode selector
- `ui/src/store/boardStore.ts` — add optimistic assignment actions
- `ui/src/lib/api/assignments.ts` — POST/DELETE assignment endpoints

## Drop Flow

```
dragstart on DeveloperCard
  → store developerCard.id in drag context

dragover TaskCard
  → highlight task card border (drop indicator)

drop on TaskCard
  → open AllocationModal(developerId, taskId)
    → AllocationModal fields:
       - Allocation %: slider 10–100, default 100
       - WFU mode: standard (always) | fast | quality (only if skill match)
    → Confirm:
       → optimistic: add avatar to TaskCard assignee stack
       → POST /scenarios/{scenarioId}/assignments
       → success: keep avatar, invalidate warnings
       → failure: remove avatar, toast error

click assignee avatar on TaskCard
  → confirm dialog "Remove [name] from [task]?"
  → DELETE /scenarios/{scenarioId}/assignments/{id}
  → remove avatar optimistically
```

## AllocationModal

```tsx
<AllocationModal>
  <PercentSlider min={10} max={100} step={5} />
  <WfuModeSelector
    options={[
      { value: 'standard', always: true },
      { value: 'fast',    disabled: !hasSkillMatch, tooltip: 'Requires skill match' },
      { value: 'quality', disabled: !hasSkillMatch, tooltip: 'Requires skill match' },
    ]}
  />
  <WfuEffectivePreview />  {/* live preview of effective WFU given selection */}
</AllocationModal>
```

## Acceptance Criteria
- [ ] Drag DeveloperCard → TaskCard border highlights
- [ ] Drop → AllocationModal appears với % slider + WFU mode
- [ ] fast/quality mode disabled nếu không có skill match (tooltip giải thích)
- [ ] Confirm → avatar xuất hiện trên task card, API called
- [ ] API failure → avatar removed, error toast
- [ ] Click avatar → remove assignment
- [ ] Keyboard: Tab/Space/Enter flow hoạt động
