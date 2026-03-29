# Business Specification - Gamified Resource Planning

Ngôn ngữ: EN-VN (bilingual)

---

## 1. Vision

**Gamified Resource Planning** biến quá trình lập kế hoạch nhân sự dự án thành một hệ thống **AI-assisted decision support** gồm 4 mode:

`Analyze -> HR Match -> Plan -> Execute`

Hệ thống không chỉ hỗ trợ phân bổ người vào task, mà hỗ trợ cả chuỗi quyết định:

1. Có nên làm dự án này không?
2. Nên ghép ai vào dự án này?
3. Nên phân bổ nguồn lực theo phương án nào?
4. Khi đã chạy dự án, liệu còn đang đúng tiến độ không?

Strategic Board vẫn là giao diện planning trung tâm của sản phẩm, nhưng không còn là điểm bắt đầu duy nhất. Trước khi commit nguồn lực, dự án cần đi qua bước phân tích và đánh giá.

**Mục tiêu cốt lõi:** giúp PM, Tech Lead và các bên ra quyết định có cơ sở hơn về feasibility, staffing fit, risk và tiến độ thay vì dựa chủ yếu vào cảm tính trong cuộc họp planning.

---

## 2. Người Dùng & Vai Trò

| Role                         | Mô tả                                                                                                                                |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Project Manager (PM)**     | Tạo dự án, nhập proposal / project brief, thực hiện Project Analysis cùng Tech Lead, phê duyệt planning scenario, theo dõi execution |
| **Tech Lead (TL)**           | Đánh giá technical feasibility, architecture risk, readiness, review task estimates, đóng góp quyết định kỹ thuật                    |
| **BOD / Executive Reviewer** | Thực hiện HR Analysis, xem developer profiles, chạy team match và xem team composition recommendations                               |
| **Org Admin**                | Quản lý tổ chức, users, personnel và access control                                                                                  |
| **Team Member**              | Xem task được giao, cập nhật tiến độ hằng ngày, nhận XP, theo dõi execution liên quan đến phần việc được giao                        |

### 2.1 Quyền Truy Cập

| Capability                  | PM                                      | TL                                                 | BOD                                    | Team Member                         | Admin           |
| --------------------------- | --------------------------------------- | -------------------------------------------------- | -------------------------------------- | ----------------------------------- | --------------- |
| Mode 1 - Project Analysis   | Full                                    | Full                                               | Read if needed                         | No                                  | Governance only |
| Mode 2 - HR Analysis screen | Theo frontend-spec hiện tại             | Theo frontend-spec hiện tại                        | Full theo planning/knowledge-base docs | No                                  | Governance only |
| Full developer profile      | Không theo knowledge-base access matrix | Own profile only theo knowledge-base access matrix | Full                                   | No                                  | Governance only |
| Mode 3 - Strategic Board    | Full                                    | Full                                               | Optional reviewer                      | No                                  | No              |
| Mode 4 - Execution          | Full                                    | Read / support                                     | Read summary                           | Xem và cập nhật phần việc được giao | No              |

**Ghi chú đồng bộ hiện trạng docs:**  
Hiện có mâu thuẫn giữa tài liệu:

- `frontend-spec` đang mô tả Mode 2 cho `PM, TL`
- `planning docs` và `knowledge-base` đang mô tả Mode 2 là `BOD-only`

Business spec này phản ánh đúng trạng thái hiện có của design docs bằng cách:

- ghi nhận `BOD` là owner nghiệp vụ của Mode 2
- giữ lưu ý rằng frontend hiện vẫn đang mô tả route/access khác

---

## 3. Luồng Người Dùng Cấp Cao

```
PM tạo dự án, nhập proposal
        ↓
[Mode 1] Project Analysis
   · PM + Tech Lead chấm 10-axis radar
   · Tạo verdict + risk register
        ↓
Nếu verdict = Proceed hoặc Conditional
        ↓
[Mode 2] HR Analysis
   · Tạo / xem developer profiles
   · Tính project-developer match
   · Đề xuất team composition
        ↓
[Mode 3] Strategic Board
   · Lập scenario
   · Phân bổ nhân sự
   · Xem warnings, Gantt, dependencies, calendar
   · Chạy optimization / risk analysis
        ↓
[Mode 4] Execution
   · Daily progress
   · EV metrics
   · Completion probability
```

### 3.1 Gating Rules

- PM vẫn là người **nhập proposal / project brief** ban đầu.
- `Mode 1` là bước bắt buộc trước planning.
- Theo `frontend-spec`, **Mode 3 unlock khi Mode 1 có verdict = Proceed / Conditional**.
- Theo `frontend-spec`, **Mode 4 unlock khi Mode 3 đã có active scenario**.
- `Mode 2` hiện là module phân tích nhân sự được chèn vào flow nghiệp vụ, nhưng rule lock/unlock chính thức trong UI hiện tại mới chỉ ràng buộc trực tiếp giữa `Mode 1 -> Mode 3` và `Mode 3 -> Mode 4`.

