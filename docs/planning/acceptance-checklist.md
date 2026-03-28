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

## C. Scenario Lifecycle

| # | Check | Pass? | Verified by | Date |
|---|-------|-------|-------------|------|
| C1 | Tạo project với proposal text | ⬜ | | |
| C2 | Tạo scenario với tên + type (planning / contingency / what_if) | ⬜ | | |
| C3 | Switch giữa các draft scenarios → board re-renders đúng | ⬜ | | |
| C4 | Fork scenario → bản copy có đúng tasks + assignments | ⬜ | | |
| C5 | Compare 2 scenarios side-by-side → makespan / cost / P(on_time) hiển thị | ⬜ | | |
| C6 | Launch Project: scenario.status → active, project.started_at được set | ⬜ | | |
| C7 | Chỉ 1 scenario active tại 1 thời điểm — activate scenario mới → cũ thành archived | ⬜ | | |
| C8 | Archived scenario read-only (UI disables edit, API 403 on write) | ⬜ | | |

---

## D. Project Analysis — Pillar 1

| # | Check | Pass? | Verified by | Date |
|---|-------|-------|-------------|------|
| D1 | Nhập project proposal → 10-axis radar render, AI Assist available per axis | ⬜ | | |
| D2 | Score all axes → composite tính đúng → Verdict badge hiển thị | ⬜ | | |
| D3 | Axis ≤ 2 → Risk Register auto-populated | ⬜ | | |
| D4 | Verdict = Do Not Proceed → Mode 3 vẫn locked | ⬜ | | |
| D5 | Verdict = Proceed/Conditional → Mode 3 unlocked | ⬜ | | |

---

## E. HR Analysis — Pillar 2

| # | Check | Pass? | Verified by | Date |
|---|-------|-------|-------------|------|
| E1 | Sync Profiles: GitHub + Slack data được ingested cho ≥1 developer | ⬜ | | |
| E2 | Developer profile drawer hiển thị 5 layers với scores | ⬜ | | |
| E3 | Team match engine trả top 3 team configurations | ⬜ | | |
| E4 | Select team config → Mode 3 pre-populated với selected developers | ⬜ | | |
| E5 | Low-confidence axes hiển thị `~` prefix + amber color | ⬜ | | |

---

## F. AI Task Generation

| # | Check | Pass? | Verified by | Date |
|---|-------|-------|-------------|------|
| F1 | Nhập project proposal → LLM generate tasks với category, techstack, effort | ⬜ | | |
| F2 | Review generated tasks: accept all / edit / reject individual tasks | ⬜ | | |
| F3 | LLM unavailable → clear error message, app không crash | ⬜ | | |
| F4 | LLM session được lưu vào DB | ⬜ | | |

---

## G. Planning Board (Kanban)

| # | Check | Pass? | Verified by | Date |
|---|-------|-------|-------------|------|
| G1 | Board render task cards với effort badge, techstack tags, status, P(on_time) | ⬜ | | |
| G2 | Developer cards ở left panel với availability bar + skill match % | ⬜ | | |
| G3 | Kéo developer card → thả vào task card → AllocationModal mở (%, mode) | ⬜ | | |
| G4 | Click task card → expand với effort breakdown, deps, warnings | ⬜ | | |
| G5 | 50 task cards + 20 developer cards → không lag khi scroll/drag | ⬜ | | |
| G6 | Keyboard fallback: Tab → Space select → Enter assign hoạt động | ⬜ | | |
| G7 | Task split via AI prompt → subtasks xuất hiện trên board | ⬜ | | |

---

## H. Resource Assignment

| # | Check | Pass? | Verified by | Date |
|---|-------|-------|-------------|------|
| H1 | Assign person A vào task T với 50% → effective WFU tính đúng | ⬜ | | |
| H2 | 1 nhân sự có thể assign vào nhiều tasks với tổng ≤ 100% WFU/ngày | ⬜ | | |
| H3 | WFU mode: standard / fast / quality → tính toán khác nhau | ⬜ | | |
| H4 | fast/quality mode disabled nếu không có skill match | ⬜ | | |
| H5 | Remove assignment → task dates recalculate | ⬜ | | |

---

## I. Warning System

| # | Check | Pass? | Verified by | Date |
|---|-------|-------|-------------|------|
| I1 | Assign người >7h/ngày → CAPACITY warning 🔴 xuất hiện | ⬜ | | |
| I2 | Junior alone trên critical task → JUNIOR_ALONE warning 🔴 | ⬜ | | |
| I3 | Phân bổ vượt budget → BUDGET warning 🟠 | ⬜ | | |
| I4 | Schedule không kịp deadline → TIME_RISK warning 🟠 | ⬜ | | |
| I5 | Acknowledge warning → warning dimmed | ⬜ | | |
| I6 | Warning bar accessible (aria-live) | ⬜ | | |

