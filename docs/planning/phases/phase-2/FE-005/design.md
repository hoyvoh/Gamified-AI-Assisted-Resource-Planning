# Design — FE-005

## Files to Create/Modify
- `ui/src/components/PlanningBoard/index.tsx` — main board layout (sidebar + lanes)
- `ui/src/components/PlanningBoard/TaskCard.tsx` — task card with badges + expand
- `ui/src/components/PlanningBoard/DeveloperCard.tsx` — developer card with availability + match %
- `ui/src/components/PlanningBoard/TaskLane.tsx` — lane container (status group)
- `ui/src/components/PlanningBoard/AllocationPopup.tsx` — developer cross-project allocation popup
- `ui/src/store/boardStore.ts` — selected task/developer, expanded state

## Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│ TopBar: [Project Name] > [Scenario selector ▾]   [Snapshot] [Optimize]│
├────────────────┬─────────────────────────────────────────────────────┤
│  Developer     │  Unassigned          In Progress       Done         │
│  Panel         │  ┌──────────┐        ┌──────────┐      ┌──────────┐│
│                │  │TaskCard  │        │TaskCard  │      │TaskCard  ││
│  ┌──────────┐  │  │          │        │          │      │          ││
│  │Dev Card  │  │  │ 3.5d     │        │ 8d ████  │      │ 2d  ✅   ││
│  │Nguyen V. │  │  │ [React]  │        │ [Java]   │      │ [SQL]    ││
│  │████ 60%  │  │  │ 🟢 92%   │        │ 🟡 71%   │      │          ││
│  │Match: 87%│  │  └──────────┘        └──────────┘      └──────────┘│
│  ├──────────┤  │                                                     │
│  │Dev Card  │  │                                                     │
│  │Tran T.   │  │                                                     │
│  │████ 40%  │  │                                                     │
│  │Match: 72%│  │                                                     │
│  └──────────┘  │                                                     │
└────────────────┴─────────────────────────────────────────────────────┘
```

## Task Card Design

```tsx
// Badges
<EffortBadge days={task.effort_total_days} />          // "3.5d"
<TechstackChips stacks={task.techstacks} />             // [React] [TypeScript]
<StatusBadge status={task.status} />
<POnTimeBadge value={task.p_on_time} />                 // 🟢 92% | 🟡 71% | 🔴 48%
<AssigneeAvatarStack assignments={task.assignments} />

// Expanded (click to toggle)
<EffortBreakdown phases={task.effort_breakdown} />      // investigate/design/implement/...
<DependencyList deps={task.dependencies} />
<WarningList warnings={task.active_warnings} />
```

## Developer Card Design

```tsx
<Avatar name={dev.name} />
<AvailabilityBar
  used={dev.daily_hours_used}    // across all projects
  max={7}
  colorScale={{ green: 5, amber: 6, red: 7 }}
/>
<SkillMatchBadge score={dev.match_score} />  // from Pillar 2, null if unavailable → "N/A"
<WfuEffectiveBadge wfu={dev.wfu_effective} />
```

## Acceptance Criteria
- [ ] Task cards render với đúng effort, techstack, status, P(on_time) từ API
- [ ] Developer cards render với availability bar và match % (hoặc "N/A" nếu chưa có Pillar 2)
- [ ] Lanes group tasks đúng theo status
- [ ] Click task card → expand shows effort breakdown + warnings
- [ ] Click developer card → popup hiện allocation cross-project
- [ ] pnpm type-check passes
- [ ] No Three.js / canvas dependencies
