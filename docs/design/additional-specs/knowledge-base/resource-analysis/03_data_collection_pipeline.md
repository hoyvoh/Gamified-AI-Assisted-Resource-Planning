---
title: "Data Collection Pipeline — GitHub CLI + Slack Export"
type: synthesis
sources:
  - "00_sources/github_data_methodology.md"
  - "01_resource_profile_methodology.md"
target_users: ["BOD only"]
visibility: "BOD-only — data collection scope requires explicit organizational authorization"
privacy_note: "Collect from organizational repos only; employee consent governed by employment agreement + data policy"
---

# Data Collection Pipeline

## Overview

This document specifies the end-to-end pipeline for collecting, processing, and structuring developer behavioral data from GitHub and Slack into the feature vectors consumed by the 5-layer developer profiling system.

**Pipeline stages:**
```
Stage 1: Scope Definition       (what to collect, for whom, over what period)
Stage 2: Raw Data Collection    (GitHub CLI commands + Slack export)
Stage 3: Data Cleaning          (deduplication, normalization, filtering)
Stage 4: Feature Extraction     (behavioral signals from raw data)
Stage 5: Profile Generation     (layer-by-layer scoring)
Stage 6: Storage and Audit      (structured profile storage + audit trail)
```

---

## Stage 1: Scope Definition

### Collection Specification

```python
collection_spec = {
    "users": ["github_username_1", "github_username_2"],  # GitHub usernames
    "repos": ["org/repo1", "org/repo2"],                  # org-owned repos only
    "date_from": "2025-01-01",
    "date_to":   "2025-12-31",
    "data_types": ["prs", "reviews", "review_comments", "commits", "issues", "issue_comments"],
    "slack_workspaces": ["workspace_id"],                  # if Slack data authorized
    "slack_channels": ["#engineering", "#backend-team"],   # specific channels only
}
```

### Privacy Constraints (mandatory)

| Constraint | Rule |
|-----------|------|
| **Organizational repos only** | Never collect from personal repos; only repos the organization owns |
| **Authorized period only** | Only collect within the specified date range; no historical fishing |
| **Designated collectors only** | Only authorized BOD members or designated data team can run collection |
| **No real-time monitoring** | Collection is batch (periodic), not continuous real-time surveillance |
| **Slack scope** | Only pre-approved channels; not DMs; not private channels |

---

## Stage 2: Raw Data Collection

### 2A: GitHub Data — Per-User Collection

Run the following for each user. Save to `data/raw/{username}/`.

#### PR Data (authored)

```bash
# All PRs authored by user across the org
gh search prs \
  --author "$USERNAME" \
  --owner "$ORG" \
  --state all \
  --limit 500 \
  --json number,title,body,repository,state,createdAt,mergedAt,closedAt,\
additions,deletions,changedFiles,labels \
  > "data/raw/$USERNAME/prs_authored.json"
```

#### Reviews Given (GraphQL — richer data)

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
            comments(first: 50) {
              nodes { body path author { login } }
            }
          }
        }
      }
    }
  }
}' \
-f login="$USERNAME" \
-f from="${DATE_FROM}T00:00:00Z" \
-f to="${DATE_TO}T23:59:59Z" \
> "data/raw/$USERNAME/reviews_given.json"
```

#### Contribution Calendar

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
-f login="$USERNAME" \
-f from="${DATE_FROM}T00:00:00Z" \
-f to="${DATE_TO}T23:59:59Z" \
> "data/raw/$USERNAME/contribution_calendar.json"
```

#### Issues Created

```bash
gh search issues \
  --author "$USERNAME" \
  --owner "$ORG" \
  --type issue \
  --limit 200 \
  --json number,title,body,repository,state,createdAt,closedAt,labels \
  > "data/raw/$USERNAME/issues_created.json"
```

### 2B: GitHub Data — Per-Repo Collection

Run for each repo in scope. Save to `data/raw/repos/{repo}/`.

