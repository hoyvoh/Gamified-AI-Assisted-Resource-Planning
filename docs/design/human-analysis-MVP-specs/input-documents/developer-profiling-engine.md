# DEVELOPER PROFILING ENGINE

# Product Logic / Scoring Logic Specification

---

# 0. TRIẾT LÝ CỐT LÕI

Trước khi vào scoring, phải chốt 1 điều:

> **Hệ thống này không “đánh giá giá trị con người”.**
> Nó chỉ **ước lượng các pattern năng lực và hành vi làm việc đã được quan sát**, trong một khoảng thời gian nhất định, với mức độ tin cậy khác nhau.

Nên toàn bộ logic phải dựa trên 4 nguyên tắc:

### 1) Evidence over impression

Không kết luận mạnh nếu không có bằng chứng.

### 2) Pattern over incident

Không biến 1 lỗi đơn lẻ thành tính cách hay năng lực.

### 3) Opportunity-aware over exposure bias

Không xem “chưa thấy” là “không có”.

### 4) Role-relative over universal scoring

Không dùng 1 thước đo chung cho mọi developer.

---

# 1. OVERALL SCORING ARCHITECTURE

Mình đề xuất kiến trúc 5 lớp:

---

## Layer A — Raw Evidence Layer

Dữ liệu thô được collect từ các nguồn làm việc.

## Layer B — Behavioral Event Layer

Chuẩn hóa dữ liệu thành các “sự kiện có ý nghĩa đánh giá”.

## Layer C — Signal Inference Layer

Từ các event, suy ra các tín hiệu kỹ năng / mindset / hành vi.

## Layer D — Dimension Scoring Layer

Gộp tín hiệu thành các dimension có thể hiển thị.

## Layer E — Confidence & Fairness Layer

Đánh giá độ đáng tin, mức đủ dữ liệu, role fit, exposure fit.

---

## Flow logic

**Raw activities**
→ **Evidence units**
→ **Behavioral events**
→ **Skill signals**
→ **Dimension score**
→ **Confidence + explanation**
→ **Profile / Radar / KPT / Feedback / Journey**

---

---

# 2. TARGET PROFILING MODEL

# (cấu trúc đánh giá chính)

Mình sẽ chia thành **4 nhóm chính**, đúng với bài toán của bạn.

---

# GROUP 1 — CORE TECHNICAL EXECUTION

Đây là nhóm quan trọng nhất để trả lời:

> “Người này có phải là một developer đáng tin về mặt kỹ thuật không?”

### Dimensions:

1. **Implementation Reliability**
2. **Code Quality Discipline**
3. **Debugging & Root Cause Thinking**
4. **Careless Mistake Control**
5. **Technical Ownership**
6. **Technical Learning Adaptability**

---

# GROUP 2 — DOMAIN TECHNICAL CAPABILITY

# (BE / FE / DevOps là trọng tâm)

Đây là nhóm quan trọng thứ hai:

> “Người này mạnh ở domain kỹ thuật nào, yếu ở đâu?”

### Dimensions:

1. **Backend Capability**
2. **Frontend Capability**
3. **DevOps / Delivery Capability**
4. **System Integration Capability**
5. **Data / Interface Handling Discipline**
6. **Architecture Exposure (optional / role-aware)**

> Bạn có thể để 3 cái đầu là core visible axes trên radar.

---

# GROUP 3 — TECHNICAL MINDSET

Đây là nhóm cực quan trọng vì nó phân biệt:

> “Người biết code” và “người có tư duy kỹ thuật trưởng thành”

### Dimensions:

1. **Quality Mindset**
2. **Performance Awareness**
3. **Security Awareness**
4. **Maintainability Thinking**
5. **Risk Awareness**
6. **Decision Hygiene**

---

# GROUP 4 — PROFESSIONAL & TEAM EFFECTIVENESS

Đây là nhóm kỹ năng mềm nhưng phải được “developer-ized”, không được HR hóa chung chung.

### Dimensions:

