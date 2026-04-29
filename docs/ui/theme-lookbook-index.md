# Analysis Chamber Theme Lookbook Index

## Purpose

This file is the maintenance index for the Analysis Chamber visual system.

Use it when:
- changing the global dark fantasy / premium medieval noir palette
- retuning route-specific stage tones
- auditing whether a route still contains old color literals
- extending the design system without missing dependent screens

This is not a marketing spec.
It is a practical change-impact map.

---

## Visual Direction

The current chamber UI uses:
- `obsidian black` foundations
- `midnight slate` and `dark navy` surfaces
- `burnished brass` for chrome, hierarchy, and focus
- `parchment` text for readability
- restrained semantic accents:
  - green for `Keep` / success / ready
  - red for `Problem` / danger / friction
  - blue for `Try` / action / route progression

Design intent:
- dark fantasy
- premium medieval noir
- strong contrast
- low-noise surfaces
- semantic accents should highlight meaning, not repaint the entire screen

---

## Canonical Theme Sources

Primary source of truth:
- [ui/src/lib/theme/medieval-theme.ts](/Users/tan/MyProjects/hackday/Gamified-AI-Assisted-Resource-Planning/ui/src/lib/theme/medieval-theme.ts)

Analysis Chamber token hub:
- [ui/src/features/analysis-chamber/lib/analysis-chamber-shell.constants.ts](/Users/tan/MyProjects/hackday/Gamified-AI-Assisted-Resource-Planning/ui/src/features/analysis-chamber/lib/analysis-chamber-shell.constants.ts)

Rule:
- global palette primitives belong in `medieval-theme.ts`
- chamber-specific reusable chrome/stage tokens belong in `analysis-chamber-shell.constants.ts`
- route/components should consume tokens, not invent new palette literals unless a truly specialized visual effect needs it

---

## Token Groups

### `MEDIEVAL_THEME`

Purpose:
- global palette primitives
- page backgrounds
- shell frame gradients
- text hierarchy
- base accent family

Used by:
- shared page/frame backgrounds
- not-found screen
- members/scan/profile route shells

Review when changing:
- global darkness
- brass hue
- page atmosphere
- premium noir feel

### `CHAMBER_CHROME_TOKENS`

Purpose:
- shared profile shell chrome
- route rail
- top bar
- side panels
- live status totem
- loading/pending shell states

Used by:
- `analysis-chamber-frame`
- `analysis-chamber-top-bar`
- `analysis-chamber-route-rail`
- `analysis-chamber-shell`
- `analysis-chamber-live-status-totem`

Review when changing:
- border/divider brass
- side-panel surfaces
- profile loading/error chrome
- shared action button tone

### `SCAN_LOBBY_TOKENS`

Purpose:
- scan route surfaces
- cards
- controls
- advisor/record/list states

Used by:
- `scan/page`
- `scan-lobby`
- `live-scan-chamber`
- `scan-lobby-map`

Review when changing:
- scan page panels
- control room / order panels
- scan status cards

### `CASES_TOKENS`

Purpose:
- archive ledger
- open record panel
- case cards
- case row hover/selected behavior

Used by:
- `cases-stage-shell`

Review when changing:
- `profile/[memberId]/cases`
- archive surface tone
- case impact badges
- case detail panel

### `JOURNEY_TOKENS`

Purpose:
- expedition log
- dossier panel
- map shell
- milestone node styling
- route path glow/fog/annotation surfaces

Used by:
- `journey-expedition-log`
- `journey-dossier-panel`
- `journey-map-canvas`

Review when changing:
- `profile/[memberId]/journey`
- frontier glow
- milestone state differentiation
- map fog / aura behavior

### `BRANCH_TOKENS`

Purpose:
- competency branch lattice
- branch fallback surfaces
- popup card / modal shared tones
- branch pending-proof states

Used by:
- `branch-node`
- `branch-lattice`
- `branch-popup-card`
- `branch-detail-modal`

Review when changing:
- `profile/[memberId]/competency`
- branch modal feel
- proof-pending state tone

### `RADAR_TOKENS`

Purpose:
- competency radar grid and active point stroke

Used by:
- `competency-radar-chart`

Review when changing:
- radar visibility
- grid/subtle highlight contrast

### `OVERVIEW_TOKENS`

Purpose:
- overview stage aura
- overview error panel
- CTA card surfaces
- fairness banner
- right-side hero divider/fade

Used by:
- `overview-stage-shell`
- `overview-action-grid`
- `overview-fairness-banner`

