# Nội Dung Thuyết Trình — Tiếng Việt
# Project Intelligence Platform

**Định vị trung tâm:**
> "Lớp thông minh biến dữ liệu thật của đội ngũ thành quyết định dự án tự tin."

---

## SLIDE 1 — Bìa

**Tiêu đề:** Project Intelligence Platform

**Phụ đề:** AI-assisted planning & resource decisions — grounded in real team data

**Tag line nhỏ:** Dành cho PM · Tech Lead · BOD

---

## SLIDE 2 — Nỗi Đau Thật

**Tiêu đề:** Mọi thứ chạy tốt... cho đến khi không còn tốt nữa.

**Câu chuyện:**

Một dự án mới được giao. PM mở cuộc họp kick-off.

Scope được đánh giá dựa trên kinh nghiệm. Tech Lead assign task cho từng người — người này "mạnh Backend", người kia "quen React". Estimate được chốt trong buổi họp 2 tiếng, ghi vào Excel, rồi mọi người bắt đầu làm.

Nhưng không ai biết:
- Dev "mạnh React" vừa chuyển sang mobile 6 tháng trước
- Dự án có yêu cầu compliance mà không ai nhận ra khi estimate
- Người được assign task critical đang carry 3 dự án khác

**Không ai sai. Nhưng không ai có đủ thông tin tại thời điểm quyết định.**

Và khi nhận ra — thường đã quá muộn để thay đổi không đau.

---

## SLIDE 3 — Tại Sao Điều Này Quan Trọng

**Tiêu đề:** Đây không chỉ là bất tiện — đây là thiệt hại.

**4 hệ quả:**

| Nguyên nhân | Hệ quả |
|------------|--------|
| Estimate sai | Overwork · Trễ deadline · Vượt budget |
| Chọn nhân sự không phù hợp | Skill mismatch · Rework · Technical debt tích lũy |
| Không nhận ra risk sớm | Can thiệp quá muộn · Không còn phương án dự phòng |
| Phụ thuộc vào trí nhớ cá nhân | Knowledge thất lạc · Lặp lại lỗi cũ · Không thể scale |

**Kết:** Và vòng lặp này cứ lặp đi lặp lại — vì không có gì thay đổi ở nơi quyết định được tạo ra.

---

## SLIDE 4 — Insight Cốt Lõi

**Tiêu đề:** Dữ liệu đã ở đó từ lâu. Vấn đề là nó chưa bao giờ sẵn sàng cho quyết định.

**Câu hỏi trung tâm:**
> "Làm sao biến những tín hiệu rải rác — commits, PR reviews, Slack threads, lịch sử dự án — thành thông tin đúng, đúng lúc, cho đúng quyết định?"

**Minh họa:**
- Trong GitHub: năng lực kỹ thuật thật, tốc độ làm việc, chất lượng code, pattern review
- Trong Slack: phong cách phối hợp, breadth collaboration, tốc độ phản hồi
- Trong lịch sử dự án: velocity thực tế, rủi ro đã từng xảy ra, cách team xử lý
- Trong proposal dự án mới: scope, tech stack, constraints, stakeholder, timeline

**Tất cả đều đã tồn tại. Chỉ chưa được tổng hợp — tại đúng thời điểm cần.**

---

## SLIDE 5 — Giải Pháp

**Tiêu đề:** Bốn trụ cột. Một hệ sinh thái.

**Định vị 1 câu:**
> Chúng tôi xây dựng Project Intelligence Platform — hệ thống giúp PM, Tech Lead và BOD ra quyết định dự án dựa trên bằng chứng, không phải cảm tính.

---

**Trụ cột 1 — Phân Tích Nhân Sự** *(đầu vào)*
- Thu thập: GitHub commits, PR reviews, Slack signals — theo username
- Phân tích: 5-layer developer profile (OCEAN personality · Behavioral · Technical · Soft Skills · Performance)
- Kết quả: năng lực thật, phong độ hiện tại, match score với dự án — dựa trên dữ liệu 6–12 tháng gần nhất

**Trụ cột 2 — Phân Tích Dự Án** *(đầu vào)*
- Input: project proposal text
- Phân tích: LLM + 5 framework học thuật (ToC, TELOS, ATAM, MCDA/AHP, TRL) → 10-axis radar scoring
- Kết quả: Verdict (Proceed / Conditional / Do Not Proceed) + Risk Register + Requirements Vector

**→ Hai trụ cột trên là điều kiện tiên quyết. Không có chúng, hai trụ cột sau chỉ là planning board thông thường.**

**Trụ cột 3 — Lập Kế Hoạch Nguồn Lực**
- Kanban board: developer cards kéo thả vào task cards
- COCOMO II: effort estimation theo breakdown thực tế
- WFU_effective: năng lực thật của từng người trên từng task cụ thể
- Scenario planning: Plan A/B/C, Plan Normal/Full Resource/OT — compare và launch
- GA Optimizer: gợi ý phân bổ tối ưu (makespan / budget)

