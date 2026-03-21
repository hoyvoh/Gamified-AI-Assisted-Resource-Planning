# Acceptance Checklist — Final Project Verification

Dùng tài liệu này để nghiệm thu toàn bộ dự án trước khi close.
Agent/QA thực hiện từng item, tick khi pass, ghi tên người verify và ngày.

---

## A. Foundation & Infrastructure

| # | Check | Pass? | Verified by | Date |
|---|-------|-------|-------------|------|
| A1 | `uv run alembic upgrade head` không lỗi trên fresh DB | ⬜ | | |
| A2 | `uv run pytest` — tất cả tests pass | ⬜ | | |
| A3 | `pnpm build` trong `ui/` — không có error | ⬜ | | |
| A4 | CI pipeline green trên main branch | ⬜ | | |
| A5 | `.env` files không được commit vào git | ⬜ | | |

---

## B. Org & Personnel Management

| # | Check | Pass? | Verified by | Date |
|---|-------|-------|-------------|------|
| B1 | Tạo org → tạo nhân sự với skill matrix → xem được trong FE | ⬜ | | |
| B2 | WFU bar hiển thị đúng màu (green/yellow/red) theo tải | ⬜ | | |
| B3 | Click nhân sự → Drawer mở với skill matrix đúng | ⬜ | | |
| B4 | Filter/search nhân sự hoạt động | ⬜ | | |

---

## C. Project & Scenario Management

| # | Check | Pass? | Verified by | Date |
|---|-------|-------|-------------|------|
| C1 | Tạo project với proposal text | ⬜ | | |
| C2 | Tạo scenario → switch giữa scenarios | ⬜ | | |
| C3 | Snapshot scenario → không thể edit snapshot (UI disables, API 403) | ⬜ | | |
| C4 | Fork scenario từ snapshot | ⬜ | | |

---

## D. AI Task Generation

| # | Check | Pass? | Verified by | Date |
|---|-------|-------|-------------|------|
| D1 | Nhập project proposal → click Analyze → tasks generated | ⬜ | | |
| D2 | Tasks có đúng fields: category, techstack, effort breakdown | ⬜ | | |
| D3 | Review generated tasks: accept all / edit / reject | ⬜ | | |
| D4 | LLM unavailable → clear error message, app không crash | ⬜ | | |
| D5 | LLM session được lưu vào DB (`llm_sessions` table) | ⬜ | | |

---

## E. Strategic Board (Three.js)

| # | Check | Pass? | Verified by | Date |
|---|-------|-------|-------------|------|
| E1 | Board render tasks dưới dạng camps, nhân sự dưới dạng units | ⬜ | | |
| E2 | Camera orbit/zoom hoạt động (mouse drag + scroll) | ⬜ | | |
| E3 | Kéo nhân sự từ sidebar → thả vào camp → assignment tạo | ⬜ | | |
| E4 | Click camp → TaskDetailDrawer mở | ⬜ | | |
| E5 | 20 tasks + 10 personnel → framerate ổn định (không giật) | ⬜ | | |
| E6 | Fortress background hiển thị | ⬜ | | |

---

## F. Resource Assignment

| # | Check | Pass? | Verified by | Date |
|---|-------|-------|-------------|------|
| F1 | Assign person A vào task T với 50% → effective WFU tính đúng | ⬜ | | |
| F2 | 1 nhân sự có thể assign vào nhiều tasks với tổng ≤ 100% WFU/ngày | ⬜ | | |
| F3 | WFU mode: standard / fast / quality → tính toán khác nhau | ⬜ | | |
| F4 | Remove assignment → task dates recalculate | ⬜ | | |

---

## G. Warning System

