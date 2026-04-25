# Plan: Analyze Member Profile — Full Flow

> Status: **DRAFT — awaiting approval before any code changes**
> Date: 2026-04-23

---

## 1. Flow Overview

```
/members (member list table)
    │
    └─ [chọn bất kỳ member] ──► /profile/{id}/scan  (lobby — luôn đi qua đây)
                                      │
                                      ├─ Hiển thị: run history list
                                      │            (status, period, completed_at, error)
                                      │
                                      ├─ [New Scan] button ──► trigger → poll progress
                                      │                             │
                                      │                        [completed] ──► /profile/{id}
                                      │
                                      └─ [View Profile] (nếu có run completed) ──► /profile/{id}
```

> **Nguyên tắc:** Mọi member đều đi qua Scan Lobby trước.
> Lobby là nơi xem lịch sử scan VÀ khởi động scan mới — không nhảy thẳng vào profile.

---

## 2. Brainstorm — Devil's Advocate

### A. Những gì có thể vỡ

| # | Scenario | Blast radius | Detectability |
|---|---|---|---|
| 1 | **Không có global `GET /members`** — API yêu cầu traverse `orgs → teams → members` (N+1 requests nếu nhiều org) | Trang member list load chậm / timeout với data lớn | Trung bình — chỉ thấy khi org scale |
| 2 | **409 Conflict** — trigger analysis khi đang có run active | Nút trigger throw lỗi, UI không phản hồi rõ | Cao — BE trả 409 với message |
| 3 | **Poll cleanup** — user navigate away khỏi waiting hall trong lúc poll đang chạy | Memory leak / re-render sau unmount | Trung bình — React Query xử lý phần lớn nhưng run-id polling cần cleanup thủ công |
| 4 | **`progress_stage` không được dùng** — đã được BE trả về nhưng UI hiện chưa display (documented trong `ui-api-usage.md`) | Waiting hall vô nghĩa nếu chỉ show spinner | Cao — gap rõ ràng |
| 5 | **Empty state** — không có org/member nào trong DB | Member list trống, người dùng không biết làm gì | Dễ phát hiện |
| 6 | **Stale member list** — user trigger analysis xong quay lại list, `analysis_status` vẫn là `pending` | UI misleading | Trung bình — cần invalidate query sau trigger |

### B. Những gì chưa được cân nhắc

- **Navigation chia đôi**: trang chủ (`/`) vẫn còn launcher GitHub-handle cũ. Sau khi thêm `/members`, user có 2 entry points khác nhau — cần quyết định vai trò của mỗi cái.
- **Run history pagination**: `GET /members/{id}/analysis-runs` có `limit/offset`. Nếu member nhiều run cũ → cần phân trang.
- **Error message surfacing**: `error_message` từ failed run đang bị bỏ qua trong UI (`mapChamberAnalysisRun()` map nó nhưng không display ở đâu).
- **Org/team context trong member list**: user cần thấy member thuộc team nào, org nào — nhưng data này phải join từ org detail response.
- **Refresh vs fresh run**: BE có 2 run types (`fresh` / `refresh_same_period`). UI trigger hiện dùng `fresh`. Waiting hall nên communicate sự khác biệt không?

### C. Câu hỏi cần xác nhận trước khi code

| Q | Risk nếu sai |
|---|---|
| Q1: Member list có cần **search/filter** theo tên không, hay flat table đơn giản? | Nếu có nhiều member → UX kém nếu không filter |
| Q2: Waiting hall là **full page riêng** (`/profile/{id}/scan`) hay **overlay/state trong shell** hiện có? | Ảnh hưởng routing và component architecture |
| Q3: Analysis history hiển thị ở **đâu** — sidebar trong waiting hall, hay tab riêng trong profile? | Ảnh hưởng layout |
| Q4: Home page (`/`) giữ launcher cũ hay **replace bằng link đến `/members`**? | Ảnh hưởng UX entry point |

---

## 3. Thiết kế màn hình

### Screen 1 — Member List (`/members`)

**Mục đích:** Browse tất cả members theo org/team hierarchy, chọn member để analyze hoặc xem profile.

**Data sources:**
```
GET /api/v1/organizations            → list orgs
GET /api/v1/organizations/{org_id}   → get teams + members per org (for each org)
```

**Cách fetch:** Parallel fetch tất cả org details sau khi có org list (Promise.all).

