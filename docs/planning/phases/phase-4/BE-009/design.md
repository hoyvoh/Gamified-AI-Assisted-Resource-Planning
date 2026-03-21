# Design — BE-009

## Files to Create/Modify
- be/app/algorithms/genetic.py — GA implementation
- be/app/routers/scenarios.py — add /optimize route
- be/app/schemas/optimization.py — OptimizationRequest, OptimizationSolution
- be/app/services/optimization_service.py
- be/tests/test_genetic.py

## Technical Design

### Chromosome Representation
Each chromosome is a matrix: tasks × personnel, values = allocation_pct (0 or a valid %).
```python
# chromosome[task_idx][person_idx] = allocation_pct (0-100)
# Valid chromosome: each task has at least 1 person assigned
# Person daily total across all tasks <= 7h
```

### Genetic Algorithm
```python
class GeneticOptimizer:
    population_size: int = 100
    generations: int = 500
    crossover_rate: float = 0.8
    mutation_rate: float = 0.1

    def optimize(self, scenario_id, mode) -> list[OptimizationSolution]:
        population = self._initialize(scenario)
        for gen in range(self.generations):
            fitness = [self._evaluate(c, mode) for c in population]
            selected = self._tournament_select(population, fitness)
            offspring = self._crossover(selected)
            population = self._mutate(offspring)
            population = self._enforce_constraints(population)
        return self._top_k(population, fitness, k=3)
```

### Fitness Functions
```python
def makespan_fitness(chromosome, tasks, deps) -> float:
    # Simulate schedule with CPM → return total duration in days

def budget_fitness(chromosome, personnel) -> float:
    # Sum of (days_assigned × hourly_cost × 8) for each person
```

### OptimizationSolution
```python
class OptimizationSolution(BaseModel):
    rank: int
    score: float
    improvement_pct: float   # vs current assignment
    makespan_days: float
    total_cost: float
    assignments: list[AssignmentProposal]
    warnings: list[Warning]  # any remaining warnings in this solution
```

## Acceptance Criteria
- [ ] POST /scenarios/{id}/optimize with mode=makespan returns 3 solutions
- [ ] POST with mode=budget returns 3 solutions
- [ ] Each solution has no capacity violations (all persons ≤7h/day)
- [ ] Junior-alone constraint respected
- [ ] Optimized makespan <= current makespan (at least same or better)
- [ ] uv run pytest tests/test_genetic.py passes
