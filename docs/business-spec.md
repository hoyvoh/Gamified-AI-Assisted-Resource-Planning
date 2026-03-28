# Business Specification — Gamified Resource Planning

Ngôn ngữ làm việc: **VI · EN · JA** (giao diện và tài liệu hỗ trợ ba ngôn ngữ)

---

## 1. Vision

**Gamified Resource Planning (GAIARP)** là nền tảng AI-assisted resource planning chuyên nghiệp cho PM/TL — giao diện dạng **card game hiện đại**, thao tác bằng kéo thả, vận hành theo **4 pillars** chạy tuần tự và kết nối liên tục:

| Pillar | Tên | Mô tả |
|--------|-----|-------|
| **Pillar 1** | Project Analysis | LLM phân tích project brief theo 5 lớp framework (ToC, TELOS, ATAM, MCDA, TRL) → verdict + risk register + requirements vector |
| **Pillar 2** | Resource Analysis | Aggregate dữ liệu từ GitHub + Slack → LLM inference 5-layer developer profile (OCEAN, Behavioral, Technical, Soft Skills, Performance) → match score giữa developer và project requirements |
| **Pillar 3** | Planning Board | Output của Pillar 1+2 làm tiền đề → PM kéo thả developer card vào task card, WFU effective, warnings, Gantt, GA optimization, scenario management |
| **Pillar 4** | Execution Mode | Daily progress tracking, EV metrics, P(on_time), mid-execution scenario switching khi có thay đổi nhân sự/scope/deadline |

**Mục tiêu cốt lõi:** Khi cần quyết định ai làm gì trong dự án — hệ thống đã có sẵn dữ liệu thực tế (không phỏng đoán) và cho thấy ngay liệu plan đó có feasible hay không. Khi dự án đang chạy và điều kiện thay đổi, PM có thể switch plan và cân đối lại resource ngay lập tức mà không mất progress đã có.

---

## 2. Người Dùng & Vai Trò

| Role | Mô tả |
|------|--------|
| **Project Manager (PM)** | Tạo dự án, chạy Project Analysis, phê duyệt phân bổ, snapshot scenario, launch/switch plan |
| **Tech Lead (TL)** | Review task ước tính, điều chỉnh techstack, approve kỹ thuật, đóng góp điểm TELOS/ATAM |
| **Team Member** | Xem task được phân, cập nhật tiến độ hàng ngày, nhận XP |
| **Org Admin** | Quản lý tổ chức, nhân sự, dự án cấp org |
| **BOD** | _(reserved for future use — xem mục 4.0b về quyền truy cập profile)_ |

### 2a. Levels Nhân Sự

| Level | Ký hiệu | Mô tả |
|-------|---------|-------|
| Intern | `intern` | Thực tập sinh, chưa có kinh nghiệm thực tế |
| Fresher | `fresher` | Mới tốt nghiệp, < 6 tháng kinh nghiệm |
| Junior I | `junior_1` | 6 tháng – 1.5 năm kinh nghiệm |
| Junior II | `junior_2` | 1.5 – 3 năm kinh nghiệm |
| Senior I | `senior_1` | 3 – 6 năm kinh nghiệm, đã lead task độc lập |
| Senior II | `senior_2` | > 6 năm kinh nghiệm, có thể mentor và design architecture |

> **WFU rule:** Intern/Fresher/Junior I → base WFU × 0.8 (20% learning overhead). Junior II trở lên → base WFU × 1.0 trở lên tùy mode.

### 2b. Roles Chức Năng

Mỗi nhân sự có thể có một hoặc nhiều role chức năng — dùng để match với task category và warning engine:

`Developer` · `Communicator` · `PM` · `TL` · `Bridge SWE` · `Manager` · `DevOps` · `PQM` · `QA` · `Tester`

---

## 2a. Luồng Người Dùng Cấp Cao (High-Level User Flow)

