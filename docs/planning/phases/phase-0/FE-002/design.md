# Design — FE-002

## Files to Create/Modify

- `ui/src/app/globals.css` — add desert theme tokens
- `ui/src/components/ui/Button.tsx`
- `ui/src/components/ui/Badge.tsx`
- `ui/src/components/ui/Card.tsx`
- `ui/src/components/ui/Drawer.tsx`
- `ui/src/components/ui/Modal.tsx`
- `ui/src/components/ui/Toast.tsx` + `ToastContainer.tsx`
- `ui/src/components/ui/Tooltip.tsx`
- `ui/src/components/ui/Spinner.tsx`
- `ui/src/components/ui/Input.tsx`
- `ui/src/components/ui/WarningBadge.tsx`
- `ui/src/hooks/useToast.ts`
- `ui/src/app/ui-demo/page.tsx`
- `ui/src/__tests__/components/ui/` — test each component

## Technical Design

### Desert Theme Tokens (globals.css addition)

```css
@theme {
  --color-desert-sand: #c2956a;
  --color-desert-gold: #d4a843;
  --color-fortress-dark: #1a1208;
  --color-camp-glow: #ff8c42;
  --color-camp-active: #e07b35;
  --color-warning-critical: #ff4444;
  --color-warning-medium: #ff8c00;
  --color-warning-low: #ffd700;
}
```

### Component Variants

```tsx
// Button
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

// Badge / WarningBadge
type Severity = 'critical' | 'warning' | 'info'
// critical → red, warning → orange, info → yellow

// Toast
type ToastType = 'success' | 'error' | 'warning' | 'info'
// Must have aria-live="polite" on container
```

## Acceptance Criteria

- [ ] `/ui-demo` page shows all components in all variants
- [ ] Button: primary, secondary, danger, ghost — all render + click
- [ ] Toast with `aria-live="polite"` — axe accessibility check passes
- [ ] WarningBadge renders correct colors for each severity
- [ ] All components: keyboard navigable, focus-visible ring visible
- [ ] `pnpm test:unit:run` passes for all component tests
