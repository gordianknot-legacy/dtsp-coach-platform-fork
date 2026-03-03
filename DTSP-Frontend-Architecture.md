# DTSP Platform — Frontend Architecture (Master Context File)

**Version:** 1.1
**Last Updated:** February 27, 2026
**Pairs With:** DTSP-Backend-Architecture.md v1.0
**Purpose:** Complete front-end architecture for DTSP coaching CRM — role workspaces, screen inventory, component library, and screen specifications

---

## Front-End Ground Rules (Never Violate These)

1. **MS-8 is the only service called for any dashboard or aggregated view.** Never call MS-4 or MS-5 directly for display data on CM or Admin screens.
2. **Role workspaces are genuinely different surfaces** — not the same UI with permissions toggled. Each role gets its own layout, navigation, and component set.
3. **Every screen has exactly one primary action.** Secondary actions are always subordinate visually.
4. **AI output is never blocking.** If MS-10 is unavailable, the screen shows blank fields, not an error state.
5. **No screen navigates away from the current workspace to complete a single-role task.** Side panels and inline expansion handle detail without context loss.
6. **Empty states are designed explicitly.** Every screen has a defined state for: no data yet / loading / error / genuinely empty.
7. **Desktop-first for all roles.** No mobile breakpoints at MVP. All layouts assume minimum 1280px width.
8. **Never use fixed pixel widths.** Always use Tailwind relative units (w-full, max-w-lg, flex-1, percentage grids). This makes mobile responsiveness additive later without restructuring.
9. **One Claude Code session per screen.** Each screen spec below is self-contained enough to build in isolation.

---

## Tech Stack (Front End)

- **Framework:** Next.js (React) — SSR for fast first load, API routes for BFF layer
- **Styling:** Tailwind CSS — utility-first, no custom CSS files unless unavoidable. Desktop-first base styles, no mobile prefixes at MVP.
- **State:** React Query (TanStack Query) — server state, caching, background refresh
- **Forms:** React Hook Form — lightweight, no unnecessary re-renders
- **Charts:** Recharts — simple, Tailwind-compatible, sufficient for MVP
- **PDF Export:** Server-side PDF generation via MS-8
- **Language:** i18n-ready from day one (Hindi/English toggle structure in place, English only at MVP)

---

## Role Workspaces Overview

| Role | Primary Job | Entry Point | Layout |
|------|-------------|-------------|--------|
| Coach | Conduct calls, capture sessions, manage teacher portfolio | Coach Home | Desktop, top nav |
| Coach Manager | Review coaches, manage escalations, governance reporting | CM Home | Desktop, top nav |
| Program Admin | Configure platform, manage rosters, oversee all cohorts | Admin Home | Desktop, left sidebar |
| Govt Observer | Read-only state-level snapshot | State Snapshot | Desktop, single surface |

---

## Layer 1: Role Workspaces

### 1A. Coach Workspace

**Entry point after login:** Coach Home (C-01)
**Navigation:** Top nav bar — Today/Tomorrow/This Week (tab states on C-01) | Teachers | Content | [Due Actions badge]
**Persistent elements:** Due action badge count, current date label

**What a coach needs in one visit:**
- See today's / tomorrow's / this week's calls and confirmation status
- Start a call or handle a no-show / reschedule
- Complete post-call capture and generate WhatsApp summary
- Check overdue action steps
- Access teacher profile before a call

**What a coach must never see:** Other coaches' data, CM review data, platform usage stats, spot-check ratings on their own sessions

---

### 1B. Coach Manager Workspace

**Entry point after login:** CM Home (CM-01)
**Navigation:** Top nav bar — Home | My Coaches | All Teachers | Snapshot | Exports
**Persistent elements:** "Today's Attention" card (top 3-5 urgent items), period selector (sticky)

**What a CM needs in one visit:**
- See which coaches need attention today (triage board)
- Conduct a full 1:1 review without leaving the coach's workspace
- Review portfolio-level health across all coaches
- Handle escalations inline
- View and export the leadership snapshot

**What a CM must never see:** Coach-level platform usage shown to coaches, raw session transcripts

---

### 1C. Program Admin Workspace

**Entry point after login:** Admin Home (A-01)
**Navigation:** Left sidebar — Dashboard | Org Setup | Users | Rosters | Standards | Audit Log
**Persistent elements:** Setup warnings / incomplete configuration alerts (top banner)

**What an Admin needs in one visit:**
- See any incomplete cohort configurations
- Manage users, rosters, assignments
- Configure standards and templates
- Review audit trail

---

### 1D. Govt Observer Workspace

**Entry point after login:** State Snapshot (O-01)
**Navigation:** None — single surface
**Persistent elements:** State name + period label always visible, Export button, filter bar

**Identical to CM Leadership Snapshot (Flow E) but:**
- Scoped to observer's state org unit
- No clickable deep-links (read-only — all metrics non-interactive)
- District-level breakdown toggle available
- Export available

---

## Layer 2: Screen Inventory

### Coach Screens (7 screens)

| ID | Screen Name | Trigger | Backend Calls | Flow Reference |
|----|-------------|---------|---------------|----------------|
| C-01 | Coach Home | Login | MS-4 /sessions, MS-4 /due-actions, MS-6 /at-risk-today, MS-6 /planning/week, MS-5 /vba/due-list | Flow A |
| C-02 | Call Workspace | Click session row | MS-4 /sessions/:id, MS-10 /ai/pre-session-brief, MS-2 /templates | Flow A |
| C-03 | After Call Screen | Click "End Call" | MS-10 /ai/draft-summary, MS-4 /sessions/:id/notes, MS-9 /content | Flow A |
| C-04 | VBA Workspace | Click VBA session row | MS-5 /vba/sessions/:id, MS-2 /templates | Flow B |
| C-05 | After VBA Screen | Click "End VBA" | MS-5 /vba/sessions/:id/close, MS-10 /ai/draft-summary | Flow B |
| C-06 | Teacher Profile | Click teacher name | MS-3 /teachers/:id, MS-4 /teachers/:id/interaction-history | Flow A, B |
| C-07 | Content Library | Nav: Content | MS-9 /content, MS-9 /webinars | — |

