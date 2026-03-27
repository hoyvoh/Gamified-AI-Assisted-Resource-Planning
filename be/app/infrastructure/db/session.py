"""Async SQLAlchemy session factory.

Produces AsyncSession instances backed by the database_url from Settings.
The engine and session factory are created once at import time and reused.

Usage in FastAPI (via dependency injection):
    async def get_session() -> AsyncGenerator[AsyncSession, None]:
        async with async_session() as session:
            yield session
"""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import settings

engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
)

async_session: async_sessionmaker[AsyncSession] = async_sessionmaker(
    engine,
    expire_on_commit=False,
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that yields a scoped AsyncSession per request."""
    async with async_session() as session:
        yield session
