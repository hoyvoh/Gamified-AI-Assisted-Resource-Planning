# Figma to Code Guide

## Goal

Liên kết naming trong Figma MCP với implementation React/Tailwind để handoff mượt hơn.

## Token Mapping

### Colors

- `dusk` -> `--color-dusk`
- `sand` -> `--color-sand`
- `stone` -> `--color-stone`
- `amber` -> `--color-amber`
- `oasis` -> `--color-oasis`
- `danger` -> `--color-danger`

### Typography

- `Cinzel` -> `--font-heading`
- `Inter` -> `--font-body`
- `JetBrains Mono` -> `--font-mono`

## Component Mapping

| Figma Name | React Export | Key Props |
| --- | --- | --- |
| `Component/PrimaryButton` | `PrimaryButton` | `type`, `disabled`, `loading` |
| `Component/StatusBadge` | `StatusBadge` | `tone`, `label`, `icon` |
| `Component/ProgressStepper` | `ProgressStepper` | `currentStep`, `steps` |
| `Component/TaskCard` | `TaskCard` | `status`, `selected`, `warnings` |
| `Component/PersonnelCard` | `PersonnelCard` | `availability`, `selected`, `load` |
| `Component/DrawerShell` | `DrawerShell` | `title`, `open`, `onClose` |
| `Component/ModalShell` | `ModalShell` | `title`, `open`, `onClose` |

## Variant Naming Guidance

- Variant property names should match React prop names when practical
- Prefer `selected=true|false` over visual-only names like `active`
- Prefer `tone=success|warning|danger` over `green|yellow|red`
- Prefer `state=default|hover|disabled|error` for shared controls

## Storybook Recommendations

- One story per primary variant set
- One story per important screen state:
  - loading
  - empty
  - error
  - selected
  - expanded

## Handoff Checklist

- Component names stable between Figma and code
- Variant properties reflect implementation props
- Tokens exported to CSS custom properties
- Screen frames include overlay states for drawers and modals

