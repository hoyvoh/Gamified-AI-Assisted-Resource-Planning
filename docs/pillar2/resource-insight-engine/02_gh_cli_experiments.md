---
title: "GitHub CLI Experiments — Command Playbook for Know-Your-Human Data Collection"
scope: AI-Assisted Resource Insight Engine
status: command catalog + expected data structures
date: 2026-03-29
note: >
  Tài liệu này record kết quả thực nghiệm với gh CLI, cách form các command để lấy
  đúng thông tin cần thiết, kiểu dữ liệu cần quản lý, và cách map sang evaluation signals.
  Test users: hoyvoh, anthropic (org), torvalds (Linux reference), dan-abramov (open source reference).
---

# GitHub CLI Experiments — Command Playbook

---

## Bối cảnh thực nghiệm

GitHub CLI (`gh`) cung cấp hai giao diện chính:
- **REST API** (`gh api repos/...`): đơn giản, phù hợp với per-resource queries
- **GraphQL API** (`gh api graphql`): richer data trong ít request hơn, phù hợp với complex joins

Mục tiêu thực nghiệm: xác định command nào lấy được data gì, output structure ra sao, và cần transform như thế nào để feed vào evaluation engine.

---

## Nhóm 1: User Profile và Contribution Overview

### Command 1.1 — Basic user profile

```bash
# Lấy thông tin profile cơ bản
gh api users/hoyvoh \
  --jq '{
    login: .login,
    name: .name,
    bio: .bio,
    company: .company,
    public_repos: .public_repos,
    followers: .followers,
    following: .following,
    created_at: .created_at,
    updated_at: .updated_at
  }'
```

**Expected output structure:**
```json
{
  "login": "hoyvoh",
  "name": "Hoang Vo",
  "bio": "...",
  "company": "...",
  "public_repos": 25,
  "followers": 12,
  "following": 30,
  "created_at": "2019-03-15T10:00:00Z",
  "updated_at": "2026-03-01T08:00:00Z"
}
```

**Evaluation value:** `created_at` cho biết tổng số năm có GitHub account — dùng làm context, không phải direct signal.

---

### Command 1.2 — Contribution calendar (heatmap + totals)

```bash
gh api graphql -f query='
query($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      totalCommitContributions
      totalPullRequestContributions
      totalPullRequestReviewContributions
      totalIssueContributions
      totalRepositoryContributions
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            contributionLevel
            weekday
          }
        }
      }
    }
  }
}' \
-f login="hoyvoh" \
-f from="2025-04-01T00:00:00Z" \
-f to="2026-03-29T23:59:59Z"
```

**Expected output structure (abbreviated):**
```json
{
  "data": {
    "user": {
      "contributionsCollection": {
        "totalCommitContributions": 342,
        "totalPullRequestContributions": 47,
        "totalPullRequestReviewContributions": 31,
        "totalIssueContributions": 18,
        "totalRepositoryContributions": 5,
        "contributionCalendar": {
          "totalContributions": 438,
          "weeks": [
            {
              "contributionDays": [
                {"date": "2025-04-06", "contributionCount": 5, "contributionLevel": "SECOND_QUARTILE", "weekday": 0},
                {"date": "2025-04-07", "contributionCount": 0, "contributionLevel": "NONE", "weekday": 1}
              ]
            }
          ]
        }
      }
    }
  }
}
```

**Derived signals từ này:**
```python
contribution_days = [d for week in weeks for d in week.contributionDays]

weekend_days    = [d for d in contribution_days if d.weekday in [5, 6]]  # Sat=5, Sun=6
weekday_active  = [d for d in contribution_days if d.weekday < 5 and d.contributionCount > 0]
weekend_active  = [d for d in contribution_days if d.weekday >= 5 and d.contributionCount > 0]

weekend_activity_rate = len(weekend_active) / max(1, len(weekend_active + weekday_active))

# Work rhythm consistency
weekly_counts = group by week → [count1, count2, ...]
import statistics
contribution_cv = statistics.stdev(weekly_counts) / max(1, statistics.mean(weekly_counts))
# Low CV → consistent; High CV → burst-and-crash

# Peak contribution day pattern
weekday_distribution = Counter([d.weekday for d in contribution_days if d.contributionCount > 0])
```

