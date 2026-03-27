"""Import all ORM models so Alembic's autogenerate can discover them.

Any model not imported here will be invisible to `alembic revision --autogenerate`.
"""

from app.infrastructure.db.models.assignment import ResourceAssignment
from app.infrastructure.db.models.org import Organization, User
from app.infrastructure.db.models.personnel import (
    Personnel,
    PersonnelLanguage,
    PersonnelProfile,
    SkillMatrixEntry,
)
from app.infrastructure.db.models.project import (
    Project,
    ProjectEvaluation,
    ProjectMembership,
    ProjectTeamMatch,
    ProjectToolLicense,
    ToolSeatAssignment,
)
from app.infrastructure.db.models.scenario import Scenario, ScenarioCompletionSnapshot
from app.infrastructure.db.models.task import Task, TaskDependency
from app.infrastructure.db.models.tracking import (
    LLMSession,
    ProjectWarning,
    TaskProgressLog,
    XPEvent,
)

__all__ = [
    "LLMSession",
    "Organization",
    "Personnel",
    "PersonnelLanguage",
    "PersonnelProfile",
    "Project",
    "ProjectEvaluation",
    "ProjectMembership",
    "ProjectTeamMatch",
    "ProjectToolLicense",
    "ProjectWarning",
    "ResourceAssignment",
    "Scenario",
    "ScenarioCompletionSnapshot",
    "SkillMatrixEntry",
    "Task",
    "TaskDependency",
    "TaskProgressLog",
    "ToolSeatAssignment",
    "User",
    "XPEvent",
]
