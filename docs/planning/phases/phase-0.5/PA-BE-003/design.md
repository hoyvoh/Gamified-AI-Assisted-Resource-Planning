# Design — PA-BE-003

## Files to Create

- `be/app/services/personnel_profile.py`
- `be/app/services/team_match.py`
- `be/app/schemas/personnel_profile.py`
- `be/app/routers/personnel_profile.py`
- `be/tests/test_personnel_profile_service.py`
- `be/tests/test_team_match_service.py`

## Schemas

```python
# be/app/schemas/personnel_profile.py

class OceanScores(BaseModel):
    openness: float = Field(ge=0.0, le=1.0)
    conscientiousness: float = Field(ge=0.0, le=1.0)
    extraversion: float = Field(ge=0.0, le=1.0)
    agreeableness: float = Field(ge=0.0, le=1.0)
    neuroticism: float = Field(ge=0.0, le=1.0)
    confidence: float = Field(ge=0.0, le=1.0)   # inference confidence
    inferred_from_corpus_size: int


class BehavioralPrefs(BaseModel):
    communication_style: str          # e.g. "async-first", "sync-heavy"
    decision_style: str               # e.g. "data-driven", "intuition"
    collaboration_mode: str           # e.g. "solo", "pair", "mob"
    conflict_approach: str
    learning_style: str


class TechCapability(BaseModel):
    languages: dict[str, int]         # lang -> dreyfus_level (1-5)
    frameworks: dict[str, int]
    domains: dict[str, int]           # e.g. {"distributed-systems": 4}
    dreyfus_overall: int = Field(ge=1, le=5)
    dora_metrics: dict[str, float]    # deployment_freq, lead_time, mttr, change_fail_rate


class SoftSkills(BaseModel):
    leadership: int = Field(ge=1, le=5)
    mentoring: int = Field(ge=1, le=5)
    documentation: int = Field(ge=1, le=5)
    code_review_quality: int = Field(ge=1, le=5)
    estimation_accuracy: float        # ratio: estimated/actual hours, historical


class PerformanceData(BaseModel):
    on_time_delivery_rate: float      # 0.0–1.0
    defect_density: float             # bugs per 1k LOC
    review_acceptance_rate: float     # PRs merged / PRs opened
    velocity_consistency: float       # stddev of sprint velocity (lower = better)
    last_12_months_projects: int


class WFUFactors(BaseModel):
    base_wfu: float
    project_familiarity_factor: float
    technology_match_factor: float
    quality_history_factor: float
    delivery_reliability_factor: float
    effective_wfu: float              # computed: product of all factors


class PersonnelProfileResponse(BaseModel):
    id: UUID
    personnel_id: UUID
    profile_version: str
    data_period_from: date
    data_period_to: date
    corpus_size: int
    ocean_scores: OceanScores
    behavioral_prefs: BehavioralPrefs
    tech_capability: TechCapability
    soft_skills: SoftSkills
    performance: PerformanceData
    wfu_factors: WFUFactors | None
    flags: list[str]
    github_repos_analyzed: list[str]
    synced_at: datetime
    created_at: datetime


class ProfileRefreshRequest(BaseModel):
    github_repos: list[str] = Field(min_length=1)
    data_period_from: date
    data_period_to: date


class PersonnelMatchScore(BaseModel):
    personnel_id: UUID
    full_name: str
    match_score: float = Field(ge=0.0, le=1.0)
    skill_coverage_score: float = Field(ge=0.0, le=1.0)
    ocean_fit_score: float = Field(ge=0.0, le=1.0)
    growth_opportunity_score: float = Field(ge=0.0, le=1.0)
    effective_wfu_estimate: float
    match_details: dict


class TeamConfiguration(BaseModel):
    rank: int
    personnel_ids: list[UUID]
    team_match_score: float
    estimated_wfu_budget: float
    skill_coverage_pct: float         # % of required skills covered
    ocean_balance_score: float
    rationale: str


class TeamMatchResponse(BaseModel):
    project_id: UUID
    computed_at: datetime
    individual_matches: list[PersonnelMatchScore]
    recommendations: list[TeamConfiguration]
```

## Service Logic

