# Design — PA-BE-002

## Files to Create

- `be/app/services/project_evaluation.py`
- `be/app/schemas/evaluation.py`
- `be/app/routers/evaluation.py`
- `be/tests/test_evaluation_service.py`

## Schemas

```python
# be/app/schemas/evaluation.py

AXIS_IDS = [
    "problem_solution_fit",     # weight 0.12
    "success_criterion_clarity", # weight 0.08
    "telos_composite",          # weight 0.15
    "quality_attribute_coverage", # weight 0.10
    "architecture_risk",        # weight 0.08
    "strategic_value",          # weight 0.12
    "financial_return",         # weight 0.10
    "technology_maturity",      # weight 0.12
    "organizational_readiness", # weight 0.07
    "legal_regulatory_readiness", # weight 0.06
]

DEFAULT_WEIGHTS: dict[str, float] = {
    "problem_solution_fit": 0.12,
    "success_criterion_clarity": 0.08,
    "telos_composite": 0.15,
    "quality_attribute_coverage": 0.10,
    "architecture_risk": 0.08,
    "strategic_value": 0.12,
    "financial_return": 0.10,
    "technology_maturity": 0.12,
    "organizational_readiness": 0.07,
    "legal_regulatory_readiness": 0.06,
}

class AxisScore(BaseModel):
    score: int = Field(ge=1, le=5)
    rationale: str = Field(min_length=10)
    assessor_id: UUID

class TelosBreakdown(BaseModel):
    technical: int = Field(ge=1, le=5)
    economic: int = Field(ge=1, le=5)
    legal: int = Field(ge=1, le=5)
    operational: int = Field(ge=1, le=5)
    schedule: int = Field(ge=1, le=5)

    @property
    def composite(self) -> float:
        return (self.technical + self.economic + self.legal
                + self.operational + self.schedule) / 5

class EvaluationUpdateRequest(BaseModel):
    axis_scores: dict[str, AxisScore] = {}
    telos_breakdown: TelosBreakdown | None = None

class RiskItem(BaseModel):
    axis_id: str
    score: int
    severity: Literal["critical", "warning"]  # 1 = critical, 2 = warning
    action_required: str
    owner_id: UUID | None = None

class EvaluationResponse(BaseModel):
    id: UUID
    project_id: UUID
    status: Literal["draft", "complete"]
    verdict: Literal["proceed", "conditional", "do_not_proceed"] | None
    composite_score: float | None
    axis_scores: dict[str, AxisScore]
    telos_breakdown: TelosBreakdown | None
    risk_register: list[RiskItem]
    created_at: datetime
    updated_at: datetime

class AiAssistRequest(BaseModel):
    axis_id: str
    proposal_text: str
    current_score: int | None = None

class AiAssistResponse(BaseModel):
    axis_id: str
    suggested_score: int
    reasoning: str
    questions_to_answer: list[str]  # follow-up questions to improve accuracy
    confidence: float
```

## Service Logic