```
PM tạo dự án (nhập proposal)
        ↓
[Mode 1] Project Analysis Screen     ← PM + Tech Lead chạy
   · 10-axis radar: ToC → TELOS → ATAM → MCDA → TRL
   · Verdict: Proceed / Conditional / Do Not Proceed
   · Risk register tự động từ điểm thấp
        ↓ (nếu verdict = Proceed hoặc Conditional)
[Mode 2] HR Analysis Screen          ← PM + Tech Lead chạy
   · Developer profiles (5 layers): OCEAN, Behavioral, Technical, Soft Skills, Performance
   · Project-developer match score
   · Team composition recommendation
        ↓
[Mode 3] Resource Allocation Board   ← PM + Tech Lead vận hành
   · Strategic Board (Three.js) — phân bổ nhân sự từ gợi ý Mode 2
   · Warnings engine, Gantt, Deps, Calendar
   · Optimization (GA), Risk Analysis (LLM)
        ↓
[Mode 4] Execution Mode              ← Team members + PM
   · Daily progress, EV metrics, P(on_time)
```

---

## 3. Khái Niệm Cốt Lõi

### 3.1 Workforce Unit (WFU)
- Đơn vị đo lường khả năng xử lý công việc: **1 WFU = 7 giờ làm việc/ngày**
- **Junior (<1 năm KN):** WFU × 0.8 — 20% thời gian dành cho học hỏi
- **Standard:** WFU × 1.0 (người không quen techstack của task)
- **Senior/Expert có matching techstack:** Người dùng **chủ động chọn** một trong hai chế độ:
  - `fast` → WFU × 1.2 (hoàn thành nhanh hơn)
  - `quality` → WFU × 1.5 (hoàn thành nhanh hơn, ít lỗi hơn)
  - Multiplier chỉ được kích hoạt khi techstack của task khớp với skill matrix của người đó

**WFU Multi-Factor Calibration (dùng khi có developer profile từ HR Analysis):**

```
WFU_effective = base_wfu
              × project_familiarity_factor    # 0.7 (mới) → 1.2 (quen thuộc)
              × technology_match_factor        # 0.8 (tech mới) → 1.5 (expert match)
              × quality_history_factor         # 0.9 (có history lỗi) → 1.1 (high quality)
              × delivery_reliability_factor    # 0.8 (hay miss deadline) → 1.1 (reliable)
```

Khi chưa có HR profile, hệ thống dùng WFU đơn giản (base × mode multiplier). Khi có profile từ Mode 2, hệ thống tự động tính `WFU_effective` và hiển thị delta so với estimate thô.

### 3.2 Skill Matrix
```json
{ "Backend Java": "expert", "React": "intermediate", "DevOps": "beginner" }
```
- Mỗi skill có `wfu_multiplier_fast` (1.2) và `wfu_multiplier_quality` (1.5)
- Khi không có matching → dùng WFU × 1.0

### 3.3 Language Profile
Mỗi nhân sự có danh sách ngôn ngữ làm việc (`languages: ["vi", "en"]`). Task có thể require ngôn ngữ cụ thể. Khi mismatch → trigger **LANGUAGE_BARRIER** warning.

### 3.4 Task Estimation (COCOMO II)
Mỗi task được ước tính theo breakdown effort:
| Phase | Ví dụ |
|-------|-------|
| Investigate | 0.5 ngày |
| Design | 0.5 ngày |
| Implement | 2.0 ngày |
| Testing | 1.0 ngày |
| Review & Feedback | 1.0 ngày |
| Support Release | 0.5 ngày |
| **Total** | **5.5 man-days** |

Effort breakdown được **chỉnh sửa trong meeting** — PM/Tech Lead có thể điều chỉnh từng phần.

### 3.5 Tiến Độ Không Tuyến Tính (Brooks' Law)

Thêm người không tự động giảm thời gian. Communication overhead tăng theo `n(n-1)/2` pairs.

**Rules theo số người trên 1 task:**

| Số assignees | Rule | Action |
|-------------|------|--------|
| 1 người | Optimal cho task nhỏ (<2 ngày) | — |
| 2 người | Có thể tăng tốc nếu task đủ lớn và scope rõ | — |
| 3+ người | Conflict resolution overhead tăng mạnh — task thường chậm hơn | ⚠️ Warning: "3 người trên task này sẽ tạo overhead — xem xét split thành subtasks" |
| > scope phù hợp | Nếu task quá nhỏ (< 1 ngày) mà có 2+ người | ⚠️ Warning: "Scope quá nhỏ — 1 người làm là tối ưu" |

**Cảnh báo muộn (late addition):** Nếu task đã > 50% hoàn thành → thêm người lúc này làm chậm hơn → trigger "LATE_ADDITION" warning khi PM assign thêm người.

