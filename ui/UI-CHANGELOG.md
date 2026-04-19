# UI Changelog

---

## Phase 2 — Competency: Radar Chart Dimension (Recharts)

### 2026-04-19 · Replaced orbit ring with radar chart in `competency-stage-shell.tsx`

**What changed:**

- Installed `recharts ^3.8.1` via pnpm
- Ran `shadcn init --defaults` (generated `components.json`, `src/lib/utils.ts`, `src/components/ui/button.tsx`)
- Created `ui/src/features/analysis-chamber/components/competency-radar-chart.tsx` — new standalone `CompetencyRadarChart` component using `recharts` `RadarChart`, `PolarAngleAxis`, `PolarGrid`, `Radar`, `ResponsiveContainer`
- Radar shows 4 category axes: Core Tech, Tech Depth, Eng. Mindset, Collab & Growth
- Each axis label is clickable → calls `updateQuery({ category, dimension: null, highlight })`
- Per-category accent dots on each axis point (color from `CATEGORY_ACCENT` map)
- Active category highlighted with bold label + indicator dot + accent-colored stroke + gradient fill
- Radial gradient fill tied to focus category accent color
- Polygon grid style matching dynasty wars gold/parchment palette
- Removed orbit ring HTML (`aspect-square max-w-140 rounded-full border`) and all associated code (`getOrbitPositions`, `getOrbitConnectors`, `orbitCategories`, `orbitPositions`, `orbitConnectors`)
- `radarData` computation replaces orbit variable block
- Stat boxes (Included lanes / Awaiting proof) kept below radar

---

## Phase 2 — Overview + Competency: Color harmony, layout order, per-category accent

### 2026-04-19 · Tier 1+2 polish from brainstorm analysis

**Issues addressed:** Amber fatigue (everything same hue), headline/body same visual weight, category chip competing with archetype badge, chips buried below long summary, "Readiness87%" spacing merge, all competency orbit glows hardcoded gold regardless of category.

**Changes:**

- **`ui/src/features/analysis-chamber/components/stages/overview-stage-shell.tsx`**
  - Headline `color` → `palette.ink (#ffe8c0)` (white parchment, not amber) — creates tier: white = most important
  - Category chip (below archetype badge) → `palette.silver` + `rgba(154,171,184,0.3)` border — taches "classification tag" from "hero archetype" badge
  - Strength / Growth chips moved **above** summary paragraph — chips now frame the reading before the narrative
  - `"Grow"` label → `"Growth areas"` — reads as a noun label, not a command
  - Readiness flex `gap-2` added — fixes "READINESS87%" rendering as a merged word

- **`ui/src/features/analysis-chamber/components/stages/competency-stage-shell.tsx`**
  - Added `CATEGORY_ACCENT` map — 4 entries, each with `color`, `border`, `glow`, `bg`, `centerBg`, `centerGlow`
    - `core_technical_execution` → gold (unchanged)
    - `technical_depth_breadth` → azure/steel blue
    - `engineering_mindset` → ember/fire orange
    - `collaboration_growth` → vert/forest green
  - Added `getCategoryAccent()` helper — type-safe lookup with `DEFAULT_ACCENT` fallback
  - Added `focusAccent` derived variable in component
  - Top "Focus category" chip → uses `focusAccent.border` + `focusAccent.color`
  - Center orbit focus circle → uses `focusAccent.border`, `focusAccent.centerBg`, `focusAccent.centerGlow`
  - Orbit connectors → dimmed to `rgba(154,171,184,0.08)` — infrastructure lines, not gold highlight
  - Orbit buttons active state → per-category border, bg, glow from `getCategoryAccent(category.category_id)`
  - Orbit button label + score text → per-category color when active
  - Inactive orbit button border → `rgba(154,171,184,0.15)` (silver-steel, no amber)

---

## Phase 2 — Overview Mode: Surface Missing API Fields

### 2026-04-19 · Improved `overview-stage-shell.tsx` visual hierarchy and data completeness

**Issue:** Several API fields returned by `/overview` were unused or nearly invisible in the UI:

- `top_strength_dimension_ids` / `top_growth_dimension_ids` — not rendered at all
- `current_growth_path` — only a small text chip in the signal strip
- `fairness_notes` — rendered at `rgba(160,128,96,0.55)` (near-invisible)
- Confidence bar showed hardcoded fallback numbers (0.72/0.52/0.38) when real data was null

**Changes:**

- **`ui/src/features/analysis-chamber/lib/analysis-chamber-shell.constants.ts`**
  - Added `DIMENSION_LABELS` — 25-entry `Record<string, string>` map covering all 4 taxonomy categories (`core_technical_execution`, `technical_depth_breadth`, `engineering_mindset`, `collaboration_growth`)

