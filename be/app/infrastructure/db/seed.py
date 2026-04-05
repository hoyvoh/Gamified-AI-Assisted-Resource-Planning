"""Seed role_profiles table with standard roles. Idempotent."""

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.org.entities import RoleProfile
from app.infrastructure.db.base import utcnow
from app.infrastructure.db.repositories.org import SqlRoleProfileRepository

_STANDARD_ROLES = [
    "Junior Backend Engineer",
    "Mid Backend Engineer",
    "Senior Backend Engineer",
    "Junior Frontend Engineer",
    "Mid Frontend Engineer",
    "Senior Frontend Engineer",
    "Senior Fullstack Engineer",
    "Tech Lead",
    "DevOps Engineer",
]


async def seed_role_profiles(session: AsyncSession) -> None:
    repo = SqlRoleProfileRepository(session)
    existing = await repo.list_all()
    existing_names = {r.role_name for r in existing}
    now = utcnow()
    for role_name in _STANDARD_ROLES:
        if role_name not in existing_names:
            profile = RoleProfile(
                role_profile_id=str(uuid.uuid4()),
                role_name=role_name,
                expected_dimension_weights={},
                expected_opportunity_levels={},
                expected_maturity_ranges={},
                created_at=now,
                updated_at=now,
            )
            await repo.upsert(profile)
    await session.commit()
