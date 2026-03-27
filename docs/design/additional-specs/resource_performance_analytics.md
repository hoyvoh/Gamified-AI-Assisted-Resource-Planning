([Past chat][1])([Past chat][2])([Past chat][2])

Có — và nếu nói **theo hướng có cơ sở nghiên cứu + có thể biểu diễn thành radar chart**, thì giới nghiên cứu/đánh giá năng lực hiện nay **không dùng một “siêu mô hình duy nhất”** cho lập trình viên, mà thường **ghép nhiều lớp mô hình** lại:

1. **Psychometrics** (đo con người: tính cách, động lực, preference)
2. **Competency / proficiency frameworks** (đo năng lực nghề nghiệp & level)
3. **Soft-skill / teamwork frameworks**
4. **Performance / outcome analytics** (đo kết quả thực chiến)

Nếu mục tiêu của bạn là tạo **ma trận đánh giá developer có thể vẽ radar diagram**, thì đây là hướng tốt nhất: **không lấy 1 framework duy nhất**, mà build một **composite model** gồm 5 “vành” đánh giá.

---

# 1) Các mô hình khoa học / thực hành đáng dùng nhất

## A. **Big Five / Five-Factor Model (FFM)** — cho **tính cách**

Đây là mô hình có nền tảng tâm lý học mạnh nhất để đo personality trong môi trường làm việc. Trong nghiên cứu về software engineering, Big Five thường được dùng để liên hệ với **work preference**, cách làm việc nhóm, kiểu môi trường phù hợp, và đôi khi cả performance. Các nghiên cứu cũng cho thấy ở bối cảnh digital work / workplace, một số trait như **Conscientiousness** thường có liên hệ đáng kể với hiệu quả công việc, còn các trait khác phụ thuộc ngữ cảnh công việc và vai trò. ([ScienceDirect][3])

### Radar-friendly axes:

- **Openness** → thiên về sáng tạo, research, thử cái mới
- **Conscientiousness** → kỷ luật, reliability, follow-through
- **Extraversion** → thiên về trao đổi, leading, external communication
- **Agreeableness** → hợp tác, hòa hợp, empathy
- **Emotional Stability** _(đảo từ Neuroticism)_ → chịu áp lực, ổn định cảm xúc

### Dùng để trả lời:

- Người này hợp **R&D / platform / product / delivery / leadership** kiểu gì?
- Người này có xu hướng **deep work**, **collaboration**, hay **chaotic exploration**?

### Lưu ý phản biện:

- **Big Five không nên dùng để “chấm tốt/xấu” developer**.
- Nó chỉ nên dùng như **fit indicator** chứ không phải **performance score**.

👉 Nếu bạn cần “tính cách” để lên radar, **Big Five là lựa chọn khoa học hơn MBTI**.

---

## B. **Work Preference / Developer Preference Models** — cho **preference**

Trong SE research, người ta không chỉ đo tính cách, mà còn đo **work preference**: thích task kiểu nào, môi trường nào, mức độ thích cấu trúc vs khám phá, cá nhân vs teamwork. Có nghiên cứu chỉ ra mối liên hệ giữa personality, emotional intelligence và **software engineering work preferences**. ([ScienceDirect][3])

### Bạn có thể mô hình hóa thành các trục:

- **Structured ↔ Exploratory**
- **Solo Work ↔ Collaborative Work**
- **Depth ↔ Variety**
- **Execution ↔ Innovation**
- **Stability ↔ Fast-paced Change**

### Đây là lớp rất quan trọng

Vì nhiều người **skill cao nhưng “sai môi trường”** nên hiệu suất tụt mạnh.
Ví dụ:

- người thiên **exploratory + depth** hợp R&D / prototyping
- người thiên **structured + execution** hợp delivery / backend / enterprise systems
- người thiên **collaborative + variety** hợp solution engineer / tech lead / cross-functional roles

👉 Đây là phần **“preference”** bạn yêu cầu — nhưng nên xem nó là **behavioral work style**, không phải personality thuần.

---

## C. **Dreyfus Model of Skill Acquisition** — cho **level / độ trưởng thành kỹ năng**

Đây là một trong những mô hình nổi tiếng nhất để mô tả **mức độ thành thạo**: từ làm theo rule → biết xử lý tình huống → làm chủ ngữ cảnh. Nhiều engineering competency frameworks ngoài đời dùng tinh thần của Dreyfus để mô tả level như novice / competent / proficient / expert. Một số competency matrix hiện đại cho engineering review cũng nêu rõ họ lấy cảm hứng từ Dreyfus model. ([Blik360][4])

### Radar-friendly cách dùng:

Thay vì radar là “Big Five”, bạn có thể có một radar khác cho **maturity by competency**:

- **Coding / Implementation**
- **System Design**
- **Debugging / Incident Handling**
- **Testing / Quality**
- **Architecture / Tradeoff Thinking**
- **Security / Reliability**
- **Product / Business Thinking**
- **Mentoring / Review**

Mỗi trục chấm theo level:

- 1 = Novice
- 2 = Advanced Beginner
- 3 = Competent
- 4 = Proficient
- 5 = Expert

👉 Đây là **khung tốt nhất để đo “skillset/level”**.

---

## D. **SFIA / Competency Matrix / Role-based competency frameworks** — cho **kỹ năng nghề nghiệp có cấu trúc**

Nếu Dreyfus trả lời **“giỏi đến mức nào”**, thì SFIA / competency matrix trả lời **“giỏi ở những mảng nào”**.

Trong industry, các team engineering thường dùng **competency matrix** để mô tả:

- technical depth
- breadth
- communication
- mentoring
- ownership
- delivery
- product thinking
- strategic impact

Các framework competency matrix gần đây cho engineering cũng khuyến nghị chia kỹ năng theo **hard skills + behavior + impact**, và thường được trực quan hóa bằng **radar chart** cho 360 feedback hoặc performance review. ([Blik360][4])

### Radar-friendly axes gợi ý:

- **Technical Depth**
- **Technical Breadth**
- **Code Quality**
- **System Thinking**
- **Execution / Delivery**
- **Ownership**
- **Communication**
- **Mentorship / Team Lift**
- **Product Sense**
- **Learning Agility**

👉 Nếu bạn đang build **ma trận đánh giá lập trình viên dùng cho quản lý / staffing / career growth**, đây là **lớp xương sống**.

---

## E. **T-Shaped Skill Model** — cho **breadth vs specialization**

Đây không phải psychometric model, nhưng là mô hình rất hữu ích để biểu diễn **profile kỹ năng của developer**:
một người có:

- **1–2 trục cực mạnh** (vertical depth)
- và **nhiều trục biết đủ để phối hợp** (horizontal breadth)

T-shaped skill là một cách cực tốt để giải thích:

- vì sao một người backend mạnh vẫn hữu dụng ở cross-functional team
- vì sao một người “generalist” chưa chắc thay được specialist
- vì sao staffing dự án cần nhìn **shape**, không chỉ nhìn average score ([Alci.dev][5])

### Radar-friendly biểu diễn:

Radar rất hợp với T-shaped:

- trục nào nhô cao = specialty
- vòng còn lại = collaboration breadth

👉 Đây là mô hình **rất hợp để vẽ radar**.

---

## F. **Soft Skills in Software Engineering** — cho **soft skills nói chung**

Trong nghiên cứu SE, soft skills được xem là một mảng bị đánh giá thiếu nhưng cực quan trọng: giao tiếp, teamwork, coordination, problem framing, leadership, conflict handling, feedback, adaptability. Một số bài tổng quan còn gọi đây là “missing link” của software engineering. ([arXiv][6])

### Radar-friendly axes:

- **Communication Clarity**
- **Collaboration**
- **Feedback Receptiveness**
- **Conflict Navigation**
- **Stakeholder Handling**
- **Mentorship**
- **Initiative**
- **Adaptability**

👉 Nếu bạn muốn đánh giá “developer chứ không chỉ coder”, phần này là **bắt buộc**.

---

## G. **Performance Analytics Models** — cho **kết quả thực chiến**

Đây là chỗ nhiều hệ thống đánh giá bị sai.

Trong nghiên cứu quản trị nhân sự / digital work, performance thường được xem là **đa chiều**, không chỉ là “code nhiều”. Nói cách khác: **không nên đồng nhất skill với performance**. Personality, work style, context, role, team setup đều có thể ảnh hưởng performance. ([Taylor & Francis Online][7])

### Performance nên tách thành 4 nhóm:

#### 1. **Delivery**

- velocity / throughput
- on-time completion
- task completion reliability

#### 2. **Quality**

- defect rate
- rework rate
- escaped bugs
- code review rejection patterns

#### 3. **Operational Reliability**

- incident involvement
- rollback / hotfix frequency
- production stability contribution

#### 4. **Team / Organizational Impact**

- unblock others
- review contribution
- documentation
- mentoring effect
- project lift

👉 Đây là phần bạn gọi là **performance analytics** — và nên là **“outcome radar” riêng**, không trộn với personality.

---

# 2) Nếu gom lại: bộ mô hình nào là “đủ đẹp + đủ khoa học” nhất?

Nếu bạn thật sự muốn xây **ma trận đánh giá developer có thể phân tích và vẽ radar**, thì mình khuyên dùng **5-layer composite model** này:

---

# 3) Mô hình đề xuất tốt nhất cho bạn: **Developer 360 Composite Assessment**

## Layer 1 — **Personality / Disposition**

Dùng:

- **Big Five**

Radar:

- Openness
- Conscientiousness
- Extraversion
- Agreeableness
- Emotional Stability

**Mục tiêu**: hiểu “kiểu người”
**Không dùng để phán performance**

---

## Layer 2 — **Work Preference / Environment Fit**

Dùng:

- work preference survey dựa trên SE research

Radar:

- Structure Preference
- Autonomy Preference
- Collaboration Preference
- Exploration Preference
- Change Tolerance
- Ambiguity Tolerance

**Mục tiêu**: biết người này hợp môi trường / task / team nào

---

## Layer 3 — **Competency / Skill Maturity**

Dùng:

- **Dreyfus + Competency Matrix**

Radar:

- Coding
- System Design
- Debugging
- Testing / QA
- DevOps / Delivery
- Security / Reliability
- Data / Domain Knowledge
- Architecture Thinking

Chấm theo 1–5:

- Novice → Expert

**Mục tiêu**: biết “người này mạnh cái gì, yếu cái gì, đang ở level nào”

---

## Layer 4 — **Soft Skills / Team Effectiveness**

Dùng:

- soft-skill competency framework cho SE

Radar:

- Communication
- Collaboration
- Ownership
- Feedback
- Mentorship
- Stakeholder Management
- Problem Framing
- Adaptability

**Mục tiêu**: đo khả năng “làm việc cùng người khác và làm việc ở scope lớn hơn bản thân”

---

## Layer 5 — **Performance / Impact**

Dùng:

- behavioral + outcome metrics

Radar:

- Delivery Reliability
- Code Quality
- Operational Stability
- Review Contribution
- Knowledge Sharing
- Initiative / Proactiveness
- Business Impact
- Growth Trajectory

**Mục tiêu**: đo “đóng góp thật”

---

# 4) Cách biểu diễn radar diagram sao cho không bị “rác khoa học”

Sai lầm phổ biến là nhét hết vào **1 radar duy nhất**.
Cái đó **đẹp nhưng sai mô hình**.

## Đúng hơn là dùng **4–5 radar tách biệt**

Ví dụ dashboard của 1 developer sẽ có:

### Radar A — **Disposition**

(tính cách + preference)

### Radar B — **Technical Capability**

(skill + maturity)

### Radar C — **Soft Skills**

(team effectiveness)

### Radar D — **Impact**

(performance / outcome)

### Radar E — **Growth Potential**

(nếu muốn tách riêng)

Cách này tốt hơn vì:

- không trộn **trait** với **behavior**
- không trộn **ability** với **result**
- dễ dùng cho **staffing / coaching / promotion**

---

# 5) Nếu bạn muốn “nghiên cứu tử tế” hơn nữa: đây là mapping rất ổn

## A. **Trait** (cái người đó có xu hướng mang theo)

- Big Five
- Emotional Intelligence (nếu muốn bổ sung)

## B. **Preference** (cách họ thích làm việc)

- solo/team
- stable/change
- depth/breadth
- structure/ambiguity

## C. **Capability** (họ làm được gì)

- hard skill
- soft skill
- domain skill

## D. **Behavior** (họ hành xử ra sao trong công việc)

- ownership
- review habit
- collaboration
- documentation
- escalation behavior

## E. **Outcome** (kết quả tạo ra)

- quality
- speed
- reliability
- impact

👉 Đây là cách **chuẩn nhất về mặt tư duy đo lường**.

---

# 6) Nếu bạn đang build hệ thống thật, đây là bộ score mình khuyên dùng

## Score groups (100 điểm tổng)

### 1. **Personality & Work Style** — 15%

- Big Five derived
- work preference fit

### 2. **Technical Competency** — 30%

- coding
- debugging
- system design
- tooling
- architecture

### 3. **Soft Skills & Teamwork** — 20%

- communication
- collaboration
- ownership
- mentoring

### 4. **Performance Analytics** — 25%

- delivery
- quality
- reliability
- impact

### 5. **Growth / Learning Potential** — 10%

- adaptability
- feedback uptake
- learning velocity

### Vì sao weighting này hợp lý?

Vì nếu bạn để:

- personality quá nặng → thành **psychology cosplay**
- performance quá nặng → thành **metric theater**
- skill quá nặng → thành **“code giỏi là đủ” bias**

---

# 7) Mô hình nào nên tránh hoặc dùng cẩn thận?

## A. **MBTI**

Có thể dùng để:

- self-reflection
- team workshop
- icebreaker

Nhưng **không nên dùng làm nền đánh giá khoa học** cho tuyển dụng / performance / staffing.

