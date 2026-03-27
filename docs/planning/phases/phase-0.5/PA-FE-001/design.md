# Design — PA-FE-001

## Files to Create

- `fe/src/app/org/[orgId]/projects/[projectId]/evaluate/page.tsx`
- `fe/src/components/evaluation/ProjectRadarChart.tsx`
- `fe/src/components/evaluation/AxisScoringPanel.tsx`
- `fe/src/components/evaluation/TelosSubPanel.tsx`
- `fe/src/components/evaluation/RiskRegister.tsx`
- `fe/src/components/evaluation/VerdictBadge.tsx`
- `fe/src/components/evaluation/AiAssistDrawer.tsx`
- `fe/src/stores/evaluationStore.ts`
- `fe/src/lib/api/evaluation.ts`

## Component Designs

### `ProjectRadarChart`

```tsx
// fe/src/components/evaluation/ProjectRadarChart.tsx

const AXIS_LABELS: Record<string, string> = {
  problem_solution_fit: "Problem/Solution Fit",
  success_criterion_clarity: "Success Criteria",
  telos_composite: "TELOS Feasibility",
  quality_attribute_coverage: "Quality Attributes",
  architecture_risk: "Architecture Risk",
  strategic_value: "Strategic Value",
  financial_return: "Financial Return",
  technology_maturity: "Technology Maturity",
  organizational_readiness: "Org Readiness",
  legal_regulatory_readiness: "Legal/Regulatory",
}

interface ProjectRadarChartProps {
  scores: Record<string, number>   // axis_id -> 1–5 score (0 if not set)
  size?: number                     // SVG size in px, default 400
}

// Render SVG radar with:
// - 5 concentric rings (scores 1–5)
// - Color zones: score 1–2 = red fill, 3 = amber, 4–5 = green
// - Axis labels positioned at polygon vertices
// - Animated path update when scores change (CSS transition on d attribute)
// - Tooltip on hover showing axis name + score + weight
export function ProjectRadarChart({ scores, size = 400 }: ProjectRadarChartProps) { ... }
```

### `AxisScoringPanel`

```tsx
// fe/src/components/evaluation/AxisScoringPanel.tsx

interface AxisScoringPanelProps {
  axisId: string
  label: string
  weight: number
  currentScore: number | null
  rationale: string
  onScoreChange: (score: number) => void
  onRationaleChange: (text: string) => void
  onAiAssist: (axisId: string) => void
}

// Each axis renders as an accordion row:
// [▼] Problem/Solution Fit   weight: 12%   [● 4 ▬▬▬▬○]   [AI Assist]
//   └─ Rationale textarea (min 10 chars)
//   └─ If axisId === "telos_composite" → render <TelosSubPanel />
export function AxisScoringPanel(props: AxisScoringPanelProps) { ... }
```

### `TelosSubPanel`

```tsx
// fe/src/components/evaluation/TelosSubPanel.tsx

// Shown only for telos_composite axis
// 5 sliders: Technical / Economic / Legal / Operational / Schedule (each 1–5)
// Composite auto-computed as mean, displayed read-only
// On change → update evaluationStore.telos_breakdown

interface TelosSubPanelProps {
  breakdown: { technical: number; economic: number; legal: number; operational: number; schedule: number }
  onChange: (breakdown: TelosBreakdown) => void
}
```

### `RiskRegister`

```tsx
// fe/src/components/evaluation/RiskRegister.tsx

interface RiskRegisterProps {
  risks: RiskItem[]   // from EvaluationResponse.risk_register
}

// Table with columns: Axis | Score | Severity | Action Required | Owner
// Severity badge: score=1 → red "CRITICAL", score=2 → amber "WARNING"
// Populated automatically from backend after PATCH or finalize
// Empty state: "No risks identified — all axes scored ≥ 3"
export function RiskRegister({ risks }: RiskRegisterProps) { ... }
```

### `VerdictBadge`

```tsx
// fe/src/components/evaluation/VerdictBadge.tsx

const VERDICT_CONFIG = {
  proceed: { label: "Proceed", color: "green", icon: "✓" },
  conditional: { label: "Conditional", color: "amber", icon: "⚠" },
  do_not_proceed: { label: "Do Not Proceed", color: "red", icon: "✗" },
}

interface VerdictBadgeProps {
  verdict: "proceed" | "conditional" | "do_not_proceed" | null
  compositeScore: number | null
}

// Large badge shown in the evaluation page header
// Null state: "Pending — finalize evaluation to compute verdict"
// Shows composite score alongside verdict label
export function VerdictBadge({ verdict, compositeScore }: VerdictBadgeProps) { ... }
```

