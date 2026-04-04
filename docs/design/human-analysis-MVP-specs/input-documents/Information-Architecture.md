# PART A

# INFORMATION ARCHITECTURE + WIREFRAME TEXT SPEC

---

# 1. PRODUCT INFORMATION ARCHITECTURE

---

## 1.1 Top-Level Navigation Structure

Toàn bộ app nên có kiến trúc điều hướng như sau:

### A. Global App Shell

- Top Header
- Left Sidebar Navigation
- Main Content Area
- Right Utility / Detail Drawer (optional)
- Global Notification / Status Layer

---

## 1.2 Navigation Hierarchy

### Primary Navigation Tree

- Organization
  - Team
    - Member

### Member-Level Main Workspace

Khi chọn 1 member, content area hiển thị profile workspace gồm:

- Tab 1: Overview
- Tab 2: Competency & Evidence
- Tab 3: KPT
- Tab 4: Case-Based Feedback
- Tab 5: Journey & Milestones

---

## 1.3 Supporting Global Functions

Các chức năng hỗ trợ nên luôn có ở global level hoặc member header:

- Create Organization
- Create Team
- Add Member
- Select Time Range
- Refresh Analysis
- View Analysis Status
- View Evidence Trace
- Flag Assessment
- Compare Period (future-ready)
- Export Summary (future-ready)

---

# 2. GLOBAL LAYOUT SPEC

---

# 2.1 App Shell Layout

### Left Sidebar (persistent)

Chứa cấu trúc tổ chức và navigation chính

### Top Header

Chứa:

- app title / current workspace
- time range selector
- refresh button
- status indicator
- optional search / quick jump

### Main Content

Hiển thị:

- dashboard nếu chưa chọn member
- member profile nếu đã chọn member

### Right Drawer / Modal Layer

Dùng cho:

- evidence trace
- insight detail
- flag assessment
- create/edit forms

---

# 3. LEFT SIDEBAR SPEC

---

## 3.1 Sidebar Purpose

Sidebar là trục điều hướng chính của toàn hệ thống.

### Sidebar should include:

- Organization list
- Expandable team tree
- Members under each team
- Add actions

---

## 3.2 Sidebar Components

### Component A — Sidebar Header

Hiển thị:

- App name / logo
- “Create Organization” button

---

### Component B — Organization Tree

Mỗi organization node gồm:

- organization name
- expand/collapse
- menu actions:
  - create team
  - rename
  - delete (if allowed)

---

### Component C — Team Node

Mỗi team node gồm:

- team name
- member count
- expand/collapse
- menu actions:
  - add member
  - rename
  - delete

---

### Component D — Member Node

Mỗi member item gồm:

- avatar / initials
- member name
- optional role tag
- optional status icon:
  - Not analyzed
  - Loading
  - Ready
  - Error

### On click:

Mở member profile workspace

---

# 4. GLOBAL USER FLOW

---

# 4.1 Core Happy Path

### Step 1

User enters system

### Step 2

User creates Organization

### Step 3

User creates Team under Organization

### Step 4

User adds Member under Team

### Step 5

System starts data collection / analysis for that member

### Step 6

User selects time range

### Step 7

System generates member profile

### Step 8

User explores 5 tabs

### Step 9

User inspects evidence / flags wrong insights / refreshes if needed

---

# 4.2 Secondary Flows

### A. Re-analysis Flow

- User changes time range
- User clicks refresh
- System re-runs analysis
- UI updates all tabs

### B. Evidence Inspection Flow

- User clicks evidence-linked item
- Right drawer / modal opens
- User sees supporting trace and source context

### C. Assessment Validation Flow

- User clicks “Flag as questionable / incorrect”
- Form opens
- User submits feedback
- System stores validation signal

---

# 5. MEMBER PROFILE WORKSPACE STRUCTURE

---

Khi chọn một member, main content nên có layout như sau:

---