#### All Review Comments (for reviewer analysis)

```bash
# Replace / with _ in repo name for directory
REPO_DIR=$(echo "$REPO" | tr '/' '_')
mkdir -p "data/raw/repos/$REPO_DIR"

gh api "repos/$REPO/pulls/comments?per_page=100" \
  --paginate \
  --jq '[.[] | {
    user: .user.login,
    body,
    path,
    line,
    created_at,
    pull_request_url,
    in_reply_to_id
  }]' \
  > "data/raw/repos/$REPO_DIR/all_review_comments.json"
```

#### PR Review Outcomes (approval patterns)

```bash
# Get review states per PR (APPROVED / CHANGES_REQUESTED / COMMENTED)
gh api "repos/$REPO/pulls?state=all&per_page=100" \
  --paginate \
  --jq '.[].number' \
  | while read pr_num; do
      gh api "repos/$REPO/pulls/$pr_num/reviews" \
        --jq ".[] | {pr: $pr_num, user: .user.login, state, submitted_at}"
      sleep 0.3  # rate limit protection
    done \
  > "data/raw/repos/$REPO_DIR/review_outcomes.jsonl"
```

#### Issue Comments (for communication analysis)

```bash
gh api "repos/$REPO/issues/comments?per_page=100" \
  --paginate \
  --jq '[.[] | {user: .user.login, body, created_at, issue_url}]' \
  > "data/raw/repos/$REPO_DIR/issue_comments.json"
```

### 2C: Slack Data Collection

Slack data requires **Slack admin API access** or **exported archive**.

#### Option A: Slack Export (recommended for privacy)

```bash
# Via Slack admin export (requires workspace owner):
# Settings → Import/Export → Export → select channel scope and date range
# Download produces a zip with JSON files per channel per day

# Extract and normalize
python scripts/slack_extract.py \
  --export_zip "slack_export_2025.zip" \
  --channels "#engineering,#backend-team" \
  --users "$USER_LIST" \
  --output "data/raw/slack/"
```

#### Option B: Slack API (real-time, requires bot token)

```bash
# Get messages from a channel in date range
curl -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
  "https://slack.com/api/conversations.history" \
  -d "channel=$CHANNEL_ID&oldest=$EPOCH_FROM&latest=$EPOCH_TO&limit=200"
```

**Slack data scope:** Only collect message text, timestamp, and user ID. Do not collect reactions, DMs, or file attachments.

### 2D: Rate Limiting and Resilience

```bash
# GitHub REST API: 5,000 req/hr per token
# GitHub GraphQL: 5,000 points/hr
# GitHub Search: 30 req/min

# Throttling wrapper
gh_api_safe() {
    local endpoint="$1"
    local response
    response=$(gh api "$endpoint" 2>&1)

    # Handle 202 (stats computing — retry)
    if echo "$response" | grep -q "\"status\":\"202\""; then
        sleep 2
        gh api "$endpoint"
    # Handle 429 (rate limit)
    elif echo "$response" | grep -q "\"message\":\"API rate limit exceeded\""; then
        echo "Rate limit hit; sleeping 60s" >&2
        sleep 60
        gh api "$endpoint"
    else
        echo "$response"
    fi
}

# Add delay between batch operations
DELAY_BETWEEN_USERS=2      # seconds between users
DELAY_BETWEEN_REPO_CALLS=0.3  # seconds between per-repo API calls
```

---

## Stage 3: Data Cleaning