---

## J. Optimization

| # | Check | Pass? | Verified by | Date |
|---|-------|-------|-------------|------|
| J1 | "Optimize — Makespan" → trả ≥ 1 solution trong <60s | ⬜ | | |
| J2 | "Optimize — Budget" → trả ≥ 1 solution | ⬜ | | |
| J3 | Accept solution → assignments cập nhật trên board | ⬜ | | |
| J4 | Optimized solution không vi phạm capacity/junior constraints | ⬜ | | |

---

## K. Views

| # | Check | Pass? | Verified by | Date |
|---|-------|-------|-------------|------|
| K1 | Gantt: Planned bars render đúng theo task dates | ⬜ | | |
| K2 | Gantt: Baseline bars visible (grey) sau khi project launched | ⬜ | | |
| K3 | Gantt: Actual bars overlay planned bars từ ProgressLogs | ⬜ | | |
| K4 | Gantt: Scenario switch markers hiển thị đúng ngày + trigger reason | ⬜ | | |
| K5 | Gantt: Filter by person → chỉ hiện tasks của người đó | ⬜ | | |
| K6 | Gantt: Drag task bar → deadline thay đổi + warning triggered | ⬜ | | |
| K7 | Dependency graph: tất cả tasks và arrows đúng, critical path highlighted | ⬜ | | |
| K8 | Calendar view: tasks hiển thị đúng ngày | ⬜ | | |

---

## L. Execution Mode

| # | Check | Pass? | Verified by | Date |
|---|-------|-------|-------------|------|
| L1 | Launch project → Mode 4 unlocked, team members nhận notification | ⬜ | | |
| L2 | Member nhập daily progress → Gantt actual bar cập nhật | ⬜ | | |
| L3 | SPI / CPI / EAC tính đúng sau mỗi progress update | ⬜ | | |
| L4 | P(on_time) cập nhật hàng ngày, threshold warnings trigger đúng | ⬜ | | |
| L5 | P(on_time) < 40% trong 3 ngày → ScenarioSwitchBanner xuất hiện | ⬜ | | |
| L6 | Switch plan mid-execution → old scenario archived với trigger reason | ⬜ | | |
| L7 | Sau switch plan: ProgressLogs của tasks không bị mất | ⬜ | | |
| L8 | Thêm người mid-execution → task >50% done → Brooks' Law warning | ⬜ | | |

---

## M. XP & Gamification

| # | Check | Pass? | Verified by | Date |
|---|-------|-------|-------------|------|
| M1 | Finalize project → XP events được tạo cho tất cả members | ⬜ | | |
| M2 | On-time completion → base XP; Early → bonus XP | ⬜ | | |
| M3 | New skill used → skill XP + level up nếu đủ threshold | ⬜ | | |
| M4 | Personnel profile hiển thị skill levels mới sau project | ⬜ | | |

---

## N. Non-Functional

| # | Check | Pass? | Verified by | Date |
|---|-------|-------|-------------|------|
| N1 | Org A không thể thấy data của Org B (multi-tenant isolation) | ⬜ | | |
| N2 | All API endpoints require auth (no unauthorized access) | ⬜ | | |
| N3 | Tất cả inputs validated — không có SQL injection hoặc XSS vector | ⬜ | | |
| N4 | API error responses có structure nhất quán | ⬜ | | |
| N5 | `pnpm lint:ci` → 0 errors | ⬜ | | |
| N6 | `uv run mypy app` → 0 errors | ⬜ | | |

---

## Summary

| Section | Total | Pass | Fail | Skip |
|---------|-------|------|------|------|
| A. Foundation | 5 | 0 | 0 | 0 |
| B. Personnel | 4 | 0 | 0 | 0 |
| C. Scenario Lifecycle | 8 | 0 | 0 | 0 |
| D. Project Analysis (Pillar 1) | 5 | 0 | 0 | 0 |
| E. HR Analysis (Pillar 2) | 5 | 0 | 0 | 0 |
| F. AI Task Generation | 4 | 0 | 0 | 0 |
| G. Planning Board | 7 | 0 | 0 | 0 |
| H. Assignment | 5 | 0 | 0 | 0 |
| I. Warnings | 6 | 0 | 0 | 0 |
| J. Optimization | 4 | 0 | 0 | 0 |
| K. Views | 8 | 0 | 0 | 0 |
| L. Execution Mode | 8 | 0 | 0 | 0 |
| M. XP | 4 | 0 | 0 | 0 |
| N. Non-Functional | 6 | 0 | 0 | 0 |
| **Total** | **79** | **0** | **0** | **0** |

**Nghiệm thu PASS khi: tất cả 79 items = ✅, 0 Fail.**
