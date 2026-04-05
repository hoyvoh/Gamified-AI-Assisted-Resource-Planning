# DEVELOPER PROFILING

# Skill Taxonomy + Mapping Table

### Version 1.0

---

# 1. CÁCH DÙNG BẢNG NÀY

Mỗi dimension sẽ có:

- **Dimension**
- **What it means**
- **Positive indicators**
- **Negative indicators**
- **Possible evidence patterns**
- **Confidence boosters**
- **Confidence reducers**
- **Common false inference risks**
- **Suggested output language**

---

# 2. SCALE INTERPRETATION GỢI Ý

Bạn có thể dùng bảng này để suy ra 5-level maturity:

1. **Emerging**
2. **Developing**
3. **Reliable**
4. **Strong**
5. **Advanced**

Hoặc nếu thiếu evidence:

- **Insufficient Evidence**
- **Insufficient Opportunity**

---

# 3. TAXONOMY TABLE

---

# GROUP A — CORE TECHNICAL EXECUTION

---

## A1. Implementation Reliability

### What it means

Khả năng thực hiện công việc kỹ thuật một cách ổn định, đúng hướng, ít trật mục tiêu và có khả năng đi đến hoàn thành.

### Positive indicators

- Hoàn thành task kỹ thuật đúng scope
- Output usable, ít cần sửa lại từ nền
- Follow-through tốt đến done
- Giữ được tiến độ kỹ thuật hợp lý
- Ít bị “drop” giữa chừng

### Negative indicators

- Output thường incomplete
- Hay bỏ dở context hoặc cần nhắc mới tiếp tục
- Hiểu sai yêu cầu kỹ thuật lặp lại
- Rework nhiều vì lỗi implementation nền tảng
- Thường giao cái “gần xong” nhưng chưa thật sự xong

### Possible evidence patterns

- Một task / deliverable đi từ nhận → clarify → complete
- Có bằng chứng về ownership và closure
- Review / discussion cho thấy ít correction vòng 2–3
- Có record hoàn tất các phần phụ cần thiết chứ không chỉ phần “chính”

### Confidence boosters

- Lặp lại trên nhiều task khác nhau
- Xuất hiện ở nhiều loại công việc khác nhau
- Có cả output + phản hồi + completion context
- Có bằng chứng không chỉ “được assign” mà còn “được hoàn tất tốt”

### Confidence reducers

- Chỉ có 1 task duy nhất
- Chỉ thấy “đã làm” nhưng không rõ chất lượng
- Task rất nhỏ / low-risk / không đại diện
- Có dấu hiệu thành công chủ yếu do người khác kéo hộ

### Common false inference risks

- Nhầm “nhiều task” với “reliable”
- Nhầm “có output” với “đi đến closure chất lượng”
- Nhầm “được giao nhiều” với “làm tốt”

### Suggested output language

- “Observed as a generally reliable implementer across multiple tasks”
- “Shows growing implementation reliability, though completion consistency still varies under ambiguity”

---

## A2. Code Quality Discipline

### What it means

Mức độ cẩn trọng và sạch sẽ trong output kỹ thuật.

### Positive indicators

- Ít lỗi dễ tránh
- Naming / structure / consistency hợp lý
- Có xu hướng tự chỉnh trước khi bị nhắc
- Output dễ đọc, dễ follow
- Có ý thức maintain baseline quality

### Negative indicators

- Lỗi cơ bản lặp lại
- Cẩu thả trong naming / structure / formatting / consistency
- Cần nhiều feedback cho cùng một loại hygiene issue
- Output “chạy được nhưng bừa”

### Possible evidence patterns

- Repeated correction for avoidable issues
- Review feedback xoay quanh consistency / cleanliness
- Output thể hiện structure rõ ràng và ít friction
- Có hành vi self-correction trước khi review

### Confidence boosters

- Nhiều evidence từ nhiều lần review / revision
- Lỗi hoặc điểm tốt lặp lại nhiều lần
- Có bằng chứng “trước vs sau” cho thấy discipline

### Confidence reducers

- Chỉ dựa trên 1 deliverable
- Chỉ có generic praise / criticism
- Không có đủ context để phân biệt cẩu thả với deadline pressure

### Common false inference risks

- Nhầm style preference với quality issue
- Phạt quá nặng một lần thiếu chỉnh chu do context
- Nhầm “code ngắn” với “code tốt”

### Suggested output language

- “Demonstrates generally solid output discipline with occasional avoidable hygiene issues”
- “Some repeated patterns suggest quality discipline is still becoming more consistent”

---

## A3. Debugging & Root Cause Thinking

