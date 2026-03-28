# BE-010 — Progress Log, Earned Value & Scenario Switch

**Phase:** 6 — Execution Mode
**Track:** Backend
**Branch:** `feature/BE-010-progress-ev-switch`
**Status:** Not started
**Prerequisites:** BE-006

## Goal
Accept daily progress updates, compute Earned Value metrics, track P(on_time), and support mid-execution scenario switching (fork from current execution state + archive with trigger).

## Scope
- Daily progress log: store completion %, hours spent, notes per task per day
- EV computation: PV, EV, AC, SPI, CPI, EAC, ETC per task and project
- P(on_time) computation: based on SPI, velocity variance, risk factors, critical path slack
- Auto-trigger TIME_RISK warning when EAC > project deadline
- Auto-trigger RISK_ESCALATION suggestion when P(on_time) < 40% for 3 consecutive days
- **Scenario fork-from-execution**: deep copy active scenario carrying actual progress state, re-baseline task dates from today
- **Archive-with-trigger**: archive active scenario with trigger reason (MEMBER_DEPARTURE / SCOPE_CHANGE / DEADLINE_CHANGE / BUDGET_CUT / RISK_ESCALATION) and progress snapshot
- ProgressLogs remain on original task IDs — not lost across scenario switches
