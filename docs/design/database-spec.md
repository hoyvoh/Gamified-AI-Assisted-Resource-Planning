# Database Specification

Stack: **PostgreSQL** · **SQLAlchemy 2.x** · **Alembic** (migrations)

---

## Entity Relationship Overview

```
organizations ──< projects ──< scenarios ──< tasks ──< resource_assignments >── personnel
                                                 └──< task_dependencies
organizations ──< personnel ──< skill_matrix_entries
                               └──< personnel_languages
personnel ──< project_memberships >── projects
tasks ──< task_progress_logs
personnel ──< xp_events
scenarios ──< project_warnings
projects ──< project_tool_licenses ──< tool_seat_assignments >── personnel
```

---

## Tables

### `organizations`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `name` | VARCHAR(200) | |
| `slug` | VARCHAR(100) UNIQUE | URL-safe identifier |
| `created_at` | TIMESTAMPTZ | |

### `users`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `org_id` | UUID FK → organizations | |
| `email` | VARCHAR(255) UNIQUE | |
| `name` | VARCHAR(200) | |
| `role` | ENUM(admin, pm, tech_lead, member) | |
| `created_at` | TIMESTAMPTZ | |

### `personnel`
Nhân sự trong tổ chức — đây là "quân cờ" trên bàn cờ.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `org_id` | UUID FK → organizations | |
| `user_id` | UUID FK → users NULLABLE | Có thể là nhân sự chưa có tài khoản |
| `display_name` | VARCHAR(200) | |
| `seniority` | ENUM(intern, junior, mid, senior, lead) | |
| `years_experience` | DECIMAL(4,1) | |
| `base_wfu` | DECIMAL(4,2) DEFAULT 1.0 | Base Workforce Unit |
| `daily_capacity_hours` | DECIMAL(4,1) DEFAULT 7.0 | |
| `hourly_cost` | DECIMAL(10,2) | Cho budget calculation |
| `avatar_url` | TEXT NULLABLE | |
| `velocity_baseline` | DECIMAL(4,2) NULLABLE | Avg actual WFU từ lịch sử dự án (dùng cho P(on_time) calibration) |
| `created_at` | TIMESTAMPTZ | |

### `personnel_languages`
Ngôn ngữ làm việc của nhân sự — dùng cho LANGUAGE_BARRIER warning.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `personnel_id` | UUID FK → personnel | |
| `language_code` | VARCHAR(10) | BCP 47: "vi", "en", "ja", "ko" |
| `proficiency` | ENUM(native, fluent, basic) | |

### `skill_matrix_entries`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `personnel_id` | UUID FK → personnel | |
| `skill_name` | VARCHAR(100) | e.g. "Backend Java", "React" |
| `category` | VARCHAR(50) | e.g. "Backend", "Frontend", "DevOps" |
| `level` | ENUM(beginner, intermediate, advanced, expert) | |
| `wfu_multiplier_standard` | DECIMAL(3,2) DEFAULT 1.0 | WFU multiplier khi dùng skill này |
| `wfu_multiplier_fast` | DECIMAL(3,2) DEFAULT 1.2 | Khi chọn "fast mode" |
| `wfu_multiplier_quality` | DECIMAL(3,2) DEFAULT 1.5 | Khi chọn "quality mode" |

### `projects`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `org_id` | UUID FK → organizations | |
| `name` | VARCHAR(300) | |
| `description` | TEXT | |
| `status` | ENUM(draft, planning, execution, completed, cancelled) | |
| `deadline` | DATE | |
| `budget_total` | DECIMAL(15,2) NULLABLE | |
| `budget_currency` | VARCHAR(10) DEFAULT 'USD' | |
| `active_scenario_id` | UUID FK → scenarios NULLABLE | |
| `raw_proposal` | TEXT | Input gốc từ PM |
| `created_by` | UUID FK → users | |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

### `project_memberships`
Nhân sự tham gia dự án với tỷ lệ phân bổ.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `project_id` | UUID FK → projects | |
| `personnel_id` | UUID FK → personnel | |
| `allocation_pct` | DECIMAL(5,2) | % thời gian dành cho project này (0-100) |
| `role_in_project` | VARCHAR(100) | e.g. "Backend Lead", "QA" |
| `joined_at` | DATE | |
| `left_at` | DATE NULLABLE | |

