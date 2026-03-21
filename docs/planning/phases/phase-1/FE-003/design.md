# Design — FE-003

## Files to Create/Modify
- ui/src/components/PersonnelSidebar/index.tsx
- ui/src/components/PersonnelSidebar/PersonnelCard.tsx
- ui/src/components/PersonnelSidebar/PersonnelDetailDrawer.tsx
- ui/src/components/PersonnelSidebar/WFUBar.tsx
- ui/src/components/PersonnelSidebar/SkillMatrix.tsx
- ui/src/hooks/usePersonnel.ts
- ui/src/lib/api/personnel.ts
- ui/src/__tests__/components/PersonnelSidebar/PersonnelCard.test.tsx

## Technical Design

### WFU Bar Colors
- Green: total daily allocation < 80% of 7h
- Yellow: 80–95%
- Red: >95% (approaching overload)

### PersonnelCard
```tsx
interface PersonnelCardProps {
  personnel: Personnel
  draggable?: boolean
  onClick: () => void
}
// draggable="true" + onDragStart sets dataTransfer.setData("personnelId", id)
```

### usePersonnel Hook
```typescript
export function usePersonnel(orgId: string) {
  // Fetches GET /orgs/{orgId}/personnel
  // Returns: { personnel, isLoading, error, refetch }
}
```

## Acceptance Criteria
- [ ] Sidebar renders personnel list from API
- [ ] WFU bar correct color for each load level
- [ ] Click → PersonnelDetailDrawer opens with skill matrix
- [ ] Search by name filters list
- [ ] Filter by seniority (junior/mid/senior) works
- [ ] Card is draggable (dragstart sets personnelId)
- [ ] pnpm test:unit:run passes