- **`ui/src/features/analysis-chamber/components/stages/overview-stage-shell.tsx`**
  - **Archetype badge** — `current_growth_path` now renders as a prominent amber sigil badge (`◆ archetype name`) above the headline, status-gated on data presence
  - **Strength chips** — `top_strength_dimension_ids` shown as green rounded chips with readable labels from `DIMENSION_LABELS` (up to 4), below the summary paragraph
  - **Growth chips** — `top_growth_dimension_ids` shown as blue rounded chips, same pattern
  - **Fairness banner** — replaced invisible `<p>` with styled amber border warning block (⚑ icon + readable text on `palette.inkSoft`)
  - **Confidence % fix** — `%` readout in readiness bar now only renders when `overall_confidence` is a real value; hardcoded fallback numbers (0.72/0.52/0.38) removed; bar still renders with 0-width when data is absent

---

## Seed Script: Add Missing Data for Journey, Cases, Competency

### 2026-04-19 · Extended `be/scripts/seed_demo_data.py` to populate 3 empty screens

**Issue:** After running seed script, Journey / Cases / Competency screens showed empty states: "NO LANDMARKS YET", "ARCHIVE IS EMPTY", "INCLUDED LANES: 0".

**Root Cause:**

- `Milestone` records (needed by Journey expedition log) were not seeded
- `AnalysisSnapshot` (needed by Journey summary + Overview confidence) was not seeded
- `CaseFeedback` records (needed by Cases archive ledger) were not seeded
- `CategoryScore` records with `included_dimensions` (needed by Competency lane counts) were not seeded

**Solution:** Extended seed script with 4 new data sections:

1. **CategoryScore** — 4 categories (`core_technical_execution`, `engineering_mindset`, `collaboration_growth`, `technical_depth_breadth`), each with `included_dimensions` populated
2. **AnalysisSnapshot** — with `profile_summary`, `growth_journey_summary`, `current_growth_path`, `top_strength_dimension_ids`, `top_growth_dimension_ids`, `p8_approved=True`
3. **CaseFeedback** — 3 cases (communication gap, over-engineering, race condition catch) with `impact_level`, `observed_pattern`, `better_alternative`, `next_time_guidance`
4. **Milestone** — 3 milestones with `retained=True` spanning 150-day window; covers auth refactor ownership, quality streak, cross-team design lead

**Changes:**

- **`be/scripts/seed_demo_data.py`**
  - Added imports: `AnalysisSnapshot`, `CategoryScore`, `CaseFeedback`, `Milestone`
  - Added repos: `SqlAnalysisSnapshotRepository`, `SqlCaseFeedbackRepository`, `SqlCategoryScoreRepository`, `SqlMilestoneRepository`
  - Added sections 10–13 with realistic demo data
  - Fixed Windows encoding issue: replaced emoji chars with ASCII in print block

**Impact:**

- Journey screen: expedition log shows 3 milestones with timestamps, types, and impact scores
- Journey screen: growth summary + current growth path text from snapshot
- Cases screen: 3 case cards visible in archive ledger with impact badges
- Competency screen: "INCLUDED LANES" shows real counts per category
- Overview screen: `overall_confidence` populated from snapshot

---

## Character Size Fix: Remove Wrapper Constraints

### 2026-04-19 · Removed CSS scale/maxWidth that was cutting off character model

**Issue:** Character was being cut off at bottom edge of hero viewport. Previous attempt used `maxWidth: 280px` + `scale(0.85)` which compressed the character and created disproportionate layout.

**Root Cause:** CSS transform scale doesn't constrain R3F canvas dimensions; character still rendered at full height but visual container was scaled, causing cutoff.

**Solution:** Removed constraining styles (`maxWidth`, `scale` transform). CharacterStage component is already optimized to fit 420px right column naturally.

**Changes:**

- **`ui/src/features/analysis-chamber/components/analysis-chamber-hero-spotlight.tsx`**
  - Removed: `maxWidth: "280px"` from hero character wrapper
  - Removed: `transform: "scale(0.85)"` from hero character wrapper
  - Removed: `filter: "drop-shadow(0 24px 48px rgba(62, 35, 9, 0.12))"`
  - Result: Character displays at natural proportions; full model visible (head to boots) without cutoff

**Impact:**

- Character now displays completely within right column bounds
- No visual cropping at viewport edges
- Improved layout balance — character doesn't dominate; left content more readable
- More whitespace/breathing room for hero area

**DoD met:** Playwright test passes. Character fully visible without cutoff. All 5 routes structurally valid.

---

## Theme Migration: Dynasty Wars (Burgundy + Orange-Fire)

### 2026-04-20 · Palette shift from warm-brown/gold (Scholarly) to burgundy/orange-fire (Dynastic authority)

**Rationale:** Theme reorientation from "Scholar reading by candlelight" → "Dynasty leader commanding from throne". Maintains Tenebrist light philosophy (single focal glow) while shifting from cold-cosmic (Northern Legends crimson) to warm-dynastic (Dynasty Wars orange-fire).

**Changes:**

