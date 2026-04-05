---
source: "GitHub CLI Data Collection Methodology for Developer Profiling"
type: technical_methodology
relevance: resource_analysis
references:
  - "GitHub CLI official docs: https://cli.github.com/manual/"
  - "GitHub REST API v3: https://docs.github.com/en/rest"
  - "GitHub GraphQL API v4: https://docs.github.com/en/graphql"
---

# GitHub CLI Data Collection Methodology

## Overview

This document defines the exact commands, API calls, and pipeline design for collecting developer behavioral data from GitHub repositories to feed the personality/skill inference engine.

**Data categories collected:**
1. Pull Request authorship data (descriptions, comments, review responses)
2. Code review activity (reviews given, comments quality)
3. Commit patterns (frequency, message quality, timing)
4. Issue activity (creation, comments, resolution)
5. Aggregate contribution statistics

**Privacy constraint:** Only collect from repositories the organization owns or has explicit data processing agreement for. All data is visible only to BOD — never to individual developers or their managers.

---

## Prerequisites

```bash
# Authenticate
gh auth login --scopes "repo,read:org,read:user"

# Verify auth
gh auth status

# Set default org (optional)
gh config set -h github.com org YOUR_ORG_NAME
```

---

## A. Pull Request Data

### A1. List all PRs authored by a user in a repo

```bash
# Basic list
gh pr list \
  --repo OWNER/REPO \
  --author USERNAME \
  --state all \
  --limit 200 \
  --json number,title,state,createdAt,mergedAt,closedAt,additions,deletions,changedFiles,body,labels,comments

# With date range (filter in shell)
gh pr list \
  --repo OWNER/REPO \
  --author USERNAME \
  --state all \
  --limit 500 \
  --json number,title,createdAt,mergedAt,state,body,additions,deletions \
  | jq '[.[] | select(.createdAt >= "2024-01-01" and .createdAt <= "2024-12-31")]'
```

### A2. Get PR details including body, review comments, timeline

```bash
# Single PR full detail
gh pr view PR_NUMBER \
  --repo OWNER/REPO \
  --json number,title,body,state,author,assignees,reviewRequests,reviews,comments,additions,deletions,changedFiles,mergedAt,createdAt,labels

# Get all review comments on a PR (via REST)
gh api repos/OWNER/REPO/pulls/PR_NUMBER/comments \
  --paginate \
  --jq '.[] | {id, body, user: .user.login, createdAt: .created_at, path, position}'
```

### A3. PRs where user is reviewer (reviews given)

```bash
# Search PRs reviewed by user
gh search prs \
  --reviewed-by USERNAME \
  --repo OWNER/REPO \
  --state all \
  --limit 200 \
  --json number,title,state,createdAt,author

# Or via REST API (more complete)
gh api "repos/OWNER/REPO/pulls?state=all&per_page=100" \
  --paginate \
  --jq --arg user USERNAME \
  '[.[] | select(.requested_reviewers[].login == $user or .reviews[].user.login == $user)]'
```

### A4. Extract all review bodies written by user

```bash
# Get all review submissions by user on a specific repo
gh api "repos/OWNER/REPO/pulls?state=all&per_page=100" \
  --paginate \
  --jq '.[].number' \
  | while read pr_num; do
      gh api "repos/OWNER/REPO/pulls/$pr_num/reviews" \
        --jq --arg user USERNAME \
        '.[] | select(.user.login == $user) | {pr: '"$pr_num"', body, state, submitted_at}'
    done
```

### A5. Cross-repo PR search (org-wide)

```bash
# All PRs by user across the org
gh search prs \
  --author USERNAME \
  --owner YOUR_ORG \
  --state all \
  --limit 500 \
  --json number,title,repository,state,createdAt,mergedAt,body
```

---

## B. Commit Data

### B1. List commits by user in a repo

```bash
# Via REST API (most reliable for author filtering)
gh api "repos/OWNER/REPO/commits?author=USERNAME&per_page=100&since=2024-01-01T00:00:00Z&until=2024-12-31T23:59:59Z" \
  --paginate \
  --jq '.[] | {sha: .sha[0:8], message: .commit.message, date: .commit.author.date, additions: .stats.additions, deletions: .stats.deletions}'

# Simpler: via git log on cloned repo
git log --author="USERNAME" \
  --after="2024-01-01" \
  --before="2025-01-01" \
  --pretty=format:'%H|%s|%ad|%ae' \
  --stat
```

### B2. Commit stats (additions/deletions per commit)

```bash
# Requires fetching each commit individually for stats
gh api "repos/OWNER/REPO/commits/COMMIT_SHA" \
  --jq '{message: .commit.message, additions: .stats.additions, deletions: .stats.deletions, files: [.files[].filename]}'
```

### B3. Commit frequency heatmap (activity over time)

```bash
# Weekly commit activity
gh api "repos/OWNER/REPO/stats/punch_card" \
  --jq '.[] | {day: .[0], hour: .[1], commits: .[2]}'

# Contributor stats (weekly granularity)
gh api "repos/OWNER/REPO/stats/contributors" \
  --jq --arg user USERNAME \
  '.[] | select(.author.login == $user) | .weeks[] | {week: .w, additions: .a, deletions: .d, commits: .c}'
```

