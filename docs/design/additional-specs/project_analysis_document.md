Có. Nhưng điểm quan trọng là: **thế giới không dùng một framework duy nhất** để “phân tích dự án” theo kiểu end-to-end. Trong nghiên cứu và thực hành, người ta thường **ghép nhiều lớp framework**: lớp làm rõ bài toán, lớp feasibility, lớp chọn công nghệ/kiến trúc, lớp định lượng trade-off, và lớp đánh giá năng lực thực thi. Một số tài liệu tổng quan về đánh giá dự án còn chia việc đánh giá thành các hướng như **outcome, process, learning, benchmarking** thay vì cố nhét mọi thứ vào một mô hình đơn lẻ. ([Galorath][1])

Với đúng nhu cầu bạn mô tả, tôi nghĩ hướng mạnh nhất là dựng một **composite evaluation stack** gồm 6 lớp sau.

## 1) Làm rõ “What / Who / Why / When”: Theory of Change + Logic Model

Nếu bạn muốn bắt đầu từ câu hỏi “dự án này là gì, phục vụ ai, vì sao tồn tại, nếu không làm thì chuyện gì xảy ra, khi nào nên bắt đầu”, thì **Theory of Change (ToC)** và **Logic Model** là cặp framework rất hợp. ToC giúp mô hình hóa chuỗi nhân quả từ vấn đề → can thiệp → kết quả mong đợi; Logic Model giúp biến nó thành cấu trúc trực quan hơn: input, activity, output, outcome, impact. Đây là nền tảng rất tốt để tránh tình trạng dự án bị nhảy thẳng vào solution trước khi hiểu problem. ([info-cooperazione.it][2])

Với software project, bạn có thể dùng lớp này để chấm các trục như:

- Problem clarity
- Stakeholder clarity
- User pain severity
- Outcome measurability
- Strategic timing / urgency

Nếu 5 trục này thấp, thì thường chưa nên bàn sâu về stack.

## 2) Đánh giá “có nên làm không”: TELOS / Feasibility Assessment Framework

Để trả lời câu hỏi “có technically viable không”, “deadline/resource/risk có chịu nổi không”, lớp nền kinh điển là **TELOS**: Technical, Economic, Legal, Operational, Schedule feasibility. Nhiều tài liệu feasibility study vẫn xoay quanh 5 góc này; còn **Feasibility Assessment Framework (FAF)** là một biến thể có cấu trúc hóa mạnh hơn để viết business case và đánh giá options một cách có hệ thống. FAF paper nêu rõ nó dùng weighted TELOS criteria để phân tích các phương án. ([U of T Computer Science][3])

Đây là lớp rất hợp với đoạn bạn nói về:

- resource con người
- deadline
- risk
- thiếu skill thì tuyển hay train
- cuối cùng kết luận có khả thi kỹ thuật hay không

Nếu muốn mở rộng hơn TELOS, có thể nhìn sang các framework feasibility kiểu **MCDA-based feasibility scoring** để chấm đồng thời technical, financial, legal, social, environmental, rồi xuất ra một feasibility score/rank giữa các phương án. ([MDPI][4])

## 3) Định lượng và xếp hạng lựa chọn: MCDA / MCDM

Khi bạn muốn “lượng hóa chuyên sâu”, dựng radar, so sánh nhiều phương án công nghệ/kiến trúc/đội ngũ, thì lớp phương pháp mạnh nhất trong học thuật là **Multi-Criteria Decision Analysis / Multi-Criteria Decision Making (MCDA/MCDM)**. Đây là họ phương pháp rất rộng, thường dùng các kỹ thuật như **AHP, ANP, TOPSIS, DEMATEL**, và các biến thể fuzzy khi dữ liệu còn mơ hồ hoặc phụ thuộc expert judgment. Các systematic review cho thấy MCDM đã được dùng rất rộng trong đánh giá, ranking, lựa chọn phương án, kể cả trong software engineering. ([ResearchGate][5])

Chỗ này cực hợp với nhu cầu của bạn vì bạn có thể biến mỗi khía cạnh thành tiêu chí có trọng số:

- business value
- urgency
- technical fit
- team familiarity
- integration complexity
- data availability
- security/compliance burden
- operational burden
- schedule risk
- training/recruitment gap

Sau đó dùng AHP/ANP để lấy trọng số, rồi TOPSIS hoặc ANP/TOPSIS để xếp hạng các option. Nếu dữ liệu là định tính kiểu “cao / trung bình / thấp”, fuzzy AHP-TOPSIS hoặc fuzzy CBAM sẽ hợp hơn. ([KOASAS][6])

