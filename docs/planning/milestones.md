# Milestones

## Timeline Overview

```
Mar 22 ──────── Mar 30 ──────── Apr 1 ──────── Apr 20 ──────── Apr 30 ──────── May 15 ──────── May 31
   │                │              │               │                │               │               │
   │                │              │               │                │               │               │
Phase 0+1       Phase 2        🏆 MVP          Phase 5         Phase 6          Phase 7        Phase 8
Foundation      Board          Launch          Views           Tracking           XP             QA
```

---

## M0 — Foundation Ready
**Target: 22/3/2026**

**Deliverables:**
- [ ] COCOMO II engine implemented + tested
- [ ] Database schema deployed (alembic migrations)
- [ ] Core CRUD APIs (org, personnel, project)
- [ ] Next.js app shell running, routes working
- [ ] CI pipeline green (cả FE + BE)

**Definition of Done:** `uv run pytest` pass, `pnpm build` pass, `alembic upgrade head` pass

---

## M1 — Core Planning Board
**Target: 30/3/2026**

**Deliverables:**
- [ ] Personnel sidebar + Task panel kết nối với BE
- [ ] Three.js board render tasks + personnel
- [ ] Drag & drop assignment hoạt động
- [ ] Warning bar hiển thị capacity/junior warnings
- [ ] Scenario snapshot + switch

**Definition of Done:** Demo được trong meeting: tạo scenario → assign người → thấy warnings

---

## M2 — MVP: AI-Powered Planning
**Target: 1/4/2026**

**Deliverables:**
- [ ] Nhập project proposal → LLM generate tasks
- [ ] Tasks tự động xuất hiện trên board
- [ ] Risk analysis endpoint hoạt động
- [ ] AI prompt interface đầy đủ
- [ ] Full E2E flow: Proposal → Board → Assign → Warnings → Risk Analysis

**Definition of Done:**
PM có thể ngồi trước màn hình, nhập đề bài dự án thực, nhận task list, phân người, thấy cảnh báo, prompt AI phân tích rủi ro — tất cả trong 1 session.

---

## M3 — Optimization & Full Views
**Target: 20/4/2026**

**Deliverables:**
- [ ] Genetic algorithm optimizer chạy được
- [ ] Optimization results UI với comparison
- [ ] Gantt chart đầy đủ (planned vs actual, filters)
- [ ] Dependency graph với critical path highlight
- [ ] Calendar view

**Definition of Done:** Cả 3 views render đúng từ scenario data. Optimizer đề xuất phân bổ tốt hơn baseline.

---

## M4 — Execution Mode & Progress Tracking
**Target: 30/4/2026**

**Deliverables:**
- [ ] Chuyển từ Planning sang Execution mode
- [ ] Daily progress input cho members
- [ ] Earned Value metrics (SPI, CPI, EAC)
- [ ] Burndown chart
- [ ] At-risk warnings dựa trên actual vs planned

**Definition of Done:** Team có thể track tiến độ hàng ngày, hệ thống tự cảnh báo khi có nguy cơ trễ.

---

## M5 — XP System & Full Feature
**Target: 15/5/2026**

**Deliverables:**
- [ ] XP calculation khi kết thúc dự án
- [ ] Skill level up system
- [ ] End-of-project review screen
- [ ] XP reflected trong personnel profile cho dự án tiếp theo

**Definition of Done:** Finalize project → mỗi member xem XP + skill progress.

---

## M6 — Production Ready
**Target: 31/5/2026**

**Deliverables:**
- [ ] E2E test suite pass
- [ ] Acceptance checklist (tất cả 30 tickets) verified
- [ ] Performance: board với 50 tasks + 20 người ≤ 60fps
- [ ] Security review: multi-tenant isolation tested
- [ ] User guide hoàn chỉnh
- [ ] Deployment runbook

---

## Risk Tracking

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| LLM API downtime ảnh hưởng MVP | Medium | High | Fallback to manual task creation mode |
| Three.js performance trên low-end devices | Medium | Medium | LOD + instancing + 50-task limit |
| COCOMO II complexity exceed timeline | Low | High | Start BE-001 trước tất cả, timebox 3 ngày |
| Multi-dev conflicts trên database schema | Medium | Medium | Feature branches, migrations versioned |
| GA optimizer chạy chậm (>30s) | Low | Medium | Async job + WebSocket progress |