---

### Coach Manager Screens (9 screens)

| ID | Screen Name | Trigger | Backend Calls | Flow Reference |
|----|-------------|---------|---------------|----------------|
| CM-01 | CM Home | Login | MS-8 /kpis/portfolio, MS-7 /escalations/overdue, MS-1 /activity | Flow D |
| CM-02 | My Coaches Triage | Nav: My Coaches | MS-8 /kpis/coach (all), MS-7 /escalations (counts) | Flow D |
| CM-03 | Coach 1:1 Workspace | Click coach card | MS-8 /kpis/coach/:id, MS-7 /escalations?coach_id, MS-4 /sessions (list), MS-8 /teachers/health, MS-1 /activity/coach | Flow D |
| CM-04 | Session Detail (inline) | Expand session row in CM-03 | MS-4 /sessions/:id | Flow D |
| CM-05 | Teacher Side Panel | Click teacher in CM-03 or CM-06 | MS-3 /teachers/:id, MS-4 /teachers/:id/interaction-history | Flow D |
| CM-06 | All Teachers View | Nav: All Teachers | MS-8 /teachers/health?cohort, MS-3 /teachers?cohort | Flow D |
| CM-07 | Escalation Queue | Badge / Nav | MS-7 /escalations?cohort_id | Flow D |
| CM-08 | Leadership Snapshot | Nav: Snapshot | MS-8 /snapshot/:cohort_id | Flow E |
| CM-09 | Exports | Nav: Exports | MS-8 /exports/csv, MS-8 /exports/pdf/snapshot | Flow E |

---

### Program Admin Screens (7 screens)

| ID | Screen Name | Trigger | Backend Calls | Flow Reference |
|----|-------------|---------|---------------|----------------|
| A-01 | Admin Home | Login | MS-2 /health/config-complete, MS-1 /users (counts), MS-2 /audit-log | Flow C |
| A-02 | Org Setup | Sidebar: Org Setup | MS-2 /org-units | Flow C |
| A-03 | User Management | Sidebar: Users | MS-1 /users?cohort_id | Flow C |
| A-04 | Roster Management | Sidebar: Rosters | MS-3 /teachers?cohort_id, MS-3 /roster/import, MS-3 /udise/import | Flow C |
| A-05 | Assignments | Sidebar: Rosters > Assign | MS-3 /assignments, MS-3 /teachers, MS-3 /coaches | Flow C |
| A-06 | Standards & Templates | Sidebar: Standards | MS-2 /standards, MS-2 /templates, MS-2 /escalation-rules | Flow C |
| A-07 | Audit Log | Sidebar: Audit Log | MS-2 /audit-log | Flow C |

---

### Govt Observer Screens (1 screen)

| ID | Screen Name | Trigger | Backend Calls | Flow Reference |
|----|-------------|---------|---------------|----------------|
| O-01 | State Snapshot (read-only) | Login | MS-8 /snapshot/:state_org_unit_id | Flow E |

---

**Total screens at MVP: 24**

---

## Layer 3: Shared Component Library

Define once, reuse everywhere. Build the entire component library before building any screen.

### 3A. Data Display Components

---

**SessionRow**
Used in: C-01, C-02 (interaction history), CM-03, CM-04
Props:
- teacher_name, scheduled_at, status, confirmation_status
- focus_tag, summary_sent (bool), session_type (coaching/vba)
Variants:
- `default` — coach today/week list
- `cm-review` — adds spot-check indicator column
- `history` — compact, used in teacher profile timeline
Status colours:
- scheduled = grey
- completed = green
- no_show = red
- rescheduled = amber
- cancelled = muted grey
Rules:
- Summary not sent = amber highlight on row regardless of status
- VBA sessions carry a distinct badge

---

**TeacherCard**
Used in: C-06, CM-05, CM-06, A-04, A-05
Props:
- name, school, block, designation, phone
- ryg_status, days_since_touch, vba_status, reschedule_count
Variants:
- `list-row` — compact horizontal, used in tables
- `side-panel` — expanded vertical, used in CM-05
- `admin` — includes assignment info, used in A-04/A-05
Rules:
- RYGBadge always present when ryg_status is available
- Phone number shown only to Coach and Admin roles (not CM in read contexts)

---

**RYGBadge**
Used in: everywhere a teacher status appears
Props: status (R/Y/G), size (sm/md/lg), show_label (bool)
Rules:
- Never use colour alone — always pair with label or icon
- R = red background, "At Risk" label
- Y = amber background, "Watch" label
- G = green background, "On Track" label

---

**EscalationItem**
Used in: CM-03 (inline panel), CM-07 (queue)
Props:
- trigger_type, teacher_name, coach_name
- status, created_at, days_open, resolution_category (if actioned)
Variants:
- `inline` — used inside 1:1 Workspace panels
- `queue-row` — used in full Escalation Queue
Rules:
- Always shows days open
- Amber highlight if open > threshold (from MS-2)
- Resolution fields (category dropdown + notes) appear inline on expand

---

**KPICard**
Used in: CM-01, CM-02, CM-03, CM-08, O-01
Props:
- label, value, trend (up/down/stable)
- trend_value, period, color_signal (green/amber/red/neutral)
Rules:
- Trend direction always shown — a number without direction is incomplete
- color_signal drives background tint, not just text colour
- Clicking a KPICard in CM-08/O-01 deep-links to relevant operational view (CM only — not Observer)

---

**CallFunnel**
Used in: CM-08, O-01, CM-01 (summary card)
Props:
- planned, scheduled, completed
- no_show, rescheduled, cancelled
- two_touch_coverage (count + % + target)
- period_label
Rules:
- Always shows full funnel — never just completion rate in isolation
- Two-touch coverage highlighted as primary metric with target indicator
- Directional vs previous period shown on completion rate line

---

**VBAStatusBadge**
Used in: C-01, CM-03, CM-06, CM-08
Props: status (due/planned/completed/overdue), quarter_label, days_to_quarter_end
Colours:
- overdue = red
- due (unplanned) = amber
- planned = blue
- completed = green
Rules:
- If overdue AND days_to_quarter_end < 30 → red with urgency indicator