## 4) Chọn kiến trúc và tech stack: ATAM / SAAM / CBAM + Quality Attributes

Khi sang phần “nên dùng ngôn ngữ gì, DB gì, kiến trúc gì, giống/khác gì với hệ thống cũ, có pattern nào tái dùng được không”, thì framework có trọng lượng học thuật và công nghiệp mạnh nhất là **ATAM** của SEI/CMU. ATAM được dùng để đánh giá kiến trúc dựa trên **quality attribute scenarios**, từ đó lộ ra **risks, sensitivity points, trade-offs** giữa các chất lượng như performance, security, modifiability, availability, interoperability. ([SEI][7])

Nếu bạn cần bản nhẹ hơn để so sánh candidate architectures theo scenario, **SAAM** cũng đáng đọc. Có tài liệu arXiv dùng SAAM để chấm kiến trúc bằng trọng số scenario và interaction. ([arXiv][8])

Nếu muốn đưa thêm câu hỏi “đáng tiền không, ROI kiến trúc có hợp lý không”, thì nối ATAM với **CBAM (Cost Benefit Analysis Method)**. CBAM giúp gắn chi phí, lợi ích, rủi ro, lịch trình vào các quyết định kiến trúc thay vì chỉ tranh luận chất lượng ở mức cảm tính. ([SEI][9])

Thực tế, đoạn bạn hỏi “nó giống và khác gì so với các dự án trước”, “có thể reuse design patterns / architectural patterns không” nên được triển khai theo hướng:

1. dựng quality attribute scenarios,
2. map candidate architecture/pattern vào từng scenario,
3. chấm impact + cost + team familiarity,
4. dùng MCDA để xếp hạng.

## 5) Định nghĩa thước đo chất lượng: ISO 25010 mindset

Để tránh việc chấm kiến trúc theo cảm giác, bạn nên neo các tiêu chí vào bộ **software quality attributes**. ISO/IEC 25010 là chuẩn rất thường được dùng làm “từ điển tiêu chí” cho chất lượng phần mềm, với các nhóm như functional suitability, performance efficiency, compatibility, usability, reliability, security, maintainability, portability. Một số tài liệu open-access dùng ISO 25010 làm chuẩn đối chiếu cho quality models và quality attributes. ([backendrepo.covenantuniversity.edu.ng][10])

Trong case của bạn, ISO 25010 không tự nó là framework ra quyết định, nhưng nó là **bộ chiều đo** rất tốt để đưa vào radar chart và matrix chấm điểm.

Ví dụ radar chart có thể gồm:

- Business clarity
- User impact
- Time criticality
- Functional fit
- Integration complexity
- Security/compliance burden
- Maintainability
- Scalability/performance
- Team familiarity
- Delivery confidence

## 6) Đánh giá độ chín và năng lực thực thi: TRL + organizational readiness + team capability

Một dự án có thể “đúng bài toán” nhưng vẫn fail vì công nghệ chưa chín, tổ chức chưa sẵn sàng, hoặc team chưa đủ lực. Vì vậy nhiều nơi thêm lớp **readiness** vào trước khi commit. **TRL / Technology Readiness Level** là framework rất phổ biến để đánh giá độ trưởng thành công nghệ; các guidebook gần đây của DoD/GAO vẫn xem TRA/TRL là công cụ quan trọng để đánh giá feasibility, risk và expected return. Ngoài TRL, nghiên cứu còn mở rộng ra **Organisational / Legal / Societal Readiness Levels** để nhìn thực tế triển khai toàn diện hơn. ([cto.mil][11])

Về phía năng lực đội ngũ, các nghiên cứu gần đây trong software project cũng nhấn mạnh vai trò của **team delivery capability** và **agility** đối với project outcome; đồng thời có các nghiên cứu về **organizational readiness for change** như một yếu tố ảnh hưởng đến khả năng triển khai thành công. ([ijispm.sciencesphere.org][12])

Điều này rất sát với nhu cầu của bạn về:

- team có quen stack/architecture này chưa
- thiếu skill nào
- nên tuyển hay training
- mức độ tự tin giao hàng

---

# Nếu phải chọn một “framework tổng hợp” cho bài toán của bạn

Tôi sẽ không chọn một framework có sẵn duy nhất, mà sẽ dùng **khung 5 câu hỏi + 4 lớp đánh giá** như sau:

### Tầng A — Problem framing

- ToC / Logic Model
- Trả lời: What, Who, Why, Why now, What if not

### Tầng B — Feasibility gate

- TELOS / FAF
- Trả lời: Có nên đi tiếp không

### Tầng C — Architecture & technology evaluation

