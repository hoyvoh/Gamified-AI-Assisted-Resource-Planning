# Design — FE-009

## Files to Create/Modify
- ui/src/app/org/[orgId]/projects/new/page.tsx — proposal input form
- ui/src/components/AIPrompt/AIPromptPanel.tsx — expandable panel
- ui/src/components/AIPrompt/TaskGenerationReview.tsx — review generated tasks
- ui/src/components/AIPrompt/RiskAnalysisPanel.tsx — risk display
- ui/src/components/AIPrompt/RiskCard.tsx — individual risk
- ui/src/hooks/useLLM.ts
- ui/src/lib/api/analysis.ts

## Technical Design

### Proposal Flow
```
/projects/new:
  1. ProjectForm: name, deadline, budget (optional)
  2. ProposalTextarea: multi-line text input
  3. "Analyze with AI" button → loading spinner
  4. TaskGenerationReview appears below
  5. User accepts/edits/removes tasks
  6. "Create Project" → POST /projects + POST /scenarios + POST tasks/bulk
```

### Risk Panel
```tsx
// Triggered by "Analyze Risks" button in TopBar
// Shows list of RiskCard components
// Each card: severity badge, description, probability/impact matrix, mitigation text
```

## Acceptance Criteria
- [ ] Proposal input → "Analyze" → task list preview appears
- [ ] Each generated task: accept (default) / edit (inline) / remove
- [ ] Risk analysis → panel shows risks with severity colors
- [ ] Loading state shown during LLM calls (skeleton + spinner)
- [ ] Error state shown when LLM unavailable
- [ ] pnpm test:unit:run passes