---

### Command 1.3 — Review contributions cross-repo

```bash
gh api graphql -f query='
query($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      pullRequestReviewContributions(first: 100) {
        totalCount
        nodes {
          occurredAt
          pullRequest {
            number
            title
            repository { nameWithOwner }
            author { login }
          }
          pullRequestReview {
            state
            body
            comments(first: 50) {
              totalCount
              nodes {
                body
                path
                author { login }
                createdAt
              }
            }
          }
        }
      }
    }
  }
}' \
-f login="hoyvoh" \
-f from="2025-10-01T00:00:00Z" \
-f to="2026-03-29T23:59:59Z"
```

**Expected output (abbreviated):**
```json
{
  "pullRequestReviewContributions": {
    "totalCount": 31,
    "nodes": [
      {
        "occurredAt": "2026-02-15T14:30:00Z",
        "pullRequest": {
          "number": 234,
          "title": "Add payment gateway integration",
          "repository": {"nameWithOwner": "hoyvoh/some-repo"},
          "author": {"login": "colleague_username"}
        },
        "pullRequestReview": {
          "state": "CHANGES_REQUESTED",
          "body": "Overall looks good but need to address the error handling...",
          "comments": {
            "totalCount": 5,
            "nodes": [
              {
                "body": "This will throw if the response body is null. Add a null check here.",
                "path": "src/payment/gateway.ts",
                "author": {"login": "hoyvoh"},
                "createdAt": "2026-02-15T14:25:00Z"
              }
            ]
          }
        }
      }
    ]
  }
}
```

**Key derived signals:**
```python
# Per review node:
review_states = Counter([n.pullRequestReview.state for n in nodes])
# {"APPROVED": 15, "CHANGES_REQUESTED": 12, "COMMENTED": 4}

rubber_stamp_rate = review_states["APPROVED"] / total_reviews
quality_gate_rate = review_states["CHANGES_REQUESTED"] / total_reviews

avg_comment_count = mean([n.pullRequestReview.comments.totalCount for n in nodes])

# Extract text corpus for each review
review_bodies = [n.pullRequestReview.body for n in nodes if len(n.pullRequestReview.body) > 30]
inline_comments = [c.body for n in nodes for c in n.pullRequestReview.comments.nodes]

# Cross-team reviews
own_repo_pattern = f"hoyvoh/"  # or org pattern
cross_team_reviews = [n for n in nodes if not n.pullRequest.repository.nameWithOwner.startswith(own_repo_pattern)]
cross_team_rate = len(cross_team_reviews) / len(nodes)
```

---

## Nhóm 2: Pull Request Data

### Command 2.1 — All PRs authored (org-wide search)

```bash
# Org-wide search across all repos user contributed to
gh search prs \
  --author "hoyvoh" \
  --owner "hoyvoh" \
  --state all \
  --limit 200 \
  --json "number,title,body,repository,state,createdAt,mergedAt,closedAt,additions,deletions,changedFiles,labels" \
  | jq '[.[] | select(.createdAt >= "2025-10-01")]'
```

**Expected output (single PR example):**
```json
[
  {
    "number": 42,
    "title": "feat: implement user authentication with JWT",
    "body": "## Problem\nThe app has no authentication...\n## Solution\nAdded JWT-based auth...\n## Testing\nRun `npm test auth`",
    "repository": {"name": "backend-service", "nameWithOwner": "org/backend-service"},
    "state": "MERGED",
    "createdAt": "2026-01-15T09:00:00Z",
    "mergedAt": "2026-01-17T14:30:00Z",
    "closedAt": "2026-01-17T14:30:00Z",
    "additions": 287,
    "deletions": 45,
    "changedFiles": 12,
    "labels": [{"name": "feature"}, {"name": "auth"}]
  }
]
```

