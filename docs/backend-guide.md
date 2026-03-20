# Backend Guide

Stack: **Python 3.12 · FastAPI · Pydantic v2 · uv · Ruff · Mypy**

## Project Structure

```
be/
├── app/
│   ├── __init__.py
│   ├── main.py            # FastAPI app entry point, router registration
│   ├── routers/           # Route handlers grouped by domain
│   │   └── <domain>.py
│   ├── schemas/           # Pydantic request/response models
│   │   └── <domain>.py
│   ├── services/          # Business logic (no HTTP concerns)
│   │   └── <domain>.py
│   ├── repositories/      # Data access layer
│   │   └── <domain>.py
│   ├── models/            # SQLAlchemy ORM models (when DB is added)
│   │   └── <domain>.py
│   └── config.py          # Settings via pydantic-settings
├── tests/
│   ├── __init__.py
│   └── test_<domain>.py
├── .python-version        # 3.12
└── pyproject.toml
```

## Adding a New Domain

### 1. Schema (`app/schemas/<domain>.py`)

```python
from pydantic import BaseModel, Field


class ResourceBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    type: str


class ResourceCreate(ResourceBase):
    pass


class ResourceResponse(ResourceBase):
    id: int

    model_config = {"from_attributes": True}
```

### 2. Service (`app/services/<domain>.py`)

```python
from app.schemas.resource import ResourceCreate, ResourceResponse


def create_resource(data: ResourceCreate) -> ResourceResponse:
    # Business logic here — no FastAPI/HTTP imports
    ...
```

### 3. Router (`app/routers/<domain>.py`)

```python
from fastapi import APIRouter
from app.schemas.resource import ResourceCreate, ResourceResponse
from app.services import resource_service

router = APIRouter(prefix="/resources", tags=["resources"])


@router.post("/", response_model=ResourceResponse, status_code=201)
async def create_resource(body: ResourceCreate) -> ResourceResponse:
    return resource_service.create_resource(body)


@router.get("/{resource_id}", response_model=ResourceResponse)
async def get_resource(resource_id: int) -> ResourceResponse:
    ...
```

### 4. Register in `app/main.py`

```python
from app.routers import resource_router

app.include_router(resource_router.router)
```

### 5. Test (`tests/test_<domain>.py`)

```python
import pytest
from httpx import AsyncClient


async def test_create_resource(client: AsyncClient) -> None:
    response = await client.post("/resources/", json={"name": "Python", "type": "SKILL"})
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Python"
```

## Settings

Use `pydantic-settings` for environment-based config:

```python
# app/config.py
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./dev.db"
    secret_key: str = "change-me"
    debug: bool = False

    model_config = {"env_file": ".env"}


settings = Settings()
```

## Rules

- **Strict mypy** — no `Any`, no `# type: ignore` without comment
- **Pydantic v2** — use `model_config` not `class Config`
- **Async first** — `async def` for all route handlers
- **No logic in routers** — routers call services, services call repos
- **Test via ASGI transport** — never spin up a real server in tests
- **Ruff** replaces black + isort + flake8 — one tool, one config

## Running

```bash
# Dev server with auto-reload
uv run uvicorn app.main:app --reload --port 8000

# Production
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## Dependency Management

```bash
# Add a production dependency
uv add <package>

# Add a dev dependency
uv add --group dev <package>

# Remove
uv remove <package>

# Upgrade all
uv sync --upgrade
```
