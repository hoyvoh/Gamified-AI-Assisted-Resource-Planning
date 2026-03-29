---
title: "Quantification Research — Behavioral Signal Mechanisms for Human Evaluation Engine"
scope: AI-Assisted Resource Insight Engine
status: research draft
date: 2026-03-29
purpose: >
  Nghiên cứu chuyên sâu về cơ chế lượng hóa hành vi developer từ GitHub và Slack.
  Tài liệu này làm nền tảng lý thuyết và kỹ thuật cho evaluation engine.
---

# Quantification Research: Cơ Chế Lượng Hóa Hành Vi Developer

---

## 1. Triết Lý Đo Lường (Measurement Philosophy)

### 1.1 Nguyên tắc cốt lõi

Đánh giá một con người thông qua digital traces dựa trên ba nguyên tắc:

**Revealed preference > stated preference**
Người ta không làm điều họ nói họ làm — họ làm những gì hành vi của họ cho thấy. PR description ngắn 2 dòng nói nhiều hơn "tôi rất cẩn thận trong công việc". Số lần comments bị request changes nói nhiều hơn "tôi viết code tốt".

**Patterns > incidents**
Một lần commit lúc 2 giờ sáng không có ý nghĩa gì. Một pattern 40% commit sau 10 giờ tối liên tục 3 tháng là tín hiệu mạnh về workload, work style, hoặc burnout risk. Mọi signal phải được đo theo chuỗi thời gian, không phải điểm đơn lẻ.

**Evidence linking > assertion**
Mỗi score phải đi kèm với ít nhất 2–3 dẫn chứng cụ thể: link đến PR, comment, review thread, hay pattern trong contribution calendar. Không có evidence = không có score.

### 1.2 Các lớp hành vi có thể quan sát được

```
Lớp 1 — Artifacts (những gì họ tạo ra):
  PR bodies, commit messages, issue descriptions, review comments, Slack messages

Lớp 2 — Actions (những gì họ làm):
  Tạo PR, approve/reject review, resolve comment, assign issue, reply thread

Lớp 3 — Patterns (nhịp điệu và xu hướng):
  Timing của contributions, frequency, domain distribution, trajectory over time

Lớp 4 — Relationships (tương tác với người khác):
  Ai review cho ai, ai unblock ai, ai mention ai, ai reply ai nhanh nhất
```

Evaluation engine hoạt động bằng cách aggregate các signal từ cả 4 lớp, không phải chỉ lớp 1.

---

## 2. Activity History Event Taxonomy

### 2.1 GitHub Events và ý nghĩa đánh giá

Mỗi GitHub event cần được classified vào một trong các activity types có ý nghĩa đánh giá:

| Raw Event | Activity Type | Evaluation Signal |
|-----------|--------------|-------------------|
| PR opened | **Output creation** | Sản xuất deliverable |
| PR merged | **Output delivered** | Delivery success |
| PR closed (unmerged) | **Output abandoned** | Negative delivery signal |
| Review submitted: APPROVED | **Review — sign-off** | Collaborative contribution |
| Review submitted: CHANGES_REQUESTED | **Review — quality gate** | Quality enforcement |
| Review comment posted | **Feedback given** | Knowledge transfer |
| PR comment posted | **Discussion participation** | Collaboration |
| Review comment resolved | **Feedback handled** | Feedback receptiveness |
| Review thread replied | **Feedback engagement** | Communication |
| Issue opened | **Problem identification** | Initiative / Problem framing |
| Issue commented | **Problem discussion** | Collaboration |
| Issue closed by user | **Problem resolution** | Initiative + Delivery |
| Commit pushed | **Implementation work** | Technical execution |
| CI check failed on PR | **Quality gap** | Delivery reliability signal |

### 2.2 Cơ chế "Handled Feedback"

**Định nghĩa hành vi:** `username` đã nhận review feedback và xử lý nó — một trong những signal quan trọng nhất về feedback receptiveness và growth mindset.