**Derived signals:**
```python
prs = load_pr_data()

# PR Description Quality
pr_body_lengths = [len(pr.body or "") for pr in prs]
has_problem_section = [bool(re.search(r'##\s*problem|##\s*why|##\s*context', pr.body or "", re.I)) for pr in prs]
has_testing_notes = [bool(re.search(r'##\s*test|how to test|testing steps', pr.body or "", re.I)) for pr in prs]

avg_body_length = mean(pr_body_lengths)
description_quality_rate = mean(has_problem_section)  # % PRs with context

# PR Size Distribution
avg_additions = mean([pr.additions for pr in prs])
large_prs = [pr for pr in prs if pr.additions + pr.deletions > 500]  # hard to review

# Merge Rate
merged = [pr for pr in prs if pr.state == "MERGED"]
abandoned = [pr for pr in prs if pr.state == "CLOSED" and pr.mergedAt is None]
merge_rate = len(merged) / len(prs)

# Cycle Time
cycle_times_hours = [
  (parse(pr.mergedAt) - parse(pr.createdAt)).total_seconds() / 3600
  for pr in merged if pr.mergedAt
]
p50_cycle_time = percentile(cycle_times_hours, 50)
p90_cycle_time = percentile(cycle_times_hours, 90)

# Tech stack signals from file paths
# Need PR file list — requires additional per-PR API call
```

---

### Command 2.2 — PR detail với review timeline (single PR)

```bash
# Single PR full detail including review thread history
gh api graphql -f query='
query($owner: String!, $repo: String!, $pr: Int!) {
  repository(owner: $owner, name: $repo) {
    pullRequest(number: $pr) {
      number
      title
      body
      author { login }
      createdAt
      mergedAt
      state
      additions
      deletions
      changedFiles
      files(first: 50) {
        nodes { path additions deletions }
      }
      reviews(first: 30) {
        nodes {
          author { login }
          state
          body
          submittedAt
          comments(first: 50) {
            nodes {
              body
              path
              author { login }
              createdAt
              isMinimized
              isOutdated
            }
          }
        }
      }
      comments(first: 30) {
        nodes {
          author { login }
          body
          createdAt
        }
      }
      timeline: timelineItems(first: 50, itemTypes: [
        PULL_REQUEST_REVIEW_EVENT,
        HEAD_REF_PUSHED_EVENT,
        MERGED_EVENT,
        CLOSED_EVENT
      ]) {
        nodes {
          __typename
          ... on HeadRefPushedEvent { beforeCommit { oid } afterCommit { oid } }
          ... on PullRequestReviewEvent { review { state author { login } submittedAt } }
          ... on MergedEvent { actor { login } mergedAt: createdAt }
        }
      }
    }
  }
}' \
-f owner="hoyvoh" -f repo="some-repo" -F pr=42
```

**Key derived signal — Feedback Handled Detection:**
```python
timeline_events = pr.timeline.nodes

# Reconstruct feedback cycles:
feedback_cycles = []
current_cycle = None

for event in sorted(timeline_events, key=lambda e: e.createdAt):
  if event.__typename == "PullRequestReviewEvent" and event.review.state == "CHANGES_REQUESTED":
    current_cycle = {"review_at": event.review.submittedAt, "reviewer": event.review.author.login}
  elif event.__typename == "HeadRefPushedEvent" and current_cycle:
    current_cycle["response_commit_at"] = event.afterCommit.oid
    current_cycle["response_hours"] = hours_between(current_cycle["review_at"], event.createdAt)
  elif event.__typename == "PullRequestReviewEvent" and event.review.state == "APPROVED" and current_cycle:
    current_cycle["resolved_at"] = event.review.submittedAt
    feedback_cycles.append(current_cycle)
    current_cycle = None

# Summary per PR:
if feedback_cycles:
  avg_response_hours = mean([c["response_hours"] for c in feedback_cycles if "response_hours" in c])
  # Record: "hoyvoh handled N feedback cycles on PR #42 from reviewers [X, Y]"
```

---

### Command 2.3 — Review comments received on own PRs

```bash
# All review comments on PRs authored by user in a specific repo
gh api "repos/hoyvoh/some-repo/pulls/comments?per_page=100" \
  --paginate \
  --jq --arg user "hoyvoh" \
  '[.[] | select(.pull_request_url | contains("/pulls/")) | {
    reviewer: .user.login,
    body: .body,
    path: .path,
    line: .line,
    created_at: .created_at,
    pr_url: .pull_request_url,
    in_reply_to: .in_reply_to_id
  } | select(.reviewer != $user)]'
  # Only keep comments FROM others ON user's PRs
```

