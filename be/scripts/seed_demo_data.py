"""Demo data seeding script — creates org/team/member + complete analysis data.

Usage:
  cd be/
  python scripts/seed_demo_data.py

This script:
1. Creates an organization, team, and member
2. Creates a completed analysis run
3. Populates with realistic dimension scores, evidence, KPT items, and behavioral events
4. All data is idempotent (safe to run multiple times)

No code changes needed. Database (dev.db) will be auto-created.
"""

import asyncio
import sys
import uuid
from datetime import UTC, datetime, timedelta
from pathlib import Path

# Add parent directory to path so we can import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.analysis.entities import (
    AnalysisRun,
    AnalysisSnapshot,
    BehavioralEvent,
    CategoryScore,
    CaseFeedback,
    DimensionScore,
    EvidenceUnit,
    KptItem,
    Milestone,
)
from app.domain.org.entities import Member, Organization, RoleProfile, Team
from app.infrastructure.db.base import utcnow
from app.infrastructure.db.repositories.analysis import (
    SqlAnalysisRunRepository,
    SqlAnalysisSnapshotRepository,
    SqlBehavioralEventRepository,
    SqlCaseFeedbackRepository,
    SqlCategoryScoreRepository,
    SqlDimensionScoreRepository,
    SqlEvidenceUnitRepository,
    SqlKptItemRepository,
    SqlMilestoneRepository,
)
from app.infrastructure.db.repositories.org import (
    SqlMemberRepository,
    SqlOrganizationRepository,
    SqlRoleProfileRepository,
    SqlTeamRepository,
)
from app.infrastructure.db.session import _session_factory
from app.logger import get_logger

logger = get_logger(__name__)