---

## 4. Khái Niệm Cốt Lõi

### 4.1 Workforce Unit (WFU)

- Đơn vị đo lường khả năng xử lý công việc: **1 WFU = 7 giờ làm việc / ngày**
- `standard` -> WFU x 1.0
- `fast` -> WFU x 1.2
- `quality` -> WFU x 1.5
- `fast / quality` chỉ được bật khi personnel có matching skill với techstack của task

**WFU multi-factor calibration** khi có dữ liệu profile:

```text
WFU_effective = base_wfu
              x project_familiarity_factor
              x technology_match_factor
              x quality_history_factor
              x delivery_reliability_factor
```

Khi chưa có profile, hệ thống dùng WFU đơn giản theo `base_wfu x mode multiplier`.  
Khi có profile, hệ thống tính `WFU_effective` và dùng cho matching / planning estimates.

### 4.2 Skill Matrix

```json
{ "Backend Java": "expert", "React": "intermediate", "DevOps": "beginner" }
```

- Mỗi skill có level và WFU multipliers
- Skill matrix dùng cho task staffing, skill mismatch warning và team matching

### 4.3 Task Estimation (COCOMO II)

Task được ước tính effort theo breakdown:

| Phase             | Ví dụ            |
| ----------------- | ---------------- |
| Investigate       | 0.5 ngày         |
| Design            | 0.5 ngày         |
| Implement         | 2.0 ngày         |
| Testing           | 1.0 ngày         |
| Review & Feedback | 1.0 ngày         |
| Support Release   | 0.5 ngày         |
| **Total**         | **5.5 man-days** |

Effort breakdown có thể được chỉnh sửa trong planning.

### 4.4 Tiến Độ Không Tuyến Tính

Thêm người không tự động giảm thời gian. Brooks' Law cần được áp dụng khi task đã ở giai đoạn muộn, đặc biệt khi task >50% hoàn thành.

### 4.5 Xác Suất Hoàn Thành

Hệ thống tính **P(on_time)** từ:

- SPI hiện tại
- variance của velocity
- active risk factors / warnings
- critical path slack

Threshold:

- `> 80%` -> On track
- `50% - 80%` -> At risk
- `< 50%` -> Critical

---

## 5. Tính Năng Chính

### 5.1 Project Analysis Mode (Pillar 1)

**Trigger:** PM nhập proposal / project brief -> trước khi vào planning, hệ thống yêu cầu chạy Project Analysis.

**10-axis radar** - PM + Tech Lead chấm điểm với AI hỗ trợ:

| #   | Axis                         | Layer            |
| --- | ---------------------------- | ---------------- |
| 1   | Problem-Solution Fit         | Theory of Change |
| 2   | Success Criterion Clarity    | Logic Model      |
| 3   | TELOS Feasibility Composite  | Feasibility Gate |
| 4   | Quality Attribute Coverage   | Architecture     |
| 5   | Architecture Risk & Tradeoff | Architecture     |
| 6   | Strategic Value              | MCDA             |
| 7   | Financial Return (ROI)       | MCDA             |
| 8   | Technology Maturity (TRL)    | Readiness        |
| 9   | Organizational Readiness     | Readiness        |
| 10  | Legal / Regulatory Readiness | Readiness        |

**Theo backend-spec hiện tại:**

- composite >= 4.0 -> proceed
- composite 3.0 - 3.9 -> conditional
- composite < 3.0 -> do_not_proceed
- bất kỳ axis = 1 -> do_not_proceed
- legal axis < 2 -> do_not_proceed
- TRL axis < 2 -> conditional at minimum

**Risk register** được auto-populate từ các axis score thấp.

**AI assist** dùng để:

- gợi ý scoring cho từng axis
- draft rationale
- phát hiện thiếu thông tin trong project brief

### 5.2 HR Analysis Mode (Pillar 2)

**Trigger:** Sau khi Project Analysis trả verdict `Proceed` hoặc `Conditional`.

**Developer profiles** gồm 5 lớp:

- OCEAN
- Behavioral
- Technical
- Soft Skills
- Performance

**Các output chính:**

- developer profile
- project-developer match score
- top 3 team configurations
- WFU effective estimate

**Owner nghiệp vụ theo docs mới:** BOD.  
**Lưu ý:** frontend-spec hiện vẫn đang mô tả màn hình này cho PM/TL, nhưng planning docs và knowledge-base đang mô tả nó là BOD-only.

### 5.3 Input & Phân Tích Dự Án (LLM)