### What it means

Khả năng xác định nguyên nhân gốc và giải quyết vấn đề có logic.

### Positive indicators

- Khoanh vùng vấn đề hợp lý
- Biết đặt giả thuyết
- Tách symptom khỏi root cause
- Giải thích được vì sao lỗi xảy ra
- Fix có logic thay vì mò

### Negative indicators

- Trial-and-error vô hướng
- Fix triệu chứng nhưng lỗi quay lại
- Thiếu framing vấn đề
- Không giải thích được nguyên nhân

### Possible evidence patterns

- Discussion về lỗi có reasoning rõ
- Có breakdown nguyên nhân / reproduction / narrowing
- Có mô tả why, not just what
- Có progression từ hypothesis → verification → fix

### Confidence boosters

- Xuất hiện ở nhiều bug / issue khác nhau
- Có evidence cả từ diagnosis và resolution
- Có sự công nhận cụ thể từ người khác

### Confidence reducers

- Chỉ thấy “đã sửa bug” nhưng không rõ quá trình
- Có thể người khác đã chỉ sẵn nguyên nhân
- Không rõ ai là người thực sự reasoning

### Common false inference risks

- Nhầm “fix được” với “debug tốt”
- Nhầm “nói hay” với “thực sự root cause được”

### Suggested output language

- “Shows structured debugging behavior and reasonable root-cause orientation”
- “Can resolve issues, though root-cause reasoning is not yet consistently visible”

---

## A4. Careless Mistake Control

### What it means

Khả năng hạn chế các lỗi “đáng lẽ tránh được”.

### Positive indicators

- Ít mắc lỗi avoidable
- Có pre-check habit
- Tự phát hiện lỗi trước khi bị nhắc
- Có dấu hiệu kiểm tra trước khi handoff

### Negative indicators

- Typo logic / missing edge / quên step / quên follow-up lặp lại
- Sai assumption cơ bản
- Hay thiếu bước xác nhận / validation / closure

### Possible evidence patterns

- Repeated “small but costly” corrections
- Thiếu phần lẽ ra phải obvious
- Handoff thiếu mục quan trọng
- Một loại lỗi lặp đi lặp lại

### Confidence boosters

- Pattern lặp lại nhiều lần
- Xuất hiện ở nhiều loại công việc
- Có sự tương đồng giữa các lỗi

### Confidence reducers

- Chỉ một lần sơ suất
- Context deadline / chaos / unclear requirement
- Không đủ context để biết lỗi do cá nhân hay do hệ thống

### Common false inference risks

- Dán nhãn “careless” quá sớm
- Phạt con người vì một incident duy nhất
- Nhầm “chưa được review kỹ” với “cẩu thả”

### Suggested output language

- “Generally careful, with only occasional avoidable slips”
- “A recurring pattern of preventable mistakes suggests a need for stronger pre-check habits”

---

## A5. Technical Ownership

### What it means

Khả năng kéo vấn đề kỹ thuật từ trạng thái mở đến trạng thái hoàn tất có trách nhiệm.

### Positive indicators

- Chủ động clarify
- Theo dõi đến cuối
- Không dễ bỏ dở context
- Có initiative khi gặp blocker
- Biết push closure

### Negative indicators

- Drop context giữa chừng
- Chờ bị nhắc mới follow-up
- Không clear ai đang giữ bóng
- Thiếu closure behavior

### Possible evidence patterns

- Follow-up chủ động
- Có escalation hoặc clarification đúng lúc
- Có sự nhất quán trong việc đẩy issue tới done
- Có hành vi “pick up and carry forward”

### Confidence boosters

- Lặp lại trên nhiều workstream
- Có evidence từ nhiều người / nhiều context
- Có visible ownership moments

### Confidence reducers

- Chỉ nhìn 1 project
- Vai trò vốn ít được ownership
- Thành công chủ yếu do có người khác cầm chính

### Common false inference risks

- Nhầm “nói nhiều” với “ownership”
- Nhầm “được assign PIC” với “thực sự own”

### Suggested output language

- “Shows increasingly solid technical ownership in day-to-day delivery”
- “Ownership is emerging, though follow-through still appears uneven in some contexts”

---

## A6. Technical Learning Adaptability

### What it means

Khả năng tiếp thu cái mới và biến nó thành năng lực làm việc thực tế.

### Positive indicators

- Sau feedback có cải thiện rõ
- Học nhanh concept / domain / tool mới
- Ít lặp lại lỗi cũ sau khi đã được chỉ
- Tự mở rộng hiểu biết

### Negative indicators