**Chuỗi event cần detect:**

```
Pattern A — Standard feedback loop:
  T1: Reviewer posts review comment (CHANGES_REQUESTED)
  T2: Author pushes new commit to same PR
  T3: Reviewer re-reviews → APPROVED
  ⟹ Infer: Author handled feedback from T1 to T3
  Signal: "hoyvoh handled feedback from reviewer X on PR #123"

Pattern B — Inline comment resolution:
  T1: Reviewer posts inline review comment
  T2: Author replies to comment thread
  T3: Thread marked as "resolved"
  ⟹ Infer: Author engaged with and closed feedback loop
  Signal: "hoyvoh resolved feedback thread on PR #123, line L in file F"

Pattern C — Iterative refinement:
  T1: PR opened, CHANGES_REQUESTED
  T2: Author pushes commit (PR history entry: "addressed review comments")
  T3: Second round CHANGES_REQUESTED
  T4: Author pushes again
  T5: APPROVED
  ⟹ Count: 2 feedback cycles on PR #123
  Signal: "required N feedback cycles — measure of iteration efficiency"

Pattern D — Feedback integrated into future work:
  T1: Reviewer comments "use X pattern instead of Y" on PR #100
  T2: In PR #115 (3 weeks later), author uses X pattern unprompted
  ⟹ Evidence: Feedback was internalized, not just mechanically applied
  Signal: This is the HIGHEST value signal — growth across PRs, not just within
```

**Quantification:**
```
feedback_handled_rate = resolved_threads / total_received_threads
feedback_response_time_p50 = median hours from CHANGES_REQUESTED to new commit
feedback_cycle_count_avg = average CHANGES_REQUESTED rounds per PR
cross_pr_learning_rate = pattern improvements attributable to past review feedback
```

### 2.3 Cơ chế "Reviewed Output"

**Định nghĩa hành vi:** `username` đã review output của người khác và đánh giá dựa trên comment của họ gây ra thay đổi trong page/PR history.

```
Detection logic:
  T1: username posts review comment on PR authored by someone_else
  T2: PR author pushes new commit within 48h of review comment
  T3: (Optional) username resolves the thread or approves
  ⟹ Infer: username's review comment was actionable → triggered change
  Signal: "hoyvoh reviewed output of person_X on PR #N, triggered N revisions"

Quality distinction:
  Low quality review: comment posted, thread closed, NO new commit
    → Rubber-stamp or no-change review
  High quality review: comment posted → commit pushed within 24h → thread resolved
    → Actionable review that improved the output

  review_action_rate = (PRs with ≥1 new commit after username's review) / (all PRs reviewed)
```

**Comment influence scoring:**
- Reviewer leaves CHANGES_REQUESTED → PR author makes changes → **High influence**
- Reviewer leaves COMMENTED only → PR author makes changes → **Medium influence**
- Reviewer leaves APPROVED immediately → **Low enforcement** (rubber stamp risk)
- Reviewer requests changes but no changes made → **Rejected influence** (might be valid debate)

---

## 3. Slack Work Conversation Filter

### 3.1 Bài toán phân loại

Slack messages của một developer bao gồm:
- **Work signal** (cần giữ lại): technical questions, status updates, link sharing, decisions, feedback, blockers
- **Social noise** (cần loại): greetings, small talk, reactions, off-topic, jokes

Mục tiêu: filter để chỉ còn messages có giá trị đánh giá công việc.

### 3.2 Feature-based Classifier

**Tier 1: Rule-based pre-filter (fast, no LLM needed)**

```
Keep signals:
  + Contains URL (especially GitHub, Jira, Confluence links)
  + Contains code block (```)
  + Message length > 80 chars
  + Contains technical keywords: deploy, bug, fix, PR, merge, review, release,
    pipeline, API, error, timeout, crash, refactor, architecture, schema
  + Contains question mark (?)
  + Tagged with @username mention to/from target user
  + Contains status keywords: "done", "blocked", "waiting for", "shipped", "ETA"
  + Contains issue/PR reference patterns: #123, PR-456, JIRA-789

