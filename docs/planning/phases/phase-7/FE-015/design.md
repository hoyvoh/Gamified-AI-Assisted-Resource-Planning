# Design — FE-015

## Files to Create/Modify
- ui/src/app/org/[orgId]/projects/[projectId]/review/page.tsx
- ui/src/components/XPReview/ProjectSummaryCard.tsx
- ui/src/components/XPReview/MemberXPCard.tsx
- ui/src/components/XPReview/SkillProgressBar.tsx
- ui/src/components/XPReview/LevelUpBadge.tsx
- ui/src/hooks/useProjectReview.ts

## Technical Design

### Level-Up Animation
```tsx
// If member gained enough XP to level up:
// 1. Show old level badge
// 2. Animate progress bar filling to 100%
// 3. Flash + show new level badge
// Uses CSS animation + state machine (initial → filling → levelup → done)
```

### Data
```typescript
interface MemberReviewData {
  personnel: Personnel
  xpGained: number
  tasksCompleted: number
  levelUps: { skill: string; from: Level; to: Level }[]
  skillsUsed: string[]
  onTimeRate: number  // 0-1
}
```

## Acceptance Criteria
- [ ] Project summary shows totals (tasks, on-time %, days delta)
- [ ] Each member card shows XP gained + breakdown
- [ ] Skill level-up animation plays for members who leveled up
- [ ] Skill progress bars show before and after states
- [ ] Data matches backend xp_events for the project