- Lặp lại lỗi cũ dù đã được feedback
- Chậm internalize lesson
- Có dấu hiệu “nghe nhưng chưa chuyển hóa thành hành vi”

### Possible evidence patterns

- Before/after improvement
- Repeated feedback no improvement
- Nắm domain mới rồi apply được
- Tăng độ tự chủ sau một thời gian

### Confidence boosters

- Có chuỗi thời gian đủ dài
- Có evidence của improvement over time
- Có nhiều case cho thấy transfer learning

### Confidence reducers

- Thời gian quan sát quá ngắn
- Chỉ có generic praise
- Không đủ chu kỳ để đánh giá học và chuyển hóa

### Common false inference risks

- Nhầm “học chậm ban đầu” với “không học được”
- Nhầm “chưa có cơ hội” với “không adapt”

### Suggested output language

- “Shows good learning adaptability and evidence of turning feedback into improved execution”
- “Still building consistency in converting feedback into sustained behavior change”

---

---

# GROUP B — DOMAIN TECHNICAL CAPABILITY

---

## B1. Backend Capability

### What it means

Khả năng xử lý logic hệ thống, flow nghiệp vụ, API/service behavior, data handling phía hệ thống.

### Positive indicators

- Xử lý luồng nghiệp vụ hợp lý
- Ít sai flow / validation / state assumptions
- Hiểu dependency giữa các thành phần
- Có thể xử lý logic phức tạp tương đối ổn

### Negative indicators

- Sai flow / state / validation lặp lại
- Hay hiểu sai contract / dependency
- Backend task cần correction nền tảng nhiều

### Possible evidence patterns

- Thảo luận / output liên quan flow nghiệp vụ
- Có hành vi làm rõ edge cases phía hệ thống
- Có pattern xử lý logic có cấu trúc

### Confidence boosters

- Nhiều task backend khác nhau
- Có evidence từ delivery + issue resolution + reasoning
- Có challenge vừa đủ để quan sát năng lực

### Confidence reducers

- Chỉ 1 task đơn giản
- Chỉ thấy task liên quan nhưng không rõ contribution
- Role không thiên backend

### Common false inference risks

- Nhầm “đụng backend” với “giỏi backend”
- Nhầm “làm được happy path” với “nắm tốt backend”

### Suggested output language

- “Observed as a solid backend-leaning contributor across multiple implementation contexts”
- “Backend capability is present, though still developing in more complex integration-heavy situations”

---

## B2. Frontend Capability

### What it means

Khả năng xử lý UI behavior, interaction logic, state, và consistency trải nghiệm.

### Positive indicators

- Xử lý UI logic gọn
- Biết edge cases về interaction
- Có ý thức consistency trải nghiệm
- Giảm friction cho người dùng

### Negative indicators

- UI behavior bug lặp lại
- Thiếu nhất quán interaction
- Không nghĩ tới flow người dùng
- State / interaction assumptions dễ sai

### Possible evidence patterns

- Thảo luận về UI behavior / interaction
- Có feedback hoặc fix liên quan trải nghiệm
- Có pattern cân nhắc người dùng khi implement

### Confidence boosters

- Nhiều case liên quan UI / state / interaction
- Có cả build + fix + feedback context

### Confidence reducers

- Chỉ thấy UI output bề mặt
- Không đủ context để đánh giá reasoning phía sau

### Common false inference risks

- Nhầm “giao diện đẹp” với “frontend capability mạnh”
- Nhầm “ít bug nhìn thấy” với “có tư duy frontend tốt”

### Suggested output language

- “Shows reliable frontend implementation behavior with reasonable attention to interaction consistency”
- “Frontend execution is functional, though user-flow thinking is not yet consistently visible”

---

## B3. DevOps / Delivery Capability

### What it means

Khả năng hiểu và xử lý các concern liên quan đến đưa hệ thống vào vận hành ổn định.

### Positive indicators

- Cẩn trọng khi đụng environment / deployment / delivery path
- Hiểu sự khác biệt giữa local / integration / production-like context
- Có awareness về operational consequences

### Negative indicators

- Xem nhẹ delivery / environment concern
- Dễ tạo friction khi đụng setup / release / deployment
- Không để ý hậu quả vận hành

### Possible evidence patterns

- Thảo luận / hành động liên quan environment / deployment / config / release
- Có awareness về rollback / breakage / release risk
- Có hành vi kiểm tra trước khi đẩy thay đổi

### Confidence boosters

- Có nhiều exposure thực sự
- Có incident / release / operational context rõ
- Có evidence từ nhiều lần va chạm vận hành

### Confidence reducers

