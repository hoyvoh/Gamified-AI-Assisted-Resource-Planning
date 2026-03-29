---
title: "AI-Assisted Resource Insight Engine — Design Document"
scope: Pillar 2 (Resource Analysis) — Standalone Feedback & Insight Module
status: design draft
date: 2026-03-29
format: workflow-only, no code
mvp_one_liner: >
  Pillar 2 as a standalone MVP does not automate KPI judgment; it helps managers review better
  by collecting work signals from predefined sources, summarizing insights, and recommending
  improvement actions with human confirmation.
---

# AI-Assisted Resource Insight Engine — Design Document

---

## 1. Tổng Quan Hệ Thống

### 1.1 Mục đích

**AI-Assisted Resource Insight Engine** là module phân tích hành vi developer từ dữ liệu GitHub, Slack, và Confluence — thuộc **Pillar 2 — Resource Analysis**.

**MVP goal:** Biến dữ liệu làm việc rời rạc thành feedback có cấu trúc và có thể hành động được.

**Chạy độc lập** — không phụ thuộc Pillar 1, không cần chờ Pillar 3/4. Tận dụng Predefined Source Scope đã được cấu hình sẵn theo team.

**Không phải:** full HR analytics, project staffing optimization, KPI automation, performance review tự động, công cụ thay thế manager trong việc ra quyết định.

**Là:** Công cụ hỗ trợ manager/lead review tốt hơn, bằng cách thu thập tín hiệu làm việc, tổng hợp insight, và đề xuất hành động cải thiện có căn cứ dữ liệu.

**Người dùng nhận được trong MVP:**
- Strengths — điểm mạnh quan sát được từ dữ liệu
- Recurring issues — các vấn đề lặp lại theo pattern
- Collaboration trends — xu hướng phối hợp với team
- KPT draft — Keep / Problem / Try để manager chỉnh và dùng
- Recommended actions — gợi ý hành động cụ thể có evidence
- Review draft — nháp feedback để manager xác nhận, không tự động publish

### 1.2 Nguyên Tắc Vận Hành (AI Operating Principles)

```
AI không tự chấm KPI cuối cùng.
AI không tự ra quyết định promotion / retention.

AI chỉ hỗ trợ:
  ├── Collect     — thu thập dữ liệu từ các nguồn đã được ủy quyền
  ├── Summarize   — tóm tắt pattern từ dữ liệu thô
  ├── Detect      — phát hiện xu hướng lặp lại và bất thường
  ├── Recommend   — đề xuất hành động cải thiện có căn cứ
  └── Draft       — sinh bản nháp review để human review và confirm

Kết luận chính thức PHẢI được human confirm trước khi dùng.
```

Nguyên tắc này không phải opt-in — đây là ràng buộc kiến trúc. System không có flow nào publish output cuối mà không qua human confirmation step.

### 1.3 Kiến trúc tổng quan (Team-scoped view)

