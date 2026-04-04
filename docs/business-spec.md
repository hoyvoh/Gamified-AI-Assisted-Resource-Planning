# Business Specification — Gamified Resource Planning

Ngôn ngữ: EN-VN (bilingual)

---

## 1. Vision

**Gamified Resource Planning** biến quá trình họp phân bổ nhân sự dự án thành một **phòng tác chiến holographic** — tướng lĩnh đứng trước bàn chiến thuật phát sáng, điều phối quân cờ nhân sự trên sa bàn 3D trực quan. Background: một thành trì sừng sững ở chân trời — đó là deadline/mục tiêu dự án. Các task là doanh trại chiến thuật. Các số liệu dự án hiển thị dạng màn hình holographic nổi xung quanh.

Hệ thống kết hợp COCOMO II, Genetic Algorithm, và LLM để hỗ trợ ra quyết định real-time trong phòng họp.

**Mục tiêu cốt lõi:** Khi dự án có nguy cơ trễ và bạn cần tìm cách cứu dự án — bạn sẽ nhìn thấy ngay liệu có thể cứu được hay không mà không cần take risk để thử.

---

## 2. Người Dùng & Vai Trò

| Role | Mô tả |
|------|--------|
| **Project Manager** | Tạo dự án, chạy Project Analysis, phê duyệt phân bổ, snapshot scenario |
| **Tech Lead** | Review task ước tính, điều chỉnh techstack, approve kỹ thuật, đóng góp điểm TELOS/ATAM |
| **Team Member** | Xem task được phân, cập nhật tiến độ hàng ngày, nhận XP |
| **Org Admin** | Quản lý tổ chức, nhân sự, dự án cấp org |
| **BOD** | _(reserved for future use)_ |

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
Thêm người không tự động giảm thời gian. Communication overhead tăng theo `n(n-1)/2` pairs. Áp dụng khi task đã >50% hoàn thành: thêm người lúc này làm chậm hơn.

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

**10-axis radar** — PM + Tech Lead chấm điểm 1–5 có AI hỗ trợ:

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

**Verdict tự động:**
- Composite ≥ 4.0 → ✅ Proceed
- Composite 3.0–3.9 → ⚠️ Proceed with Conditions
- Composite < 3.0 hoặc bất kỳ axis = 1 → ❌ Do Not Proceed

**Risk register** tự động tạo từ axis có điểm ≤ 2 — PM cần điền action plan trước khi proceed.

**AI assist:** Với mỗi axis, PM có thể prompt AI để nhận gợi ý dựa trên project proposal đã nhập.

---

### 4.0b HR Analysis Mode (Pillar 2)

**Trigger:** Sau khi Project Analysis trả verdict Proceed/Conditional.

**Developer profiles** (5 layers, inferred từ GitHub data):
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

---

### 4.1 Input & Phân Tích Dự Án (LLM)
- PM nhập **Project Proposal** (text)
- LLM phân tích → generate danh sách **draft tasks** với:
  - Category, techstack, effort breakdown (editable)
  - Dependencies, priority
  - Ước tính COCOMO II
- PM/Tech Lead review, chỉnh sửa, confirm trước khi planning

### 4.2 Bàn Cờ Chiến Lược (Three.js)
- Desert empire 3D scene: thành trì ở chân trời = deadline
- **Doanh trại (camps):** mỗi task = 1 camp, kích thước tỷ lệ với effort
- **Quân cờ:** mỗi nhân sự = 1 unit kéo thả được
- Thanh trái: danh sách nhân sự · Thanh phải: danh sách tasks
- Camera orbit, zoom, click để inspect

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

| Loại | Điều kiện | Mức |
|------|-----------|-----|
| **CAPACITY** | Tổng daily hours > 7 (qua tất cả projects) | 🔴 Critical |
| **JUNIOR_ALONE** | Junior <1yr không có senior kèm trên critical task | 🔴 Critical |
| **TIME_RISK** | P(on_time) < 50% hoặc EAC > deadline | 🟠 Warning |
| **LANGUAGE_BARRIER** | Task requires language mà assignee không có | 🟠 Warning |
| **BUDGET** | Chi phí nhân sự > project.budget_total | 🟠 Warning |
| **LICENSE** | Tool seats (e.g., Claude Code) được phân bổ > project license budget | 🟠 Warning |
| **SKILL_MISMATCH** | >50% assignees không match techstack của task | 🟡 Info |
| **DEPENDENCY_RISK** | Task B sắp start nhưng Task A (dependency) chưa xong | 🟠 Warning |

### 4.5 Tool & License Management
Mỗi dự án có **tool budget** (số ghế công cụ được phân bổ, e.g., 3 Claude Code licenses, 2 GitHub Copilot seats). Khi phân bổ nhiều người hơn số ghế → **LICENSE** warning.