Review when changing:
- `profile/[memberId]/overview`
- overview CTA tone
- hero side atmosphere

### `COMPETENCY_TOKENS`

Purpose:
- competency shell aura
- category focus chips
- lattice wrapper
- fallback dimension states
- per-category accent containers

Used by:
- `competency-stage-shell`

Review when changing:
- `profile/[memberId]/competency`
- category focus blocks
- lattice container tone

### `KPT_TOKENS`

Purpose:
- KPT board surface system
- KPT card surfaces
- column/card chrome
- semantic column accents

Used by:
- `kpt-stage-shell`
- `kpt-column`
- `kpt-card`

Review when changing:
- `profile/[memberId]/kpt`
- KPT columns/cards
- Keep / Problem / Try accent balance

---

## Route Coverage Index

### Members

Primary route:
- `/members`

Main files:
- [ui/src/app/members/page.tsx](/Users/tan/MyProjects/hackday/Gamified-AI-Assisted-Resource-Planning/ui/src/app/members/page.tsx)
- [ui/src/features/analysis-chamber/components/members-war-room.tsx](/Users/tan/MyProjects/hackday/Gamified-AI-Assisted-Resource-Planning/ui/src/features/analysis-chamber/components/members-war-room.tsx)
- [ui/src/features/analysis-chamber/components/members-war-room-ledger.tsx](/Users/tan/MyProjects/hackday/Gamified-AI-Assisted-Resource-Planning/ui/src/features/analysis-chamber/components/members-war-room-ledger.tsx)
- [ui/src/features/analysis-chamber/components/member-list-table.tsx](/Users/tan/MyProjects/hackday/Gamified-AI-Assisted-Resource-Planning/ui/src/features/analysis-chamber/components/member-list-table.tsx)
- [ui/src/features/analysis-chamber/components/members-war-room-state-strip.tsx](/Users/tan/MyProjects/hackday/Gamified-AI-Assisted-Resource-Planning/ui/src/features/analysis-chamber/components/members-war-room-state-strip.tsx)
- [ui/src/features/analysis-chamber/components/members-war-room-dossier.tsx](/Users/tan/MyProjects/hackday/Gamified-AI-Assisted-Resource-Planning/ui/src/features/analysis-chamber/components/members-war-room-dossier.tsx)

Token families to review:
- `MEDIEVAL_THEME`
- partial `CHAMBER_CHROME_TOKENS`

### Scan

Primary routes:
- `/members/[memberId]/scan`
- `/members/[memberId]/scan` not-found state

Main files:
- [ui/src/app/members/[memberId]/scan/page.tsx](/Users/tan/MyProjects/hackday/Gamified-AI-Assisted-Resource-Planning/ui/src/app/members/[memberId]/scan/page.tsx)
- [ui/src/app/members/[memberId]/scan/not-found.tsx](/Users/tan/MyProjects/hackday/Gamified-AI-Assisted-Resource-Planning/ui/src/app/members/[memberId]/scan/not-found.tsx)
- [ui/src/features/analysis-chamber/components/member-route-state-screen.tsx](/Users/tan/MyProjects/hackday/Gamified-AI-Assisted-Resource-Planning/ui/src/features/analysis-chamber/components/member-route-state-screen.tsx)
- [ui/src/features/analysis-chamber/components/scan-lobby.tsx](/Users/tan/MyProjects/hackday/Gamified-AI-Assisted-Resource-Planning/ui/src/features/analysis-chamber/components/scan-lobby.tsx)
- [ui/src/features/analysis-chamber/components/scan-lobby/live-scan-chamber.tsx](/Users/tan/MyProjects/hackday/Gamified-AI-Assisted-Resource-Planning/ui/src/features/analysis-chamber/components/scan-lobby/live-scan-chamber.tsx)
- [ui/src/features/analysis-chamber/components/scan-lobby/scan-lobby-map.tsx](/Users/tan/MyProjects/hackday/Gamified-AI-Assisted-Resource-Planning/ui/src/features/analysis-chamber/components/scan-lobby/scan-lobby-map.tsx)
- [ui/src/features/analysis-chamber/components/scan-lobby/map/map-phase-rail.tsx](/Users/tan/MyProjects/hackday/Gamified-AI-Assisted-Resource-Planning/ui/src/features/analysis-chamber/components/scan-lobby/map/map-phase-rail.tsx)

Token families to review:
- `MEDIEVAL_THEME`
- `SCAN_LOBBY_TOKENS`