```
┌──────────────────────────────────────────────────────────────────┐
│            AI-Assisted Resource Insight Engine                   │
│                                                                  │
│  [Scope: Team ▾ | Developer ▾ | Period: 30 / 60 / 240 work days] │
│                                                                  │
│  ┌──────────────────────┐  ┌───────────────────────────────────┐ │
│  │  Tab 1: Activity     │  │  Tab 2: Analysis Dashboard        │ │
│  │  History Feed        │  │                                   │ │
│  │                      │  │  [Personality] [Technical]        │ │
│  │  Timeline:           │  │  [Soft Skills] [Output Quality]   │ │
│  │  - PR created/merged │  │  [Insight Summary] [KPT Draft]    │ │
│  │  - Reviews given     │  │                                   │ │
│  │  - Feedback handled  │  │  Each sub-tab = 1 API             │ │
│  │  - Issues raised     │  │  Each score = evidence chain      │ │
│  │  - Confluence edits  │  │  [⚠ Human confirm before export]  │ │
│  │    (if available)    │  └───────────────────────────────────┘ │
│  └──────────────────────┘                                        │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │  Tab 3 (small): Slack Work Conversations                      ││
│  │  [Filtered: technical_question | delivery | blocker |         ││
│  │   feedback | decision — NOT: greetings, small talk]           ││
│  └──────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. Data Collection Layer

### 2.1 Team-Scoped Candidate Graph

Thay vì quét toàn bộ department hoặc yêu cầu cấu hình lại mỗi lần chạy, hệ thống lấy **team làm đối tượng mặc định** và xây candidate graph từ Predefined Source Scope đã có sẵn.

**Tại sao team-scoped thay vì department-wide:**

| Tiêu chí | Team-scoped candidate graph | Department-wide scanning |
|----------|-----------------------------|--------------------------|
| **Relevance** | Dữ liệu gắn sát với team đang cần review | Kéo vào repo/channel không liên quan |
| **Noise** | Thấp — chỉ đọc nguồn đã được định nghĩa | Cao — nhiều context chồng chéo |
| **Governance** | Ranh giới quyền truy cập rõ ràng | Khó kiểm soát scope |
| **Human validation** | Manager dễ hiểu vì sao chọn phạm vi này | Khó xác nhận toàn bộ scope |

**Candidate graph bao gồm:**
```
team_candidate_graph = {
  members:       [list of GitHub usernames on the team],
  repos:         [GitHub org/repos đã được định nghĩa trong source scope],
  slack_channels: [channels relevant to team, nếu Slack authorized],
  confluence:    [spaces/pages liên quan, nếu Confluence authorized],
  time_range:    derived từ period parameter
}
```

Candidate graph được **đề xuất tự động** từ Predefined Source Scope → Manager/Lead **confirm nhanh** → collection bắt đầu.

---

### 2.2 Predefined Source Scope

Predefined Source Scope là cấu hình ổn định cho một team hoặc project trong suốt vòng đời. Không cần tái cấu hình ở mỗi đợt collect trừ khi có thay đổi quản trị.

```
predefined_source_scope = {
  github: {
    org:   "your-org",
    repos: ["org/backend", "org/frontend", "org/infra"],
    members: ["dev1", "dev2", "dev3", "lead1"]
  },
  slack: {                                  # optional
    workspace_id: "T123ABC",
    channels: ["#backend-dev", "#sprint-standup", "#incident-response"]
  },
  confluence: {                             # optional
    space_key: "ENG",
    root_page_id: "12345"
  },
  review_contexts: [                        # optional, for output framing
    "monthly_feedback",
    "sprint_retrospective",
    "1on1_coaching",
    "pre_review_preparation"
  ]
}
```

Scope này được **đọc lại mỗi lần collect** nhưng chỉ **chỉnh sửa khi có thay đổi cấu trúc team** (người mới vào, repo mới, project đổi phạm vi).

---

### 2.3 Input Chính — Phase 1 MVP

**In scope:**

| Source | Data | Priority |
|--------|------|----------|
| GitHub | commit history, pull requests, code review comments, issue activity | Primary |
| Slack | thread responses, mentions, collaboration cadence, cross-team interaction | Optional |
| Confluence | page authorship, edit history, knowledge sharing traces | Optional |
| Review context | monthly feedback / sprint retro / 1:1 coaching / pre-review prep | Optional |

**Out of scope cho phase đầu:**

```
✗ project requirements vector từ Pillar 1
✗ staffing constraints từ Pillar 3
✗ WFU factors dùng cho allocation
✗ scenario/execution data của Pillar 4
✗ tái định nghĩa thủ công source scope ở mỗi đợt collect
✗ department-wide scanning mặc định
✗ full org-wide historical intelligence nếu data chưa sạch
```

---

### 2.4 Luồng Thu Thập — 9 Bước

```
Bước 1 — Scope Selection
  Người dùng chọn team (default) hoặc drill-down sang individual developer.
  Input: team_id + period (30 / 60 / 240 working days)

Bước 2 — Load Predefined Source Scope
  Hệ thống đọc source scope đã được cấu hình cho team/project.
  Không yêu cầu tái cấu hình nếu scope ổn định.
  Output: repos list, member list, channels, confluence spaces

Bước 3 — Build Candidate Graph
  Từ source scope, tự động gom:
    ├── Repos có contribution của team members trong period
    ├── Channels Slack liên quan (nếu authorized)
    ├── Confluence pages liên quan (nếu authorized)
    └── Members có activity trong period
  Output: candidate_graph (đề xuất, chưa collect)
  → Manager confirm phạm vi trước khi tiếp tục

Bước 4 — Data Collection
  GitHub (primary):
    ├── Contribution calendar
    ├── PRs authored + review threads
    ├── Reviews given (state + inline comments)
    ├── Issues created + issue comments
    └── Activity event feed

  Slack (optional, nếu authorized):
    ├── Messages trong pre-approved channels
    └── Thread participation + @mention patterns

  Confluence (optional, nếu authorized):
    ├── Page authorship + edit history
    └── Comment traces per page

Bước 5 — Signal Extraction
  Chuyển dữ liệu thô thành signals có ý nghĩa:
    ├── review_participation:          ai review cho ai, tần suất, chất lượng
    ├── response_cadence:              tốc độ phản hồi review/mention/question
    ├── requirement_clarification:     hành vi làm rõ yêu cầu (issue quality, Slack questions)
    ├── support_mentoring_signals:     review comment depth, knowledge sharing
    ├── delivery_consistency:          merge rate, cycle time, on-time pattern
    └── collaboration_network:         ai interact với ai, ai unblock ai

Bước 6 — AI Insight Analysis
  AI tổng hợp signals thành insights:
    ├── Strengths:            điểm mạnh có pattern lặp lại, có evidence
    ├── Concerns:             vấn đề lặp lại cần chú ý
    ├── Recurring patterns:   xu hướng hành vi đặc trưng
    └── Growth opportunities: cơ hội phát triển có thể hành động được

Bước 7 — Draft Generation
  AI sinh bản nháp:
    ├── Insight summary:       tóm tắt nhanh điểm mạnh + điểm cần chú ý
    ├── KPT draft:             Keep / Problem / Try có evidence
    ├── Recommended actions:   gợi ý hành động cải thiện cụ thể
    └── Review draft:          nháp feedback để manager chỉnh và xác nhận