```python
# be/app/services/personnel_profile.py

class PersonnelProfileService:

    async def get_profile(
        self,
        personnel_id: UUID,
        db: AsyncSession
    ) -> PersonnelProfile:
        profile = await db.get(PersonnelProfile, personnel_id, with_for_update=False)
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        return profile

    async def refresh_profile(
        self,
        personnel_id: UUID,
        request: ProfileRefreshRequest,
        db: AsyncSession,
        llm_service: LLMService
    ) -> PersonnelProfile:
        # 1. Fetch GitHub commit/PR data via gh CLI wrapper (stub for now)
        # 2. Extract text signals (commit messages, PR descriptions, review comments)
        # 3. Call LLM to infer OCEAN scores from text corpus
        # 4. Compute DORA metrics from merge timestamps
        # 5. Upsert PersonnelProfile record
        ...

    def compute_wfu_factors(
        self,
        profile: PersonnelProfile,
        project: Project
    ) -> WFUFactors:
        base = profile.wfu_factors.get("base_wfu", 1.0)
        pf = self._project_familiarity(profile, project)
        tm = self._technology_match(profile, project)
        qh = self._quality_history(profile)
        dr = self._delivery_reliability(profile)
        effective = round(base * pf * tm * qh * dr, 3)
        return WFUFactors(
            base_wfu=base,
            project_familiarity_factor=pf,
            technology_match_factor=tm,
            quality_history_factor=qh,
            delivery_reliability_factor=dr,
            effective_wfu=effective,
        )

    def _project_familiarity(self, profile, project) -> float:
        # 0.8–1.2 based on domain overlap between profile.tech_capability.domains
        # and project required skills
        ...

    def _technology_match(self, profile, project) -> float:
        # ratio of required tech stack covered at dreyfus >= 3
        ...

    def _quality_history(self, profile) -> float:
        # 0.85–1.15 based on defect_density and review_acceptance_rate
        ...

    def _delivery_reliability(self, profile) -> float:
        # 0.85–1.15 based on on_time_delivery_rate
        ...
```

```python
# be/app/services/team_match.py

import numpy as np
from itertools import combinations

MATCH_WEIGHTS = {
    "skill_coverage": 0.40,
    "ocean_fit": 0.25,
    "growth_opportunity": 0.20,
    "wfu_feasibility": 0.15,
}

class TeamMatchService:

    def compute_individual_matches(
        self,
        project: Project,
        evaluation: ProjectEvaluation,
        personnel_profiles: list[tuple[Personnel, PersonnelProfile]],
        profile_service: PersonnelProfileService,
    ) -> list[PersonnelMatchScore]:
        results = []
        required_vector = self._build_required_vector(project, evaluation)

        for person, profile in personnel_profiles:
            skill_cov = self._skill_coverage(profile, required_vector)
            ocean_fit = self._ocean_team_fit(profile, personnel_profiles)
            growth = self._growth_opportunity(profile, required_vector)
            wfu = profile_service.compute_wfu_factors(profile, project).effective_wfu

            # WFU feasibility: penalize if wfu < 0.5 (too junior/unavailable)
            wfu_score = min(wfu / 1.0, 1.0)

            composite = (
                MATCH_WEIGHTS["skill_coverage"] * skill_cov
                + MATCH_WEIGHTS["ocean_fit"] * ocean_fit
                + MATCH_WEIGHTS["growth_opportunity"] * growth
                + MATCH_WEIGHTS["wfu_feasibility"] * wfu_score
            )
            results.append(PersonnelMatchScore(
                personnel_id=person.id,
                full_name=person.full_name,
                match_score=round(composite, 3),
                skill_coverage_score=round(skill_cov, 3),
                ocean_fit_score=round(ocean_fit, 3),
                growth_opportunity_score=round(growth, 3),
                effective_wfu_estimate=round(wfu, 3),
                match_details={},
            ))
        return sorted(results, key=lambda x: x.match_score, reverse=True)

    def recommend_teams(
        self,
        matches: list[PersonnelMatchScore],
        project: Project,
        n_recommendations: int = 3,
        max_team_size: int = 8,
    ) -> list[TeamConfiguration]:
        # Use top-20 candidates to limit combination space
        top_candidates = matches[:20]
        required_size = project.required_team_size or 5

        best_teams = []
        for combo in combinations(top_candidates, min(required_size, len(top_candidates))):
            team_score = self._team_composite_score(combo, project)
            best_teams.append((combo, team_score))

        best_teams.sort(key=lambda x: x[1], reverse=True)
        configs = []
        for rank, (combo, score) in enumerate(best_teams[:n_recommendations], start=1):
            configs.append(TeamConfiguration(
                rank=rank,
                personnel_ids=[m.personnel_id for m in combo],
                team_match_score=round(score, 3),
                estimated_wfu_budget=round(sum(m.effective_wfu_estimate for m in combo), 2),
                skill_coverage_pct=self._team_skill_coverage(combo, project),
                ocean_balance_score=self._ocean_balance(combo),
                rationale=self._generate_rationale(combo, score),
            ))
        return configs

    def _skill_coverage(self, profile: PersonnelProfile, required_vector: np.ndarray) -> float:
        # Cosine similarity between profile skill vector and required skill vector
        profile_vector = self._build_profile_vector(profile)
        if np.linalg.norm(profile_vector) == 0 or np.linalg.norm(required_vector) == 0:
            return 0.0
        return float(np.dot(profile_vector, required_vector) / (
            np.linalg.norm(profile_vector) * np.linalg.norm(required_vector)
        ))

    def _ocean_team_fit(self, profile: PersonnelProfile, all_profiles) -> float:
        # High conscientiousness (>=0.6) and emotional stability (neuroticism <=0.4) → bonus
        ocean = profile.ocean_scores
        score = 0.0
        if ocean.get("conscientiousness", 0) >= 0.6:
            score += 0.5
        if ocean.get("neuroticism", 1.0) <= 0.4:
            score += 0.5
        return score

    def _growth_opportunity(self, profile: PersonnelProfile, required_vector: np.ndarray) -> float:
        # High growth if 30–60% of required skills are in range (dreyfus 2–3)
        # Penalize if >80% gap (too junior) or 0% gap (no growth)
        ...

    def _team_composite_score(self, combo, project) -> float:
        avg_match = sum(m.match_score for m in combo) / len(combo)
        coverage = self._team_skill_coverage(combo, project)
        balance = self._ocean_balance(combo)
        return avg_match * 0.5 + coverage * 0.3 + balance * 0.2

    def _ocean_balance(self, combo) -> float:
        # Reward diversity in extraversion, penalize all-high-neuroticism teams
        ...

    def _build_required_vector(self, project, evaluation) -> np.ndarray:
        # Build skill vector from project.required_skills + evaluation.axis_scores context
        ...

    def _build_profile_vector(self, profile: PersonnelProfile) -> np.ndarray:
        # Flatten tech_capability.languages + frameworks + domains into numeric vector
        ...

    def _team_skill_coverage(self, combo, project) -> float:
        # Union of all individual skill vectors / required vector
        ...

    def _generate_rationale(self, combo, score) -> str:
        ...
```