- Rất ít cơ hội đụng domain này
- Chỉ có 1 case setup nhỏ
- Role không có operational ownership

### Common false inference risks

- Chấm thấp chỉ vì người đó ít exposure
- Nhầm “không đụng” với “không biết”

### Suggested output language

- “Shows reasonable delivery awareness when operating near release or environment-sensitive work”
- “Insufficient opportunity to make a strong judgment on operational or delivery capability”

---

## B4. System Integration Capability

### What it means

Khả năng kết nối các phần của hệ thống một cách đúng contract, đúng expectation.

### Positive indicators

- Hiểu input/output contract
- Ít lỗi mismatch assumptions
- Có ý thức sync với upstream/downstream
- Xử lý interface boundary khá tốt

### Negative indicators

- Lỗi integration lặp lại
- Sai assumption về dependency / contract
- Thiếu đồng bộ khi làm việc qua boundary

### Possible evidence patterns

- Discussion / fix liên quan mismatch, contract, dependency
- Có hành vi clarify interface expectations
- Có nhiều touchpoint với component khác

### Confidence boosters

- Nhiều integration context khác nhau
- Có cả bug/fix và planning/clarification evidence

### Confidence reducers

- Chỉ 1 integration case
- Không rõ ai là người chịu trách nhiệm integration

### Common false inference risks

- Nhầm lỗi hệ thống chung với lỗi cá nhân
- Nhầm “có nhiều dependency” với “giỏi integration”

### Suggested output language

- “Demonstrates generally reliable integration behavior across component boundaries”
- “Integration handling is developing, with some recurring dependency or contract-related friction”

---

## B5. Data / Interface Handling Discipline

### What it means

Khả năng cẩn trọng với input/output, format, schema, assumptions, validation.

### Positive indicators

- Để ý data contract
- Cẩn trọng với validation / nullability / shape
- Ít lỗi do assumption dữ liệu

### Negative indicators

- Mismatch format / missing validation / assumption dữ liệu sai lặp lại
- Quên edge case dữ liệu
- Không nghĩ tới input không lý tưởng

### Possible evidence patterns

- Bug / fix / review liên quan input-output mismatch
- Có hành vi validate / clarify data assumptions
- Có thảo luận về edge cases dữ liệu

### Confidence boosters

- Pattern lặp lại nhiều lần
- Xuất hiện ở nhiều interface / workflow

### Confidence reducers

- Dữ liệu quan sát quá ít
- Chỉ có 1 bug isolated

### Common false inference risks

- Nhầm bug random với discipline issue
- Chấm thấp quá sớm vì một lần thiếu validation

### Suggested output language

- “Shows reasonable care around data and interface handling, with room to deepen edge-case awareness”
- “A few repeated assumption-related misses suggest data discipline is still maturing”

---

## B6. Architecture Exposure

### What it means

Mức độ tham gia và chất lượng suy nghĩ ở tầng thiết kế, decomposition, tradeoff.

### Positive indicators

- Có tham gia decomposition
- Nêu được tradeoff
- Nghĩ tới boundary / maintainability / future change
- Có reasoning thiết kế có cấu trúc

### Negative indicators

- Chỉ react ở tầng implementation khi đã có cơ hội tham gia design
- Reasoning thiết kế mỏng dù context cho phép
- Hay chọn hướng mà không cân nhắc tradeoff

### Possible evidence patterns

- Design discussion
- Option comparison
- Boundary / modularity / tradeoff reasoning
- Đề xuất cấu trúc hoặc phương án

### Confidence boosters

- Có nhiều design-touching context
- Có bằng chứng reasoning, không chỉ presence

### Confidence reducers

- Role chưa cần design
- Không đủ opportunity
- Chỉ một lần tham gia họp design

### Common false inference risks

- Phạt junior vì chưa có architecture exposure
- Nhầm “tham gia meeting” với “có design capability”

### Suggested output language

- “Shows early signs of architectural thinking when given the opportunity”
- “Not enough design-level exposure to make a strong judgment yet”

---

---

# GROUP C — TECHNICAL MINDSET

---

## C1. Quality Mindset

### What it means

Mức độ quan tâm đến correctness, completeness, robustness, và chất lượng tổng thể.

### Positive indicators

- Chủ động nhắc edge cases
- Quan tâm correctness
- Có thói quen kiểm tra / verify
- Không dễ “chạy được là xong”

### Negative indicators

- Thiên về xong việc hơn chất lượng
- Thiếu awareness về completeness
- Bỏ qua test / verification / edge case rõ ràng

### Possible evidence patterns

