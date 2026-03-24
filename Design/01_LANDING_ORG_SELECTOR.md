# Screen Spec 01 - Landing / Org Selector

## Screen Summary

- Route: `/`
- File target: `app/page.tsx`
- Goal: tạo ấn tượng đầu tiên, giải thích value proposition rất nhanh, cho user chọn org và đi vào luồng demo
- Primary user: Project Manager
- Tone: epic, cinematic, strategic

## Figma Frame Setup

- Page: `MVP Screens`
- Main frame name: `Screen/landing-org-selector/desktop`
- Desktop size: `1440 x 1024`
- Layout: 12 columns, margin 80, gutter 24

## Layout Regions

### Region A - Hero Background

- Full-screen backdrop
- Desert gradient sky, sand dune layers, fortress silhouette ở xa
- Có thể dùng 3-5 layer shape/vector chồng nhau
- Không cần quá nhiều chi tiết nhỏ; ưu tiên silhouette lớn, tương phản tốt

### Region B - Header Strip

- Positioned near top
- Gồm:
  - wordmark/logo
  - small environment chip: `Competition Demo`
  - optional text link: `Powered by AI + COCOMO II`

### Region C - Hero Content

- Nằm lệch trái hoặc giữa-trái
- Gồm:
  - eyebrow: `Strategic Resource Planning`
  - H1: `Desert Empire Resource Planning`
  - supporting copy 2-3 dòng
  - CTA group

### Region D - Org Selector Panel

- Card/panel nổi phía dưới hero content hoặc bên phải
- Chứa danh sách 3 org card
- Một org được pre-selected
- Có nút `Get Started`

## Content Spec

### Hero Copy

- Eyebrow: `Strategic Resource Planning`
- Title: `Plan people like a battlefield.`
- Subtitle: `Estimate effort, assign the right specialists, and watch project completion probability update in real time.`

### Org Options

- `Acme Corp`
  - subtitle: `E-commerce modernization`
  - health badge: `P(on_time) 87%`
  - state: selected
- `Nova Bank`
  - subtitle: `Core platform delivery`
  - health badge: `P(on_time) 72%`
- `Atlas Health`
  - subtitle: `Clinical operations tooling`
  - health badge: `P(on_time) 64%`

### Primary CTA

- Label: `Get Started`
- Result: navigate to `/create`

## Component Tree

- `LandingPageShell`
- `HeroBackground`
- `TopBrandBar`
- `HeroCopyBlock`
- `OrgSelectorPanel`
- `OrgCard` x3
- `PrimaryButton`
- `SecondaryGhostLink` optional

## Component Details

### `OrgCard`

- Fields:
  - org logo placeholder
  - org name
  - org subtitle
  - health badge
  - selected state ring
- Variants:
  - `selected=true|false`
  - `health=good|warning|risk`

### `HeroCopyBlock`

- Contains:
  - eyebrow
  - title
  - subtitle
  - CTA row
- Width target: 520-620 px

## States

- Default: `Acme Corp` selected
- Hover org card: stronger border + surface lift
- CTA hover: amber glow
- Optional loading state:
  - skeleton for org list
- Error state:
  - inline banner in selector panel if org fetch fails

### Visual State Details

- Skeleton org card:
  - height `88-96 px`
  - left circular logo placeholder
  - two text bars
  - right badge placeholder
- Error banner:
  - sits at top of org selector panel
  - includes retry action

## Accessibility Notes

- Tab order:
  - logo
  - org card 1
  - org card 2
  - org card 3
  - `Get Started`
- Org card label pattern:
  - `aria-label="Select organization Acme Corp, 87 percent probability, on track"`
- CTA supports `Enter` and `Space`

## Responsive Notes

- Tablet:
  - org selector moves below hero copy
- Mobile:
  - org cards stack one per row
  - CTA stretches full width

## Interaction Notes

- Click org card updates selected state only, không navigate ngay
- Click `Get Started` moves to `/create`
- Keyboard focus ring should be obvious on org card và CTA

## Figma MCP Notes

- Tách `OrgCard` thành component reusable
- Tách `StatusBadge` cho P(on_time)
- Background nên là composition của vector/shape đơn giản để MCP dễ sinh và dễ chỉnh
- Không embed quá nhiều text trong background illustration

## Acceptance Criteria

- User hiểu ngay đây là tool lập kế hoạch nhân sự có AI hỗ trợ
- Có cảm giác premium và khác biệt so với dashboard enterprise thông thường
- Org selection nhìn rõ là bước đầu của flow demo
- Thiết kế đủ rõ để tái dùng `OrgCard`, `PrimaryButton`, `StatusBadge`
