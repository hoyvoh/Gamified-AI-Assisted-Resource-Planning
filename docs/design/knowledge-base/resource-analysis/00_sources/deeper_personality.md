---
source: "DEEPER: Directed Persona Refinement for Dynamic Persona Modeling"
authors: ["Aili Chen", "Chengyu Du", "Jiangjie Chen", "Jinghan Xu", "Yikai Zhang", "Siyu Yuan", "Zulong Chen", "Liangyue Li", "Yanghua Xiao"]
affiliations: ["Fudan University", "ByteDance Seed", "Alibaba Group"]
venue: "arXiv preprint"
arxiv_id: "2502.11078v2"
year: 2025
github: "https://github.com/sheep333c/DEEPER.git"
type: academic_paper
relevance: resource_analysis
---

# DEEPER: Directed Persona Refinement for Dynamic Persona Modeling

## ⚠️ Important Framing Note

DEEPER is **not** a Big Five / OCEAN personality model. It is a **dynamic persona modeling** system that uses LLMs + iterative reinforcement learning to maintain an up-to-date **natural-language description of a user's behavioral preferences** (e.g., "this user prefers horror films with complex plots and supernatural elements").

**Why it's in our resource-analysis knowledge base:**
DEEPER's core methodology — *continually updating a user profile from streaming behavioral data, with feedback from prediction accuracy* — is directly applicable to the problem of maintaining a developer profile that improves as new GitHub/Slack data accumulates. The system answers: "how do we refine what we know about a person without losing previously-learned knowledge and without degrading prediction quality?"

---

## Citation

> Chen, A., Du, C., Chen, J., Xu, J., Zhang, Y., Yuan, S., Chen, Z., Li, L., & Xiao, Y. (2025). DEEPER Insight into Your User: Directed Persona Refinement for Dynamic Persona Modeling. *arXiv preprint arXiv:2502.11078v2*.

---

## Problem Statement

Modern LLM-based persona modeling creates human-readable user descriptions from behavioral data. The challenge in **dynamic** real-world settings is that user behaviors change over time (streaming data), and existing update methods fail to *consistently improve* persona quality:

| Paradigm | Method | Problem |
|----------|--------|---------|
| **Persona Regeneration** | Rebuild from scratch each time | Loses historical knowledge; computationally expensive |
| **Persona Extension** | Append new behavior to existing persona | Grows unbounded; no quality guarantee; errors accumulate |
| **Persona Refinement** (DEEPER) | Targeted updates guided by prediction errors | ✅ Ensures quality improvement each round |

