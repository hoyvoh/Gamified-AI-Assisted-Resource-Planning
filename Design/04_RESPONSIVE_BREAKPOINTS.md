# Responsive Breakpoints Spec

## Goal

File này mô tả cách 3 màn hình degrade từ desktop xuống tablet và mobile, đủ rõ để Figma MCP tạo thêm breakpoint frames và đủ rõ để FE không phải tự đoán layout collapse.

## Breakpoints

- Desktop: `>= 1280`
- Tablet: `1024`
- Mobile: `<= 768`

## Shared Responsive Rules

- Minimum touch target: `44 x 44 px`
- Horizontal padding:
  - desktop: `64-80`
  - tablet: `32-40`
  - mobile: `16-20`
- Typography downscale:
  - tablet: giảm 1 step
  - mobile: giảm 2 steps với H1/H2
- Drawer trên mobile ưu tiên full-screen sheet
- Modal trên mobile ưu tiên bottom sheet nếu nội dung dài

## Screen 01 - Landing / Org Selector

### Tablet 1024

- Hero vẫn full-height nhưng content stack chặt hơn
- Header strip giữ dạng hàng ngang
- Org selector panel chuyển xuống dưới hero copy
- Org cards hiển thị 2 cột hoặc 1 cột tùy chiều cao frame

### Mobile 768

- Header rút gọn còn logo + small chip
- Hero copy full width
- Org selector panel nằm dưới hero copy, 1 cột
- CTA full width
- Background illustration giảm độ chi tiết

## Screen 02 - Create Project Wizard

### Tablet 1024

- Step 1:
  - form và guidance panel stack dọc
- Step 2:
  - COCOMO summary chuyển lên trên
  - editable task list xuống dưới
- Sticky footer vẫn giữ nhưng giảm chiều cao

### Mobile 768

- Stepper giữ dạng compact 3 nodes
- Form fields full width
- Guidance panel collapse thành accordion
- Step 2 task rows chuyển từ table-like sang card stack
- Footer action bar thành sticky bottom bar với 1 primary CTA + 1 secondary

## Screen 03 - Strategic Board

### Tablet 1024

- TopBar vẫn giữ 1 hàng nếu đủ chỗ; nếu không, tabs xuống hàng thứ 2
- Personnel sidebar collapse thành left drawer toggle
- Main content còn:
  - board shell ở trên
  - task panel ở dưới hoặc bên phải tùy chiều ngang
- Warning bar giữ ở cuối màn hình

### Mobile 768

- TopBar rút gọn: logo, P(on_time), menu
- Personnel list thành bottom sheet hoặc drawer
- Task panel thành overlay sheet
- Board shell chỉ còn simplified view:
  - selected task focus
  - camp markers giảm số lượng hiển thị
- Nếu board quá dày thông tin:
  - fallback sang task-first mode với board preview thumbnail

## Figma MCP Output Frames

- `Screen/landing-org-selector/tablet`
- `Screen/landing-org-selector/mobile`
- `Screen/create-project-wizard/tablet`
- `Screen/create-project-wizard/mobile`
- `Screen/strategic-board/tablet`
- `Screen/strategic-board/mobile`

## Acceptance Criteria

- Không có vùng tương tác nào nhỏ hơn `44 x 44 px`
- Người dùng tablet vẫn truy cập đầy đủ flow MVP
- Mobile có graceful fallback, đặc biệt với board screen
- Figma MCP có đủ chỉ dẫn để sinh thêm frame ở 2 breakpoint

