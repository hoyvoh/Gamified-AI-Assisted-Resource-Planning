# Design — FE-002

## Components to Develop

### Primitive Layer
| Component | Purpose | Key Variants/States |
|-----------|---------|---------------------|
| `Button` | Primary actions | primary / secondary / ghost / danger; loading; disabled |
| `Badge` | Inline status labels | color, size |
| `Card` | Surface container | padding, interactive hover state |
| `Drawer` | Slide-in side panel | open/close, title, overlay |
| `Modal` | Blocking dialog | open/close, title, footer actions |
| `Toast` | Transient notification | success / error / warning / info; auto-dismiss |
| `Tooltip` | Hover info overlay | content, placement (top/bottom/left/right) |
| `Avatar` | User portrait with initials fallback | name, src, size (sm/md/lg) |
| `AvatarStack` | Overlapping avatar group | users array, maxVisible (default 3) + overflow count |
| `Slider` | Range input | min, max, step, value, label |
| `Input` | Text input with validation state | error, disabled, placeholder |
| `Select` | Dropdown selector | options, value, placeholder |
| `Spinner` | Loading indicator | size |

### Domain-Specific Components
| Component | Purpose | Display Rules |
|-----------|---------|---------------|
| `StatusBadge` | Task status | draft=grey, in_progress=blue, done=green, blocked=red |
| `POnTimeBadge` | Completion probability display | ≥80%=🟢 green, 50-79%=🟡 amber, <50%=🔴 red |
| `EffortBadge` | Man-days number display | format: "3.5d" |
| `SeverityBadge` | Warning severity | critical=🔴, warning=🟠, info=🟡 |
| `AvailabilityBar` | Daily capacity visual | 0-5h=green, 5-6h=amber, 6-7h=red, >7h=critical red |
| `WarningBadge` | Warning grouped by severity | icon + count |
| `TechstackChip` | Skill/technology tag | label, category color |
| `WfuModeBadge` | WFU mode indicator | standard / fast (×1.2) / quality (×1.5) |

## Component Relationships
```
Primitive layer:
  Button, Badge, Card, Modal, Drawer, Toast, Tooltip, Avatar, AvatarStack, Slider, Input, Select

Domain components consume primitives:
  StatusBadge → Badge
  POnTimeBadge → Badge
  EffortBadge → Badge
  AvailabilityBar → (custom progress bar)
  WarningBadge → Badge + Tooltip
  TechstackChip → Badge
  AvatarStack → Avatar × N
```

## Data Flow
All components in this ticket are **purely presentational** — no API calls, no state management. They receive data via props and emit callbacks. Data binding to real API happens in INT-001 and later tickets.

## Design Tokens (Tailwind CSS v4)
Professional neutral palette — no desert empire colors:
- Base: slate-50 to slate-900 for surfaces and text
- Accent green: on-track states, success
- Accent amber: at-risk states, warnings
- Accent red: critical states, errors
- Accent blue: primary actions, in-progress states

## Acceptance Criteria
- [ ] All primitive components render in `/ui-demo` page in all variants
- [ ] `POnTimeBadge`: 84%=green, 65%=amber, 38%=red
- [ ] `AvailabilityBar`: 4h=green, 6h=amber, 7h+=red
- [ ] `StatusBadge` covers: draft, in_progress, done, blocked
- [ ] `AvatarStack` shows max 3 avatars + "+N" overflow badge
- [ ] `Toast` has `aria-live="polite"` on container — accessible
- [ ] All components keyboard-navigable with visible focus ring
- [ ] `pnpm type-check` passes with zero errors
- [ ] No desert empire color tokens in codebase