Bước 8 — Human Confirmation  ← MANDATORY, không thể bypass
  Manager/Lead:
    ├── Xem lại toàn bộ draft
    ├── Sửa câu chữ nếu cần
    ├── Loại bỏ insight không đúng context
    └── Confirm nội dung cuối cùng

Bước 9 — Finalization
  Xuất bản feedback sau khi human đã confirm.
  Dùng cho: 1:1, retrospective, coaching follow-up, review preparation.
  Lưu: audit log ghi rõ ai confirm, lúc nào, thay đổi gì so với AI draft.
```

### 2.5 Working Days Calculation

```
Period = "last N working days" means:
  1. Start from today going backwards
  2. Skip weekends (Sat, Sun)
  3. Skip public holidays (configurable list per country/region)
  4. Count N actual working days

30 working days ≈ 6 weeks
60 working days ≈ 3 months
240 working days ≈ 1 year
```

The period parameter controls ALL analysis — không có dữ liệu nào ngoài period window được đưa vào score.

---

## 3. Activity History Tab — Workflow

### 3.1 Event ingestion và classification

Mọi raw GitHub event được classify thành một `ActivityEvent`:

```
Raw GitHub event types → Activity History event types:

PullRequestEvent (opened)         → OUTPUT_CREATED
  + PR body available             → has_description_flag

PullRequestEvent (closed/merged)  → OUTPUT_DELIVERED or OUTPUT_ABANDONED
  + time from open to merge       → cycle_time signal

PullRequestReviewEvent (submitted) → REVIEW_GIVEN
  + state = CHANGES_REQUESTED     → REVIEW_BLOCKING
  + state = APPROVED              → REVIEW_SIGNOFF

Review comment posted on other's PR → FEEDBACK_GIVEN
  + comment body text             → stored for NLP

Review thread resolved by user    → FEEDBACK_HANDLED (as author)
  + resolution follows CHANGES_REQUESTED → feedback_cycle closed

Review thread resolved by reviewer → FEEDBACK_HANDLED (as reviewer)
  → reviewer closed their own thread after author addressed it

IssuesEvent (opened)              → PROBLEM_IDENTIFIED
  + labels: bug                   → ISSUE_BUG_REPORTED
  + labels: enhancement           → ISSUE_IMPROVEMENT_PROPOSED

IssueCommentEvent                 → DISCUSSION_PARTICIPATED

PushEvent                         → IMPLEMENTATION_WORK
  + commit count                  → work intensity signal
```

### 3.2 Activity feed rendering

Mỗi event trong Activity History tab được render với:

```
[timestamp]  [event_type_badge]  [summary text]
             [repo link]  [PR/Issue link]
             [evaluation_notes — subtle, collapsed by default]
```

Ví dụ rendering:
```
Mar 28  [REVIEW_BLOCKING]   Reviewed PR #89: "Add caching layer"
                            org/backend · 5 inline comments
                            → Requested changes: error handling, null safety
                            ▸ Signal: quality_gate_count +1 | review_comment_density: 5

Mar 27  [OUTPUT_CREATED]    Opened PR #156: "feat: user authentication"
                            org/backend · +287 -45 · 12 files
                            ▸ Signal: pr_body_length: 420 chars (good) | has_testing_notes: yes

Mar 26  [FEEDBACK_HANDLED]  Resolved 3 review threads on PR #150
                            Threads from: alice, bob
                            Response time: 4.5 hours average
                            ▸ Signal: feedback_receptiveness +3 | avg_response: 4.5h
```

### 3.3 Filtering trong Activity History

User có thể filter activity feed theo:
- Event type (OUTPUT / REVIEW / FEEDBACK / ISSUES / IMPLEMENTATION)
- Repo (dropdown from repos they've contributed to)
- Time range (đã có trong Period selector)

---

## 4. Slack Work Conversations Tab — Workflow

### 4.1 Collection → Classification pipeline

```
Step 1 — Pull raw messages
  Source: Slack export zip hoặc Slack API (authorized channels only)
  Scope: messages where user is author OR where user is mentioned

Step 2 — Pre-filter (rule-based, fast)
  DROP: messages ≤ 15 chars
  DROP: emoji-only messages
  DROP: greetings pattern matching
  KEEP: messages with URLs, code blocks, or length > 80 chars
  KEEP: messages with @mentions of/to user

Step 3 — LLM classification (for ambiguous messages)
  Input: message text
  Output: {category: "WORK" | "SOCIAL", work_type: string | null}
  work_types: technical_question | technical_answer | delivery_update |
              feedback | blocker | decision | link_sharing | announcement

Step 4 — Store classified messages (SQLite slack_messages table)
  Fields: user, channel, text, timestamp, work_type, raw_message_id

Step 5 — Render in UI
  Display: filtered list sorted by timestamp
  Group by: date
  Show: work_type badge + message text + channel
  Hide: SOCIAL category messages
```

### 4.2 Display format trong Tab 3

```
[Date group: March 28, 2026]

#backend-channel  [TECHNICAL_QUESTION]  14:30
  "Anyone know why the JWT expiry isn't being validated?
   I'm seeing tokens being accepted past their exp field."

#backend-channel  [TECHNICAL_ANSWER]  15:45
  "The middleware is checking signature but not expiry claim.
   Fix: add `options.ignoreExpiration = false` in verify()"

