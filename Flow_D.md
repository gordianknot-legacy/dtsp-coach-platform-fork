**Flow** **D** **(Optimised):** **Coach** **Manager** **Reviews** **a**
**Single** **Coach**

Role: Coach Manager

Scenario: CM conducts a weekly 1:1 review of one coach — from opening
the coach's record to closing commitments.

Trigger: CM navigates to a coach from the "My Coaches" triage board.

Ends: CM has reviewed numbers, spot-checked quality, resolved open
escalations, reviewed at-risk teachers, and saved commitments — all
without leaving the coach's 1:1 Workspace.

Context & Design Rationale:

The 1:1 Workspace is the CM's single destination for a single-coach
review. All data is pre-compiled on open — no manual assembly, no
navigation away. The CM works top to bottom: read the picture →
spot-check quality → resolve escalations → review at-risk teachers → set
commitments → close. Portfolio-level views (Ops Review, Escalation
Queue, Portfolio Health) exist for cross-coach scanning and pattern
detection — not for single-coach work. This separation is deliberate and
must be maintained in the information architecture.

Ground reality note: A CM managing 4–6 coaches at 25+ calls/week each
has no time for multi-tab prep before a 1:1. The platform must answer
the four questions a CM always arrives with — Is this coach hitting
their numbers? Is documentation discipline holding? Are any teachers
falling behind quietly? What did they commit to last week and did they
do it? — before the CM opens their mouth. Everything after that is
coaching conversation, not data hunting.

**0)** **Landing** **on** **CM** **Home**

> 1\. CM logs in → lands on CM Home. Visible at minimum:
>
> ● "Today's Attention" nudge card: auto-generated at login, surfaces
> the top 3–5 items requiring action ranked by urgency (e.g., *"Coach*
> *Priya* *—* *completion* *65%* 🔴 */* *4* *missing* *summaries* */*
> *1* *escalation* *overdue* *3* *days"*). Priority ranking logic
> configurable by Program Admin. Not
>
> hard-coded.
>
> ● "Ops Review" card, "Portfolio Health" card, "Escalation Queue"
> badge, "VBA Status" card — portfolio-level views, not used in this
> scenario.
>
> ● Navigation tabs: My Coaches \| All Teachers \| Exports

**1)** **Triage** **Board** **—** **Pick** **the** **Coach**

> 2\. CM clicks "My Coaches" tab → lands on the triage board. Every
> coach is shown as a card. Visible on each card without clicking in:
>
> 3\. text

Coach Priya ⬜ 1:1 pending Completion 65% 🔴 \| Missing summaries 4 🔴
\| Escalations 2 open \| Last login: Today

> 4\.
>
> 5\. text

Coach Arjun ⬜ 1:1 pending Completion 88% ✅ \| Missing summaries 0 \|
Escalations 1 open \| Last login: Yesterday

> 6\.
>
> ● Cards sorted by urgency: most flags first. ✅ 1:1 done cards move to
> the bottom.
>
> ● CM sees at a glance who needs the deepest review and in what order
> to run 1:1s this week.
>
> 7\. CM clicks Coach Priya's card → lands on Priya's 1:1 Workspace.
> This is the only screen the CM will use for this entire review.
>
> System behavior: Clicking any coach card opens their 1:1 Workspace
> directly — no intermediate screen. All data is pre-compiled on open.

**2)** **Read** **the** **Pre-Compiled** **Picture**

> 4\. CM lands on Priya's 1:1 Workspace. The following sections are
> always visible on open, no clicks required:
>
> KPI rollup (active period):
>
> ● Completion rate \| Reschedule rate \| Confirmation rate \| Missing
> summaries (count + % of completed calls) \| VBA completion (this
> quarter) \| Avg Agenda Adherence (last 4 spot-checks)
>
> ● Active period label shown (e.g., "This Week: Feb 24–28"). Period
> selector available — same quick picks as Ops Review. Changing the
> period refreshes all panels in-place.
>
> 5\. Spot-check trend (last 4 periods):
>
> ● Agenda Adherence: 4.2 → 4.0 → 3.8 → 3.6 ↓ ● Action Item Clarity: 4.5
> → 4.2 → 4.0 → 3.9 ↓
>
> ● Directional trend visible as a sequence — not just the current
> period's number.
>
> 6\. Last period's commitments:
>
> ● Each commitment pre-loaded with a Done / Not done toggle, pre-set to
> "Not done." CM marks each during the conversation — toggles auto-save
> on change, no separate save required.
>
> 7\. Quick close prompt (if applicable):
>
> ● If Priya's data meets the configurable "clean week" threshold (e.g.,
> completion \>85%, missing summaries 0, no open escalations), the
> workspace surfaces: *"Priya* *is* *on* *track* *this* *period.* *No*
> *escalations,* *no* *missing* *summaries,* *completion* *91%.* *Log*
> *this* *1:1* *as* *complete,* *or* *review* *in* *detail* *below."* CM
> can add one commitment and save — done in under 2 minutes.
>
> ● Priya does not meet the threshold today. Quick close is suppressed.
> Full workspace is active.
>
> 8\. System behavior: All KPI data, trends, and commitment history are
>
> auto-compiled from session records, spot-check ratings, escalation
> logs, and platform usage logs scoped to Priya's teachers. Nothing is
> pulled manually. The CM reads, does not prepare.
>
> Design note: The conversation starters are already in the data before
> the CM speaks: completion rate is red; agenda adherence has drifted 4
> consecutive periods (not just this week — the trend is the signal, not
> the number); 2 of last week's 3 commitments are Not done; 4 summaries
> are outstanding. The CM arrives at the 1:1 informed, not scrambling.

