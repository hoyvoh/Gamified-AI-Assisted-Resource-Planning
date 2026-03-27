# Design — PA-FE-002

## Files to Create

- `fe/src/app/org/[orgId]/projects/[projectId]/team-analysis/page.tsx`
- `fe/src/components/hr/DeveloperRosterPanel.tsx`
- `fe/src/components/hr/DeveloperProfileDrawer.tsx`
- `fe/src/components/hr/profile-tabs/OceanTab.tsx`
- `fe/src/components/hr/profile-tabs/BehavioralTab.tsx`
- `fe/src/components/hr/profile-tabs/TechnicalTab.tsx`
- `fe/src/components/hr/profile-tabs/SoftSkillsTab.tsx`
- `fe/src/components/hr/profile-tabs/PerformanceTab.tsx`
- `fe/src/components/hr/TeamCompositionPanel.tsx`
- `fe/src/components/hr/ProfileSyncStatus.tsx`
- `fe/src/stores/teamMatchStore.ts`
- `fe/src/lib/api/teamMatch.ts`

## Page Entry

```tsx
// fe/src/app/org/[orgId]/projects/[projectId]/team-analysis/page.tsx

export default async function TeamAnalysisPage({ params }) {
  // Accessible to PM, TL — no role restriction
  ...
}
```

## Component Designs

### `DeveloperRosterPanel`

```tsx
// fe/src/components/hr/DeveloperRosterPanel.tsx

interface DeveloperRosterPanelProps {
  matches: PersonnelMatchScore[]
  onSelectDeveloper: (personnelId: string) => void
  onRefreshProfile: (personnelId: string) => void
}

// Sortable table columns:
//   Name | Role | Dreyfus | Match Score | Skill Coverage | OCEAN Fit | Growth | WFU | Actions
// Match score column renders a colored progress bar (0–100%)
//   - 0.8–1.0 → green, 0.6–0.79 → amber, <0.6 → red
// [View Profile] button → opens DeveloperProfileDrawer
// [Refresh] button → triggers profile refresh (calls POST /personnel/{id}/profile/refresh)
// Default sort: match_score descending
// Empty state: "Run team match analysis to see developer scores"

export function DeveloperRosterPanel(props: DeveloperRosterPanelProps) { ... }
```

### `DeveloperProfileDrawer`

```tsx
// fe/src/components/hr/DeveloperProfileDrawer.tsx

interface DeveloperProfileDrawerProps {
  personnelId: string | null    // null = drawer closed
  projectId: string
  onClose: () => void
}

// Slide-over drawer (right side, width 580px)
// Header: developer name, role, profile_version, last synced date
// Tabs: [OCEAN] [Behavioral] [Technical] [Soft Skills] [Performance]
// <ProfileSyncStatus /> shown in drawer header

export function DeveloperProfileDrawer(props: DeveloperProfileDrawerProps) { ... }
```

### Profile Tabs

```tsx
// fe/src/components/hr/profile-tabs/OceanTab.tsx

// Renders 5 horizontal bars for O/C/E/A/N scores (0.0–1.0)
// Confidence indicator below each bar
// Corpus size badge: "Inferred from N commits/PRs"
// Warning flag if confidence < 0.6: "Low confidence — refresh profile with more data"

// fe/src/components/hr/profile-tabs/BehavioralTab.tsx

// Key-value grid:
//   Communication Style | Decision Style | Collaboration Mode
//   Conflict Approach   | Learning Style
// Each value rendered as a pill/badge

// fe/src/components/hr/profile-tabs/TechnicalTab.tsx

// Two sections:
// 1. Skills Heatmap — languages/frameworks as tiles, color-coded by dreyfus_level
//    (1=grey, 2=yellow, 3=blue, 4=purple, 5=gold)
// 2. DORA Metrics — 4 gauges: Deployment Freq / Lead Time / MTTR / Change Fail Rate
// Overall dreyfus_level badge in section header

// fe/src/components/hr/profile-tabs/SoftSkillsTab.tsx

// Mini radar chart (4 axes): Leadership / Mentoring / Documentation / Code Review
// Estimation accuracy shown as ratio bar (e.g. "1.15x — tends to underestimate")

// fe/src/components/hr/profile-tabs/PerformanceTab.tsx

// 4 metric cards:
//   On-time Delivery | Defect Density | Review Acceptance | Velocity Consistency
// Last 12-month project count
// All metrics shown with trend icon (↑↓→) if historical data exists
```

### `TeamCompositionPanel`