### Profile Shell

Primary route family:
- `/profile/[memberId]/*`

Main files:
- [ui/src/features/analysis-chamber/components/analysis-chamber-frame.tsx](/Users/tan/MyProjects/hackday/Gamified-AI-Assisted-Resource-Planning/ui/src/features/analysis-chamber/components/analysis-chamber-frame.tsx)
- [ui/src/features/analysis-chamber/components/analysis-chamber-top-bar.tsx](/Users/tan/MyProjects/hackday/Gamified-AI-Assisted-Resource-Planning/ui/src/features/analysis-chamber/components/analysis-chamber-top-bar.tsx)
- [ui/src/features/analysis-chamber/components/analysis-chamber-shell.tsx](/Users/tan/MyProjects/hackday/Gamified-AI-Assisted-Resource-Planning/ui/src/features/analysis-chamber/components/analysis-chamber-shell.tsx)
- [ui/src/features/analysis-chamber/components/analysis-chamber-route-rail.tsx](/Users/tan/MyProjects/hackday/Gamified-AI-Assisted-Resource-Planning/ui/src/features/analysis-chamber/components/analysis-chamber-route-rail.tsx)
- [ui/src/features/analysis-chamber/components/analysis-chamber-live-status-totem.tsx](/Users/tan/MyProjects/hackday/Gamified-AI-Assisted-Resource-Planning/ui/src/features/analysis-chamber/components/analysis-chamber-live-status-totem.tsx)
- [ui/src/app/profile/[memberId]/loading.tsx](/Users/tan/MyProjects/hackday/Gamified-AI-Assisted-Resource-Planning/ui/src/app/profile/[memberId]/loading.tsx)
- [ui/src/app/profile/[memberId]/error.tsx](/Users/tan/MyProjects/hackday/Gamified-AI-Assisted-Resource-Planning/ui/src/app/profile/[memberId]/error.tsx)

Token families to review:
- `MEDIEVAL_THEME`
- `CHAMBER_CHROME_TOKENS`

### Profile Overview

Primary route:
- `/profile/[memberId]/overview`

Main files:
- [ui/src/features/analysis-chamber/components/stages/overview-stage-shell.tsx](/Users/tan/MyProjects/hackday/Gamified-AI-Assisted-Resource-Planning/ui/src/features/analysis-chamber/components/stages/overview-stage-shell.tsx)
- [ui/src/features/analysis-chamber/components/stages/overview/overview-headline-panel.tsx](/Users/tan/MyProjects/hackday/Gamified-AI-Assisted-Resource-Planning/ui/src/features/analysis-chamber/components/stages/overview/overview-headline-panel.tsx)
- [ui/src/features/analysis-chamber/components/stages/overview/overview-inline-metrics.tsx](/Users/tan/MyProjects/hackday/Gamified-AI-Assisted-Resource-Planning/ui/src/features/analysis-chamber/components/stages/overview/overview-inline-metrics.tsx)
- [ui/src/features/analysis-chamber/components/stages/overview/overview-action-grid.tsx](/Users/tan/MyProjects/hackday/Gamified-AI-Assisted-Resource-Planning/ui/src/features/analysis-chamber/components/stages/overview/overview-action-grid.tsx)
- [ui/src/features/analysis-chamber/components/stages/overview/overview-fairness-banner.tsx](/Users/tan/MyProjects/hackday/Gamified-AI-Assisted-Resource-Planning/ui/src/features/analysis-chamber/components/stages/overview/overview-fairness-banner.tsx)
- [ui/src/features/analysis-chamber/components/stages/overview/overview-dimension-chips.tsx](/Users/tan/MyProjects/hackday/Gamified-AI-Assisted-Resource-Planning/ui/src/features/analysis-chamber/components/stages/overview/overview-dimension-chips.tsx)

Token families to review:
- `OVERVIEW_TOKENS`
- `CHAMBER_CHROME_TOKENS`
- specialized overview effect styling

### Profile Competency

Primary route:
- `/profile/[memberId]/competency`

