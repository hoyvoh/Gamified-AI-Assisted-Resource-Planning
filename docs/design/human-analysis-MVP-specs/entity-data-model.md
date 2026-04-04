# Entity / Data Model Spec

**Developer Growth & Evidence-Based Performance Insight Platform — MVP**

---

## 1. Core Entities Overview

| Entity | Purpose | Lifecycle |
|--------|---------|-----------|
| Organization | Top-level grouping | Created by admin, long-lived |
| Team | Sub-group within org | Created by admin, long-lived |
| Member | Individual contributor being tracked | Created by admin, linked to a team |
| RoleProfile | Expected behavior/weight profile per role | Pre-seeded, referenced |
| PersonalBaseline | Starting-point profile for a member | Created once per member, updatable |
| AnalysisRun | A single time-bounded analysis execution | Created on demand, persisted as snapshot |
| SourcePayload | Normalized batch of collected data | Created per collection pass |
| EvidenceUnit | A meaningful parsed piece of work evidence | Derived from raw records |
| BehavioralEvent | Semantically tagged work behavior from evidence | Derived from evidence units |
| DimensionSignal | A scored signal contributing to a dimension | Derived from events |
| DimensionScore | Final evaluated state of a skill dimension | Derived per analysis run |
| CategoryScore | Aggregated group score | Derived from dimensions |
| KPTItem | Keep / Problem / Try retrospective item | Derived from analysis run |
| CaseFeedback | A specific case-based coaching insight | Derived from event clusters |
| Milestone | Long-term notable growth or delivery event | Derived and persisted across runs |
| ValidationFlag | User feedback on an insight | Created by user action |
| AnalysisSnapshot | Full persisted output of an analysis run | Assembled at end of analysis |

---

## 2. Entity Definitions

---

### 2.1 Organization

Represents a company or organizational unit using the platform.

**Fields:**
- `organization_id` (PK)
- `name`
- `created_at`
- `updated_at`

**Relationships:**
- Has many `Team`

**Lifecycle:**
- Created by admin
- Persists until deleted
- Deletion cascades to teams (soft delete preferred)

---

### 2.2 Team

A group of members within an organization.

**Fields:**
- `team_id` (PK)
- `organization_id` (FK → Organization)
- `name`
- `created_at`
- `updated_at`

**Relationships:**
- Belongs to one `Organization`
- Has many `Member`

**Lifecycle:**
- Created by admin under an organization
- Persists until deleted

---

### 2.3 Member

An individual contributor whose work is being analyzed.

**Fields:**
- `member_id` (PK)
- `team_id` (FK → Team)
- `role_profile_id` (FK → RoleProfile, nullable)
- `display_name`
- `external_id` (e.g. GitHub handle, Slack ID)
- `created_at`
- `updated_at`

**Relationships:**
- Belongs to one `Team`
- Optionally linked to one `RoleProfile`
- Has many `AnalysisRun`
- Has one `PersonalBaseline` (optional)
- Has many `Milestone` (long-term retention)

**Lifecycle:**
- Created when added to team
- Maintains long-term milestone history across analysis windows

**Business rules:**
- Must belong to exactly one team

---

### 2.4 RoleProfile

Defines expected behavior weights and opportunity expectations per role.

**Fields:**
- `role_profile_id` (PK)
- `role_name` (e.g. "Junior Backend", "Senior Fullstack", "Tech Lead")
- `expected_dimension_weights` (JSON: dimension_id → float)
- `expected_opportunity_levels` (JSON: dimension_id → none|low|medium|high)
- `expected_maturity_ranges` (JSON: dimension_id → {min, max})
- `created_at`
- `updated_at`

**Lifecycle:**
- Pre-seeded for standard roles
- Admin can create custom role profiles
- Referenced by Member and AnalysisRun

---

### 2.5 PersonalBaseline

The starting-point capability profile for a member when tracking begins.

**Fields:**
- `baseline_id` (PK)
- `member_id` (FK → Member)
- `baseline_dimensions` (JSON: per-dimension baseline_score, confidence, source)
- `baseline_created_at`
- `created_by`
- `notes`

