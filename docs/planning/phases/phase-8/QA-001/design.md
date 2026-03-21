# Design — QA-001

## Files to Create/Modify
- be/tests/test_e2e_flow1_proposal.py
- be/tests/test_e2e_flow2_assignment.py
- be/tests/test_e2e_flow3_optimize.py
- be/tests/test_e2e_flow4_progress.py
- be/tests/test_e2e_flow5_xp.py
- be/tests/conftest.py — shared fixtures (org, personnel, project setup)

## Technical Design

### Shared Fixtures (conftest.py)
```python
@pytest.fixture
async def setup_org(client):
    # Creates org + 3 personnel (1 junior, 1 mid, 1 senior) with skills
    # Creates project with proposal text
    # Returns: org_id, project_id, personnel_ids

@pytest.fixture
async def setup_scenario(client, setup_org):
    # Creates scenario + 5 tasks with dependencies
    # Returns: scenario_id, task_ids
```

### Flow Test Pattern
```python
async def test_flow1_proposal_to_board(client, setup_org):
    # 1. POST /projects/{id}/analyze (mocked LLM in test env)
    # 2. Assert tasks created
    # 3. POST /scenarios/{id}/tasks/bulk
    # 4. GET /scenarios/{id}/tasks → verify tasks
    # Each step asserts correct status codes and data
```

## Acceptance Criteria
- [ ] All 5 flows: 100% test pass
- [ ] No mocks except LLM client (use fixture responses)
- [ ] Tests run in CI without external services
- [ ] uv run pytest tests/test_e2e_* -v passes
