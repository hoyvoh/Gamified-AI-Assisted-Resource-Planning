# Frontend Guide

Stack: **Next.js 15 · React 19 · TypeScript strict · Tailwind CSS v4 · pnpm 10**

Quality: **Oxfmt · Oxlint · ESLint · Vitest · Testing Library**

## Project Structure

```
ui/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout (fonts, metadata, providers)
│   │   ├── page.tsx            # Home page
│   │   ├── globals.css         # Tailwind + design tokens
│   │   └── <route>/
│   │       ├── page.tsx        # Page component (Server Component by default)
│   │       └── _components/    # Route-local components (prefixed with _)
│   ├── components/             # Shared UI components
│   ├── hooks/                  # Custom hooks (useXxx.ts)
│   ├── lib/                    # Utilities and API client
│   │   └── api/                # Typed fetch wrappers per domain
│   ├── types/                  # Global TypeScript types (generated from OpenAPI)
│   └── test/
│       └── setup.ts            # Vitest + @testing-library/jest-dom setup
├── .oxfmtrc.json               # Formatter: single quotes, no semicolons
├── .oxlintrc.json              # Linter: react, react-hooks, jsx-a11y
├── eslint.config.mjs           # ESLint: next/core-web-vitals + oxlint dedup
├── next.config.ts
├── postcss.config.mjs          # Tailwind v4 via @tailwindcss/postcss
├── tsconfig.json               # Strict mode, bundler resolution
└── vitest.config.ts
```

## Design Tokens

All colors and typography are defined as CSS variables in `src/app/globals.css` under `@theme`:

```css
/* Usage in Tailwind classes */
<div class="bg-bg-surface text-text-primary border-border-default">
```

| Token | Value | Use |
|-------|-------|-----|
| `bg-deep` | `#0f1923` | Page background |
| `bg-surface` | `#162232` | Cards, panels |
| `bg-elevated` | `#1e2f42` | Dropdowns, modals |
| `text-primary` | `#f1f5f9` | Main content |
| `text-secondary` | `#8b9db5` | Labels, captions |
| `text-dim` | `#4a6180` | Placeholders, disabled |
| `accent-primary` | `#4f8ef7` | Actions, links |
| `accent-success` | `#34d399` | Positive states |
| `accent-danger` | `#ff6b4a` | Errors, destructive |
| `border-default` | `#334155` | Card/panel borders |

## Adding a New Page

```tsx
// src/app/resources/page.tsx
// Server Component by default — great for data fetching

import { fetchResources } from '@/lib/api/resources'

export default async function ResourcesPage() {
  const resources = await fetchResources()

  return (
    <main>
      <h1 className="text-2xl font-bold text-text-primary">Resources</h1>
      <ul>
        {resources.map((r) => (
          <li key={r.id}>{r.name}</li>
        ))}
      </ul>
    </main>
  )
}
```

## Adding a Component

```tsx
// src/components/ResourceCard.tsx
// 'use client' only if interactive

interface ResourceCardProps {
  id: number
  name: string
  type: string
}

export function ResourceCard({ id, name, type }: ResourceCardProps) {
  return (
    <div className="rounded border border-border-default bg-bg-surface p-4">
      <p className="text-sm text-text-primary">{name}</p>
      <p className="text-xs text-text-dim">{type}</p>
    </div>
  )
}
```

## API Types — Never Hand-Write DTOs

Generate TypeScript types from the FastAPI OpenAPI schema:

```bash
# Install openapi-typescript (once)
pnpm add -D openapi-typescript

# Generate types from running backend
npx openapi-typescript http://localhost:8000/openapi.json -o src/types/api.ts

# Or from local schema file
npx openapi-typescript ./openapi.json -o src/types/api.ts
```

## API Client Pattern

```typescript
// src/lib/api/resources.ts
import type { components } from '@/types/api'

type Resource = components['schemas']['ResourceResponse']

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export async function fetchResources(): Promise<Resource[]> {
  const res = await fetch(`${API_BASE}/resources/`, { next: { revalidate: 60 } })
  if (!res.ok) throw new Error(`Failed to fetch resources: ${res.status}`)
  return res.json() as Promise<Resource[]>
}
```

## Custom Hook Pattern

```typescript
// src/hooks/useResources.ts
'use client'

import { useState, useEffect } from 'react'
import type { components } from '@/types/api'

type Resource = components['schemas']['ResourceResponse']

export function useResources() {
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/resources')
      .then((r) => r.json() as Promise<Resource[]>)
      .then(setResources)
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setIsLoading(false))
  }, [])

  return { resources, isLoading, error }
}
```

## Testing

```tsx
// src/__tests__/components/ResourceCard.test.tsx
import { render, screen } from '@testing-library/react'
import { ResourceCard } from '@/components/ResourceCard'

describe('ResourceCard', () => {
  it('renders name and type', () => {
    render(<ResourceCard id={1} name="Python" type="SKILL" />)
    expect(screen.getByText('Python')).toBeInTheDocument()
    expect(screen.getByText('SKILL')).toBeInTheDocument()
  })
})
```

## Accessibility Rules

- Every icon-only button **must** have `aria-label`
- Every form input **must** have an associated `<label>` (or `aria-label`)
- Interactive `<div>` elements need `role="button"` + `tabIndex={0}` + keyboard handlers
- Modals need `role="dialog"`, `aria-modal="true"`, and focus trap
- Toasts need `aria-live="polite"` (or `"assertive"` for errors)

## TypeScript Rules

- **No `any`** — use `unknown` and narrow, or generate proper types
- **No `// @ts-ignore`** — fix the root cause
- Prefer `interface` for object shapes, `type` for unions/aliases
- Server Components are `async function` — no `'use client'` unless interactive