**Derived signals:**
```python
comments_received = load_review_comments_received()

# What do people comment about on my PRs? → Technical values inference
comment_topics = categorize_by_llm(comments_received)
# Returns: {"testing": 8, "naming": 5, "error_handling": 4, ...}
# Interpretation: "hoyvoh receives many comments about testing and naming → these are growth areas"

# Review rejection rate
requests_changes_on_my_prs = [c for c in comments_received if c.is_blocking]
rejection_iterations = group_by_pr(requests_changes_on_my_prs)
avg_rejections_per_pr = mean([len(v) for v in rejection_iterations.values()])

# Reply pattern — did user reply to comments?
my_replies = [c for c in all_comments if c.reviewer == "hoyvoh" and c.in_reply_to is not None]
reply_rate = len(my_replies) / max(1, len(comments_received))
```

---

## Nhóm 3: Issues và Initiative Signals

### Command 3.1 — Issues created by user

```bash
gh search issues \
  --author "hoyvoh" \
  --owner "hoyvoh" \
  --type issue \
  --state all \
  --limit 300 \
  --json "number,title,body,repository,state,createdAt,closedAt,labels,comments" \
  | jq '[.[] | select(.createdAt >= "2025-04-01")]'
```

**Expected output:**
```json
[
  {
    "number": 15,
    "title": "Bug: Payment fails when amount > 10000",
    "body": "## Steps to reproduce\n1. Add item costing $10,001\n2. Click checkout\n3. See error\n\n## Expected\nPayment should process\n\n## Actual\nError: AMOUNT_LIMIT_EXCEEDED",
    "repository": {"name": "payment-service"},
    "state": "closed",
    "createdAt": "2026-01-10T11:00:00Z",
    "closedAt": "2026-01-12T16:00:00Z",
    "labels": [{"name": "bug"}, {"name": "payment"}],
    "comments": 3
  }
]
```

**Derived signals:**
```python
# Issue description quality
def score_issue_quality(issue):
  body = issue.body or ""
  has_steps = bool(re.search(r'steps to reproduce|how to reproduce', body, re.I))
  has_expected = bool(re.search(r'expected|should', body, re.I))
  has_actual = bool(re.search(r'actual|error|bug', body, re.I))
  length_score = min(1.0, len(body) / 300)  # normalized by 300 chars
  return mean([has_steps, has_expected, has_actual, length_score])

# Initiative: proactive vs reactive issue creation
# Heuristic: issues with label "enhancement"/"improvement"/"tech-debt" = proactive
proactive_labels = {"enhancement", "improvement", "tech-debt", "chore", "refactor"}
proactive_issues = [i for i in issues if any(l.name in proactive_labels for l in i.labels)]
proactive_rate = len(proactive_issues) / len(issues)

# Issue resolution by author (closed by same person)
# Need: gh api repos/owner/repo/issues/N to check closed_by field
```

---

### Command 3.2 — Issues commented on by user (participation)

```bash
# Comments made on issues by username in a repo
gh api "repos/hoyvoh/some-repo/issues/comments?per_page=100" \
  --paginate \
  --jq --arg user "hoyvoh" \
  '[.[] | select(.user.login == $user) | {
    id,
    body,
    created_at,
    issue_url: .issue_url,
    length: (.body | length)
  }]'
```

**Derived signals:**
```python
# Slack-equivalent signal from GitHub: discussion participation
issue_comments = load_issue_comments()

avg_comment_length = mean([c.length for c in issue_comments])

# Technical question answering vs asking pattern
question_type = categorize_by_llm(
  [c.body for c in issue_comments],
  task="classify each as: answer_provided | question_asked | status_update | acknowledgment"
)
answer_to_question_ratio = question_type["answer_provided"] / max(1, question_type["question_asked"])
```

---

## Nhóm 4: Technical Stack Detection

### Command 4.1 — Languages used via repo stats