**UI layout:**
```
┌─────────────────────────────────────────────────────┐
│  ANALYSIS CHAMBER — Members                          │
├────────────────┬──────────┬─────────┬───────────────┤
│ MEMBER         │ TEAM     │ ROLE    │ STATUS        │
├────────────────┼──────────┼─────────┼───────────────┤
│ tanvd           │ Platform │ Senior  │ ● completed   │
│ john.doe        │ Backend  │ Junior  │ ○ not_analyzed│
│ alice.k         │ Frontend │ Mid     │ ⟳ analyzing   │
├────────────────┴──────────┴─────────┴───────────────┤
│ [View Profile]  [Trigger Analysis]  (per row)        │
└─────────────────────────────────────────────────────┘
```

**Logic per row:**
- Mọi member đều có 1 action duy nhất: **"Open Lobby"** → navigate `/profile/{id}/scan`
- Status badge chỉ là thông tin (completed / analyzing / not_analyzed / failed)
- Không có nút "View Profile" trực tiếp từ list — luôn đi qua Scan Lobby

**Empty state:** Link về launcher để tạo org/team/member mới.

---

### Screen 2 — Scan Lobby (`/profile/[memberId]/scan`)

**Mục đích:** Lobby trung tâm cho mọi member — xem toàn bộ lịch sử scan, khởi động scan mới cho bất kỳ khoảng thời gian nào, theo dõi tiến trình scan đang chạy.

> Mọi member đều đi qua đây, kể cả member đã có profile completed.

**Data sources:**
```
GET  /api/v1/members/{member_id}                           → member info + status
GET  /api/v1/members/{member_id}/analysis-runs?limit=10    → full run history
POST /api/v1/analysis-runs                                 → trigger new run (→ returns run_id)
GET  /api/v1/analysis-runs/{run_id}                        → poll progress (mỗi 3s)
```

**UI layout:**
```
┌──────────────────────────────────────────────────────────────┐
│  ← Back to Members                                            │
│                                                               │
│  [Member name]  [Role]  [Team]      [View Profile →] (nếu    │
│                                      có completed run)        │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  SCAN HISTORY                                         │    │
│  │                                                       │    │
│  │  ● 2026-04-20 → 2026-04-23  completed  [View Profile]│    │
│  │  ✗ 2026-04-10 → 2026-04-13  failed     [error msg]   │    │
│  │  ● 2026-03-01 → 2026-03-31  completed  [View Profile]│    │
│  │  ⟳ (current)  analyzing...  60%  Stage: collecting   │    │
│  │    [████████░░░░░░]                                   │    │
│  │    ○ pending  ● collecting  ○ analyzing  ○ completed  │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  NEW SCAN                                             │    │
│  │  Period start: [2026-04-01]  Period end: [2026-04-23] │    │
│  │  [▶ Start New Scan]   (disabled nếu đang có run active)│   │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

**States:**

| Trạng thái | Scan History panel | New Scan panel |
|---|---|---|
| Không có run nào | Empty state "No scans yet" | Form mở, button enabled |
| Có completed run | List runs với [View Profile] per row | Form mở, button enabled |
| Đang có run active (`analyzing/collecting`) | Row active nổi bật với progress bar + stepper | Form disabled, tooltip "A scan is already running" |
| Run vừa complete | Row mới xuất hiện ở đầu, badge `completed` | Form enabled lại |

**Polling strategy:**
- Sau khi trigger → nhận `run_id` từ response 202 → start polling `GET /analysis-runs/{run_id}` mỗi 3s
- Nếu page load mà member đang `analyzing` → lấy `run_id` từ latest run → tự động bắt đầu poll
- Dừng poll khi `status = completed | failed`
- Khi `completed` → invalidate history list → row mới cập nhật, không auto-redirect (user chủ động click "View Profile")

**Progress stages (từ BE):**
```
pending → collecting → analyzing → completed | failed
```
Hiển thị dưới dạng stepper với `progress_stage` string và `progress_pct` bar trong row đang active.

---

### Screen 3 — Profile (đã có, `/profile/[memberId]`)

Không thay đổi gì ở profile. Chỉ đảm bảo back navigation từ profile về `/members`.

---

## 4. Implementation Plan

### Scope: UI-only (không thay đổi BE)

---

### Task 1 — API layer additions

**File:** `ui/src/features/analysis-chamber/api/analysis-chamber-api.ts`

Thêm 3 functions mới:
```typescript
// Flatten all members across all orgs
getAllMembersAcrossOrgs(): Promise<FlatMemberRow[]>

// Poll run by ID (for richer progress in waiting hall)
getAnalysisRunById(runId: string): Promise<ChamberAnalysisRun>