[Date group: March 27, 2026]

#general-eng  [DELIVERY_UPDATE]  10:15
  "PR #156 is up for auth implementation — ready for review.
   https://github.com/org/backend/pull/156"

#backend-channel  [BLOCKER]  16:00
  "Blocked on DB migration for PR #148 — waiting for DevOps
   to run migration on staging. ETA?"
```

### 4.3 Communication signals extracted from Slack

Sau khi classification, các signals được tính:
- `questions_asked`: count of `technical_question` work_type
- `answers_given`: count of `technical_answer` work_type
- `blockers_flagged`: count of `blocker` work_type (proactive impediment reporting)
- `delivery_updates`: count of `delivery_update` work_type
- `response_time_when_mentioned`: median time from @mention to reply
- `knowledge_sharing_rate`: link_sharing + technical_answer combined

---

## 5. Analysis API Design — Các Tab Phân Tích

### 5.1 API Inventory

Mỗi tab phân tích = 1 API endpoint riêng biệt, chạy độc lập, có thể refresh độc lập.

```
# Data tabs
GET /api/users/{username}/activity-history?period=60&page=1
GET /api/users/{username}/slack-conversations?period=60&page=1

# Analysis APIs (Phase 1 MVP — core)
GET /api/users/{username}/technical?period=60
GET /api/users/{username}/soft-skills?period=60
GET /api/users/{username}/insight-summary?period=60         ← MVP priority
GET /api/users/{username}/kpt-draft?period=60               ← MVP priority

# Analysis APIs (Phase 2 — deeper)
GET /api/users/{username}/personality?period=60
GET /api/users/{username}/output-quality?period=60

# Team-level
GET /api/teams/{team_id}/insight-summary?period=60

# Control
POST /api/users/{username}/refresh?scope=all|technical|soft-skills|insight|kpt
POST /api/users/{username}/kpt-draft/{draft_id}/confirm     ← human confirmation gate
POST /api/users/{username}/kpt-draft/{draft_id}/publish     ← only allowed after confirm
```

**Luật quan trọng về publish:** `/publish` endpoint sẽ trả về HTTP 403 nếu `/confirm` chưa được gọi trước đó. System không thể bỏ qua bước human confirmation.

### 5.2 API — Personality (OCEAN + Behavioral Preferences)

**Input:** GitHub text corpus (PR bodies, review comments, issue descriptions, Slack messages)

**Sub-sections:**

```
Section A: OCEAN Trait Scores
  5 axes × {score: 1–5, confidence: 0–1, evidence: [...]}
  + narrative: 2-paragraph personality summary

Section B: Behavioral Preference Profile
  6 axes:
    work_rhythm:          consistent / burst / irregular
    collaboration_style:  solo-focused / mixed / collaborative
    problem_preference:   distribution: {features, bugs, refactor, infra}
    review_style:         rubber-stamp / adequate / thorough / exceptional
    communication_style:  terse / adequate / detailed / exceptional
    domain_preference:    specialist / T-shaped / generalist

Section C: Interpretation
  "This developer profile suggests best fit for: [roles/project types]"
  "Likely challenges: [descriptions]"
  "Work with them best by: [collaboration tips]"
```

**Evidence format per score:**
```
openness: {
  score: 3.8,
  confidence: 0.72,
  evidence: [
    "PR #45: proposed Redis caching as alternative to session state — novel approach",
    "PR #67: referenced Hexagonal Architecture pattern in PR description",
    "Review on #89: suggested EventSourcing approach unprompted"
  ],
  rationale: "Regularly references new patterns and approaches (score 3–4 range).
              Not yet at 4+ because novel approaches not yet adopted by team consistently."
}
```

---

### 5.3 API — Technical Profile

**Sub-sections:**

```
Section A: Tech Stack Map
  For each technology the user has meaningfully contributed to:
    {
      technology: "TypeScript",
      first_contribution: "2023-06",
      last_contribution: "2026-03",
      active_months: 14,
      pr_count: 47,
      dreyfus_level: 4,
      evidence: ["PR #45 introduced generic type utilities...", "Reviewed TypeScript PRs..."]
    }

Section B: Technical Interests & Values
  What does this person focus on in their reviews and PRs?
  {
    primary_values: ["testing", "error_handling", "code_readability"],
    value_distribution: {
      testing: 0.32,
      error_handling: 0.28,
      code_readability: 0.20,
      performance: 0.12,
      documentation: 0.08
    },
    value_evidence: {
      testing: [
        "PR #23 review: 'Missing test for null input case'",
        "PR #41 review: 'Need to add integration test for this flow'",
        "PR #67 review: 'Good test coverage here, this pattern should be the standard'"
      ]
    }
  }

Section C: Capability Profile
  8 technical axes × Dreyfus score + evidence
  T-shape visualization data:
    depth_axes:   [axes with score >= 4]
    breadth_axes: [axes with score 2-3]
    gaps:         [axes with score 1]

Section D: Skill Gap → Level-Up Recommendations
  3–5 specific, evidenced improvement areas
  Format: {dimension, current_score, target_score, gap_evidence, action_item}
