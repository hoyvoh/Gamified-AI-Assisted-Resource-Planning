# Design — FE-007

## Files to Create/Modify
- ui/src/components/WarningBar/index.tsx
- ui/src/components/WarningBar/WarningBadge.tsx
- ui/src/components/WarningBar/WarningItem.tsx
- ui/src/hooks/useWarnings.ts
- ui/src/lib/api/warnings.ts
- ui/src/__tests__/components/WarningBar/WarningBar.test.tsx

## Technical Design

### Warning Types & Icons
```typescript
const WARNING_CONFIG = {
  capacity:       { icon: '⚡', color: 'critical', label: 'Overloaded' },
  junior_alone:   { icon: '👶', color: 'critical', label: 'Junior Alone' },
  time_risk:      { icon: '⏰', color: 'warning',  label: 'Time Risk' },
  budget:         { icon: '💰', color: 'warning',  label: 'Budget' },
  skill_mismatch: { icon: '🎯', color: 'info',     label: 'Skill Gap' },
  dependency:     { icon: '🔗', color: 'warning',  label: 'Dependency' },
}
```

### Auto-refresh
```typescript
// useWarnings: subscribes to scenarioStore.warnings
// re-fetches from API after any assignment change
// new critical warning → aria-live="assertive" announcement
```

## Acceptance Criteria
- [ ] Warnings load and display grouped badges with counts
- [ ] Expand bar → shows individual warnings with icons + messages
- [ ] Acknowledge button → warning dimmed, count decreases
- [ ] New critical warning → aria-live="assertive" fires
- [ ] pnpm test:unit:run passes