### `AiAssistDrawer`

```tsx
// fe/src/components/evaluation/AiAssistDrawer.tsx

// Side drawer triggered by "AI Assist" button on any axis
// Input: proposal text textarea (pre-filled from project.proposal_text if exists)
// On submit → POST /projects/{id}/evaluation/ai-assist
// Response renders:
//   - Suggested score (large number, highlighted)
//   - Reasoning paragraph
//   - Follow-up questions list (bullet points)
//   - Confidence bar (0–100%)
//   - [Apply Suggestion] button → sets score in evaluationStore

interface AiAssistDrawerProps {
  axisId: string | null     // null = drawer closed
  projectId: UUID
  onClose: () => void
  onApply: (axisId: string, score: number) => void
}
```

## Zustand Store

```typescript
// fe/src/stores/evaluationStore.ts

interface EvaluationState {
  evaluation: EvaluationResponse | null
  isDirty: boolean                    // true when local scores differ from server

  // Actions
  loadEvaluation: (projectId: string) => Promise<void>
  updateAxisScore: (axisId: string, score: number, rationale: string) => void
  updateTelosBreakdown: (breakdown: TelosBreakdown) => void
  saveChanges: (projectId: string) => Promise<void>    // PATCH endpoint
  finalizeEvaluation: (projectId: string) => Promise<void>
  resetEvaluation: (projectId: string) => Promise<void>
}

// Optimistic updates: update local state immediately, sync to server on saveChanges
// Auto-save: debounce 2s after last change, call saveChanges
```

## API Client

```typescript
// fe/src/lib/api/evaluation.ts

export const evaluationApi = {
  get: (projectId: string) =>
    fetch(`/api/projects/${projectId}/evaluation`).then(r => r.json()),

  create: (projectId: string, createdBy: string) =>
    fetch(`/api/projects/${projectId}/evaluation`, {
      method: "POST",
      body: JSON.stringify({ created_by: createdBy }),
    }).then(r => r.json()),

  patch: (projectId: string, body: EvaluationUpdateRequest) =>
    fetch(`/api/projects/${projectId}/evaluation`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(r => r.json()),

  finalize: (projectId: string) =>
    fetch(`/api/projects/${projectId}/evaluation/finalize`, { method: "POST" }).then(r => r.json()),

  aiAssist: (projectId: string, body: AiAssistRequest) =>
    fetch(`/api/projects/${projectId}/evaluation/ai-assist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(r => r.json()),

  reset: (projectId: string) =>
    fetch(`/api/projects/${projectId}/evaluation`, { method: "DELETE" }),
}
```

## Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  [← Back to Project]  "Project Name"  [Analyze][HR][Plan][Execute]  │
├──────────────────────┬──────────────────────────────────────────┤
│                      │  VerdictBadge (full width top)           │
│  ProjectRadarChart   ├──────────────────────────────────────────┤
│  (400×400 SVG)       │  AxisScoringPanel × 10 (accordion list)  │
│                      │  [Save Draft]  [Finalize Evaluation]     │
├──────────────────────┴──────────────────────────────────────────┤
│  RiskRegister (full width bottom)                               │
└─────────────────────────────────────────────────────────────────┘
                                    ┌──────────────────────────┐
                                    │  AiAssistDrawer (overlay)│
                                    └──────────────────────────┘
```

## Acceptance Criteria

- [ ] Page loads and creates evaluation (idempotent POST) on first visit
- [ ] `ProjectRadarChart` updates in real time as scores are changed (no page refresh)
- [ ] TELOS sub-panel appears only for `telos_composite` axis; composite auto-computes
- [ ] `RiskRegister` populates automatically after save/finalize (axes ≤ 2 appear)
- [ ] `VerdictBadge` shows correct verdict after finalize (proceed / conditional / do_not_proceed)
- [ ] `AiAssistDrawer` calls AI endpoint and renders suggested_score, reasoning, questions, confidence
- [ ] [Apply Suggestion] sets the axis score in the store and closes drawer
- [ ] [Finalize Evaluation] button disabled unless all 10 axes have scores
- [ ] Mode tab switcher shows Analyze / HR / Plan / Execute; Plan tab locked until verdict ≠ null
- [ ] `pnpm build` — 0 TypeScript errors
