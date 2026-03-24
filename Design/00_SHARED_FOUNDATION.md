# Shared Foundation for Figma MCP

## Mục tiêu

File này là nền tảng chung để mọi screen spec trong thư mục `Design/` dùng cùng một ngôn ngữ thiết kế, cùng cấu trúc component, và cùng quy ước đặt tên khi generate bằng Figma MCP.

## Product Summary

- Product: Gamified AI-Assisted Resource Planning
- Theme: Desert Empire
- Core value: PM và Tech Lead lập kế hoạch phân bổ nhân sự theo thời gian thực, thấy ngay xác suất hoàn thành đúng hạn và nhận gợi ý từ AI
- MVP scope: 3 màn hình
  - Landing / Org Selector
  - Create Project Wizard
  - Strategic Board

## User Roles in MVP

- Project Manager: tạo project, nhập proposal, review task estimate, launch project
- Tech Lead: review task breakdown, chỉnh effort, tối ưu assignment trên board

## Domain Terms

- WFU: 1 ngày làm việc = 7h
- WFU Mode: `standard`, `fast`, `quality`
- P(on_time): xác suất hoàn thành đúng hạn
- EAC: ngày dự kiến hoàn thành
- Scenario: một phương án phân bổ
- Camp: task trên board 3D
- Unit: nhân sự trên board 3D
- Fortress: deadline marker trên chân trời

## Visual Direction

- Cảm giác tổng thể: chiến lược, điện ảnh, sa mạc, cao cấp, không quá game-like trẻ con
- Visual contrast: nền tối, điểm nhấn sand/amber, trạng thái success/warning/error rõ ràng
- Shape language: panel dày, card bo vừa phải, badge dạng pill, divider mảnh
- Information density: cao vừa phải, ưu tiên quyết định nhanh trong meeting

## Design Tokens

### Colors

- `dusk`: `#1E1B2E`
- `sand`: `#C2956C`
- `stone`: `#4A3728`
- `amber`: `#F59E0B`
- `oasis`: `#10B981`
- `danger`: `#EF4444`
- `surface-1`: `#241F36`
- `surface-2`: `#2F2943`
- `border-soft`: `rgba(255,255,255,0.08)`
- `text-primary`: `#F6F1E8`
- `text-secondary`: `#CBBDAA`

### Typography

- Heading: Cinzel
- Body: Inter
- Data/Mono: JetBrains Mono

### Radius

- Card: 8
- Input: 4
- Pill: 999

### Spacing

- Base unit: 4
- Recommended spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 40 / 48

### Effects

- `glow-amber`: outer glow mềm cho CTA, badge quan trọng, fortress warning
- `shadow-panel`: shadow sâu nhưng blur rộng, dùng cho drawer / modal
- `pulse-slow`: 3s
- `float-soft`: translateY nhẹ cho hero hoặc object emphasis

## Motion and Timing

### Timing and Easing Guide

| Element | Event | Duration | Easing | Notes |
| --- | --- | --- | --- | --- |
| Button | hover | 100ms | `ease-out` | Color, border, shadow only |
| Card | hover | 150ms | `ease-out` | Surface lift + border emphasis |
| Drawer | open/close | 300ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Slide from right |
| Modal | open | 200ms | `ease-out` | Fade + scale from 0.98 |
| Modal backdrop | fade | 200ms | `ease-out` | Opacity only |
| Badge value | update | 150ms | `ease-in-out` | Fade or number swap |
| Glow pulse | loop | 3000ms | `ease-in-out` | Infinite |
| Selected task glow | activate | 200ms | `ease-out` | Border + glow fade in |
| Warning bar expand | toggle | 220ms | `ease-out` | Height + opacity |
| Tooltip | reveal | 120ms | `ease-out` | Opacity + 2px translate |

### Motion Guardrails

- Không dùng spring/bounce quá mạnh cho enterprise planning UI
- Drag and drop trên board nên snap sạch, không nảy quá mức
- Nếu `prefers-reduced-motion` bật:
  - tắt pulse loop
  - chuyển slide/fade về 0-100ms
  - bỏ floating decorative motion

## Grid and Breakpoints

- Desktop target: 1440 x 1024
- Laptop minimum: 1280 x 800
- Tablet handling: chỉ cần graceful collapse, chưa phải MVP-first
- Grid suggestion:
  - Landing: 12 columns
  - Create: 12 columns
  - Board: custom 3-region layout

### Responsive Policy

- Primary design target: desktop and laptop demo setup
- Tablet breakpoint: `1024px`
- Mobile breakpoint: `768px`
- Touch target minimum: `44 x 44 px`
- Typography may scale down 1 step on tablet and 2 steps on mobile
- Board screen on mobile is fallback-first, not full parity

## Figma MCP Authoring Rules

### Page Structure