### 4.6 AI Optimization (Genetic Algorithm)
- Nút **"Optimize"** → chọn mode: **Makespan** (xong sớm nhất) hoặc **Budget** (chi phí tối thiểu)
- GA chạy background → trả top 3 solutions để so sánh
- Mỗi solution: cải thiện % so với hiện tại, makespan, cost, warnings còn lại
- Accept toàn bộ hoặc chọn lọc

### 4.7 Scenario Planning
- **Snapshot** → lưu phương án hiện tại thành plan bất biến (có tên)
- Fork scenario mới để deal phương án thay thế ("Nếu nhân sự A nghỉ việc thì sao?")
- So sánh 2 scenarios side-by-side

### 4.8 Risk Analysis (LLM)
Sau khi phân bổ xong → prompt: **"Analyze risks"**
LLM trả danh sách risks với probability, impact, mitigation. Context bao gồm: tasks, assignments, warnings, critical path, team skill/language profile.

### 4.9 Views Per Scenario

**3 views chính** (primary — mỗi scenario phải có đủ 3):

| View | Mô tả |
|------|--------|
| **1. Strategic Board** | Bàn cờ 3D — giao diện planning chính. Hiển thị P(on_time) badge. |
| **2. Gantt Chart** | Timeline auto-generated từ board state. Planned (solid) vs actual (striped). Early completion highlighted in green. Filters: by person, by milestone. |
| **3. Dependency Graph** | DAG dependencies với critical path. |

**View bổ sung:**
| View | Mô tả |
|------|--------|
| **4. Calendar** | Lịch theo ngày — ai làm gì, milestone markers. |

### 4.10 Progress Tracking Mode (Execution)
Sau khi chốt phương án → chuyển sang **Execution Mode**:
- Mỗi ngày, member cập nhật % hoàn thành
- Hệ thống tính EV metrics (SPI, CPI, EAC)
- **P(on_time) cập nhật hàng ngày** dựa trên velocity thực tế
- Nếu P(on_time) giảm → warning + gợi ý cụ thể
- **Thêm WFU mid-execution:** Khi dự án có nguy cơ trễ, PM có thể assign thêm người/tăng allocation. Hệ thống tính lại P(on_time) ngay lập tức và cảnh báo nếu thêm người lúc này không giúp ích (Brooks' Law).

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
        ├── Project Members (personnel tham gia, allocation %)
        └── Scenarios (các phương án planning)
              └── Tasks (doanh trại)
                    ├── ResourceAssignments → Personnel (wfu_mode user-selected)
                    ├── TaskDependencies
                    └── ProgressLogs (daily updates)

Organization
  └── Personnel
        ├── SkillMatrix (skill → level → wfu_multipliers)
        ├── Languages (["vi", "en"])
        └── XPHistory → future WFU calibration
```

---

## 7. Integrations

| Integration | Mục đích |
|-------------|---------|
| **Claude (Anthropic)** | Task generation, risk analysis, task split/merge suggestions |
| **COCOMO II** | Effort estimation từ function points |
| **Genetic Algorithm** | Multi-constraint schedule optimization |
| **CPM** | Critical path, float calculation |
| **Earned Value + P(on_time)** | Schedule health, completion probability |

---

## 8. Non-Functional Requirements

- Board render <2s với 50 tasks, 20 nhân sự
- Warning recompute <500ms sau mỗi assignment change
- P(on_time) compute <1s (sau EV update)
- Multi-tenant isolation giữa orgs
- Concurrent planning session (WebSocket cho realtime deadline/effort changes)
- Database: SQLite (local dev, zero server dependency); upgrade to PostgreSQL by changing `DATABASE_URL`

---

## 9. UI Concept — Holographic War Room

Toàn bộ UI được thiết kế theo concept **holographic war room**:

- **Bàn chiến thuật trung tâm (Three.js):** Sa bàn 3D phát sáng — nhân sự là các holograms, task là các điểm chiến lược trên bàn cờ. Các đường kết nối phát sáng hiển thị dependency.
- **Màn hình holographic nổi (xung quanh):** Các panel số liệu hiển thị dạng hình chiếu 3D — Skill Trees, Timeline, Project Status, P(on_time), Risk Register.
- **Tone màu:** Deep amber + electric blue + stone grey — cảm giác thần bí nhưng công nghệ cao.
- **Không gian:** Kiến trúc cổ đại (vòm đá, ánh nến) kết hợp với overlay công nghệ holographic.

**Tham chiếu:** `wallpaper.png` trong thư mục gốc là concept art chủ đạo.