## 5.1 Member Workspace Header

### Header should include:

- Member name
- Team / Organization breadcrumb
- Role / level tag (if available)
- Last analyzed timestamp
- Current selected time window
- Refresh button
- Analysis status badge

### Secondary action buttons:

- Flag overall profile
- Export summary (future)
- Compare previous period (future)

---

## 5.2 Member Workspace Summary Strip

Ngay dưới header nên có 1 strip tóm tắt nhanh:

### Summary strip gồm:

- Overall profile state (e.g. “Reliable technical contributor with growing ownership”)
- Top 3 strengths
- Top 2 growth areas
- Confidence badge
- Opportunity coverage badge

Mục tiêu:

> Người manager chỉ cần nhìn 5 giây là nắm được “đại ý con người này trong giai đoạn này”.

---

# 6. TAB 1 — OVERVIEW

# Wireframe Text Spec

---

# 6.1 Business Purpose

Tab này trả lời:

> “Người này đã là kiểu contributor như thế nào trong khoảng thời gian này?”

Đây là tab để:

- hiểu nhanh
- nhìn tổng quan
- chuẩn bị cho 1:1 / review

---

# 6.2 Layout Structure

### Tab 1 Layout:

- Row 1: Overview hero summary + Radar chart
- Row 2: Contribution highlights + Work summary stats
- Row 3: Strengths / Growth areas / Delta
- Row 4: Encouragement / Narrative summary

---

# 6.3 Components

---

## Component 1 — Overview Hero Card

### Hiển thị:

- 1 đoạn summary 3–5 câu
- tone: professional, encouraging, evidence-aware
- không overclaim

### Nội dung nên có:

- kiểu đóng góp nổi bật
- trạng thái phát triển
- 1–2 điểm mạnh chính
- 1–2 điểm đang phát triển

### Example:

- Reliable implementation contributor with strong backend-leaning execution
- Showing improving ownership and better problem framing
- Still developing consistency in communication handoff under pressure

---

## Component 2 — Radar Chart / Capability Snapshot

### Hiển thị 4 nhóm chính:

- Core Technical Execution
- Domain Technical Capability
- Technical Mindset
- Professional & Team Effectiveness

### Requirements:

- show confidence legend
- optionally show previous period overlay (future)
- low confidence dimension should visually indicate uncertainty

---

## Component 3 — Contribution Summary Stats

### Hiển thị:

- Number of major workstreams involved in
- Number of directly owned items / responsibilities
- Number of visible delivery completions
- Number of milestone-worthy contributions
- Optional “helped unblock others” count (if stable enough)

### Rule:

Không hiển thị vanity metrics vô nghĩa.
Chỉ show các số có meaning.

---

## Component 4 — Top Strengths Card

### Hiển thị:

- Top 3–5 strongest observed dimensions
- mỗi item gồm:
  - dimension name
  - one-line explanation
  - confidence tag

---

## Component 5 — Growth Areas Card

### Hiển thị:

- Top 3 observed development areas
- mỗi item gồm:
  - dimension name
  - one-line explanation
  - opportunity note if needed

### Rule:

Không được viết kiểu phán xét.
Phải viết kiểu developmental.

---

## Component 6 — Delta from Previous Period Card

### Hiển thị:

- Improved areas
- Stable areas
- Emerging strengths
- Watch areas

### Nếu không đủ dữ liệu:

- show “Not enough previous comparison yet”

---

## Component 7 — Encouragement / Summary Reflection Card

### Hiển thị:

- 1 đoạn tổng kết tone động viên
- phù hợp để manager dùng làm “opening statement” trong review

### Mục tiêu:

Biến tab này thành nơi “đọc xong là hiểu người này ngay”.

---

# 6.4 User Flows in Tab 1

### User can:

- hover/click radar segment → jump to Tab 2 filtered dimension
- click strength/growth item → open evidence drawer
- click milestone summary → jump to Tab 5

