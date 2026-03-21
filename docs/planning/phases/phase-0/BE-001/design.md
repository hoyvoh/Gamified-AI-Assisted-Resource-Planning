# Design — BE-001

## Files to Create/Modify

- `be/app/algorithms/cocomo.py` — Core COCOMO II model
- `be/app/schemas/cocomo.py` — Input/output Pydantic models
- `be/tests/test_cocomo.py` — Unit tests

## Technical Design

### COCOMO II Post-Architecture Formula

```
PM = A × Size^E × ∏EM
```

Where:
- `PM` = Person-months of effort
- `A` = 2.94 (COCOMO II constant)
- `Size` = KSLOC or function points (converted)
- `E` = B + 0.01 × ΣSF (B = 0.91, SF = scale factors)
- `EM` = effort multipliers (reliability, complexity, team cohesion, etc.)

### Key Methods

```python
class CocomoService:
    def estimate_effort(
        self,
        size_points: float,
        scale_factors: dict[str, float],
        effort_multipliers: dict[str, float]
    ) -> float:
        # Returns: person-months

    def to_man_days(self, person_months: float) -> float:
        # 1 person-month = 21.67 working days (standard COCOMO)

    def breakdown_by_phase(self, total_days: float) -> EffortBreakdown:
        # Default split: investigate 10%, design 20%,
        # implement 40%, testing 20%, review/support 10%
```

### Schemas

```python
class CocomoInput(BaseModel):
    size_points: float
    scale_factors: dict[str, float] = {}
    effort_multipliers: dict[str, float] = {}

class EffortBreakdown(BaseModel):
    investigate_days: float
    design_days: float
    implement_days: float
    testing_days: float
    review_days: float
    support_days: float
    total_days: float
```

## Acceptance Criteria

- [ ] `estimate_effort(size_points=100, scale_factors={}, effort_multipliers={})` returns a known reference value (~2.94 PM for default params)
- [ ] `to_man_days(1.0)` returns 21.67
- [ ] `breakdown_by_phase(total)` — sum of all phases equals total
- [ ] 3 test cases with known input → expected output
- [ ] `uv run pytest tests/test_cocomo.py` passes
- [ ] `uv run mypy app` — 0 errors

## Notes

- COCOMO II is complex; for MVP, implement the simplified version first (just A × Size^B), then add effort multipliers in a follow-up
- Reference: Boehm et al. "Software Cost Estimation with COCOMO II" (2000)
