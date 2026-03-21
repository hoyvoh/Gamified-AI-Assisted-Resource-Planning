# Design — FE-001

## Files to Create/Modify

- `ui/src/app/layout.tsx` — root layout (fonts, metadata)
- `ui/src/app/page.tsx` — landing / org selector
- `ui/src/app/org/[orgId]/layout.tsx` — org shell layout
- `ui/src/app/org/[orgId]/page.tsx` — projects list (placeholder)
- `ui/src/app/org/[orgId]/projects/new/page.tsx` — new project form (placeholder)
- `ui/src/app/org/[orgId]/projects/[projectId]/page.tsx` — project hub (placeholder)
- `ui/src/app/org/[orgId]/projects/[projectId]/scenarios/[scenarioId]/page.tsx` — Strategic Board (placeholder)
- `ui/src/app/org/[orgId]/projects/[projectId]/scenarios/[scenarioId]/gantt/page.tsx`
- `ui/src/app/org/[orgId]/projects/[projectId]/scenarios/[scenarioId]/deps/page.tsx`
- `ui/src/app/org/[orgId]/projects/[projectId]/execution/page.tsx`
- `ui/src/app/org/[orgId]/personnel/page.tsx`
- `ui/src/components/Navigation/TopNav.tsx`
- `ui/src/components/Navigation/Breadcrumb.tsx`
- `ui/src/components/Layout/PageShell.tsx`

## Technical Design

### Route Hierarchy

```
/                                      → Org selector
/org/[orgId]                           → Projects dashboard
/org/[orgId]/projects/new              → Create project + input proposal
/org/[orgId]/projects/[projectId]      → Project hub (scenarios list)
/org/[orgId]/projects/[projectId]/scenarios/[scenarioId]        → Strategic Board
/org/[orgId]/projects/[projectId]/scenarios/[scenarioId]/gantt  → Gantt view
/org/[orgId]/projects/[projectId]/scenarios/[scenarioId]/deps   → Dependency graph
/org/[orgId]/projects/[projectId]/execution                     → Progress tracking
/org/[orgId]/personnel                 → Personnel management
```

### Layout Nesting

```tsx
// app/layout.tsx — html, body, fonts, global CSS
// app/org/[orgId]/layout.tsx — TopNav, Breadcrumb, left padding
// app/org/[orgId]/projects/[id]/scenarios/[id]/layout.tsx — Board-specific layout (3-panel)
```

## Acceptance Criteria

- [ ] All routes navigable without 404
- [ ] Active route visible in breadcrumb/nav
- [ ] Three-panel layout shell present on board route (even if empty)
- [ ] `pnpm type-check` → 0 errors
- [ ] `pnpm build` → success