Discard signals (fast-path drop):
  - Message length ≤ 15 chars (very likely greeting/reaction)
  - Contains ONLY emoji characters
  - Matches greeting patterns: "hi", "hello", "gm", "morning", "bye", "thanks!", "lgtm", "👍"
  - Is a reaction message
  - Message body is ONLY link with no context
```

**Tier 2: LLM classifier (for ambiguous messages that pass Tier 1)**

```
Prompt to Claude:
"Classify this Slack message as WORK or SOCIAL for the purpose of engineering performance analysis.
WORK = contains technical information, status update, question about work, decision, feedback, blocker, or delivery info.
SOCIAL = greeting, small talk, celebration without work context, joke, off-topic.

Message: [text]
Reply with JSON: {"category": "WORK" | "SOCIAL", "work_type": "technical_question" | "delivery_update" | "feedback" | "blocker" | "decision" | "link_sharing" | "announcement" | null}"
```

**Work type taxonomy for Slack:**

| work_type | Description | Evaluation value |
|-----------|-------------|-----------------|
| `technical_question` | Asking about how something works, seeking help | Initiative, learning velocity |
| `technical_answer` | Answering someone's technical question | Mentorship, knowledge sharing |
| `delivery_update` | Status of task/PR/deployment | Communication clarity |
| `feedback` | Giving feedback on work, code, design | Soft skills |
| `blocker` | Flagging impediments proactively | Communication, Initiative |
| `decision` | Making or recording a decision | Leadership signal |
| `link_sharing` | Sharing relevant resource with context | Collaboration |
| `announcement` | Informing team about changes | Extraversion |

### 3.3 Communication Pattern Signals từ Slack

Sau khi filter, Slack data cung cấp các signals:

```
communication_signals = {
  questions_asked_per_week:      số lần hỏi technical questions
  questions_answered_per_week:   số lần trả lời technical questions
  response_latency_p50:          median thời gian reply khi được mention (hours)
  blocker_flags_raised:          số lần chủ động báo blocker
  decision_participation_rate:   tỷ lệ tham gia vào decision threads
  link_sharing_freq:             frequency chia sẻ resources có context
  delivery_update_freq:          tần suất update trạng thái công việc
  mention_network:               {who_they_mention, who_mentions_them}
  thread_reply_rate:             % threads họ reply khi được tag
}
```

---

## 4. Technical Interest và Value System Extraction

### 4.1 "Username đề cao giá trị gì" — từ review comments

Review comments là kho data quý nhất để hiểu **technical values** của một developer. Khi một người review code của người khác, họ sẽ comment về những gì họ quan tâm nhất.

**Taxonomy of review comment types:**

| Category | Example comment pattern | Value it reveals |
|----------|------------------------|-----------------|
| **Code quality / readability** | "Rename this variable to be more descriptive" | Values: maintainability, clarity |
| **Testing** | "Missing edge case for null input" | Values: correctness, test coverage |
| **Performance** | "This loop is O(n²), consider using a HashMap" | Values: efficiency |
| **Security** | "Never log tokens, even in debug mode" | Values: security mindset |
| **Architecture** | "This belongs in the service layer, not the controller" | Values: separation of concerns |
| **Documentation** | "Please add a JSDoc comment explaining the parameters" | Values: knowledge sharing |
| **Error handling** | "What happens if this throws? Need a try-catch" | Values: reliability |
| **Dependency / coupling** | "This creates a circular dependency" | Values: clean architecture |
| **DRY/duplication** | "We have similar logic in X — can we extract?" | Values: code reuse |
| **Naming conventions** | "Follow camelCase per our style guide" | Values: consistency |
| **Business logic** | "This doesn't match the spec — user should be able to…" | Values: product correctness |

**Quantification:**
```
For each reviewer:
  value_distribution = {
    code_quality: count of quality comments / total comments
    testing:      count of test comments / total comments
    security:     ...
    architecture: ...
    ...
  }