## B. **Chỉ dùng Git metrics**

Ví dụ:

- số commit
- số PR
- số dòng code

→ đây là **proxy cực nguy hiểm**
Vì người giỏi hơn đôi khi:

- code ít hơn
- xóa nhiều hơn
- unblock team nhiều hơn

## C. **Chỉ dùng manager rating**

→ bias rất nặng:

- halo effect
- recency bias
- likeability bias
- visibility bias

👉 Tốt nhất là **self + peer + lead + system metrics + artifact evidence**

---

# 8) Kết luận ngắn gọn: nếu bạn hỏi “mô hình nào là tốt nhất?”

## Nếu chỉ chọn **1 bộ khung**

Chọn:

### **Competency Matrix + Dreyfus**

Vì nó dễ áp dụng nhất cho engineering.

## Nếu muốn **đúng nghiên cứu + đúng thực tế**

Chọn:

### **Big Five + Work Preference + Competency Matrix + Soft Skills + Performance Analytics**

Đó là tổ hợp **đủ mạnh để vẽ radar, staffing, growth plan, và đánh giá developer tương đối nghiêm túc**.

---

# 9) Gợi ý rất thực dụng cho bài toán của bạn

Nếu bạn đang nghĩ tới một hệ thống kiểu:

> “đánh giá con người để phân bổ vào task / project / room / team / training / resource planning”

thì bạn **không nên chỉ build “developer score”**.

Bạn nên build:

## **Developer Capability Profile**

gồm 5 phần:

- **Who they are** (personality)
- **How they like to work** (preference)
- **What they can do** (skills)
- **How they behave in teams** (soft skills)
- **What outcomes they produce** (performance)

Đó mới là thứ **dùng được trong thực tế**.

---

Nếu muốn, tôi có thể làm tiếp cho bạn một bản **“Developer Evaluation Matrix v1” hoàn chỉnh** theo đúng nhu cầu của bạn, gồm:

- **danh sách tất cả các trục radar**
- **cách chấm điểm 1–5 hoặc 1–10**
- **cách mapping từ survey / hành vi / performance data**
- **JSON schema / DB schema**
- và cả **mẫu radar dashboard UI** cho hệ thống của bạn.

[1]: https://chatgpt.com/c/69b60009-a138-8398-982e-f039757b6104 "Best Practices for SWE"
[2]: https://chatgpt.com/c/69a23acc-160c-8398-9972-61abebfb1e02 "Paper Publication Announcement"
[3]: https://www.sciencedirect.com/science/article/pii/S0950584914000639?utm_source=chatgpt.com "Personality, emotional intelligence and work preferences in software engineering: An empirical study - ScienceDirect"
[4]: https://www.blik360.com/dreyfus-model/?utm_source=chatgpt.com "Developer Competency Framework: Dreyfus Model for Performance Reviews | Blik"
[5]: https://www.alci.dev/en/que-es/t-shaped?utm_source=chatgpt.com "What are T-Shaped Skills? Definition & examples | Alci.dev"
[6]: https://arxiv.org/abs/1901.01819?utm_source=chatgpt.com "A Call to Promote Soft Skills in Software Engineering"

## [7]: https://www.tandfonline.com/doi/full/10.1080/08874417.2023.2255551?utm_source=chatgpt.com "Full article: Job Performance in Digital Work: Do Personality Traits Matter?"

Chuẩn, nếu mục tiêu của bạn là **đọc paper thật để thiết kế một ma trận đánh giá dev có cơ sở**, thì nên bắt đầu từ **open access / arXiv / PMC / MDPI / institutional open repositories** trước.

Tôi đã lọc cho bạn theo đúng 5 nhu cầu bạn nói:

- **tính cách**
- **preference**
- **skill / level / competency**
- **soft skills**
- **performance analytics**

Tôi cũng sẽ nói thẳng luôn:
**không có một paper duy nhất cover full tất cả**. Bạn sẽ phải **ghép 6–10 paper thành một composite framework**.

---

# Bộ paper nên đọc trước (ưu tiên cao nhất)

## 1) **Personality + Work Preference trong Software Engineering**

### **Personality, emotional intelligence and work preferences in software engineering: An empirical study**