1. **Problem Solving**
2. **Self Management**
3. **HoRenSo / Reporting Discipline**
4. **User First / Omotenashi**
5. **Collaboration**
6. **Mentoring / Knowledge Support**
7. **AI Leverage Ability**

---

---

# 3. DIMENSION DEFINITIONS

# (định nghĩa rõ để tránh chấm lung tung)

Phần này rất quan trọng. Nếu không định nghĩa chặt, model sẽ đánh giá “mạnh cảm giác”.

---

# GROUP 1 — CORE TECHNICAL EXECUTION

---

## 3.1 Implementation Reliability

Khả năng hiện thực hóa công việc kỹ thuật một cách ổn định, hoàn thành được, ít lệch yêu cầu.

### Positive signals

- hoàn thành task kỹ thuật đúng hướng
- ít rework do hiểu sai cơ bản
- code / output đủ để merge / deploy / handoff
- follow through đến khi xong

### Negative signals

- giao dang dở lặp lại
- phải sửa nhiều vì thiếu phần nền tảng
- implementation thường thiếu phần quan trọng
- cần nhiều vòng correction cho cùng 1 loại lỗi

---

## 3.2 Code Quality Discipline

Mức độ cẩn trọng và chuẩn mực trong việc tạo ra output kỹ thuật sạch và hợp lý.

### Positive

- ít lỗi dễ tránh
- có consistency
- code / deliverable rõ ràng
- có xu hướng tự chỉnh trước khi bị nhắc

### Negative

- lỗi sơ ý lặp lại
- naming / structure / consistency kém
- sửa nhanh nhưng cẩu thả
- hay bị nhắc những lỗi cơ bản

---

## 3.3 Debugging & Root Cause Thinking

Khả năng lần ra nguyên nhân thật thay vì chỉ chữa triệu chứng.

### Positive

- biết khoanh vùng vấn đề
- giải thích được nguyên nhân
- sửa lỗi có logic
- biết tách symptom và root cause

### Negative

- trial-and-error vô hướng
- fix symptom nhưng issue quay lại
- báo lỗi mà không framing được vấn đề
- thiếu hypothesis-driven troubleshooting

---

## 3.4 Careless Mistake Control

Khả năng kiểm soát lỗi “đáng lẽ tránh được”.

### Positive

- hiếm mắc lỗi avoidable
- có pre-check habit
- tự phát hiện sai trước khi người khác thấy

### Negative

- typo logic / missing edge / sai assumption / quên step
- quên follow-up, quên validation, quên handoff
- lặp lại cùng một kiểu sai

> Đây không nên là “một lỗi là trừ nặng”.
> Nó phải là **pattern dimension**.

---

## 3.5 Technical Ownership

Khả năng nhận trách nhiệm kỹ thuật và kéo vấn đề đi đến kết thúc.

### Positive

- chủ động clarify
- tự kéo issue đến done
- theo đến cuối
- không bỏ lửng khi gặp friction

### Negative

- dễ drop context
- đợi bị nhắc mới follow-up
- thiếu closure

---

## 3.6 Technical Learning Adaptability

Khả năng tiếp thu domain / tool / concept mới và áp dụng được vào việc.

### Positive

- học nhanh từ issue cũ
- sau feedback thì cải thiện rõ
- biết tự mở rộng hiểu biết

### Negative

- lặp lại lỗi cũ dù đã được feedback
- khó internalize lesson

---

# GROUP 2 — DOMAIN TECHNICAL CAPABILITY

---

## 3.7 Backend Capability

Khả năng xử lý logic hệ thống, API/service thinking, data flow, integration, backend-oriented implementation.

### Positive

- làm tốt luồng nghiệp vụ
- xử lý data / validation / API logic ổn
- hiểu dependency giữa các phần

### Negative

- hay sai flow / state / integration assumptions
- backend task thường cần cứu hộ nhiều

---

## 3.8 Frontend Capability

Khả năng xây UI behavior, state handling, UX consistency, interaction logic.

### Positive

