# Design — BE-004

## Components to Develop

### Services
| Service | Responsibility |
|---------|---------------|
| `ScenarioService` | State transitions, launch, fork, archive, one-active enforcement |
| `TaskService` | CRUD, split, merge, effort recalculation |
| `ExecutionBaselineService` | Create and store frozen baseline snapshot on launch |

### Data Flow — Scenario State Machine
```
Draft scenario (editable)
  ↓ PM clicks Launch
ScenarioService.launch(scenario_id, user_id)
  → validates: ≥1 task with assignment
  → sets scenario.status = active
  → sets project.status = active, project.started_at = now
  → calls ExecutionBaselineService.create(scenario_id) → frozen copy stored
  → enforces: all other scenarios for this project remain draft/archived
  ↓
Active scenario (tasks locked for edit)
  ↓ mid-execution: PM triggers switch
ScenarioService.activate(new_scenario_id, trigger_reason)
  → sets old active scenario.status = archived, archived_at = now, archive_reason = trigger
  → sets new scenario.status = active
  → creates new execution_baseline from new scenario
```

### Data Flow — Scenario Fork
```
ScenarioService.fork(source_scenario_id, name, type)
  → creates new scenario (status=draft)
  → deep copies: all tasks (new IDs, same data)
  → deep copies: all assignments (new IDs, linked to new task IDs)
  → does NOT copy: ProgressLogs (actual data stays on original tasks)
  → returns new scenario with tasks
```

### Data Flow — Task Split
```
TaskService.split(task_id, into_n, names[])
  → creates N new tasks, effort divided proportionally
  → original task deleted
  → assignments: PM re-assigns in Mode 3
  → returns list of N new tasks
```

### Data Flow — Task Merge
```
TaskService.merge(task_ids[], name)
  → creates 1 new task, effort = sum of merged tasks
  → all assignments from merged tasks moved to new task
  → original tasks deleted
  → returns new task
```

### API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/projects/{id}/scenarios` | Create scenario (name, type) |
| GET | `/projects/{id}/scenarios` | List all scenarios with status + P(on_time) |
| GET | `/scenarios/{id}` | Get scenario detail |
| PATCH | `/scenarios/{id}` | Update name/type (draft only, 403 if active/archived) |
| POST | `/scenarios/{id}/launch` | Activate scenario, create baseline |
| POST | `/scenarios/{id}/fork` | Fork into new draft |
| POST | `/scenarios/{id}/archive` | Archive with reason |
| POST | `/scenarios/{id}/tasks` | Create task |
| POST | `/scenarios/{id}/tasks/bulk` | Bulk create tasks |
| GET | `/scenarios/{id}/tasks` | List tasks |
| PATCH | `/tasks/{id}` | Update task (draft scenario only, 403 otherwise) |
| DELETE | `/tasks/{id}` | Delete task (draft only) |
| POST | `/tasks/{id}/split` | Split into N subtasks |
| POST | `/tasks/merge` | Merge N tasks into 1 |

## Component Relationships
```
ScenarioService
  → ScenarioRepository (reads/writes scenarios table)
  → ExecutionBaselineService (called on launch/activate)
  → TaskService (delegates task operations)

TaskService
  → TaskRepository (reads/writes tasks table)
  → AssignmentRepository (moves assignments on merge)
```

## Acceptance Criteria
- [ ] POST /scenarios/{id}/launch: scenario → active, project.started_at set, baseline created
- [ ] Only 1 active scenario per project — launching second auto-archives previous
- [ ] PATCH on active/archived scenario → 403
- [ ] POST /scenarios/{id}/fork: returns new draft scenario with deep-copied tasks + assignments
- [ ] POST /scenarios/{id}/archive: scenario → archived with reason + timestamp
- [ ] POST /tasks/{id}/split: creates N tasks with proportional effort, original deleted
- [ ] POST /tasks/merge: 1 task with summed effort, originals deleted
- [ ] All endpoints require auth, respect org-level multi-tenancy
- [ ] `uv run pytest tests/test_scenarios.py tests/test_tasks.py` passes