- ATAM / SAAM / CBAM
- ISO 25010 làm bộ tiêu chí chất lượng

### Tầng D — Quantitative ranking

- AHP/ANP để lấy trọng số
- TOPSIS / fuzzy TOPSIS để xếp hạng phương án

### Tầng E — Delivery readiness

- TRL + organizational readiness + team capability matrix

Đây là khung có thể defend được cả về học thuật lẫn thực tiễn. ([Galorath][1])

---

# Một cấu trúc radar chart hợp lý cho bạn

Bạn đang muốn dựng RADAR chart để visualize khía cạnh dự án. Tôi đề xuất 10 trục:

1. **Problem clarity**
2. **Stakeholder/user fit**
3. **Business urgency / timing**
4. **Technical feasibility**
5. **Architecture fitness**
6. **Security/compliance fit**
7. **Maintainability / extensibility**
8. **Integration & data complexity**
9. **Team familiarity / skill readiness**
10. **Schedule confidence / delivery risk**

Trong đó:

- trục 1–3 lấy từ ToC/Logic Model,
- trục 4 + 10 lấy từ TELOS/FAF,
- trục 5–8 lấy từ ATAM + ISO 25010,
- trục 9 lấy từ readiness/capability.

Sau đó dùng MCDA để gán trọng số từng trục theo loại dự án. Ví dụ hệ thống core banking sẽ cho security/compliance nặng hơn; internal analytics tool sẽ cho delivery speed và maintainability nặng hơn. Cách tiếp cận dùng multi-criteria scoring như vậy có nền tảng khá mạnh trong literature. ([ResearchGate][5])

---

# Những nguồn open access / arXiv nên đọc trước

Nếu bạn muốn bắt đầu nhanh mà vẫn “có chất”, tôi khuyên đọc theo thứ tự này:

**Nhóm nền tảng đánh giá dự án**

- Rode & Svejvig, _Designing a Project Evaluation Framework_ — rất hữu ích để hiểu bản chất của “project evaluation” và các hướng tiếp cận outcome/process/learning/benchmarking. ([Galorath][1])
- Ssegawa et al., _Feasibility Assessment Framework (FAF)_ — practical cho giai đoạn proposal/initiation. ([ScienceDirect][13])
- Goh et al., _Applying MCDA for Software Quality Assessment_ — tốt để hiểu cách chọn phương pháp MCDA. ([Sovereign Tech Agency][14])
- Magabaleh et al., _Systematic review of software engineering uses of MCDM_ — để có bức tranh toàn cảnh. ([ScienceDirect][15])

**Nhóm kiến trúc và trade-off**

- Kazman et al., _ATAM: Method for Architecture Evaluation_ — gần như bắt buộc đọc nếu muốn đánh giá kiến trúc nghiêm túc. ([SEI][7])
- SEI, _Architecture Tradeoff Analysis Method (ATAM)_ overview. ([SEI][16])
- SEI, _Cost Benefit Analysis Method (CBAM)_. ([SEI][9])
- Meiappane et al. arXiv, _Evaluation of Software Architecture Quality Attribute using SAAM_. ([arXiv][8])

**Nhóm readiness / maturity**

- DoD, _Technology Readiness Assessment Guidebook_; GAO, _Assessment Guide: Technology Readiness_. ([cto.mil][11])
- Bruno et al., _Technology Readiness revisited_ — mở rộng TRL sang legal/organizational/societal. ([European Commission][17])
- _Integrated framework for assessing innovation readiness_ — tích hợp nhiều readiness levels. ([itech.lukasiewicz.gov.pl][18])

**Nhóm success factors / delivery**

- Iriarte & Bayona, _IT projects success factors: a literature review_. ([sciencesphere.org][19])
- Xia et al., _Team delivery capability and agility_. ([ijispm.sciencesphere.org][12])
- Caci et al., _Organizational readiness for change: a systematic review_. ([PubMed Central][20])

---

# Kết luận thẳng

Nếu mục tiêu của bạn là xây một hệ thống đánh giá dự án có thể:

- hiểu nghiệp vụ,
- gắn tech stack đề xuất,
- đối chiếu với lịch sử dự án cũ,
- lượng hóa risk/resource/skill gap,
- và kết luận technical viability,

thì bộ khung mạnh nhất là:

**ToC/Logic Model → TELOS/FAF → ATAM/CBAM + ISO 25010 → AHP/ANP/TOPSIS → TRL + org/team readiness**. ([info-cooperazione.it][2])

Nói ngắn gọn hơn:
**Radar chart chỉ là lớp hiển thị. MCDA là lớp tính điểm. ATAM/CBAM là lớp kiến trúc. TELOS/FAF là lớp feasibility. ToC là lớp làm rõ “vì sao”.**