---

## C. Issue & Comment Data

### C1. Issues created by user

```bash
gh issue list \
  --repo OWNER/REPO \
  --author USERNAME \
  --state all \
  --limit 200 \
  --json number,title,body,state,createdAt,closedAt,labels,comments

# Org-wide
gh search issues \
  --author USERNAME \
  --owner YOUR_ORG \
  --type issue \
  --limit 500 \
  --json number,title,body,repository,state,createdAt
```

### C2. Issues commented on by user

```bash
# Via REST — search comments by user
gh api "repos/OWNER/REPO/issues/comments?per_page=100" \
  --paginate \
  --jq --arg user USERNAME \
  '[.[] | select(.user.login == $user) | {id, body, created_at, issue_url}]'
```

### C3. Issue resolution contributed by user (closed issues where user was last commenter)

```bash
gh api "repos/OWNER/REPO/issues?state=closed&per_page=100" \
  --paginate \
  --jq --arg user USERNAME \
  '[.[] | select(.closed_by.login == $user) | {number, title, closedAt: .closed_at}]'
```

---

## D. Code Review Quality Data

### D1. All reviews submitted by user (with body text)

```bash
# Get all open/closed PRs, then fetch reviews for each
gh api "repos/OWNER/REPO/pulls?state=all&per_page=100" \
  --paginate \
  --jq '.[].number' \
  | xargs -I{} gh api "repos/OWNER/REPO/pulls/{}/reviews" \
      --jq --arg user USERNAME \
      '.[] | select(.user.login == $user) | {pr_number: "{}",  state, body, submitted_at}'
```

### D2. Review comments (inline comments on code)

```bash
# All review comments by user across all PRs
gh api "repos/OWNER/REPO/pulls/comments?per_page=100" \
  --paginate \
  --jq --arg user USERNAME \
  '[.[] | select(.user.login == $user) | {id, body, path, line, created_at, pull_request_url}]'
```

### D3. Review approval patterns

```bash
# Count APPROVED vs CHANGES_REQUESTED vs COMMENTED reviews by user
gh api "repos/OWNER/REPO/pulls?state=all&per_page=100" \
  --paginate \
  --jq '.[].number' \
  | while read pr; do
      gh api "repos/OWNER/REPO/pulls/$pr/reviews" \
        --jq --arg user USERNAME \
        '.[] | select(.user.login == $user) | .state'
    done | sort | uniq -c
```

---

## E. Aggregate Statistics

### E1. Contributor summary (org-wide)

```bash
gh api "orgs/YOUR_ORG/repos?per_page=100" \
  --paginate \
  --jq '.[].full_name' \
  | while read repo; do
      gh api "repos/$repo/stats/contributors" 2>/dev/null \
        --jq --arg user USERNAME \
        '.[] | select(.author.login == $user) | {repo: "'"$repo"'", total: .total}'
    done
```

### E2. User's public profile + contribution calendar

```bash
# REST profile
gh api users/USERNAME \
  --jq '{login, name, bio, company, public_repos, followers, created_at}'
```

---

## F. GraphQL Queries (via `gh api graphql`)

GraphQL provides richer data in fewer requests than REST.

### F1. Contribution calendar (heatmap data)

```bash
gh api graphql -f query='
query($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      totalCommitContributions
      totalPullRequestContributions
      totalPullRequestReviewContributions
      totalIssueContributions
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            contributionLevel
          }
        }
      }
    }
  }
}' \
-f login=USERNAME \
-f from="2024-01-01T00:00:00Z" \
-f to="2024-12-31T23:59:59Z"
```

### F2. PR with all comments and reviews (single query)

```bash
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
      additions
      deletions
      changedFiles
      reviews(first: 50) {
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
            }
          }
        }
      }
      comments(first: 50) {
        nodes {
          author { login }
          body
          createdAt
        }
      }
    }
  }
}' \
-f owner=OWNER -f repo=REPO -F pr=PR_NUMBER
```

### F3. User's PR review contributions across repos

```bash
gh api graphql -f query='
query($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      pullRequestReviewContributions(first: 100) {
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
          }
        }
      }
    }
  }
}' \
-f login=USERNAME \
-f from="2024-01-01T00:00:00Z" \
-f to="2024-12-31T23:59:59Z"
```

---

## G. Proposed Data Collection Pipeline

### Step 1 — Define collection scope

```python
collection_spec = {
    "users": ["user1", "user2", ...],           # GitHub usernames
    "repos": ["org/repo1", "org/repo2", ...],   # repos to collect from
    "date_from": "2024-01-01",
    "date_to": "2024-12-31",
    "data_types": ["prs", "reviews", "commits", "issues", "comments"]
}
```

### Step 2 — Per-user collection (parallelizable across users)