---

**CoachCard**
Used in: CM-02 (triage board)
Props:
- coach_name, one_on_one_status (pending/done)
- completion_pct, missing_summaries_count
- open_escalations_count, last_login
Rules:
- Sorted by urgency: most flags first, done 1:1s at bottom
- Color signals: completion < threshold = red, missing summaries > 0 = amber
- One_on_one_status done → card moves to bottom, greyed slightly

---

### 3B. Input & Action Components

---

**FocusTagSelector**
Used in: C-02 (Call Workspace)
Props: selected, on_change, required (bool)
Options: Literacy | Numeracy | Relationship | Off-script
(Options fetched from MS-2 /templates — never hardcoded)
Rules:
- Single-select
- Required field — "End Call" button disabled until selected
- Visual: pill/chip selector, not a dropdown

---

**ActionStepInput**
Used in: C-03 (After Call), C-06 (Teacher Profile)
Props: steps[], on_add, on_update, on_mark_done, max_steps (default 3)
Rules:
- Each step requires: description (text) + due_date (date picker)
- Observable language prompt shown as placeholder: "What will the teacher do differently?"
- Carried-forward steps shown with prior session label
- Max 3 per session (configurable via MS-2)

---

**ConfirmationStatusToggle**
Used in: C-01, C-02
Props: status (pending/received/nudged), session_id, on_change
Rules:
- One-tap update — not a form, not a modal
- Immediately calls MS-4 PUT /sessions/:id/status on tap
- Visual: three-state pill toggle

---

**RescheduleDrawer**
Used in: C-02, C-04 (VBA Workspace)
Props: session_id, on_save, session_type
Fields:
- new_window: date + time picker
- reason_category: dropdown (options from MS-2 — never hardcoded)
Behaviour:
- Slides in from right (drawer pattern)
- On save: calls MS-4, increments counter, closes drawer, returns to prior screen
- System warns if new window is past quarter-end (VBA only)

---

**SpotCheckRatingPanel**
Used in: CM-04 (Session Detail inline in CM-03)
Props: session_id, existing_ratings, rubric (from MS-2)
Fields:
- agenda_adherence: 1-5 scale (anchors from MS-2)
- action_item_clarity: 1-5 scale (anchors from MS-2)
- tone: Warm / Neutral / Tense (qualitative, labelled as CM-subjective)
- feedback_notes: free text
Rules:
- Rubric scales and anchor text always fetched from MS-2 — never hardcoded
- Save button disabled until all fields complete
- CM has no edit access to session notes — only rating fields
- Random sample sessions marked with subtle indicator

---

**CommitmentInput**
Used in: CM-03 (1:1 Workspace bottom)
Props: commitments[], period, on_save, prior_commitments[]
Rules:
- Free text only — no dropdown categories
- Prior period commitments shown above with Done/Not Done toggles
- Toggles auto-save on change — no separate save required
- New commitment save triggers 1:1 done status
- Always visible at bottom of CM-03 — no scrolling required to reach it

---

**MovementPlanEditor**
Used in: CM-05 (Teacher Side Panel)
Props: teacher_id, existing_plan, cm_id, coach_read_only (bool)
Fields:
- target_status: Y or G (dropdown)
- target_date: date picker
- actions[]: each with description + owner + deadline
Rules:
- CM-editable, coach sees read-only version
- Save inline — no modal
- Clears "Red Teacher — No Movement Plan" escalation on save

---

### 3C. Layout Components

---

**WorkspaceShell**
The outer layout wrapper for each role workspace.
Props: role, nav_items, active_item, notification_badges{}
Variants:
- `coach` — top nav, right-side notification badge
- `cm` — top nav, period selector in nav bar
- `admin` — left sidebar, top breadcrumb
- `observer` — minimal top bar, export button only
Rules:
- Never use the same shell variant for two different roles
- Notification badges scoped per role — coach sees due actions, CM sees escalations

---

**SidePanel**
Used in: CM-03, CM-05 — opens over 1:1 Workspace without navigating away
Props: title, content, on_close, width (sm=400px / md=600px / lg=800px)
Rules:
- Never full-screen — always preserves parent context visible behind it
- Overlay with subtle backdrop — parent screen remains readable
- Closing returns to exact prior state of parent screen

---

**InlineExpandable**
Used in: CM-03 (sessions panel, escalations panel, at-risk panel, platform usage panel)
Props: label, count_badge, children, default_expanded (bool)
Rules:
- Expand/collapse within current screen — never navigates
- Count badge updates reactively when items change
- Collapsed state shows label + count only

---

**DueActionBanner**
Used in: C-01 (top), CM-01 (top)
Props: items[] (type, label, entity_id, link_to)
Rules:
- Dismissible per item with X button
- Auto-repopulates on next login if underlying issue not resolved
- Maximum 5 items shown — "and N more" if overflow
- Item types: incomplete_summary / overdue_action_step / unsaved_rating / incomplete_vba_response

---

**PeriodSelector**
Used in: CM-03, CM-08, O-01 — sticky, always accessible
Props: options[], selected, on_change
Options: This Week | This Month | This Quarter | Custom
Rules:
- Changing period refreshes ALL data on current screen simultaneously
- Custom option shows date range picker
- Selected period always visible in top bar — never hidden
- Default: This Week for CM-03, This Month for CM-08 and O-01

---

**FilterBar**
Used in: CM-08, O-01, CM-06, CM-07
Props: filters[] (type, options, selected), on_change, on_reset
Filter types available:
- coach_ids: multi-select (CM-08, CM-06)
- block_tags: multi-select (CM-08, O-01, CM-06)
- district_ids: multi-select (O-01, if multi-district)
- ryg_status: multi-select (CM-06)
- escalation_type: multi-select (CM-07)
- escalation_status: multi-select (CM-07)
Rules:
- Active filters shown as removable chips below filter bar
- "Showing filtered view" indicator when filters active
- Reset button clears all filters at once
- Filter state included in PDF export header