**Lifecycle:**
- Created once per member (optionally)
- Can be updated if the baseline needs correction
- Used as reference for delta calculation in subsequent analysis runs

---

### 2.6 AnalysisRun

A single execution of the analysis pipeline for a member over a time window.

**Fields:**
- `analysis_run_id` (PK)
- `member_id` (FK → Member)
- `organization_id`
- `team_id`
- `role_profile_id` (snapshot of role at time of run)
- `period_start` (date)
- `period_end` (date)
- `run_type` (fresh | refresh_same_period | refresh_new_period | compare_period)
- `status` (pending | collecting | analyzing | completed | failed)
- `triggered_by`
- `scoring_version`
- `taxonomy_version`
- `created_at`
- `completed_at`
- `error_message` (nullable)

**Relationships:**
- Belongs to one `Member`
- Has one `AnalysisSnapshot`
- Has many `EvidenceUnit`
- Has many `BehavioralEvent`
- Has many `DimensionSignal`
- Has many `DimensionScore`
- Has many `CategoryScore`
- Has many `KPTItem`
- Has many `CaseFeedback`
- May produce new `Milestone` records

**Lifecycle:**
- Created when user triggers analysis
- Proceeds through status transitions
- Snapshot is persisted on completion
- Previous runs are retained for delta comparison (not overwritten except for same-period refresh)

**Business rules:**
- `period_end - period_start` must not exceed 365 days
- On same-period refresh: overwrite snapshot, preserve validation flags and milestones
- On new-period: create new run, preserve history

---

### 2.7 EvidenceUnit

A single parsed, meaningful piece of work evidence tied to a member.

**Fields:**
- `evidence_id` (PK)
- `analysis_run_id` (FK → AnalysisRun)
- `member_id`
- `timestamp`
- `source_type` (work_artifact | conversation | documentation | review | timeline)
- `record_id` (reference back to raw source)
- `url_or_ref` (nullable)
- `project_id` (nullable)
- `workstream_id` (nullable)
- `artifact_type` (nullable)
- `interaction_scope` (solo | pair | team | cross-team | org-wide)
- `content_excerpt`
- `content_summary`
- `extraction_confidence` (float 0–1)
- `specificity` (float 0–1)
- `directness` (float 0–1)
- `strength` (float 0–1)
- `recency_weight` (float 0–1)
- `visibility_bias_risk` (float 0–1)
- `ambiguity_notes` (JSON array)

**Lifecycle:**
- Extracted during analysis run
- Retained for explainability and evidence trace
- Linked to events and signals

---

### 2.8 BehavioralEvent

A semantically meaningful work behavior derived from one or more evidence units.

**Fields:**
- `event_id` (PK)
- `analysis_run_id` (FK → AnalysisRun)
- `member_id`
- `timestamp`
- `source_evidence_ids` (JSON array of evidence_id)
- `event_type` (enum — see Scoring Engine spec)
- `event_summary`
- `polarity` (positive | negative | mixed | neutral)
- `severity` (float 0–1)
- `event_confidence` (float 0–1)
- `impact_level` (low | medium | high)
- `opportunity_level` (none | low | medium | high)
- `related_dimensions` (JSON: [{dimension_id, relation_strength}])
- `project_id` (nullable)
- `workstream_id` (nullable)
- `ambiguity_notes` (JSON array)
- `tags` (JSON array)

**Lifecycle:**
- Derived from evidence units during P1/P2 pipeline stages
- Used as input for dimension signal mapping (P3)

---

### 2.9 DimensionSignal

A scored signal contributing to a single dimension, derived from events.

**Fields:**
- `signal_id` (PK)
- `analysis_run_id` (FK → AnalysisRun)
- `member_id`
- `dimension_id`
- `source_event_ids` (JSON array)
- `polarity` (positive | negative | neutral | insufficient)
- `signal_strength` (float 0–1)
- `signal_specificity` (float 0–1)
- `signal_confidence` (float 0–1)
- `project_diversity_score` (float 0–1)
- `time_spread_score` (float 0–1)
- `opportunity_level` (none | low | medium | high)
- `explanation_summary`

