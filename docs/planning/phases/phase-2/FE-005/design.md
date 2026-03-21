# Design — FE-005

## Files to Create/Modify
- ui/src/components/StrategicBoard/index.tsx — React wrapper, canvas mount
- ui/src/components/StrategicBoard/useBoard.ts — Three.js lifecycle hook
- ui/src/components/StrategicBoard/scene/DesertScene.ts — environment setup
- ui/src/components/StrategicBoard/objects/CampObject.ts — task camp mesh
- ui/src/components/StrategicBoard/objects/PersonnelUnit.ts — personnel mesh
- ui/src/components/StrategicBoard/objects/FortressBackground.ts — background
- ui/src/components/StrategicBoard/objects/FloatingLabel.ts — CSS2DObject labels
- ui/package.json — add: three, @types/three

## Technical Design

### Scene Setup (useBoard.ts)
```typescript
// Scene init in useEffect
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, width/height, 0.1, 1000)
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })

// Lights
const sun = new THREE.DirectionalLight(0xfff4e0, 1.5)
const ambient = new THREE.AmbientLight(0x4a3a2a, 0.8)

// Controls
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
```

### Camp Sizing
```typescript
// Size proportional to effort_total_days (capped at max)
const size = Math.min(0.5 + task.effort_total_days * 0.15, 3)
const geometry = new THREE.BoxGeometry(size, size * 0.6, size)

// Colors by status
const STATUS_COLORS = {
  draft: 0x888888, todo: 0xc2956a,
  in_progress: 0xd4a843, review: 0x4f8ef7, done: 0x34d399
}
```

### Auto Layout
Tasks auto-positioned in a grid/spiral pattern based on index. Position stored in task.position_x / task.position_z.

## Acceptance Criteria
- [ ] Scene renders: desert ground, sky gradient, fortress silhouette
- [ ] All scenario tasks appear as camps with correct size proportions
- [ ] Assigned personnel appear as units near their camp
- [ ] Camp color matches task status
- [ ] Camera orbit/zoom works via mouse
- [ ] 20 tasks + 10 personnel: stable 60fps
- [ ] pnpm type-check passes
