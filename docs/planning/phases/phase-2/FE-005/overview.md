# FE-005 — Three.js Board — Static Scene

**Phase:** 2 — Strategic Board
**Track:** Frontend
**Branch:** `feature/FE-005-threejs-board-static`
**Status:** Not started
**Prerequisites:** INT-001

## Goal
Build the desert empire 3D scene using Three.js. Tasks display as camps (boxes), personnel as units (cones), a fortress sits in the background as the deadline symbol. Static display — no interaction yet.

## Scope
- Three.js scene: desert ground, sky, directional sunlight
- Task camps: BoxGeometry sized by effort, colored by status
- Personnel units: CylinderGeometry with per-person colors
- Fortress background mesh
- Floating text labels above camps
- OrbitControls for camera pan/zoom/rotate
- Raycasting foundation for click detection