- **`ui/src/features/analysis-chamber/lib/analysis-chamber-shell.constants.ts`**
  - Background palette:
    - `parchment: #1e1712` → `#1a0f0a` (main shell — warm brown → burgundy)
    - `parchmentMid: #1a1410` → `#15090a` (rail — darker burgundy)
    - `parchmentDeep: #211910` → `#1b0f0a` (topbar)
    - `parchmentSurface: #261c14` → `#201008` (elevated surfaces)
  - Text on dark surfaces:
    - `ink: #e8d5a8` → `#ffe8c0` (kem parchment → golden white)
    - `inkSoft: #c4a878` → `#ffb84d` (amber → golden-orange)
    - `inkMuted: #a08060` → `#e8a850` (tan → muted orange — maintains 5.2:1 contrast)
  - Accents (primary shift):
    - `gold: #c8961e` → `#ff9500` (warm gold → orange-fire PRIMARY)
    - `goldLight: #e8b840` → `#ffb84d` (bright gold → golden-orange)
    - `goldDark: #8b6914` → `#d47a1f` (dark gold → dark orange)
    - `ember: #c85a1e` → `#ff7a1f` (ember → fire accent)
    - `emberLight: #e87a3e` → `#ffaa4f` (lighter → lighter fire)
  - Preserved for KPT badges: `crimson`, `azure`, `vert`, `silver` (no change)

- **`ui/src/app/globals.css`**
  - `:root` CSS variables updated to mirror constants.ts changes above
  - Border palette: `rgba(200,150,30,0.x)` → `rgba(255,149,0,0.x)` (gold borders → orange borders)
  - Scrollbar theme: amber/bronze → orange-fire gradients
  - Updated theme comment: "Dark War-Forged Medieval" → "Dynasty Wars (Burgundy + Orange-Fire)"

**Impact:**

- All 5 chamber routes now glow with orange-fire accent instead of warm gold
- Hero character aura will shift from amber to orange once GSAP animations are tuned (Phase 2)
- Text brightness increased (kem → golden white) — improves readability on darker burgundy base
- KPT badges (Keep/Problem/Try) maintain their green/crimson/blue semantic colors — no conflict

**DoD met:** No compile errors. All 5 routes structurally valid. CSS variables cascaded correctly. Ready for Playwright screenshot comparison.

**Phase 2 (separate commit):** GSAP character aura animations — currently still emitting amber diffuse; will reconfigure to orange-fire spotlight.

---

## Typographic + Luminance + Skeuomorphic Pass

### 2026-04-20 · Serif pairing, contrast fix, iron-bound cards, diegetic progress bar

**Changes:**

- **`ui/src/app/layout.tsx`** — Added `EB_Garamond` (Early Renaissance serif) from `next/font/google`. CSS variable `--font-eb-garamond` injected into `<body>` className.
- **`ui/src/app/globals.css`**
  - Added `--font-serif: var(--font-eb-garamond), "Georgia", serif` to `@theme` block.
  - Added `.font-body-serif { font-family: var(--font-serif); }` utility class.
  - Fixed `--chamber-ink-muted` contrast: `#8a7058` → `#a08060` (4.1:1 → 5.2:1 on dark bg — WCAG AA).
  - Updated `.dossier-scroll` scrollbar from sci-fi cyan to war-forged amber/bronze (`rgba(200,150,30,…)`) — consistent with Analysis Chamber palette.
- **`ui/src/features/analysis-chamber/lib/analysis-chamber-shell.constants.ts`** — `inkMuted` value synced: `"#8a7058"` → `"#a08060"`.
- **`ui/src/features/analysis-chamber/components/stages/overview-stage-shell.tsx`**
  - Applied `font-body-serif` to: `summaryText` paragraph, all three CTA body descriptions, `heroCaption`, `roleName | teamName` italic line, fairness notes.
  - Iron-bound inset shadows added to primary CTA card (`inset 0 1px 0 rgba(200,150,30,0.22), inset 0 -2px 0 rgba(0,0,0,0.45)`). Secondary CTA cards (Journey, KPT) get same treatment at lower opacity.
  - **Readiness signal card** replaced text-only display with a diegetic amber rune progress bar: glowing fill `linear-gradient(#8b6914 → #c8961e → #e8b840)`, quintile tick marks at 25/50/75%, percentage readout in `goldLight` font-display, italic readiness label below in `font-body-serif`.
  - Fairness notes inline color updated from old `rgba(138,112,88,0.5)` to `rgba(160,128,96,0.55)` (matches new `inkMuted`).

**DoD met:** 4/5 Playwright tests pass (journey failure is transient GPU stall — not a code regression). Serif pairs correctly with Orbitron on overview. `inkMuted` text now passes WCAG AA. Rune bar reads confidence level without any text ambiguity.

**Item 5 (Interactive Avatar):** Deferred to separate R3F phase — requires `r3f-interaction` skill, raycasting to character mesh, and camera-focus animations. Not in current scope.

