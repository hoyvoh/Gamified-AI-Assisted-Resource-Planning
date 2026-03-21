# Design — FE-014

## Files to Create/Modify
- ui/src/app/org/[orgId]/projects/[projectId]/execution/page.tsx
- ui/src/components/ProgressTracking/DailyInputForm.tsx
- ui/src/components/ProgressTracking/EVMetrics.tsx
- ui/src/components/ProgressTracking/BurndownChart.tsx
- ui/src/components/ProgressTracking/TaskProgressList.tsx
- ui/src/hooks/useProgressTracking.ts
- ui/src/lib/api/progress.ts

## Technical Design

### EV Metric Colors
```typescript
// SPI: green if >0.9, yellow if 0.7-0.9, red if <0.7
// CPI: green if >0.9, yellow if 0.7-0.9, red if <0.7
// EAC date: green if before deadline, red if after
```

### Burndown Chart
```
Y-axis: remaining effort (man-days)
X-axis: calendar days
Line 1: planned burndown (straight line from total to 0)
Line 2: actual burndown (based on progress logs)
```

## Acceptance Criteria
- [ ] Daily input form submits and updates task completion %
- [ ] EV metrics update after each submission
- [ ] SPI color indicators correct (green/yellow/red)
- [ ] Burndown shows divergence between planned and actual
- [ ] TIME_RISK warning appears when behind schedule