```

---

### 5.4 API — Soft Skills Profile

**Sub-sections:**

```
Section A: 8 Soft Skill Scores
  communication_clarity:   score + confidence + evidence
  collaboration:           score + confidence + evidence
  feedback_receptiveness:  score + confidence + evidence
  initiative:              score + confidence + evidence
  mentorship:              score + confidence + evidence
  adaptability:            score + confidence + evidence
  problem_framing:         score + confidence + evidence
  conflict_navigation:     score + confidence + evidence (LOW CONFIDENCE flagged)

Section B: Social Graph Signals
  Who reviews for whom:
    "hoyvoh reviews 3x more than they receive from the team"
    "hoyvoh is most often reviewed by: alice (40%), bob (30%)"
  Response patterns:
    "Average response to @mention: 3.2 hours (good)"
    "Average reply-to-review-request: 18 hours (needs improvement)"

Section C: Peer Relationship Quality
  Note: VERY limited inferability from GitHub data. Flag clearly.
  Proxy signals:
    - Mentions received from others (do people tag them?)
    - "Thanks" or acknowledgement messages directed at them
    - Number of developers who actively request their review

Section D: Growth Mindset Signals
  cross_pr_learning_score:   evidence of applying past review feedback in later PRs
  tech_expansion_rate:       new techstacks added per 6 months
  question_asking_frequency: technical questions in Slack (curiosity proxy)
  documentation_growth:      improvement in PR description quality over time
```

---

### 5.5 API — Output Quality

**Sub-sections:**

```
Section A: Delivery Metrics
  pr_merge_rate:           X% (with period and benchmark)
  avg_cycle_time_days:     X days P50, Y days P90
  estimate_accuracy:       if task estimates available (future: Jira integration)
  abandoned_pr_rate:       closed without merge

Section B: Code Quality Signals
  first_pass_approval_rate:   % PRs approved without CHANGES_REQUESTED
  avg_review_iterations:      avg CHANGES_REQUESTED rounds per PR
  review_comments_per_100_lines: density of issues reviewers find
  test_coverage_rate:         % feature PRs with test files changed
  ci_pass_first_push_rate:    % PRs where CI passes without extra pushes

Section C: Output Artifacts Quality
  pr_description_quality:  LLM-scored quality of PR bodies (average)
  issue_quality:           LLM-scored quality of issue descriptions
  commit_message_quality:  LLM-scored quality of commit messages
  Sample artifacts:        3 best + 3 worst PR descriptions as examples

Section D: Growth Trajectory
  6-month trend lines for each quality metric:
    - merge_rate:        trending up/down/flat
    - review_iterations: trending up (bad) / down (good) / flat
    - test_coverage:     trending up/down/flat
  Overall trajectory:   IMPROVING / STABLE / DECLINING + confidence
  Notable improvements: "Review rejection rate dropped from 45% to 22% in last 3 months"
  Notable concerns:     "CI pass rate declining since January"
```

---

### 5.6 API — Insight Summary ← MVP Priority

**Mục đích:** Tổng hợp nhanh insight từ mọi signal layer, trả về cái người manager cần nhất — không phải raw scores.

**Sub-sections:**

```
Section A: Strengths (3–5 items)
  Mỗi item:
    title:    "Consistent delivery — 92% PR merge rate"
    evidence: [PR list, period stats]
    pattern:  "Observed across 60 working days, consistent across 3 repos"

Section B: Recurring Issues (2–4 items)
  Mỗi item:
    title:    "PR descriptions often lack testing context"
    evidence: ["PR #45: no testing notes", "PR #67: no testing notes", ...]
    frequency: "7 of last 10 PRs"
    impact:   "Reviewers frequently ask 'how do I test this?' — adds review cycle time"

Section C: Collaboration Trends
  Summary: "Active reviewer — gives 40% more reviews than receives"
  Notable: "Cross-team reviews increased in last 30 days"
  Network: {who_they_work_closely_with: [...], who_reviews_for_them: [...]}

Section D: Growth Signal
  Trajectory: IMPROVING | STABLE | DECLINING
  Evidence:   "Review rejection rate: 45% (90 days ago) → 22% (now)"
  Note:       "This is an AI-inferred trend — manager should confirm with direct observation"