---

# 7. TAB 2 — COMPETENCY & EVIDENCE

# Wireframe Text Spec

---

# 7.1 Business Purpose

Tab này trả lời:

> “Vì sao hệ thống lại đánh giá như vậy?”

Đây là tab quan trọng nhất cho trust.

---

# 7.2 Layout Structure

### Layout:

- Left: Filter panel
- Main: Competency dimension cards
- Right / Drawer: Evidence trace detail

---

# 7.3 Components

---

## Component 1 — Dimension Filter Panel

### Filter options:

- By category:
  - Core Technical Execution
  - Domain Technical Capability
  - Technical Mindset
  - Professional & Team Effectiveness

- By confidence:
  - High
  - Moderate
  - Low

- By opportunity:
  - High opportunity
  - Low opportunity
  - Insufficient opportunity

- Search dimension

---

## Component 2 — Competency Summary Header

### Hiển thị:

- Total dimensions evaluated
- Dimensions with strong confidence
- Dimensions with insufficient evidence
- Dimensions flagged by user

---

## Component 3 — Dimension Card List

Mỗi dimension nên là một expandable card.

---

### Dimension Card Structure

#### Header

- Dimension name
- Score / maturity level
- Confidence badge
- Opportunity badge
- Delta badge

#### Summary line

- 1–2 câu giải thích dimension hiện tại

#### Expandable body gồm 5 khối:

---

### A. Observed Pattern Summary

Ví dụ:

- “Observed as a reliable execution strength across multiple delivery contexts”
- “Shows growing but inconsistent quality discipline”

---

### B. Positive Indicators

Danh sách các pattern support điểm mạnh

---

### C. Development Indicators

Danh sách các pattern support vùng cần cải thiện

---

### D. Counter-Evidence / Limitation Note

Rất quan trọng.

Ví dụ:

- “Some evidence suggests this pattern may be context-specific rather than consistent”
- “Observed mostly in one project context”

=> Cái này làm sản phẩm có não.

---

### E. Supporting Evidence List

Danh sách evidence snippets

Mỗi evidence item nên có:

- short title
- timestamp
- source tag
- short excerpt
- “View trace” button

---

## Component 4 — Evidence Trace Drawer

Khi user click “View trace”

### Drawer hiển thị:

- Evidence title
- Context summary
- Time
- Related dimension(s)
- Supporting excerpt
- Full trace link / source pointer
- Why this evidence matters
- Optional nearby context snippet

### Actions:

- Mark as relevant / irrelevant
- Flag misinterpretation

---

## Component 5 — Assessment Validation Action

Mỗi dimension card nên có:

### Actions:

- “Looks accurate”
- “Questionable”
- “Incorrect”
- “Add note”

---

# 7.4 User Flows in Tab 2

### Flow A — Understand a score

- User clicks dimension
- Reads explanation
- Opens supporting evidence
- Confirms / disputes

### Flow B — Investigate weak area

- User filters low score dimensions
- Reads repeated patterns
- Opens evidence
- Decides whether system is fair

### Flow C — Manager review flow

- Manager scans strongest and weakest dimensions
- Clicks evidence before using it in review

---

# 8. TAB 3 — KPT

# Wireframe Text Spec

---

# 8.1 Business Purpose

Tab này trả lời:

> “Nếu nhìn lại khoảng thời gian này như một retrospective, người này nên giữ gì, sửa gì, thử gì?”

Đây là tab growth-oriented nhất.

---

# 8.2 Layout Structure

### Layout:

3-column hoặc stacked sections:

- Keep
- Problem
- Try

---

# 8.3 Components

---

## Component 1 — KPT Header Summary

### Hiển thị:

- 1 đoạn intro ngắn:
  - “This retrospective is generated from observed patterns during the selected period.”

- reminder:
  - “Use as coaching support, not absolute judgment.”

---

## Component 2 — KEEP Section

