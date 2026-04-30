# 🚀 Demo Data Setup Guide

## Quick Start

This guide explains how to setup demo data for UI development **without any code changes**.

---

## Option 1: Automated Setup (Recommended)

### Step 1: Start Backend

```bash
cd be/
python -m uvicorn app.main:app --reload
```

Expected output:

```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

This automatically seeds `role_profiles` on first run.

### Step 2: Seed Demo Data

**In a new terminal:**

```bash
cd be/
python scripts/seed_demo_data.py
```

Expected output:

```
INFO:     Creating organization...
INFO:     Creating team...
INFO:     Fetching role profile...
INFO:     Creating member...
INFO:     Creating analysis run...
INFO:     Creating evidence units...
INFO:     Creating dimension scores...
INFO:     Creating KPT items...
INFO:     Creating behavioral events...
======================================================================
✅ Demo data seeded successfully!
======================================================================
   Organization: Desert Empire Corp (org-id-xxx)
   Team: Backend Warriors (team-id-xxx)
   Member: An Vy Nguyen (member-id-xxx)
   Analysis Run: run-id-xxx
   Period: 2025-10-24 to 2026-04-19

Ready for UI testing:
   http://localhost:3000/profile/member-id-xxx
======================================================================
```

### Step 3: Start Frontend

**In another terminal:**

```bash
cd ui/
pnpm dev
```

Expected output:

```
  ▲ Next.js 15.x
  - Local:        http://localhost:3000
```

### Step 4: View Demo Data

Open in browser:

```
http://localhost:3000/profile/{member-id-from-output}
```

Replace `{member-id-from-output}` with the member ID from Step 2.

---

## Option 2: Manual API Calls

If you prefer to create data step-by-step:

```bash
# 1. Create organization
ORG_ID=$(curl -s -X POST http://localhost:8000/api/v1/organizations \
  -H "Content-Type: application/json" \
  -d '{"name": "My Org"}' | jq -r '.data.organization_id')

# 2. Create team
TEAM_ID=$(curl -s -X POST http://localhost:8000/api/v1/organizations/$ORG_ID/teams \
  -H "Content-Type: application/json" \
  -d '{"name": "My Team"}' | jq -r '.data.team_id')

# 3. Create member
MEMBER_ID=$(curl -s -X POST http://localhost:8000/api/v1/organizations/$ORG_ID/teams/$TEAM_ID/members \
  -H "Content-Type: application/json" \
  -d '{"display_name": "John Doe", "external_id": "john@company.com"}' | jq -r '.data.member_id')

# 4. Trigger analysis
curl -s -X POST http://localhost:8000/api/v1/analysis-runs \
  -H "Content-Type: application/json" \
  -d "{
    \"member_id\": \"$MEMBER_ID\",
    \"period_start\": \"2025-01-01\",
    \"period_end\": \"2026-04-19\",
    \"run_type\": \"fresh\"
  }"
```

---

## Reset Demo Data

To start fresh:

```bash
# Delete the database
rm be/dev.db

# Restart backend (auto-creates new DB with role_profiles)
cd be/
python -m uvicorn app.main:app --reload

# Reseed demo data
python scripts/seed_demo_data.py
```

---

## Verify Setup

### Check Swagger UI

```
http://localhost:8000/docs
```

All endpoints should be listed and interactive.

### Check Member Profile API

```
curl http://localhost:8000/api/v1/members/{member-id} | jq
```

Should return member data.

### Check Overview Data

```
curl http://localhost:8000/api/v1/members/{member-id}/profile/overview | jq
```

Should return analysis overview with scores and summary.

---

## What Gets Seeded

✅ **Organization** — "Desert Empire Corp"
✅ **Team** — "Backend Warriors"
✅ **Member** — "An Vy Nguyen" (senior engineer)
✅ **Analysis Run** — Period: Jan 2025 - Apr 2026
✅ **Evidence Units** (5)

- PR authored
- Commits
- Code reviews
  ✅ **Dimension Scores** (5)
- Technical execution (8.2/10)
- Code quality (7.8/10)
- Communication (6.5/10)
- Problem solving (7.9/10)
- Ownership (6.8/10)
  ✅ **KPT Items** (6)
- 2x Keep items
- 2x Problem items
- 2x Try items
  ✅ **Behavioral Events** (5)
- Mix of positive and negative signals

---

## FAQ

**Q: Do I need to modify any code?**
A: No. Zero code changes. Seed script is completely external.

**Q: Can I run it multiple times?**
A: Yes, it's safe. Script is idempotent (won't create duplicates).

**Q: How do I switch between demo and real data?**
A: Just delete `be/dev.db` and don't run the seed script.

**Q: Can I use the API in Swagger UI?**
A: Yes! Go to `http://localhost:8000/docs` and test endpoints interactively.

**Q: What if the script fails?**
A: Check that:

1. Backend is running (`http://localhost:8000/health` returns `{"status":"ok"}`)
2. Python path is correct (run from `be/` directory)
3. All dependencies installed (`uv pip install -e .` in `be/`)

---

## Next Steps

Once demo data is seeded:

1. **View Overview** → http://localhost:3000/profile/{member-id}
2. **Explore Competency** → Dimension scores, confidence, evidence
3. **Review KPT** → Keep/Problem/Try items
4. **Check Cases** → Case feedback (if implemented)
5. **Journey** → Growth milestones (if implemented)

---

## Support

For issues, check:

- Backend logs: `python -m uvicorn app.main:app --reload` output
- Seed script logs: `python scripts/seed_demo_data.py` output
- Swagger docs: http://localhost:8000/docs