**Lifecycle:**
- Derived from behavioral events during P3 stage
- Aggregated to produce DimensionScore

---

### 2.10 DimensionScore

The final evaluated state of a skill dimension for a member in an analysis run.

**Fields:**
- `score_id` (PK)
- `analysis_run_id` (FK → AnalysisRun)
- `member_id`
- `dimension_id`
- `raw_score` (float 1–5, nullable)
- `normalized_score` (float 1–5, nullable)
- `maturity_level` (emerging | developing | reliable | strong | advanced | insufficient_evidence | insufficient_opportunity)
- `confidence_score` (float 0–1)
- `confidence_label` (low | moderate | high)
- `opportunity_score` (float 0–1)
- `opportunity_label` (none | low | medium | high)
- `delta_value` (float, nullable)
- `delta_label` (improved | stable | emerging | regressing | not_enough_comparison)
- `total_signals`
- `positive_signals`
- `negative_signals`
- `mixed_signals`
- `explanation_summary`
- `limitation_notes` (JSON array)
- `top_supporting_evidence_ids` (JSON array)
- `top_counter_evidence_ids` (JSON array)
- `ui_summary` (human-facing text from P4)

**Lifecycle:**
- Computed at end of scoring pipeline
- Stored as part of AnalysisSnapshot

---

### 2.11 CategoryScore

Aggregated score across dimensions in a skill group.

**Fields:**
- `category_score_id` (PK)
- `analysis_run_id` (FK → AnalysisRun)
- `member_id`
- `category_id` (core_technical_execution | domain_technical_capability | technical_mindset | professional_team_effectiveness)
- `score` (float, nullable)
- `confidence_score` (float)
- `confidence_label` (low | moderate | high)
- `included_dimensions` (JSON array)
- `excluded_dimensions` (JSON array)
- `explanation_summary`

---

### 2.12 KPTItem

A single Keep, Problem, or Try item from the retrospective analysis.

**Fields:**
- `kpt_id` (PK)
- `analysis_run_id` (FK → AnalysisRun)
- `member_id`
- `item_type` (keep | problem | try)
- `title`
- `summary`
- `linked_dimension_ids` (JSON array)
- `linked_evidence_ids` (JSON array)
- `linked_problem_ids` (JSON array — for Try items only)
- `display_order`

---

### 2.13 CaseFeedback

A specific case-based coaching insight derived from notable event clusters.

**Fields:**
- `case_id` (PK)
- `analysis_run_id` (FK → AnalysisRun)
- `member_id`
- `title`
- `category` (communication_handoff | quality_miss | ownership_gap | good_recovery | strong_technical_decision | debugging_lesson | collaboration_lesson | delivery_reliability_lesson)
- `impact_level` (low | medium | high)
- `summary`
- `why_it_matters`
- `observed_pattern`
- `better_alternative`
- `next_time_guidance`
- `linked_dimension_ids` (JSON array)
- `supporting_event_ids` (JSON array)
- `confidence_score` (float)
- `display_order`

---

### 2.14 Milestone

A long-term notable growth, delivery, or learning event for a member.

**Fields:**
- `milestone_id` (PK)
- `member_id` (FK → Member)
- `source_analysis_run_id` (FK → AnalysisRun)
- `timestamp`
- `milestone_type` (major_delivery | ownership_shift | learning_breakthrough | quality_lesson | recovery_case | support_impact | growth_transition | notable_setback)
- `title`
- `summary`
- `impact_score` (float)
- `supporting_event_ids` (JSON array)
- `supporting_evidence_ids` (JSON array)
- `retained` (bool — soft-delete flag)

**Lifecycle:**
- Created during or after analysis run
- Retained across multiple analysis windows
- Max retention: 5 years
- Not overwritten by same-period refresh

---

### 2.15 ValidationFlag

A user-submitted validation or dispute of an insight.