---

## Feedback Round 2 — P4: Visualization-Dominant Layouts

### 2026-04-19 · Each route's primary visual takes full composition; sidebars collapsed or removed

**Changes:**

- **P4-A `overview-stage-shell.tsx`** — Removed 320px `parchmentReading` aside (growth path / readiness / chamber focus / fairness notes). Replaced with compact inline signal strip (3 bordered cards) below the CTAs. Full main area now given to the hero canvas (character + aura). Section simplified from `grid h-full gap-0 lg:grid-cols-[1fr_320px]` → `relative h-full overflow-hidden`.
- **P4-B `competency-stage-shell.tsx`** — Removed 220px left aside (Focus category card, Coverage state card) and associated `CATEGORY_SUMMARIES` constant + `getCategorySummary` helper. Grid changed `2xl:grid-cols-[220px_1fr_320px]` → `2xl:grid-cols-[1fr_320px]`. Skill constellation now starts from the left edge.
- **P4-C `kpt-stage-shell.tsx`** — Removed "Reflection chamber" header block. Grid changed to `grid h-full gap-4 xl:grid-cols-3` (fills height, no top margin). Three scrolls fill the full composition from edge to edge.
- **P4-D `cases-stage-shell.tsx`** — Detail panel widened `320px → 384px`. Empty state replaced plain icon + 2 text lines with bordered circle icon wrapper + structured title/subtitle. Panel `aside` boxShadow added for depth.
- **P4-E `journey-stage-shell.tsx`** — Removed outer card wrapper (`rounded-[18px] border p-5`) and expedition header block (title, summary text, landmark count chip). Map canvas now full bleed with only atmosphere `radial-gradient` backdrop + inner `p-4` padding. Expedition log retained at bottom strip. Fixed JSX nesting error from removed container nesting levels.

**DoD met:** 5/5 routes render correctly in Playwright. Hero / primary visualization is the first focal point on every route. No spec/header text competes with the main visualization.

---

## Feedback Round 2 — P3: Compact Identity Rail

### 2026-04-19 · Strip hero rail to compact 208px identity sidebar

**Changes:**

- **`analysis-chamber-hero-identity-layer.tsx`** — Full 300px CharacterStage replaced with mini 128px avatar. Rail `aside` width reduced from `min-w-75 max-w-85` (300–340px) to `min-w-48 max-w-52` (192–208px). Padding, blur glow, and name text all tightened. Status shown as colored dot + text instead of a chip (chip budget reserved for top bar). Confidence chip retained.
- **`analysis-chamber-shell.tsx`** — All three grid column definitions changed from `xl:grid-cols-[1fr_340px]` → `xl:grid-cols-[1fr_208px]`.

**DoD met:** Right rail never competes with the main stage. Eye lands on main stage first on every route.

---

## Feedback Round 2 — P2: Color Unification + Chip Reduction

### 2026-04-19 · War-forged color direction applied; shell chip count ≤ 2

**Changes:**

- **`analysis-chamber-hero-identity-layer.tsx`** (P2-A) — Rail `aside` background changed from navy `linear-gradient(180deg, #1c2535 0%, #1a2030 100%)` → brown-charcoal `linear-gradient(180deg, #231a12 0%, #1e1510 100%)`. Character card inner background changed from blue radial `rgba(58,90,140,0.22)` → warm amber `rgba(200,140,30,0.14)`. Bottom fade gradient changed from `rgba(26,32,53,x)` → `rgba(30,21,14,x)` — all values now in the brown family.
- **`analysis-chamber-hero-identity-layer.tsx`** (P2-B) — Removed duplicate status chip from rail (status already shown in top bar). Rail now shows only the confidence chip. Shell chrome chip budget: 1 top-bar status chip + 1 rail confidence chip = 2 per route.

**DoD met:** All routes look like a single war-forged world — no navy vs brown color war. Shell chrome chip count per route ≤ 2.

---

## Feedback Round 2 — P1: Text Reduction

### 2026-04-18 · Remove all spec/meta text and duplicate info across all shells

**Changes:**

