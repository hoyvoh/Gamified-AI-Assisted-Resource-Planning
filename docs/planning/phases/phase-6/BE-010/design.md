# Design — BE-010

## Components to Develop

| Service | Responsibility |
|---------|---------------|
| `ProgressService` | Store progress logs, validate, deduplicate per day |
| `EarnedValueService` | Compute PV/EV/AC/SPI/CPI/EAC/ETC per task and project |
| `POnTimeService` | Compute P(on_time) from SPI, velocity variance, risk factors |
| `ScenarioSwitchService` | Fork-from-execution, archive-with-trigger, re-baseline |

## Data Flow — Daily Progress Update
```
Member calls POST /tasks/{id}/progress (completion_pct, hours_spent, notes)
  ↓
ProgressService.log(task_id, data)
  → stores ProgressLog record (one per task per day, upsert)
  ↓
EarnedValueService.recompute(project_id)
  → computes PV, EV, AC, SPI, CPI, EAC for all tasks
  → stores in earned_value_cache table
  ↓
POnTimeService.recompute(project_id)
  → derives P(on_time) from SPI, velocity variance, active risk count, CP slack
  → stores in project.p_on_time_current
  ↓
Warning checks:
  - EAC > deadline → upsert TIME_RISK warning
  - P(on_time) < 40% for 3rd consecutive day → upsert RISK_ESCALATION warning
```

## Data Flow — Scenario Switch (Mid-Execution)
```
PM calls POST /projects/{id}/scenario-switch (new_scenario_id, trigger_reason, note)
  ↓
ScenarioSwitchService.switch(project_id, new_scenario_id, trigger_reason)
  → archives current active scenario:
       scenario.status = archived
       scenario.archived_at = now
       scenario.archive_reason = trigger_reason
       snapshot current earned value + P(on_time) into scenario.progress_at_archive
  → activates new scenario:
       scenario.status = active
       creates new execution_baseline from new scenario task dates
       stores switch record: SwitchLog(project_id, from_scenario, to_scenario, trigger, switched_at)
  → ProgressLogs are on Task records, not Scenario records → they persist unchanged
```

## Earned Value Formulas (description, no code)
- **PV (Planned Value)**: BAC × (days elapsed / total planned duration)
- **EV (Earned Value)**: BAC × completion_pct
- **AC (Actual Cost)**: sum of hours_spent × hourly_rate
- **SPI**: EV / PV — >1 ahead of schedule, <1 behind
- **CPI**: EV / AC — >1 under budget, <1 over budget
- **EAC**: BAC / CPI — projected total cost
- **ETC**: EAC - AC — remaining estimated cost

## P(on_time) Factors
| Factor | Weight | Description |
|--------|--------|-------------|
| SPI | High | Primary schedule health signal |
| Velocity variance | Medium | Consistency of daily progress |
| Active risk warnings | Medium | Each CAPACITY/TIME_RISK reduces probability |
| Critical path slack | High | Slack days before deadline |

## API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/tasks/{id}/progress` | Log daily progress |
| GET | `/tasks/{id}/progress` | Progress history |
| GET | `/projects/{id}/earned-value` | Project EV metrics (SPI, CPI, EAC, P(on_time)) |
| GET | `/projects/{id}/p-on-time/history` | P(on_time) over last N days |
| POST | `/projects/{id}/scenario-switch` | Switch active scenario with trigger |
| GET | `/projects/{id}/scenario-switches` | Switch history (for Gantt markers) |

## Acceptance Criteria
- [ ] POST /tasks/{id}/progress stores log and returns updated EV metrics
- [ ] SPI, CPI, EAC computed correctly (unit tests cover edge cases)
- [ ] EAC > deadline → TIME_RISK warning auto-created
- [ ] P(on_time) < 40% for 3 days → RISK_ESCALATION warning auto-created
- [ ] POST /projects/{id}/scenario-switch: old scenario archived with trigger, new activated
- [ ] After switch: GET /tasks/{id}/progress still returns all historical logs
- [ ] GET /projects/{id}/scenario-switches returns ordered switch history
- [ ] `uv run pytest tests/test_progress.py tests/test_ev.py tests/test_scenario_switch.py` passes
