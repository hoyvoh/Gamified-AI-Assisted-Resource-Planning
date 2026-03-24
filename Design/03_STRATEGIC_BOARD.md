# Screen Spec 03 - Strategic Board

## Screen Summary

- Route: `/board`
- Alternate route option: `/org/[orgId]/projects/[projectId]/scenarios/[scenarioId]`
- File target: `app/board/page.tsx`
- Goal: màn hình lõi để phân bổ nhân sự, theo dõi P(on_time), thao tác với task/personnel và mở các overlay AI hỗ trợ
- Primary users: Project Manager, Tech Lead
- Tone: tactical, high-information, cinematic control room

## Figma Frame Setup

- Page: `MVP Screens`
- Main frame name: `Screen/strategic-board/desktop`
- Desktop size: `1440 x 1024`
- Layout model:
  - top bar fixed
  - 3-column main region
  - bottom warning strip

## Main Layout

### Region A - TopBar

- Height target: 72-80 px
- Contains:
  - brand
  - breadcrumb
  - scenario selector
  - `P(on_time)` badge
  - tabs
  - action cluster

### Region B - Personnel Sidebar

- Width: 280 px
- Scrollable column
- Contains:
  - search
  - filters
  - personnel card list

### Region C - Board Canvas Shell

- Flexible central area
- In Figma: represent as staged board placeholder, not real 3D render
- Contains:
  - desert board artwork
  - task camp markers
  - personnel unit markers
  - dependency path lines
  - horizon fortress

## Board Layer Structure

### Layer 1 - Sky

- Sunset gradient from `dusk` to deeper violet-brown
- Sparse stars only in upper area
- Fortress sits on horizon line, slightly right of center

### Layer 2 - Mid Horizon

- Fortress silhouette
- Soft atmospheric haze
- Fortress glow color maps to `P(on_time)` tone

### Layer 3 - Play Surface

- Sand plane with subtle gradient and 2-3 dune bands
- Idle personnel zone on far left, width target `120-140 px`
- Main task camp zone occupies center-right

### Layer 4 - Interaction Overlay

- Selection rings
- Dependency paths
- Hover labels
- Drop target emphasis

## Board Proportion Rules

- Camp width scales by effort bucket:
  - small task `3-5d`: `64 x 48`
  - medium task `6-10d`: `88 x 56`
  - large task `11-15d`: `112 x 64`
- Camp height remains visually restrained; width carries most scale difference
- Personnel unit marker stands offset `12-16 px` from assigned camp edge
- Dependency lines use `2 px` stroke with soft glow

## Fortress Glow Mapping

- `>= 80%`: oasis glow, blur `8`, low intensity
- `50-79%`: amber glow, blur `12`, medium intensity
- `< 50%`: danger glow, blur `16`, pulse every `2000ms`

## Dependency Line Rules

- Normal dependency: solid amber
- Risky dependency: danger dashed
- Completed chain: oasis solid
- Corner radius should feel smooth, around `12-16 px`

### Region D - Task Panel

- Width: 320 px
- Contains grouped task cards and quick actions

### Region E - Warning Bar

- Full width bottom strip
- Collapsible
- Severity grouped chips

## Overlays Within This Screen

- `TaskDetailDrawer`
- `PersonnelDetailDrawer`
- `AIPromptPanel`
- `TaskSplitModal`
- `TaskMergeModal`
- `CompletionProbabilityExpandedPanel`

## Board Content Model

### Sample TopBar Data

- Breadcrumb: `Acme Corp / E-Commerce Platform v2`
- Scenario selector: `Scenario A - Balanced Delivery`
- P(on_time): `87%`
- EAC delta: `8 days ahead`
- Tabs:
  - `Board`
  - `Tasks`
  - `Risks`

### Sample Personnel

- `Linh Nguyen` - Frontend - Mid - 68% load
- `Duc Vo` - Full-stack - Senior - 97% load
- `Minh Tran` - Backend - Mid - 74% load
- `An Pham` - QA - Junior - 52% load

### Sample Tasks

- `Catalog UI`
- `Catalog API`
- `Stripe Integration`
- `Admin Dashboard`
- `Analytics Tracking`

## Component Tree

- `StrategicBoardLayout`
- `TopBar`
- `CompletionProbabilityBadge`
- `PersonnelSidebar`
- `PersonnelCard`
- `BoardCanvasShell`
- `TaskCampMarker`
- `PersonnelUnitMarker`
- `TaskPanel`
- `TaskCard`
- `WarningBar`
- `TaskDetailDrawer`
- `PersonnelDetailDrawer`
- `AIPromptPanel`
- `TaskSplitModal`
- `TaskMergeModal`

## Component Details

### `TopBar`

- Left:
  - logo
  - breadcrumb