- Tự raise concern chất lượng
- Có hành vi self-check
- Có pattern chủ động kiểm tra trước handoff

### Confidence boosters

- Lặp lại ở nhiều context
- Có cả prevention + correction evidence

### Confidence reducers

- Chỉ 1 case
- Context deadline pressure quá mạnh

### Common false inference risks

- Nhầm perfectionism với quality mindset
- Nhầm “chậm” với “care về quality”

### Suggested output language

- “Demonstrates a generally healthy quality mindset in day-to-day technical work”
- “Quality awareness is visible but not yet consistently proactive”

---

## C2. Performance Awareness

### What it means

Mức độ nghĩ đến hiệu suất, cost, scale, responsiveness khi phù hợp.

### Positive indicators

- Chủ động cân nhắc cost / bottleneck / heaviness
- Không vô thức tạo giải pháp quá nặng
- Có awareness khi performance matter

### Negative indicators

- Không để ý cost / scale / responsiveness trong bối cảnh đáng ra phải để ý
- Hay chọn hướng nặng mà không nhận ra

### Possible evidence patterns

- Discussion về bottleneck / performance tradeoff
- Có hành vi cân nhắc efficiency
- Có concern được raise đúng lúc

### Confidence boosters

- Nhiều context có performance relevance
- Có evidence reasoning, không chỉ keyword mention

### Confidence reducers

- Ít exposure performance-sensitive work
- Chỉ một câu mention performance

### Common false inference risks

- Chấm thấp chỉ vì chưa có context cần performance
- Nhầm “không nói tới” với “không biết”

### Suggested output language

- “Shows some awareness of performance tradeoffs where relevant”
- “Insufficient evidence to make a strong judgment on performance-oriented decision-making”

---

## C3. Security Awareness

### What it means

Mức độ cẩn trọng với data, access, exposure, secrets, unsafe assumptions, risk bề mặt an toàn.

### Positive indicators

- Cẩn trọng với thông tin nhạy cảm
- Nhận ra điểm rủi ro rõ ràng
- Không vô thức expose thứ đáng lẽ phải bảo vệ
- Có basic secure thinking

### Negative indicators

- Bỏ qua obvious risk
- Không để ý concern access / exposure / safety
- Tạo ra unsafe assumption lặp lại

### Possible evidence patterns

- Concern về access / visibility / safety
- Có hành vi ngăn risk / hỏi lại chỗ nhạy cảm
- Có discussion liên quan safe handling

### Confidence boosters

- Có nhiều security-relevant contexts
- Có reasoning cụ thể về risk

### Confidence reducers

- Rất ít opportunity
- Không có context nhạy cảm nào
- Chỉ có 1 case nhỏ

### Common false inference risks

- Chấm thấp vì người đó chưa từng đụng chỗ security-sensitive
- Nhầm “không nói” với “không aware”

### Suggested output language

- “Shows basic security awareness where relevant, though evidence remains limited”
- “Not enough security-sensitive exposure to support a strong conclusion”

---

## C4. Maintainability Thinking

### What it means

Khả năng nghĩ tới khả năng hiểu, sửa, mở rộng, và sống lâu của output kỹ thuật.

### Positive indicators

- Output dễ đọc / dễ theo
- Có xu hướng organize cho người sau
- Nghĩ tới future change
- Không quá one-off nếu không cần

### Negative indicators

- Output khó maintain
- Chỉ tối ưu cho “xong việc ngay”
- Thiếu clarity / organization lặp lại

### Possible evidence patterns

- Có hành vi refactor / clarify / organize
- Có reasoning về readability / reuse / future change
- Có feedback về maintainability

### Confidence boosters

- Lặp lại qua nhiều output
- Có cả design-level và implementation-level evidence

### Confidence reducers

- Chỉ 1 deliverable
- Context ép phải làm one-off nhanh

### Common false inference risks

- Nhầm “đơn giản” với “không maintainable”
- Nhầm “không abstract hóa” với “thiếu maintainability thinking”

### Suggested output language

- “Shows reasonable maintainability thinking in implementation choices”
- “Maintainability awareness is emerging but not yet consistently visible in output structure”

---

## C5. Risk Awareness

### What it means

Khả năng nhận ra “nếu làm vậy có thể hỏng gì”.

### Positive indicators

- Chủ động nêu risk
- Nghĩ tới side effects
- Có xu hướng chặn vấn đề trước khi nó xảy ra

### Negative indicators

- Hay bỏ qua side effects
- Chỉ react sau khi có sự cố
- Thiếu foresight khi context đã gợi ý risk

### Possible evidence patterns

