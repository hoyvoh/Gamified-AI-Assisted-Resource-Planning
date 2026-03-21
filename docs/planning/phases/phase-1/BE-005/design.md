# Design — BE-005

## Files to Create/Modify
- be/app/routers/task_deps.py
- be/app/services/critical_path_service.py
- be/app/algorithms/critical_path.py
- be/app/schemas/dependency.py
- be/tests/test_critical_path.py

## Technical Design

### Cycle Detection
```python
def has_cycle(tasks: list[Task], new_dep: tuple[UUID, UUID]) -> bool:
    # Build adjacency list, run DFS to detect cycle
    # If adding (task_id → depends_on_id) creates cycle → return True
```

### CPM Algorithm
```python
class CriticalPathService:
    def compute(self, tasks: list[Task], deps: list[TaskDependency]) -> CPMResult:
        # 1. Topological sort
        # 2. Forward pass: early_start[i] = max(early_finish[predecessors])
        #    early_finish[i] = early_start[i] + duration[i]
        # 3. Backward pass: late_finish, late_start
        # 4. Float = late_start - early_start
        # 5. Critical path = tasks where float == 0

class CPMResult(BaseModel):
    critical_path: list[UUID]     # task IDs in order
    total_duration_days: float
    tasks_with_float: list[TaskFloatInfo]
```

### API Endpoints
```
GET    /tasks/{id}/dependencies          → 200 list[Dependency]
POST   /tasks/{id}/dependencies          → 201 (409 if circular)
DELETE /tasks/{id}/dependencies/{dep_id} → 204
GET    /scenarios/{id}/critical-path     → 200 CPMResult
```

## Acceptance Criteria
- [ ] Adding a circular dependency returns 409
- [ ] CPM on 5-task linear chain: critical path includes all 5 tasks
- [ ] CPM on parallel branches: only longer branch is critical
- [ ] GET /scenarios/{id}/critical-path returns correct total_duration_days
- [ ] uv run pytest tests/test_critical_path.py passes