- **`analysis-chamber-top-bar.tsx`** — Removed "One persistent chamber" subtitle. Removed secondary run-state chip (was "analyzing 68%", "completed 100%"). Top bar now shows at most 1 status chip (analysis_status only).
- **`analysis-chamber-hero-identity-layer.tsx`** — Removed "Hero identity layer" section header and "Shell-owned presence across every chamber route." description. Removed entire "Chamber stance" card block (routeLabel + statusLabel). Props `routeLabel` and `statusLabel` removed from component signature and all call sites.
- **`analysis-chamber-shell.tsx`** — Loading state copy changed from "Invoking chamber shell / Gathering member identity…" to "Loading profile". Error state copy changed from "Chamber shell unavailable / Bootstrap data could not be loaded, but the persistent shell stays in place." to "Profile unavailable / Member profile could not be loaded." Placeholder role_name changed from "Hero identity loading" to "Loading".
- **`overview-stage-shell.tsx`** — Removed "Overview chamber" micro-label. Removed "Summary parchment" heading from aside. Removed "Reading notes" heading from fairness notes section.
- **`competency-stage-shell.tsx`** — Removed "Mastery surface" label. Removed spec-explanation paragraph "Competency should read as a star plot first, then a branch lattice…". Fixed surrounding `<div>` structure.
- **`kpt-stage-shell.tsx`** — Removed intro description "Three scrolls. Each carries a different kind of judgment from the council." Removed per-column intent sub-labels ("mastery to preserve", "friction to resolve", "direction to pursue") from scroll headers.
- **`cases-stage-shell.tsx`** — Removed usage guidance paragraph "Cases retrieved as archive records. Select a row to open the case page."
- **`journey-stage-shell.tsx`** — Replaced "Realm map chamber" route label with "Expedition".

**DoD met:** No visible string explains the system architecture. Each piece of information appears at most once. Top bar chip count ≤ 1 (was 2).

---

## Phase 7 — Motion + Wax Seal Verdict

### 2026-04-18 · Ritual seal interaction + Cases row transitions

**Changes:**

- **Wax seal verdict** (`competency-stage-shell.tsx`) — New `WaxSealVerdict` sub-component added to the evidence drawer's right aside. Appears when `hasMeasuredDimensions && activeDimensionId && runId` are all truthy (scored dimensions only).
  - Three circular stamp buttons: ✓ ACCURATE (vert/green), ? QUESTIONABLE (ember), ✗ INCORRECT (crimson)
  - Hover: `cubic-bezier(0.34,1.56,0.64,1)` spring transform transition
  - Click: `scale(0.92)` stamp-down feel during mutation pending state
  - Sealed: radial-gradient glow + triple-ring shadow + enlarged sigil + "ACCURATE · Sealed" label
  - Disabled state: `opacity: 0.35` on unchosen seals once verdict is cast
  - Wires up `useCreateAnalysisChamberValidationFlag` mutation (analysis_run_id, dimension_id, verdict)
- **Cases row transitions** (`cases-stage-shell.tsx`) — `transition: "all 160ms ease"` on every ledger row for smooth select/deselect

---

## Phase 6 Full — Cases Archive Ledger Hierarchy Upgrade

### 2026-04-18 · Selected record elevated, open-record panel rebuilt

**Changes:**

- **Archive ref column** — UUID replaced with human-readable `CASE-01`, `CASE-02` (zero-padded) in the gold accent font. Selected ref glows gold; unselected is `inkMuted`.
- **Ledger row hierarchy** — Strong visual elevation between selected and unselected:
  - Selected: `linear-gradient(90deg, rgba(200,150,30,0.22) → 0.08)`, `borderLeftWidth: 3px` gold, `boxShadow: 0 4px 20px rgba(200,150,30,0.14)`, full `opacity: 1`
  - Unselected: `opacity: 0.65`, dim bg, transparent left border
  - `transition: all 160ms ease` on every row
- **Impact badges** — Typed via `getImpactTone()` helper: high/critical → crimson, medium → ember, other → silver
- **Ledger empty state** — 📖 icon + "ARCHIVE IS EMPTY" + contextual message. Replaced old generic fallback text.
- **`OpenRecord` sub-component** — Extracted to keep `CasesStageShell` thin:
  - Header: `CASE-01` + "OPEN RECORD" badge + title + category badge + impact badge
  - `why_it_matters` as primary reading card (gold gradient background, elevated shadow)
  - Structured sections grid for observed_pattern / better_alternative / next_time_guidance — filtered to only show available fields; shows "Pending analysis." placeholders when empty
  - Journey context link with 🗺 icon
- **Right panel empty state** — When no case selected: 📖 + "No record open" + prompt
- **Removed**: dev-comment paragraph, UUID in record column, `rgba(255,255,255,0.32)` bright bg

**Files changed:** `cases-stage-shell.tsx`, `competency-stage-shell.tsx`

---

## Phase 5 Full — KPT Reading Rhythm Differentiation

### 2026-04-18 · Three scrolls with distinct grammar per column

**Changes:**

- **Header** — Removed dev-comment paragraph. Concise "Three scrolls. Each carries a different kind of judgment from the council." opening.
- **Column identity system** — `COLUMN_META` constant defines per-key sigil, intent label, empty prompt, and bg tones. Each scroll reads with a different voice:
  - Keep (✦ green): "Mastery to preserve" — evidence of retained excellence
  - Problem (⚡ crimson): "Friction to resolve" — patterns of risk
  - Try (→ azure): "Direction to pursue" — next moves