```bash
# Per repo — language breakdown
gh api "repos/hoyvoh/some-repo/languages" \
  --jq 'to_entries | map({language: .key, bytes: .value}) | sort_by(-.bytes)'
```

**Expected output:**
```json
[
  {"language": "TypeScript", "bytes": 125400},
  {"language": "Python", "bytes": 45200},
  {"language": "CSS", "bytes": 8700}
]
```

### Command 4.2 — Tech stack from PR file paths

```bash
# Get files changed in PRs to infer tech stack from file extensions
gh api graphql -f query='
query($owner: String!, $repo: String!, $pr: Int!) {
  repository(owner: $owner, name: $repo) {
    pullRequest(number: $pr) {
      files(first: 100) {
        nodes { path additions deletions }
      }
    }
  }
}' -f owner="hoyvoh" -f repo="repo" -F pr=42 \
  --jq '[.data.repository.pullRequest.files.nodes[] | .path]'
```

**Tech stack inference from file paths:**
```python
TECH_PATTERNS = {
  "Python":      [r"\.py$", r"requirements\.txt", r"setup\.py"],
  "TypeScript":  [r"\.ts$", r"\.tsx$", r"tsconfig\.json"],
  "JavaScript":  [r"\.js$", r"\.jsx$", r"package\.json"],
  "Java":        [r"\.java$", r"pom\.xml", r"build\.gradle"],
  "Go":          [r"\.go$", r"go\.mod"],
  "Docker":      [r"Dockerfile", r"docker-compose"],
  "CI/CD":       [r"\.github/workflows", r"\.gitlab-ci", r"Jenkinsfile"],
  "Infrastructure": [r"\.tf$", r"helm/", r"kubernetes/", r"k8s/"],
  "SQL":         [r"\.sql$", r"migrations/"],
  "Tests":       [r"test_", r"_test\.", r"\.spec\.", r"__tests__/"],
}

def infer_tech_stack(file_paths):
  tech_contributions = defaultdict(int)
  for path in file_paths:
    for tech, patterns in TECH_PATTERNS.items():
      if any(re.search(p, path) for p in patterns):
        tech_contributions[tech] += 1
  return dict(sorted(tech_contributions.items(), key=lambda x: -x[1]))
```

---

## Nhóm 5: Activity History Events — Chronological Feed

### Command 5.1 — Full activity feed per user (for history tab)

```bash
# User events REST endpoint — real-time activity feed
gh api "users/hoyvoh/events?per_page=100" \
  --paginate \
  --jq '[.[] | {
    type: .type,
    repo: .repo.name,
    created_at: .created_at,
    payload_action: .payload.action,
    payload_summary: (
      if .type == "PullRequestEvent" then
        "PR #" + (.payload.number | tostring) + " " + .payload.action + ": " + .payload.pull_request.title
      elif .type == "PullRequestReviewEvent" then
        "Reviewed PR #" + (.payload.pull_request.number | tostring) + " [" + .payload.review.state + "]"
      elif .type == "IssuesEvent" then
        "Issue #" + (.payload.issue.number | tostring) + " " + .payload.action + ": " + .payload.issue.title
      elif .type == "IssueCommentEvent" then
        "Commented on Issue #" + (.payload.issue.number | tostring)
      elif .type == "PushEvent" then
        "Pushed " + (.payload.commits | length | tostring) + " commits to " + .payload.ref
      elif .type == "CreateEvent" then
        "Created " + .payload.ref_type + " " + (.payload.ref // "")
      else .type
      end
    )
  }]'
```

**Expected output (activity feed):**
```json
[
  {
    "type": "PullRequestReviewEvent",
    "repo": "hoyvoh/some-repo",
    "created_at": "2026-03-28T15:30:00Z",
    "payload_action": "submitted",
    "payload_summary": "Reviewed PR #89 [CHANGES_REQUESTED]"
  },
  {
    "type": "PullRequestEvent",
    "repo": "org/backend",
    "created_at": "2026-03-27T10:00:00Z",
    "payload_action": "opened",
    "payload_summary": "PR #156 opened: feat: add caching layer"
  },
  {
    "type": "IssueCommentEvent",
    "repo": "org/backend",
    "created_at": "2026-03-26T16:45:00Z",
    "payload_action": "created",
    "payload_summary": "Commented on Issue #43"
  }
]
```

