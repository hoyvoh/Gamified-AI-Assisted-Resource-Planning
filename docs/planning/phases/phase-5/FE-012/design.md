# Design — FE-012

## Files to Create/Modify
- ui/src/components/DependencyGraph/index.tsx
- ui/src/components/DependencyGraph/GraphNode.tsx
- ui/src/components/DependencyGraph/GraphEdge.tsx
- ui/src/components/DependencyGraph/CriticalPathOverlay.tsx
- ui/src/hooks/useDependencyGraph.ts
- ui/package.json — add: dagre, @types/dagre

## Technical Design

### dagre Layout
```typescript
import dagre from 'dagre'
const g = new dagre.graphlib.Graph()
g.setGraph({ rankdir: 'LR', nodesep: 40, ranksep: 80 })
tasks.forEach(t => g.setNode(t.id, { width: 160, height: 60 }))
deps.forEach(d => g.setEdge(d.depends_on_task_id, d.task_id))
dagre.layout(g)
// g.node(id).x, g.node(id).y → SVG position
```

### Critical Path Highlighting
- Fetch GET /scenarios/{id}/critical-path
- Set edge color to #ff6b4a for edges on critical path
- Set node border to #ff6b4a for critical path tasks

## Acceptance Criteria
- [ ] All tasks rendered as nodes, all dependencies as directed edges
- [ ] Critical path edges/nodes highlighted in orange-red
- [ ] Zoom in/out with mouse wheel
- [ ] Pan by mouse drag
- [ ] Click node → TaskDetailDrawer opens