**Trụ cột 4 — Quản Lý Trong Quá Trình**
- P(on_time): xác suất hoàn thành đúng hạn, cập nhật hàng ngày
- 3-layer Gantt: Baseline / Planned / Actual — thấy drift ngay khi xảy ra
- Scenario switching: khi điều kiện thay đổi (người nghỉ, deadline siết, budget cắt) — chuyển plan có bằng chứng, không mất lịch sử tiến độ
- EV Metrics: SPI, CPI, EAC — biết sớm, hành động kịp

---

## SLIDE 6 — Tại Sao Đây Là Đáng Tin

**Tiêu đề:** Không phải cảm tính số hóa. Bằng chứng được cấu trúc.

**4 lý do:**

**1. Dữ liệu thật, không phải survey**
- GitHub API + Slack API: hành vi thực tế, không phải tự đánh giá
- Tín hiệu được cập nhật liên tục — phản ánh năng lực tại thời điểm hiện tại

**2. Framework học thuật đã được kiểm chứng**
- COCOMO II · OCEAN (Big Five) · Dreyfus Skill Model
- Theory of Change · TELOS · ATAM · MCDA/AHP · TRL
- Không phải heuristic tự nghĩ ra

**3. Kết quả giải thích được**
- Mỗi score có breakdown chi tiết
- Mỗi recommendation có lý do
- Không có "black box" — PM/TL hiểu tại sao hệ thống gợi ý điều đó

**4. Quyết định có audit trail**
- Scenario switching ghi nhận trigger reason (member departure, scope change, deadline change...)
- Lịch sử P(on_time) theo ngày
- Không ai "nhớ nhầm" tại sao kế hoạch thay đổi

---

## SLIDE 7 — Vision / Closing

**Tiêu đề:** Cùng AI — để thấy rõ hơn, quyết định nhanh hơn.

**Vision statement:**

> "Chúng tôi tin rằng những dự án tốt nhất không được thắng bởi team đông nhất — mà bởi team thấy rõ nhất.
>
> Project Intelligence Platform là lớp thông minh biến các tín hiệu rời rạc từ công việc hàng ngày của đội ngũ thành quyết định dự án tự tin, minh bạch, và có thể học hỏi theo thời gian."

**Closing line:**
> Better delivery starts with better decisions — and better decisions start with the right information.

---

## APPENDIX A — Decision & Estimation Logic

**Tiêu đề:** Kết quả được tính như thế nào?

**Project Analysis (Pillar 2):**
- 10 axes, 1–5 scale — PM + TL chấm điểm có AI assist
- Composite score → Proceed / Conditional / Do Not Proceed
- Axes ≤ 2 → auto-generated risk register

**Resource Analysis (Pillar 1):**
- Feature extraction từ raw GitHub/Slack signals
- LLM inference → 5-layer profile với confidence score
- Cosine similarity → match score giữa developer vector và project requirements vector

**WFU_effective:**
```
WFU_effective = base × familiarity_factor × tech_match_factor × quality_history_factor × delivery_reliability_factor
```

**P(on_time):**
Derived từ SPI (Schedule Performance Index), velocity variance, active warnings, critical path slack

---

## APPENDIX B — Data Foundation

**Tiêu đề:** Hệ thống này ăn dữ liệu gì?

| Nguồn | Dữ liệu |
|-------|---------|
| GitHub API | Commits, PRs, code reviews, issue activity per developer |
| Slack API | Messages, thread responses, @mentions, reactions |
| Project proposal | Scope, tech stack, timeline, constraints, stakeholders |
| Manual input | Effort estimates, skill matrix, allocation %, WFU mode |
| Progress logs | Daily completion %, hours spent, notes |

**Tất cả dữ liệu thuộc về org — không rời khỏi hệ thống.**

---

## APPENDIX C — High-Level Architecture

**Tiêu đề:** Nếu build thật thì chạy ra sao?

```
GitHub API ──┐
Slack API  ──┤→ Data Pipeline → Feature Extraction
             │                        ↓
             │                 LLM Profile Inference (Claude API)
             │                        ↓
             │                 Developer Profiles (5-layer)
             │
Project Brief ──→ LLM Scoring Engine (Claude API)
                        ↓
               10-axis Radar + Verdict + Risk Register
                        ↓
           ┌──────────────────────────────────┐
           │     Planning Board               │
           │  COCOMO II · WFU Engine          │
           │  GA Optimizer · Warning Engine   │
           │  Scenario State Machine          │
           └──────────────────────────────────┘
                        ↓
              Execution Mode
           Earned Value · P(on_time) · Scenario Switch
```

**Stack:** Next.js 15 · FastAPI · PostgreSQL · Claude API · GitHub API · Slack API

---

## APPENDIX D — Roadmap

**Tiêu đề:** Đây chỉ là bước đầu.

| Giai đoạn | Năng lực |
|-----------|---------|
| v1 — Foundation | HR profiling + Project analysis + Planning board |
| v2 — Execution | P(on_time) tracking + Scenario switching + EV metrics |
| v3 — Learning | XP system + velocity calibration + cross-project pattern recognition |
| v4 — Intelligence | Predictive risk detection + proactive recommendations + org-level portfolio view |

**Tầm nhìn dài hạn:**
Mỗi dự án hoàn thành đều làm hệ thống hiểu đội ngũ tốt hơn — và giúp dự án tiếp theo bắt đầu từ nền tảng vững chắc hơn.