- Tạo 1 page tên `MVP Screens`
- Tạo 1 page tên `MVP Components`
- Tạo 1 page tên `Foundations`

### Frame Naming

- Screen frame: `Screen/{screen-name}/{breakpoint}`
- Section frame: `Section/{screen-name}/{section-name}`
- Overlay frame: `Overlay/{name}`
- Component instance: `Component/{name}`
- Variant set: `Component/{name}/Variants`

### Auto Layout Rules

- Ưu tiên auto layout cho toàn bộ panel, toolbar, card, drawer, modal
- Chỉ dùng absolute positioning cho:
  - background hero illustration
  - decorative glow
  - 3D board placeholder annotations
- Tránh group lồng nhau nếu frame auto layout đủ dùng

### Componentization Rules

- Extract component khi lặp lại từ 2 lần trở lên
- Mọi badge trạng thái phải dùng chung variant set
- Mọi button phải dùng chung variant set
- Drawer và modal dùng cùng nền, border, shadow token
- Card dùng chung shell rồi inject nội dung

### Variant Strategy

- Button: `type=primary|secondary|ghost`, `state=default|hover|disabled`
- Badge: `tone=success|warning|danger|neutral|sand`
- Input: `state=default|focus|error|disabled`
- Task card: `status=draft|todo|in_progress|done`, `selected=true|false`
- Personnel card: `availability=free|partial|overloaded`, `selected=true|false`

### Constraints for MCP Generation

- Ưu tiên mô tả hierarchy rõ ràng hơn mô tả mỹ thuật mơ hồ
- Mỗi screen spec cần có:
  - Frame tree
  - Component inventory
  - States
  - Content examples
  - Notes cho reusable component
- Với board 3D, Figma chỉ mô phỏng shell UI và board placeholder states, không cố render Three.js thật

## Shared Component Inventory

- `TopBar`
- `PrimaryButton`
- `SecondaryButton`
- `StatusBadge`
- `ProgressStepper`
- `TextInput`
- `Textarea`
- `SelectField`
- `TaskCard`
- `PersonnelCard`
- `PanelShell`
- `DrawerShell`
- `ModalShell`
- `MetricBadge`
- `WarningChip`

## Accessibility and UX Rules

- Contrast ưu tiên mức AA
- Text nhỏ nhất nên từ 12px cho label phụ, 14px cho body chính
- Mọi trạng thái chỉ báo màu cần có icon hoặc text phụ
- Action quan trọng luôn có label rõ, tránh icon-only nếu không cần

### Focus Ring

- Style: `2px solid`
- Color: `sand`
- Offset: `2px`
- Apply to:
  - buttons
  - inputs
  - links
  - selectable cards
  - tabs
  - chips acting as buttons

### Keyboard Interaction Baseline

- `Tab` / `Shift+Tab`: move through interactive controls
- `Enter` / `Space`: activate focused button, card, tab, chip
- `Esc`: close open drawer, modal, or panel
- Do not trap keyboard focus outside active modal or drawer when overlay is open

### Screen Reader and ARIA Guidance

- Status badge format:
  - `aria-label="87 percent probability, on track"`
- Capacity bar format:
  - `aria-label="Duc Vo at 97 percent capacity"`
- Warning chip format:
  - `aria-label="Critical warning: Duc Vo overloaded"`
- Spinner format:
  - `aria-label="Analyzing project"`
- Modal baseline:
  - `role="dialog"`
  - `aria-labelledby` points to modal title
  - `aria-describedby` points to summary text if present

### Theme Scope

- MVP uses dark theme only
- Light theme and theme toggle are phase 5+ considerations

## Figma to Code Handoff

### Token Export Pattern

- CSS variables:
  - `--color-dusk`
  - `--color-sand`
  - `--color-stone`
  - `--color-amber`
  - `--color-oasis`
  - `--color-danger`
- Typography tokens:
  - `--font-heading`
  - `--font-body`
  - `--font-mono`

### Component Mapping Examples

- `Component/PrimaryButton` -> React `PrimaryButton`
- `Component/StatusBadge` -> React `StatusBadge`
- `Component/TaskCard` -> React `TaskCard`
- `Component/PersonnelCard` -> React `PersonnelCard`
- `Component/DrawerShell` -> React `DrawerShell`
- `Component/ModalShell` -> React `ModalShell`

### Suggested Deliverables from Figma

- Component set names match React export names where possible
- Variant property names should match prop names where possible
- Keep all stateful overlays as separate frames for implementation reference

## Output Checklist for Every Screen Spec

- Có route và mục tiêu màn hình
- Có layout desktop rõ bằng vùng
- Có danh sách component render trên màn hình
- Có trạng thái chính, empty/loading/error nếu cần
- Có sample content để Figma MCP generate text thực tế
- Có danh sách component nên extract sang page `MVP Components`