// Analysis run history for a member
getMemberAnalysisRuns(memberId: string, limit?: number): Promise<ChamberAnalysisRun[]>
```

`FlatMemberRow` = member + teamName + orgName computed từ org tree.

**Token estimate:** ~1500 tok

---

### Task 2 — Member List page

**New files:**
- `ui/src/app/members/page.tsx` — server component, renders `MemberListTable`
- `ui/src/features/analysis-chamber/components/member-list-table.tsx` — client component

**Behavior:**
- Fetch all members via `getAllMembersAcrossOrgs()`
- Render table with columns: Name, External ID (GitHub handle), Team, Role, Status, Last Analyzed
- Status badge: `completed` = green, `analyzing` = blue pulse, `failed` = red, `not_analyzed` = grey
- Action button per row: context-aware (View Profile / View Progress / Trigger Analysis)
- Empty state: "No members yet. Create org from launcher."
- Simple, không cần search filter cho MVP (hackday scope)

**Token estimate:** ~3500 tok

---

### Task 3 — Waiting Hall (Scan) page

**New files:**
- `ui/src/app/profile/[memberId]/scan/page.tsx` — server component
- `ui/src/features/analysis-chamber/components/analysis-waiting-hall.tsx` — client component
- `ui/src/features/analysis-chamber/hooks/use-analysis-run-polling.ts` — polling hook

**Behavior:**
- On mount: fetch member info + run history
- If no active run → show "Trigger Analysis" form (period_start / period_end inputs + submit)
- On trigger: POST `/analysis-runs` → get `run_id` → start polling
- Polling `GET /analysis-runs/{run_id}` mỗi 3s → update progress stepper + progress bar
- Run History panel: list 5 runs gần nhất với status, period, completed_at
- On completion → `status === 'completed'` → auto-navigate `/profile/{memberId}` sau 2s
- On failed → show `error_message` + retry button

**Token estimate:** ~4500 tok

---

### Task 4 — Navigation wiring

**Modified files:**
- `ui/src/app/page.tsx` — thêm link "Browse All Members →" dẫn đến `/members` (giữ nguyên launcher)
- `ui/src/app/profile/[memberId]/layout.tsx` — thêm "Back to Members" link trong header bar

**Token estimate:** ~500 tok

---

### Task 5 — Query invalidation after trigger

**Modified file:**
- `ui/src/features/analysis-chamber/hooks/use-analysis-chamber-shell-data.ts`

Sau khi trigger analysis từ member list table hoặc waiting hall → invalidate `bootstrap` query của member đó để `analysis_status` trong list được refresh.

**Token estimate:** ~500 tok

---

## 5. File Change Summary

| File | Action | Purpose |
|---|---|---|
| `ui/src/features/analysis-chamber/api/analysis-chamber-api.ts` | Modify | Add `getAllMembersAcrossOrgs`, `getAnalysisRunById`, `getMemberAnalysisRuns` |
| `ui/src/app/members/page.tsx` | Create | Member list route |
| `ui/src/features/analysis-chamber/components/member-list-table.tsx` | Create | Member table UI |
| `ui/src/app/profile/[memberId]/scan/page.tsx` | Create | Waiting hall route |
| `ui/src/features/analysis-chamber/components/analysis-waiting-hall.tsx` | Create | Waiting hall UI (trigger + progress + history) |
| `ui/src/features/analysis-chamber/hooks/use-analysis-run-polling.ts` | Create | Polling hook for run_id |
| `ui/src/app/page.tsx` | Modify | Add link to `/members` |
| `ui/src/app/profile/[memberId]/layout.tsx` | Modify | Add back navigation |

---

## 6. Out of Scope (hackday)

- Search/filter trong member list
- Pagination cho member list (ổn với ~20–50 members)
- Pagination cho run history (show latest 5 is enough)
- `refresh_same_period` run type (chỉ dùng `fresh`)
- Evidence viewer
- Validation flags UI
- DELETE/PATCH member ops trong UI

---

## 7. Token Cost Estimate

| Task | Tier | Estimate |
|---|---|---|
| Task 1 — API layer | instruction | ~1,500 tok |
| Task 2 — Member List | instruction | ~3,500 tok |
| Task 3 — Waiting Hall | context-heavy | ~4,500 tok |
| Task 4 — Navigation wiring | script | ~500 tok |
| Task 5 — Query invalidation | script | ~500 tok |
| **Total** | | **~10,500 tok** |

---

> **Approval required before any code changes.**
> Confirm plan hoặc điều chỉnh scope trước khi implement.