```bash
# For each user, collect:
collect_user_data() {
    local user=$1
    local outdir="data/raw/$user"
    mkdir -p "$outdir"

    # PRs authored
    gh search prs --author "$user" --owner YOUR_ORG \
      --state all --limit 500 --json \
      number,title,body,repository,state,createdAt,mergedAt,additions,deletions \
      > "$outdir/prs_authored.json"

    # Reviews given
    gh api graphql -f query='...' -f login="$user" \
      > "$outdir/reviews_given.json"

    # Contribution calendar
    gh api graphql -f query='...' -f login="$user" \
      -f from="${DATE_FROM}T00:00:00Z" -f to="${DATE_TO}T23:59:59Z" \
      > "$outdir/contribution_calendar.json"

    # Issues created
    gh search issues --author "$user" --owner YOUR_ORG \
      --type issue --limit 200 --json number,title,body,repository,state,createdAt \
      > "$outdir/issues_created.json"
}
```

### Step 3 — Per-repo review comment collection

```bash
collect_review_comments() {
    local repo=$1
    local outdir="data/raw/review_comments/$repo"
    mkdir -p "$outdir"

    gh api "repos/$repo/pulls/comments?per_page=100" \
      --paginate \
      --jq '[.[] | {user: .user.login, body, path, created_at, pr_url: .pull_request_url}]' \
      > "$outdir/all_review_comments.json"
}
```

### Step 4 — Transform to NLP-ready corpus

```python
def build_user_corpus(user: str, raw_data_dir: str) -> dict:
    """Build text corpus per user for NLP inference"""
    corpus = {
        "user": user,
        "messages": []   # Each message = dict with text + metadata + source_type
    }

    # PR descriptions (high signal for Conscientiousness, Openness)
    for pr in load_json(f"{raw_data_dir}/{user}/prs_authored.json"):
        if pr.get("body") and len(pr["body"]) > 50:
            corpus["messages"].append({
                "text": pr["body"],
                "source": "pr_description",
                "date": pr["createdAt"],
                "metadata": {"pr_number": pr["number"], "repo": pr["repository"]["name"]}
            })

    # Review comments given (high signal for Agreeableness, Communication)
    for review in load_json(f"{raw_data_dir}/{user}/reviews_given.json"):
        for comment in review.get("comments", {}).get("nodes", []):
            if comment.get("body") and len(comment["body"]) > 20:
                corpus["messages"].append({
                    "text": comment["body"],
                    "source": "review_comment",
                    "date": review.get("submittedAt"),
                })

    # Issue descriptions (high signal for Problem Framing, Communication)
    for issue in load_json(f"{raw_data_dir}/{user}/issues_created.json"):
        if issue.get("body") and len(issue["body"]) > 50:
            corpus["messages"].append({
                "text": issue["body"],
                "source": "issue_description",
                "date": issue["createdAt"],
            })

    return corpus
```

### Step 5 — Feature extraction for each layer

```python
# After building corpus, extract features per assessment layer:
features = {
    # Layer 1: Personality (MLA-OCEAN inference)
    "ocean_scores": run_mla_ocean(corpus["messages"]),

    # Layer 2: Skill level (activity-based signals)
    "skill_signals": extract_skill_signals(raw_data),

    # Layer 3: Soft skills (pattern analysis)
    "soft_skill_signals": extract_soft_skill_signals(raw_data),

    # Layer 4: Performance (outcome metrics)
    "performance_metrics": compute_performance_metrics(raw_data),

    # Layer 5: Growth trajectory
    "growth_signals": compute_growth_trajectory(raw_data, time_windows=["3m", "6m", "12m"]),
}
```

---

## H. Rate Limits and Ethical Constraints

### GitHub API Rate Limits

| API type | Authenticated rate limit | Notes |
|----------|------------------------|-------|
| REST API | 5,000 requests/hour | Per token |
| GraphQL API | 5,000 points/hour | Points vary by query complexity |
| Search API | 30 requests/minute | Lower limit for search endpoints |
| Stats endpoints | May return 202 (computing) | Retry after 1–2 seconds |

### Throttling Strategy

```bash
# Add delay between large batch operations
sleep 0.5  # between individual API calls in loops

# Handle 202 (stats computing) responses
retry_api() {
    local response=$(gh api "$1" 2>&1)
    if echo "$response" | grep -q "202"; then
        sleep 2
        gh api "$1"
    else
        echo "$response"
    fi
}
```

### Ethical Constraints

1. **Organizational repos only:** Never collect from personal repos; only repos the organization owns
2. **Consent scope:** Collection is authorized under employment agreement + internal data policy
3. **BOD-only access:** Raw data and inferred profiles visible only to BOD, not to employees or their managers
4. **No public disclosure:** Profile data must never be shared externally
5. **Data retention:** Raw GitHub data should be deleted after inference; only structured profiles retained
6. **Right to review:** Individual employees can request to see their own profile (access to own data)
7. **No automated decisions:** AI profiles inform human judgment; no automated hiring/firing/promotion decisions
8. **Audit trail:** All profile updates must be logged with timestamp and trigger event
