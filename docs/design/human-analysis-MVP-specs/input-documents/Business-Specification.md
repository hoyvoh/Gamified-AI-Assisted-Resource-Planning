# BUSINESS SPECIFICATION

# Developer Growth & Evidence-Based Performance Insight Platform

---

## 1. Executive Summary

This product is an internal people-development and performance insight platform designed to help organizations understand how software engineers work, grow, collaborate, and improve over time.

Instead of relying solely on periodic human evaluation, the platform continuously synthesizes signals from day-to-day work artifacts and team interactions to build an evidence-based, time-bounded profile for each individual contributor.

The purpose of the system is **not** to replace managers or formal performance review processes.
Its purpose is to act as a **support layer for coaching, growth, reflection, and fairer evaluation** by:

- highlighting meaningful patterns of contribution,
- surfacing strengths and improvement areas,
- linking every conclusion to traceable evidence,
- and translating historical work into actionable development feedback.

The product is designed around a gamified organizational structure and individual growth journey, where each member can be reviewed through multiple lenses: contribution overview, competency evidence, improvement insights, development retrospectives, and long-term milestones.

---

## 2. Product Vision

To create a trustworthy internal platform that helps organizations answer:

- What is this developer actually good at?
- How are they improving over time?
- What recurring weaknesses or blind spots are visible in their work?
- What evidence supports these conclusions?
- What should they focus on next in order to grow?

The product aims to shift internal performance analysis from **subjective memory and fragmented impressions** toward **evidence-based, explainable, longitudinal growth insight**.

---

## 3. Problem Statement

Most organizations struggle to evaluate technical contributors fairly and consistently.

### Common issues include:

- Managers remember only the most recent or most visible work.
- Quiet but impactful contributors are often underrated.
- Role boundaries distort interpretation of performance.
- Technical skill and behavioral skill are rarely measured together.
- Improvement advice is generic and not grounded in actual work.
- Historical learning is lost after each project.
- Contributors often do not understand **why** they were evaluated a certain way.

As a result, performance discussions become:

- inconsistent,
- difficult to defend,
- emotionally sensitive,
- and often not useful for real growth.

This product addresses that gap by creating a structured, explainable, and evidence-traceable profile for each developer over a chosen period of time.

---

## 4. Product Objectives

The system should enable organizations to:

1. Build a structured profile for each developer based on observed work patterns.
2. Evaluate both technical and non-technical competencies from work evidence.
3. Surface strengths, risks, recurring mistakes, and growth opportunities.
4. Provide transparent evidence trails for every major conclusion.
5. Allow managers and team members to challenge or validate the analysis.
6. Support periodic reflection through Keep / Problem / Try style retrospectives.
7. Preserve long-term milestones to help visualize development over multiple years.
8. Encourage fairer and more context-aware growth conversations.

---

## 5. Target Users

### Primary Users

- Engineering managers
- Team leads
- Technical mentors
- People development or talent management teams

### Secondary Users

- Developers reviewing their own growth
- Project leads conducting feedback or career development sessions

### Tertiary Users

- Organization admins managing team structures and review scopes

---

## 6. Core Product Scope

The product focuses specifically on **individual developer profiling and growth analysis**.

It does **not** aim to become a full workforce planning, staffing, or enterprise performance management suite in its first phase.

### In Scope

- Individual developer insight
- Team-level browsing and review
- Evidence-based competency analysis
- Improvement recommendations
- Long-term growth and milestone visualization
- Time-bounded analysis

### Out of Scope (for initial version)

- Compensation recommendation
- Promotion decision automation
- Organization-wide workforce optimization
- Automated project staffing allocation
- Succession planning
- Hiring recommendation engine

---

## 7. Core Concept

Each developer is analyzed over a selected period of time and represented through a structured profile composed of five viewpoints:

1. **Overview**
2. **Competency & Evidence**
3. **Keep / Problem / Try**
4. **Case-Based Improvement Feedback**
5. **Contribution Journey & Milestones**

The system is built around a navigable organization hierarchy:

**Organization → Team → Member**

Once a member is created and data is collected, the platform generates a profile and makes it explorable through these five perspectives.

---

# 8. Functional Scope

---

## 8.1 Organizational Structure Management

The platform must allow users to create and manage a hierarchy of:

- Organizations
- Teams
- Members

### Key capabilities