**3)** **Sessions** **Panel** **—** **Drill** **In** **and**
**Spot-Check**

> 5\. CM clicks "▼ Sessions this period" to expand the sessions panel
> (expandable within the 1:1 Workspace — no navigation away).
>
> ● Session list loads: Teacher Name \| Day \| Time \| Status (Completed
> ✅ / No-show ❌ / Rescheduled 🔄 / Scheduled / Cancelled) \| Summary
> Sent (Yes/No) \| Focus Tag \| Session Type (Coaching / VBA). Status
>
> colour-coded. VBA sessions carry a distinct badge.
>
> ● Sessions where Summary Sent = No are amber-highlighted on the row —
> visible without any filter.
>
> 6\. CM clicks a session row (e.g., Meera Singh — Completed, Summary
> Not Sent).
>
> ● Session detail expands inline within the panel (no new screen):
> Focus tag, structured notes (What was discussed / What was decided /
> Next call date), teacher practice markers, qualitative comments,
> collateral shared, summary text, "Summary Sent" timestamp.
>
> ● Spot-check rating fields are directly available at the bottom of the
> session detail — the CM reads and rates in one action, not two:
>
> ● Agenda Adherence (1–5; scoring anchors configurable by Program
> Admin)
>
> ● Action Item Clarity (1–5; scoring anchors configurable by Program
> Admin)
>
> ● Tone (Warm / Neutral / Tense — qualitative, CM-subjective; labelled
> as such in all exports)
>
> ● Feedback Notes (free text) ● "Save rating" button ✅
>
> 7\. CM repeats for the remaining sessions in the random sample. System
> has
>
> pre-selected a random sample (size configurable, default 3–5,
> look-back window configurable, default 7 days) and surfaced them at
> the top of the session list with a subtle indicator. CM can click
> "Refresh random sample" for a new draw, or click "Choose sessions" to
> manually select additional sessions.
>
> ● Random quota enforcement applies in the background (default: 2
> random spot-checks per coach per period, configurable by Program
> Admin). Manual ratings do not count toward the quota.
>
> ● CM has no edit access to session records — rating fields are the
> only writable element in the session detail.
>
> 8\. System behavior: Ratings save immediately on "Save rating" —
> linked to the session record and aggregated into Priya's KPI rollup.
> If CM navigates away mid-rating, partial inputs are preserved and
> surface as "Due action" on next
>
> login. Rubric fields, scales, and scoring anchors are fully
> configurable by Program Admin without engineering changes.
>
> Data captured: Session ID, rubric dimension scores, tone, feedback
> notes, mode (random/manual), CM identity, timestamp.
>
> Design note: Collapsing the session review and spot-check into a
> single action eliminates the previous double-navigation pattern (drill
> into sessions → navigate to spot-check → re-open sessions). The CM
> reads once and rates once. The rating fields are not prominent when
> the CM is just reading — they appear at the bottom, available but not
> intrusive.

**4)** **Escalations** **Panel** **—** **Resolve** **Inline**