## API Endpoints

```python
# be/app/routers/personnel_profile.py

profile_router = APIRouter(prefix="/personnel/{personnel_id}", tags=["personnel-profile"])
team_router = APIRouter(prefix="/projects/{project_id}", tags=["team-match"])

@profile_router.get("/profile", response_model=PersonnelProfileResponse)
async def get_profile(
    personnel_id: UUID,
    db: AsyncSession = Depends(get_db)
): ...

@profile_router.post("/profile/refresh", response_model=PersonnelProfileResponse)
async def refresh_profile(
    personnel_id: UUID,
    body: ProfileRefreshRequest,
    db: AsyncSession = Depends(get_db),
    llm: LLMService = Depends(get_llm_service)
): ...  # Triggers GitHub data pull + LLM inference

@team_router.post("/team-match", response_model=TeamMatchResponse)
async def compute_team_match(
    project_id: UUID,
    db: AsyncSession = Depends(get_db)
): ...  # Computes all individual scores + top-3 recommendations

@team_router.get("/team-match/recommendations", response_model=list[TeamConfiguration])
async def get_recommendations(
    project_id: UUID,
    db: AsyncSession = Depends(get_db)
): ...  # Returns cached recommendations from last team-match run
```

## Acceptance Criteria

- [ ] `GET /personnel/{id}/profile` returns profile or 404 if not found
- [ ] `POST /personnel/{id}/profile/refresh` triggers profile upsert
- [ ] `POST /projects/{id}/team-match`:
  - [ ] Returns individual match scores for all active personnel with profiles
  - [ ] `match_score` reflects weighted composite (skill_coverage 40%, ocean_fit 25%, growth 20%, wfu 15%)
  - [ ] Top-3 team configurations returned in `recommendations`
  - [ ] Each configuration includes `estimated_wfu_budget` and `skill_coverage_pct`
- [ ] `PersonnelProfileService.compute_wfu_factors` returns product of all 4 multiplier factors
- [ ] `TeamMatchService._skill_coverage` uses cosine similarity (verified by unit test with known vectors)
- [ ] `uv run pytest tests/test_personnel_profile_service.py tests/test_team_match_service.py` — all cases covered
- [ ] `uv run mypy app` — 0 errors
