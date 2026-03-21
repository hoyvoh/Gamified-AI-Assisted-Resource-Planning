# Ticket Workflow

Quy trình thực hiện một ticket từ đầu đến cuối — áp dụng cho tất cả contributors (human và AI agent).

---

## 1. Chọn Ticket

1. Mở [`planning/general-ledger.md`](../planning/general-ledger.md) → tìm ticket `⬜ Not started` ở Phase hiện tại
2. Verify tất cả prerequisites đã `✅ Done` (cột Notes)
3. Mở folder của ticket: `planning/phases/phase-N/<TICKET-ID>/`
   - Đọc `overview.md` — goal, scope, prerequisites
   - Đọc `design.md` — files to change, technical design, acceptance criteria
4. Đọc spec liên quan trong `design/`:
   - BE ticket → `design/backend-spec.md`
   - FE ticket → `design/frontend-spec.md`
   - DB ticket → `design/database-spec.md`

---

## 2. Bắt Đầu

```bash
git checkout main && git pull
git checkout -b feature/<TICKET-ID>-<short-name>
# e.g.: feature/BE-001-cocomo-engine
```

Cập nhật `planning/general-ledger.md`:
- Status: `⬜` → `🔄`
- Điền tên vào "Implemented by"

```bash
git commit -m "docs: mark <TICKET-ID> as in-progress"
```

---

## 3. Development

### Backend Ticket
```bash
cd be

# Thứ tự implement theo Clean Architecture:
# 1. app/models/<domain>.py        — ORM model (nếu cần)
# 2. app/schemas/<domain>.py       — Pydantic request/response
# 3. app/repositories/<domain>.py  — DB queries
# 4. app/services/<domain>.py      — Business logic (no HTTP)
# 5. app/routers/<domain>.py       — Route handlers (no logic)
# 6. tests/test_<domain>.py        — Tests

uv run ruff format . && uv run ruff check --fix . && uv run mypy app
uv run pytest tests/test_<domain>.py -v
```

### Frontend Ticket
```bash
cd ui

# Thứ tự implement:
# 1. src/lib/api/<domain>.ts       — API client
# 2. src/hooks/use<Feature>.ts     — Data hook
# 3. src/components/<Feature>/     — Component(s)
# 4. src/__tests__/<Feature>.test.tsx — Tests

pnpm format && pnpm lint && pnpm type-check
pnpm test:unit:run
```

### Quy tắc thêm dependency
- Chỉ dùng thư viện phổ biến, có uy tín, actively maintained
- Không dùng thư viện lạ — nguy cơ supply chain attack
- Khi không chắc: hỏi lead trước

---

## 4. Kiểm Tra Acceptance Criteria

Mở `planning/phases/phase-N/<TICKET-ID>/design.md` → tick từng item trong `## Acceptance Criteria`.

**Tất cả criteria phải được tick trước khi tạo PR.**

---

## 5. Tạo Pull Request

```bash
git add <specific-files>  # không dùng git add -A
git commit -m "feat(<scope>): <description>"
git push -u origin feature/<TICKET-ID>-<short-name>
```

**PR description template:**
```markdown
## Ticket
<TICKET-ID> — <Name>

## Changes
- <brief description of what changed>

## Acceptance Criteria
- [x] <criterion 1>
- [x] <criterion 2>

## How to Test
cd be && uv run pytest tests/test_<feature>.py -v
```

---

## 6. Code Review Checklist (Reviewer)

- [ ] CI pass (all checks green)
- [ ] Acceptance criteria ticked trong PR description
- [ ] Clean Architecture: không có business logic trong router, không có HTTP trong service
- [ ] No `any` / `# type: ignore` tanpa komentar (FE); No `Any` (BE)
- [ ] Tests cover edge cases, không chỉ happy path
- [ ] Không có thư viện mới lạ

---

## 7. Merge & Cập Nhật Ledger

Sau khi PR merged:
- Cập nhật `planning/general-ledger.md`: Status `🔄` → `✅`, điền "Approved by"

```bash
git commit -m "docs: mark <TICKET-ID> as done in general ledger"
```

---

## 8. Spec Deviation

Nếu khi implement phát hiện spec cần thay đổi:
1. Không tự thay đổi spec khi không thông báo
2. Comment vào PR: "Phát hiện spec deviation: ..."
3. Lead approve → update spec file cùng trong PR
4. Ghi vào PR description: "Spec deviation: [lý do]"

---

## Quick Reference

| Rule | Mô tả |
|------|-------|
| 1 ticket = 1 branch | Không mix tickets |
| Commit early & often | Message theo Conventional Commits |
| No direct push to main | Luôn qua PR |
| Update ledger | Trước và sau khi làm |
| Ask when blocked >30 min | Đừng tự mò |