```

**Tone của output:** Factual, neutral, evidence-backed. Không dùng ngôn ngữ phán xét như "this developer is lazy" — chỉ mô tả pattern observable từ data.

---

### 5.7 API — KPT Draft + Review Draft ← MVP Priority

**Mục đích:** Sinh bản nháp structured feedback để manager xem lại, chỉnh sửa, và xác nhận — không tự publish.

```
KPT Draft output:
  draft_id: "kpt_hoyvoh_2026Q1_draft1"
  status:   "AI_DRAFT" → "HUMAN_REVIEWING" → "CONFIRMED" → "PUBLISHED"
  period:   "last 60 working days (2025-12-01 to 2026-03-29)"

  keep: [
    {
      point:    "Maintains high delivery consistency",
      evidence: "92% PR merge rate, P50 cycle time 1.8 days",
      manager_note: ""   ← editable by manager
    },
    {
      point:    "Strong review quality — inline comments explain why, not just what",
      evidence: "Review on PR #89: 5 comments with code examples and rationale",
      manager_note: ""
    }
  ]

  problem: [
    {
      point:    "PR descriptions frequently missing testing context",
      evidence: "7/10 recent PRs have no 'How to Test' section",
      manager_note: ""
    }
  ]

  try: [
    {
      point:    "Add a 3-line 'How to Test' section to every PR before requesting review",
      rationale: "Addresses the missing testing context pattern observed",
      manager_note: ""
    }
  ]

  recommended_actions: [
    {
      action:   "Discuss the PR description pattern in next 1:1",
      priority: "high",
      evidence: "Pattern observed in 7/10 PRs — likely habit, not one-off"
    }
  ]

  review_draft: "
    [dev name] has been consistently delivering work on time with high merge rates.
    A strong reviewer — provides detailed, educational comments on others' PRs.
    One area to focus on: adding testing context to PR descriptions, which will
    reduce review round-trips and help reviewers validate changes faster.
    Recommended next step: discuss in next 1:1 and agree on a PR template.
  "

  ai_confidence_note: "Scores based on GitHub data only. Slack and Confluence data
                       not available for this period. Soft skill inferences have
                       medium confidence — please validate with direct observation."

  human_confirmation: {
    confirmed_by: null,          ← filled on confirm
    confirmed_at: null,
    changes_made: [],            ← list of fields edited by human
    published_at: null
  }
```

**Human confirmation flow:**
```
Manager opens KPT Draft in UI
  → Reads through AI-generated points
  → Edits any point (manager_note field OR direct text edit)
  → Removes irrelevant points (with required reason)
  → Clicks "Confirm & Use"
    → status changes to CONFIRMED
    → human_confirmation.confirmed_by + confirmed_at recorded
  → Clicks "Publish" (for 1:1 or Confluence export)
    → status changes to PUBLISHED
    → audit log entry created
```

---

## 6. Database Schema — SQLite, Local, Auto-create

### 6.1 Schema overview

```
On first startup: auto-create all tables if not exist

Core tables:
  users                 — GitHub user profiles
  teams                 — Team metadata
  source_scopes         — Predefined source scope per team/project
  candidate_graphs      — Saved candidate graph confirmations per run

GitHub data tables:
  pull_requests         — PRs authored with body + metadata
  reviews_given         — Review submissions by user
  review_comments       — Inline review comments (given + received, flagged)
  review_threads        — Thread resolution state
  issues                — Issues created by user
  issue_comments        — Comments on issues
  activity_events       — Processed activity history feed
  contribution_calendar — Daily contribution counts
  tech_contributions    — Tech stack evidence per user per tech

Slack/Confluence tables:
  slack_messages        — Filtered work messages (work_type classified)
  confluence_pages      — Page authorship + edit history (if Confluence enabled)

Analysis tables:
  profile_scores        — Computed dimension scores with evidence JSON
  insight_summaries     — Insight summary output per (user, period, run_date)

Draft + confirmation tables:
  kpt_drafts            — KPT draft + review draft output
  draft_confirmations   — Human confirmation records (who, when, what changed)

Audit tables:
  computation_runs      — Log of every analysis run
  period_configs        — User-defined period configurations
```

### 6.2 Key schema decisions

**Evidence stored as JSON column:**
```sql
profile_scores:
  user TEXT,
  layer TEXT,           -- personality | technical | soft_skills | output_quality
  dimension TEXT,       -- ocean_openness | dreyfus_coding | communication | etc.
  score REAL,
  confidence REAL,
  evidence_json TEXT,   -- JSON array of evidence objects
  period_days INTEGER,  -- 30 | 60 | 240
  computed_at TEXT,
  period_start TEXT,
  period_end TEXT
```

**Activity history as denormalized feed:**
```sql
activity_history:
  id INTEGER PRIMARY KEY,
  user TEXT,
  event_type TEXT,      -- OUTPUT_CREATED | REVIEW_BLOCKING | FEEDBACK_HANDLED | etc.
  summary TEXT,         -- human-readable one-line summary
  detail_json TEXT,     -- full event details
  source_type TEXT,     -- github_pr | github_review | github_issue | slack
  source_ref TEXT,      -- URL or identifier
  created_at TEXT,
  evaluation_weight REAL  -- 0–1, how much this event weighs in scoring
```

### 6.3 Incremental update strategy

Không re-fetch toàn bộ dữ liệu mỗi lần refresh. Chỉ collect events sau `last_collected_at`:

```
Per user, store: {last_github_event_id, last_collection_timestamp}
On refresh:
  Collect only events after last_collection_timestamp
  Re-compute scores only for layers marked stale
  Stale trigger: new data count > threshold (e.g., 5 new PRs)
```

---

## 7. Period Parameter API

### 7.1 Period configuration

```
Period parameter: last N working days
  Supported values: 30 | 60 | 240 (expandable)

  30 working days:  ≈ 6 calendar weeks     → short-term view, recent behavior
  60 working days:  ≈ 3 calendar months    → medium-term, quarterly pattern
  240 working days: ≈ 12 calendar months   → annual pattern, longitudinal growth

  Custom period: date_from + date_to (advanced mode, future feature)
```

### 7.2 Period effects on analysis

```
Short periods (30 days):
  + Reflects current behavior accurately
  - Less stable (one unusual PR can skew scores significantly)
  - Insufficient corpus for OCEAN inference (< 50 messages → LOW_CONFIDENCE flag)

