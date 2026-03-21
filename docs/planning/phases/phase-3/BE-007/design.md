# Design — BE-007

## Files to Create/Modify
- be/app/llm/__init__.py
- be/app/llm/service.py — LLMService class
- be/app/llm/prompts/task_generation.py — prompt template
- be/app/routers/analysis.py — /analyze endpoint
- be/app/services/project_analysis_service.py
- be/app/schemas/analysis.py — TaskDraft schema
- be/tests/test_llm_service.py — mocked LLM calls
- be/pyproject.toml — add: anthropic

## Technical Design

### LLMService
```python
class LLMService:
    def __init__(self, settings: Settings):
        self.client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
        self.model = settings.llm_model  # claude-sonnet-4-6

    async def analyze_project(self, proposal: str, context: ProjectContext) -> list[TaskDraft]:
        prompt = build_task_generation_prompt(proposal, context)
        response = await self.client.messages.create(
            model=self.model,
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}]
        )
        return parse_task_response(response.content[0].text)
```

### Prompt Template (task_generation.py)
The prompt instructs Claude to:
1. Analyze the proposal
2. Identify tasks with: name, description, category, tech_stacks[], effort_breakdown{}, dependencies[], priority
3. Return as valid JSON array

### Response Parsing
```python
def parse_task_response(text: str) -> list[TaskDraft]:
    # Extract JSON from LLM response (may have surrounding text)
    # Validate each task with TaskDraft Pydantic model
    # Log to llm_sessions
```

## Acceptance Criteria
- [ ] POST /projects/{id}/analyze with proposal text → returns task list
- [ ] Each task has: name, category, tech_stacks, effort_breakdown, priority
- [ ] LLM unavailable → 503 with {"error": "LLM_UNAVAILABLE", "message": "..."}
- [ ] All sessions logged to llm_sessions table
- [ ] Tests mock anthropic client, verify parsing logic
- [ ] uv run pytest tests/test_llm_service.py passes
