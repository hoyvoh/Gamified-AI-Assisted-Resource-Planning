import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from alembic import command
from alembic.config import Config
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.infrastructure.analysis.runner import cleanup_orphaned_runs
from app.infrastructure.db.seed import seed_role_profiles
from app.infrastructure.db.session import _session_factory
from app.interfaces.routers.analysis import router as analysis_router
from app.interfaces.routers.org import router as org_router
from app.interfaces.routers.profile import router as profile_router
from app.interfaces.routers.role_profiles import router as role_profiles_router

logging.getLogger("app").setLevel(logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # Apply any pending migrations before seeding
    alembic_cfg = Config("alembic.ini")
    command.upgrade(alembic_cfg, "head")

    async with _session_factory() as session:
        await seed_role_profiles(session)

    await cleanup_orphaned_runs()
    yield


app = FastAPI(
    title="Gamified Resource Planning API",
    version="0.1.0",
    description="API for gamified project resource planning.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(org_router)
app.include_router(role_profiles_router)
app.include_router(analysis_router)
app.include_router(profile_router)


@app.get("/health")
async def health() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "ok"}