### Hiển thị:

Danh sách 3–6 item “nên giữ”

Mỗi item gồm:

- Title
- Why it matters
- Supporting pattern
- Optional evidence button

### Example patterns:

- Reliable follow-through in implementation
- Strong willingness to clarify before acting
- Helpful cross-functional support behavior

---

## Component 3 — PROBLEM Section

### Hiển thị:

Danh sách 3–6 item “vấn đề đáng chú ý”

Mỗi item gồm:

- Problem title
- Observed pattern explanation
- Why it creates friction
- Frequency / confidence tag
- Optional evidence button

### Rule:

Không dùng ngôn ngữ phán xét.
Phải nói theo pattern, không nói theo identity.

---

## Component 4 — TRY Section

### Hiển thị:

Danh sách 3–6 next-step suggestions

Mỗi item gồm:

- Actionable experiment
- Why this is the right next step
- Which problem / growth area it maps to
- Expected improvement if practiced

### Example:

- “Before handoff, adopt a 3-point completion check to reduce avoidable clarification loops”
- “When debugging, write down one hypothesis before trying fixes”

---

## Component 5 — Development Focus Box

### Hiển thị:

- Suggested focus for next review period
- 1–2 development themes only

Ví dụ:

- “Focus next quarter: reliability under ambiguity”
- “Focus next quarter: stronger delivery communication”

### Rule:

Không nên đưa quá nhiều.
Tối đa 2 themes.

---

# 8.4 User Flows in Tab 3

### User can:

- click each K/P/T item → open evidence or linked dimension
- export KPT as coaching notes (future)
- manager dùng trực tiếp cho 1:1

---

# 9. TAB 4 — CASE-BASED FEEDBACK

# Wireframe Text Spec

---

# 9.1 Business Purpose

Tab này trả lời:

> “Những case nào thực sự đáng học từ trong giai đoạn này?”

Đây là tab giúp feedback trở nên cụ thể và có ích.

---

# 9.2 Layout Structure

### Layout:

- Case list on left / top
- Selected case detail on right / below

---

# 9.3 Components

---

## Component 1 — Case Summary Header

### Hiển thị:

- Number of notable cases
- Number of recurring patterns
- Number of high-impact lessons

---

## Component 2 — Case List

Mỗi case card gồm:

- Case title
- Category tag
- Impact level
- Confidence
- Date / period
- Short one-line summary

### Categories có thể gồm:

- Communication / handoff
- Quality miss
- Ownership gap
- Good recovery
- Strong technical decision
- Debugging lesson
- Collaboration lesson
- Delivery / reliability lesson

---

## Component 3 — Case Detail Panel

Khi click 1 case, hiển thị đầy đủ:

---

### A. What Happened

Mô tả ngắn gọn tình huống

### B. Why It Matters

Tại sao case này đáng chú ý

### C. Observed Pattern

Pattern lớn mà case này đại diện

### D. Better Alternative

Lẽ ra có thể làm gì tốt hơn

### E. Next-Time Guidance

Lần sau nên làm cụ thể thế nào

### F. Related Dimensions

Link tới các dimension liên quan ở Tab 2

### G. Supporting Evidence

Danh sách evidence cụ thể

---

## Component 4 — Improvement Theme Summary

Ở cuối tab nên có 1 block:

### “Most recurring lessons from this period”

Tóm 3–5 bài học lớn nhất.

---

# 9.4 User Flows in Tab 4

### Flow A — Coaching review

- Manager mở từng case
- dùng để thảo luận cụ thể

### Flow B — Self reflection

- Member đọc case
- thấy được “mình cần sửa chỗ nào” một cách cụ thể

### Flow C — Jump to evidence

- User click evidence → open trace drawer

---

# 10. TAB 5 — JOURNEY & MILESTONES

# Wireframe Text Spec

---

# 10.1 Business Purpose

Tab này trả lời:

