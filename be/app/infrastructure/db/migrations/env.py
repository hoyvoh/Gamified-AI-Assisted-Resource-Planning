"""Alembic environment configuration.

Uses synchronous SQLite (via the database_url from Settings with aiosqlite
swapped to the sync driver) so Alembic's synchronous migration runner works
without any async adapter shim.

For PostgreSQL: database_url uses asyncpg; we swap it to psycopg2 here.
"""

import re
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

from app.config import settings
from app.infrastructure.db.base import Base

# Alembic reads logging config from alembic.ini
config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Import all models so Base.metadata is populated before autogenerate runs.
import app.infrastructure.db.models  # noqa: F401, E402

target_metadata = Base.metadata

# ---------------------------------------------------------------------------
# Convert async database_url to sync for Alembic's synchronous engine.
# aiosqlite → sqlite, asyncpg → postgresql+psycopg2
# ---------------------------------------------------------------------------
_ASYNC_DRIVER_RE = re.compile(r"\+aiosqlite|\+asyncpg")


def _sync_url(url: str) -> str:
    return _ASYNC_DRIVER_RE.sub("", url)


def run_migrations_offline() -> None:
    """Run migrations without a live DB connection (generates SQL script)."""
    context.configure(
        url=_sync_url(settings.database_url),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        render_as_batch=True,  # Required for SQLite ALTER TABLE support
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations against a live DB connection."""
    cfg = config.get_section(config.config_ini_section, {})
    cfg["sqlalchemy.url"] = _sync_url(settings.database_url)

    connectable = engine_from_config(
        cfg,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            render_as_batch=True,  # Required for SQLite ALTER TABLE support
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