```python
def clean_user_data(username: str, raw_dir: str) -> dict:
    """
    Clean and normalize raw collected data.
    Returns structured dict ready for feature extraction.
    """
    data = {}

    # Load and validate PRs
    prs = load_json(f"{raw_dir}/{username}/prs_authored.json")
    data["prs"] = [
        pr for pr in prs
        if pr.get("state") in ("merged", "closed", "open")
        and pr.get("createdAt") >= DATE_FROM
    ]

    # Filter bot-authored content (exclude Dependabot, renovate, etc.)
    BOT_PATTERNS = ["bot", "dependabot", "renovate", "github-actions"]
    data["prs"] = [
        pr for pr in data["prs"]
        if not any(p in username.lower() for p in BOT_PATTERNS)
    ]

    # Deduplicate reviews (same review may appear in multiple queries)
    reviews = load_json(f"{raw_dir}/{username}/reviews_given.json")
    seen_reviews = set()
    data["reviews"] = []
    for r in reviews:
        key = f"{r.get('pr_number')}_{r.get('submitted_at')}"
        if key not in seen_reviews:
            seen_reviews.add(key)
            data["reviews"].append(r)

    # Clean text fields (remove code blocks from NLP corpus — they skew personality inference)
    for pr in data["prs"]:
        if pr.get("body"):
            pr["body_clean"] = remove_code_blocks(pr["body"])
            pr["body_clean"] = remove_urls(pr["body_clean"])

    return data


def remove_code_blocks(text: str) -> str:
    """Remove markdown code fences before NLP analysis."""
    import re
    return re.sub(r"```[\s\S]*?```", "[CODE]", text)
```

---

## Stage 4: Feature Extraction

### 4A: Text Corpus for Personality Inference (Layer 1)

```python
def build_nlp_corpus(username: str, cleaned_data: dict) -> list[dict]:
    """
    Build ordered text corpus for MLA-OCEAN / LLM-based OCEAN inference.
    Returns list of {text, source_type, date, metadata} dicts.
    """
    corpus = []

    # PR descriptions — high signal for Conscientiousness, Openness
    for pr in cleaned_data["prs"]:
        body = pr.get("body_clean", "")
        if body and len(body) > 50:  # filter very short descriptions
            corpus.append({
                "text": body,
                "source": "pr_description",
                "date": pr["createdAt"],
                "signal_strength": "high",  # PR descriptions are deliberate writing
                "metadata": {"pr_number": pr["number"], "repo": pr.get("repository", {}).get("name")}
            })

    # Review comments given — high signal for Agreeableness, Communication
    for review in cleaned_data.get("reviews", []):
        for comment in review.get("pullRequestReview", {}).get("comments", {}).get("nodes", []):
            body = comment.get("body", "")
            if body and len(body) > 20:
                corpus.append({
                    "text": body,
                    "source": "review_comment",
                    "date": review.get("occurredAt"),
                    "signal_strength": "high",
                    "metadata": {}
                })

        # Review body (top-level review summary)
        review_body = review.get("pullRequestReview", {}).get("body", "")
        if review_body and len(review_body) > 30:
            corpus.append({
                "text": review_body,
                "source": "review_body",
                "date": review.get("occurredAt"),
                "signal_strength": "medium",
                "metadata": {}
            })

    # Issue descriptions — signal for Problem Framing, Communication
    for issue in cleaned_data.get("issues", []):
        body = issue.get("body", "")
        if body and len(body) > 50:
            corpus.append({
                "text": body,
                "source": "issue_description",
                "date": issue.get("createdAt"),
                "signal_strength": "medium",
                "metadata": {}
            })

    # Sort by date for temporal analysis
    corpus.sort(key=lambda x: x.get("date") or "")
    return corpus
```

### 4B: Behavioral Signals for Layers 2–5