- Create an organization
- Create teams under an organization
- Add members under a team
- Browse the hierarchy from a left-side navigation panel
- Select any member to view their profile

### Business purpose

This provides a familiar mental model for navigating people insight across a company structure.

---

## 8.2 Member Data Collection

When a member is created, the platform should begin collecting relevant work signals for the selected time period.

### Key capabilities

- Collect historical activity within a user-selected date range
- Allow refresh/re-run of analysis
- Limit the selectable range to a maximum of 1 year
- If a user selects a range longer than 1 year:
  - automatically reset to the maximum supported range
  - show a warning message

### Business purpose

This keeps the analysis bounded, interpretable, and operationally efficient.

---

## 8.3 Profile Analysis

After data is collected, the platform must automatically produce an insight profile for the selected member.

This profile should synthesize signals related to:

### Technical dimensions

- Core technical strength
- Breadth across technical domains
- Quality mindset
- Performance awareness
- Security awareness
- Error patterns or avoidable mistakes

### Behavioral and professional dimensions

- Problem solving
- Self-management
- Communication discipline
- User-first thinking
- Collaboration
- Mentoring / supportiveness
- Effective use of AI tools in work

### Business purpose

This transforms raw work traces into human-usable developmental insight.

---

# 9. Member Profile Tabs

---

## Tab 1: Overview

This tab should provide a high-level summary of the developer’s contribution and growth during the selected time window.

### Should include

- Summary paragraph of the individual’s contribution pattern
- Visual skill overview (e.g. radar-style summary)
- Key strengths at a glance
- Number of major initiatives or workstreams involved in
- Number of responsibilities directly owned
- Completion and ownership highlights
- Encouraging and motivational summary commentary
- Notable achievements during the selected period

### Intended use

A quick “executive understanding” of who this person has been during the selected period.

---

## Tab 2: Competency & Evidence

This tab should explain **how and why** the system arrived at its evaluation.

### Should include

- Detailed breakdown of skill dimensions
- Performance-related observations
- Structured competency scoring or level bands
- Evidence snippets supporting each major conclusion
- Ability to trace each conclusion back to source material
- Direct jump to original evidence location where possible

### Intended use

This is the **explainability layer**.
It is the most important tab for trust.

### Design principle

No strong conclusion should appear without visible support.

---

## Tab 3: Keep / Problem / Try

This tab should provide a retrospective-style summary for the selected time period.

### Should include

- **Keep**: strengths and effective patterns worth preserving
- **Problem**: recurring issues, friction points, or risk areas
- **Try**: specific next-step experiments or improvement actions

### Intended use

A growth-oriented reflection tab that can be used in:

- 1:1 conversations,
- performance review preparation,
- self-reflection,
- development planning.

---

## Tab 4: Case-Based Improvement Feedback

This tab should provide concrete feedback based on specific situations or recurring patterns observed.

### Should include

- A list of notable issue patterns or problematic cases
- Explanation of what happened
- Why it matters
- What could have been done differently
- How to improve next time
- Suggested better behavior or decision-making pattern

### Intended use

This is where the platform becomes genuinely useful instead of merely descriptive.

This tab should avoid vague feedback such as:

- “communicate better”
- “be more careful”
- “improve code quality”

Instead, it should say things like:

- “Important clarifications tended to happen late in the process”
- “Repeated follow-up questions suggest incomplete handoff patterns”
- “Certain categories of mistakes appear preventable with a more structured pre-check habit”

---

## Tab 5: Contribution Journey & Milestones

This tab should visualize the developer’s long-term growth path.

### Should include

- Contribution timeline
- Important milestones across time
- Notable learning events
- High-impact moments
- Longitudinal trend markers
- Development path interpretation

### Intended use

To help answer:

- How has this person changed?
- What have they already overcome?
- Where are they on their growth journey?
- What type of next challenge fits them now?

### Important scope distinction

This timeline can extend beyond the 1-year analysis window and preserve up to **5 years of milestone history**.

This makes it useful as a long-term growth memory layer rather than only a short-term review tool.

---

# 10. Trust & Review Mechanisms

This product will fail if users do not trust it.
So trust must be designed into the product.

---

## 10.1 Evidence Traceability

Every major assessment should be traceable to evidence.

### Requirements

- Show why a conclusion exists
- Allow users to inspect supporting evidence
- Preserve context around the evidence
- Avoid unsupported black-box judgments

---

## 10.2 Assessment Validation

