# Design — BE-008

## Files to Create/Modify
- be/app/llm/prompts/risk_analysis.py
- be/app/routers/scenarios.py — add /risk-analysis route
- be/app/services/risk_analysis_service.py
- be/app/schemas/risk.py
- be/tests/test_risk_analysis.py

## Technical Design

### Risk Schema
```python
class Risk(BaseModel):
    type: str              # e.g. "timeline", "technical", "resource"
    description: str
    probability: Literal["low", "medium", "high"]
    impact: Literal["low", "medium", "high"]
    affected_tasks: list[UUID]
    mitigation: str

class RiskAnalysisResponse(BaseModel):
    risks: list[Risk]
    overall_assessment: str
    session_id: UUID
```

### Context Builder
Builds prompt context including:
- Project deadline and current estimated completion
- All tasks with status, effort, assignments
- Active warnings (capacity, time_risk, etc.)
- Team skill matrix summary
- Critical path tasks

## Acceptance Criteria
- [ ] POST /scenarios/{id}/risk-analysis → list of structured risks
- [ ] Each risk has type, probability, impact, mitigation
- [ ] Context includes warnings + critical path info
- [ ] Session logged to llm_sessions
- [ ] uv run pytest tests/test_risk_analysis.py passes