> “Nhìn dài hạn, người này đã đi qua hành trình phát triển như thế nào?”

Đây là tab giúp sản phẩm vượt khỏi “dashboard snapshot”.

---

# 10.2 Layout Structure

### Layout:

- Timeline / journey visualization
- Milestone cards
- Growth path interpretation
- Long-term reflection panel

---

# 10.3 Components

---

## Component 1 — Journey Header

### Hiển thị:

- Current growth path summary
- Current stage / trajectory
- Time span covered

Ví dụ:

- “Emerging technical owner with growing cross-context reliability”
- “Trend: strengthening implementation discipline and ownership”

---

## Component 2 — Timeline Visualization

### Timeline should show:

- Major milestones
- Notable learning moments
- Major ownership shifts
- Strong contributions
- Significant setbacks or lessons
- Role / scope change if relevant

### Each milestone node should have:

- title
- date
- short summary
- impact tag

---

## Component 3 — Milestone Detail Card

Khi click 1 milestone:

### Hiển thị:

- milestone title
- what changed
- why it mattered
- linked evidence / source references
- related development themes

---

## Component 4 — Growth Pattern Summary

### Hiển thị:

- recurring long-term strengths
- recurring long-term struggles
- most meaningful developmental shifts

---

## Component 5 — Development Path Interpretation

Đây là phần rất mạnh nếu làm đúng.

### Hiển thị:

- Current path archetype / growth path
- Why the system thinks so
- Suggested next-stage focus

Ví dụ:

- Reliable Executor
- Emerging Owner
- Quality Guardian
- System Thinker
- Technical Mentor
- Delivery Driver

### Important:

Không được biến thành gắn nhãn identity cứng nhắc.
Nó chỉ là “observed growth tendency”.

---

# 10.4 User Flows in Tab 5

### User can:

- click milestone → see evidence
- click path explanation → open supporting dimensions
- use for annual / half-year reflection

---

# 11. CROSS-TAB UX BEHAVIORS

---

# 11.1 Shared Interaction Rules

### From any tab, user should be able to:

- open evidence trace
- flag wrong insight
- jump to related dimension
- jump to related milestone
- see confidence / opportunity note

---

# 11.2 Shared State Rules

### Global loading states:

- No data yet
- Collecting data
- Analyzing
- Ready
- Partial result
- Failed

### Empty states:

- No evidence found in selected period
- Not enough opportunity to evaluate this dimension
- No notable milestones yet

---

# 11.3 Shared Trust UX

Mỗi tab nên có subtle trust notes như:

- “Some insights may be low confidence due to limited evidence”
- “This profile reflects observed work patterns, not absolute ability”

Đây là UX bắt buộc với sản phẩm kiểu này.

---

---

# PART B

# FORMAL BRD / SRS DOCUMENT

---

# BUSINESS REQUIREMENTS DOCUMENT (BRD)

# +

# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)

---

# 1. DOCUMENT CONTROL

## 1.1 Document Title

Developer Growth & Evidence-Based Performance Insight Platform

## 1.2 Document Type

Business Requirements Document (BRD) and Software Requirements Specification (SRS)

## 1.3 Purpose

This document defines the business goals, functional requirements, non-functional requirements, user roles, workflows, business rules, and acceptance criteria for an internal platform that generates evidence-based growth and performance insights for software developers.

---

# 2. BUSINESS CONTEXT

---

## 2.1 Background

Organizations increasingly rely on digital work artifacts and collaboration traces to understand how technical contributors operate. However, most developer performance and growth evaluations remain fragmented, memory-driven, subjective, and difficult to explain.

Managers often lack a consistent way to:

- understand a developer’s strengths and growth areas,
- connect conclusions to evidence,
- compare contribution patterns across time,
- and turn historical work into useful developmental guidance.

This product addresses that gap by generating a structured, evidence-traceable, and time-bounded profile for each developer.

---

## 2.2 Business Problem