Long periods (240 days):
  + More stable statistical signals
  + Better growth trajectory data
  - May not reflect recent changes (person may have grown significantly)
  - Stale skills data (left a technology 6 months ago but still shows up)

Recommendation: 60 working days as default for most use cases.
```

### 7.3 Period in API calls

```
All analysis APIs take period as query param:
  GET /api/users/{username}/technical?period=60

Server derives:
  working_day_count = 60
  date_to = today
  date_from = today minus (60 × 7/5 calendar days) with working day adjustment

Scores are computed from data within [date_from, date_to] only.
Profile snapshots are cached per (username, period, date) tuple.
Cache TTL: 24 hours (re-compute if period changes or new data arrives)
```

---

## 8. Critique — Thiếu Gì Cho Decision Making

Đây là phần quan trọng nhất: thiết kế hiện tại có những lỗ hổng nào cần bổ sung để đủ dùng cho decision making thực sự.

### 8.1 Missing: Task/Ticket Context

**Vấn đề:** GitHub data không có context về task complexity. Một PR nhỏ có thể là task cực khó (bug deep in legacy code) hoặc task tầm thường (renaming a variable). Thiếu context này làm cho:
- Delivery speed scores bị distort (fast PR ≠ easy task)
- Quality scores thiếu context (zero tests trong hotfix vs. feature)
- Effort estimates không chính xác (10 additions có thể là 2 ngày debug)

**Cần thêm:** Jira/Linear/GitHub Issues integration để lấy task metadata: story points, priority, type (bug/feature/chore), estimated effort.

---

### 8.2 Missing: Team Benchmark

**Vấn đề:** Score 3.5/5 cho "PR merge rate" không có ý nghĩa gì nếu không biết team average là bao nhiêu. Một score 3.5 với team average 2.0 là xuất sắc; với team average 4.5 là đáng lo ngại.

**Cần thêm:**
- Team-level aggregates cho mọi dimension
- Percentile ranking: "hoyvoh is in top 30% for review quality within the team"
- Peer group comparison: compare against developers at same seniority level

---

### 8.3 Missing: Codebase Complexity Context

**Vấn đề:** Diff size không đo complexity thực. 500 lines trong a well-structured module ≠ 500 lines trong tangled legacy code. Không có codebase complexity signal thì cannot fairly compare contributions across repos.

**Cần thêm:**
- Cognitive complexity metrics (cyclomatic complexity per PR)
- Codebase age/technical debt level of the files touched
- "Brave contribution" flag: modified files that have high churn history (risky code)

---

### 8.4 Missing: Role Context

**Vấn đề:** Expectations thay đổi hoàn toàn theo role. Một Tech Lead được kỳ vọng review nhiều, commit ít. Một Junior developer ngược lại. Thiếu role metadata thì:
- Review ratio có vẻ thấp với TL nếu họ có quá nhiều meetings
- Commit frequency thấp với senior có thể là họ đang design, không code

**Cần thêm:**
- Role field trong user profile (Junior / Mid / Senior / TL / Architect)
- Role-adjusted scoring weights (dùng formula trong `02_resource_radar_scoring_matrix.md` nhưng cần role input)
- "Expected for role" baseline per dimension

---

### 8.5 Missing: Qualitative Validation Layer

**Vấn đề:** Toàn bộ system infers từ digital traces. Có những case system không thể biết:
- Developer đang mentoring bằng pair programming (invisible)
- PR quality thấp vì codebase legacy quá tệ, không phải do developer
- Soft skills excellent nhưng không thể hiện qua text (culture/personality type)
- Burnout visible trong behavior nhưng chưa flagged đúng cause

**Cần thêm:**
- Human validation layer: BOD/TL có thể annotate bất kỳ score nào với context note
- Confidence-weighted display: scores với low evidence hiển thị khác với high-confidence scores
- "Manual override" field per dimension với required rationale

---

### 8.6 Missing: Comparative Trajectory (Cross-Employee)

**Vấn đề:** Thiếu khả năng so sánh trajectory giữa các developers ở cùng một mức. "Is this growth rate normal for someone at this level?" không thể trả lời nếu chỉ nhìn một người.

**Cần thêm:**
- Cohort analysis: group developers by seniority + tenure → show percentile for growth trajectory
- "At this point in their career, what does healthy growth look like?"
- Anomaly detection: flag unusual trajectory drops or spikes for review

---

### 8.7 Missing: Time Allocation Signal

**Vấn đề:** Không biết developer đang spend time vào đâu. Contribution calendar nói "họ worked", nhưng không nói:
- Bao nhiêu % thời gian là meetings vs. coding vs. reviewing vs. onboarding người khác
- Có đang trên nhiều projects song song không → capacity split
- Context switching cost

**Cần thêm:**
- Calendar integration (Google Cal / Outlook) để detect meeting load
- Multi-project contribution detection (đang commit to >1 repo đồng thời)
- Estimated utilization rate (working days with activity / total working days)

---

### 8.8 Missing: Output Impact (Downstream Value)

**Vấn đề:** "Code quality" được đo bằng review acceptance, nhưng không đo được impact thực sự của output:
- PR #45 merged nhanh nhưng gây ra 3 bug reports 2 tuần sau
- PR #67 bị CHANGES_REQUESTED 3 lần nhưng là một architectural improvement được team rely on

**Cần thêm:**
- Bug attribution: link closed bugs to their originating PR (requires issue-PR link analysis)
- Longevity: how long does code authored by this person remain unchanged vs. frequently refactored
- Impact metrics: PRs that became "reference implementations" (other PRs copy their pattern)

---

### 8.9 Missing: Privacy và Consent Framework

**Vấn đề:** System thiếu explicit consent và transparency mechanisms:
- Developer không biết họ đang bị analyzed
- Không có "right to review own profile" flow
- Không có mechanism để contest incorrect inference
- GDPR/data privacy không được handle đúng cách

**Cần thêm:**
- Developer self-service: "View your own profile" feature
- Score appeal flow: "I think this score is wrong because..."
- Data retention controls: auto-deletion schedule visible + configurable
- Collection scope transparency: "We analyze these repos for this period"

---

## 9. In Scope và Out of Scope — Phase 1 MVP

| Nhóm | In Scope | Out of Scope |
|------|----------|--------------|
| **Data** | Team-scoped predefined GitHub (primary); Slack optional; Confluence optional; time range | Department-wide scanning mặc định; full org-wide historical intelligence nếu data chưa sạch |
| **Analysis** | Work signals, patterns, strengths, concerns, collaboration trends, KPT draft, recommended actions | Full 5-layer profile sâu (OCEAN đầy đủ, Dreyfus tất cả 8 axes, performance scoring chi tiết) |
| **Review output** | AI draft + human confirmation flow | Tự động hóa đánh giá cuối cùng hoặc publish không qua human confirm |
| **KPI** | Performance signals, growth indicators, observable trends | KPI engine chính thức; scoring cứng cho promotion/retention |
| **Staffing** | Future note — không làm ở MVP | Match score, team recommendation, allocation optimization |
| **HR decision** | Không làm ở bất kỳ phase nào trong isolation | Promotion, retention, compensation decision support tự động |

---

## 10. Thay Đổi So Với Spec/Proposal Trước

### 10.1 Flow chức năng

| Trước | Sau |
|-------|-----|
| Gắn chặt với project flow, output đổ sang planning board | Chạy **độc lập** như feedback/review module — không phụ thuộc Pillar 1 hay 3/4 |
| Phục vụ phân người cho dự án | Phục vụ **insight và coaching** trước tiên |
| Bắt đầu từ single-developer view | Bắt đầu từ **team-scoped candidate graph**, drill-down sang individual |
| Source scope tái cấu hình mỗi lần | Tận dụng **Predefined Source Scope** đã cấu hình sẵn |

### 10.2 Input thay đổi

```
Trước: GitHub + Slack + project requirements vector
Sau:   team scope + predefined source scope
         + GitHub (primary)
         + Slack (optional)
         + Confluence (optional)
         + review context (optional: monthly/retro/1:1/pre-review)
