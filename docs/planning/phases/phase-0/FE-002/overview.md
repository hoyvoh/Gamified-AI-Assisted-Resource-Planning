# FE-002 — Design System & Shared Components

**Phase:** 0 — Foundation
**Track:** Frontend
**Branch:** `feature/FE-002-design-system`
**Status:** Not started
**Prerequisites:** FE-001

## Goal
Build the foundational UI component library for the professional card-game style planning tool. All future screens and components are built on top of these primitives.

## Scope
- Extend Tailwind CSS v4 design tokens: neutral/slate base, accent colors for status (green/amber/red), card surfaces, depth shadows
- Primitive components: Button (variants: primary/secondary/ghost/danger), Badge, Card, Drawer, Modal, Toast, Tooltip, Spinner, Input, Select, Slider, Avatar, AvatarStack
- Status-aware components: `StatusBadge` (draft/in_progress/done), `SeverityBadge` (critical/warning/info), `POnTimeBadge` (green/amber/red thresholds), `EffortBadge`
- `WarningBadge` (severity-aware with icon)
- `AvailabilityBar` (progress bar with color scale: green ≤5h, amber ≤6h, red >6h)
- Demo page at `/ui-demo` for visual verification of all components
