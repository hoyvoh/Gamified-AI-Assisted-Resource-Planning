# Design — BE-006

## Files to Create/Modify
- be/app/routers/assignments.py
- be/app/schemas/assignment.py
- be/app/schemas/warning.py
- be/app/services/assignment_service.py
- be/app/warnings/engine.py
- be/app/warnings/rules.py
- be/tests/test_assignments.py
- be/tests/test_warnings.py

## Technical Design

### Effective WFU Calculation
```python
def compute_effective_wfu(
    personnel: Personnel,
    task: Task,
    allocation_pct: float,
    wfu_mode: WFUMode
) -> float:
    skill_match = any(s in task.tech_stacks for s in personnel.skill_names)
    base = personnel.base_wfu

    if wfu_mode == WFUMode.standard:
        multiplier = 1.0 if not skill_match else 1.0
    elif wfu_mode == WFUMode.fast:
        multiplier = 1.2 if skill_match else 1.0
    elif wfu_mode == WFUMode.quality:
        multiplier = 1.5 if skill_match else 1.0

    # Junior penalty
    if personnel.years_experience < 1:
        base *= 0.8

    return base * multiplier * (allocation_pct / 100)
```

### Warning Rules
```python
# 1. CAPACITY: sum of daily hours > 7
# 2. JUNIOR_ALONE: task with priority=critical/high has only juniors assigned
# 3. BUDGET: total personnel cost > project.budget_total
# 4. TIME_RISK: estimated completion date > project.deadline
# 5. SKILL_MISMATCH: >50% of task assignments have no matching skill
```

### API Response with Warnings
```python
class AssignmentResponse(BaseModel):
    assignment: ResourceAssignment
    warnings: list[Warning]   # triggered warnings after this assignment
    updated_task: Task         # recalculated dates
```

## Acceptance Criteria
- [ ] Assign person >7h/day total → response includes CAPACITY warning (severity=critical)
- [ ] Task with only junior (<1yr) assigned → JUNIOR_ALONE warning
- [ ] GET /scenarios/{id}/warnings returns all current warnings
- [ ] PATCH /warnings/{id}/acknowledge marks warning as acknowledged
- [ ] effective_wfu calculated correctly for all mode/skill combinations
- [ ] uv run pytest tests/test_assignments.py tests/test_warnings.py passes