---

**EmptyState**
Used in: every screen
Props: icon, heading, subtext, action_label (optional), on_action (optional)
Variants:
- `no_data_yet` — first use, nothing configured
- `loading` — skeleton loader (not spinner)
- `error` — with retry option
- `genuinely_empty` — valid state, no data for period
Rules:
- Never show a blank white area — every empty container has an EmptyState
- Loading variant uses skeleton that matches the shape of the real content

---

**ReadinessChecklist**
Used in: A-01, A-02
Props: items[] (label, status: complete/incomplete/warning), cohort_name
Rules:
- Green tick = complete
- Red X = incomplete (blocking)
- Amber warning = incomplete but non-blocking
- Identical to Flow C item 28 checklist structure

---

### 3D. Utility Components

---

**WhatsAppDraftBox**
Used in: C-03 (After Call), C-05 (After VBA)
Props: draft_text, on_edit, on_copy, on_mark_sent, language (hi/en)
Rules:
- Always editable before copying — coach reviews before sending
- Copy button copies to clipboard
- "Mark sent" checkbox records timestamp via MS-4
- AIStatusIndicator shown above draft if AI-generated
- If draft unavailable: blank editable field with placeholder "Write your summary here"

---

**AIStatusIndicator**
Used in: C-02, C-03, C-04, C-05 — anywhere AI draft is shown
Props: status (success/partial/unavailable)
Displays:
- success → "AI draft ready" (subtle green tag)
- partial → "Partial draft — review carefully" (amber tag)
- unavailable → "Draft unavailable — fill manually" (neutral grey, never red/error)
Rules:
- Never shows a technical error message
- Never blocks any user action

---

**AuditBadge**
Used in: A-06 (Standards), A-07 (Audit Log)
Props: actor_name, action_type, timestamp
Displays inline as "Last updated by [name] on [date]"

---

**DistrictBreakdownToggle**
Used in: O-01 only
Props: active (bool), on_toggle, district_list[]
Rules:
- When active: all snapshot sections group by district
- When inactive: flat state aggregate
- MS-8 call adds ?group_by=district parameter when active

---

## Layer 4: Screen Specifications

### C-01: Coach Home

**Layout:** Desktop, two-column (left: session list 65% / right: overview panels 35%)
**Tab states:** Today | Tomorrow | This Week (tab bar below top nav)
**Overview panels (right column, always visible regardless of tab):**
- Due Action Banner (if items exist)
- Quick stats: completed today / total today / summaries pending
- VBA due strip (This Week tab: shown in main column instead)

**Today tab — main column:**
1. Confirmation risk strip — unconfirmed calls sorted by time-to-slot
2. Session list — SessionRow (default) for each session today, sorted by scheduled_at

**Tomorrow tab — main column:**
1. Pending confirmations strip — reminder drafts ready to copy (from MS-6)
2. Session list for tomorrow

**This Week tab — main column:**
1. Capacity bar — completed / target (from MS-6 /planning/week)
2. Day-grouped session list — sessions grouped by day label
3. VBA due strip — teachers with VBA due this quarter, not yet planned

**API calls (prefetch all three tabs on load):**
- MS-4 `GET /sessions?coach_id=me&date=today`
- MS-4 `GET /sessions?coach_id=me&date=tomorrow`
- MS-4 `GET /sessions?coach_id=me&week=current`
- MS-4 `GET /due-actions?coach_id=me`
- MS-6 `GET /at-risk-today?coach_id=me`
- MS-6 `GET /planning/week?coach_id=me&week=current`
- MS-5 `GET /vba/due-list?coach_id=me`

**Primary action:** Click session row → C-02 (Call Workspace)
**Secondary actions:** Tap confirmation toggle inline, click VBA row → C-04
**Empty states:**
- No sessions today → "No calls scheduled today"
- All completed → completion summary strip, no pending actions
- All no-show → DueActionBanner prompts reschedule for each

---

### C-02: Call Workspace

**Layout:** Desktop, two-column (left: call context / right: capture fields)

**Left column (context, read during call):**
1. Teacher header — name, school, RYGBadge, last touch date
2. Pre-session brief panel (collapsible) — last summary, last action steps, suggested focus (MS-10, non-blocking)
3. Floating agenda checklist — always visible, from MS-2 templates

**Right column (inputs during/after call):**
1. "Start Call" button → opens Google Meet link in new tab
2. FocusTagSelector (required, disables "End Call" until selected)
3. Teacher practice markers (checkbox group, from MS-2 templates)
4. Connectivity fallback logging — "Switch channel" dropdown: Meet → WA Video → Audio → Phone
5. Confirmation status toggle (if still pending)

**No-show handling (replaces right column content):**
- Countdown timer to slot
- "Mark No-show" one-tap button
- RescheduleDrawer trigger

**"End Call" button:** Bottom right, disabled until FocusTag selected → navigates to C-03

**API calls on load:**
- MS-4 `GET /sessions/:id`
- MS-2 `GET /templates/:org_unit_id`
- MS-10 `POST /ai/pre-session-brief/:session_id` (non-blocking, fires immediately)

**Rules:**
- If coach navigates away mid-call → DueActionBanner on next login
- Tech issue flag: checkbox in right column, non-blocking
- RescheduleDrawer available at any point during the flow

---

### C-03: After Call Screen

**Layout:** Desktop, single column (max-w-2xl, centred)

**Sections (top to bottom):**
1. AIStatusIndicator + WhatsApp draft (editable, AI-generated or blank)
2. Three required structured fields:
   - What was discussed (textarea, max 300 chars)
   - What was decided (textarea, max 300 chars)
   - Next call date (date picker)
3. ActionStepInput (1-3 steps, each with description + due date)
4. Teacher practice markers confirmation (pre-populated from C-02, editable)
5. Qualitative comments (optional textarea)
6. Collateral shared (multi-select from MS-9, or free text fallback)
7. WhatsAppDraftBox (full width, prominent)
8. "Save" button → returns to C-01