### `scenarios`
Mỗi kế hoạch phân bổ = 1 scenario. Một dự án có thể có nhiều scenarios.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `project_id` | UUID FK → projects | |
| `name` | VARCHAR(200) | e.g. "Plan A — Full Team", "Plan B — Nhân sự rút" |
| `description` | TEXT NULLABLE | |
| `status` | ENUM(draft, active, archived, rejected) | |
| `is_snapshot` | BOOLEAN DEFAULT false | Snapshot bất biến |
| `parent_scenario_id` | UUID FK → scenarios NULLABLE | Fork từ scenario khác |
| `created_by` | UUID FK → users | |
| `created_at` | TIMESTAMPTZ | |
| `metadata` | JSONB | Risk notes, optimizer settings, etc. |

### `tasks`
Đơn vị công việc cơ bản — "doanh trại" trên bàn cờ.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `scenario_id` | UUID FK → scenarios | |
| `name` | VARCHAR(300) | |
| `description` | TEXT | |
| `category` | ENUM(backend, frontend, devops, qa, research, design, pm) | |
| `status` | ENUM(draft, todo, in_progress, review, done, blocked) | |
| `priority` | ENUM(critical, high, medium, low) | |
| `tech_stacks` | JSONB | Array of skill names: ["React", "TypeScript"] |
| `required_languages` | JSONB DEFAULT '[]' | BCP 47 codes: ["en"] — triggers LANGUAGE_BARRIER if assignee lacks these |
| `effort_investigate_days` | DECIMAL(6,2) DEFAULT 0 | |
| `effort_design_days` | DECIMAL(6,2) DEFAULT 0 | |
| `effort_implement_days` | DECIMAL(6,2) DEFAULT 0 | |
| `effort_testing_days` | DECIMAL(6,2) DEFAULT 0 | |
| `effort_review_days` | DECIMAL(6,2) DEFAULT 0 | |
| `effort_support_days` | DECIMAL(6,2) DEFAULT 0 | |
| `effort_total_days` | DECIMAL(6,2) GENERATED | Sum of above |
| `planned_start` | DATE NULLABLE | |
| `planned_end` | DATE NULLABLE | |
| `actual_start` | DATE NULLABLE | |
| `actual_end` | DATE NULLABLE | |
| `cocomo_size_points` | DECIMAL(10,2) NULLABLE | COCOMO II function points |
| `position_x` | DECIMAL(8,2) | Vị trí trên 3D board |
| `position_z` | DECIMAL(8,2) | Vị trí trên 3D board |
| `llm_analysis` | JSONB NULLABLE | Raw LLM analysis output |
| `created_at` | TIMESTAMPTZ | |

### `task_dependencies`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `task_id` | UUID FK → tasks | Task phụ thuộc (phải đợi) |
| `depends_on_task_id` | UUID FK → tasks | Task phải xong trước |
| `dependency_type` | ENUM(finish_to_start, start_to_start, finish_to_finish) | Default: finish_to_start |
| `lag_days` | DECIMAL(4,1) DEFAULT 0 | Độ trễ sau khi dependency hoàn thành |

### `resource_assignments`
Phân bổ nhân sự vào task với tỷ lệ WFU.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `task_id` | UUID FK → tasks | |
| `personnel_id` | UUID FK → personnel | |
| `allocation_pct` | DECIMAL(5,2) | % WFU dành cho task này |
| `wfu_mode` | ENUM(standard, fast, quality) DEFAULT standard | **User-selected** multiplier mode — fast=1.2×, quality=1.5×, only available when skill matches task techstack |
| `effective_wfu` | DECIMAL(4,2) | Computed: base_wfu × multiplier × allocation_pct |
| `is_lead` | BOOLEAN DEFAULT false | |
| `assigned_at` | TIMESTAMPTZ | |
| `assigned_by` | UUID FK → users | |

### `task_progress_logs`
Daily progress updates từ members.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `task_id` | UUID FK → tasks | |
| `personnel_id` | UUID FK → personnel | |
| `log_date` | DATE | |
| `completion_pct` | DECIMAL(5,2) | Cumulative % hoàn thành |
| `notes` | TEXT NULLABLE | |
| `hours_spent` | DECIMAL(4,1) | |
| `created_at` | TIMESTAMPTZ | |

### `project_warnings`
Warnings được compute và lưu lại.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `scenario_id` | UUID FK → scenarios | |
| `warning_type` | ENUM(capacity, junior_alone, time_risk, language_barrier, budget, license, skill_mismatch, dependency) | |
| `severity` | ENUM(critical, warning, info) | |
| `entity_type` | VARCHAR(50) | "personnel", "task", "project" |
| `entity_id` | UUID | ID của entity liên quan |
| `message` | TEXT | Human-readable warning |
| `data` | JSONB | Detail data cho warning |
| `is_acknowledged` | BOOLEAN DEFAULT false | |
| `created_at` | TIMESTAMPTZ | |
| `resolved_at` | TIMESTAMPTZ NULLABLE | |