- xử lý UI logic gọn
- biết edge cases giao diện
- hiểu hành vi người dùng

### Negative

- UI bug lặp lại
- thiếu nhất quán trải nghiệm
- interaction issues do thiếu thoughtfulness

---

## 3.9 DevOps / Delivery Capability

Khả năng hiểu và hỗ trợ vòng đời đưa sản phẩm vào môi trường hoạt động ổn định.

### Positive

- hiểu deployment / config / pipeline / environment concerns
- cẩn trọng khi đụng delivery path
- xử lý vận hành có kỷ luật

### Negative

- xem nhẹ operational concerns
- dễ tạo friction trong release / environment / setup

---

## 3.10 System Integration Capability

Khả năng kết nối các thành phần, hiểu interface, dependency, contract.

### Positive

- phối hợp tốt giữa nhiều thành phần
- hiểu input/output contract
- ít lỗi do mismatch assumptions

### Negative

- lỗi integration lặp lại
- thiếu synchronization với upstream/downstream

---

## 3.11 Data / Interface Handling Discipline

Khả năng xử lý input/output, format, schema, assumptions, edge cases.

### Positive

- cẩn thận với data contract
- để ý validation, nullability, shape, compatibility

### Negative

- lỗi do assumption dữ liệu
- mismatch format / missing validation

---

## 3.12 Architecture Exposure

Mức độ tham gia và chất lượng suy nghĩ ở tầng thiết kế hệ thống.

### Lưu ý:

Đây **không nên phạt** nếu role chưa cần.

### Positive

- tham gia decomposition
- biết tradeoff
- có suy nghĩ về boundaries / maintainability

### Negative

- chỉ đánh giá nếu có đủ cơ hội

---

# GROUP 3 — TECHNICAL MINDSET

---

## 3.13 Quality Mindset

Người này có “care” về chất lượng không?

### Positive

- tự nhắc tới edge cases
- chủ động kiểm tra
- quan tâm correctness

### Negative

- thiên về “chạy được là xong”
- thiếu ý thức chất lượng

---

## 3.14 Performance Awareness

Người này có nghĩ đến chi phí chạy / độ nặng / hiệu suất không?

### Positive

- có cân nhắc hiệu suất khi phù hợp
- để ý bottleneck / unnecessary cost

### Negative

- tạo giải pháp nặng một cách vô thức
- không để ý scale / load / responsiveness khi đáng ra phải để ý

---

## 3.15 Security Awareness

Người này có awareness cơ bản về an toàn kỹ thuật không?

### Positive

- cẩn trọng với data / access / exposure / secrets / unsafe assumptions

### Negative

- vô thức tạo risk
- không nhận ra các điểm nhạy cảm rõ ràng

> Chỉ đánh giá trong phạm vi evidence thực sự có.

---

## 3.16 Maintainability Thinking

Khả năng nghĩ xa hơn “xong task này”.

### Positive

- để ý readability, future change, clarity, reusability
- có tendency organize cho người sau

### Negative

- output khó maintain
- hard-to-follow / one-off thinking lặp lại

---

## 3.17 Risk Awareness

Khả năng nhận ra “nếu làm vậy có thể hỏng gì”.

### Positive

- chủ động nêu risk
- biết chặn risk trước khi làm

### Negative

- hay bỏ qua side effects
- chỉ react sau khi có vấn đề

---

## 3.18 Decision Hygiene

Chất lượng tư duy khi đưa ra hướng xử lý.

### Positive

- giải thích được vì sao chọn hướng A thay vì B
- biết tradeoff
- có reasoning sạch

### Negative

- quyết định cảm tính / random / không rõ basis

---

# GROUP 4 — PROFESSIONAL & TEAM EFFECTIVENESS

---

## 3.19 Problem Solving

Khả năng định nghĩa và xử lý vấn đề có cấu trúc.

### Positive

- biết framing problem
- tách vấn đề thành phần
- đề xuất hướng giải quyết hợp lý

### Negative

- dễ lạc symptom
- thiếu structure khi xử lý vấn đề