top_values = sorted(value_distribution, descending)[:3]
```

**LLM extraction prompt template:**
```
Analyze these review comments from [username]. For each comment, classify what technical value it reflects.
Then summarize: "This developer primarily values [X], [Y], [Z]. They tend to request changes about [topics].
Their reviews focus on [description]."

Evidence: [list of 5-10 representative review comments]
```

### 4.2 Technical breadth vs depth

```
From PR contributions:
  file_path_clusters = group files touched by username by:
    - language (Python, Java, TypeScript...)
    - layer (frontend, backend, infra, data, test...)
    - domain (user module, payment, auth, API, DB...)

  breadth_score = number of distinct clusters with ≥3 meaningful contributions
  depth_score   = max contribution concentration in one cluster

  skill_duration_by_tech = {
    "Python":  first PR with Python files → last PR with Python files = N months
    "React":   first → last = M months
    ...
  }
```

---

## 5. Skill Quantification Framework

### 5.1 Technical Skills — Duration và Depth

**Duration là không đủ.** "Làm Python 2 năm" nhưng mỗi năm chỉ có 5 PR không có ý nghĩa gì so với "làm Python 8 tháng" với 80 PR. Cần đo **active engagement time**, không chỉ calendar duration.

```
Skill depth composite = f(
  active_months:       distinct months with ≥1 PR touching this techstack,
  pr_count:            total PRs touching this techstack,
  complexity_signals:  avg diff size, avg review comments received,
  review_quality:      rejection rate, iterations needed per PR,
  reviewer_trust:      does senior engineer approve without changes?
)
```

**Dreyfus mapping từ GitHub signals:**

| Dreyfus Level | GitHub Signals |
|---------------|----------------|
| Novice (1) | PRs frequently get CHANGES_REQUESTED; CI failures; simple diffs; copy-paste patterns |
| Advanced Beginner (2) | Gets CHANGES_REQUESTED on design/logic issues; needs guidance on edge cases |
| Competent (3) | PRs mostly approved first-pass; handles standard tasks autonomously; tests present |
| Proficient (4) | Reviews others' work in this domain; proposes architectural improvements; mentors |
| Expert (5) | ADR authorship; defines patterns others follow; handles cross-service design |

### 5.2 Soft Skills — Observable Proxies

**Review quality (Mentorship signal):**
```
review_quality_score = weighted average of:
  + avg_comment_length:           longer = more thorough (with diminishing returns >500 chars)
  + why_over_what_ratio:          comments explaining WHY to change, not just WHAT
    → detect: "because X", "this causes Y", "consider Z pattern" vs "change this"
  + code_example_rate:            % comments that include code snippets as suggestions
  + educational_follow_up:        replies to author questions after initial review
  + actionability:                # threads where author says "thanks, fixed" / total threads
```

**Communication clarity:**
```
clarity_score = weighted average of:
  + pr_body_has_problem_statement: PR describes WHY this change is needed
  + pr_body_has_testing_notes:     PR describes how to verify
  + pr_body_length_normalized:     length relative to PR complexity (diff size)
  + issue_description_completeness: steps to reproduce + expected vs actual
  + review_comment_specificity:    references specific line/variable, not vague critique
