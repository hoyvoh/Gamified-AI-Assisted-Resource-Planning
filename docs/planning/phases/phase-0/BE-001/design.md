# Design — BE-001 — COCOMO II Estimation Engine

> Architecture layer: **Domain** (pure business logic, zero framework imports).
> See [backend-guide.md](../../../../guides/backend-guide.md) for layer rules and DI wiring patterns.

---

## Files

| File | Layer | Purpose |
|------|-------|---------|
| `be/app/domain/estimation/value_objects.py` | Domain | `PersonMonths`, `ManDays`, `PhaseRatios`, `EffortBreakdown` |
| `be/app/domain/estimation/cocomo.py` | Domain | `CocomoEngine` — pure estimation logic |
| `be/app/interfaces/schemas/cocomo.py` | Interface | `CocomoInput`, `CocomoResponse` Pydantic models for HTTP consumers |
| `be/app/config.py` | Config | `Settings` — COCOMO constants, DB URL, LLM keys |
| `be/tests/domain/test_cocomo.py` | Test | Pure unit tests, no DB, no HTTP |

> `config.py` is created here as it is a shared prerequisite for all backend tickets.

---

## Business Logic

### COCOMO II Post-Architecture Formula

```
PM = A × Size^E × ∏EM
```

| Variable | Meaning | Default |
|----------|---------|---------|
| `PM` | Effort in person-months | — |
| `A` | Calibration constant | **2.94** |
| `Size` | Project size in story points or KSLOC | provided by caller |
| `E` | Scaling exponent = `B + 0.01 × Σ(SF values)` | B = **0.91** |
| `∏EM` | Product of all effort multipliers | **1.0** (neutral) when none provided |

`A` and `B` are configurable in `Settings` (`cocomo_a`, `cocomo_b`) so they can be tuned per organisation without code changes.

---

### Scale Factors (SF)

Scale factors adjust the exponent `E`, capturing how project context speeds up or slows down growth of effort with size. The caller passes **pre-looked-up weight values** from the COCOMO II standard tables.

| Factor | Key | What it captures |
|--------|-----|-----------------|
| Precedentedness | `PREC` | How familiar is the team with this type of system? |
| Development Flexibility | `FLEX` | How rigid are requirements and external constraints? |
| Risk Resolution | `RESL` | How thoroughly has architecture risk been resolved? |
| Team Cohesion | `TEAM` | How well does the team work together? |
| Process Maturity | `PMAT` | CMMI process maturity of the organisation |

Each factor's weight ranges from **0.00** (Extra High, most favorable) to **7.80** (Very Low, least favorable), based on the COCOMO II standard lookup tables.

When no scale factors are provided, `E = B = 0.91` (baseline exponent, best-case scaling).

---

### Effort Multipliers (EM)

Effort multipliers adjust the raw PM value up or down based on product, platform, personnel, and project factors. The caller passes the **actual multiplier float** for each relevant factor (nominal = 1.0, values above 1.0 increase effort, below 1.0 decrease it).

Common multipliers: `RELY` (required reliability), `CPLX` (complexity), `ACAP` (analyst capability), `TOOL` (tool use), `SCED` (schedule constraint).

When no multipliers are provided, the product `∏EM = 1.0` (no adjustment).

---

### Conversion: Person-Months → Man-Days

```
1 person-month = 21.67 working days
```

This is the COCOMO II standard (based on a 260-day work year / 12 months).

---

### Phase Breakdown

Total man-days are distributed across 6 subtask phases:

| Phase | Default Ratio | Rationale |
|-------|--------------|-----------|
| Investigate | 10% | Requirements clarification, spike research |
| Design | 15% | Architecture, DB design, API contracts |
| Implement | 40% | Core development |
| Testing | 20% | Unit, integration, manual testing |
| Review / Feedback | 10% | Code review, stakeholder feedback cycles |
| Support / Release | 5% | Deployment support, rollback readiness |

The ratios are **configurable per task** — the caller may pass custom `PhaseRatios`. The constraint: all six ratios must sum exactly to **1.0**.

---

## Configuration Strategy

Two types of configurable values — kept separate by design:

| Type | Where | Why |
|------|-------|-----|
| COCOMO constants (A, B, working_days_per_month) | `config/default.yaml` | System-wide, changes only on org recalibration. Overridable via env vars (CI/prod). |
| Phase ratios (investigate/design/implement/...) | Database (`organizations.default_phase_ratios`, `projects.phase_ratios_override`) | Business decision per org/project. A research project has a very different breakdown than a pure implementation sprint. |

**Resolution order for phase ratios at runtime:**
```
project.phase_ratios_override  (if set)
  → org.default_phase_ratios   (if set)
  → PhaseRatios() hardcoded fallback
```

**Resolution order for COCOMO constants:**
```
Environment variable  (COCOMO__A=3.1)
  → config/local.yaml  (gitignored, local dev)
  → config/default.yaml  (committed defaults)
```

## Configuration (`be/app/config.py`)

Full `Settings` class covering all backend needs (not just COCOMO). Added here as it underpins all future BE tickets.

| Key | Default | Description |
|-----|---------|-------------|
| `database_url` | `sqlite+aiosqlite:///./dev.db` | SQLite for dev; swap to PostgreSQL via env var only |
| `secret_key` | `"change-me"` | JWT / session secret |
| `debug` | `False` | FastAPI debug mode |
| `cocomo_a` | `2.94` | COCOMO II calibration constant A |
| `cocomo_b` | `0.91` | COCOMO II scaling exponent base B |
| `anthropic_api_key` | `None` | LLM (Anthropic Claude) |
| `openai_api_key` | `None` | LLM (OpenAI fallback) |
| `llm_provider` | `"anthropic"` | Which LLM client to use |
| `llm_model` | `"claude-sonnet-4-6"` | Model ID |
| `ga_population` | `100` | Genetic algorithm population size |
| `ga_generations` | `500` | Genetic algorithm generation count |

Loaded from `.env` file via `pydantic-settings`.

---

## Acceptance Criteria

- [ ] `estimate_effort(size_points=1.0)` with no scale factors and no effort multipliers returns exactly **2.94 PM** (reference: A × 1^B × 1 = A)
- [ ] `estimate_effort(size_points=10.0)` with no scale factors returns **≈ 23.90 PM** (2.94 × 10^0.91)
- [ ] `estimate_effort` with scale factor `PREC=3.72` increases E from 0.91 to 0.9472 and produces a higher PM than the no-SF baseline for same size
- [ ] `to_man_days(PersonMonths(1.0))` returns exactly **21.67 man-days**
- [ ] `breakdown_by_phase(ManDays(100.0))` — sum of all six phase values equals 100.0
- [ ] `breakdown_by_phase` with custom `PhaseRatios` respects the provided ratios
- [ ] Passing `size_points ≤ 0` raises `ValueError`
- [ ] Passing `PhaseRatios` that do not sum to 1.0 raises `ValueError`
- [ ] `uv run pytest tests/domain/test_cocomo.py` — all tests pass
- [ ] `uv run mypy app` — 0 errors
- [ ] `uv run ruff check .` — 0 errors