```

### 10.3 Output thay đổi

```
Trước:                        Sau:
  developer profiles      →     insight report (strengths + recurring issues)
  match score             →     KPT draft (AI-generated, human-confirmed)
  team recommendation     →     recommended actions (specific, evidence-backed)
  WFU enhancement         →     review draft (nháp để manager xác nhận)
```

### 10.4 Vai trò của AI

```
Trước (implicit): AI scores → outputs → flows into planning
Sau   (explicit): AI assists only:
                    collect → summarize → detect → recommend → draft
                  Human confirms all final outputs.
                  AI cannot publish anything without human gate.
```

**One-liner:**
> Pillar 2 độc lập không tự động chấm KPI, mà giúp người quản lý review tốt hơn bằng cách thu thập tín hiệu làm việc từ các nguồn đã được định nghĩa sẵn, tổng hợp insight, và gợi ý hành động cải thiện có căn cứ dữ liệu.

---

## 11. Implementation Priority (Recommended)

Nếu phải prioritize:

```
Phase 1 (MVP — core feedback value):
  ✓ Predefined Source Scope configuration
  ✓ Team-scoped candidate graph + manager confirmation flow
  ✓ Activity history feed (Tab 1) — GitHub events
  ✓ Technical profile API (stack, duration, Dreyfus levels)
  ✓ Soft skills API (collaboration, communication, initiative)
  ✓ Insight Summary API (strengths + recurring issues + trends)
  ✓ KPT Draft API + Human Confirmation gate + Publish flow
  ✓ Period filter (30/60/240 working days)
  ✓ SQLite local DB with auto-create

Phase 2 (richer signal):
  ○ Slack conversation filter tab (Tab 3)
  ○ Confluence page authorship + edit history
  ○ Personality API (OCEAN — needs LLM inference pipeline)
  ○ Output quality API (needs CI data + bug attribution)
  ○ Growth trajectory visualization

Phase 3 (decision quality):
  ○ Team benchmark / peer comparison
  ○ Role context adjustment
  ○ Bug attribution analysis
  ○ Privacy / consent / right-to-own-data framework
  ○ Confluence export của confirmed reviews
```