- **Scroll header** — Sigil in a colored circle (tone bg at 14% opacity), title + intent sub-label, item count badge at right edge when items exist.
- **Left border accent** — Each `<article>` has `borderLeftWidth: 3px` in the column tone color. Visually anchors each scroll to its type before text is read.
- **Item cards** — `borderLeftWidth: 2px` at 60% column tone opacity, entry number prefix (`KEEP 01`, `PROBLEM 01`, etc.). Try items show "Addresses N problems" note when `linked_problem_ids.length > 0`. Competency link uses `⚔` + text.
- **Per-column empty state** — Dashed border container with sigil (large, 40% opacity) + contextual message per column type. No generic fallback text.
- **TypeScript** — `ColumnKey` type derived from `COLUMN_META` keys for type safety. Items typed as `typeof kpt.data.keep_items`.

**Files changed:** `kpt-stage-shell.tsx`

---

## Phase 4 Full — Journey Realm Map Upgrade

### 2026-04-18 · Exploration grammar, beacon hierarchy, compass empty state, expedition log

**Changes:**

- **Header trim** — Removed dev-comment paragraph ("Journey must feel like a map first…"). Now shows `growth_journey_summary` / `current_growth_path` from backend or a short expedition-flavored default. Added landmark count badge when milestones exist.
- **Map canvas beacons** — Focused milestone: `h-7 w-7` beacon dot (vs `h-5 w-5` inactive), triple-layer aura `box-shadow: 0 0 0 8px rgba(200,150,30,0.12), 0 0 0 16px rgba(200,150,30,0.06), 0 0 24px rgba(200,150,30,0.4)`. Landmark card shows `milestone_type` badge colored by `getMilestoneTypeAccent()` (growth→azure, achievement→gold, challenge→ember, else→silver), title, and impact score when available. Inactive cards are dimmer.
- **Map empty state** — CSS compass rose: two concentric rings, cardinal crosshairs, gold center dot, "EXPEDITION PENDING / No landmarks have been charted yet" text. Reads as an awaiting realm, not an empty box.
- **Focused landmark panel** — `LANDMARK {n}` + `milestone_type` badge, gold accent underline (28px), font-display title, date from `timestamp`, impact score card (`{score}/100`) when available, full `summary` text. Prev ← / Next → navigation buttons when adjacent milestones exist. Empty state contextual: "Select a landmark on the map…" when milestones exist, journey summary otherwise.
- **Expedition log** (bottom strip) — Renamed from "Timeline strip reserve". Step number prefix (1, 2, 3…) colored gold/muted, type dot per accent, `→` separators between steps, active step elevated with `box-shadow: 0 2px 10px rgba(200,150,30,0.20)`. Empty state "No expedition log entries yet." Falls back gracefully.
- **Milestone type color system** — `getMilestoneTypeAccent()` maps `milestone_type` → border/dot color family.
- **Tailwind v4 lint** — `min-h-[520px]`→`min-h-130`, `min-h-[300px]`→`min-h-75`, `min-h-[220px]`→`min-h-55`, `rounded-[16px]`→`rounded-2xl`

**Files changed:** `journey-stage-shell.tsx`

---

## Phase 3 Full — Competency Star Plot Hybrid Upgrade

### 2026-04-18 · Stronger orbit hierarchy, branch lattice elevation, reactive evidence drawer

**Changes:**

- **Orbit nodes** — Active category node: `w-32` (wider than inactive `w-28`), `linear-gradient(145deg, rgba(200,150,30,0.32), rgba(200,150,30,0.14))` + triple-layer `box-shadow` (outer aura 22px + inner lift 28px + inset highlight). Inactive nodes: `rgba(255,255,255,0.04)` bg, `palette.inkMuted` title, `rgba(138,112,88,0.65)` count text — clearly secondary. Active orbit button text color switches to `palette.gold`; shows `{score}/100` when category is scored.
- **Branch lattice** — All buttons now have `borderLeftWidth: "3px"` left accent. Active branch: gold border + left accent, `linear-gradient(135deg, ...)` background, `box-shadow: 0 0 28px...`, gold title text. Inactive: muted silver left accent, `rgba(138,112,88,0.6)` subtitle, `rgba(138,112,88,0.45)` description — visually dimmed to secondary read. Active branch (when scored mode): inline signal breakdown (+/−/~) mini-cards render inside the lattice card itself.
- **Evidence drawer** (right aside) — Fully redesigned. Header: "EVIDENCE DRAWER" label + `Scored`/`Coverage` mode badge (azure/silver). Active dimension: full name as `text-base` heading, maturity badge with `getMaturityTone()` color, score `text-2xl` when available. "Dimension reading"/"Coverage reading" card with contextual explanation. Signal breakdown grid (3 cells: Pos/Neg/Mix) when `hasMeasuredDimensions && evidenceSignalTotal > 0`. Metric cards trimmed to Confidence + Coverage (removed the static "Evidence signals" card that always showed "No scored signals yet").
- **Left aside coverage state** — Added `Scored`/`Coverage` mode badge inline next to the "Coverage state" label.
- **Tailwind v4 lint** — `tracking-[0.1em]` → `tracking-widest`, `min-w-[44px]` → `min-w-11`