### 3.6 Xác Suất Hoàn Thành (Completion Probability)
Hệ thống tính **P(on_time)** — xác suất hoàn thành đúng hạn — từ:
- SPI (Schedule Performance Index) hiện tại
- Variance của velocity qua các ngày
- Risk factors đang active (skill mismatch, language barrier, capacity)
- Critical path slack

Nếu P(on_time) > 80% → 🟢 On track
Nếu P(on_time) 50-80% → 🟡 At risk
Nếu P(on_time) < 50% → 🔴 Critical

**Hiển thị sớm:** Nếu EAC < deadline → hiển thị "N ngày trước hạn" (màu xanh) trên Gantt và board.

---

## 4. Tính Năng Chính

### 4.0 Project Analysis Mode (Pillar 1)

**Trigger:** PM nhập project proposal → trước khi tạo scenario, hệ thống yêu cầu chạy Project Analysis.

**10-axis radar** — PM + Tech Lead chấm điểm 1–5 có AI hỗ trợ.

> **Scoring rubrics chi tiết:** Xem [`docs/design/knowledge-base/project-analysis/02_project_radar_scoring_matrix.md`](design/knowledge-base/project-analysis/02_project_radar_scoring_matrix.md) — đây là **nguồn sự thật duy nhất** cho rubrics, weights, và logic tính composite. Business spec không duplicate nội dung đó.

| # | Axis | Layer |
|---|------|-------|
| 1 | Problem-Solution Fit | Theory of Change |
| 2 | Success Criterion Clarity | Logic Model |
| 3 | TELOS Feasibility Composite | Feasibility Gate |
| 4 | Quality Attribute Coverage | Architecture (ATAM) |
| 5 | Architecture Risk & Tradeoff | Architecture (CBAM) |
| 6 | Strategic Value | MCDA/AHP |
| 7 | Financial Return (ROI) | MCDA |
| 8 | Technology Maturity (TRL) | Readiness |
| 9 | Organizational Readiness | Readiness |
| 10 | Legal/Regulatory Readiness | Readiness |

**Axis 3 — TELOS input:** PM nhập riêng 5 sub-dimension scores (T, E, L, O, S), mỗi dimension 1–5. Composite TELOS = trung bình có trọng số. Xem scoring matrix doc để biết weights.

**Verdict tự động:**
- Composite ≥ 4.0 → ✅ Proceed
- Composite 3.0–3.9 → ⚠️ Proceed with Conditions
- Composite < 3.0 hoặc bất kỳ axis = 1 → ❌ Do Not Proceed

**Risk register** tự động tạo từ axis có điểm ≤ 2 — PM cần điền action plan trước khi proceed.

**AI assist:** Với mỗi axis, PM có thể prompt AI để nhận gợi ý dựa trên project proposal đã nhập.

---

### 4.0b HR Analysis Mode (Pillar 2)

**Trigger:** Chạy song song với Pillar 1 (không cần chờ verdict). Output được dùng khi Mode 3 mở.

**Data sources (aggregate per developer by username):**
- **GitHub:** commit history, PR code/comments, repository contributions, code review patterns, issue activity
- **Slack:** message patterns, thread responses, collaboration frequency, cross-team mentions
- **Confluence (future):** document authorship, knowledge sharing activity

**Developer profiles** (5 layers, inferred từ aggregated data via LLM):
- Layer 1: OCEAN personality (Openness, Conscientiousness, Extraversion, Agreeableness, Emotional Stability)
- Layer 2: Behavioral preferences (work rhythm, collaboration intensity, domain preference)
- Layer 3: Technical capability (8 axes — Dreyfus 1–5)
- Layer 4: Soft skills (8 axes — Communication, Collaboration, Initiative, Mentorship, etc.)
- Layer 5: Performance & Growth (Delivery Reliability, Code Quality, Team Impact, Growth Trajectory)

**Project-Developer matching:** Hệ thống tính match score giữa project requirements và từng developer profile.

**Team composition recommendations:** Top 3 team configurations tối ưu:
- Skill coverage đủ cho project requirements
- OCEAN compatibility (team dynamics)
- WFU effective budget estimate
- Growth opportunity alignment (ai được học gì từ dự án này)

**WFU enhancement:** Profiles từ Pillar 2 → tự động populate `WFU_effective` factors cho Mode 3.

**Access:** PM và Tech Lead có thể xem HR Analysis sau khi verdict từ Mode 1 là Proceed/Conditional. PM đưa gợi ý team → làm allocation trên board.