Current evaluation and growth review processes for software developers often suffer from:

- recency bias,
- visibility bias,
- role-insensitive interpretation,
- poor traceability,
- generic or non-actionable feedback,
- and loss of historical learning over time.

As a result, many reviews are:

- inconsistent,
- difficult to defend,
- emotionally sensitive,
- and weak as coaching tools.

---

## 2.3 Business Goal

To provide an internal platform that helps organizations generate explainable, evidence-based, and development-oriented insight profiles for software developers over selected time periods.

---

# 3. BUSINESS OBJECTIVES

The system shall support the following business objectives:

1. Provide structured developer profiling over a selected time period.
2. Surface technical and behavioral strengths and development areas.
3. Link major conclusions to traceable evidence.
4. Improve the quality and fairness of coaching and review conversations.
5. Preserve important long-term milestones and growth patterns.
6. Support manager review, self-reflection, and development planning.
7. Allow users to challenge or validate generated insights.

---

# 4. PRODUCT SCOPE

---

## 4.1 In Scope

The first release shall include:

- Organization / Team / Member hierarchy
- Member profile generation
- Time-bounded analysis
- Five-tab member profile workspace
- Evidence traceability
- Insight validation / flagging
- Manual refresh / re-analysis
- Long-term milestone view

---

## 4.2 Out of Scope

The first release shall not include:

- automated promotion decisions
- compensation recommendations
- hiring recommendations
- project staffing optimization
- workforce planning optimization
- cross-organization calibration workflows
- automated career ladder decisions

---

# 5. STAKEHOLDERS

---

## 5.1 Business Stakeholders

- Engineering Managers
- Team Leads
- Talent Development / HRBP stakeholders
- Technical Mentors

## 5.2 Product Stakeholders

- Product Owner
- Business Analyst
- UX Designer

## 5.3 Technical Stakeholders

- Engineering Team
- Data / AI Logic Owner
- Platform / Integration Owner

---

# 6. USER ROLES / ACTORS

---

## 6.1 Admin

Responsible for managing organization and team structure.

### Capabilities

- Create organization
- Create team
- Add member
- Manage hierarchy

---

## 6.2 Manager / Reviewer

Responsible for reviewing and interpreting member profiles.

### Capabilities

- View member profile
- Select time range
- Refresh analysis
- Review evidence
- Validate or dispute insights
- Use output in review conversations

---

## 6.3 Member / Individual Contributor

Responsible for viewing and reflecting on their own profile.

### Capabilities

- View own profile
- Review evidence
- Explore strengths and growth areas
- Reflect on KPT and case-based feedback
- Flag inaccurate insights

---

# 7. ASSUMPTIONS

1. A member has enough accessible work traces to support some level of analysis.
2. Not all dimensions will have enough evidence in every time period.
3. The platform is used as a support tool, not as a sole source of performance judgment.
4. Historical milestones may be retained across longer time spans than the current analysis window.

---

# 8. CONSTRAINTS

1. The maximum selectable analysis window shall be 1 year.
2. If the user selects a time range greater than 1 year, the system shall automatically reset it to the maximum valid range and display a warning.
3. Long-term milestone retention may extend up to 5 years.
4. The system shall support explainability and evidence traceability for major insights.

---

# 9. HIGH-LEVEL FUNCTIONAL REQUIREMENTS

---

## FR-01 Organization Management

The system shall allow authorized users to create and manage organizations.

## FR-02 Team Management

The system shall allow authorized users to create and manage teams within an organization.

## FR-03 Member Management

The system shall allow authorized users to create and manage members within a team.

## FR-04 Member Profile Generation

The system shall generate a structured insight profile for each member.

## FR-05 Time Range Selection

The system shall allow users to select a date range for analysis, subject to business rules.

## FR-06 Re-analysis / Refresh

The system shall allow users to manually refresh and regenerate a member profile.

## FR-07 Evidence Traceability