> 8\. CM clicks "▼ Open escalations (2)" to expand the escalations panel
> (within the 1:1 Workspace — no navigation to the Escalation Queue
> required for single-coach review).
>
> ● Two items visible: Repeat Reschedule (3+) — Asha Rani \| Missing
> Summaries (4 days) — Meera Singh.
>
> 9\. CM clicks Asha Rani's escalation row to expand it inline.
>
> ● Escalation detail expands: reschedule history (Feb 10: BEO Visit /
> Feb 17: BEO Visit / Feb 24: No response), linked session records, link
> to Asha Rani's teacher profile (opens in a side panel — does not
> navigate away from the 1:1 Workspace).
>
> ● CM acts inline:
>
> ● Resolution category (dropdown, required): *"Coach* *counselled"* ●
> Notes (free text, required): *"Discussed* *with* *Priya* *—* *Asha*
> *has*
>
> *recurring* *BEO* *visits* *on* *Tuesdays.* *Shifting* *to* *Monday*
> *morning* *slot.* *Priya* *to* *call* *Asha* *directly* *this* *week*
> *before* *scheduling."*
>
> ● Status: Open → In Progress ● Clicks "Save" ✅
>
> ● Escalation row updates to "In Progress" in the panel. Panel count
> badge drops from 2 to 1 open.
>
> 10.CM clicks Meera Singh's escalation row → expands inline.
>
> ● Resolution category: *"Monitoring* *only"* \| Notes: *"Raised* *in*
> *1:1* *—* *Priya* *to* *send* *summary* *before* *EOD* *today."*
>
> ● Status: Open → In Progress \| Clicks "Save" ✅
>
> 11\. System behavior: Escalation actions logged with timestamp and CM
> identity. The Escalation Queue (portfolio-level tab) reflects these
> updates in real time — but the CM never needed to go there for this
> single-coach review. If an escalation stays Open beyond a configurable
> threshold (default: 5 days), it auto-flags for Program Admin.
> Resolution categories and escalation types are configurable by Program
> Admin — not hard-coded.
>
> Data captured: Resolution category, action notes, status change, CM
> identity, timestamp.
>
> Design note: The full Escalation Queue (with By Coach / By Type tabs,
> period selector, status filters) remains available as a
> portfolio-level tool for cross-coach pattern detection. But for a
> single-coach review, the CM should never need to leave the 1:1
> Workspace to handle that coach's escalations. These are two distinct
> use cases served by two distinct surfaces.

**5)** **At-Risk** **Teachers** **Panel** **—** **Spot** **and** **Act**

> 11\. CM clicks "▼ At-risk teachers (3)" to expand the teachers panel
> (within the 1:1 Workspace).
>
> ● Priya's teacher list filtered to urgent cases: Teacher Name \| RYG
> \| Days Since Last Touch \| Trend (↑/→/↓) \| Reschedule Count \| VBA
> Status. Auto-sorted: Red + behind schedule first. "Behind schedule"
> and "Repeat rescheduler" thresholds configurable by Program Admin.
>
> ● Trend signal: computed from direction of change in
> days-since-last-touch over last 3 periods. System-generated — no CM or
> coach action required to produce it.
>
> 12\. CM sees Asha Rani at the top: 🔴 Red \| 21 days since last touch
> \| ↓ worsening \| 3 reschedules \| VBA Due \| "Movement Plan Missing"
> flag.
>
> 13\. CM clicks Asha Rani's row → her teacher profile opens in a side
> panel (does not navigate away from the 1:1 Workspace). Visible:
> contact details, school, block, RYG history, complete interaction
> timeline, movement plan section, artifacts received.
>
> 14\. CM creates a movement plan inline in the side panel (CM-editable;
> Priya can view, not edit):
>
> ● Target status: Yellow \| Target date: March 15 ● Actions:
>
> ● *"1.* *Shift* *to* *Monday* *morning* *slot* *—* *Priya* *confirms*
> *with* *Asha* *by* *Feb* *28."*
>
> ● *"2.* *Priya* *to* *call* *Asha* *directly* *this* *week* *—*
> *establish* *contact* *before* *scheduling."*
>
> ● *"3.* *If* *no* *completed* *touch* *by* *March* *7,* *escalate*
> *to* *Program* *Admin."* ● Clicks "Save" ✅
>
> ● Side panel closes. "Movement Plan Missing" flag clears on Asha
> Rani's row. Panel count updates.
>
> 15\. CM reviews the remaining 2 Yellow teachers: both at 13–15 days,
> trending → stable — no immediate action. CM flags one (Geeta Kumari —
> VBA Due, no planned date) using "Flag for later" — a single click that
> adds her to the CM's Deferred queue on the home screen. Deferred items
> auto-clear after 7 days if not actioned.
>
> System behavior: Movement plan saved and linked to teacher record.
> Linked "Red Teacher — No Movement Plan" escalation auto-closes.
> Movement plan is CM-owned and lightweight for MVP. "Flag for later" is
> a personal CM working note — not an escalation, not visible to
> coaches, not surfaced in any governance report.
>
> Data captured: Movement plan fields, target status, target date,
> actions with owners, CM identity, timestamp.

**6)** **Platform** **Usage** **Panel** **—** **Compliance** **Check**