Main files:
- [ui/src/features/analysis-chamber/components/stages/competency-stage-shell.tsx](/Users/tan/MyProjects/hackday/Gamified-AI-Assisted-Resource-Planning/ui/src/features/analysis-chamber/components/stages/competency-stage-shell.tsx)
- [ui/src/features/analysis-chamber/components/competency-radar-chart.tsx](/Users/tan/MyProjects/hackday/Gamified-AI-Assisted-Resource-Planning/ui/src/features/analysis-chamber/components/competency-radar-chart.tsx)
- [ui/src/features/analysis-chamber/components/branch-lattice/branch-lattice.tsx](/Users/tan/MyProjects/hackday/Gamified-AI-Assisted-Resource-Planning/ui/src/features/analysis-chamber/components/branch-lattice/branch-lattice.tsx)
- [ui/src/features/analysis-chamber/components/branch-lattice/branch-node.tsx](/Users/tan/MyProjects/hackday/Gamified-AI-Assisted-Resource-Planning/ui/src/features/analysis-chamber/components/branch-lattice/branch-node.tsx)
- [ui/src/features/analysis-chamber/components/branch-lattice/branch-popup-card.tsx](/Users/tan/MyProjects/hackday/Gamified-AI-Assisted-Resource-Planning/ui/src/features/analysis-chamber/components/branch-lattice/branch-popup-card.tsx)
- [ui/src/features/analysis-chamber/components/branch-lattice/branch-detail-modal.tsx](/Users/tan/MyProjects/hackday/Gamified-AI-Assisted-Resource-Planning/ui/src/features/analysis-chamber/components/branch-lattice/branch-detail-modal.tsx)
- [ui/src/features/analysis-chamber/components/branch-lattice/branch-shield.tsx](/Users/tan/MyProjects/hackday/Gamified-AI-Assisted-Resource-Planning/ui/src/features/analysis-chamber/components/branch-lattice/branch-shield.tsx)

Token families to review:
- `COMPETENCY_TOKENS`
- `RADAR_TOKENS`
- `BRANCH_TOKENS`

### Profile KPT

Primary route:
- `/profile/[memberId]/kpt`

Main files:
- [ui/src/features/analysis-chamber/components/stages/kpt-stage-shell.tsx](/Users/tan/MyProjects/hackday/Gamified-AI-Assisted-Resource-Planning/ui/src/features/analysis-chamber/components/stages/kpt-stage-shell.tsx)
- [ui/src/features/analysis-chamber/components/stages/kpt-column.tsx](/Users/tan/MyProjects/hackday/Gamified-AI-Assisted-Resource-Planning/ui/src/features/analysis-chamber/components/stages/kpt-column.tsx)
- [ui/src/features/analysis-chamber/components/stages/kpt-card.tsx](/Users/tan/MyProjects/hackday/Gamified-AI-Assisted-Resource-Planning/ui/src/features/analysis-chamber/components/stages/kpt-card.tsx)

Token families to review:
- `KPT_TOKENS`

### Profile Cases

Primary route:
- `/profile/[memberId]/cases`

Main files:
- [ui/src/features/analysis-chamber/components/stages/cases-stage-shell.tsx](/Users/tan/MyProjects/hackday/Gamified-AI-Assisted-Resource-Planning/ui/src/features/analysis-chamber/components/stages/cases-stage-shell.tsx)
- [ui/src/features/analysis-chamber/components/analysis-chamber-live-status-totem.tsx](/Users/tan/MyProjects/hackday/Gamified-AI-Assisted-Resource-Planning/ui/src/features/analysis-chamber/components/analysis-chamber-live-status-totem.tsx)

Token families to review:
- `CASES_TOKENS`
- `CHAMBER_CHROME_TOKENS`

### Profile Journey

Primary route:
- `/profile/[memberId]/journey`

Main files:
- [ui/src/features/analysis-chamber/components/stages/journey/journey-stage-shell.tsx](/Users/tan/MyProjects/hackday/Gamified-AI-Assisted-Resource-Planning/ui/src/features/analysis-chamber/components/stages/journey/journey-stage-shell.tsx)
- [ui/src/features/analysis-chamber/components/stages/journey/journey-expedition-log.tsx](/Users/tan/MyProjects/hackday/Gamified-AI-Assisted-Resource-Planning/ui/src/features/analysis-chamber/components/stages/journey/journey-expedition-log.tsx)
- [ui/src/features/analysis-chamber/components/stages/journey/journey-dossier-panel.tsx](/Users/tan/MyProjects/hackday/Gamified-AI-Assisted-Resource-Planning/ui/src/features/analysis-chamber/components/stages/journey/journey-dossier-panel.tsx)
- [ui/src/features/analysis-chamber/components/stages/journey/journey-map-canvas.tsx](/Users/tan/MyProjects/hackday/Gamified-AI-Assisted-Resource-Planning/ui/src/features/analysis-chamber/components/stages/journey/journey-map-canvas.tsx)

