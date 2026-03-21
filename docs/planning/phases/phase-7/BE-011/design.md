# Design — BE-011

## Files to Create/Modify
- be/app/services/xp_service.py
- be/app/schemas/xp.py
- be/app/routers/projects.py — add /finalize route
- be/tests/test_xp.py

## Technical Design

### XP Rules
```python
XP_RULES = {
    'task_completed':    10,   # base XP per completed task
    'on_time_bonus':      5,   # completed on or before planned_end
    'early_bonus':       10,   # completed >1 day before planned_end
    'new_skill':         20,   # used a techstack not in skill matrix before
    'quality_bonus':     15,   # task had 0 bug reports (future: linked to issues)
    'mentoring':         10,   # senior with junior on same task
}
```

### Level Thresholds
```python
LEVEL_THRESHOLDS = {
    'beginner': 0, 'intermediate': 100,
    'advanced': 300, 'expert': 600
}

def check_level_up(current_level, current_xp, gained_xp) -> str | None:
    new_total = current_xp + gained_xp
    # Return new level name if threshold crossed, else None
```

## Acceptance Criteria
- [ ] POST /projects/{id}/finalize creates xp_events for all members
- [ ] On-time task: base + on_time_bonus XP
- [ ] New skill used: +20 XP + skill added to skill_matrix_entries
- [ ] Skill level updates when XP threshold crossed
- [ ] uv run pytest tests/test_xp.py passes