- **Loại:** empirical study
- **Nguồn:** Information and Software Technology
- **Open-ish / accessible abstract + repository pages**
- **Link:** [Open paper page](https://www.sciencedirect.com/science/article/pii/S0950584914000639?utm_source=chatgpt.com)
- **Repository mirror:** [Chalmers repository page](https://research.chalmers.se/en/publication/200372?utm_source=chatgpt.com)

### Vì sao đáng đọc:

Đây là một trong những paper **sát nhất với bài toán của bạn**. Nó nối:

- **Big Five**
- **Emotional Intelligence**
- **Work Preferences**

với bối cảnh **software engineers**.
Paper này hữu ích để bạn dựng các radar kiểu:

- Openness
- Conscientiousness
- Team preference
- Structured vs exploratory work
- Emotional regulation

### Bạn nên rút ra từ paper này:

- **Trait nào nên giữ làm axis**
- **Trait nào chỉ nên dùng để “fit” chứ không dùng để “judge”**
- Cách liên hệ giữa **personality ↔ task preference**

([ScienceDirect][1])

---

## 2) **Tổng quan 40 năm về Personality trong Software Engineering**

### **Forty years of research on personality in software engineering: A mapping study**

- **Loại:** systematic mapping study
- **Nguồn:** Computers in Human Behavior
- **Link:** [Paper page](https://www.sciencedirect.com/science/article/pii/S0747563214007237?utm_source=chatgpt.com)

### Vì sao đáng đọc:

Nếu bạn muốn **đỡ bị “ảo tưởng mô hình”**, paper này rất quan trọng.
Nó cho thấy:

- research về personality trong SE đã có từ lâu,
- nhưng **kết quả vẫn chưa hoàn toàn thống nhất**,
- và việc dùng personality để dự đoán performance là **rất nhạy cảm**.

### Giá trị thực tế:

Paper này giúp bạn **đặt ranh giới đúng**:

- dùng personality cho **profiling / team fit / preference**
- **không dùng nó làm performance score trực tiếp**

👉 Đây là paper giúp framework của bạn **đỡ “pseudo-science”** nhất. ([ScienceDirect][2])

---

## 3) **Phân tích personality của developer trong hệ sinh thái open source (arXiv)**

### **A large-scale, in-depth analysis of developers' personalities in the Apache ecosystem**

- **Loại:** arXiv
- **Link:** [arXiv paper](https://arxiv.org/abs/1905.13062?utm_source=chatgpt.com)

### Vì sao đáng đọc:

Paper này rất hợp nếu bạn muốn nối từ:

- **psychometrics**
- sang **developer behavior thực tế**

Nó khai thác personality ở quy mô lớn trong hệ sinh thái Apache và cho thấy:

- có những **profile personality lặp lại**
- personality có liên hệ nhất định với **khả năng trở thành contributor**

### Hữu ích cho bạn ở đâu:

Bạn đang nghĩ tới một hệ thống kiểu:

> “ai phù hợp task nào / team nào / role nào”

Thì paper này là cầu nối giữa:

- **trait**
- và **engineering participation / contribution behavior**

([arXiv][3])

---

## 4) **Bản arXiv trước đó của cùng hướng nghiên cứu**

### **On Developers' Personality in Large-scale Distributed Projects: The Case of the Apache Ecosystem**

- **Loại:** arXiv
- **Link:** [arXiv paper](https://arxiv.org/abs/1803.01126?utm_source=chatgpt.com)

### Vì sao vẫn nên đọc:

Nó là một version / line nghiên cứu liên quan, rất đáng để xem:

- họ operationalize personality như thế nào,
- dùng data nào,
- và đâu là giới hạn khi suy luận từ dữ liệu dev activity sang human traits.

👉 Nếu bạn định sau này làm hệ thống “AI profile from work traces”, paper này rất đáng bookmark. ([arXiv][4])

---

# Nhóm paper cho **Soft Skills**

## 5) **Skills development for software engineers: Systematic literature review**

- **Loại:** systematic literature review
- **Năm:** 2024
- **Link:** [Paper page](https://www.sciencedirect.com/science/article/pii/S0950584923002501?utm_source=chatgpt.com)

### Vì sao cực đáng đọc:

Đây là paper **mới** và khá thực dụng. Nó tổng hợp:

- các **soft skills quan trọng**
- cách chúng được **group**
- và cách chúng được **phát triển / đánh giá**

Paper này còn đề xuất framework **FraSSD** cho phát triển soft skills trong software engineering education.

### Bạn nên lấy gì từ paper này:

Các nhóm axis cực hợp để đưa vào radar:

- Communication
- Teamwork
- Critical Thinking
- Leadership
- Initiative
- Problem-solving

👉 Nếu bạn chỉ muốn 1 paper để bắt đầu dựng **soft-skill radar**, thì **đọc paper này trước tiên**. ([ScienceDirect][5])

---

## 6) **A Systematic Mapping Study on Soft Skills in Software Engineering**

- **Loại:** systematic mapping study
- **Open PDF / repository-hosted mirror**
- **Link:** [Paper page / PDF mirror](https://www.researchgate.net/publication/333431653_A_Systematic_Mapping_Study_on_Soft_Skills_in_Software_Engineering?utm_source=chatgpt.com)

### Vì sao đáng đọc:

Paper này tổng hợp **30 nhóm soft skills** trong software engineering.
Nó cho thấy các soft skill xuất hiện lặp đi lặp lại nhất là:

- communication
- teamwork
- analytical skills
- organizational skills
- interpersonal skills

### Giá trị cho bạn:

Nó rất phù hợp để bạn:

- gom soft skills thành **5–8 trục radar sạch**
- tránh việc nhét quá nhiều “skill vụn” vào dashboard

([ResearchGate][6])

---

## 7) **Software Engineering Education Beyond the Technical: A Systematic Literature Review**

- **Loại:** arXiv
- **Link:** [arXiv paper](https://arxiv.org/abs/1910.09865?utm_source=chatgpt.com)

### Vì sao nên đọc:

Paper này tập trung vào **non-technical abilities** của software engineer, và chỉ ra các kỹ năng thường bị xem nhẹ như:

- self-reflection
- conflict resolution
- communication
- teamwork

### Điểm hay:

Nếu bạn muốn hệ thống đánh giá dev của mình không bị “cứng kỹ thuật quá”, paper này là một bổ sung rất tốt.

([arXiv][7])

---

# Nhóm paper cho **Performance Analytics / Developer Metrics**

## 8) **New Developer Metrics for Open Source Software Development Challenges: An Empirical Study of Project Recommendation Systems**

- **Loại:** open access (MDPI)
- **Link:** [MDPI open-access paper](https://www.mdpi.com/2076-3417/11/3/920?utm_source=chatgpt.com)

### Vì sao đáng đọc:

Paper này rất hữu ích nếu bạn muốn lấy **engineering activity data** để xây dựng phần **performance / behavior analytics**.

Nó nói về các metric có thể khai thác từ:

- commits
- issues
- PRs
- contribution traces

### Giá trị cho framework của bạn:

Bạn có thể dùng nó để nghĩ ra các trục như:

- Contribution Consistency
- Review Participation
- Delivery Activity
- Collaboration Signals
- OSS-style engagement proxies

⚠️ Nhưng phải rất cẩn thận:
**activity ≠ capability ≠ impact**

👉 Paper này tốt để lấy **candidate metrics**, chứ không nên copy nguyên làm performance model. ([MDPI][8])

---

## 9) **Evaluating the Impact of Developer Experience on Code Quality: A Systematic Literature Review**

- **Loại:** open conference proceedings
- **Link:** [Open proceedings paper](https://sol.sbc.org.br/index.php/cibse/article/view/28446?utm_source=chatgpt.com)

### Vì sao đáng đọc:

Nó trả lời một câu cực quan trọng:

> “người nhiều kinh nghiệm hơn có thực sự code tốt hơn không?”

Và câu trả lời học thuật là:

> **không đơn giản vậy**.

### Vì sao điều này quan trọng với bạn:

Nếu bạn build hệ thống đánh giá dev, bạn phải tránh bẫy:

- “nhiều năm kinh nghiệm = giỏi hơn”
- “nhiều commit = giỏi hơn”
- “senior = code quality cao hơn”

Paper này giúp bạn thiết kế model **ít bias hơn**.

([sol.sbc.org.br][9])

---

## 10) **Systematic Review of Key Performance Metrics in Modern DevOps and Software Reliability Engineering**

- **Loại:** PDF-available review
- **Link:** [Paper page / PDF mirror](https://www.researchgate.net/publication/393050583_Systematic_Review_of_Key_Performance_Metrics_in_Modern_DevOps_and_Software_Reliability_Engineering?utm_source=chatgpt.com)

### Vì sao nên đọc:

Nếu bạn muốn đưa phần **performance analytics** vào framework một cách “engineering hơn”, paper này rất đáng đọc vì nó nghiêng về:

- delivery metrics
- reliability metrics
- operational effectiveness
- SRE / DevOps style performance

### Hữu ích để dựng radar:

Bạn có thể rút ra các nhóm:

- Delivery Reliability
- Operational Stability
- Incident Recovery
- Deployment Quality
- Continuous Improvement

👉 Đây là paper tốt nếu bạn muốn framework của mình **không chỉ HR-ish**, mà có cả **engineering operations realism**. ([ResearchGate][10])

---

# Nhóm paper cho **task fit / risk / engineering behavior**

## 11) **The Type to Take Out a Loan? A Study of Developer Personality and Technical Debt**

- **Loại:** arXiv
- **Link:** [arXiv paper](https://arxiv.org/abs/2303.02244?utm_source=chatgpt.com)

### Vì sao rất đáng đọc:

Paper này khá thú vị vì nó nối:

- **developer personality**
- với **technical debt behavior**

Nói cách khác, nó giúp bạn nghĩ theo hướng:

> “một số trait có thể liên quan đến khuynh hướng engineering decision nào?”

### Vì sao quan trọng:

Nếu sau này bạn muốn framework đánh giá không chỉ là “người này giỏi hay không”, mà là:

- có thiên hướng **ship nhanh vs cẩn trọng**
- có xu hướng **tạo debt / cleanup / preventive thinking**

thì paper này là một hướng cực hay.

([arXiv][11])

---

# Nhóm bổ trợ (đọc nếu muốn framework “đỡ mỏng”)

## 12) **The well-being of software engineers: a systematic literature review and a theory**

- **Loại:** open access
- **Link:** [Paper page](https://link.springer.com/article/10.1007/s10664-024-10543-8?utm_source=chatgpt.com)

### Vì sao nên đọc:

Không trực tiếp là competency model, nhưng cực kỳ quan trọng nếu bạn không muốn framework đánh giá dev trở thành **máy nghiền người**.

### Vì sao đáng để đưa vào thiết kế:

Well-being ảnh hưởng mạnh đến:

- sustained performance
- burnout risk
- team contribution consistency
- learning velocity

👉 Nếu hệ thống của bạn có ý định hỗ trợ **resource planning / staffing / sustainable performance**, paper này nên được đưa vào phần “ethical design”. ([Springer][12])

---

# Nếu bạn chỉ có thời gian đọc **5 bài đầu tiên**

Tôi khuyên đọc theo đúng thứ tự này:

## **Top 5 bắt buộc**

1. **Personality, emotional intelligence and work preferences in software engineering**
   → cho **personality + preference**
   ([ScienceDirect][1])

2. **Forty years of research on personality in software engineering**
   → cho **bức tranh tổng quan + phản biện mô hình**
   ([ScienceDirect][2])

3. **Skills development for software engineers: Systematic literature review**
   → cho **soft skills framework**
   ([ScienceDirect][5])

4. **A Systematic Mapping Study on Soft Skills in Software Engineering**
   → cho **taxonomy các soft skills**
   ([ResearchGate][6])

5. **New Developer Metrics for Open Source Software Development Challenges**
   → cho **performance / activity metrics**
   ([MDPI][8])

---

# Mapping rất thực dụng: paper nào dùng cho phần nào của radar?

## 1. **Personality Radar**

Dùng từ:

- turn0search1
- turn0search15
- turn0academia45
- turn0academia46
- turn0academia47

### Trục nên dùng:

- Openness
- Conscientiousness
- Agreeableness
- Emotional Stability
- Social Orientation

---

## 2. **Preference Radar**

Dùng từ:

- turn0search1
- turn0academia48

### Trục nên dùng:

- Structured vs Exploratory
- Solo vs Collaborative
- Stability vs Change
- Execution vs Innovation
- Ambiguity Tolerance

---

## 3. **Technical / Competency Radar**

Các paper ở trên **không đủ mạnh riêng cho technical competency matrix** theo kiểu engineering ladder.
Chúng hỗ trợ phần human factors nhiều hơn.

### Thành thật mà nói:

Nếu bạn muốn phần **skill/level** thật mạnh, bạn sẽ phải kết hợp thêm:

- **industry competency frameworks**
- hoặc paper về **developer expertise / skill acquisition / engineering ladders**

Hiện đống paper tôi tìm được ở lượt này **mạnh ở psychometrics và soft/performance**, chưa phải best batch cho “competency ladder”.

👉 Nếu bạn muốn, tôi có thể làm **vòng 2 chỉ riêng cho:**

> “open access papers về developer expertise, competency models, skill acquisition, engineering ladders, team role modeling”

và lọc riêng ra một bộ paper phục vụ **skillset/level radar**.

---

## 4. **Soft Skill Radar**

Dùng từ:

- turn0search0
- turn0search3
- turn0academia48
- turn0search9
- turn0search11

### Trục nên dùng:

- Communication
- Collaboration
- Problem Solving
- Leadership / Initiative
- Conflict Handling
- Feedback Receptiveness
- Organization
- Adaptability

---

## 5. **Performance Radar**

Dùng từ:

- turn0search2
- turn0search7
- turn0search10
- turn0search6

### Trục nên dùng:

- Delivery Reliability
- Code Quality
- Operational Stability
- Review Contribution
- Knowledge Sharing
- Sustainable Performance
- Growth Trend

---

# Bộ “đọc xong là build được framework bản đầu”

Nếu tôi phải gói cho bạn một reading pack tối giản để bạn **đọc xong rồi bắt tay thiết kế schema luôn**, tôi sẽ chọn:

### **Pack A — Human Profile**

- Personality, emotional intelligence and work preferences in software engineering
- Forty years of research on personality in software engineering
- A large-scale, in-depth analysis of developers' personalities in the Apache ecosystem

### **Pack B — Team & Soft Skills**

- Skills development for software engineers: Systematic literature review
- A Systematic Mapping Study on Soft Skills in Software Engineering
- Software Engineering Education Beyond the Technical

### **Pack C — Performance / Evidence**

- New Developer Metrics for Open Source Software Development Challenges
- Evaluating the Impact of Developer Experience on Code Quality
- Systematic Review of Key Performance Metrics in Modern DevOps and SRE

---

# Kết luận thẳng

Nếu bạn đang build một hệ thống đánh giá dev mà muốn **có vẻ học thuật nhưng không bị giả khoa học**, thì:

- **đừng dùng MBTI làm xương sống**
- **đừng dùng commit count làm performance**
- **đừng trộn personality với competency**
- **đừng lấy 1 paper duy nhất rồi “suy diễn toàn bộ con người”**

Cách đúng là:

## **ghép 4 lớp**

- **Trait**
- **Preference**
- **Capability**
- **Outcome**

và những paper ở trên đủ để bạn dựng được 3 lớp đầu khá tốt, còn lớp **Capability/Skill maturity** thì nên làm một vòng search riêng.

---

Nếu muốn, tôi có thể làm tiếp ngay cho bạn một trong 2 hướng:

### Hướng A — **lọc tiếp 10–15 paper chỉ riêng cho competency / expertise / skill level**

để hoàn thiện phần **skillset/level radar**

**hoặc**

### Hướng B — từ chính bộ paper này, tôi sẽ:

- trích xuất các dimension
- gom thành **1 ma trận đánh giá developer hoàn chỉnh**
- và thiết kế luôn cho bạn:
  - **radar axes**
  - **score rubric 1–5**
  - **survey questions**
  - **behavioral evidence mapping**
  - **DB schema JSON**

Nếu làm hướng B thì nó sẽ ra thứ bạn có thể **đem build thành sản phẩm luôn**.

[1]: https://www.sciencedirect.com/science/article/pii/S0950584914000639?utm_source=chatgpt.com "Personality, emotional intelligence and work preferences in software engineering: An empirical study - ScienceDirect"
[2]: https://www.sciencedirect.com/science/article/pii/S0747563214007237?utm_source=chatgpt.com "Forty years of research on personality in software engineering: A mapping study - ScienceDirect"
[3]: https://arxiv.org/abs/1905.13062?utm_source=chatgpt.com "A large-scale, in-depth analysis of developers' personalities in the Apache ecosystem"
[4]: https://arxiv.org/abs/1803.01126?utm_source=chatgpt.com "On Developers' Personality in Large-scale Distributed Projects: The Case of the Apache Ecosystem"
[5]: https://www.sciencedirect.com/science/article/pii/S0950584923002501?utm_source=chatgpt.com "Skills development for software engineers: Systematic literature review - ScienceDirect"
[6]: https://www.researchgate.net/publication/333431653_A_Systematic_Mapping_Study_on_Soft_Skills_in_Software_Engineering?utm_source=chatgpt.com "(PDF) A Systematic Mapping Study on Soft Skills in Software Engineering"
[7]: https://arxiv.org/abs/1910.09865?utm_source=chatgpt.com "Software Engineering Education Beyond the Technical: A Systematic Literature Review"
[8]: https://www.mdpi.com/2076-3417/11/3/920?utm_source=chatgpt.com "New Developer Metrics for Open Source Software Development Challenges: An Empirical Study of Project Recommendation Systems | MDPI"
[9]: https://sol.sbc.org.br/index.php/cibse/article/view/28446?utm_source=chatgpt.com "Evaluating the Impact of Developer Experience on Code Quality: A Systematic Literature Review | Anais do Congresso Ibero-Americano em Engenharia de Software (CIbSE)"
[10]: https://www.researchgate.net/publication/393050583_Systematic_Review_of_Key_Performance_Metrics_in_Modern_DevOps_and_Software_Reliability_Engineering?utm_source=chatgpt.com "(PDF) Systematic Review of Key Performance Metrics in Modern DevOps and Software Reliability Engineering"
[11]: https://arxiv.org/abs/2303.02244?utm_source=chatgpt.com "The Type to Take Out a Loan? A Study of Developer Personality and Technical Debt"
[12]: https://link.springer.com/article/10.1007/s10664-024-10543-8?utm_source=chatgpt.com "The well-being of software engineers: a systematic literature review and a theory | Empirical Software Engineering | Springer Nature Link"
