# Design — PA-BE-001

## Files to Create/Modify

- `be/app/models/analysis.py` — ProjectEvaluation, PersonnelProfile, ProjectTeamMatch ORM models
- `be/alembic/versions/002_analysis_modules.py` — migration
- `be/app/models/org.py` — update User.role enum (add `bod`)
- `be/app/models/personnel.py` — add new columns to Personnel, SkillMatrixEntry
- `be/app/models/project.py` — add evaluation_id FK, evaluation_status to Project
- `be/tests/test_analysis_schema.py` — smoke tests

## Technical Design

### New Models

```python
# be/app/models/analysis.py

class ProjectEvaluation(Base):
    __tablename__ = "project_evaluations"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    project_id: Mapped[UUID] = mapped_column(ForeignKey("projects.id"), unique=True)
    status: Mapped[str] = mapped_column(
        Enum("draft", "complete", name="evaluation_status_enum"),
        default="draft"
    )
    verdict: Mapped[str | None] = mapped_column(
        Enum("proceed", "conditional", "do_not_proceed", name="verdict_enum"),
        nullable=True
    )
    composite_score: Mapped[Decimal | None] = mapped_column(Numeric(3, 2), nullable=True)
    axis_scores: Mapped[dict] = mapped_column(JSONB, default=dict)
    telos_breakdown: Mapped[dict] = mapped_column(JSONB, default=dict)
    risk_register: Mapped[list] = mapped_column(JSONB, default=list)
    axis_weights: Mapped[dict] = mapped_column(JSONB, default=dict)
    llm_session_id: Mapped[UUID | None] = mapped_column(ForeignKey("llm_sessions.id"), nullable=True)
    created_by: Mapped[UUID] = mapped_column(ForeignKey("users.id"))
    updated_by: Mapped[UUID | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMPTZ, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(TIMESTAMPTZ, default=func.now(), onupdate=func.now())


class PersonnelProfile(Base):
    __tablename__ = "personnel_profiles"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    personnel_id: Mapped[UUID] = mapped_column(ForeignKey("personnel.id"), unique=True)
    profile_version: Mapped[str] = mapped_column(String(20))  # ISO date
    data_period_from: Mapped[date] = mapped_column(Date)
    data_period_to: Mapped[date] = mapped_column(Date)
    corpus_size: Mapped[int] = mapped_column(Integer, default=0)
    ocean_scores: Mapped[dict] = mapped_column(JSONB, default=dict)
    behavioral_prefs: Mapped[dict] = mapped_column(JSONB, default=dict)
    tech_capability: Mapped[dict] = mapped_column(JSONB, default=dict)
    soft_skills: Mapped[dict] = mapped_column(JSONB, default=dict)
    performance: Mapped[dict] = mapped_column(JSONB, default=dict)
    wfu_factors: Mapped[dict] = mapped_column(JSONB, default=dict)
    flags: Mapped[list] = mapped_column(JSONB, default=list)
    github_repos_analyzed: Mapped[list] = mapped_column(JSONB, default=list)
    synced_at: Mapped[datetime] = mapped_column(TIMESTAMPTZ, default=func.now())
    created_at: Mapped[datetime] = mapped_column(TIMESTAMPTZ, default=func.now())


class ProjectTeamMatch(Base):
    __tablename__ = "project_team_matches"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    project_id: Mapped[UUID] = mapped_column(ForeignKey("projects.id"))
    personnel_id: Mapped[UUID] = mapped_column(ForeignKey("personnel.id"))
    match_score: Mapped[Decimal] = mapped_column(Numeric(4, 3))
    skill_coverage_score: Mapped[Decimal] = mapped_column(Numeric(4, 3))
    ocean_fit_score: Mapped[Decimal] = mapped_column(Numeric(4, 3))
    growth_opportunity_score: Mapped[Decimal] = mapped_column(Numeric(4, 3))
    effective_wfu_estimate: Mapped[Decimal] = mapped_column(Numeric(4, 2))
    match_details: Mapped[dict] = mapped_column(JSONB, default=dict)
    computed_at: Mapped[datetime] = mapped_column(TIMESTAMPTZ, default=func.now())
```

### Migration

```python
# be/alembic/versions/002_analysis_modules.py

def upgrade():
    # New enum types
    op.execute("CREATE TYPE evaluation_status_enum AS ENUM ('draft', 'complete')")
    op.execute("CREATE TYPE verdict_enum AS ENUM ('proceed', 'conditional', 'do_not_proceed')")
    op.execute("CREATE TYPE eval_project_status_enum AS ENUM ('not_started', 'in_progress', 'complete', 'waived')")

    # project_evaluations table
    op.create_table("project_evaluations", ...)

    # personnel_profiles table
    op.create_table("personnel_profiles", ...)

    # project_team_matches table
    op.create_table("project_team_matches", ...)

    # Add columns to existing tables
    op.add_column("personnel", sa.Column("dreyfus_level", sa.SmallInteger, nullable=True))
    op.add_column("personnel", sa.Column("github_username", sa.String(100), nullable=True))
    op.add_column("personnel", sa.Column("profile_last_synced_at", TIMESTAMPTZ, nullable=True))
    op.add_column("skill_matrix_entries", sa.Column("dreyfus_level", sa.SmallInteger, default=3))
    op.add_column("projects", sa.Column("evaluation_id", UUID(as_uuid=True),
                  sa.ForeignKey("project_evaluations.id"), nullable=True))
    op.add_column("projects", sa.Column("evaluation_status",
                  sa.Enum("not_started", "in_progress", "complete", "waived",
                          name="eval_project_status_enum"),
                  default="not_started"))

    # Indexes
    op.create_index("idx_project_evaluations_project", "project_evaluations", ["project_id"], unique=True)
    op.create_index("idx_personnel_profiles_personnel", "personnel_profiles", ["personnel_id"], unique=True)
    op.create_index("idx_team_matches_project", "project_team_matches", ["project_id", "match_score"])
```

## Acceptance Criteria

- [ ] `uv run alembic upgrade head` succeeds (both migrations: 001 then 002)
- [ ] `uv run alembic downgrade -1` reverts 002 cleanly
- [ ] All 3 new tables exist with correct columns and constraints
- [ ] `personnel.dreyfus_level` accepts NULL and integers 1–5
- [ ] `uv run pytest tests/test_analysis_schema.py` — insert/select smoke tests pass
- [ ] `uv run mypy app` — 0 errors