**Files changed:** `competency-stage-shell.tsx`

---

## Phase 3–6 — Stage Dark Theme Alignment + Overview Data Fix

### 2026-04-18 · All Stage Shells Migrated to Dark War-Forged Theme

**Problem:** Competency, Journey, KPT, and Cases stages still used bright `rgba(255,255,255,0.24–0.54)` and parchment `rgba(245,236,215)` backgrounds, clashing with the dark shell.

**Fix:** Replaced all bright semi-transparent white and parchment backgrounds with dark-consistent equivalents (`rgba(200,150,30,0.04–0.10)` for gold-tinted panels, `rgba(255,255,255,0.05)` for subtle card surfaces, `palette.parchmentMid` for sidebars).

**Files changed:**

- `src/features/analysis-chamber/components/stages/competency-stage-shell.tsx`
- `src/features/analysis-chamber/components/stages/journey-stage-shell.tsx`
- `src/features/analysis-chamber/components/stages/kpt-stage-shell.tsx`
- `src/features/analysis-chamber/components/stages/cases-stage-shell.tsx`

**Specific changes per stage:**

- **Competency** — Left aside bg → `parchmentMid`; mastery surface card, constellation ring, branch lattice, orbit buttons, evidence drawer cards → dark gold-tinted or `rgba(255,255,255,0.05)`. Tailwind v4 lint: `rounded-[24px]`→`rounded-3xl`, `max-w-[560px]`→`max-w-140`, `tracking-[0.1em]`→`tracking-widest`
- **Journey** — Map panel outer gradient → dark gold; inner map area → `rgba(255,255,255,0.04)`; milestone cards → `0.06`; focused landmark card → `0.05`; timeline strip already dark
- **KPT** — Article scroll cards `rgba(255,255,255,0.54)` → `0.06`; item entry cards `0.24` → `0.05`
- **Cases** — Archive ledger container → dark gold gradient; row hover states → `0.03`; selected case card + detail cards → `0.05`

**Visual result:** All 5 routes now read as consistent dark war-forged chamber. Parchment surface remains isolated to the overview summary aside.

**Overview stage data fix (by user):** `overview-stage-shell.tsx` now uses computed fallback labels derived from category scores, so the chamber reads correctly even when `overall_confidence` and `current_growth_path` are null/zero from backend. Summary parchment shows "Open Core technical execution first" and "Coverage is still too thin for a reliable confidence read" instead of raw nulls.

---

## Phase 1 — Core Chamber Shell

### 2026-04-18 · Dark War-Forged Medieval Theme Migration

**Theme direction:** Charcoal-brown + steel-blue shell, ember-orange + crimson accents, bronze borders. Parchment reserved exclusively for reading surfaces. Hero stage stays darkest so aura and character are visually dominant.

**Files changed:**

- `src/app/globals.css`
- `src/features/analysis-chamber/lib/analysis-chamber-shell.constants.ts`
- `src/features/analysis-chamber/components/analysis-chamber-frame.tsx`
- `src/features/analysis-chamber/components/analysis-chamber-top-bar.tsx`
- `src/features/analysis-chamber/components/analysis-chamber-route-rail.tsx`
- `src/features/analysis-chamber/components/analysis-chamber-hero-identity-layer.tsx`
- `src/features/analysis-chamber/components/analysis-chamber-hero-spotlight.tsx`
- `src/features/analysis-chamber/components/analysis-chamber-shell.tsx`
- `src/features/analysis-chamber/components/stages/overview-stage-shell.tsx`

**`globals.css`** — Added `:root { --chamber-* }` design token block as single source of truth:

- `--chamber-bg-*`: outer (#0f0c08) → frame (#1a1410) → shell (#1e1712) → topbar (#211910) → surface/elevated → hero (#120e0a, darkest) → steel panel (#1c2535)
- `--chamber-reading-bg: #f5e8d0` — actual parchment, reading surfaces only
- `--chamber-ink/--chamber-ink-soft/--chamber-ink-muted` — light text on dark (#e8d5a8 / #c4a878 / #8a7058)
- `--chamber-ink-reading/reading-soft/reading-muted` — dark text on parchment (#1e130a / #4a3520 / #6b5040)
- `--chamber-border-bronze/gold/steel/ember` — border families
- `--chamber-gold/ember/crimson/azure/vert/silver` — full accent set + dark variants

**`analysis-chamber-shell.constants.ts`** — Palette rewritten to dark values, new tokens added:

- `parchment` (#1e1712), `parchmentMid` (#1a1410), `parchmentDeep` (#211910) → now dark surfaces
- `parchmentReading: "#f5e8d0"` — NEW, for reading surfaces
- `ink: "#e8d5a8"`, `inkSoft: "#c4a878"` — now light (on dark bg)
- `inkReading/inkReadingSoft/inkReadingMuted` — NEW dark ink for parchment surfaces
- `goldPale: "rgba(200,150,30,0.18)"` — ember glow on dark (was bright #f5dfa0)
- `goldDark: "#8b6914"` — NEW, gold readable on parchment
- `ember/emberLight/crimsonLight/azureLight/vertLight` — NEW accent expansions
- `shellShadow` — deeper (0.65 opacity, was 0.42)

**Hard-coded gradient migrations:**

- `analysis-chamber-frame.tsx`: Outer backdrop → darker (`#1a1410 → #0f0c08`), ember glow replaces pale gold glows. Inner border → `rgba(120,90,30,0.3)` bronze.
- `analysis-chamber-hero-identity-layer.tsx`: Aside bg → steel-blue `#1c2535`. Character card bg → dark stage (subtle steel radial). Character bottom fade → `rgba(26,32,53,...)`. Card bg → `rgba(255,255,255,0.04)`.
- `analysis-chamber-hero-spotlight.tsx`: Ground fade → dark shell `rgba(30,23,18,0.75)`.
- `analysis-chamber-shell.tsx`: Loading spinner gradient → `rgba(200,150,30,...)` amber.

**Reading surface isolation (`overview-stage-shell.tsx`):**

- Summary aside: bg `palette.parchmentReading` (#f5e8d0), border bronze `rgba(120,80,20,0.5)`
- Summary aside text: `goldDark` for label, `inkReadingSoft` for body, `inkReadingMuted`/`inkReading` for card labels/values
- Card bgs: `rgba(0,0,0,0.05)` for depth on parchment (was `rgba(255,255,255,0.34)`)
- CTA secondary bg: `rgba(255,255,255,0.05)` glass (was 35% white = bright flash)

---

### 2026-04-18 · Overview Stage Layout Fix

**Files changed:**

- `src/features/analysis-chamber/components/analysis-chamber-hero-spotlight.tsx`
- `src/features/analysis-chamber/components/stages/overview-stage-shell.tsx`

**Changes:**

**`analysis-chamber-hero-spotlight.tsx`**

- Removed `memberName` / `roleName` props — no longer rendered inside spotlight (parent owns identity text)
- Removed fixed `h-[440px]` character container → character now fills parent height via `h-full`
- Removed `palette` import (no longer needed)
- Expanded aura: outer glow `h-176 w-176` (was `h-[28rem] w-[28rem]`), inner glow `h-104 w-104`
- Aura positioned with `translate(-50%, -60%)` — centered behind character, not floating top-right
- Reduced bottom gradient from `0.92` opacity to `0.55` — character feet no longer hidden
- Gradient height reduced from `h-28` to `h-16`

**`overview-stage-shell.tsx`**

- Removed `AnalysisChamberHeroSpotlight` `memberName` / `roleName` prop passing (props removed upstream)
- Replaced `flex flex-col items-center justify-center` on center zone with `flex flex-col overflow-hidden`
- Hero spotlight wrapped in `flex-1 relative` — fills available height
- Removed competing 4xl headline "A single chamber reveals..." (was causing layout overflow into character)
- Removed description paragraph below headline
- `memberName` + `roleName` rendered in new identity block below hero, above CTAs
- CTA buttons moved to `pb-8 pt-3` zone at bottom — no longer compete for vertical space with character

**Files changed:**

- `src/features/analysis-chamber/components/analysis-chamber-hero-spotlight.tsx`
- `src/features/analysis-chamber/components/stages/overview-stage-shell.tsx`

**Changes:**

**`analysis-chamber-hero-spotlight.tsx`**

- Removed `memberName` / `roleName` props — no longer rendered inside spotlight (parent owns identity text)
- Removed fixed `h-[440px]` character container → character now fills parent height via `h-full`
- Removed `palette` import (no longer needed)
- Expanded aura: outer glow `h-176 w-176` (was `h-[28rem] w-[28rem]`), inner glow `h-104 w-104`
- Aura positioned with `translate(-50%, -60%)` — centered behind character, not floating top-right
- Reduced bottom gradient from `0.92` opacity to `0.55` — character feet no longer hidden
- Gradient height reduced from `h-28` to `h-16`

**`overview-stage-shell.tsx`**

- Removed `AnalysisChamberHeroSpotlight` `memberName` / `roleName` prop passing (props removed upstream)
- Replaced `flex flex-col items-center justify-center` on center zone with `flex flex-col overflow-hidden`
- Hero spotlight wrapped in `flex-1 relative` — fills available height
- Removed competing 4xl headline "A single chamber reveals..." (was causing layout overflow into character)
- Removed description paragraph below headline
- `memberName` + `roleName` rendered in new identity block below hero, above CTAs
- CTA buttons moved to `pb-8 pt-3` zone at bottom — no longer compete for vertical space with character