Nếu bạn muốn, ở bước tiếp theo tôi sẽ giúp bạn biến toàn bộ đống này thành **một evaluation matrix hoàn chỉnh cho software project**, gồm:

- danh sách tiêu chí,
- thang điểm 1–5,
- trọng số AHP mẫu,
- công thức tổng điểm,
- và mẫu RADAR chart cho dashboard.

[1]: https://galorath.com/project/feasibility/?utm_source=chatgpt.com "Project Feasibility Study: Assessment, Analysis, and Report ..."
[2]: https://www.info-cooperazione.it/wp-content/uploads/2022/10/DEFINITIVO-Impaginato-INGLESE-Info-cooperazione-3-1.pdf?utm_source=chatgpt.com "PROJECT PLANNING WITH THE THEORY OF CHANGE"
[3]: https://www.cs.toronto.edu/~jm/340S/PDF6/Feasibility.pdf?utm_source=chatgpt.com "The Feasibility Study Phase"
[4]: https://www.mdpi.com/1996-1073/14/8/2204?utm_source=chatgpt.com "A General Framework for Multi-Criteria Based Feasibility ..."
[5]: https://www.researchgate.net/publication/355818299_Multi-Criteria_Decision_Making_A_Systematic_Review?utm_source=chatgpt.com "(PDF) Multi-Criteria Decision Making: A Systematic Review"
[6]: https://koasas.kaist.ac.kr/bitstream/10203/17579/1/2009%20-%20Emperical%20SE%20-%20Software%20architecture%20evaluation%20methods%20based%20on%20cost%20benefit%20analysis%20and%20quantitative%20decision%20making.pdf?utm_source=chatgpt.com "Software architecture evaluation methods based on cost ..."
[7]: https://www.sei.cmu.edu/documents/629/2000_005_001_13706.pdf?utm_source=chatgpt.com "ATAM: Method for Architecture Evaluation"
[8]: https://arxiv.org/abs/1312.2342?utm_source=chatgpt.com "Evaluation of Software Architecture Quality Attribute for an ..."
[9]: https://www.sei.cmu.edu/documents/2540/2018_010_001_513478.pdf?utm_source=chatgpt.com "Cost Benefit Analysis Method (CBAM)"
[10]: https://backendrepo.covenantuniversity.edu.ng/server/api/core/bitstreams/495e29ca-b3f3-46e1-97e5-8bf9e849e859/content?utm_source=chatgpt.com "Evaluating Open Source Software Quality Models against ..."
[11]: https://www.cto.mil/wp-content/uploads/2025/03/TRA-Guide-Feb2025.v2-Cleared.pdf?utm_source=chatgpt.com "Technology Readiness Assessment Guidebook"
[12]: https://ijispm.sciencesphere.org/archive/ijispm-120302.pdf?utm_source=chatgpt.com "Team delivery capability and agility: complementary effects ..."
[13]: https://www.sciencedirect.com/science/article/pii/S1877050921002210/pdf?md5=4d61043ccc5394f2088a625c2794aaeb&pid=1-s2.0-S1877050921002210-main.pdf&utm_source=chatgpt.com "Feasibility Assessment Framework (FAF)"
[14]: https://www.sovereign.tech/public/files/SovereignTechFund_FeasibilityStudy.pdf?utm_source=chatgpt.com "Feasibility Study to Examine a Funding Program for Open ..."
[15]: https://www.sciencedirect.com/science/article/abs/pii/S1568494624006331?utm_source=chatgpt.com "Systematic review of software engineering uses of multi ..."
[16]: https://www.sei.cmu.edu/library/file_redirect/2011_015_001_28266.pdf/?utm_source=chatgpt.com "Architecture Tradeoff Analysis Method (ATAM)"
[17]: https://ec.europa.eu/isa2/sites/isa/files/technology_readiness_revisited_-_icegov2020.pdf?utm_source=chatgpt.com "Technology Readiness revisited: A proposal for extending the ..."
[18]: https://itech.lukasiewicz.gov.pl/wp-content/uploads/sites/38/2025/07/Integrated-framework-for-assessing-innovation-readiness.pdf?utm_source=chatgpt.com "integrated framework for assessing innovation readiness"
[19]: https://www.sciencesphere.org/ijispm/archive/ijispm-080203.pdf?utm_source=chatgpt.com "IT projects success factors: a literature review"
[20]: https://pmc.ncbi.nlm.nih.gov/articles/PMC12084713/?utm_source=chatgpt.com "Organizational readiness for change: A systematic review of ..."