Users should be able to indicate whether an assessment seems accurate or inaccurate.

### Requirements

- Allow users to flag an insight as:
  - accurate
  - questionable
  - incorrect

- Allow users to provide optional feedback
- Use this signal to improve future interpretations

### Business purpose

This creates a correction loop and prevents the system from becoming a one-way evaluator.

---

## 10.3 Refresh & Re-analysis

The system should allow users to re-run analysis for a member.

### Requirements

- Manual refresh action
- Re-collect data for the chosen time window
- Re-generate insights
- Preserve previous long-term milestones where appropriate

---

# 11. Key Business Rules

1. A member profile must belong to exactly one team.
2. A team must belong to exactly one organization.
3. Time-bounded analysis cannot exceed 1 year.
4. If the selected date range exceeds the limit:
   - the system resets it to the maximum valid range,
   - and shows a warning.

5. Long-term milestone history may persist up to 5 years.
6. Strong conclusions must include evidence support.
7. Users must be able to review and challenge insights.
8. The system must account for role context to avoid unfair comparisons.
9. The system must not treat absence of evidence as evidence of weakness.
10. The system must be positioned as a decision-support and growth tool, not an absolute judge.

---

# 12. Non-Functional Product Expectations

---

## 12.1 Trustworthiness

The platform must prioritize explainability and fairness over superficial scoring.

## 12.2 Clarity

Outputs should be understandable to both technical managers and individual contributors.

## 12.3 Consistency

The same observed pattern should be interpreted consistently across similar cases.

## 12.4 Boundedness

The system should avoid over-claiming when evidence is sparse or ambiguous.

## 12.5 Auditability

Insights should be inspectable and reviewable after generation.

## 12.6 Scalability of Insight

The product should remain useful both for:

- short review windows,
- and longitudinal growth reflection.

---

# 13. Risks & Product Guardrails

This is the part many teams skip — and then the product becomes dangerous.

---

## 13.1 Risk: False confidence

A polished dashboard can make weak inference look authoritative.

### Guardrail

Every score or conclusion must have:

- evidence,
- confidence indication,
- and uncertainty handling.

---

## 13.2 Risk: Role bias

A person may appear weak in a dimension simply because their role gives them less exposure to that activity.

### Guardrail

Profiles must be interpreted relative to:

- expected role patterns,
- opportunity exposure,
- and observed work context.

---

## 13.3 Risk: Visibility bias

People with more visible communication may appear “better” than those doing deeper invisible work.

### Guardrail

The system should not overweight loudness, volume, or social presence.

---

## 13.4 Risk: Over-penalizing mistakes

One or two visible mistakes may distort the entire profile.

### Guardrail

Repeated patterns matter more than isolated incidents.

---

## 13.5 Risk: Misuse as surveillance

If the platform feels punitive, adoption will collapse.

### Guardrail

The product should be framed and designed as:

- a coaching and growth tool,
- not a disciplinary system.

---

# 14. Success Criteria

The product is successful if it helps teams have **better growth conversations**, not merely more dashboards.

### Desired outcomes

- Managers say the profile is directionally useful
- Developers feel the feedback is understandable and not arbitrary
- Users can quickly inspect why a conclusion was made
- The platform helps identify both strengths and blind spots
- The platform supports better 1:1 and retrospective discussions
- Long-term growth becomes more visible and narratable

---

# 15. Future Expansion Opportunities

These should remain as roadmap ideas, not initial scope.

### Potential expansions

- Baseline progression after each major project
- Role-aware growth ladders
- Suggested development path by career stage
- Team-level skill heatmaps
- Manager review overlay
- Skill trend over time
- Calibration support across multiple reviewers
- Promotion packet assistance
- Internal mobility or mentorship recommendation

---

# 16. Product Positioning Statement

This product is an **evidence-based developer growth and performance insight platform** designed to help organizations understand technical contributors more fairly, coach them more effectively, and preserve long-term growth signals that are otherwise lost in everyday work.

---

---

# PHẦN 2 — GIẢI QUYẾT CÁC ĐIỂM BẠN ĐANG THẮC MẮC

Giờ tới phần quan trọng hơn spec:
**làm sao để cái này không chỉ “nghe hay” mà còn “đứng được”.**

---

# A. Cách đánh giá “đúng / sai” của phương pháp

# → Metrics cho confidence

Đây là chỗ sống còn. Nếu không có cái này, sản phẩm sẽ biến thành **“AI nói vậy thôi”**.