```

**Collaboration pattern:**
```
collaboration_score = f(
  review_given_to_received_ratio:  target > 0.7
  cross_team_review_rate:           reviews on repos outside own team
  response_time_to_mentions:        p50 in hours
  co_authored_pr_rate:              PRs with multiple authors
  mention_reciprocity:              do people who mention them get replies?
)
```

**Growth mindset:**
```
growth_signals = [
  cross_pr_learning:    applying feedback from PR N in PR N+k (same pattern fixed)
  tech_expansion_rate:  new techstack languages per quarter
  question_frequency:   technical questions asked in Slack (shows curiosity)
  documentation_growth: increase in PR body quality over time
  initiative_trend:     self-assigned issues increasing over time
]
```

### 5.3 Level-up Criteria (What Should They Improve)

Đây là phần có giá trị nhất cho decision-making. Không phải chỉ "score thấp" mà là "để lên level, cần làm gì khác."

**Framework: Current → Gap → Evidence → Action**

```
Level assessment = {
  current_level:  L2 (Advanced Beginner)
  target_level:   L3 (Competent)

  gaps: [
    {
      dimension: "Testing",
      current_score: 2.1,
      gap_evidence: [
        "PR #45: 0 test files changed despite feature addition",
        "PR #67: reviewer commented 'missing tests for error path'",
        "3 of last 5 feature PRs had no test coverage"
      ],
      level_criteria: "Score ≥ 3.5: tests present for most features; edge cases covered",
      suggested_action: "Add test files to ALL feature PRs; start with happy path + null input cases"
    },
    {
      dimension: "PR Description Quality",
      current_score: 1.8,
      gap_evidence: [
        "Avg PR body length: 23 chars (team avg: 210 chars)",
        "7/10 recent PRs have no description of why change is needed",
        "Reviewers frequently ask 'what problem does this solve?'"
      ],
      level_criteria: "Score ≥ 3.0: covers what and how; sometimes missing why",
      suggested_action: "Add minimum 3 sections to every PR: Problem, Solution, How to Test"
    }
  ]
}
```

---

## 6. Output Quality Scoring

### 6.1 Định nghĩa "output quality" từ GitHub data

Output quality là khó đo nhất vì nó yêu cầu đánh giá chất lượng của CODE, không chỉ process. Tuy nhiên, có thể proxy qua các signals sau:

**Review outcome signals:**
```
quality_indicators = {
  first_pass_approval_rate:    PRs approved without CHANGES_REQUESTED
                               → High = code was right the first time
  requested_changes_per_pr:   avg number of CHANGES_REQUESTED rounds
  bug_escape_rate:             issues opened that reference person's PRs as cause
  hotfix_attribution:          hotfix PRs that trace to person's original PR
  revert_rate:                 PRs that were later reverted
  review_comment_density:      avg inline comments received per 100 lines added
}
```

**Artifact quality signals:**
```
artifact_quality = {
  pr_description_quality_score: LLM-evaluated quality of PR body
  commit_message_quality:       does message explain WHY, not just WHAT
  test_coverage_contribution:   test files in ≥ 70% of feature PRs
  documentation_updates:        doc/README changes alongside code changes
  ci_pass_rate:                 % PRs where CI passed on first push
}
```

### 6.2 Composite Output Quality Score

```
output_quality = (
  0.30 × first_pass_approval_rate_normalized
+ 0.20 × (1 - review_comment_density_normalized)   # lower density = cleaner code
+ 0.20 × test_coverage_contribution_rate
+ 0.15 × ci_pass_rate
+ 0.15 × artifact_quality_score_llm
)

Scale: 1.0–5.0
Evidence: Each component backed by PR list with scores
```

---

## 7. Temporal Windowing và Period Calibration

### 7.1 Working Days Period

Người dùng yêu cầu filter theo "last N working days" (30/60/240). Đây là khác với calendar days vì:
- 30 working days ≈ 6 tuần (loại weekends + holidays)
- 240 working days ≈ 1 năm công việc thực tế

**Conversion:**
```
working_days_to_date_range(n_working_days):
  start_date = today - (n_working_days × 7/5)  # rough conversion
  # Then filter out weekends and public holidays from contribution calendar
```

### 7.2 Recency Weighting

Không phải tất cả dữ liệu đều có giá trị như nhau. Dữ liệu gần đây có giá trị cao hơn:

```
recency_weight(event_date, analysis_date, half_life_days=90):
  age_days = (analysis_date - event_date).days
  weight = 2^(-age_days / half_life_days)

