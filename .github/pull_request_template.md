## Ticket

<!-- Link the ticket this PR closes, e.g. Closes #BE-002 -->

Ticket: <!-- e.g. BE-002 — Database Schema & Migrations -->
Assignee: <!-- Vy / Tan / Both -->

---

## Description

<!-- Brief summary of what changed and why -->

## Type of change

- [ ] Feature
- [ ] Bug fix
- [ ] Refactor
- [ ] Docs / Chore

---

## General Ledger

> **Required:** When this PR is merged, update [`docs/planning/general-ledger.md`](../docs/planning/general-ledger.md):

- [ ] **Done** column ticked `[x]`, **Status** set to ✅
- [ ] **Approved by** filled with reviewer name + date
- [ ] **Progress Summary** table counts updated

---

## Checklist

### Frontend (if UI changed)
- [ ] `pnpm format` — no formatting diffs
- [ ] `pnpm lint` — 0 errors
- [ ] `pnpm type-check` — passes
- [ ] `pnpm build` — successful

### Backend (if BE changed)
- [ ] `uv run ruff format .` — no formatting diffs
- [ ] `uv run ruff check .` — 0 errors
- [ ] `uv run mypy app` — passes
- [ ] `uv run pytest` — all tests pass
