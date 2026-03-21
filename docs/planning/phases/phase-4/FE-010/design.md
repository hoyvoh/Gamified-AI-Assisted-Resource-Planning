# Design — FE-010

## Files to Create/Modify
- ui/src/components/Optimization/OptimizationPanel.tsx
- ui/src/components/Optimization/SolutionCard.tsx
- ui/src/components/Optimization/ModeSelector.tsx
- ui/src/hooks/useOptimization.ts
- ui/src/lib/api/optimization.ts

## Technical Design

```tsx
// TopBar: "Optimize" button → ModeSelector (makespan|budget) → trigger
// OptimizationPanel: slides in from right
//   Loading state: "Running optimizer... (this may take 30s)"
//   Results: 3 SolutionCards side by side

// SolutionCard shows:
// - Rank badge (#1 Best)
// - Improvement % (green if positive)
// - Makespan days / Total cost
// - Warning count remaining
// - "Preview on Board" → temporarily apply to board
// - "Accept" → PATCH /scenarios/{id}/assignments bulk
```

## Acceptance Criteria
- [ ] "Optimize" button in TopBar with mode selector
- [ ] Loading spinner shown during optimization
- [ ] 3 solution cards shown with improvement %
- [ ] "Accept" applies assignments and closes panel
- [ ] Board updates to show new assignment state after accept