**Rendering vào Activity History Tab:**
```
2026-03-28 15:30  hoyvoh reviewed PR #89 [CHANGES_REQUESTED]
                  → Repo: hoyvoh/some-repo
                  → 5 inline comments, review body: "Please handle the error..."

2026-03-27 10:00  hoyvoh opened PR #156: "feat: add caching layer"
                  → Repo: org/backend  | +287 -45 lines  | 12 files

2026-03-26 16:45  hoyvoh commented on Issue #43
                  → Repo: org/backend  | Comment: "This is a known issue with..."
```

---

### Command 5.2 — PR review comment threads (for "handled feedback" history)

```bash
# Full thread on a specific PR: who said what, when, resolved?
gh api graphql -f query='
query($owner: String!, $repo: String!, $pr: Int!) {
  repository(owner: $owner, name: $repo) {
    pullRequest(number: $pr) {
      reviewThreads(first: 50) {
        nodes {
          id
          isResolved
          isOutdated
          path
          line
          resolvedBy { login }
          comments(first: 20) {
            nodes {
              author { login }
              body
              createdAt
              replyTo { id }
            }
          }
        }
      }
    }
  }
}' \
-f owner="hoyvoh" -f repo="some-repo" -F pr=42
```

**Expected output:**
```json
{
  "reviewThreads": {
    "nodes": [
      {
        "id": "PRTC_abc123",
        "isResolved": true,
        "path": "src/auth/jwt.ts",
        "line": 45,
        "resolvedBy": {"login": "hoyvoh"},
        "comments": {
          "nodes": [
            {
              "author": {"login": "reviewer_alice"},
              "body": "Add null check here before calling .sign()",
              "createdAt": "2026-01-16T10:00:00Z",
              "replyTo": null
            },
            {
              "author": {"login": "hoyvoh"},
              "body": "Good catch, fixed in latest commit",
              "createdAt": "2026-01-16T14:30:00Z",
              "replyTo": {"id": "PRC_prev"}
            }
          ]
        }
      }
    ]
  }
}
```

**Activity history entry từ thread này:**
```
History event:
  type: "feedback_handled"
  actor: "hoyvoh"
  pr: "#42"
  detail: "Resolved thread on src/auth/jwt.ts:45 — started by reviewer_alice, replied and resolved by hoyvoh"
  response_time_hours: 4.5
  evaluation_signal: feedback_receptiveness += 1
```

---

## Nhóm 6: Lệnh Tổng Hợp cho Period-Scoped Analysis

### Command 6.1 — Full data collection script (bash form)

```bash
#!/usr/bin/env bash
# Collect all signals for a user in a given period
# Usage: ./collect.sh hoyvoh 2025-10-01 2026-03-29

USERNAME=$1
FROM=$2
TO=$3

echo "=== Collecting data for $USERNAME ($FROM → $TO) ==="

# 1. Contribution overview
gh api graphql -f query="$(cat queries/contribution_overview.graphql)" \
  -f login="$USERNAME" \
  -f from="${FROM}T00:00:00Z" \
  -f to="${TO}T23:59:59Z" \
  > "data/${USERNAME}_contributions.json"

# 2. PRs authored
gh search prs --author "$USERNAME" --state all --limit 500 \
  --json "number,title,body,repository,state,createdAt,mergedAt,closedAt,additions,deletions,changedFiles" \
  | jq "[.[] | select(.createdAt >= \"$FROM\" and .createdAt <= \"$TO\")]" \
  > "data/${USERNAME}_prs.json"

# 3. Reviews given
gh api graphql -f query="$(cat queries/reviews_given.graphql)" \
  -f login="$USERNAME" \
  -f from="${FROM}T00:00:00Z" \
  -f to="${TO}T23:59:59Z" \
  > "data/${USERNAME}_reviews.json"

# 4. Issues created
gh search issues --author "$USERNAME" --type issue --state all --limit 300 \
  --json "number,title,body,repository,state,createdAt,closedAt,labels" \
  | jq "[.[] | select(.createdAt >= \"$FROM\")]" \
  > "data/${USERNAME}_issues.json"

# 5. Activity events
gh api "users/$USERNAME/events?per_page=100" --paginate \
  | jq "[.[] | select(.created_at >= \"$FROM\" and .created_at <= \"$TO\")]" \
  > "data/${USERNAME}_events.json"

echo "Done. Data in data/${USERNAME}_*.json"
```

