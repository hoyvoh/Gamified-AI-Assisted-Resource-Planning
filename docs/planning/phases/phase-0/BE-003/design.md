# Design — BE-003

## Files to Create/Modify

- `be/app/routers/orgs.py`
- `be/app/routers/personnel.py`
- `be/app/routers/projects.py`
- `be/app/schemas/org.py`
- `be/app/schemas/personnel.py`
- `be/app/schemas/project.py`
- `be/app/services/org_service.py`
- `be/app/services/personnel_service.py`
- `be/app/services/project_service.py`
- `be/app/repositories/org_repo.py`
- `be/app/repositories/personnel_repo.py`
- `be/app/repositories/project_repo.py`
- `be/app/main.py` — register routers
- `be/tests/test_orgs.py`
- `be/tests/test_personnel.py`
- `be/tests/test_projects.py`

## Technical Design

### API Endpoints

```
POST   /orgs                              → 201 OrgResponse
GET    /orgs/{org_id}                     → 200 OrgResponse

GET    /orgs/{org_id}/personnel           → 200 list[PersonnelResponse]
POST   /orgs/{org_id}/personnel           → 201 PersonnelResponse
GET    /orgs/{org_id}/personnel/{id}      → 200 PersonnelResponse
PATCH  /orgs/{org_id}/personnel/{id}      → 200 PersonnelResponse
POST   /orgs/{org_id}/personnel/{id}/skills → 200 PersonnelResponse

GET    /orgs/{org_id}/projects            → 200 list[ProjectResponse]
POST   /orgs/{org_id}/projects            → 201 ProjectResponse
GET    /projects/{project_id}             → 200 ProjectResponse
PATCH  /projects/{project_id}             → 200 ProjectResponse
```

### Clean Architecture Pattern

```python
# router — only orchestration
@router.post("/", response_model=PersonnelResponse, status_code=201)
async def create_personnel(body: PersonnelCreate, db: AsyncSession = Depends(get_db)) -> PersonnelResponse:
    return await personnel_service.create(db, body)

# service — business rules only
async def create(db: AsyncSession, data: PersonnelCreate) -> PersonnelResponse:
    if data.years_experience < 1 and data.seniority == Seniority.senior:
        raise ValueError("Cannot be senior with <1 year experience")
    return await personnel_repo.create(db, data)

# repository — DB queries only
async def create(db: AsyncSession, data: PersonnelCreate) -> Personnel:
    obj = Personnel(**data.model_dump())
    db.add(obj)
    await db.commit()
    return obj
```

## Acceptance Criteria

- [ ] `POST /orgs` creates org, `GET /orgs/{id}` returns it
- [ ] `POST /orgs/{id}/personnel` with skill_matrix creates personnel + skills
- [ ] `GET /orgs/{id}/personnel` returns paginated list
- [ ] `PATCH /orgs/{id}/personnel/{id}` partial update works
- [ ] `POST /orgs/{id}/projects` with raw_proposal stores text
- [ ] 404 for unknown IDs, 422 for invalid payload
- [ ] `uv run pytest tests/test_orgs.py tests/test_personnel.py tests/test_projects.py` passes