**Core insight:** The gap between persona updating and persona *optimization* is caused by **weak update signals** (raw behaviors alone don't reveal *what* was wrong) and **unclear update direction** (hard to know which specific aspect of the persona to change).

---

## Key Concept: Update Direction

DEEPER introduces the concept of **update direction** — the specific path in persona space from the old persona to the new persona, given observed behavioral discrepancies.

```
Dt ↔ (St-1, Ot; St)
```

Where:
- `St-1` = previous persona (natural language description)
- `Ot` = observation at time t = {actual behaviors Ot, predicted behaviors Ôt|St-1}
- `St` = refined persona
- `Dt` = the unique direction determined by this triplet

**Critical insight:** By explicitly modeling the direction of update (not just the updated state), DEEPER can evaluate whether an update was good before committing to it.

---

## Three Goals for Direction Search

To determine a good update direction, DEEPER decomposes the objective into three temporal goals:

| Goal | Name | Description |
|------|------|-------------|
| **Goal 1** | Previous Preservation | Retain stable persona traits from historical behaviors — ensures consistency |
| **Goal 2** | Current Reflection | Adapt to recent user behaviors — corrects errors in the previous persona |
| **Goal 3** | Future Advancement | Enhance predictive capability for future behaviors — improves forward accuracy |

---

## Task Formulation

Each persona refinement step is framed as a **reinforcement learning task**:

- **State:** Previous persona `St-1`
- **Observation:** `Ot = {Ot, Ôt|St-1}` — actual + predicted behaviors
- **Action:** Refined persona `St`
- **Policy:** `πθ: (St-1, Ot) → St`
- **Reward:** Quality of the refinement direction

### Reward Function

Three reward components corresponding to three goals:

```
r_prev_t = ε(t-1)|St-1  −  ε(t-1)|St     # improvement on past window
r_curr_t = ε(t)  |St-1  −  ε(t)  |St     # improvement on current window
r_fut_t  = ε(t+1)|St-1  −  ε(t+1)|St     # improvement on future window

rt = r_prev_t + r_curr_t + r_fut_t        # total reward
```

Where `ε(t)|S` = MAE (Mean Absolute Error) of persona `S` predicting behaviors in window `t`:

```
ε(t+1)|St = (1/N) Σ |ô_j_(t+1)|St − o_j_(t+1)|
```

**Optimization objective (Continual Persona Optimization):**
```
ε(t+1)|St < ε(t)|St-1     for all t
```

Each update round must reduce prediction error. A persona that doesn't improve prediction is not a better persona.

---

## Iterative Training Framework

DEEPER trains a **policy model** to search for good directions via two iterations of offline RL with DPO fine-tuning:

```
Base Model
    │
    ▼ Iteration 1 ─── Learn to refine INITIAL personas
Model 1 (refined initial personas well)
    │
    ▼ Iteration 2 ─── Learn to refine PRE-OPTIMIZED personas
Model 2 (refined optimized personas well)
    │
    ▼ Online Deployment
Step-wise refinement on new streaming data
```

### Iteration 1 — Refine Initial Personas

1. **Context construction:** Initialize personas `S0` from `W0` behaviors. Predict `W1` behaviors using `S0`.
2. **Direction sampling:** For each context `(S0, O1)`, sample M candidate refined personas `{S_k_1}`.
3. **Reward calculation:** Compute `rt` for each candidate direction.
4. **Preference pairs:** Partition into positive set (reward ≥ τ+) and negative set (reward ≤ τ-).
5. **Training:** DPO fine-tuning with SFT regularization:

```
L(πθ; πref) = L_DPO(πθ; πref) + α · L_SFT(πθ)
```

### Iteration 2 — Refine Optimized Personas

Extends training to handle already-optimized personas (harder task: less room for improvement, requires more nuanced updates). Uses both original contexts and new contexts from second refinement step.

---

## Dataset & Evaluation

| Metric | Value |
|--------|-------|
| Users | 4,800 |
| Domains | 10 (movies, books, products, etc.) |
| Update rounds | 4 |
| Evaluation metric | MAE (Mean Absolute Error) of behavior prediction |
| Behavioral data | Rating sequences (e.g., 1–5 star ratings) |

### Results

| Method | MAE Reduction (avg over 4 rounds) |
|--------|-----------------------------------|
| Persona Regeneration (baseline) | ~0% sustained improvement |
| Persona Extension (best baseline) | moderate, plateaus |
| **DEEPER** | **32.2% avg reduction** |
| Improvement over best baseline | **+22.92%** |

---

## Limitations

1. **Domain tested:** Movie/product ratings — preference data, not professional behavior
2. **Behavioral space:** Rating sequences (discrete 1-5 scale) — simpler than developer activity signals
3. **LLM dependency:** Requires a capable LLM for persona generation and refinement; smaller models may struggle
4. **Cold start:** Requires sufficient historical data in `W0` to initialize a meaningful persona
5. **Evaluation proxy:** Persona quality is measured indirectly via prediction error — not via human judgment of persona accuracy

---

## Application to Our Developer Profiling System

### The core problem DEEPER solves for us

A developer profile built in January will become stale by June. New projects, new skills, changing communication patterns — the profile needs to update. DEEPER provides the methodology for doing this *correctly*:

> Don't just append new data. Don't regenerate from scratch. Instead, find the **specific update directions** that reduce the gap between what the profile predicts and what the developer actually does.

### Architectural adaptation

| DEEPER concept | Developer profiling equivalent |
|---------------|-------------------------------|
| User behaviors `Ot` | GitHub events: PRs merged, review comments, commit patterns, issue activity |
| Predicted behaviors `Ôt\|St-1` | What the current profile predicts (e.g., expected skill level, communication style) |
| Persona `St` | Developer profile (natural language + structured scores across 5 layers) |
| Update direction `Dt` | The specific aspect of the profile to revise: skill level? communication style? |
| Reward signal | How much the updated profile better predicts recent GitHub/Slack behavior |

### Practical implementation pattern

```
Every N days (e.g., monthly):
  1. Collect new GitHub/Slack activity data
  2. Run existing profile through "prediction" step:
     - What contribution rate, review quality, communication patterns does this profile predict?
  3. Compare predictions vs. actual observed behaviors
  4. Use DEEPER-inspired refinement:
     - Identify discrepancy dimensions (skill? personality? work style?)
     - Generate candidate profile updates
     - Score updates by reduction in prediction error
     - Select best update direction
  5. Update profile with selected direction
  6. Log update history for audit trail
```

### Integration with MLA-OCEAN

| Model | Role |
|-------|------|
| **MLA-OCEAN** | Initial personality inference from message corpus (one-time or periodic batch) |
| **DEEPER-style refinement** | Dynamic update of full developer profile as new behavioral data arrives |

MLA-OCEAN answers: "What are this person's OCEAN traits based on their message history?"
DEEPER-style refinement answers: "Given that the profile predicted X but the developer did Y, how should we update the profile?"

### Ethical and governance alignment

DEEPER's RL framework provides a key benefit for governance: **every profile update is traceable to specific behavioral discrepancies**. This means:
- Profile changes are explainable: "Profile updated because observed code review depth increased beyond prediction"
- BOD can audit update history
- No unexplained drift in scores

---

## Key Takeaway

> DEEPER provides the **update mechanism** for a developer profiling system. It solves the problem of keeping a profile current without catastrophically forgetting past knowledge. Its reward-based RL approach ensures each update is justified by measurable improvement in behavioral prediction — not just by recency of data.