```tsx
// fe/src/components/hr/TeamCompositionPanel.tsx

interface TeamCompositionPanelProps {
  recommendations: TeamConfiguration[]
  onSelectTeam: (config: TeamConfiguration) => void
  isComputing: boolean
}

// Three team config cards side by side (or stacked on mobile)
// Each card shows:
//   Rank badge (#1 / #2 / #3)
//   Team member avatar stack (up to 8, +N overflow)
//   Team match score (large number)
//   WFU budget: Σ effective_wfu for team members
//   Skill coverage %: progress bar
//   OCEAN balance score: small radar thumbnail
//   Rationale text (truncated, [expand] toggle)
//   [Select this team] button → emits onSelectTeam, stores selected team in project record
//
// [Run Team Match] button at top → triggers POST /projects/{id}/team-match
// Loading skeleton while isComputing = true

export function TeamCompositionPanel(props: TeamCompositionPanelProps) { ... }
```

### `ProfileSyncStatus`

```tsx
// fe/src/components/hr/ProfileSyncStatus.tsx

interface ProfileSyncStatusProps {
  personnelId: string
  lastSyncedAt: string | null
  onRefresh: () => void
  isRefreshing: boolean
}

// Renders: "Last synced: 3 days ago" + [↻ Refresh] button
// If lastSyncedAt null: "Profile not yet generated" + [Generate Profile] button
// During refresh: spinner + "Analyzing GitHub data..."
// After refresh: "Profile updated" toast + re-fetch profile data
```

## Zustand Store

```typescript
// fe/src/stores/teamMatchStore.ts

interface TeamMatchState {
  matches: PersonnelMatchScore[]
  recommendations: TeamConfiguration[]
  selectedProfile: PersonnelProfileResponse | null
  openProfileId: string | null
  isComputingMatch: boolean
  lastComputedAt: string | null

  // Actions
  runTeamMatch: (projectId: string) => Promise<void>
  loadProfile: (personnelId: string) => Promise<void>
  openProfile: (personnelId: string) => void
  closeProfile: () => void
  refreshProfile: (personnelId: string, request: ProfileRefreshRequest) => Promise<void>
  selectTeam: (config: TeamConfiguration) => void
}
```

## API Client

```typescript
// fe/src/lib/api/teamMatch.ts

export const teamMatchApi = {
  computeMatch: (projectId: string) =>
    fetch(`/api/projects/${projectId}/team-match`, { method: "POST" }).then(r => r.json()),

  getRecommendations: (projectId: string) =>
    fetch(`/api/projects/${projectId}/team-match/recommendations`).then(r => r.json()),

  getProfile: (personnelId: string) =>
    fetch(`/api/personnel/${personnelId}/profile`).then(r => r.json()),

  refreshProfile: (personnelId: string, body: ProfileRefreshRequest) =>
    fetch(`/api/personnel/${personnelId}/profile/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(r => r.json()),
}
```

## Page Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [← Back]  "Project Name"  [Analyze][HR ✓][Plan 🔒][Execute 🔒]        │
├──────────────────────────────────────┬──────────────────────────────────┤
│  DeveloperRosterPanel                │  TeamCompositionPanel            │
│  (sortable table, full height left)  │  [Run Team Match]                │
│                                      │  Card #1 / #2 / #3              │
│                                      │  [Select this team]             │
└──────────────────────────────────────┴──────────────────────────────────┘

                          ┌────────────────────────────────────────────┐
                          │  DeveloperProfileDrawer (right slide-over) │
                          │  [OCEAN][Behavioral][Technical][Soft][Perf]│
                          │  ProfileSyncStatus                         │
                          └────────────────────────────────────────────┘
```

## Acceptance Criteria

- [ ] `DeveloperRosterPanel` renders match scores after team match is computed
- [ ] Match score bars use correct color thresholds (≥0.8 green, ≥0.6 amber, <0.6 red)
- [ ] `DeveloperProfileDrawer` opens on [View Profile] click and renders all 5 tabs
- [ ] `OceanTab` shows confidence warning when confidence < 0.6
- [ ] `TechnicalTab` renders dreyfus skill tiles with correct color mapping
- [ ] `TeamCompositionPanel` renders 3 team configuration cards after team match runs
- [ ] [Select this team] triggers team selection and shows confirmation toast
- [ ] [Refresh Profile] triggers POST profile/refresh and updates profile data on success
- [ ] `ProfileSyncStatus` shows "Profile not yet generated" when lastSyncedAt is null
- [ ] Loading skeletons shown while team match is computing
- [ ] `pnpm build` — 0 TypeScript errors