**API calls on load:**
- MS-10 `POST /ai/draft-summary/:session_id` (non-blocking — pre-fired on "End Call" click in C-02)
- MS-4 `GET /sessions/:id`
- MS-9 `GET /content?tags=` (for collateral selector)

**On save:**
- MS-4 `POST /sessions/:id/notes`
- MS-4 `POST /sessions/:id/action-steps`
- MS-4 `PUT /sessions/:id/close`

**Rules:**
- Three structured fields required before save enabled
- WhatsApp mark-sent optional at save — surfaces in missing-summary queue if not done
- If AI draft unavailable: blank editable field with placeholder, no error shown

---

### C-04: VBA Workspace

**Layout:** Desktop, two-column (left: student roster / right: protocol + checklist)

**Left column:**
1. Teacher header + VBA context (quarter, expected student count from MS-2)
2. Student roster panel:
   - Each student row: name + assessment status (assessed/absent) + expand for response capture
   - Response capture inline on row expand: literacy fields + numeracy fields (from MS-2 templates)
   - Partial save on every input (PATCH call per student)
3. Student count summary bar: assessed complete / assessed incomplete / absent

**Right column:**
1. Floating protocol checklist (always visible, from MS-2 templates)
2. Tech issue flag (checkbox, non-blocking)
3. Session notes (optional free text)
4. "End VBA" button — enabled only when ≥1 student assessed

**API calls on load:**
- MS-5 `GET /vba/sessions/:id`
- MS-2 `GET /templates/:org_unit_id`

**On each student input:**
- MS-5 `PATCH /vba/sessions/:id/student/:student_id`

**Rules:**
- Partial saves preserved if coach navigates away
- Cannot end VBA with zero students assessed (button disabled)
- Students cannot be un-marked absent (integrity rule — greyed out after mark)
- System warns if session duration is unusually short (post-close check)

---

### C-05: After VBA Screen

**Layout:** Desktop, two-section scroll

**Section 1 — Verify student responses:**
- Student count summary: complete / incomplete / absent
- Incomplete students highlighted — expand inline to complete
- Final count confirmation vs expected (from MS-2)

**Section 2 — Protocol + integrity:**
- Protocol adherence rating (1-5, anchors from MS-2)
- SOP adherence rating (1-5, anchors from MS-2)
- Integrity prompt: "Were any students coached during assessment?" — Yes auto-triggers escalation
- Observation notes (optional textarea)

**Then:**
- WhatsAppDraftBox (VBA insights summary — AI or manual, Hindi template)
- Next coaching call date picker
- "Save" button → returns to C-01

**On save:**
- MS-5 `POST /vba/sessions/:id/close`
- MS-4 `PUT /sessions/:id/close`

**Rules:**
- Protocol ratings prompted but dismissible (must be prompted — Flow B rule)
- Integrity "Yes" answer fires escalation via MS-7 automatically on save

---

### C-06: Teacher Profile

**Layout:** Desktop, two-column (left: profile + status / right: interaction timeline)

**Left column:**
1. Teacher header — name, school, block, designation, phone, HM name + phone
2. RYGBadge + current status + set date
3. Active action steps — open items with due dates, done/not-done toggle
4. Artifacts received — type-tagged list with dates
5. Movement plan (read-only if set by CM, coach-editable otherwise)

**Right column:**
1. Interaction timeline — all sessions (SessionRow history variant), newest first
2. "Load more" pagination for long histories

**API calls on load:**
- MS-3 `GET /teachers/:id`
- MS-4 `GET /teachers/:id/interaction-history`
- MS-4 `GET /due-actions?teacher_id=`

**Rules:**
- Coach can view but not edit movement plan set by CM
- Full interaction history preserved across reassignments
- RYG status editable by coach

---

### C-07: Content Library

**Layout:** Desktop, search + grid
**Sections:**
1. Search bar (keyword + tag filter)
2. Filter chips — type: PDF / Image / Webinar / TG Link
3. Content grid — title, type badge, upload date, "Share to session" button
4. Webinar section — upcoming and past, catchup link if missed

**API calls on load:**
- MS-9 `GET /content`
- MS-9 `GET /webinars`

---

### CM-01: CM Home

**Layout:** Desktop, three-column dashboard

**Left column (attention + actions):**
- "Today's Attention" card — top 3-5 urgent items auto-generated, ranked by urgency
- Each item: type label + coach name + issue + quick action link

**Centre column (ops summary):**
- KPICard grid: completion rate, missing summaries, open escalations, VBA coverage
- PeriodSelector (sticky)
- CallFunnel summary (compact)

**Right column (coach status):**
- Mini triage: each coach on one line — name + completion % + flag count
- Each coach name links to CM-03

**API calls on load:**
- MS-8 `GET /kpis/portfolio/:cohort_id?period=this_week`
- MS-7 `GET /escalations/overdue?cohort_id`
- MS-1 `GET /activity/coach` (all coaches, last login)

---

### CM-02: My Coaches Triage Board

**Layout:** Desktop, card grid (2-3 columns depending on coach count)

**Each CoachCard shows (without clicking):**
- Coach name + 1:1 status badge
- Completion % with colour signal
- Missing summaries count
- Open escalations count
- Last platform login

**Sort:** Most flags first. Done 1:1s greyed and moved to bottom.
**Primary action:** Click card → CM-03

**API calls on load:**
- MS-8 `GET /kpis/coach?cohort_id=` (summary level, all coaches)
- MS-7 `GET /escalations?cohort_id=&status=open` (counts per coach)

---

### CM-03: Coach 1:1 Workspace

**Layout:** Desktop, single full-width screen — all panels inline expandable. No navigation away for any single-coach action.

**Always visible on open (no clicks required):**

Top section:
- Coach name + period label
- PeriodSelector (changing period refreshes all panels)
- KPI rollup: KPICard row — completion rate, reschedule rate, confirmation rate, missing summaries, VBA completion, avg agenda adherence
- Spot-check trend: small inline Recharts line — last 4 periods, agenda adherence + action clarity
- Last period's commitments: each line with Done/Not Done toggle (auto-saves on change)
- Quick close prompt if coach meets clean week threshold (from MS-2)

