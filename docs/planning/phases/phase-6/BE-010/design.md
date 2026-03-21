# Design — BE-010

## Files to Create/Modify
- be/app/routers/progress.py
- be/app/services/earned_value_service.py
- be/app/schemas/progress.py
- be/app/schemas/earned_value.py
- be/tests/test_earned_value.py

## Technical Design

### Earned Value Formulas
```python
# PV (Planned Value) = BAC × (days_elapsed / total_planned_days)
# EV (Earned Value) = BAC × completion_pct
# AC (Actual Cost) = sum of hours_spent × hourly_rate
# SPI = EV / PV   (>1 = ahead, <1 = behind schedule)
# CPI = EV / AC   (>1 = under budget, <1 = over budget)
# EAC = BAC / CPI (Estimate at Completion)
# ETC = EAC - AC  (Estimate to Complete)

# BAC = task.effort_total_days × assigned_personnel_daily_cost
```

### Warning Trigger
```python
# After each progress log:
if project_eac_date > project.deadline:
    warning_engine.upsert_warning(
        scenario_id, WarningType.TIME_RISK, severity=Severity.WARNING,
        message=f"EAC: {eac_date} exceeds deadline {project.deadline}"
    )
```

## Acceptance Criteria
- [ ] POST /tasks/{id}/progress stores log and returns updated EV
- [ ] GET /projects/{id}/earned-value returns SPI, CPI, EAC, ETC
- [ ] SPI < 0.8 → TIME_RISK warning automatically created
- [ ] Progress history accessible: GET /tasks/{id}/progress
- [ ] uv run pytest tests/test_earned_value.py passes