> ⚠️ **Lưu ý về visibility:** Theo thiết kế nghiên cứu ([`01_resource_profile_methodology.md`](design/knowledge-base/resource-analysis/01_resource_profile_methodology.md)), raw 5-layer profiles về mặt lý tưởng chỉ dành cho BOD-level để tránh bias và privacy risk. **Hiện tại (MVP): PM + TL được xem full profile** để hệ thống hoạt động được. Giới hạn visibility xuống BOD-only là **tính năng tương lai/promised** — cần review về permission model trước khi implement.

---

### 4.1 Input & Phân Tích Dự Án (LLM)
- PM nhập **Project Proposal** (text)
- LLM phân tích → generate danh sách **draft tasks** với:
  - Category, techstack, effort breakdown (editable)
  - Dependencies, priority
  - Ước tính COCOMO II
- PM/Tech Lead review, chỉnh sửa, confirm trước khi planning

### 4.2 Planning Board (Card Game UI)
Giao diện kanban dạng thẻ bài hiện đại — inspired by cline/kanban research preview:
- **Task cards:** mỗi task = 1 card có effort badge, techstack tags, status, WFU estimate
- **Developer cards:** mỗi nhân sự = 1 card kéo thả được, hiển thị availability, skill match %, WFU effective
- **Lanes:** Unassigned → In Progress → Done (hoặc group by milestone)
- Left panel: danh sách developer cards (từ Pillar 2 recommendation ra trước)
- Right/Center: task lane board — kéo developer card vào task card để assign
- Click task card: expand → effort breakdown, deps, warnings, LLM task split prompt
- Click developer card: popup → tổng allocation qua tất cả projects, WFU effective breakdown

### 4.3 Phân Bổ Nhân Sự (In-Meeting)

**Kéo thả:** Kéo PersonnelCard từ sidebar vào camp → chọn allocation % + **chọn WFU mode** (standard / fast / quality). Mode chỉ hiển thị fast/quality khi nhân sự có matching skill.

**Click nhân sự:** Popup điều chỉnh tỷ lệ phân bổ giữa tất cả dự án đang tham gia.

**Chỉnh deadline:** Có thể kéo task deadline trực tiếp trên Gantt hoặc chỉnh trong TaskDetail → schedule tự tính lại realtime cho tất cả người tham gia session.

**Chỉnh effort breakdown:** Chỉnh từng phần (investigate/design/...) trong meeting → total effort tự cập nhật → Gantt tự tính lại.

**Task operations:**
- Merge 2+ tasks
- Split 1 task thành N subtasks (parallel work)
- Prompt AI: "Tách task này thành 3 phần cho 3 người làm song song"

**Một người, nhiều task:** 1 nhân sự có thể nhận nhiều task với tỷ lệ allocation nhất định. Tổng daily hours qua tất cả dự án ≤ 7h.

### 4.4 Hệ Thống Cảnh Báo

| Loại | Điều kiện | Mức | Weight trong P(on_time) |
|------|-----------|-----|------------------------|
| **CAPACITY** | Tổng daily hours > 7 (qua tất cả projects) | 🔴 Critical | −0.15 |
| **JUNIOR_ALONE** | `[intern, fresher, junior_1]` không có senior kèm trên critical/high task | 🔴 Critical | −0.12 |
| **LANGUAGE_BARRIER** | Task requires language mà assignee không có | 🟠 Warning | −0.10 |
| **SKILL_MISMATCH** | >50% assignees không match techstack của task | 🟡 Info | −0.08 |
| **DEPENDENCY_RISK** | Task B sắp start nhưng Task A (dependency) chưa xong | 🟠 Warning | −0.07 |
| **TIME_RISK** | P(on_time) < 50% hoặc EAC > deadline | 🟠 Warning | −0.05 |
| **BUDGET** | Chi phí nhân sự > project.budget_total | 🟠 Warning | −0.03 |
| **LICENSE** | Tool seats (e.g., Claude Code) được phân bổ > project license budget | 🟠 Warning | −0.02 |

