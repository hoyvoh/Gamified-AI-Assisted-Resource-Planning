# Next.js + React Coding Standard

## 1. Core principles

- Always follow the native conventions of **Next.js App Router** and modern **React**.
- Prefer **clarity, correctness, and maintainability** over cleverness.
- Prefer **simple solutions for simple problems**.
- Prefer **reusable, typed, props-driven components** over one-off hardcoded UI.
- Never guess API behavior, data shape, or route intent.
- UI must follow confirmed business flow and API contract.

---

## 2. Framework rules

### Next.js rules
- Use **App Router** conventions for routes, layouts, loading states, error states, and nested UI.
- Follow Next.js file conventions:
  - `layout.tsx`
  - `page.tsx`
  - `loading.tsx`
  - `error.tsx`
  - route segments and nested layouts
- Prefer built-in framework capabilities before custom infrastructure.
- Use `Link` for internal navigation.
- Respect server/client boundaries:
  - default to Server Components when client interactivity is not needed
  - use `"use client"` only when required for client-side interactivity, state, effects, browser APIs, or event handlers
- Keep route structure meaningful and aligned with product architecture.

### React rules
- Use composition over large monolithic components.
- Keep state ownership clear and local to the correct level.
- Use props and typed interfaces instead of hardcoding repeated structures.
- Avoid unnecessary `useEffect`.
- Do not use Effects for derived UI that can be computed directly from props/state.
- Keep components pure and predictable.

---

## 3. Project structure rules

- Organize by **route and feature**, not random file dumping.
- Keep route-specific UI close to its route.
- Keep reusable primitives in shared component folders.
- Separate:
  - route shell
  - route stage content
  - reusable components
  - data model/types
  - UI state helpers only when truly needed

Example direction:
- `app/profile/[memberId]/layout.tsx`
- `app/profile/[memberId]/page.tsx`
- `app/profile/[memberId]/competency/page.tsx`
- `components/profile/...`
- `types/...`

---

## 4. Component rules

- Components must be:
  - reusable
  - typed
  - props-driven
  - small in responsibility
- Prefer data-driven rendering over duplicated JSX.
- New UI items should be addable by updating data/config, not by copying blocks.
- Avoid oversized components that mix:
  - layout
  - business mapping
  - local interaction state
  - styling
  - side effects
all in one file.

### Component design expectations
- One component = one clear responsibility
- Naming must be explicit
- Props must be typed
- Avoid vague names like `data`, `item`, `stuff`, `handleThing`

---

## 5. State management rules

- Keep state as local as possible.
- Lift state only when multiple children truly need shared control.
- Do not introduce global state for local UI interactions.
- For simple UI:
  - use local `useState`
  - use derived state where possible
- Do not add complex state libraries for small issues.
- One source of truth per interaction.

Examples:
- modal open state belongs near the feature using it
- selected branch belongs in the lattice parent
- route focus state should come from route/query state if it is navigation-related

---

## 6. API contract rules

- Never invent endpoint behavior.
- Never guess field names.
- Never reshape API meaning without explicit reason.
- UI must reflect the confirmed API contract.

Before implementing API-driven UI, verify:
- request params
- response shape
- loading state
- empty state
- error state
- partial data behavior
- cross-route navigation params if applicable

If the API spec is unclear:
- stop
- call out the ambiguity
- do not hallucinate behavior

---

## 7. UI implementation rules

- Keep screens focused.
- Do not overload one screen with too many competing modules.
- Prefer one strong focal area over many equal-weight boxes.
- Reduce explanatory/meta text in user-facing UI.
- Use concise copy with strong signal.
- Avoid box-inside-box-inside-box unless hierarchy clearly improves.

### Reuse and scaling
- Repeated UI patterns must become reusable components.
- Modal/card/list/node/item patterns should be data-driven.
- If a second use case is likely, design for reuse.
- If there is only one simple case, do not over-abstract.

---

## 8. Styling rules

- Keep one dominant visual system per screen.
- Do not mix many competing accent systems.
- Use semantic colors intentionally.
- Keep readability above decoration.
- Motion and effects must support focus, orientation, or atmosphere.

### Motion rules
- Use subtle motion by default
- avoid noisy animation
- respect reduced motion
- prefer:
  - fade
  - slight lift
  - scale
  - soft glow
  - calm floating
- use stronger motion only for meaningful route/chamber transitions

---

## 9. Simplicity / anti-overengineering rules

- Do not create a complex solution for a simple issue.
- Do not add abstraction before there is a real second use case.
- Do not introduce heavy dependencies without a clear reason.
- Do not build “framework inside the app”.
- Prefer direct, readable code over clever indirection.
- Match implementation complexity to problem size.

---

## 10. Review rules for AI-generated output

Reject or revise AI output if it:
- ignores App Router conventions
- uses `"use client"` without real need
- mixes server/client responsibilities incorrectly
- duplicates large JSX blocks instead of using reusable components
- introduces unnecessary effects
- invents API fields or flow
- over-engineers simple UI state
- breaks route architecture
- adds too much text or too many panels
- uses generic placeholder logic as if it were real business logic

Accept AI output only if it:
- follows framework conventions
- is typed and reusable where appropriate
- keeps code simple
- respects API spec
- preserves intended UX flow
- is easy for another developer to extend

---

## 11. Required implementation workflow

Before coding:
1. restate the requirement
2. identify the relevant Next.js / React pattern
3. identify API contract involved
4. propose the simplest correct solution
5. list files to edit
6. call out ambiguity or risk

After coding:
1. summarize what changed
2. list files changed
3. explain why the solution follows framework conventions
4. confirm API contract alignment
5. mention any remaining risk or limitation

---

## 12. Definition of done

A task is not done unless:
- it follows Next.js App Router conventions
- it follows modern React best practices
- it is reusable where appropriate
- it is not over-engineered
- it does not guess API behavior
- it preserves intended navigation and UX flow
- it is readable and maintainable