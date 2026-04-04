from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.infrastructure.db.seed import seed_role_profiles
from app.infrastructure.db.session import _session_factory
from app.interfaces.routers.analysis import router as analysis_router
from app.interfaces.routers.org import router as org_router
from app.interfaces.routers.profile import router as profile_router
from app.interfaces.routers.role_profiles import router as role_profiles_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    async with _session_factory() as session:
        await seed_role_profiles(session)
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