> 16\. CM clicks "▼ Platform usage" to expand (within the 1:1
> Workspace).
>
> ● Visible: Last login date \| Sessions logged this period \| Days with
> zero platform activity (with day labels) \| Avg session entry time \|
> Features accessed (session record / VBA workspace / planning board —
> section-level, not click-level, in MVP).
>
> 17\. Design note: Two inactive days (Tuesday, Thursday) on a week with
> 4 missing summaries is a pattern, not a coincidence. The CM uses this
> as a conversation prompt — *"I* *can* *see* *Tuesday* *and* *Thursday*
> *had* *no* *platform* *activity* *—* *was* *that* *a* *connectivity*
> *issue* *or* *something* *else?"* — not as a disciplinary lever.
> Platform usage is a compliance signal. It is never shown to the coach
> in their own workspace. CM-only view.

**7)** **Conduct** **the** **1:1** **—** **Mark** **Commitments**
**and** **Set** **New** **Ones**

> 17\. CM is now in the conversation with Priya. The 1:1 Workspace
> remains open — the CM does not switch screens during the conversation.
> All panels remain expanded or collapsible as needed.
>
> 18\. CM marks last period's commitments as Done / Not done during the
> conversation. Each toggle auto-saves on change:
>
> ● *"Follow* *up* *with* *Asha* *Rani* *on* *rescheduling"* → Not done
> ❌ ● *"Clear* *all* *missing* *summaries* *by* *Friday"* → Not done ❌
>
> ● *"Complete* *Lalita* *Devi* *VBA* *this* *week"* → Done ✅
>
> 19\. Design note: Two consecutive "Not done" instances on the same
> commitment type (missing summaries) is a stronger signal than either
> alone. If Program Admin configures a "repeated Not done" flag, the
> system surfaces this pattern in the next period's 1:1 Workspace and in
> the "Today's Attention" card. The flag is configurable — not on by
> default.
>
> 20.CM enters this period's commitments in the free text field at the
> bottom of the 1:1 Workspace (always visible — no scrolling required to
> reach it):
>
> ● *"Send* *all* *4* *missing* *summaries* *by* *EOD* *today."*
>
> ● *"Shift* *Asha* *Rani* *to* *Monday* *morning* *slot* *—* *confirm*
> *with* *Asha* *by* *Feb* *28."*
>
> ● *"Select* *focus* *tag* *on* *every* *session* *—* *zero* *untagged*
> *sessions* *in* *next* *review."*
>
> ● *"Complete* *Geeta* *Kumari* *VBA* *by* *March* *7."* ● *"Log* *in*
> *every* *working* *day* *this* *week."*
>
> ● Clicks "Save" ✅
>
> 21\. System behavior: Commitments saved linked to Priya + active
> period. They carry forward to next 1:1 view as "Last period's
> commitments," pre-populated as "Not done." Free text format is
> intentional — commitment language must match the specificity of the
> conversation, not a dropdown category.
>
> Data captured: Commitment text, period, CM identity, timestamp.
> Done/Not done status + timestamp when marked.

**8)** **Close** **the** **1:1**

> 20.On "Save", system auto-sets Priya's 1:1 status to ✅ done. No
> separate "mark complete" action. No confirmation screen.
>
> 21\. CM is returned to the "My Coaches" triage board. Priya's card now
> shows ✅ and moves to the bottom. Remaining coaches with ⬜ are sorted
> by urgency at the top. CM picks the next coach and repeats from step
> 3.
>
> 22.Any unfinished CM actions from this session (incomplete spot-check
> ratings, unsaved escalation edits, a movement plan navigated away from
> mid-entry) appear in "Due action" on the CM's next login. Partial
> inputs are always preserved — the system never discards a draft
> silently.

**What** **the** **System** **Must** **Never** **Do** **in** **This**
**Flow**

> ● Require the CM to navigate away from the 1:1 Workspace to complete a
>
> single-coach review — sessions, escalations, teachers, usage, and
> commitments must all be accessible as inline panels
>
> ● Open a new full screen when the CM clicks a teacher or escalation
> from within the 1:1 Workspace — use a side panel that preserves
> workspace context
>
> ● Require the CM to manually compile any KPI, trend, or commitment
> data — all must be auto-populated on workspace open
>
> ● Allow escalation closure without a resolution category selected and
> a notes entry ● Allow the ✅ "1:1 done" status to be manually set —
> triggered only by saving
>
> commitments
>
> ● Show platform usage data to the coach in their own workspace —
> CM-only view ● Allow the coach to edit session records, movement
> plans, or spot-check ratings —
>
> read access only
>
> ● Hard-code any threshold, quota, rubric field, rubric scale, or
> scoring anchor — all configurable by Program Admin without engineering
> changes
>
> ● Discard partial CM inputs (in-progress spot-check ratings, movement
> plan drafts, escalation notes) if the CM navigates away — auto-save
> and surface as "Due action" on next login