The system shall allow users to inspect evidence supporting generated insights.

## FR-08 Insight Validation

The system shall allow users to validate, dispute, or flag insights.

## FR-09 Long-Term Journey View

The system shall preserve and display milestone-based longitudinal contribution history.

---

# 10. DETAILED FUNCTIONAL REQUIREMENTS

---

# 10.1 Organization / Team / Member Management

## FR-10.1.1

The system shall allow a user with appropriate permission to create an organization.

## FR-10.1.2

The system shall allow a user with appropriate permission to create a team under an organization.

## FR-10.1.3

The system shall allow a user with appropriate permission to add a member under a team.

## FR-10.1.4

The system shall display the hierarchy Organization → Team → Member in a persistent navigation panel.

### Acceptance Criteria

- Given an authorized user,

- when they create an organization,

- then the organization shall appear in the left navigation tree.

- Given an organization exists,

- when the user creates a team,

- then the team shall appear nested under the organization.

- Given a team exists,

- when the user adds a member,

- then the member shall appear nested under the team.

---

# 10.2 Member Workspace Header

## FR-10.2.1

The system shall display a member workspace header when a member is selected.

## FR-10.2.2

The workspace header shall include:

- member name,
- organization/team breadcrumb,
- current selected time range,
- last analyzed timestamp,
- analysis status,
- refresh action.

### Acceptance Criteria

- Given a member is selected,
- when the profile workspace loads,
- then the workspace header shall display the member identity and current analysis context.

---

# 10.3 Time Range Selection

## FR-10.3.1

The system shall allow users to select a date range for profile analysis.

## FR-10.3.2

The maximum valid date range shall be 1 year.

## FR-10.3.3

If the selected date range exceeds 1 year, the system shall:

- automatically reset the range to the maximum valid range,
- and display a warning message.

### Acceptance Criteria

- Given a user selects a valid date range,

- when they confirm the selection,

- then the system shall use that range for analysis.

- Given a user selects a date range longer than 1 year,

- when they confirm the selection,

- then the system shall automatically adjust the range and show a warning.

---

# 10.4 Member Profile Tabs

The system shall display the following tabs for each analyzed member:

- Overview
- Competency & Evidence
- KPT
- Case-Based Feedback
- Journey & Milestones

---

# 10.5 Overview Tab

## FR-10.5.1

The system shall display a high-level contribution and capability overview for the selected member and period.

## FR-10.5.2

The Overview tab shall include:

- profile summary
- capability visualization
- contribution highlights
- observed strengths
- observed growth areas
- optional delta from previous period

### Acceptance Criteria

- Given a member profile is available,
- when the user opens the Overview tab,
- then the system shall display a summary and capability overview for the selected period.

---

# 10.6 Competency & Evidence Tab

## FR-10.6.1

The system shall display detailed skill and competency dimensions for the selected member.

## FR-10.6.2

Each dimension shall include:

- observed level / score
- confidence
- opportunity note
- explanation summary
- supporting evidence
- optional counter-evidence / limitation note

## FR-10.6.3

The user shall be able to filter competency dimensions.

## FR-10.6.4

The user shall be able to inspect supporting evidence for each dimension.

### Acceptance Criteria

- Given a competency dimension is shown,

- when the user expands the dimension,

- then the system shall display supporting explanation and evidence.

- Given a supporting evidence item exists,

- when the user clicks “View trace”,

- then the system shall display the evidence detail and context.

---

# 10.7 KPT Tab

## FR-10.7.1

The system shall generate and display Keep / Problem / Try insights for the selected member and period.

## FR-10.7.2

The KPT tab shall include:

- Keep items
- Problem items
- Try items
- suggested next focus area(s)

### Acceptance Criteria

- Given a member profile is available,
- when the user opens the KPT tab,
- then the system shall display structured retrospective-style insights.

---

# 10.8 Case-Based Feedback Tab

## FR-10.8.1