- Có warning / caveat / concern trước hành động
- Có planning có risk note
- Có hành vi phòng ngừa

### Confidence boosters

- Nhiều context ra quyết định
- Có evidence “predict before failure”

### Confidence reducers

- Ít decision exposure
- Chỉ có hindsight, không có foresight evidence

### Common false inference risks

- Nhầm “thận trọng” với “risk-aware”
- Nhầm “sợ làm” với “có tư duy risk”

### Suggested output language

- “Shows growing awareness of technical and delivery risk in decision-making”
- “Risk awareness appears uneven and may still depend heavily on context”

---

## C6. Decision Hygiene

### What it means

Chất lượng tư duy khi chọn hướng xử lý: có basis, có tradeoff, có logic.

### Positive indicators

- Giải thích được vì sao chọn hướng
- Có so sánh phương án
- Có tradeoff reasoning
- Không quyết định kiểu cảm tính hoàn toàn

### Negative indicators

- Chọn hướng nhưng không rõ basis
- Hay “jump” sang solution không reasoning
- Thiếu hygiene trong problem framing

### Possible evidence patterns

- Discussion về options
- Reasoning cho proposal / choice
- Có explicit tradeoff / decision rationale

### Confidence boosters

- Nhiều decision context
- Có bằng chứng reasoning thực, không chỉ kết quả

### Confidence reducers

- Ít context cần decision
- Chỉ thấy kết quả cuối, không thấy reasoning

### Common false inference risks

- Nhầm “kết quả tốt” với “decision hygiene tốt”
- Nhầm “nói dài” với “reasoning sạch”

### Suggested output language

- “Demonstrates reasonably clean decision-making when technical choices are visible”
- “Decision hygiene is still difficult to assess strongly due to limited reasoning visibility”

---

---

# GROUP D — PROFESSIONAL & TEAM EFFECTIVENESS

---

## D1. Problem Solving

### What it means

Khả năng hiểu vấn đề, chia nhỏ nó, và tiến tới giải pháp có cấu trúc.

### Positive indicators

- Framing problem rõ
- Chia nhỏ vấn đề hợp lý
- Đề xuất hướng giải quyết có logic
- Không bị chìm trong symptom

### Negative indicators

- Dễ lạc symptom
- Thiếu structure khi xử lý
- Jump solution khi chưa hiểu problem

### Possible evidence patterns

- Breakdown vấn đề
- Clarification tốt
- Có hành vi structure problem before acting

### Confidence boosters

- Nhiều case problem-solving khác nhau
- Có cả ambiguous và non-ambiguous contexts

### Confidence reducers

- Chỉ task routine đơn giản
- Không đủ visibility vào thinking process

### Common false inference risks

- Nhầm “giải được” với “problem solving tốt”
- Nhầm “được chỉ cách” với “tự solve được”

### Suggested output language

- “Shows structured problem-solving behavior across several observed contexts”
- “Problem-solving is functional, though still inconsistent in more ambiguous situations”

---

## D2. Self Management

### What it means

Khả năng tự quản lý công việc, tiến độ, trạng thái, và follow-through.

### Positive indicators

- Ít bị trôi việc
- Tự theo dõi tiến độ
- Chủ động nhắc / cập nhật / close loop
- Có organization cá nhân ổn

### Negative indicators

- Quên follow-up
- Trôi context
- Miss update / miss closure / thiếu tổ chức lặp lại

### Possible evidence patterns

- Có hoặc không có follow-up đúng lúc
- Có pattern giữ context tốt hoặc rơi context
- Có hành vi tự quản lý mà không cần chase

### Confidence boosters

- Quan sát được qua nhiều task / period
- Có nhiều signal nhỏ lặp lại

### Confidence reducers

- Chỉ 1–2 incident
- Context team/process vốn hỗn loạn

### Common false inference risks

- Nhầm “bận” với “self-management kém”
- Phạt người đang overloaded bởi hệ thống

### Suggested output language

- “Generally self-managed and dependable in keeping work moving”
- “Some recurring follow-through gaps suggest self-management could become more deliberate”

---

## D3. HoRenSo / Reporting Discipline

### What it means

Khả năng báo cáo, liên lạc, chia sẻ trạng thái đúng lúc và đủ chất lượng.

### Positive indicators

- Update đúng lúc
- Escalate đúng lúc
- Không để người khác phải đoán tình hình
- Reporting rõ và hữu ích

### Negative indicators

- Báo trễ
- Báo thiếu context
- Chỉ báo khi có vấn đề lớn rồi
- Communication không đủ để phối hợp tốt

### Possible evidence patterns