Inline expandable panels (InlineExpandable component):
1. ▼ Sessions this period (N) — SessionRow list; spot-check fields (CM-04) inline on row expand
2. ▼ Open escalations (N) — EscalationItem list; resolve inline with category + notes
3. ▼ At-risk teachers (N) — TeacherCard (list-row), Red+behind first; click → CM-05 (SidePanel)
4. ▼ Platform usage — last login, zero-activity days (by day label), features accessed (CM-only)

Bottom (always visible, no scroll required):
- CommitmentInput (free text, multi-entry)
- "Save" button → auto-sets 1:1 done, returns to CM-02

**API calls on open:**
- MS-8 `GET /kpis/coach/:id?period=`
- MS-7 `GET /escalations?coach_id=&status=open`
- MS-4 `GET /sessions?coach_id=&period=`
- MS-8 `GET /teachers/health?coach_id=`
- MS-1 `GET /activity/coach/:id?period=`

**Rules:**
- No navigation away for any action in this screen
- SidePanel for teacher detail (CM-05) — never full screen
- Escalation save requires resolution_category + notes (save disabled until both filled)
- Commitment save = 1:1 done trigger (no separate mark complete)
- CM has no edit access to session notes — spot-check ratings only

---

### CM-04: Session Detail (Inline in CM-03)

**Not a separate screen — inline expansion of SessionRow within CM-03 sessions panel**

**Expands to show:**
- Focus tag, channel, duration, confirmation status
- Structured notes: what discussed / what decided / next call date
- Teacher practice markers
- Collateral shared
- Summary text + sent timestamp (or "Not sent — amber")

**Below notes:**
- SpotCheckRatingPanel — agenda adherence, action clarity, tone, feedback notes
- "Save rating" button

**Rules:**
- CM read-only on all session fields — only rating fields writable
- Random sample sessions marked with subtle indicator at top of list
- Manual ratings do not count toward random quota (from MS-2)

---

### CM-05: Teacher Side Panel (Within CM-03 or CM-06)

**Not a separate screen — SidePanel component over CM-03 or CM-06**

**Shows:**
- Teacher header: name, school, block, designation
- RYGBadge + status history
- Days since last touch + trend arrow
- Interaction timeline (last 5, expandable to full)
- Open action steps
- MovementPlanEditor (CM-editable inline)
- Artifacts received

**API calls:**
- MS-3 `GET /teachers/:id`
- MS-4 `GET /teachers/:id/interaction-history`

**Rules:**
- Opens as SidePanel — parent screen (CM-03 or CM-06) remains visible behind
- Closing returns parent to exact prior state

---

### CM-06: All Teachers View

**Layout:** Desktop, filterable table with FilterBar

**FilterBar:** Coach (multi-select) | Block (multi-select) | RYG status | Behind schedule toggle | VBA overdue toggle

**Table columns:** Name | Coach | School | Block | RYG | Days Since Touch | Reschedule Count | VBA Status | Last Action Step

**Sort:** Default — Red first, then days since touch descending (configurable)
**Row click:** Opens CM-05 (Teacher Side Panel)

**API calls on load:**
- MS-8 `GET /teachers/health?cohort_id=`
- MS-3 `GET /teachers?cohort_id=`

---

### CM-07: Escalation Queue

**Layout:** Desktop, tabbed table with FilterBar

**Tabs:** By Coach | By Type | By Status
**FilterBar:** Status (open/in_progress/closed) | Type | Coach | Date range

**Each row (EscalationItem queue-row variant):** Trigger type | Teacher | Coach | Days open | Status
**Row expand inline:** Full escalation detail + resolution fields (category + notes)

**Rules:**
- Resolution save requires category + notes
- Items open beyond threshold: row highlighted amber + badge

**API calls on load:**
- MS-7 `GET /escalations?cohort_id=`

---

### CM-08: Leadership Snapshot

**Layout:** Desktop, single-screen scrollable. All sections visible without horizontal scroll.

**Top bar (sticky):**
- PeriodSelector (This Week / This Month / This Quarter / Custom — default: This Month)
- FilterBar (Coach multi-select | Block multi-select | District multi-select)
- Active filter chips + "Showing filtered view" indicator when filters active
- "Export Snapshot" button (top right)

**Sections (top to bottom):**
1. **Programme Vitals strip** — 5 KPICards: total teachers, active teachers, at-risk, completion rate, VBA coverage. Each with directional trend vs prior period. Clicking a metric deep-links to relevant operational view.
2. **Teacher Health Distribution** — RYG counts with %, directional change vs prior period. "No movement plan: N Red teachers" flag in amber if any.
3. **Call Funnel** (CallFunnel component) — full funnel: planned → scheduled → completed → no-show/rescheduled/cancelled. 2-touch coverage highlighted as core metric.
4. **VBA Funnel** — due → planned → completed → overdue. Overdue with <30 days to quarter-end flagged red.
5. **Coach Performance Table** — read-only compact table: completion %, missing summaries, red teachers, overdue VBA, last login. Sorted by risk. Coach names deep-link to CM-03.
6. **Intervention Mix** — Recharts bar chart: focus tag distribution (Literacy/Numeracy/Relationship/Off-script/Untagged). Directional vs prior period. "No focus tag" in amber if above MS-2 threshold.
7. **Session Channel** — channel distribution: Meet/WA Video/Audio/Async. Async in amber if above threshold.
8. **Webinar Reach** — invited/attended/catchup sent/no engagement. Directional vs prior month.

**Export:** MS-8 `POST /exports/pdf/snapshot` → formatted PDF, <10 seconds. PDF header includes: CM name, org unit, period, active filters, date generated. Every metric includes its definition in small text below the number.

**API call on load:**
- MS-8 `GET /snapshot/:cohort_id?period=&coach_ids[]=&block_tags[]=&district_ids[]=`

**Rules:**
- All numbers system-derived — no manual edits
- Visible to CM, Program Admin, Govt Observer (scoped) only
- Changing period or filters refreshes ALL sections simultaneously
- Never show completion rate without the full funnel

---

### CM-09: Exports

**Layout:** Desktop, simple form (max-w-lg, centred)