Token families to review:
- `JOURNEY_TOKENS`

---

## If You Change X, Review Y

### If you change page darkness or shell atmosphere

Review:
- `MEDIEVAL_THEME`
- `analysis-chamber-frame`
- `analysis-chamber-top-bar`
- `member-route-state-screen`
- `members/page`
- `scan/page`

### If you change brass hue or divider intensity

Review:
- `CHAMBER_CHROME_TOKENS`
- route rail
- top bar
- shell pending states
- live status totem
- KPT headers
- cases ledger headers

### If you change profile shell action buttons

Review:
- `CHAMBER_CHROME_TOKENS.action*`
- live status totem CTA
- pending screen CTA
- route-level retry actions

### If you change semantic green / red / blue accents

Review:
- `KPT_TOKENS.keep/problem/try`
- `COMPETENCY_TOKENS` per-category accents
- `CASES_TOKENS` impact badge behavior
- `JOURNEY_TOKENS` frontier / locked states
- `analysis-chamber-live-status-totem`

### If you change case route tone

Review:
- `CASES_TOKENS`
- `cases-stage-shell`
- `analysis-chamber-live-status-totem` for route `cases`

### If you change competency visuals

Review:
- `COMPETENCY_TOKENS`
- `RADAR_TOKENS`
- `BRANCH_TOKENS`
- `competency-stage-shell`
- branch popup/modal

### If you change overview editorial mood

Review:
- `OVERVIEW_TOKENS`
- `overview-stage-shell`
- `overview-action-grid`
- `overview-fairness-banner`
- `overview-dimension-chips`

### If you change KPT board feel

Review:
- `KPT_TOKENS`
- `kpt-column`
- `kpt-card`

### If you change journey map style

Review:
- `JOURNEY_TOKENS`
- `journey-map-canvas`
- `journey-dossier-panel`
- `journey-expedition-log`

---

## Audit Checklist

Run this checklist after any palette or token change.

### Route checklist

Review these screens:
1. `/members`
2. `/members/[memberId]/scan`
3. `/members/[memberId]/scan` invalid member state
4. `/profile/[memberId]/overview`
5. `/profile/[memberId]/competency`
6. `/profile/[memberId]/kpt`
7. `/profile/[memberId]/cases`
8. `/profile/[memberId]/journey`

### State checklist

Check each route for:
1. default/loaded state
2. loading state
3. empty state
4. error state
5. selected/active card state
6. hover state
7. route-specific side panel / totem state

### Visual checklist

Check for:
1. old brown surfaces that do not match `premium noir`
2. overly bright amber backgrounds
3. inconsistent divider brass opacity
4. white borders that should be brass or noir
5. route accents repainting whole surfaces instead of acting as accents
6. badges using high-saturation old colors
7. shell-level mismatch between main stage and side totem
8. not-found / scan / profile using different page atmospheres accidentally

### Grep checklist

Use targeted grep when auditing:

```sh
rg -n 'rgba\\(|#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})|bg-\\[|text-amber|border-amber|from-amber|to-amber' ui/src/features/analysis-chamber/components ui/src/app/profile ui/src/app/members
```

Interpretation:
- not every literal is bad
- literals are acceptable for:
  - specialized chart effects
  - animations
  - SVG stop colors
  - carefully isolated semantic visuals
- literals are a problem when they duplicate shared shell/surface/chrome colors

---

## Preferred Future Rule

When adding a new Analysis Chamber screen:
1. decide whether it is shell-level, route-level, or specialized-visual styling
2. use an existing token group first
3. if a new token group is needed, add it to `analysis-chamber-shell.constants.ts`
4. do not hardcode shell/surface/chrome colors inside the route component
5. add the route/component to this lookbook index

---

## Current Known Exceptions

Some literals may still remain intentionally in specialized visuals:
- SVG gradients
- animated glows
- chart-specific point effects
- isolated shadow tuning for motion polish

These are acceptable if:
- they do not redefine the route’s core palette
- they are local to a specialized visual system
- they do not create route-level inconsistency

---

## Fast Change Strategy

For a future palette refresh:
1. update `MEDIEVAL_THEME`
2. update the relevant token groups in `analysis-chamber-shell.constants.ts`
3. audit by route using the checklist above
4. grep for stray literals only after token updates
5. verify in browser on:
   - `members`
   - `scan`
   - `profile/overview`
   - `profile/competency`
   - `profile/kpt`
   - `profile/cases`
   - `profile/journey`

That order catches almost all drift quickly.
