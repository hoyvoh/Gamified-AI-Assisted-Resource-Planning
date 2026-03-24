# States Visual Spec

## Goal

Chuẩn hóa loading, error, empty, validation states để Figma MCP dựng đủ state frames và FE có reference nhất quán khi code.

## Shared State Components

### Skeleton Block

- Fill: `rgba(255,255,255,0.06)`
- Highlight shimmer: ngang, `1200ms linear infinite`
- Radius follows host component

### Spinner

- Style: ring spinner hoặc rotating segmented glyph
- Size:
  - small: `16`
  - default: `20`
  - large: `28`
- Motion: `2000ms linear infinite`

### Error Banner

- Background: `rgba(239,68,68,0.12)`
- Border: `1px solid rgba(239,68,68,0.35)`
- Icon left, copy center, dismiss action right
- Radius: `8`

### Empty State Block

- Small illustration or icon
- Title
- Supporting text
- One primary or secondary CTA

## Landing States

### Loading

- Org selector panel shows 3 skeleton org cards
- CTA disabled until org data loads

### Error

- Inline error banner in selector panel
- Copy:
  - title: `Unable to load organizations`
  - body: `Please retry or continue with demo data.`

## Create Project Wizard States

### Step 1 Validation

- Input error:
  - border changes to danger
  - helper text below field
  - icon optional on right
- Proposal field missing:
  - message: `Add a project proposal so AI can generate task suggestions.`

### Step 2 Loading

- Center state in task region
- Spinner large + text:
  - `Analyzing with AI...`
  - subcopy: `Generating task breakdown, effort estimates, and initial project risk.`

### Step 2 Error

- Error banner above task list
- Recovery actions:
  - `Retry analysis`
  - `Continue with manual setup`

### Step 2 Empty

- If no tasks generated:
  - title: `No tasks generated yet`
  - body: `Refine the proposal or add tasks manually.`

## Strategic Board States

### Board Loading

- Board canvas shows dimmed terrain placeholder
- Camp markers replaced with soft skeleton blocks
- Sidebar shows 4 personnel skeleton cards

### Empty Board

- Center overlay card on board shell
- Title: `No tasks on the board`
- Body: `Generate tasks with AI or add the first task manually.`
- CTA:
  - `Generate tasks`
  - secondary `Add task`

### AI Panel Loading

- Response area shows spinner + 2 skeleton response cards

### Warning Empty

- Warning bar collapsed state label:
  - `No active warnings`

### Drawer Loading

- Header and first 3 sections skeletonized

## Figma MCP Output Frames

- `State/landing/loading`
- `State/landing/error`
- `State/create/step1-validation`
- `State/create/step2-loading`
- `State/create/step2-error`
- `State/board/loading`
- `State/board/empty`
- `State/board/ai-loading`

## Acceptance Criteria

- Mỗi state có visual treatment nhất quán với dark theme
- Loading state không làm layout nhảy mạnh
- Error state luôn có action recovery rõ ràng
- Empty state luôn chỉ ra next step