---

## 3.20 Self Management

Khả năng quản lý công việc, trạng thái, tiến độ và follow-through.

### Positive

- tự quản tốt
- biết update tình trạng
- ít bị trôi việc

### Negative

- quên việc / miss follow-up / thiếu organization

---

## 3.21 HoRenSo / Reporting Discipline

Khả năng báo cáo, liên lạc, và chia sẻ trạng thái đúng lúc.

### Positive

- update đúng thời điểm
- escalate đúng lúc
- communication rõ và hữu ích

### Negative

- báo trễ
- thiếu thông tin cần thiết
- để người khác phải đoán tình hình

---

## 3.22 User First / Omotenashi

Mức độ nghĩ đến trải nghiệm người dùng / người nhận output.

### Positive

- nghĩ đến người dùng cuối
- nghĩ đến người maintain / người dùng nội bộ
- output considerate

### Negative

- thiên về “xong cho mình” hơn “dễ dùng cho người khác”

---

## 3.23 Collaboration

Khả năng làm việc cùng người khác một cách hiệu quả.

### Positive

- phối hợp tốt
- trao đổi rõ
- biết nhờ đúng lúc
- biết hỗ trợ người khác

### Negative

- gây friction lặp lại
- handoff kém
- alignment yếu

---

## 3.24 Mentoring / Knowledge Support

Khả năng giúp người khác hiểu và tiến bộ.

### Positive

- giải thích rõ
- hỗ trợ junior / teammate
- chia sẻ tri thức hữu ích

### Negative

- chỉ đánh giá khi có đủ exposure

---

## 3.25 AI Leverage Ability

Khả năng sử dụng AI như công cụ tăng năng suất mà vẫn giữ chất lượng tư duy.

### Positive

- dùng AI để accelerate nhưng vẫn kiểm chứng
- biết tận dụng để explore / draft / debug / learn

### Negative

- copy output thiếu kiểm chứng
- phụ thuộc AI theo kiểu làm giảm chất lượng

> Đây là dimension rất mới và rất hay nếu làm đúng.

---

---

# 4. EVIDENCE MODEL

# (chuẩn hóa dữ liệu trước khi chấm)

Đây là xương sống của toàn bộ hệ thống.

---

# 4.1 Evidence Unit

Mỗi evidence nên được chuẩn hóa thành 1 object logic:

### Evidence Unit fields

- `source_type`
- `timestamp`
- `author`
- `context_scope`
- `artifact_type`
- `content_excerpt`
- `linked_reference`
- `related_people`
- `impact_scope`
- `confidence_of_parsing`

---

# 4.2 Behavioral Event

Từ raw evidence, convert thành event có nghĩa.

Ví dụ event type:

- Task ownership event
- Clarification event
- Review / feedback event
- Mistake / correction event
- Root cause explanation event
- Collaboration / support event
- Delivery / completion event
- Quality / risk awareness event
- Documentation / knowledge sharing event
- Escalation / reporting event
- User consideration event
- AI usage pattern event

---

# 5. EVIDENCE WEIGHTING FRAMEWORK

Đây là phần rất quan trọng vì **không phải evidence nào cũng đáng tin như nhau**.

Mình đề xuất mỗi evidence được chấm theo 4 chiều:

---

## 5.1 Evidence Strength

Bản thân evidence này mạnh tới đâu?

### High-strength evidence

- hành động / output thực
- deliverable cụ thể
- resolution cụ thể
- explanation gắn với kết quả

### Medium-strength evidence

- discussion có substance
- planning / review / clarification hữu ích

### Low-strength evidence

- lời nói chung chung
- social signal yếu
- snippet ngắn thiếu context

---

## 5.2 Evidence Directness

Evidence này có trực tiếp phản ánh skill đó không?

Ví dụ:

- một bug fix có thể trực tiếp phản ánh debugging
- một thread coordination phản ánh collaboration
- nhưng không nên dùng bừa một câu chat để suy ra “technical excellence”