**Fields:**
- Export type: Coach KPIs | Teacher Health | Escalation Log | Intervention Mix | VBA Report
- Period selector
- Cohort selector (Admin sees all cohorts, CM sees own cohort only)
- Format: CSV (all types) | PDF (Snapshot only)

**API calls:**
- MS-8 `GET /exports/csv?cohort_id=&period=&type=`
- MS-8 `POST /exports/pdf/snapshot`

---

### A-01: Admin Home

**Layout:** Desktop, dashboard with left sidebar

**Main area sections:**
1. Setup warnings banner — any cohort with incomplete configuration (ReadinessChecklist per cohort, inline)
2. User accounts summary — KPICard row: active coaches / CMs / admins / pending setup
3. Recent audit log (last 5 entries, AuditBadge format)
4. Quick action links: Add user | Import roster | Update standards

**API calls on load:**
- MS-2 `GET /health/config-complete` (all cohorts)
- MS-1 `GET /users` (counts by role)
- MS-2 `GET /audit-log?limit=5`

---

### A-02: Org Setup

**Layout:** Desktop, hierarchy tree (left sidebar active: Org Setup)

**Main area:** State → Districts → Cohorts as expandable tree nodes
**Each cohort node:** ReadinessChecklist inline (complete/incomplete/warning items)
**Actions per node:** Add child | Edit name | View cohort detail

**Rules:**
- Cannot create cohort without parent district (create button disabled if no district selected)
- Cannot delete org unit with active users assigned

---

### A-03: User Management

**Layout:** Desktop, filterable table

**Columns:** Name | Role | Phone/Email | Cohort | Status | Last Login
**FilterBar:** Role | Cohort | Status
**Row actions:** Edit cohort assignment | Deactivate | Resend credentials
**Top action:** "Add user" button → inline form or modal

---

### A-04: Roster Management

**Layout:** Desktop, two-panel (left: cohort selector + import controls / right: teacher table)

**Left panel:**
- Cohort selector (dropdown)
- "Import CSV" button → file picker → validation report → confirm import
- "Update UDISE reference data" → separate CSV upload
- Import history (last 3 imports with status)

**Right panel:**
- Teacher table for selected cohort
- FilterBar: Block | Designation | Status | Import warnings
- Row click: TeacherCard (admin variant) in SidePanel

**Import flow:**
1. File picker → upload
2. Validation report: hard errors table + warnings table
3. "Confirm import (N rows)" button (disabled if hard errors unresolved)
4. Import summary: "X imported, Y errors, Z warnings"

**API calls:**
- MS-3 `POST /roster/import`
- MS-3 `GET /roster/import/:id/report`
- MS-3 `GET /teachers?cohort_id=`
- MS-3 `POST /udise/import`

---

### A-05: Assignments

**Layout:** Desktop, two-column (left: coach list / right: teacher pool with assignment controls)

**Left column:**
- Coach list for selected cohort — each coach shows current assigned teacher count

**Right column:**
- Teacher pool with FilterBar: Block | School | UDISE | Unassigned only toggle
- Multi-select teachers → assign to selected coach

**Assignment preview (before confirm):**
- Coach name | Total teachers being assigned | Breakdown by block | Conflict flags (already assigned)

**Rules:**
- Reassignment preserves full prior history under teacher profile
- Dual assignment requires explicit Admin confirmation
- Assignment recorded in audit trail

---

### A-06: Standards & Templates

**Layout:** Desktop, tabbed form (left sidebar active: Standards)

**Tabs:**
1. Program Standards — key/value grid, editable, save per field
2. Session Templates — focus categories, required fields, VBA checklist items (editable lists)
3. Escalation Rules — rule type, threshold, active toggle per rule
4. RYG Thresholds — green/yellow/red definitions, at-risk days threshold
5. Reminder Rules — rule list (all inactive at MVP, visible as prepared slot with "Coming soon" indicator)

**Each tab:** Shows central defaults + cohort override indicator. AuditBadge shows last updated by/when.

**Rules:**
- Cohort overrides clearly flagged: "Custom — differs from program defaults"
- Save button per section (not per field)
- All changes written to MS-2 audit_log automatically

---

### A-07: Audit Log

**Layout:** Desktop, filterable table

**Columns:** Timestamp | Actor | Action | Entity Type | Entity ID | Change Summary
**FilterBar:** Actor | Action type | Entity type | Date range
**Row expand:** Shows old_val vs new_val diff inline

---

### O-01: State Snapshot (Govt Observer — Read-Only)

**Layout:** Identical structure to CM-08 (Leadership Snapshot)**