```python
def extract_behavioral_signals(username: str, cleaned_data: dict) -> dict:
    """
    Extract quantitative behavioral signals from raw GitHub data.
    These feed Layers 2, 3, 4, and 5.
    """
    prs = cleaned_data.get("prs", [])
    reviews = cleaned_data.get("reviews", [])
    calendar = cleaned_data.get("contribution_calendar", {})

    signals = {}

    # === DELIVERY SIGNALS (Layer 5 — Delivery Reliability) ===
    merged_prs = [pr for pr in prs if pr.get("state") == "merged"]
    signals["pr_merge_rate"] = len(merged_prs) / len(prs) if prs else 0
    signals["pr_total"] = len(prs)
    signals["pr_merged"] = len(merged_prs)

    # PR cycle time (open to merge)
    cycle_times = []
    for pr in merged_prs:
        if pr.get("createdAt") and pr.get("mergedAt"):
            delta = parse_date(pr["mergedAt"]) - parse_date(pr["createdAt"])
            cycle_times.append(delta.total_seconds() / 3600)  # hours
    signals["pr_cycle_time_p50"] = percentile(cycle_times, 50) if cycle_times else None
    signals["pr_cycle_time_p90"] = percentile(cycle_times, 90) if cycle_times else None

    # === CODE SIZE SIGNALS (Layer 3 — capability proxy) ===
    signals["avg_pr_additions"] = mean([pr.get("additions", 0) for pr in merged_prs])
    signals["avg_pr_deletions"] = mean([pr.get("deletions", 0) for pr in merged_prs])
    signals["avg_pr_files_changed"] = mean([pr.get("changedFiles", 0) for pr in merged_prs])

    # === REVIEW SIGNALS (Layer 4 — Collaboration, Mentorship) ===
    signals["reviews_given"] = len(reviews)
    signals["review_to_pr_ratio"] = len(reviews) / len(prs) if prs else 0

    # Review approval patterns
    review_states = []
    for r in reviews:
        state = r.get("pullRequestReview", {}).get("state")
        if state:
            review_states.append(state)
    from collections import Counter
    state_counts = Counter(review_states)
    signals["review_approved_rate"] = state_counts.get("APPROVED", 0) / len(review_states) if review_states else 0
    signals["review_changes_requested_rate"] = state_counts.get("CHANGES_REQUESTED", 0) / len(review_states) if review_states else 0

    # Review comment depth (comments per review)
    comment_counts = []
    for r in reviews:
        n = len(r.get("pullRequestReview", {}).get("comments", {}).get("nodes", []))
        comment_counts.append(n)
    signals["avg_review_comments"] = mean(comment_counts) if comment_counts else 0

    # === COMMIT TIMING SIGNALS (Layer 2 — Work rhythm, Layer 5 — Burnout risk) ===
    if calendar:
        contribution_days = []
        for week in calendar.get("contributionCalendar", {}).get("weeks", []):
            for day in week.get("contributionDays", []):
                if day.get("contributionCount", 0) > 0:
                    contribution_days.append({
                        "date": day["date"],
                        "count": day["contributionCount"]
                    })

        # Weekend activity rate
        weekend_days = [d for d in contribution_days if is_weekend(d["date"])]
        signals["weekend_activity_rate"] = len(weekend_days) / len(contribution_days) if contribution_days else 0

        # Contribution consistency (coefficient of variation)
        weekly_counts = compute_weekly_counts(contribution_days)
        signals["contribution_cv"] = cv(weekly_counts) if weekly_counts else None  # lower = more consistent

    # === TEXT QUALITY SIGNALS (Layer 4 — Communication) ===
    pr_body_lengths = [len(pr.get("body_clean", "")) for pr in prs if pr.get("body_clean")]
    signals["avg_pr_body_length"] = mean(pr_body_lengths) if pr_body_lengths else 0
    signals["prs_with_body_gt_100"] = sum(1 for l in pr_body_lengths if l > 100) / len(pr_body_lengths) if pr_body_lengths else 0

    # === INITIATIVE SIGNALS (Layer 4) ===
    issues = cleaned_data.get("issues", [])
    signals["issues_created"] = len(issues)
    signals["issues_per_month"] = len(issues) / max(1, months_in_range(DATE_FROM, DATE_TO))

    return signals
```

### 4C: LLM-Based Quality Signals

Some signals require natural language understanding — these are extracted via LLM inference:

```python
def extract_llm_signals(corpus: list[dict], signals: dict) -> dict:
    """
    Use LLM (Claude) to extract quality signals that require understanding.
    """
    # Sample up to 30 representative messages for LLM analysis
    sample = sample_corpus(corpus, max_items=30, strategy="diverse")

    prompt = f"""
You are analyzing GitHub activity artifacts for a developer profile system.
The following messages are from a developer's PRs, reviews, and issues.
Analyze them and return a JSON object with these scores (1.0–5.0):

{{
  "communication_clarity": <float>,       // How clear and well-structured is the writing?
  "review_educational_value": <float>,   // Do review comments explain "why" not just "what"?
  "problem_framing_quality": <float>,    // Do issue descriptions define problems well?
  "conscientiousness_signals": <float>,  // Evidence of thoroughness, attention to detail?
  "openness_signals": <float>,           // Novel approaches, intellectual curiosity?
  "agreeableness_signals": <float>,      // Collaborative, constructive language?
  "language_barrier_flag": <bool>,       // Non-native English signals (for calibration)?
  "confidence": <float>                  // Your confidence in these assessments (0–1)
}}

Messages to analyze:
{format_corpus_sample(sample)}

Return ONLY valid JSON.
"""

    response = call_claude(prompt)
    llm_signals = parse_json(response)

    signals.update(llm_signals)
    return signals
```

---

## Stage 5: Profile Generation

```python
def generate_developer_profile(username: str, signals: dict, corpus: list[dict]) -> dict:
    """
    Assemble the 5-layer developer profile from extracted signals.
    """
    profile = {
        "developer": username,
        "generated_at": datetime.now().isoformat(),
        "data_period": {"from": DATE_FROM, "to": DATE_TO},
        "corpus_size": len(corpus),
        "signal_count": len(signals),
    }

    # Layer 1: OCEAN inference from corpus
    profile["layer1_ocean"] = infer_ocean_from_corpus(corpus, signals)

    # Layer 2: Behavioral preferences from quantitative signals
    profile["layer2_behavioral"] = compute_behavioral_preferences(signals)

    # Layer 3: Technical capability from PR/review patterns
    profile["layer3_technical"] = compute_technical_capability(signals)

    # Layer 4: Soft skills from communication and collaboration signals
    profile["layer4_soft_skills"] = compute_soft_skills(signals)

    # Layer 5: Performance and growth trajectory
    profile["layer5_performance"] = compute_performance_metrics(signals)

    # WFU calibration
    profile["wfu_factors"] = compute_wfu_factors(profile)

    # Flags
    profile["flags"] = generate_flags(profile, signals)

    return profile


def generate_flags(profile: dict, signals: dict) -> list[str]:
    """Generate human-review flags for unusual patterns."""
    flags = []

    if signals.get("weekend_activity_rate", 0) > 0.40:
        flags.append("BURNOUT_RISK: High after-hours/weekend activity rate")

    ocean = profile.get("layer1_ocean", {})
    if any(v.get("confidence", 1) < 0.5 for v in ocean.values()):
        flags.append("LOW_CONFIDENCE: OCEAN scores have low confidence — corpus may be too small")

    if signals.get("corpus_size", 0) < 100:
        flags.append("SMALL_CORPUS: Fewer than 100 messages — profile may be unreliable")

    soft = profile.get("layer4_soft_skills", {})
    if soft.get("conflict_navigation", {}).get("confidence", 1) < 0.4:
        flags.append("HUMAN_REVIEW_NEEDED: Conflict navigation requires human validation")

    if signals.get("language_barrier_flag"):
        flags.append("LANGUAGE_CALIBRATION: Non-native English signals — apply language bias adjustment to communication scores")

    return flags
```

---

## Stage 6: Storage and Audit Trail

### Storage Schema