- PM nhập **Project Proposal**
- LLM generate draft tasks với:
  - category
  - techstack
  - effort breakdown
  - dependencies
  - priority
  - rough estimate
- PM / TL review và chỉnh sửa trước khi đưa vào planning

### 5.4 Strategic Board (Mode 3)

- Strategic Board là giao diện planning chính
- Hỗ trợ assign nhân sự vào task
- Hỗ trợ chọn WFU mode
- Hỗ trợ warnings, gantt, dependency graph, calendar
- Hỗ trợ scenario snapshot / compare
- Hỗ trợ optimization và risk analysis

### 5.5 Progress Tracking (Mode 4)

- Team member cập nhật progress hằng ngày
- Hệ thống tính SPI, CPI, EAC
- P(on_time) được cập nhật theo progress thực tế
- Khi dự án lệch tiến độ, PM có thể thêm support hoặc tăng allocation

### 5.6 Warnings Engine

| Type              | Điều kiện                                     | Mức            |
| ----------------- | --------------------------------------------- | -------------- |
| `CAPACITY`        | Tổng daily hours > 7h                         | Critical       |
| `JUNIOR_ALONE`    | Junior không có senior kèm trên critical task | Critical       |
| `TIME_RISK`       | P(on_time) < 50% hoặc EAC > deadline          | Warning        |
| `BUDGET`          | Chi phí nhân sự > budget dự án                | Warning        |
| `LICENSE`         | Tool seats vượt quota                         | Warning        |
| `SKILL_MISMATCH`  | Assignee không match techstack                | Info / Warning |
| `DEPENDENCY_RISK` | Dependency chưa xong nhưng task sau sắp start | Warning        |

### 5.7 Tool & License Management

Mỗi dự án có thể có tool budget / seat allocation cho các công cụ như Claude Code hoặc GitHub Copilot. Khi phân bổ nhiều người hơn số ghế -> trigger `LICENSE`.

### 5.8 AI Optimization

- Chạy optimization theo `Makespan` hoặc `Budget`
- Trả về top solutions để so sánh
- Kết quả là recommendation, không tự động overwrite quyết định planning

### 5.9 XP & Leveling

Khi kết thúc dự án:

- thành viên nhận XP
- skill progression được cập nhật
- historical outcome được dùng để calibrate planning tốt hơn ở các dự án sau

---

## 6. Constraints Hệ Thống

| Constraint         | Rule                                             |
| ------------------ | ------------------------------------------------ |
| Daily capacity     | <= 7h / ngày tổng tất cả dự án                   |
| Junior rule        | Junior không được lead critical task một mình    |
| Non-linear scaling | Brooks' Law áp dụng khi thêm người vào task muộn |
| Dependency order   | Tasks phải theo topological order                |
| Skill multiplier   | Fast / quality chỉ khi matching techstack        |

---

## 7. Data Hierarchy

```text
Organization
  -> Personnel
      -> Skill Matrix
      -> Personnel Profiles

Organization
  -> Projects
      -> Project Evaluation
      -> Team Match Results
      -> Project Memberships
      -> Scenarios
           -> Tasks
           -> Task Dependencies
           -> Resource Assignments
           -> Progress Logs
           -> Warnings
           -> Completion Snapshots
```

**Các entity mới theo database-spec:**

- `project_evaluations`
- `personnel_profiles`
- `project_team_matches`

---

## 8. Integrations

| Integration               | Mục đích                                                              |
| ------------------------- | --------------------------------------------------------------------- |
| LLM provider              | Task generation, scoring assist, risk analysis, profile summarization |
| COCOMO II                 | Effort estimation                                                     |
| Genetic Algorithm         | Multi-constraint scenario optimization                                |
| CPM                       | Critical path, float calculation                                      |
| Earned Value + P(on_time) | Schedule health, completion probability                               |
| GitHub CLI / APIs         | HR Analysis data collection                                           |
| Slack API / Export        | Bổ sung corpus cho HR Analysis khi được phép                          |

---

## 9. Non-Functional Requirements

- Board render tốt với quy mô MVP
- Warning recompute <500ms sau mỗi assignment change
- P(on_time) compute <1s (sau EV update)
- Multi-tenant isolation giữa orgs
- Concurrent planning session hỗ trợ realtime updates
- Access control cho dữ liệu profile nhạy cảm của Pillar 2
- Auditability cho dữ liệu và thay đổi liên quan đến HR Analysis

---

## 10. Ghi Chú Đồng Bộ

Business spec này được đồng bộ từ các design docs hiện tại:

- `frontend-spec`
- `backend-spec`
- `database-spec`
- `milestones`
- `knowledge-base/system_design_overview`

Khi có mâu thuẫn giữa các design docs, business spec ghi nhận trạng thái hiện có thay vì tự đặt policy mới.
