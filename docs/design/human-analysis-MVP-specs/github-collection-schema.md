# GitHub Collection — Record Schema

**Collector:** `app/infrastructure/collectors/github.py`  
**Pipeline stage:** Collection → stored in `source_payloads.raw_data` as JSON array

---

## Collection phases

```
Phase 1 (parallel)                Phase 2 (parallel enrichment)
──────────────────────            ───────────────────────────────────────────────────
gh search issues (authored PRs)  → reviews_received + inline_feedback_received + files_changed
gh search issues (reviewed PRs)  → review_summaries + inline_comments + files_changed
gh search commits                → files_changed (for commits with a known repo)
```

Phase 2 uses `GET /repos/{owner}/{repo}/pulls/{n}/reviews`, `.../comments`, `.../files`  
and `GET /repos/{owner}/{repo}/commits/{sha}`. Up to `MAX_ENRICH_PRS=20` PRs and
`MAX_ENRICH_COMMITS=25` commits are enriched per run.

---

## Record type: `pr_authored`

```jsonc
{
  "type": "pr_authored",
  "number": 42,                       // PR number
  "title": "feat: add login page",
  "body": "...",                       // PR description, ≤2000 chars
  "state": "open|closed|merged",
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-16T12:00:00Z",
  "html_url": "https://github.com/owner/repo/pull/42",
  "comments": 3,                      // issue comment count
  "review_comments": 5,               // inline review comment count
  "repo": "owner/repo",
  "labels": ["feature", "backend"],

  // ── enriched fields (present if PR has reviews/comments) ──────────────
  "reviews_received": [
    {
      "author": "reviewer_handle",
      "state": "CHANGES_REQUESTED|APPROVED|COMMENTED",
      "body": "The error handling here is incomplete...",
      "submitted_at": "2024-01-16T09:00:00Z"
    }
  ],
  "inline_feedback_received": [
    {
      "author": "reviewer_handle",
      "body": "This could cause a null pointer exception",
      "path": "src/api/handler.py",
      "diff_hunk": "@@ -10,6 +10,8 @@\n+    result = do_thing()\n+    return result",
      "outdated": true,               // true = code has since changed; feedback was acted on
      "created_at": "2024-01-16T09:30:00Z"
    }
  ],
  "files_changed": [
    {
      "filename": "src/api/handler.py",
      "status": "modified",           // added|modified|removed|renamed
      "additions": 15,
      "deletions": 3,
      "patch": "@@ -1,5 +1,8 @@\n..."  // first 400 chars of diff, absent for binary
    }
  ]
}
```

---

## Record type: `pr_reviewed`

```jsonc
{
  "type": "pr_reviewed",
  "number": 99,
  "title": "fix: memory leak in worker",
  "state": "open|closed|merged",
  "updated_at": "2024-01-20T14:00:00Z",
  "html_url": "https://github.com/owner/repo/pull/99",
  "repo": "owner/repo",
  "pr_author": "colleague_handle",     // PR was written by someone else

  // ── enriched fields (present if user left reviews/comments) ───────────
  "review_summaries": [
    {
      "state": "CHANGES_REQUESTED",
      "body": "LGTM but the retry logic needs a backoff...",
      "submitted_at": "2024-01-20T15:00:00Z"
    }
  ],
  "inline_comments": [
    {
      "body": "This approach has O(n²) complexity — consider a set here",
      "path": "src/worker.py",
      "diff_hunk": "@@ -55,6 +55,10 @@ def process():\n+    for item in items:\n+        ...",
      "outdated": true,               // true = code was changed after this comment
                                      // strong signal: the feedback was actionable and resolved
      "created_at": "2024-01-20T15:30:00Z"
    }
  ],
  "files_changed": [
    {
      "filename": "src/worker.py",
      "status": "modified",
      "additions": 22,
      "deletions": 8,
      "patch": "@@ -55,6 +55,10 @@\n..."
    }
  ]
}
```

---

## Record type: `commit`

```jsonc
{
  "type": "commit",
  "sha": "af002776ce407d77dcaadd0da40278ec56901940",   // full SHA (not truncated)
  "message": "feat: add PRESS IT (#84)\n\n* feat: press it\n...",  // ≤500 chars
  "url": "https://github.com/owner/repo/commit/af002776...",
  "committed_at": "2024-03-08T16:47:28+07:00",
  "repo": "owner/repo",                               // empty string if repo unknown

  // ── enriched field (present for commits with a known repo) ────────────
  "files_changed": [
    {
      "filename": "src/feature.ts",
      "status": "added",
      "additions": 80,
      "deletions": 0,
      "patch": "@@ -0,0 +1,80 @@\n+..."
    }
  ]
}
```

---

## The `outdated` flag

A review comment's `position` field in the GitHub API is set to `null` when the
line it was written on has since changed (the PR was force-pushed or new commits
were added that edited that line).

```
outdated = (github_comment.position is None)
```

**Behavioral significance:**  
`outdated=true` means the reviewer wrote the comment, the author then changed
the code to address it, and GitHub marked the comment as superseded.  
This is one of the strongest signals of **actionable peer review** — the
reviewer gave concrete feedback and the author acted on it.

The LLM should treat `outdated=true` comments as **resolved feedback**,
not ignored feedback.

---

## Field mapping for P1 pipeline (chunker normalisation)

The `chunker._prepare_record()` function maps raw GitHub records into the
uniform P1 input shape:

| P1 field        | GitHub source                                         |
|-----------------|-------------------------------------------------------|
| `record_id`     | `sha` (commits) or `number` (PRs) → string            |
| `timestamp`     | `committed_at` → `created_at` → `updated_at`         |
| `source_type`   | `source_type` (injected by runner.py)                |
| `title`         | `title` or `type`                                     |
| `content`       | `build_content_excerpt()` — see below                |
| `thread_context`| `""` (no threading concept in GitHub)                |

`build_content_excerpt()` in `chunker.py` builds a single rich text string:

- **commit** → commit message + files changed with patches
- **pr_authored** → PR description + reviews_received + inline_feedback_received + files_changed
- **pr_reviewed** → review_summaries + inline_comments + files_changed

This content is both:
1. Passed to the P1 LLM prompt (in the `raw_records` array)
2. Stored in `evidence_units.content_excerpt` for display in the Evidence tab