- Center:
  - scenario selector
  - tabs
- Right:
  - `CompletionProbabilityBadge`
  - `Ask AI`
  - `Optimize`
  - `Save Snapshot`

### `CompletionProbabilityBadge`

- Default content:
  - percentage
  - tone color
  - mini EAC delta
- Expanded content:
  - 14-day trend sparkline
  - risk factors
  - actions
- Variants:
  - `tone=success|warning|danger`
  - `expanded=true|false`

### `PersonnelCard`

- Fields:
  - avatar
  - name
  - role
  - seniority badge
  - WFU load bar
  - availability label
- Variants:
  - `availability=free|partial|overloaded`
  - `selected=true|false`

### `TaskCard`

- Fields:
  - task name
  - status
  - total effort
  - assigned avatars
  - warning indicator
- Variants:
  - `status=draft|todo|in_progress|done`
  - `selected=true|false`

### `TaskDetailDrawer`

- Sections:
  - task header
  - description
  - effort breakdown editor
  - tech stack chips
  - assignment list
  - dependency tree
  - footer actions
- Footer actions:
  - `Save Changes`
  - `Split Task`
  - `Merge With...`

### `PersonnelDetailDrawer`

- Sections:
  - profile header
  - XP summary
  - skill matrix
  - allocation chart
  - WFU load details

### `AIPromptPanel`

- Input row:
  - text input
  - send button
- Quick actions:
  - `Generate tasks`
  - `Analyze risks`
  - `Suggest optimization`
- Response zone:
  - structured cards or raw text block

### `TaskSplitModal`

- Header with selected task name
- Choice chips for `2`, `3`, `4`
- CTA `Ask AI to suggest`
- Preview list of subtasks
- P(on_time) before/after preview
- Footer actions `Cancel`, `Apply Split`

### `TaskMergeModal`

- Task selection list
- Merged preview summary
- Effort total and warning note
- Footer actions `Cancel`, `Apply Merge`

## States

- Board default loaded
- Drag target hover
- Task selected
- Personnel selected
- Warning bar collapsed
- Warning bar expanded
- P(on_time) expanded panel open
- Task drawer open
- Personnel drawer open
- AI panel open
- Split modal open
- Merge modal open
- Empty board fallback
- Board loading state

### Visual State Details

- Board loading:
  - dimmed terrain shell
  - 3-5 skeleton camps
  - sidebar personnel skeletons
- Empty board:
  - centered overlay card with CTA
- Drag target hover:
  - camp border brightens and ground glow appears
- Selected task:
  - glow + outline + task label emphasis

## Interaction Notes

- Dragging personnel onto task updates selected target state
- Clicking a task opens `TaskDetailDrawer`
- Clicking a personnel card opens `PersonnelDetailDrawer`
- Clicking `P(on_time)` opens expanded detail panel
- Clicking `Ask AI` toggles AI panel
- Warning chips are clickable and filter relevant issue context

## Accessibility Notes

- Tab order baseline:
  - top bar actions
  - personnel search
  - personnel cards
  - task cards
  - warning chips
- Board region itself should have one focusable container with summary label
- Example label:
  - `aria-label="Strategic board with 11 tasks and 4 personnel"`
- `Esc` closes active drawer, modal, or expanded panel

## Responsive Notes

- Tablet:
  - personnel sidebar becomes collapsible drawer
  - task panel may move below board shell
- Mobile:
  - board becomes simplified fallback view
  - personnel and task lists move into sheets or overlays

## Figma Representation Guidance

- Board shell chỉ cần giả lập góc nhìn 3D bằng layered shapes, depth shadow, path lines
- Tạo 1 frame riêng cho `board with selected task`
- Tạo 1 frame riêng cho `board with drawer open`
- Tạo 1 frame riêng cho `board with split modal open`
- Tạo thêm frame riêng cho:
  - `board loading`
  - `board empty`
  - `board tablet`
- Không cố biểu diễn physics hoặc drag animation thật trong Figma

## Figma MCP Notes

- Extract `PersonnelCard`, `TaskCard`, `CompletionProbabilityBadge`, `WarningChip`, `DrawerShell`, `ModalShell`
- `BoardCanvasShell` nên là component shell riêng, bên trong chứa marker instance
- Marker names:
  - `Component/TaskCampMarker`
  - `Component/PersonnelUnitMarker`
  - `Component/DependencyLine`
  - `Component/FortressMarker`

## Acceptance Criteria

- Người xem hiểu ngay đây là hero screen của sản phẩm
- P(on_time) là signal nổi bật nhất sau board canvas
- Sidebar, board, task panel có phân cấp rõ ràng, không tranh nhau sự chú ý
- Overlay flow đủ cụ thể để Figma MCP dựng luôn drawer và modal states