---

## Tổng Hợp: Kiểu Dữ Liệu Cần Quản Lý trong SQLite

### Data types inventory

| Table | Description | Key fields |
|-------|-------------|-----------|
| `users` | GitHub user profile | login, name, bio, created_at |
| `pull_requests` | PRs authored by user | pr_number, repo, state, created_at, merged_at, additions, deletions, body, body_length |
| `reviews_given` | Reviews submitted by user | review_id, pr_number, repo, reviewer=username, state, body, submitted_at, comment_count |
| `review_comments_given` | Inline review comments | comment_id, review_id, pr_number, body, path, created_at |
| `review_comments_received` | Inline comments on user's PRs | comment_id, pr_number, reviewer, body, path, created_at |
| `review_threads` | Thread metadata | thread_id, pr_number, path, is_resolved, resolved_by, created_at |
| `issues_created` | Issues opened by user | issue_number, repo, title, body, state, created_at, closed_at, labels |
| `issue_comments` | Comments on issues | comment_id, issue_number, author, body, created_at |
| `activity_events` | Raw GitHub event feed | event_id, type, repo, created_at, payload_summary |
| `contribution_calendar` | Daily contribution counts | user, date, weekday, contribution_count |
| `slack_messages` | Filtered work messages | message_id, channel, text, timestamp, work_type, user |
| `tech_contributions` | Tech stack evidence | user, tech, pr_count, first_seen, last_seen, active_months |
| `profile_scores` | Computed layer scores | user, layer, dimension, score, confidence, evidence_json, computed_at, period |
| `activity_history` | Processed activity feed | event_id, user, event_type, detail, source_ref, created_at, evaluation_weight |

### Period filter implementation

Tất cả queries phải support `working_days` parameter:

```sql
-- Last 30 working days
WITH working_days AS (
  SELECT date FROM contribution_calendar
  WHERE user = :username
    AND weekday NOT IN (5, 6)  -- exclude weekends
    AND contribution_count >= 0  -- include zero-contribution weekdays
  ORDER BY date DESC
  LIMIT 30
)
SELECT pr.*
FROM pull_requests pr
WHERE pr.user = :username
  AND pr.created_at::date IN (SELECT date FROM working_days)
```

---

## Lessons Learned từ Command Exploration

### Cái dễ lấy (high reliability):
- Contribution counts, calendar heatmap → `contributionsCollection` GraphQL
- PR list with metadata → `gh search prs`
- Review states (APPROVED/CHANGES_REQUESTED) → `pullRequestReviewContributions`
- Activity event feed → `GET /users/{username}/events`

### Cái cần nhiều API calls (medium effort):
- Inline review comment text → requires per-repo pagination
- PR file list → per-PR GraphQL call
- Review thread resolution status → per-PR GraphQL `reviewThreads`
- Issue resolution by user → per-issue `closed_by` check

### Cái không lấy được từ public API (limitations):
- Commit timestamps in hours (only dates from contribution calendar)
- CI pass/fail rate per PR (need GitHub Actions API or repository-level checks)
- Exact bug attribution (requires issue-to-PR link analysis)
- Slack data (requires separate OAuth + workspace admin access)
- Private repo data (requires `repo` scope token + org membership)

### Rate limit strategy:
- **Search API**: 30 req/min → batch multiple users together, add `sleep 2` between users
- **GraphQL**: 5000 points/hr → complex queries cost more; monitor with `X-RateLimit-Remaining` header
- **Stats endpoints**: may return HTTP 202 (computing) → retry after 2 seconds, up to 5 times
- **Pagination**: use `--paginate` flag; `gh` handles `Link` headers automatically