```python
# be/app/services/project_evaluation.py

class ProjectEvaluationService:

    AXIS_WEIGHTS = DEFAULT_WEIGHTS

    def compute_verdict(self, eval: ProjectEvaluation) -> tuple[str, float, list[RiskItem]]:
        scores = {k: v["score"] for k, v in eval.axis_scores.items()}

        # Hard gate 1: any axis == 1 → do_not_proceed
        if any(s == 1 for s in scores.values()):
            return "do_not_proceed", self._composite(scores), self._build_risks(scores)

        # Hard gate 2: legal axis < 2
        if scores.get("legal_regulatory_readiness", 5) < 2:
            return "do_not_proceed", self._composite(scores), self._build_risks(scores)

        composite = self._composite(scores)

        if composite >= 4.0:
            verdict = "proceed"
        elif composite >= 3.0:
            verdict = "conditional"
        else:
            verdict = "do_not_proceed"

        return verdict, composite, self._build_risks(scores)

    def _composite(self, scores: dict[str, int]) -> float:
        total = sum(
            self.AXIS_WEIGHTS.get(axis, 0) * score
            for axis, score in scores.items()
        )
        return round(total, 2)

    def _build_risks(self, scores: dict[str, int]) -> list[RiskItem]:
        risks = []
        for axis, score in scores.items():
            if score <= 2:
                risks.append(RiskItem(
                    axis_id=axis,
                    score=score,
                    severity="critical" if score == 1 else "warning",
                    action_required=AXIS_ACTION_TEMPLATES[axis],
                ))
        return risks

    async def ai_assist_axis(
        self,
        axis_id: str,
        proposal_text: str,
        llm_service: LLMService
    ) -> AiAssistResponse:
        rubric = AXIS_RUBRICS[axis_id]  # full 1–5 rubric from knowledge base
        prompt = f"""
You are evaluating a software project proposal for the "{axis_id}" dimension.

RUBRIC:
{rubric}

PROJECT PROPOSAL:
{proposal_text}

Provide a JSON response with:
- suggested_score (1-5)
- reasoning (2-3 sentences citing specific evidence from the proposal)
- questions_to_answer (list of 2-3 follow-up questions that would help refine the score)
- confidence (0.0-1.0)
"""
        response = await llm_service.call(prompt, response_format="json")
        return AiAssistResponse(axis_id=axis_id, **response)
```

## API Endpoints

```python
# be/app/routers/evaluation.py

router = APIRouter(prefix="/projects/{project_id}", tags=["evaluation"])

@router.get("/evaluation", response_model=EvaluationResponse)
async def get_evaluation(project_id: UUID, db: AsyncSession = Depends(get_db)): ...

@router.post("/evaluation", response_model=EvaluationResponse, status_code=201)
async def create_evaluation(project_id: UUID, created_by: UUID, db: AsyncSession = Depends(get_db)):
    # Idempotent: return existing if already created
    ...

@router.patch("/evaluation", response_model=EvaluationResponse)
async def update_evaluation(
    project_id: UUID,
    body: EvaluationUpdateRequest,
    db: AsyncSession = Depends(get_db)
): ...

@router.post("/evaluation/finalize", response_model=EvaluationResponse)
async def finalize_evaluation(project_id: UUID, db: AsyncSession = Depends(get_db)):
    # Compute verdict → update projects.evaluation_status = 'complete'
    # If verdict == "proceed" or "conditional" → unlock project for Mode 3
    ...

@router.post("/evaluation/ai-assist", response_model=AiAssistResponse)
async def ai_assist(
    project_id: UUID,
    body: AiAssistRequest,
    llm: LLMService = Depends(get_llm_service)
): ...

@router.delete("/evaluation", status_code=204)
async def reset_evaluation(project_id: UUID, db: AsyncSession = Depends(get_db)):
    # Reset to draft, clear verdict and scores
    ...
```

## Acceptance Criteria

- [ ] `POST /projects/{id}/evaluation` creates evaluation (idempotent — second call returns existing)
- [ ] `PATCH /projects/{id}/evaluation` updates axis_scores and telos_breakdown
- [ ] `POST /projects/{id}/evaluation/finalize`:
  - [ ] axis with score=1 → verdict=`do_not_proceed` regardless of other scores
  - [ ] legal axis score < 2 → verdict=`do_not_proceed`
  - [ ] composite ≥ 4.0 → verdict=`proceed`
  - [ ] composite 3.0–3.9 → verdict=`conditional`
  - [ ] risk_register auto-populated for axes ≤ 2
  - [ ] `projects.evaluation_status` updated to `complete`
- [ ] `POST /projects/{id}/evaluation/ai-assist` calls LLM and returns valid AiAssistResponse
- [ ] `uv run pytest tests/test_evaluation_service.py` — all verdict logic cases covered
- [ ] `uv run mypy app` — 0 errors