> Weights dùng trong `CompletionProbabilityService` — xem [`design/backend-spec.md`](design/backend-spec.md#completionprobabilityservice) để biết công thức đầy đủ.

### 4.5 Tool & License Management
Mỗi dự án có **tool budget** (số ghế công cụ được phân bổ, e.g., 3 Claude Code licenses, 2 GitHub Copilot seats). Khi phân bổ nhiều người hơn số ghế → **LICENSE** warning.

### 4.6 AI Optimization (Genetic Algorithm)
- Nút **"Optimize"** → chọn mode: **Makespan** (xong sớm nhất) hoặc **Budget** (chi phí tối thiểu)
- GA chạy background → trả top 3 solutions để so sánh
- Mỗi solution: cải thiện % so với hiện tại, makespan, cost, warnings còn lại
- Accept toàn bộ hoặc chọn lọc

### 4.7 Scenario Planning

#### Scenario States
Mỗi scenario tồn tại ở một trong 3 trạng thái:

| State | Ý nghĩa |
|-------|---------|
| `draft` | Đang được build trong Mode 3, có thể edit tự do |
| `active` | Plan đang được execution track — **chỉ 1 scenario active tại 1 thời điểm** |
| `archived` | Read-only — đã bị supersede hoặc PM archive thủ công |

#### Scenario Types
PM đặt tên và type khi tạo — type là label giúp phân biệt intent:

| Type | Ví dụ tên | Dùng khi |
|------|-----------|---------|
| `planning` | "Plan Normal", "Plan A", "Plan B" | Phương án planning cơ bản |
| `contingency` | "Plan Full Resource", "Plan OT", "Plan Reduced Scope" | Pre-prepared response cho known risks |
| `what_if` | "If Alice leaves", "If deadline -2w" | Khám phá kịch bản giả định, không bao giờ activate |

#### Scenario Actions

**Snapshot (Save current state):**
- Freeze toàn bộ assignments, task dates, effort vào 1 named plan bất biến
- Dùng để lưu "Plan A" trước khi tiếp tục thử "Plan B"
- Snapshot là `draft` — vẫn có thể activate sau

**Fork:**
- Tạo bản copy editable từ bất kỳ scenario nào (draft hoặc archived)
- Carry theo: tasks, assignments, WFU modes — nhưng không carry actual progress (dùng cho pure planning)
- Tên mặc định: "[Source] — Fork [timestamp]", PM đổi ngay

**Compare (side-by-side):**
- Chọn 2 scenarios → so sánh: makespan, cost, warnings count, P(on_time), team composition
- Không edit được trong compare view

**Activate → Launch:**
- PM review tất cả draft scenarios → chọn 1 → "Launch Project"
- Xem phần 4.10 về launch mechanism

---

#### 4.7b Mid-Execution Scenario Switching

Khi dự án đang chạy và điều kiện thay đổi, PM có thể **switch sang plan mới** mà không mất progress đã có.

**Triggers (PM record thủ công hoặc system auto-suggest):**

| Trigger | Điều kiện | Auto-detect? |
|---------|-----------|-------------|
| `MEMBER_DEPARTURE` | Team member nghỉ việc/rời dự án | ❌ PM record |
| `SCOPE_CHANGE` | Yêu cầu mở rộng, task mới được thêm | ❌ PM record |
| `DEADLINE_CHANGE` | Deadline bị kéo gần lại | ✅ Khi PM đổi project deadline |
| `BUDGET_CUT` | Budget bị cắt giảm | ✅ Khi PM đổi budget_total |
| `RISK_ESCALATION` | P(on_time) < 40% trong 3 ngày liên tiếp | ✅ Auto-suggest |

**Flow khi switch:**

```
Condition occurs
  ↓
System hiển thị banner: "⚠️ P(on_time) critical — Consider switching plan"
  (hoặc PM chủ động click "Switch Plan")
  ↓
PM chọn: Fork from current state | Activate existing contingency plan
  ↓
[Fork from current state]:
  → System tạo scenario mới clone từ current active scenario
  → Tasks carry: actual_progress, ProgressLogs
  → Tasks re-baseline: planned_start/end được reset từ "hôm nay"
  → PM edit trong Mode 3: thêm người, điều chỉnh tasks, đổi deadline
  ↓
PM review P(on_time) của scenario mới → "Activate this plan"
  ↓
Old active scenario → archived với:
  archived_at, archive_reason (trigger), snapshot của progress tại thời điểm switch
  ↓
New scenario becomes ACTIVE — Execution Mode tiếp tục track trên plan mới
```

**Continuity:**
- `ProgressLogs` gắn với Tasks, không phải Scenarios → không bị mất khi switch
- Gantt tiếp tục hiện actual bars (từ ProgressLogs) chồng lên planned bars mới
- Scenario switch history hiển thị trên Gantt như markers ("Switched to Plan OT — member departure")

### 4.8 Risk Analysis (LLM)
Sau khi phân bổ xong → prompt: **"Analyze risks"**
LLM trả danh sách risks với probability, impact, mitigation. Context bao gồm: tasks, assignments, warnings, critical path, team skill/language profile.

### 4.9 Views Per Scenario

**3 views chính** (primary — mỗi scenario phải có đủ 3):

| View | Mô tả |
|------|--------|
| **1. Planning Board** | Kanban card-game UI — giao diện planning chính. Developer cards kéo thả vào task cards. P(on_time) badge trên mỗi task card. |
| **2. Gantt Chart** | Timeline với 3 lớp bar: Baseline (original launch plan), Planned (active scenario), Actual (từ ProgressLogs). Scenario switch markers. Critical path highlight. Filters: by person, by milestone. |
| **3. Dependency Graph** | DAG dependencies với critical path. |

**View bổ sung:**
| View | Mô tả |
|------|--------|
| **4. Calendar** | Lịch theo ngày — ai làm gì, milestone markers. |

### 4.10 Execution Mode

#### Launch — Bắt Đầu Dự Án

PM review các draft scenarios trong Mode 3 → chọn 1 plan → "Launch Project":

```
PM clicks "Launch Project" on a draft scenario
  ↓
Confirmation: "Starting execution with [Scenario Name].
               All task assignees will be notified."
  ↓
System:
  1. scenario.status → active
  2. Creates execution_baseline snapshot (task dates + assignments, frozen)
  3. Sets project.started_at = today
  4. Mode 4 (Execution) becomes available to all project members
  5. Sends notifications to assigned team members
```

Chỉ PM mới có thể launch. Phải có ít nhất 1 task với assignment trước khi launch.

---

#### Daily Progress Tracking

Sau khi launch, **Mode 4** là chế độ daily operation:

- **Team members** cập nhật % hoàn thành cho task của họ mỗi ngày (hoặc mỗi khi có update)
- **System tính toán** sau mỗi update:
  - EV metrics: SPI (Schedule Performance Index), CPI (Cost Performance Index), EAC (Estimate at Completion)
  - **P(on_time)** cập nhật dựa trên velocity thực tế + variance + risk factors
  - Gantt re-renders actual bars

**P(on_time) thresholds:**
- > 80% → 🟢 On track
- 50–80% → 🟡 At risk → warning + gợi ý hành động
- < 50% → 🔴 Critical → system gợi ý "Consider switching plan" banner

**Thêm WFU mid-execution:**
PM có thể assign thêm người/tăng allocation bất kỳ lúc nào. Hệ thống tính lại P(on_time) ngay lập tức và cảnh báo nếu thêm người lúc này không giúp ích (Brooks' Law — task > 50% done).

---

#### Gantt Chart — Execution View

Gantt có **3 lớp bar** hiển thị chồng lên nhau:

| Bar | Màu | Nguồn dữ liệu | Ý nghĩa |
|-----|-----|---------------|---------|
| **Baseline** | Xám nhạt | `execution_baseline` (frozen khi launch) | Plan gốc — dùng để so sánh drift |
| **Planned** | Xanh dương | Active scenario task dates | Plan hiện tại đang theo |
| **Actual** | Xanh lá / Đỏ | ProgressLogs | Tiến độ thực tế |

**Markers trên Gantt:**
- 📍 `Today` line — đường thẳng đứng đánh dấu hôm nay
- ◆ Milestone diamonds — deadline của từng milestone
- 🔀 Scenario switch markers — "Switched to Plan OT (member departure)"
- ⚠️ Delay indicators — task đang trễ so với planned

**Filters:**
- By person: chỉ hiển thị tasks của 1 người
- By milestone: group tasks theo milestone
- By status: in_progress / at_risk / done / blocked

**Interaction:**
- Drag task bar right/left → đổi deadline trực tiếp trên Gantt (tạo DEADLINE_CHANGE warning)
- Click task bar → expand task detail
- Hover bar → tooltip: planned vs actual %, EAC, người phụ trách

### 4.11 XP & Leveling
Khi kết thúc dự án:
- XP dựa trên: hoàn thành đúng/sớm/trễ, techstack mới, quality, mentoring
- Skill level up → `wfu_multiplier` tăng cho dự án tiếp theo
- **Participation history → WFU calibration:** Velocity lịch sử được dùng để hiệu chỉnh `base_wfu` cho dự án tương lai (learning from past performance)

---

## 5. Constraints Hệ Thống

| Constraint | Rule |
|-----------|------|
| **Daily capacity** | ≤ 7h/ngày tổng tất cả dự án |
| **Junior rule** | Junior <1yr không được lead critical task một mình |
| **Non-linear scaling** | Brooks' Law: thêm người late trong task làm chậm hơn |
| **Dependency order** | Tasks phải theo đúng topological order |
| **Skill multiplier** | Fast/quality chỉ khi matching techstack, user phải chủ động chọn |
| **Language match** | Tasks có required_language cần assignee phù hợp |

---

## 6. Data Hierarchy

```
Organization
  └── Projects (nhiều dự án cùng lúc)
        ├── project.status: planning | active | completed | on_hold
        ├── project.started_at (set khi Launch)
        ├── Project Members (personnel tham gia, allocation %)
        ├── ExecutionBaseline (frozen snapshot khi Launch — read-only)
        └── Scenarios (các phương án planning)
              ├── scenario.status: draft | active | archived
              ├── scenario.type: planning | contingency | what_if
              ├── scenario.archive_reason (trigger nếu bị supersede)
              └── Tasks (task cards trên board)
                    ├── ResourceAssignments → Personnel (wfu_mode user-selected)
                    ├── TaskDependencies
                    └── ProgressLogs (daily updates — persist across scenario switches)

Organization
  └── Personnel
        ├── SkillMatrix (skill → level → wfu_multipliers)
        ├── Languages (["vi", "en"])
        └── XPHistory → future WFU calibration
```

---

## 7. Integrations & Data Sources

| Integration | Mục đích | Mode |
|-------------|---------|------|
| **Claude API (Anthropic)** | Pillar 1: project scoring + risk register. Pillar 2: developer profile inference. Pillar 3: task gen, task split/merge, risk analysis | Required |
| **GitHub CLI (`gh`)** | Pillar 2 data source: fetch commits, PRs, code reviews, issues — **ưu tiên dùng `gh` CLI** thay vì GitHub REST API trực tiếp | Optional (graceful skip nếu không có) |
| **GitHub API** | Fallback khi `gh` CLI không available. Open mode: public repos. Strict mode (config): chỉ fetch từ host cụ thể để tránh data leak | Optional |
| **Slack via MCP** | Pillar 2: communication patterns, collaboration signals — fetch qua **MCP Slack** (giả định đã có MCP server configured) | Optional (graceful skip) |
| **Confluence via MCP** | Pillar 2: document authorship, knowledge sharing — fetch qua **MCP Confluence** (optional) | Optional (graceful skip) |
| **COCOMO II** | Effort estimation từ function points | Required |
| **Genetic Algorithm** | Multi-constraint schedule optimization | Required |
| **CPM** | Critical path, float calculation | Required |
| **Earned Value + P(on_time)** | Schedule health, completion probability | Required |

### 7a. Data Collection Design Principles

**Graceful degradation:** Nếu GitHub CLI, Slack MCP, hoặc Confluence MCP không available → hệ thống báo lỗi rõ ràng và bỏ qua các tính năng đó. App không fail.

**Strict mode vs Open mode (GitHub):**
- `open` (default): fetch từ bất kỳ public GitHub repo nào
- `strict` (config): chỉ fetch từ host cụ thể (e.g., `github.company.com`) để tránh gửi request ra ngoài với code nhạy cảm
- Config được đặt trong `backend/config.py` — không hardcode

**Prompt organization:**
- Tất cả LLM prompts được tổ chức tập trung trong `be/app/llm/prompts/` — tách biệt khỏi code
- Mỗi prompt là file `.txt` hoặc `.jinja2` với placeholders rõ ràng cho input params
- Không scatter prompts ở nhiều service files khác nhau

---

## 8. Non-Functional Requirements

- Board render <2s với 50 tasks, 20 nhân sự
- Warning recompute <500ms sau mỗi assignment change
- P(on_time) compute <1s (sau EV update)
- Multi-tenant isolation giữa orgs
- Concurrent planning session (WebSocket cho realtime deadline/effort changes)