**Fields:**
- `flag_id` (PK)
- `member_id`
- `analysis_run_id` (FK → AnalysisRun)
- `target_type` (dimension_score | kpt_item | case_feedback | overview_summary)
- `target_id`
- `flag_type` (accurate | questionable | incorrect)
- `user_note` (nullable)
- `submitted_by`
- `submitted_at`

**Lifecycle:**
- Created when user flags an insight
- Preserved across same-period refresh
- Used as correction signal for future analysis improvement

---

### 2.16 AnalysisSnapshot

The complete persisted output of an analysis run, used to render all profile tabs.

**Fields:**
- `snapshot_id` (PK)
- `analysis_run_id` (FK → AnalysisRun, unique)
- `member_id`
- `period_start`
- `period_end`
- `generated_at`
- `overall_confidence` (float)
- `profile_summary` (text — P7 output)
- `growth_journey_summary` (text — P7 output, nullable)
- `top_strength_dimension_ids` (JSON array)
- `top_growth_dimension_ids` (JSON array)
- `current_growth_path` (nullable)
- `fairness_notes` (JSON array)
- `insufficient_dimensions` (JSON array)
- `flagged_items_count`
- `p8_approved` (bool — whether self-critique passed)
- `p8_issues` (JSON array — remaining issues after patching)

---

## 3. Entity Relationship Summary

```
Organization (1) ──── (N) Team
Team (1) ──── (N) Member
Member (1) ──── (1) PersonalBaseline [optional]
Member (N) ──── (1) RoleProfile [optional]
Member (1) ──── (N) AnalysisRun
Member (1) ──── (N) Milestone [long-term, cross-run]
AnalysisRun (1) ──── (1) AnalysisSnapshot
AnalysisRun (1) ──── (N) EvidenceUnit
AnalysisRun (1) ──── (N) BehavioralEvent
AnalysisRun (1) ──── (N) DimensionSignal
AnalysisRun (1) ──── (N) DimensionScore
AnalysisRun (1) ──── (N) CategoryScore
AnalysisRun (1) ──── (N) KPTItem
AnalysisRun (1) ──── (N) CaseFeedback
AnalysisRun (1) ──── (N) ValidationFlag
EvidenceUnit (N) ──── (N) BehavioralEvent [via source_evidence_ids]
BehavioralEvent (N) ──── (N) DimensionSignal [via source_event_ids]
DimensionSignal (N) ──── (1) DimensionScore [aggregated]
DimensionScore (N) ──── (1) CategoryScore [aggregated]
```

---

## 4. State Model per Key Entity

### AnalysisRun.status

```
pending → collecting → analyzing → completed
                     ↓
                   failed
```

### Member analysis status (derived from latest run)

- `not_analyzed` — no run yet
- `loading` — run in progress
- `ready` — latest run completed
- `error` — latest run failed

### DimensionScore.maturity_level

```
emerging → developing → reliable → strong → advanced
                                 ↓
                     insufficient_evidence
                     insufficient_opportunity
```

### ValidationFlag.flag_type

```
accurate | questionable | incorrect
```

---

## 5. Snapshot vs Live Data Strategy

| Data type | Strategy |
|-----------|----------|
| Analysis outputs (scores, KPT, cases) | Snapshot per run — immutable once completed |
| Milestones | Append-only, cross-run, retained up to 5 years |
| ValidationFlags | Preserved across same-period refresh |
| Raw evidence / events | Retained per run for explainability |
| Organization / Team / Member hierarchy | Live, mutable |
| RoleProfile / PersonalBaseline | Versioned, snapshot at run time |

---

## 6. Historical State Behavior

- Each `AnalysisRun` is independent and retains its own snapshot
- Delta (`delta_label` on `DimensionScore`) is computed vs the nearest valid previous run
- Same-period refresh overwrites the `AnalysisSnapshot` but preserves `ValidationFlag` records
- New-period runs create a fresh `AnalysisRun` and snapshot without overwriting prior history
- Milestones are stored at member level and survive across all analysis windows