async def seed_demo_data() -> None:
    """Create complete demo dataset for UI development."""
    async with _session_factory() as session:
        # 1. Create Organization
        logger.info("Creating organization...")
        org_repo = SqlOrganizationRepository(session)
        org_id = str(uuid.uuid4())
        org = Organization(
            organization_id=org_id,
            name="Desert Empire Corp",
            created_at=utcnow(),
            updated_at=utcnow(),
        )
        await org_repo.create(org)

        # 2. Create Team
        logger.info("Creating team...")
        team_repo = SqlTeamRepository(session)
        team_id = str(uuid.uuid4())
        team = Team(
            team_id=team_id,
            organization_id=org_id,
            name="Backend Warriors",
            created_at=utcnow(),
            updated_at=utcnow(),
        )
        await team_repo.create(team)

        # 3. Get a senior role profile
        logger.info("Fetching role profile...")
        role_repo = SqlRoleProfileRepository(session)
        roles = await role_repo.list_all()
        if not roles:
            logger.error("No roles found in database. Run: python -m uvicorn app.main:app once")
            return
        senior_role = next(
            (r for r in roles if "Senior" in r.role_name),
            roles[0],
        )

        # 4. Create Member
        logger.info("Creating member...")
        member_repo = SqlMemberRepository(session)
        member_id = str(uuid.uuid4())
        member = Member(
            member_id=member_id,
            team_id=team_id,
            organization_id=org_id,
            display_name="An Vy Nguyen",
            external_id="avn@company.com",
            role_profile_id=senior_role.role_profile_id,
            analysis_status="completed",
            last_analysis_at=utcnow(),
            created_at=utcnow(),
            updated_at=utcnow(),
        )
        await member_repo.create(member)

        # 5. Create Analysis Run
        logger.info("Creating analysis run...")
        run_repo = SqlAnalysisRunRepository(session)
        period_start = (datetime.now(UTC) - timedelta(days=180)).date()
        period_end = datetime.now(UTC).date()
        run_id = str(uuid.uuid4())

        run = AnalysisRun(
            analysis_run_id=run_id,
            member_id=member_id,
            period_start=period_start.isoformat(),
            period_end=period_end.isoformat(),
            run_type="fresh",
            status="completed",
            progress_stage=None,
            progress_pct=100,
            error_message=None,
            scoring_version="1.0",
            created_at=utcnow(),
            updated_at=utcnow(),
            completed_at=utcnow(),
        )
        await run_repo.create(run)

        # 6. Create Evidence Units
        logger.info("Creating evidence units...")
        evidence_repo = SqlEvidenceUnitRepository(session)
        evidence_data = [
            {
                "source_type": "github",
                "record_type": "pr_authored",
                "content_excerpt": "Implemented Redis caching layer for API responses to reduce latency",
            },
            {
                "source_type": "github",
                "record_type": "commit",
                "content_excerpt": "Fixed race condition in concurrent user authentication flow",
            },
            {
                "source_type": "github",
                "record_type": "pr_reviewed",
                "content_excerpt": "Provided detailed code review with security recommendations for database migration",
            },
            {
                "source_type": "github",
                "record_type": "pr_authored",
                "content_excerpt": "Refactored payment processing module to improve testability",
            },
            {
                "source_type": "github",
                "record_type": "commit",
                "content_excerpt": "Updated API documentation with OpenAPI 3.1 schema",
            },
        ]

        evidence_units = []
        for i, data in enumerate(evidence_data):
            evidence_id = str(uuid.uuid4())
            evidence = EvidenceUnit(
                evidence_id=evidence_id,
                analysis_run_id=run_id,
                member_id=member_id,
                timestamp=(
                    (
                        datetime.now(UTC) - timedelta(days=30 - i * 10)
                    ).replace(
                        hour=10, minute=30, second=0, microsecond=0
                    )
                ).isoformat().replace("+00:00", "Z"),
                source_type=data["source_type"],
                record_type=data["record_type"],
                record_id=f"gh_{i}",
                content_excerpt=data["content_excerpt"],
                content_summary=data["content_excerpt"],
                extraction_confidence=0.92 + (i * 0.01),
                ambiguity_notes=[],
                created_at=utcnow(),
            )
            evidence_units.append(evidence)
        await evidence_repo.bulk_create(evidence_units)

        # 7. Create Dimension Scores
        logger.info("Creating dimension scores...")
        dim_score_repo = SqlDimensionScoreRepository(session)
        dimensions = [
            {
                "dimension_id": "technical_execution",
                "score": 8.2,
                "maturity_level": "advanced",
                "confidence": 0.92,
                "opportunity": 0.65,
                "signals": (15, 12, 2, 1),
            },
            {
                "dimension_id": "code_quality",
                "score": 7.8,
                "maturity_level": "advanced",
                "confidence": 0.89,
                "opportunity": 0.72,
                "signals": (14, 13, 0, 1),
            },
            {
                "dimension_id": "communication",
                "score": 6.5,
                "maturity_level": "intermediate",
                "confidence": 0.78,
                "opportunity": 0.85,
                "signals": (9, 5, 2, 2),
            },
            {
                "dimension_id": "problem_solving",
                "score": 7.9,
                "maturity_level": "advanced",
                "confidence": 0.86,
                "opportunity": 0.58,
                "signals": (12, 10, 1, 1),
            },
            {
                "dimension_id": "ownership",
                "score": 6.8,
                "maturity_level": "intermediate",
                "confidence": 0.81,
                "opportunity": 0.76,
                "signals": (11, 7, 2, 2),
            },
        ]

        dimension_scores = []
        for dim in dimensions:
            score_id = str(uuid.uuid4())
            total, positive, negative, mixed = dim["signals"]
            score = DimensionScore(
                score_id=score_id,
                analysis_run_id=run_id,
                member_id=member_id,
                dimension_id=dim["dimension_id"],
                raw_score=dim["score"],
                normalized_score=dim["score"] / 10.0,
                maturity_level=dim["maturity_level"],
                confidence_score=dim["confidence"],
                confidence_label="High" if dim["confidence"] > 0.85 else "Moderate",
                opportunity_score=dim["opportunity"],
                opportunity_label="High" if dim["opportunity"] > 0.7 else "Medium",
                delta_value=0.25 + (dim["score"] * 0.01),
                delta_label="Improving" if dim["opportunity"] > 0.7 else "Stable",
                total_signals=total,
                positive_signals=positive,
                negative_signals=negative,
                mixed_signals=mixed,
                explanation_summary=f"Strong performance in {dim['dimension_id'].replace('_', ' ')}",
                limitation_notes=["Limited sample size in some time periods"],
                top_supporting_evidence_ids=[
                    e.evidence_id for e in evidence_units[:2]
                ],
                top_counter_evidence_ids=[],
                p3_inference=None,
                ui_summary=f"{dim['maturity_level'].capitalize()} proficiency in {dim['dimension_id']}",
                created_at=utcnow(),
            )
            dimension_scores.append(score)
        await dim_score_repo.bulk_create(dimension_scores)

        # 8. Create KPT Items
        logger.info("Creating KPT items...")
        kpt_repo = SqlKptItemRepository(session)
        kpt_items = [
            {
                "item_type": "keep",
                "title": "Strong technical execution and implementation reliability",
                "summary": "Consistently delivers quality code on schedule with minimal rework",
                "order": 0,
            },
            {
                "item_type": "keep",
                "title": "High code quality standards and testing discipline",
                "summary": "Writes maintainable code with comprehensive test coverage",
                "order": 1,
            },
            {
                "item_type": "problem",
                "title": "Communication could be clearer in handoffs",
                "summary": "Sometimes assumptions are not validated with stakeholders early enough",
                "order": 0,
            },
            {
                "item_type": "problem",
                "title": "Tends to overengineer solutions occasionally",
                "summary": "Adds architectural complexity that isn't needed for current scope",
                "order": 1,
            },
            {
                "item_type": "try",
                "title": "Mentor junior developers on code review practices",
                "summary": "Could formalize code review standards and provide constructive feedback",
                "order": 0,
            },
            {
                "item_type": "try",
                "title": "Lead technical design meetings and architecture decisions",
                "summary": "Opportunity to grow into cross-team technical leadership",
                "order": 1,
            },
        ]

        kpt_entities = []
        for item in kpt_items:
            kpt_id = str(uuid.uuid4())
            kpt = KptItem(
                kpt_id=kpt_id,
                analysis_run_id=run_id,
                member_id=member_id,
                item_type=item["item_type"],
                title=item["title"],
                summary=item["summary"],
                linked_dimension_ids=[
                    "technical_execution",
                    "code_quality",
                    "communication",
                ],
                linked_evidence_ids=[e.evidence_id for e in evidence_units[:2]],
                linked_problem_ids=[],
                display_order=item["order"],
                created_at=utcnow(),
            )
            kpt_entities.append(kpt)
        await kpt_repo.replace_for_run(run_id, kpt_entities)

        # 9. Create Behavioral Events
        logger.info("Creating behavioral events...")
        event_repo = SqlBehavioralEventRepository(session)
        events = [
            {
                "event_type": "code_review_insight",
                "summary": "Provided detailed security review on authentication PR",
                "polarity": "positive",
                "impact": "high",
            },
            {
                "event_type": "implementation_quality",
                "summary": "Fixed subtle race condition affecting production stability",
                "polarity": "positive",
                "impact": "high",
            },
            {
                "event_type": "architecture_decision",
                "summary": "Proposed caching strategy that improved API response time by 40%",
                "polarity": "positive",
                "impact": "high",
            },
            {
                "event_type": "communication_gap",
                "summary": "Missed standup without prior notice but completed task",
                "polarity": "negative",
                "impact": "medium",
            },
            {
                "event_type": "mentorship_activity",
                "summary": "Helped junior dev debug complex issue and explained solution",
                "polarity": "positive",
                "impact": "medium",
            },
        ]

        behavioral_events = []
        for evt in events:
            event_id = str(uuid.uuid4())
            event = BehavioralEvent(
                event_id=event_id,
                analysis_run_id=run_id,
                member_id=member_id,
                timestamp=utcnow(),
                source_evidence_ids=[e.evidence_id for e in evidence_units[:2]],
                event_type=evt["event_type"],
                event_summary=evt["summary"],
                polarity=evt["polarity"],
                severity=8 if evt["polarity"] == "positive" else 6,
                event_confidence=0.88,
                impact_level=evt["impact"],
                opportunity_level="high",
                related_dimensions=[],
                ambiguity_notes=[],
                why_it_matters="Shows technical judgment, reliability, and collaborative spirit",
                created_at=utcnow(),
            )
            behavioral_events.append(event)
        await event_repo.bulk_create(behavioral_events)

        # 10. Create CategoryScore (needed for Competency "INCLUDED LANES")
        logger.info("Creating category scores...")
        cat_score_repo = SqlCategoryScoreRepository(session)
        category_scores = [
            CategoryScore(
                category_score_id=str(uuid.uuid4()),
                analysis_run_id=run_id,
                member_id=member_id,
                category_id="core_technical_execution",
                score=8.0,
                confidence_score=0.91,
                confidence_label="High",
                included_dimensions=[
                    "implementation_reliability",
                    "code_quality_discipline",
                    "technical_ownership",
                ],
                excluded_dimensions=["careless_mistake_control"],
                explanation_summary="Strong core execution with reliable delivery and quality focus.",
                created_at=utcnow(),
            ),
            CategoryScore(
                category_score_id=str(uuid.uuid4()),
                analysis_run_id=run_id,
                member_id=member_id,
                category_id="engineering_mindset",
                score=7.5,
                confidence_score=0.85,
                confidence_label="High",
                included_dimensions=[
                    "quality_mindset",
                    "security_awareness",
                    "maintainability_thinking",
                ],
                excluded_dimensions=["performance_awareness"],
                explanation_summary="Good engineering judgment with security awareness.",
                created_at=utcnow(),
            ),
            CategoryScore(
                category_score_id=str(uuid.uuid4()),
                analysis_run_id=run_id,
                member_id=member_id,
                category_id="collaboration_growth",
                score=6.5,
                confidence_score=0.78,
                confidence_label="Moderate",
                included_dimensions=[
                    "problem_solving",
                    "collaboration",
                ],
                excluded_dimensions=["mentoring_knowledge_support", "horenso_reporting_discipline"],
                explanation_summary="Good collaborator, communication clarity has room to grow.",
                created_at=utcnow(),
            ),
            CategoryScore(
                category_score_id=str(uuid.uuid4()),
                analysis_run_id=run_id,
                member_id=member_id,
                category_id="technical_depth_breadth",
                score=7.2,
                confidence_score=0.82,
                confidence_label="High",
                included_dimensions=[
                    "backend_capability",
                    "system_integration_capability",
                ],
                excluded_dimensions=["frontend_capability", "devops_delivery_capability"],
                explanation_summary="Strong backend focus with solid integration experience.",
                created_at=utcnow(),
            ),
        ]
        await cat_score_repo.bulk_create(category_scores)

        # 11. Create AnalysisSnapshot (needed for Overview + Journey summary text)
        logger.info("Creating analysis snapshot...")
        snapshot_repo = SqlAnalysisSnapshotRepository(session)
        snapshot = AnalysisSnapshot(
            snapshot_id=str(uuid.uuid4()),
            analysis_run_id=run_id,
            member_id=member_id,
            period_start=period_start.isoformat(),
            period_end=period_end.isoformat(),
            generated_at=utcnow(),
            overall_confidence=0.87,
            profile_summary=(
                "Reliable technical contributor with strong implementation focus. "
                "Shows growth in ownership and architectural thinking. "
                "Key development area: communication clarity in handoffs."
            ),
            growth_journey_summary=(
                "Progressed from individual contributor mindset toward collaborative leadership. "
                "Demonstrated ability to mentor juniors and drive technical decisions. "
                "Consistency in delivery has earned trust across the team."
            ),
            top_strength_dimension_ids=[
                "implementation_reliability",
                "code_quality_discipline",
                "problem_solving",
            ],
            top_growth_dimension_ids=["collaboration", "horenso_reporting_discipline"],
            current_growth_path="Emerging Owner",
            fairness_notes=[
                "Limited data for strategic dimensions — internal discussions sparse",
                "Strong signals from code contributions; external feedback minimal",
            ],
            insufficient_dimensions=["ai_leverage_ability", "user_first"],
            flagged_items_count=0,
            p8_approved=True,
            p8_issues=[],
        )
        await snapshot_repo.upsert(snapshot)

        # 12. Create CaseFeedback (needed for Cases "ARCHIVE LEDGER")
        logger.info("Creating case feedback...")
        case_repo = SqlCaseFeedbackRepository(session)
        cases = [
            CaseFeedback(
                case_id=str(uuid.uuid4()),
                analysis_run_id=run_id,
                member_id=member_id,
                title="Handoff documentation left incomplete before vacation",
                category="communication",
                impact_level="medium",
                summary=(
                    "Before a vacation period, key context about an in-progress PR "
                    "was not documented. The next assignee spent 3 hours re-discovering "
                    "the design intent."
                ),
                why_it_matters="Handoff gaps compound into team-wide delays and erode trust.",
                observed_pattern="Tends to hold context in memory rather than externalizing it.",
                better_alternative="A short async doc or PR comment capturing current state and next steps.",
                next_time_guidance="Before any planned absence, write a 5-minute handoff note in the PR.",
                linked_dimension_ids=["collaboration", "horenso_reporting_discipline"],
                supporting_event_ids=[e.evidence_id for e in evidence_units[:1]],
                confidence_score=0.82,
                display_order=0,
                created_at=utcnow(),
            ),
            CaseFeedback(
                case_id=str(uuid.uuid4()),
                analysis_run_id=run_id,
                member_id=member_id,
                title="Overengineered caching layer for low-traffic endpoint",
                category="technical_execution",
                impact_level="low",
                summary=(
                    "Implemented a full Redis caching strategy for an endpoint handling "
                    "<50 requests/day. The complexity added maintenance overhead without "
                    "measurable performance benefit."
                ),
                why_it_matters="Over-engineering wastes sprint capacity and makes future changes harder.",
                observed_pattern="Applies heavyweight solutions without validating if simpler approach suffices.",
                better_alternative="Quick profiling first — only optimize when data shows it's needed.",
                next_time_guidance="Ask: what's the simplest solution that meets the acceptance criteria?",
                linked_dimension_ids=["implementation_reliability", "decision_hygiene"],
                supporting_event_ids=[e.evidence_id for e in evidence_units[1:2]],
                confidence_score=0.76,
                display_order=1,
                created_at=utcnow(),
            ),
            CaseFeedback(
                case_id=str(uuid.uuid4()),
                analysis_run_id=run_id,
                member_id=member_id,
                title="Proactively identified race condition before it hit production",
                category="code_quality",
                impact_level="high",
                summary=(
                    "During PR review, identified a subtle concurrency bug in the "
                    "authentication flow that would have caused intermittent failures "
                    "under load. Fix was applied before merge."
                ),
                why_it_matters="Catching bugs pre-production saves significant debugging time and user impact.",
                observed_pattern="Reads code defensively, looking for edge cases and concurrency issues.",
                better_alternative=None,
                next_time_guidance="Keep doing this — document the bug class for team knowledge base.",
                linked_dimension_ids=["code_quality_discipline", "debugging_root_cause", "security_awareness"],
                supporting_event_ids=[e.evidence_id for e in evidence_units[2:3]],
                confidence_score=0.93,
                display_order=2,
                created_at=utcnow(),
            ),
        ]
        await case_repo.replace_for_run(run_id, cases)

        # 13. Create Milestones (needed for Journey "EXPEDITION LOG" / landmarks)
        logger.info("Creating milestones...")
        milestone_repo = SqlMilestoneRepository(session)
        base_ts = datetime.now(UTC) - timedelta(days=150)
        milestones = [
            Milestone(
                milestone_id=str(uuid.uuid4()),
                member_id=member_id,
                source_analysis_run_id=run_id,
                timestamp=(base_ts + timedelta(days=10)).isoformat(),
                milestone_type="ownership_shift",
                title="Took sole ownership of authentication service refactor",
                summary=(
                    "Planned, executed, and shipped a full refactor of the auth service "
                    "independently. No escalations needed. Delivered on time."
                ),
                impact_score=8.5,
                supporting_event_ids=[e.evidence_id for e in evidence_units[:2]],
                supporting_evidence_ids=[e.evidence_id for e in evidence_units[:1]],
                retained=True,
                created_at=utcnow(),
            ),
            Milestone(
                milestone_id=str(uuid.uuid4()),
                member_id=member_id,
                source_analysis_run_id=run_id,
                timestamp=(base_ts + timedelta(days=55)).isoformat(),
                milestone_type="quality_signal",
                title="Zero critical bugs shipped across 12-week period",
                summary=(
                    "Maintained a clean production record over 3 months — "
                    "all post-deploy issues were minor and self-caught."
                ),
                impact_score=7.8,
                supporting_event_ids=[],
                supporting_evidence_ids=[e.evidence_id for e in evidence_units[1:3]],
                retained=True,
                created_at=utcnow(),
            ),
            Milestone(
                milestone_id=str(uuid.uuid4()),
                member_id=member_id,
                source_analysis_run_id=run_id,
                timestamp=(base_ts + timedelta(days=110)).isoformat(),
                milestone_type="collaboration_signal",
                title="First time leading technical design for cross-team feature",
                summary=(
                    "Coordinated design decisions across two teams for a shared API contract. "
                    "Facilitated alignment meeting and produced the RFC."
                ),
                impact_score=8.0,
                supporting_event_ids=[e.evidence_id for e in evidence_units[3:5]],
                supporting_evidence_ids=[],
                retained=True,
                created_at=utcnow(),
            ),
        ]
        await milestone_repo.append(milestones)

        await session.commit()

        # Always print to stdout — visible regardless of log level / SQLAlchemy noise
        sep = "=" * 70
        print(f"\n{sep}")
        print("[OK] Demo data seeded successfully!")
        print(sep)
        print(f"  Organization : {org.name}")
        print(f"               : {org_id}")
        print(f"  Team         : {team.name}")
        print(f"               : {team_id}")
        print(f"  Member       : {member.display_name}")
        print(f"  MEMBER ID    : {member_id}   <- use this in UI URL")
        print(f"  Analysis Run : {run_id}")
        print(f"  Period       : {period_start} -> {period_end}")
        print(sep)
        print(f"  [UI]  http://localhost:3000/profile/{member_id}")
        print(f"  [API] http://localhost:8000/api/v1/members/{member_id}/profile/overview")
        print(sep + "\n")


if __name__ == "__main__":
    asyncio.run(seed_demo_data())
