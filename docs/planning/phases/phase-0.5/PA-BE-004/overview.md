# PA-BE-004 — GitHub + Slack Data Pipeline

**Phase:** 0.5 — Analysis Modules
**Track:** Backend
**Branch:** `feature/PA-BE-004-data-pipeline`
**Status:** Not started
**Prerequisites:** PA-BE-001

## Goal
Ingest real developer activity data from GitHub and Slack per username, extract features, and store structured signals that PA-BE-003's 5-layer profile engine can use for LLM inference.

## Scope
- **GitHub ingestion** (via GitHub API / GitHub CLI):
  - Commits: count, frequency, message quality, languages, repositories
  - Pull Requests: authored, reviewed, time-to-merge, comment activity
  - Code reviews: comments given, thoroughness signals
  - Issue activity: opened, closed, cross-references
- **Slack ingestion** (via Slack API):
  - Message volume per channel type (eng / design / cross-team)
  - Thread response rate and latency
  - @mention patterns (who collaborates with whom)
  - Emoji reactions received (proxy for team impact)
- **Feature extraction**: normalize raw signals into structured feature vector per developer
- **Storage**: `developer_raw_signals` table (per source per developer, with ingested_at)
- **Sync endpoint**: trigger re-ingestion for selected developers
- Rate limiting, error handling, partial failure recovery (one dev failing doesn't block others)