```
data/
├── raw/                        # Temporary — deleted after feature extraction
│   ├── {username}/
│   │   ├── prs_authored.json
│   │   ├── reviews_given.json
│   │   ├── contribution_calendar.json
│   │   └── issues_created.json
│   └── repos/
│       └── {org_repo}/
│           ├── all_review_comments.json
│           └── review_outcomes.jsonl
│
├── features/                   # Retained — anonymized signal vectors
│   └── {username}/
│       ├── signals.json        # Quantitative signals
│       └── corpus_metadata.json # Corpus stats (no raw text)
│
└── profiles/                   # Retained — BOD-only access
    └── {username}/
        ├── profile_current.json     # Latest profile
        ├── profile_{date}.json      # Historical snapshots
        └── audit_log.jsonl          # Update history
```

### Audit Log Format

```json
{
  "timestamp": "2026-03-01T10:00:00Z",
  "event": "profile_generated",
  "developer": "github_username",
  "triggered_by": "scheduled_quarterly_run",
  "data_period": {"from": "2025-10-01", "to": "2025-12-31"},
  "profile_version": "2026-03-01",
  "operator": "system",
  "layers_updated": ["layer1", "layer3", "layer4", "layer5"],
  "flags_generated": ["SMALL_CORPUS"],
  "raw_data_deleted_at": "2026-03-01T10:05:00Z"
}
```

### Data Retention Policy

| Data type | Retention period | After retention |
|-----------|-----------------|-----------------|
| Raw GitHub API responses | Until feature extraction complete (max 48h) | Delete |
| Raw Slack messages | Until corpus extraction complete (max 48h) | Delete |
| Extracted features/signals | 24 months | Archive then delete |
| Structured profiles | 36 months or until offboarding + 12 months | Archive then delete |
| Audit logs | 7 years (legal/compliance) | Archive |

---

## Pipeline Orchestration

### Recommended Run Schedule

| Trigger | Pipeline scope |
|---------|---------------|
| Monthly (automated) | Layer 5 performance metrics for all active developers |
| Quarterly (automated) | Full 5-layer update for all active developers |
| On-demand (BOD request) | Full update for specific developer (e.g., before major assignment) |
| On role change | Behavioral preference update (Layer 2) |

### Execution Script (orchestrator)

```bash
#!/bin/bash
# Full quarterly pipeline run

set -euo pipefail

DATE_FROM="${1:-$(date -d '90 days ago' +%Y-%m-%d)}"
DATE_TO="${2:-$(date +%Y-%m-%d)}"
ORG="${3:-your-org}"

echo "Pipeline run: $DATE_FROM to $DATE_TO for org $ORG"

# Step 1: Collect per-user data
for USERNAME in $(cat config/users.txt); do
    echo "Collecting data for $USERNAME..."
    collect_user_data "$USERNAME" "$ORG" "$DATE_FROM" "$DATE_TO"
    sleep $DELAY_BETWEEN_USERS
done

# Step 2: Collect per-repo data
for REPO in $(cat config/repos.txt); do
    echo "Collecting repo data for $REPO..."
    collect_repo_data "$REPO"
    sleep 1
done

# Step 3: Extract features and generate profiles
python scripts/generate_profiles.py \
    --users config/users.txt \
    --date-from "$DATE_FROM" \
    --date-to "$DATE_TO" \
    --output profiles/

# Step 4: Delete raw data
echo "Cleaning up raw data..."
rm -rf data/raw/

echo "Pipeline complete. Profiles in profiles/"
```

---

## Ethical Checklist (run before each collection)

Before executing any data collection, verify:

- [ ] Collection is authorized by organizational data policy
- [ ] All target repositories are organization-owned (no personal repos)
- [ ] Date range is within approved collection window
- [ ] Legal has reviewed the collection scope if any personal data is involved
- [ ] Results will be stored in BOD-only access location
- [ ] Raw data deletion is scheduled within 48 hours of feature extraction
- [ ] Individual developers have the right to request their own profile
- [ ] Audit log entry will be created for this collection run