- Status updates
- Escalation timing
- Clarification / reporting behavior
- Handoff completeness

### Confidence boosters

- Quan sát được qua nhiều interaction
- Có lặp lại pattern giao tiếp

### Confidence reducers

- Team culture ít yêu cầu reporting visible
- Chủ yếu làm việc độc lập / ít sync

### Common false inference risks

- Nhầm “ít nói” với “communication kém”
- Phạt introvert vô lý

### Suggested output language

- “Shows reasonably healthy reporting and status-sharing discipline”
- “Communication timing and clarity appear to need more consistency in collaborative contexts”

---

## D4. User First / Omotenashi

### What it means

Mức độ nghĩ tới trải nghiệm của người dùng cuối hoặc người nhận output.

### Positive indicators

- Nghĩ tới user flow / downstream user
- Output considerate
- Có empathy với người dùng / người maintain / stakeholder nhận kết quả

### Negative indicators

- Chỉ tối ưu cho bản thân
- Không nghĩ tới friction người khác sẽ gặp
- Bỏ qua usability / understandability rõ ràng

### Possible evidence patterns

- Có concern về usability / clarity / handoff readability
- Có hành vi làm cho output dễ dùng hơn
- Có reasoning theo góc nhìn người nhận

### Confidence boosters

- Xuất hiện ở nhiều context
- Có cả technical + collaboration evidence

### Confidence reducers

- Vai trò ít tiếp xúc người dùng / downstream
- Chỉ một case isolated

### Common false inference risks

- Nhầm “lịch sự” với “user-first”
- Nhầm “thích UI đẹp” với “omotenashi”

### Suggested output language

- “Shows thoughtful consideration for downstream users and collaborators in several contexts”
- “User-first thinking appears present but not yet consistently visible in implementation behavior”

---

## D5. Collaboration

### What it means

Khả năng phối hợp với người khác một cách hiệu quả, giảm friction, tăng alignment.

### Positive indicators

- Align rõ
- Handoff ổn
- Biết hỏi / biết sync / biết support
- Giúp unblock người khác

### Negative indicators

- Handoff thiếu
- Thiếu sync
- Tạo confusion lặp lại
- Phối hợp kém hiệu quả

### Possible evidence patterns

- Cross-person coordination
- Support moments
- Clarification / unblock behavior
- Handoff and alignment quality

### Confidence boosters

- Nhiều multi-person contexts
- Có cả direct support và shared delivery evidence

### Confidence reducers

- Phần lớn công việc solo
- Team context vốn thiếu process / thiếu alignment

### Common false inference risks

- Nhầm “nice” với “collaborative”
- Nhầm “reply nhanh” với “collaboration tốt”

### Suggested output language

- “Observed as a generally effective collaborator in shared delivery contexts”
- “Collaboration is functional, though some handoff and alignment friction remains visible”

---

## D6. Mentoring / Knowledge Support

### What it means

Khả năng giúp người khác hiểu, học, và tiến bộ.

### Positive indicators

- Giải thích rõ
- Hỗ trợ người khác hiểu vấn đề
- Chia sẻ tri thức có ích
- Có patience / clarity khi support

### Negative indicators

- Không nên infer âm nếu không đủ opportunity
- Chỉ đánh giá khi thực sự có mentoring context

### Possible evidence patterns

- Support thread
- Explanation breakdown
- Knowledge sharing
- Help offered to teammates

### Confidence boosters

- Nhiều support interactions
- Có phản hồi tích cực cụ thể
- Có bằng chứng giải thích rõ ràng

### Confidence reducers

- Rất ít opportunity
- Không có junior / teammate support context
- Chỉ 1 lần help nhỏ

### Common false inference risks

- Chấm thấp vì chưa có cơ hội mentor
- Nhầm “trả lời được” với “mentor tốt”

### Suggested output language

- “Shows useful knowledge-sharing behavior when supporting others”
- “Not enough mentoring opportunity to make a strong judgment yet”

---

## D7. AI Leverage Ability

### What it means

Khả năng sử dụng AI để tăng năng suất và chất lượng mà không mất kiểm soát tư duy.

### Positive indicators

- Biết dùng AI để draft / debug / learn / accelerate
- Vẫn kiểm chứng output
- Biết tận dụng AI như tool, không phải crutch hoàn toàn

### Negative indicators

- Copy output thiếu kiểm chứng
- Có dấu hiệu phụ thuộc AI gây giảm chất lượng
- Dùng AI nhưng không integrate reasoning

### Possible evidence patterns

- Có dấu hiệu sử dụng AI trong workflow
- Có hành vi kiểm tra / sửa / contextualize AI output
- Có pattern dùng AI để tăng hiệu quả có kiểm soát