→ Event 90 days ago = weight 0.5
→ Event 180 days ago = weight 0.25
→ Event 7 days ago = weight 0.95
```

### 7.3 Volume Calibration

Scores phải được calibrate theo volume. Một developer với 5 PRs và 5 reviews không thể được compare fairly với developer có 50 PRs:

```
minimum_evidence_threshold = {
  ocean_inference:   ≥ 50 text messages
  behavioral_prefs:  ≥ 20 PRs
  technical_skills:  ≥ 10 PRs per techstack
  soft_skills:       ≥ 15 review interactions
  performance:       ≥ 10 merged PRs
}

IF evidence < threshold: flag as LOW_CONFIDENCE, do not generate score
```

---

## 8. Evidence Linking Strategy

### 8.1 Cấu trúc evidence object

Mỗi score cần đi kèm evidence có cấu trúc:

```json
{
  "score": 3.7,
  "dimension": "collaboration",
  "confidence": 0.78,
  "evidence": [
    {
      "type": "quantitative",
      "fact": "Review-to-PR ratio: 1.4 (team avg: 0.8)",
      "period": "last 60 working days",
      "source": "github_reviews_given vs prs_authored"
    },
    {
      "type": "behavioral_pattern",
      "fact": "Reviewed 12 PRs outside own team in last quarter",
      "source": "cross_repo_review_analysis"
    },
    {
      "type": "artifact_example",
      "fact": "PR #234 review: 7 inline comments with code suggestions, thread replied 3 times",
      "link": "github.com/org/repo/pull/234"
    }
  ],
  "score_rationale": "High review volume + cross-team engagement + actionable comments → Collaboration score 3.7/5. Gap to 4.0: response latency is 18h avg (target <4h for Score 4)."
}
```

### 8.2 Score rationale format

Để mỗi score có giá trị thực sự, rationale cần trả lời 3 câu hỏi:
1. **Tại sao score này** (không cao hơn, không thấp hơn)?
2. **Đâu là dẫn chứng mạnh nhất** ủng hộ score này?
3. **Cần làm gì** để score cao hơn?

```
Rationale template:
"[Username]'s [dimension] score of [X.X] reflects [pattern description].
Key evidence: [strongest 2-3 data points].
Compared to team benchmark: [above/below/at average by N%].
To reach score [X.X+1]: [specific behavioral change needed]."
```

---

## 9. Gaps và Giới Hạn của Cơ Chế Lượng Hóa

### 9.1 Những gì KHÔNG thể đo được chính xác từ GitHub/Slack

| Dimension | Why it's hard | Mitigation |
|-----------|--------------|------------|
| **Conflict navigation** | Disagreements often happen in DMs or calls, not GitHub | Low confidence flag; require human review |
| **Problem decomposition quality** | Design decisions made in Jira/meetings, not GitHub | Future: integrate ticket metadata |
| **Mentoring outside digital traces** | In-person pairing, whiteboard sessions invisible | Self-report supplement |
| **Context of quality** | A PR with 0 test is different if it's a hotfix vs. feature | Need PR label + urgency metadata |
| **Team dynamics contribution** | Positive team energy hard to measure | Proxy: @-mention sentiment, peer response patterns |

### 9.2 Bias sources cần acknowledge

```
Language bias:       Non-native English writers have shorter/simpler messages → underscores communication score
Role bias:           Leads review more than ICs → review ratio skewed by role, not behavior
Context bias:        PR description length depends on team culture, not individual preference
Repo age bias:       Old PRs on legacy code have different quality patterns
Crunch period bias:  Last 2 weeks before release — all metrics drop. Period selection matters enormously.
Solo vs team bias:   Solo contributors have low collaboration score by definition
```

Mỗi score PHẢI được kèm với calibration notes về những bias nào đã được apply.