---

## 5.3 Evidence Specificity

Evidence có cụ thể không hay mơ hồ?

Ví dụ:

- “Good job” → specificity thấp
- “You caught the race condition and isolated the issue quickly” → specificity cao

---

## 5.4 Evidence Recency

Evidence gần hiện tại hơn nên có trọng số cao hơn một chút.

### Recommendation

- 0–3 tháng: full weight
- 3–6 tháng: high
- 6–12 tháng: medium
- > 12 tháng: không dùng cho short-term profile, chỉ dùng cho milestone

---

## Suggested Evidence Weight Formula

### Evidence Weight =

**Strength × Directness × Specificity × Recency**

Ví dụ scale 0–1.

---

# 6. SKILL INFERENCE FRAMEWORK

# (từ evidence → dimension)

Đây là nơi “AI/logic” của sản phẩm thực sự sống.

---

# 6.1 Một dimension không được suy ra từ 1 evidence đơn lẻ

Ví dụ:

- 1 thread không thể kết luận “collaboration tốt”
- 1 bug không thể kết luận “careless”

### Rule:

Mỗi dimension nên cần:

- nhiều evidence unit
- nhiều event type
- đủ pattern repetition

---

# 6.2 Inference theo pattern, không theo keyword

Không được làm kiểu:

> thấy chữ “performance” => performance awareness

Phải infer theo **behavioral pattern**:

Ví dụ performance awareness là:

- chủ động nêu bottleneck
- cân nhắc cost
- avoid unnecessary heaviness
- phản ứng hợp lý khi có concern hiệu suất

---

# 6.3 Mỗi dimension nên có:

- **positive indicators**
- **negative indicators**
- **neutral / insufficient indicators**

Ví dụ:

### Collaboration

**Positive**

- chủ động align
- giúp unblock người khác
- handoff rõ

**Negative**

- thiếu sync
- confusion lặp lại
- người khác phải chase context

**Insufficient**

- ít cơ hội collaborative visible

---

# 6.4 Inference Output per dimension

Mỗi dimension nên trả ra:

- `observed_score`
- `confidence`
- `evidence_count`
- `pattern_type`
- `opportunity_level`
- `delta_vs_previous_period`
- `top_supporting_evidences`
- `top_counter_evidences`
- `explanation_summary`

---

# 7. BASELINE FRAMEWORK

# (công bằng hóa đánh giá)

Đây là phần sống còn để tránh chấm sai.

---

# 7.1 Baseline phải có 3 lớp

---

## A. Personal Baseline

Trạng thái khởi điểm của người đó.

Nguồn có thể gồm:

- đánh giá ban đầu từ manager
- self-assessment
- onboarding expectation
- early observed profile

### Vai trò

Dùng để so:

> “người này đang tiến bộ hay không”

Chứ không phải “đây là chân lý về họ”.

---

## B. Role Baseline

Kỳ vọng theo role / level.

Ví dụ:

- Junior BE
- Mid FE
- DevOps-focused engineer
- Fullstack
- Tech lead

### Ý nghĩa

Mỗi role có expected emphasis khác nhau.

Ví dụ:

- Junior không nên bị phạt vì mentoring thấp
- FE không nên bị chấm thấp DevOps chỉ vì ít exposure

---

## C. Opportunity Baseline

Đây là lớp quan trọng nhất.

### Câu hỏi:

Người này **có đủ cơ hội để bộc lộ dimension đó không?**

Ví dụ:

- chưa từng tham gia incident
- chưa từng review production risk
- chưa từng lead workstream

=> Không được infer yếu.

---

# 7.2 Dimension State Model

Thay vì chỉ có score, mỗi dimension nên có state:

- **Observed Strength**
- **Observed Developing**
- **Observed Weakness**
- **Insufficient Opportunity**
- **Insufficient Evidence**

Đây là design cực quan trọng.

---

# 7.3 Delta Logic

Điều bạn muốn theo dõi không phải chỉ là “điểm hiện tại” mà là:

### “người này đang đi lên hay đi ngang hay tụt”

### Delta states:

- Improved
- Stable
- Emerging
- Regressing
- Not enough comparison

Đây là thứ làm sản phẩm của bạn trở thành **growth system**, không chỉ là snapshot evaluator.

---

# 8. CONFIDENCE FRAMEWORK

Đây là phần bạn hỏi trực tiếp và là thứ phải hiển thị rất rõ.

---

# 8.1 Confidence không phải accuracy

Confidence chỉ có nghĩa:

> “Hệ thống có bao nhiêu cơ sở để tin rằng nhận định này đủ vững”

---

# 8.2 Confidence nên có 4 thành phần

---

## 8.2.1 Evidence Sufficiency

Có đủ evidence không?

Ví dụ:

- 1–2 evidence = thấp
- 5–10 evidence đa dạng = cao

---

## 8.2.2 Pattern Consistency

Pattern có lặp lại không?

Ví dụ:

- 1 lần miss handoff ≠ self management thấp
- nhưng lặp lại nhiều lần thì confidence tăng

---

## 8.2.3 Context Stability

Các evidence có đến từ nhiều bối cảnh hay chỉ một case duy nhất?

Ví dụ:

- chỉ một project duy nhất → confidence vừa
- nhiều task / nhiều context → confidence cao hơn

---

## 8.2.4 Cross-Signal Agreement

Các tín hiệu khác nhau có kể cùng một câu chuyện không?

Ví dụ:

- output + feedback + coordination đều cho thấy ownership tốt
  → confidence mạnh

Nếu conflict:
→ confidence phải giảm

---

## Confidence Formula đề xuất

### Confidence =

**Evidence Sufficiency × Pattern Consistency × Context Stability × Cross-Signal Agreement**

Normalize thành:

- **High Confidence**
- **Moderate Confidence**
- **Low Confidence**

---

# 8.3 Confidence UI recommendation

Mỗi dimension nên show:

- Score / Level
- Confidence
- Evidence count
- Opportunity level

Ví dụ:

| Dimension          | Score | Confidence | Opportunity  |
| ------------------ | ----: | ---------- | ------------ |
| Backend Capability |   4.1 | High       | High         |
| Security Awareness |   2.8 | Low        | Low          |
| Mentoring          |   N/A | Low        | Insufficient |

Đây là cách cực kỳ “fair”.

---

# 9. SCORING MODEL

# (cách tính điểm thực tế)

Đây là phần dễ làm sai nhất, nên mình khuyên **đừng làm “1 điểm tổng thần thánh” quá sớm**.

---

# 9.1 Dùng 3 tầng score

---

## Tầng 1 — Signal Score

Điểm từng signal nhỏ.

Ví dụ:

- ownership signal
- rework signal
- quality concern signal
- clarification signal
- support signal

---

## Tầng 2 — Dimension Score

Gộp signal thành dimension.

Ví dụ:

- Self Management
- Collaboration
- Backend Capability

---

## Tầng 3 — Category Score

Gộp dimension thành group lớn.

Ví dụ:

- Core Technical Execution
- Domain Capability
- Technical Mindset
- Team Effectiveness

---

# 9.2 Scale đề xuất

Mình khuyên dùng **5-level maturity scale**, vì:

- dễ hiểu với manager
- dễ hiển thị radar
- không fake precision như 83.7

### Gợi ý:

1. Emerging
2. Developing
3. Reliable
4. Strong
5. Advanced

Hoặc nếu muốn an toàn hơn:

1. Limited observed strength
2. Inconsistent
3. Functional / reliable
4. Strong / consistent
5. High maturity

---

# 9.3 Đừng cho score nếu thiếu evidence

Nếu evidence không đủ:

- show state
- không ép ra số

Ví dụ:

- Security Awareness: “Insufficient observed exposure”
- Mentoring: “Not enough opportunity yet”

Đây là design đúng.

---

# 10. RECOMMENDED WEIGHTING BY CATEGORY

Vì bạn nói rõ:

> **BE / FE / DevOps skills là quan trọng**
> nên mình sẽ bias theo technical-heavy.

---

## Suggested category weights

### A. Core Technical Execution → **30%**

- Implementation Reliability
- Code Quality Discipline
- Debugging & Root Cause
- Careless Mistake Control
- Technical Ownership
- Learning Adaptability

### B. Domain Technical Capability → **30%**

- Backend
- Frontend
- DevOps
- Integration
- Data / Interface
- Architecture Exposure

### C. Technical Mindset → **20%**

- Quality
- Performance
- Security
- Maintainability
- Risk
- Decision Hygiene

### D. Professional & Team Effectiveness → **20%**

- Problem Solving
- Self Management
- HoRenSo
- User First
- Collaboration
- Mentoring
- AI Leverage

---

# 10.1 Role-aware weight adjustment

Đây mới là thứ nên làm thật.

Ví dụ:

### Junior Backend

- Backend Capability ↑
- Self Management ↑
- Mentoring ↓
- Architecture ↓

### Senior Fullstack

- Breadth ↑
- Quality / Ownership ↑
- Mentoring ↑
- Decision Hygiene ↑

### DevOps-heavy role

- Delivery / risk / reliability / operational awareness ↑

### Frontend-heavy role

- FE capability / user-first / maintainability / integration ↑

---

# 11. FAIRNESS GUARDRAILS

Đây là phần mình rất muốn bạn giữ chặt.

---

## 11.1 Never infer weakness from silence

Không thấy evidence ≠ yếu.

---

## 11.2 Never punish one-off mistakes heavily

Một lỗi ≠ trait.

---

## 11.3 Never overweight visible communication

Người nói nhiều không mặc định là người giỏi hơn.

---

## 11.4 Never treat output volume as impact

Nhiều activity ≠ hiệu quả.

---

## 11.5 Separate “skill” from “opportunity”

Chưa được giao ≠ không làm được.

---

# 12. WHAT EACH TAB SHOULD USE FROM THIS LOGIC

---

## Tab 1 — Overview

Dùng:

- Category scores
- Top strengths
- Delta
- Contribution summary
- Key milestones

---

## Tab 2 — Competency & Evidence

Dùng:

- Dimension scores
- Confidence
- Evidence list
- Counter evidence
- Opportunity notes

---

## Tab 3 — KPT

Dùng:

- Positive pattern clusters
- Negative pattern clusters
- Suggested next experiments

---

## Tab 4 — Case-based Feedback

Dùng:

- repeated issue events
- strongest counterfactual suggestions
- specific “what to do differently next time”

---

## Tab 5 — Journey & Milestones

Dùng:

- longitudinal event compression
- turning points
- role shifts
- growth delta

---

# 13. PHẦN QUAN TRỌNG NHẤT:

# CÁCH NÓI RA OUTPUT CHO ĐÚNG

Đây là chỗ nhiều hệ thống chết.

### Không nên nói:

- “Bạn yếu collaboration”
- “Bạn thiếu ownership”
- “Bạn kém security”

### Nên nói:

- “Trong khoảng thời gian được chọn, có một số pattern cho thấy việc phối hợp và handoff đôi lúc chưa ổn định”
- “Một số quyết định kỹ thuật cho thấy quality mindset đang phát triển nhưng chưa nhất quán”
- “Hiện chưa có đủ evidence để kết luận mạnh về security judgment”

Ngôn ngữ output phải:

- **chính xác**
- **không phán xét**
- **có bằng chứng**
- **mở cho phản biện**

---

# KẾT LUẬN THIẾT KẾ

Nếu tóm lại toàn bộ logic engine của bạn chỉ bằng 1 câu, thì nó là:

> **Một hệ thống chuyển đổi lịch sử làm việc của developer thành các pattern năng lực có thể giải thích, có độ tin cậy, có xét ngữ cảnh role và mức cơ hội, nhằm phục vụ growth chứ không phải phán xét.**

Đó là version “đứng được”.
