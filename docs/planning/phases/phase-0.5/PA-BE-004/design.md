# Design — PA-BE-004

## Components to Develop

| Component | Responsibility |
|-----------|---------------|
| `GitHubIngester` | Fetch commits, PRs, reviews, issues from GitHub API per username |
| `SlackIngester` | Fetch messages, threads, reactions from Slack API per user |
| `FeatureExtractor` | Normalize raw signals into structured feature vector |
| `DataPipelineService` | Orchestrate ingestion + extraction, handle partial failures |
| `SyncEndpoint` | API endpoint to trigger re-sync for selected developers |

## Component Relationships
```
DataPipelineService
  ├── GitHubIngester → GitHub API (REST)
  │     → stores raw_signals (source=github, type=commits/prs/reviews)
  ├── SlackIngester → Slack API (Web API)
  │     → stores raw_signals (source=slack, type=messages/threads/reactions)
  └── FeatureExtractor
        → reads raw_signals
        → writes developer_feature_vectors table
        → PA-BE-003 reads feature_vectors for LLM profile inference
```

## Data Flow — Sync Pipeline
```
POST /personnel/{id}/profile/sync (or batch: POST /personnel/profile/sync-batch)
  ↓
DataPipelineService.sync(personnel_id)
  → resolves github_username + slack_user_id from personnel record
  ↓
  [Parallel]:
  GitHubIngester.ingest(github_username)
    → paginate GitHub API: commits (last 12mo), PRs, reviews, issues
    → store in developer_raw_signals (upsert by date range)
  SlackIngester.ingest(slack_user_id)
    → fetch Slack workspace messages for user (scoped to org workspace)
    → store in developer_raw_signals
  ↓
FeatureExtractor.extract(personnel_id)
  → aggregate raw signals into feature dimensions:
      commit_frequency, pr_merge_rate, review_thoroughness,
      slack_response_rate, cross_team_collaboration, etc.
  → write to developer_feature_vectors (upsert, last_updated = now)
  ↓
Return sync_result: { github: ok/error, slack: ok/error, features_updated: true }
```

## Feature Dimensions Extracted
| Dimension | Source | Signal |
|-----------|--------|--------|
| Commit frequency | GitHub | commits/week average (12mo) |
| Code quality proxy | GitHub | PR revisions before merge |
| Review activity | GitHub | reviews given per PR raised ratio |
| Collaboration breadth | GitHub | unique repos contributed to |
| Response latency | Slack | median time to reply in threads |
| Cross-team reach | Slack | messages in channels outside own team |
| Recognition proxy | Slack | emoji reactions received per message |
| Communication volume | Slack | messages per week |

## API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/personnel/{id}/profile/sync` | Sync one developer's data |
| POST | `/personnel/profile/sync-batch` | Sync multiple developers |
| GET | `/personnel/{id}/profile/sync-status` | Last sync timestamps per source |

## Acceptance Criteria
- [ ] POST /personnel/{id}/profile/sync ingests GitHub data for a real test user
- [ ] POST /personnel/{id}/profile/sync ingests Slack data for a real test user
- [ ] If GitHub API fails, Slack ingestion still completes (partial success)
- [ ] Feature vectors stored after successful ingestion
- [ ] GET /personnel/{id}/profile/sync-status returns last_synced_at per source
- [ ] Rate limit handling: retries with backoff, does not 500 on rate limit hit
- [ ] No raw tokens or PII logged
- [ ] `uv run pytest tests/test_data_pipeline.py` passes (with mocked API responses)