| # | Check | Pass? | Verified by | Date |
|---|-------|-------|-------------|------|
| G1 | Assign người >7h/ngày → CAPACITY warning 🔴 xuất hiện | ⬜ | | |
| G2 | Junior alone trên critical task → JUNIOR_ALONE warning 🔴 | ⬜ | | |
| G3 | Phân bổ vượt budget → BUDGET warning 🟠 | ⬜ | | |
| G4 | Schedule không kịp deadline → TIME_RISK warning 🟠 | ⬜ | | |
| G5 | Acknowledge warning → warning dimmed | ⬜ | | |
| G6 | Warning bar `aria-live="polite"` — screen reader test | ⬜ | | |

---

## H. Optimization

| # | Check | Pass? | Verified by | Date |
|---|-------|-------|-------------|------|
| H1 | "Optimize — Makespan" → trả ≥ 1 solution trong <60s | ⬜ | | |
| H2 | "Optimize — Budget" → trả ≥ 1 solution | ⬜ | | |
| H3 | Accept solution → assignments cập nhật trên board | ⬜ | | |
| H4 | Optimized solution không vi phạm capacity/junior constraints | ⬜ | | |

---

## I. Views

| # | Check | Pass? | Verified by | Date |
|---|-------|-------|-------------|------|
| I1 | Gantt chart render đúng planned bars theo task dates | ⬜ | | |
| I2 | Gantt filter by person → chỉ hiện tasks của người đó | ⬜ | | |
| I3 | Dependency graph: tất cả tasks và arrows đúng | ⬜ | | |
| I4 | Critical path highlighted | ⬜ | | |
| I5 | Calendar view: tasks hiển thị đúng ngày | ⬜ | | |

---

## J. Progress Tracking

| # | Check | Pass? | Verified by | Date |
|---|-------|-------|-------------|------|
| J1 | Chuyển project sang Execution mode | ⬜ | | |
| J2 | Nhập daily progress → Gantt cập nhật actual vs planned | ⬜ | | |
| J3 | SPI/CPI/EAC hiển thị đúng | ⬜ | | |
| J4 | EAC > deadline → TIME_RISK warning tự động | ⬜ | | |

---

## K. XP & Gamification

| # | Check | Pass? | Verified by | Date |
|---|-------|-------|-------------|------|
| K1 | Finalize project → XP events được tạo cho tất cả members | ⬜ | | |
| K2 | On-time completion → base XP; Early → bonus XP | ⬜ | | |
| K3 | New skill used → skill XP + level up nếu đủ threshold | ⬜ | | |
| K4 | Personnel profile hiển thị skill levels mới sau project | ⬜ | | |

---

## L. Non-Functional

| # | Check | Pass? | Verified by | Date |
|---|-------|-------|-------------|------|
| L1 | Org A không thể thấy data của Org B (multi-tenant isolation) | ⬜ | | |
| L2 | All API endpoints require auth (no unauthorized access) | ⬜ | | |
| L3 | Tất cả inputs validated — không có SQL injection hoặc XSS vector | ⬜ | | |
| L4 | API error responses có structure nhất quán | ⬜ | | |
| L5 | `pnpm lint:ci` → 0 errors | ⬜ | | |
| L6 | `uv run mypy app` → 0 errors | ⬜ | | |

---

## Summary

| Section | Total | Pass | Fail | Skip |
|---------|-------|------|------|------|
| A. Foundation | 5 | 0 | 0 | 0 |
| B. Personnel | 4 | 0 | 0 | 0 |
| C. Scenarios | 4 | 0 | 0 | 0 |
| D. AI Tasks | 5 | 0 | 0 | 0 |
| E. Board | 6 | 0 | 0 | 0 |
| F. Assignment | 4 | 0 | 0 | 0 |
| G. Warnings | 6 | 0 | 0 | 0 |
| H. Optimization | 4 | 0 | 0 | 0 |
| I. Views | 5 | 0 | 0 | 0 |
| J. Progress | 4 | 0 | 0 | 0 |
| K. XP | 4 | 0 | 0 | 0 |
| L. Non-Functional | 6 | 0 | 0 | 0 |
| **Total** | **57** | **0** | **0** | **0** |

**Nghiệm thu PASS khi: tất cả 57 items = ✅, 0 Fail.**
