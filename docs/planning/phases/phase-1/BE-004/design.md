# Design — BE-004

## Files to Create/Modify
- be/app/routers/scenarios.py
- be/app/routers/tasks.py
- be/app/schemas/scenario.py
- be/app/schemas/task.py
- be/app/services/scenario_service.py
- be/app/services/task_service.py
- be/app/repositories/scenario_repo.py
- be/app/repositories/task_repo.py
- be/tests/test_scenarios.py
- be/tests/test_tasks.py

## Technical Design

### Snapshot Immutability

```python
# In scenario_service.py
async def snapshot(db, scenario_id, name) -> Scenario:
    original = await scenario_repo.get(db, scenario_id)
    # Deep copy: scenario + all tasks + all assignments
    new_scenario = Scenario(
        project_id=original.project_id,
        name=name,
        is_snapshot=True,
        parent_scenario_id=scenario_id,
    )
    # Copy tasks with new IDs but same data
    ...

# In router — guard against editing snapshots
async def update_task(task_id, ...):
    task = await task_repo.get(db, task_id)
    scenario = await scenario_repo.get(db, task.scenario_id)
    if scenario.is_snapshot:
        raise HTTPException(403, "Cannot modify a snapshot scenario")
```

### Task Split

```python
# POST /tasks/{id}/split  body: { into: int, names: list[str] }
# Creates N subtasks with proportional effort, same techstacks
# Original task deleted (or archived)
# Returns: list[Task]
```

### Task Merge

```python
# POST /tasks/merge  body: { task_ids: list[UUID], name: str }
# Creates 1 new task with summed effort
# All assignments moved to new task
# Original tasks deleted
# Returns: Task
```

### Key API Endpoints
```
POST   /projects/{id}/scenarios          → 201
GET    /projects/{id}/scenarios          → 200 list
GET    /scenarios/{id}                   → 200
PATCH  /scenarios/{id}                   → 200 (403 if snapshot)
POST   /scenarios/{id}/snapshot          → 201 (new scenario)

POST   /scenarios/{id}/tasks             → 201
POST   /scenarios/{id}/tasks/bulk        → 201 list
GET    /scenarios/{id}/tasks             → 200 list
GET    /tasks/{id}                       → 200
PATCH  /tasks/{id}                       → 200 (403 if snapshot)
DELETE /tasks/{id}                       → 204 (403 if snapshot)
POST   /tasks/{id}/split                 → 201 list[Task]
POST   /tasks/merge                      → 201 Task
```

## Acceptance Criteria
- [ ] POST /scenarios/{id}/snapshot creates immutable copy with all tasks
- [ ] PATCH on snapshot → 403
- [ ] POST /tasks/merge reduces N tasks to 1 with combined effort
- [ ] POST /tasks/{id}/split creates N subtasks with proportional effort
- [ ] Bulk create: POST /scenarios/{id}/tasks/bulk with array → 201 list
- [ ] uv run pytest tests/test_scenarios.py tests/test_tasks.py passes