### `xp_events`
Ghi nhận XP khi kết thúc dự án.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `personnel_id` | UUID FK → personnel | |
| `project_id` | UUID FK → projects | |
| `skill_name` | VARCHAR(100) NULLABLE | Skill được nâng cấp |
| `xp_amount` | INTEGER | |
| `reason` | ENUM(task_completed, early_delivery, new_skill, quality_bonus, mentoring) | |
| `description` | TEXT NULLABLE | |
| `created_at` | TIMESTAMPTZ | |

### `project_tool_licenses`
Budget cho công cụ/license của dự án (e.g., Claude Code, GitHub Copilot).

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `project_id` | UUID FK → projects | |
| `tool_name` | VARCHAR(100) | e.g., "Claude Code", "GitHub Copilot" |
| `total_seats` | INTEGER | Số ghế được cấp cho dự án |
| `cost_per_seat_monthly` | DECIMAL(10,2) NULLABLE | |
| `created_at` | TIMESTAMPTZ | |

### `tool_seat_assignments`
Phân bổ tool seat cho từng nhân sự.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `tool_license_id` | UUID FK → project_tool_licenses | |
| `personnel_id` | UUID FK → personnel | |
| `assigned_at` | TIMESTAMPTZ | |

### `scenario_completion_snapshots`
Lưu P(on_time) được tính theo thời gian — dùng để vẽ trend chart.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `scenario_id` | UUID FK → scenarios | |
| `computed_at` | TIMESTAMPTZ | |
| `p_on_time` | DECIMAL(5,4) | 0.0–1.0 probability |
| `eac_date` | DATE | Estimated Actual Completion date |
| `days_delta` | DECIMAL(6,1) | Positive = ahead, Negative = behind deadline |
| `spi` | DECIMAL(5,3) | Schedule Performance Index at time of snapshot |
| `active_risk_count` | INTEGER | Số warnings đang active |

### `llm_sessions`
Lưu lịch sử các LLM interactions cho audit và replay.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `project_id` | UUID FK → projects NULLABLE | |
| `scenario_id` | UUID FK → scenarios NULLABLE | |
| `session_type` | ENUM(task_generation, risk_analysis, optimization_prompt, general) | |
| `prompt` | TEXT | |
| `response` | TEXT | |
| `model_used` | VARCHAR(100) | |
| `created_by` | UUID FK → users | |
| `created_at` | TIMESTAMPTZ | |

---

## Indexes

```sql
-- Lookup by org
CREATE INDEX idx_personnel_org ON personnel(org_id);
CREATE INDEX idx_projects_org ON projects(org_id);

-- Lookup tasks by scenario
CREATE INDEX idx_tasks_scenario ON tasks(scenario_id);

-- Warning queries
CREATE INDEX idx_warnings_scenario ON project_warnings(scenario_id, is_acknowledged);

-- Progress queries
CREATE INDEX idx_progress_task_date ON task_progress_logs(task_id, log_date);

-- Assignment lookups
CREATE INDEX idx_assignments_personnel ON resource_assignments(personnel_id);
CREATE INDEX idx_assignments_task ON resource_assignments(task_id);

-- Tool license lookups
CREATE INDEX idx_tool_licenses_project ON project_tool_licenses(project_id);
CREATE INDEX idx_seat_assignments_tool ON tool_seat_assignments(tool_license_id);

-- Completion probability trend
CREATE INDEX idx_completion_snapshots_scenario ON scenario_completion_snapshots(scenario_id, computed_at);

-- Language lookups
CREATE INDEX idx_personnel_languages ON personnel_languages(personnel_id);
```

---

## Key Business Rules (Enforced at DB Level)

```sql
-- Không thể phụ thuộc vào chính mình
ALTER TABLE task_dependencies ADD CONSTRAINT no_self_dependency
  CHECK (task_id != depends_on_task_id);

-- Tỷ lệ phân bổ 0-100%
ALTER TABLE resource_assignments ADD CONSTRAINT valid_allocation
  CHECK (allocation_pct > 0 AND allocation_pct <= 100);

-- WFU multiplier hợp lệ
ALTER TABLE skill_matrix_entries ADD CONSTRAINT valid_multiplier
  CHECK (wfu_multiplier_standard >= 0.5 AND wfu_multiplier_quality <= 3.0);
```