Bạn nên chia thành **3 tầng đánh giá**:

---

## A1) Insight Quality (độ đúng của từng nhận định)

Mỗi nhận định nên có 3 chỉ số:

### 1. Evidence Sufficiency

Nhận định này có đủ dữ liệu để nói không?

Ví dụ:

- Có 1 lần evidence → yếu
- Có 5 lần, nhiều bối cảnh khác nhau → mạnh
- Có từ nhiều loại hoạt động khác nhau → mạnh hơn

**Output nên có thể là:**

- Low evidence
- Medium evidence
- Strong evidence

> Đây không phải “đúng/sai”, mà là “đủ cơ sở để nói chưa”.

---

### 2. Pattern Consistency

Pattern đó có lặp lại không, hay chỉ là tai nạn 1 lần?

Ví dụ:

- Một lần miss handoff ≠ yếu communication
- Nhưng nếu lặp lại 6 lần ở nhiều task khác nhau → bắt đầu có pattern

**Ý nghĩa:**
Phân biệt **incident** với **trait**

---

### 3. Cross-Source Agreement

Các tín hiệu từ nhiều nguồn có cùng kể một câu chuyện không?

Ví dụ:

- Evidence từ deliverable cho thấy ownership cao
- Feedback / trao đổi cũng cho thấy initiative cao
  → confidence tăng

Ngược lại:

- output nhiều nhưng context lại cho thấy bị assign ép
  → confidence giảm

---

## A2) Human Agreement (độ khớp với đánh giá con người)

Đây là metric rất thực tế để validate sản phẩm.

Bạn có thể cho:

- Manager review
- Self review
- Peer review (optional)

Rồi đo xem hệ thống và con người **khớp nhau bao nhiêu**.

### Các chỉ số nên dùng:

- **Agreement Rate**
  Bao nhiêu insight được con người xác nhận là “đúng”
- **Dispute Rate**
  Bao nhiêu insight bị flag là “sai / questionable”
- **Correction Acceptance Rate**
  Sau khi có phản hồi, hệ thống sửa được bao nhiêu trường hợp hợp lý

---

## A3) Actionability (độ hữu ích)

Nhiều hệ thống “đúng” nhưng **vô dụng**.

Nên phải đo thêm:

- Người dùng có thấy feedback này actionable không?
- Có giúp chuẩn bị 1:1 / review / self reflection không?
- Có giúp manager nhớ ra case thật không?

### Một thang đơn giản:

Cho mỗi insight / tab đánh giá 1–5:

- Understandable
- Fair
- Useful
- Actionable

> Nếu đúng mà không actionable thì cũng chưa đủ tốt.

---

# Gợi ý công thức confidence đơn giản

Bạn có thể biểu diễn confidence theo kiểu business-friendly:

### Confidence Score =

**Evidence Strength × Pattern Stability × Context Alignment × Source Agreement**

Rồi normalize ra:

- **High Confidence**
- **Moderate Confidence**
- **Low Confidence**

### Quan trọng:

**Confidence ≠ correctness**
Nó chỉ là:

> “Hệ thống có bao nhiêu lý do để tin vào nhận định này”

Đây là cách nói an toàn và đúng hơn rất nhiều.

---

# B. Cách xác định baseline cho từng cá nhân

# → để tránh đánh giá lệch vì role

Ý tưởng của bạn là đúng hướng, nhưng phải sửa lại một chút để không bị “manager bias từ ngày đầu”.

Nếu bạn để baseline chỉ do manager set một lần, nó sẽ gặp 3 vấn đề:

1. manager chủ quan,
2. baseline có thể quá thấp / quá cao,
3. role thay đổi theo thời gian.

Nên baseline nên có **3 lớp**.

---

## B1) Personal Baseline (chỉ số gốc cá nhân)

Đây là trạng thái ban đầu của người đó khi bắt đầu được track.

Nguồn nên gồm:

- đánh giá khởi điểm từ manager,
- self-assessment,
- role expectation,
- level expectation.

=> Không phải “điểm tuyệt đối”, mà là **starting profile**

Ví dụ:

- Strong in implementation
- Moderate in collaboration
- Low exposure to architecture
- No evidence yet for mentoring

**Rất quan trọng:**
“Không có evidence” ≠ “yếu”

---

## B2) Role Baseline (mức kỳ vọng theo vai trò)

Ví dụ:

- Junior BE
- Mid FE
- Senior Fullstack
- Tech Lead

Mỗi role sẽ có **expected range** cho từng dimension.

Ví dụ:

- Junior không bị kỳ vọng cao ở mentoring / architecture
- Senior bị kỳ vọng cao hơn ở ownership / review quality / decision quality

### Tác dụng:

Tránh việc so một bạn junior với một bạn lead rồi kết luận sai.

---

## B3) Opportunity Baseline (mức cơ hội được va chạm)

Đây là phần rất nhiều hệ thống không làm, và vì vậy đánh giá sai.

Ví dụ:

- Một người không đụng security project
- Một người không lead task nào
- Một người không có dịp mentor ai

Thì **không thể đánh giá thấp họ vì thiếu evidence ở dimension đó**.

Nên mỗi dimension nên có trạng thái:

- **Observed Strong**
- **Observed Moderate**
- **Observed Weak**
- **Insufficient Opportunity**

Cái “Insufficient Opportunity” này cực kỳ quan trọng.
Nó cứu sản phẩm của bạn khỏi việc biến thành một máy chấm điểm vô lý.

---

# Kết luận baseline tốt nhất

Thay vì nghĩ:

> “Điểm gốc rồi cộng trừ”

Hãy nghĩ đúng hơn là:

> **“Một hồ sơ năng lực ban đầu + vùng kỳ vọng theo role + mức cơ hội thực tế để bộc lộ năng lực”**

Đây là tư duy đúng hơn, công bằng hơn, và business-safe hơn.

---

# C. Cách trích xuất dữ liệu hiệu quả khi time window lớn

Đây là chỗ kỹ thuật dễ làm sai nhất:
**nếu nhét hết dữ liệu vào, hệ thống sẽ vừa tốn vừa ngu.**

Bạn phải dùng tư duy:

> **“Không thu hết mọi thứ. Thu những thứ có giá trị đánh giá cao nhất.”**

---

# C1) Chia dữ liệu thành 3 lớp

---

## Lớp 1 — High-signal records (quan trọng nhất)

Đây là dữ liệu đáng giữ gần như chắc chắn.

Ví dụ business-wise:

- những lần trực tiếp sở hữu đầu việc / deliverable,
- những phần trao đổi liên quan đến quyết định,
- feedback cụ thể,
- các thay đổi / chỉnh sửa lớn,
- incident / lỗi / phản hồi chất lượng,
- hỗ trợ người khác,
- clarification quan trọng,
- retrospective hoặc lesson learned.

Đây là “xương sống” để profile.

---

## Lớp 2 — Context records

Dữ liệu giúp hiểu ngữ cảnh nhưng không cần giữ toàn bộ.

Ví dụ:

- thảo luận thường ngày,
- trao đổi ngắn,
- các đoạn follow-up nhỏ,
- phối hợp thông thường.

Lớp này chỉ cần giữ **mẫu đại diện** hoặc **tóm tắt theo cụm**.

---

## Lớp 3 — Low-signal noise

Ví dụ:

- xác nhận ngắn,
- phản hồi mang tính hành chính,
- các đoạn không nói lên kỹ năng / mindset gì rõ ràng.

Cái này nên bỏ hoặc chỉ dùng khi reconstruct context.

---

# C2) Dùng “eventization” thay vì “documentization”

Đây là ý rất quan trọng.

Đừng nghĩ theo kiểu:

> “đọc toàn bộ tin nhắn / toàn bộ artifact”

Hãy nghĩ theo kiểu:

> “biến lịch sử làm việc thành các **sự kiện có ý nghĩa đánh giá**”

Ví dụ mỗi record nên được chuẩn hóa thành dạng:

- thời điểm
- bối cảnh
- loại hoạt động
- vai trò của người đó
- mức độ ảnh hưởng
- tín hiệu kỹ năng liên quan
- evidence reference

Tức là bạn đang chuyển từ:
**raw history** → **behavioral events**

Khi đó:

- phân tích nhanh hơn,
- explainable hơn,
- lưu lâu hơn,
- và dễ build milestone hơn.

Đây là hướng đúng.

---

# C3) Với time window lớn, dùng chiến lược 2 tầng

---

## Tầng A — Recent Deep Analysis

Cho khoảng gần:

- 3 tháng
- 6 tháng
- tối đa 1 năm

Ở đây bạn cho phép phân tích sâu hơn:

- pattern chi tiết,
- KPT,
- case-based feedback,
- competency detail

### Recommendation:

- **3 tháng** = tốt nhất cho fidelity
- **6 tháng** = practical sweet spot
- **1 năm** = vẫn được, nhưng phải summarize trước

---

## Tầng B — Long-term Milestone Compression

Cho dữ liệu 1–5 năm, bạn **không phân tích từng chi tiết nữa**.

Thay vào đó, bạn chỉ lưu:

- milestone,
- turning points,
- major wins,
- major failures,
- role shifts,
- learning moments,
- repeated themes.

### Đây là lý do:

Không ai cần một “phân tích vi mô 5 năm”.
Người ta cần:

> “5 năm qua, tôi đã trở thành người như thế nào?”

Đó là 2 bài toán khác nhau.

---

# D. “Phân tích real-time 6 tháng, 1 năm được không?”

### Câu trả lời thật:

**6 tháng: hợp lý**
**1 năm: được, nhưng không nên full-detail raw inference**

---

## Khuyến nghị thực tế

### Cho 0–6 tháng:

- có thể phân tích tương đối chi tiết
- dùng cho competency / KPT / case feedback

### Cho 6–12 tháng:

- nên dùng summarize-first
- chỉ giữ:
  - repeated patterns,
  - strong evidence clusters,
  - notable cases,
  - milestone-worthy moments

Nếu cố “real-time full-depth” cho 1 năm raw history thì bạn sẽ gặp:

- chi phí tăng,
- noise tăng,
- hallucination tăng,
- confidence giả tăng.

Nói gọn:

> **1 năm thì nên là “analytical compression”, không phải “brute-force review”.**

---

# E. Development Path nên làm thế nào?

Đây là phần rất mạnh nếu bạn làm đúng.

Nhưng sai lầm thường gặp là biến nó thành:

> “career ladder cứng”

Thay vào đó, nên làm theo kiểu:

## “Observed Growth Path”

Tức là hệ thống không nói:

> “Bạn là Senior 2”

Mà nói:

> “Trong năm qua, pattern của bạn đang nghiêng về hướng nào?”

Ví dụ:

- Reliable Executor
- Emerging Owner
- Quality Guardian
- System Thinker
- Cross-team Collaborator
- Technical Mentor
- Delivery Driver

Sau đó map từ:

- pattern 1 năm
- milestones nhiều năm
- competency strengths
- repeated improvement areas

→ để đưa ra:

### “Bạn đang ở đâu trên hành trình phát triển?”

và

### “Bước tiếp theo hợp lý nhất là gì?”

Đây là cách **ít toxic hơn**, **hữu ích hơn**, và **dễ chấp nhận hơn**.

---

# F. Tôi đề xuất thêm 3 thứ để sản phẩm mạnh hơn rất nhiều

---

## 1) “What the system cannot conclude” section

Mỗi profile nên có một box kiểu:

### “Not enough evidence yet for:”

- mentoring
- system design ownership
- security decision-making
- stakeholder communication

Cái này cực kỳ quan trọng để:

- tăng trust,
- giảm overclaim,
- và thể hiện maturity của sản phẩm.

---

## 2) “Fairness Notes” section

Ví dụ:

- limited opportunity in leadership contexts
- low exposure to production incidents
- mostly execution-focused assignment window

Cái này giúp manager hiểu:

> “Đây là profile theo exposure thực tế, không phải bản chất tuyệt đối của con người đó.”

---

## 3) “Delta from previous period”

Đừng chỉ nói profile hiện tại.

Hãy nói thêm:

- improved
- stable
- emerging
- declining
- insufficient comparison

Nếu không có “delta”, sản phẩm sẽ rất tĩnh.
Có “delta” thì nó mới thành **growth system** chứ không phải “evaluation dashboard”.

---

# Kết luận thẳng

Ý tưởng này **đủ tốt để thành một sản phẩm wedge rất mạnh** nếu bạn giữ 3 nguyên tắc:

### 1. Không cố “chấm điểm con người”

Mà hãy **mô tả pattern làm việc có bằng chứng**

### 2. Không cố “thông minh toàn năng”

Mà hãy **biết khi nào đủ dữ liệu và khi nào không**

### 3. Không chỉ “nói người này là ai”

Mà phải trả lời được:

> **“Người này nên phát triển tiếp như thế nào?”**

Đó mới là giá trị thật.