The system shall display notable or recurring cases identified within the selected period.

## FR-10.8.2

Each case shall include:

- case summary
- why it matters
- observed pattern
- suggested better alternative
- next-time guidance
- supporting evidence

### Acceptance Criteria

- Given notable cases exist,
- when the user selects a case,
- then the system shall display the full case detail and associated evidence.

---

# 10.9 Journey & Milestones Tab

## FR-10.9.1

The system shall display a milestone-based growth journey for the selected member.

## FR-10.9.2

The Journey tab shall include:

- timeline visualization
- milestone details
- growth pattern summary
- development path interpretation

## FR-10.9.3

The system shall retain milestone history beyond the active analysis window, up to the supported retention period.

### Acceptance Criteria

- Given milestone data exists,
- when the user opens the Journey tab,
- then the system shall display a timeline and milestone-based growth view.

---

# 10.10 Insight Validation / Flagging

## FR-10.10.1

The system shall allow users to indicate whether an insight appears accurate, questionable, or incorrect.

## FR-10.10.2

The system shall allow users to optionally provide a note when flagging an insight.

### Acceptance Criteria

- Given an insight is displayed,
- when the user selects “Questionable” or “Incorrect”,
- then the system shall capture the feedback and store the validation signal.

---

# 10.11 Refresh / Re-analysis

## FR-10.11.1

The system shall allow users to manually refresh a member profile.

## FR-10.11.2

Refreshing a profile shall trigger re-analysis for the selected time range.

### Acceptance Criteria

- Given a member profile exists,
- when the user clicks refresh,
- then the system shall regenerate the profile for the current selected period.

---

# 11. NON-FUNCTIONAL REQUIREMENTS

---

## NFR-01 Explainability

The system shall provide explainable outputs for major assessments.

## NFR-02 Auditability

The system shall support evidence traceability for review and verification.

## NFR-03 Trustworthiness

The system shall avoid unsupported over-claiming and should indicate uncertainty where appropriate.

## NFR-04 Usability

The system shall present insight in a form understandable to managers and individual contributors.

## NFR-05 Consistency

The system shall produce consistent interpretations for similar patterns under similar conditions.

## NFR-06 Fairness Awareness

The system shall distinguish between lack of evidence and observed weakness.

## NFR-07 Performance

The system should provide a usable profile experience without excessive waiting for standard analysis windows.

---

# 12. BUSINESS RULES

---

## BR-01

A member must belong to exactly one team.

## BR-02

A team must belong to exactly one organization.

## BR-03

A member profile shall be analyzed within a bounded date range.

## BR-04

The maximum selectable analysis period shall be 1 year.

## BR-05

If the user selects an invalid date range, the system shall auto-correct and notify the user.

## BR-06

The system shall not present strong unsupported conclusions without evidence traceability.

## BR-07

The system shall not treat missing evidence as equivalent to low capability.

## BR-08

The system shall support user review and correction of generated insights.

## BR-09

Long-term milestone retention may extend beyond the current analysis window.

## BR-10

The platform shall be positioned as a growth and review support tool, not as an absolute evaluator.

---

# 13. REPORTING / OUTPUT REQUIREMENTS

The system shall produce outputs that are suitable for:

- manager review preparation,
- self-reflection,
- growth discussion,
- retrospective support,
- long-term development tracking.

---

# 14. RISKS & DEPENDENCIES

---

## Risks

- false confidence from weak evidence
- role bias
- visibility bias
- user distrust if outputs feel unfair
- misuse as a punitive tool

## Dependencies

- sufficient accessible work artifacts
- stable identity mapping for members
- traceable evidence references
- consistent profile generation workflow

---

# 15. FUTURE ENHANCEMENTS

- period-to-period comparison
- team-level capability heatmaps
- role-aware development ladders
- baseline evolution after major projects
- exportable coaching packets
- manager annotation layer
- team calibration workflows
