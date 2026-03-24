# Screen Spec 02 - Create Project Wizard

## Screen Summary

- Route: `/create`
- File target: `app/create/page.tsx`
- Goal: cho PM nhập context dự án, gửi proposal vào AI, review effort/task breakdown, rồi launch project
- Primary users: Project Manager, Tech Lead
- Tone: professional, guided, high-confidence

## Figma Frame Setup

- Page: `MVP Screens`
- Main frame name: `Screen/create-project-wizard/desktop`
- Desktop size: `1440 x 1024`
- Layout: 12 columns, margin 64, gutter 24

## Screen Structure

- Header bar
- Stepper row
- Main wizard content
- Sticky footer action bar

## Step Definitions

### Step 1 - Project Intake

#### Goal

Thu thập dữ liệu để AI và COCOMO sinh task breakdown.

#### Layout

- Left 7 columns: form
- Right 5 columns: guidance panel / tips / example proposal

#### Fields

- Project name
- Deadline
- Budget
- Team size assumption
- Tech stack chips or multi-select
- Proposal textarea

#### Sample Content

- Project name: `E-Commerce Platform v2`
- Deadline: `2026-06-30`
- Budget: `$52,000`
- Team size: `4`
- Tech stack: `Next.js`, `Node.js`, `PostgreSQL`, `Stripe`
- Proposal:
  `Build the second version of our e-commerce platform with a new storefront, catalog management, checkout integration with Stripe, role-based admin tooling, and analytics dashboards. The team will consist of one PM, one frontend engineer, one backend engineer, and one full-stack senior engineer.`

#### Side Guidance Panel

- Label: `What AI reads`
- Bullet-style helper copy:
  - project scope
  - technical requirements
  - constraints
  - target team shape
- Small callout: `Better input creates better task suggestions.`

### Step 2 - AI + COCOMO Review

#### Goal

Review generated estimate và chỉnh task breakdown trước khi launch.

#### Layout

- Left 4 columns: COCOMO summary panel
- Right 8 columns: editable task list

#### Left Summary Panel

- Total estimated effort
- Projected duration
- Cost estimate
- Risk notes
- AI explanation summary

#### Right Task List

- Table-like card stack hoặc dense editable cards
- Mỗi task có:
  - task name
  - category
  - 6 effort inputs: `Inv`, `Des`, `Imp`, `Test`, `Rev`, `Rel`
  - total effort
  - owner suggestion
  - warning tag if needed

#### Sample Tasks

- `Catalog UI`
- `Catalog API`
- `Stripe Integration`
- `Admin Dashboard`
- `Analytics Tracking`

### Step 3 - Confirm and Launch

#### Goal

Chốt project setup, tóm tắt assumption, confirm điều hướng sang board.

#### Layout

- Centered summary card cluster
- One dominant CTA

#### Summary Blocks

- Project basics
- Estimated totals
- Generated task count
- Team assumptions
- Risks to monitor from day 1

## Component Tree

- `CreateProjectWizard`
- `TopBarSimple`
- `ProgressStepper`
- `ProjectIntakeForm`
- `ProjectGuidancePanel`
- `CocomoSummaryPanel`
- `EditableTaskList`
- `TaskEstimateRow`
- `SummaryReviewCard`
- `FooterActionBar`

## Component Details

### `ProgressStepper`

- Steps:
  - `1 Project Intake`
  - `2 AI Review`
  - `3 Launch`
- Variants:
  - `state=past|current|future`

### `TaskEstimateRow`

- Dense card or row
- Fields:
  - task name
  - task type badge
  - 6 numeric inputs
  - computed total pill
  - optional warning chip
- Variants:
  - `state=default|editing|warning`

### `CocomoSummaryPanel`

- Uses metric cards
- Key metrics:
  - `Estimated Effort`
  - `Projected Duration`
  - `Budget Fit`
  - `Initial P(on_time)`

## States

- Step 1 default
- Step 1 validating
- Step 2 loading after `Analyze with AI`
- Step 2 loaded with editable tasks
- Step 2 error if AI analysis fails
- Step 3 confirmation ready

### Visual State Details

- Step 1 validation:
  - invalid input uses danger border and helper text below field
- Step 2 loading:
  - large spinner in task region
  - copy `Analyzing with AI...`
- Step 2 error:
  - error banner above task list
  - actions `Retry analysis` and `Continue manually`
- Step 2 empty:
  - empty state card in task list region

## Accessibility Notes

- Step 1 tab order:
  - project name
  - deadline
  - budget
  - team size
  - tech stack
  - proposal
  - `Analyze with AI`
- Required fields must be visually marked and announced to screen readers
- Spinner label:
  - `aria-label="Analyzing project"`

## Responsive Notes

- Tablet:
  - step 1 form and guidance stack vertically
  - step 2 summary panel moves above task list
- Mobile:
  - stepper becomes compact
  - task rows become card stack
  - footer action bar becomes sticky bottom bar

## Interaction Notes

- `Analyze with AI` is the main action in step 1
- After analysis success, auto-advance to step 2
- User can edit task effort inline
- `Launch Project` navigates to `/board`
- Stepper allows back navigation nhưng không cho skip thiếu dữ liệu

## Figma MCP Notes

- Tạo separate section cho cả 3 step trong cùng screen file để dễ compare
- Extract `ProgressStepper`, `TaskEstimateRow`, `MetricBadge`, `FooterActionBar`
- Dùng real text và sample numeric values, không để lorem ipsum
- Ở step 2 nên thiết kế theo auto layout dọc để MCP dễ sinh danh sách task
- Tạo thêm frame state cho:
  - `step1-validation`
  - `step2-loading`
  - `step2-error`

## Acceptance Criteria

- Step 1 làm rõ AI cần proposal text
- Step 2 cho cảm giác AI output có thể kiểm soát và chỉnh sửa được
- Step 3 ngắn gọn, tự tin, sẵn sàng sang board
- Các component chính có thể tách sang component page mà không phải chỉnh nhiều