### Confidence boosters

- Có nhiều evidence rõ ràng
- Có bằng chứng “AI used + human verification”

### Confidence reducers

- Rất khó quan sát trực tiếp
- Evidence mơ hồ
- Chỉ có self-report hoặc dấu hiệu gián tiếp

### Common false inference risks

- Tự động xem AI usage là tốt
- Hoặc ngược lại, mặc định dùng AI là lười
- Đây là dimension cần cực cẩn trọng

### Suggested output language

- “Appears to use AI as a productivity aid while retaining reasonable judgment”
- “AI usage is visible, but evidence is still limited to assess quality of leverage confidently”

---

# 4. CROSS-DIMENSION CONFIDENCE BOOSTERS / REDUCERS

---

# 4.1 Universal Confidence Boosters

Các yếu tố này tăng confidence gần như cho mọi dimension:

### Boosters

- Pattern lặp lại ít nhất 3 lần trở lên
- Xuất hiện ở nhiều context / task / workstream
- Có cả hành vi + outcome + phản hồi
- Có time spread đủ dài
- Có cả positive và negative counterbalance để infer chín hơn
- Có evidence cụ thể, không generic
- Có reasoning visible, không chỉ result visible

---

# 4.2 Universal Confidence Reducers

### Reducers

- Chỉ một evidence isolated
- Context quá mơ hồ
- Không rõ contribution thực của người đó
- Chỉ có lời khen / chê chung chung
- Không đủ cơ hội bộc lộ dimension
- Team/process context làm nhiễu mạnh
- Chỉ có keyword surface, không có behavioral pattern

---

# 5. COMMON FALSE INFERENCE TRAPS

# (PHẦN CỰC QUAN TRỌNG)

Đây là phần bạn nên nhét vào evaluator prompt như **guardrails bắt buộc**.

---

## Trap 1 — “Not observed” = “weak”

Sai cực nặng.

### Correct rule

Nếu không đủ opportunity / evidence:
→ output phải là
**Insufficient Opportunity** hoặc **Insufficient Evidence**

---

## Trap 2 — “One incident” = “trait”

Sai rất phổ biến.

### Correct rule

Một incident chỉ được dùng như:

- signal yếu
- hoặc case-based lesson
  chứ không được biến thành dimension score mạnh.

---

## Trap 3 — “High visibility” = “high capability”

Sai.

### Correct rule

Người nói nhiều / xuất hiện nhiều chưa chắc giỏi hơn.

---

## Trap 4 — “Task volume” = “impact / strength”

Sai.

### Correct rule

Nhiều việc ≠ làm tốt.

---

## Trap 5 — “Praise” = “evidence”

Sai.

### Correct rule

Praise chỉ là evidence phụ nếu không có specificity.

---

## Trap 6 — “Politeness” = “collaboration / user-first”

Sai.

### Correct rule

Cần nhìn vào behavior pattern, không chỉ tone.

---

## Trap 7 — “AI usage” = “modern / productive / strong”

Sai.

### Correct rule

Phải phân biệt:

- AI-assisted with judgment
  vs
- AI-dependent without validation

---

# 6. CÁCH DÙNG BẢNG NÀY TRONG HỆ THỐNG THẬT

Bảng này nên được dùng ở **4 bước khác nhau**:

---

# Step 1 — Event Extraction

Từ dữ liệu thô, extract ra:

- behavioral events
- candidate evidence
- related dimensions

Ví dụ output:

- event_type
- summary
- related_dimensions
- evidence_strength
- ambiguity_note

---

# Step 2 — Dimension Inference

Đối với từng dimension:

- gom tất cả evidence liên quan
- phân loại positive / negative / neutral / insufficient
- generate pattern summary

---

# Step 3 — Confidence Estimation

Dựa vào:

- số lượng
- độ đa dạng
- độ trực tiếp
- độ nhất quán
- mức opportunity

---

# Step 4 — Human-facing Explanation

Generate output theo style:

- non-judgmental
- evidence-based
- development-oriented

---

# 7. ĐIỀU QUAN TRỌNG NHẤT

Nếu bạn chỉ nhớ 1 câu từ toàn bộ taxonomy này, thì nên là câu này:

> **Bạn không đang cố “chấm điểm một con người”.
> Bạn đang cố “mô tả những pattern làm việc đã được quan sát, với mức độ chắc chắn khác nhau”.**

Đó là khác biệt giữa một hệ thống **có thể dùng được trong tổ chức**, và một hệ thống **đẹp nhưng nguy hiểm**.