**Top bar (sticky):**
- State name label (always visible)
- PeriodSelector (same options, default: This Month)
- FilterBar (Block multi-select | District multi-select — scoped to observer's state)
- DistrictBreakdownToggle ("View by District" — groups all sections by district when active)
- "Export Snapshot" button

**All sections same as CM-08 with these differences:**
- All metrics and names are non-interactive (no deep-links)
- Coach Performance Table coach names are plain text (no links to CM-03)
- No "Today's Attention" or operational nudges
- DistrictBreakdownToggle active: all sections regroup by district

**API call on load:**
- MS-8 `GET /snapshot/:state_org_unit_id?period=&block_tags[]=&district_ids[]=&group_by=`

---

## Screen → Component Matrix

| Component | C-01 | C-02 | C-03 | C-04 | C-05 | C-06 | CM-01 | CM-02 | CM-03 | CM-06 | CM-07 | CM-08 | A-01 | A-04 | O-01 |
|-----------|------|------|------|------|------|------|-------|-------|-------|-------|-------|-------|------|------|------|
| SessionRow | ✓ | | ✓ | | | ✓ | | | ✓ | | | | | | |
| TeacherCard | | | | | | ✓ | | | ✓ | ✓ | | | | ✓ | |
| CoachCard | | | | | | | | ✓ | | | | | | | |
| RYGBadge | ✓ | ✓ | | | | ✓ | | ✓ | ✓ | ✓ | | ✓ | | | ✓ |
| KPICard | | | | | | | ✓ | ✓ | ✓ | | | ✓ | ✓ | | ✓ |
| CallFunnel | | | | | | | ✓ | | | | | ✓ | | | ✓ |
| VBAStatusBadge | ✓ | | | | | | | | ✓ | ✓ | | ✓ | | | ✓ |
| EscalationItem | | | | | | | | | ✓ | | ✓ | | | | |
| FocusTagSelector | | ✓ | | | | | | | | | | | | | |
| ActionStepInput | | | ✓ | | | ✓ | | | | | | | | | |
| ConfirmationToggle | ✓ | ✓ | | | | | | | | | | | | | |
| RescheduleDrawer | ✓ | ✓ | | ✓ | | | | | | | | | | | |
| SpotCheckRatingPanel | | | | | | | | | ✓ | | | | | | |
| CommitmentInput | | | | | | | | | ✓ | | | | | | |
| MovementPlanEditor | | | | | | ✓ | | | ✓ | | | | | | |
| WhatsAppDraftBox | | | ✓ | | ✓ | | | | | | | | | | |
| AIStatusIndicator | | ✓ | ✓ | | ✓ | | | | | | | | | | |
| PeriodSelector | | | | | | | ✓ | | ✓ | | | ✓ | | | ✓ |
| FilterBar | | | | | | | | | | ✓ | ✓ | ✓ | | ✓ | ✓ |
| SidePanel | | | | | | | | | ✓ | ✓ | | | | ✓ | |
| InlineExpandable | | | | | | | | | ✓ | | | | | | |
| DueActionBanner | ✓ | | | | | | ✓ | | | | | | | | |
| WorkspaceShell | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| ReadinessChecklist | | | | | | | | | | | | | ✓ | | |
| EmptyState | ✓ | ✓ | | | | ✓ | ✓ | ✓ | | ✓ | ✓ | | ✓ | | |
| DistrictBreakdownToggle | | | | | | | | | | | | | | | ✓ |
| AuditBadge | | | | | | | | | | | | | | | |

---

## Front-End Build Sequence

| Stage | What to Build | Depends On (Backend) | Estimated Days |
|-------|--------------|----------------------|----------------|
| 1 | Full component library (all 26 components) | MS-1 to MS-4 working | 4-5 |
| 2 | C-01 (Coach Home, all 3 tab states) | MS-4, MS-6, MS-5 | 2-3 |
| 3 | C-02 (Call Workspace), C-03 (After Call) | MS-4, MS-10, MS-2 | 3-4 |
| 4 | C-04 (VBA Workspace), C-05 (After VBA) | MS-5, MS-10 | 2-3 |
| 5 | C-06 (Teacher Profile), C-07 (Content Library) | MS-3, MS-4, MS-9 | 2 |
| 6 | CM-01 (CM Home), CM-02 (Triage) | MS-8, MS-7 | 2-3 |
| 7 | CM-03 (1:1 Workspace) — most complex screen | MS-8, MS-7, MS-4, MS-1 | 4-5 |
| 8 | CM-06, CM-07 (All Teachers, Escalations) | MS-8, MS-7, MS-3 | 2 |
| 9 | CM-08 (Leadership Snapshot), O-01 (Observer) | MS-8 | 2-3 |
| 10 | A-01 through A-07 (Admin screens) | MS-2, MS-3, MS-1 | 3-4 |
| 11 | CM-09, polish + empty states | MS-8 | 1-2 |

**Total: ~3-4 months front-end, starting after backend stages 1-3 complete**

---

## Claude Code Front-End Session Template

```
Platform: DTSP coaching CRM
Current screen: [Screen ID] — [Screen Name]
Role: [Coach / CM / Admin / Observer]
Layout: Desktop-first. No mobile breakpoints at MVP.
Never use fixed pixel widths — always use Tailwind relative units.

Screen purpose: [one sentence from spec]
Layout: [from spec above]
Sections: [paste section list]

API calls:
[paste exact endpoints from spec]

Components to import (already built — do not rebuild):
[list from component library]

Components to build new this session:
[list only if net-new — check library first]

Rules for this screen:
[paste relevant rules from spec]

Empty states required:
[list scenarios]

Do NOT build:
- Any other screen
- Any component not listed above as new
- Any direct call to MS-4/MS-5 for aggregated/dashboard data (use MS-8 only)
- Mobile breakpoints or responsive variants
```

---

## Flexibility Rules for Front End

### Adding a New Field to a Screen
1. Check which backend service owns that data
2. Confirm the API endpoint already returns it (or add the field to the endpoint in MS-8)
3. Add field to the relevant component — no other screen changes required

### Adding a New Screen
1. Add to screen inventory with role, trigger, backend calls
2. Check component library first — reuse before building new
3. Build in isolation, import shared components only

### Adding a New Role
1. Define workspace in Layer 1
2. Add screens to screen inventory
3. MS-1 role enum updated in backend
4. New WorkspaceShell variant + nav items only

### Adding Mobile Responsiveness Later
1. Never requires architectural changes — components already use relative units
2. Per-screen: add Tailwind sm:/md: prefixes to layout classes
3. Coach workspace converts first (highest priority for field use)
4. One Claude Code session per screen for mobile conversion

### Changing a Threshold, Label, or Rule
- If it comes from MS-2 (standards/templates) → Admin UI change, zero front-end code
- If it appears hardcoded in a component → it should not be hardcoded — move to MS-2 fetch

---

## Document Control

- **Version:** 1.1
- **Owner:** DTSP Product Team
- **Last Reviewed:** February 27, 2026
- **Pairs With:** DTSP-Backend-Architecture.md v1.0
- **Changes from v1.0:**
  - C-01 and C-02 merged into single tabbed screen (Today/Tomorrow/This Week)
  - FilterBar added to CM-08 and O-01
  - DistrictBreakdownToggle added to O-01
  - MS-8 /snapshot endpoint updated to accept filter parameters
  - Device priority changed to desktop-first for all roles
  - Coach workspace nav updated to top nav (consistent with all roles)
  - Total screens updated: 25 → 24
- **Next Review:** After component library build (Stage 1 complete)
