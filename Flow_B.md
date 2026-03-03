**Flow** **B:** **Coach** **Conducts** **a** **VBA**

**What** **Is** **a** **VBA**

The Video-Based Assessment (VBA) is a quarterly touch where the coach
conducts a structured assessment of the teacher's students over a video
call with screen-share. It replaces one of the two monthly coaching
touches — so total touches per teacher per month remains 2 in a VBA
month.

Four things make it structurally distinct from any other session in the
program:

> ● It requires stable video + screen-share for the full session — there
> is no audio degradation fallback. If video fails, the session is
> rescheduled, not continued
>
> ● The coach is assessing students, not coaching the teacher
>
> ● The live session runs 45–60 minutes (5–7 min per student, 5–26
> students assessed)
>
> ● Post-session work is heavier: response verification → classroom
> report → WhatsApp insights summary

**0)** **Landing** **on** **the** **Workspace**

1\. Coach logs in → lands on Coach Workspace where they can see at
minimum: tabs "Today / Tomorrow / This Week," session rows with status,
and a persistent "VBA Due" alert strip for any teachers in their
portfolio who are due or overdue for a VBA this quarter.

*Design* *note:* *VBA* *rows* *must* *carry* *a* *distinct* *visual*
*badge* *and* *a* *longer* *time* *block* *indicator.* *A* *coach*
*scanning* *their* *daily* *list* *must* *immediately* *recognize* *a*
*VBA* *slot* *—* *the* *time* *commitment* *and* *preparation* *are*
*fundamentally* *different* *from* *a* *30-min* *coaching* *call.*

**1)** **VBA** **Planning** **(Same** **Flow** **as** **a** **Coaching**
**Call;** **Agenda** **=** **VBA)**

2\. Coach opens the "VBA Due" list from their workspace — system shows
all teachers for whom a VBA is due this quarter, with: teacher name,
last VBA date, and planned date if already set.

3\. For each due teacher, coach opens the teacher row and clicks
"Schedule session" — same action as scheduling any other session.

4\. Coach selects session type = VBA from the type dropdown. This single
selection does two things:

> ● Tags the session as VBA in the planning board (distinct badge)
>
> ● Pre-loads the VBA protocol checklist as the agenda for this session

5\. Coach selects a time window — using the teacher's known habitual
availability (typically 11 AM lunch window or post-school 2:30–5:30 PM).

6\. Student count is not entered by the coach. It is set centrally at
the cohort level by the Program Admin (e.g., "assess 10 students per VBA
for this cohort"). The system populates the expected student count on
the VBA session record automatically.

7\. Coach clicks "Save" → VBA session appears in the weekly planning
board tagged as VBA. System auto-creates a D-1 reminder task and a
day-of confirmation task in the coach's queue.

*Design* *note:* *Stacking* *more* *than* *one* *VBA* *on* *the* *same*
*day* *should* *surface* *a* *soft* *warning* *—* *each* *VBA* *is*
*80+* *min* *total* *and* *two* *in* *a* *day* *is* *near* *the* *edge*
*of* *sustainable* *quality.*

**2)** **Confirmations** **(D-1** **and** **Day-of)**

8\. Coach checks "Confirmation: Received / Pending" for the VBA slot.

9\. System surfaces a VBA-specific reminder template (copy-to-WhatsApp),
pre-filled with teacher name and slot time. Unlike the standard coaching
call reminder, this one includes: expected session duration (~60 min)
and a note for the teacher to have students seated and ready.

10\. If "Pending," coach nudges and records state (confirmed /
rescheduled / new date). A VBA with unconfirmed student availability is
flagged visually in the "At-risk today" list

— it carries higher risk than an unconfirmed coaching call because
student presence cannot be assumed.

11\. Confirmations are not read-only — coach can update state directly
from this view.

**3)** **Enter** **VBA** **Workspace**

12\. Coach clicks the relevant session row in the "Today / Tomorrow /
This Week" tab (VBA badge visible).

13\. Coach reviews Pre-session brief (no typing required):

> ● Last VBA date and its classroom summary, if a prior quarter VBA
> exists ● Last coaching call summary and any outstanding teacher action
> steps
>
> ● Expected student count (populated from cohort-level setting) ●
> AI-suggested focus areas if module is enabled

14\. Coach opens the VBA Protocol Checklist — always visible and
floating in the VBA workspace. Checklist includes: student readiness
confirmed, screen-share prepared, response capture sheet ready,
integrity rules understood (no prompting students).

**4)** **Start** **the** **VBA** **Session** **(Google** **Meet)**

15\. Coach clicks "Start VBA (Google Meet)" — system auto-starts the
session record, timestamps the start, and registers session type as VBA.

16\. System auto-starts transcript capture where supported
(opportunistic, not assumed).

17\. Coach verifies video + screen-share stability before beginning the
assessment. This is a protocol gate — the VBA cannot begin without
confirmed stable video.

18\. Coach screen-shares the assessment questions from the central
content library.

**5)** **The** **Live** **Assessment** **—** **Student-by-Student**
**Capture**

19\. The VBA workspace surfaces the Student Assessment Panel — this is
the primary live-input interface. The panel shows every student in the
teacher's class roster, with the following columns:

||
||
||
||
||
||
||
||

20\. Coach uses the panel to mark who is being assessed today:

> ● Clicks "Mark present" or "Mark absent" for each student before the
> assessment begins
>
> ● System shows a live counter against the cohort-defined target (e.g.,
> "8 of 10 target students present")

21\. Coach clicks on the first student → their row expands to "Assessing
now" → coach works through the assessment items one by one, recording
responses per competency (pass/fail per loop — Literacy and Numeracy)
directly in the panel.

22\. 5–7 minutes per student; coach clicks "Done" on each student row to
advance to the next.

23\. Coach records any integrity flags in real-time — one-click flag per
student with a short note field (e.g., "teacher prompted student,"
"student consulted peer"). Any integrity flag auto-surfaces for Coach
Manager review post-session.

*Ground* *reality* *note:* *This* *student* *panel* *is* *the*
*highest-friction* *moment* *in* *the* *VBA* *flow.* *Currently*
*coaches* *mark* *paper* *templates* *during* *the* *call* *and*
*digitize* *later* *—* *causing* *errors* *and* *delays.* *The* *panel*
*must* *be* *designed* *for* *fast* *tap/click* *input* *while* *the*
*coach* *is* *live* *on* *video.* *Fields* *per* *student* *must* *be*
*minimal:* *present/absent* *toggle,* *then*

*per-item* *pass/fail.* *The* *prior-VBA* *context* *columns* *are*
*read-only* *reference* *—* *they* *help* *the* *coach* *spot*
*surprising* *results* *in* *real* *time* *but* *add* *zero* *clicks.*

**6)** **Tech-Issue** **Handling** **(Stricter** **Rule** **Than**
**Coaching** **Calls)**

24\. If video becomes unstable mid-session, system flags "Connectivity
issue" — coach clicks "Log tech issue".

25\. There is no fallback to audio-only for a VBA. The assessment
protocol depends on visual prompts and student observation. If video
cannot be sustained, the session must be rescheduled.

26\. Coach determines if video can be restored within 90 seconds:

> ● If yes: wait, then resume — system auto-logs the interruption
> duration
>
> ● If no: coach clicks "Pause VBA" → "Reschedule VBA" → selects new
> time window → Reason category = Tech issue → "Save"

27\. All student responses captured up to the interruption are saved
automatically — a rescheduled session resumes from the next unassessed
student, not from scratch.

**7)** **No-Show** **Handling**

28\. If teacher and students do not join, system shows a countdown to
the scheduled slot time.

29\. When the threshold is reached, system auto-marks "No-show" or coach
confirms with one click. A VBA no-show is added to the "Overdue VBA"
list with a quarter-expiry indicator — it carries higher program cost
than a coaching call no-show.

30\. System prompts reschedule:

> ● Click "Reschedule VBA"
>
> ● Click "New time window" — system warns if proposed date falls past
> quarter-end
>
> ● Click "Reason category" (Teacher unavailable / Students unavailable
> / No response)
>
> ● Click "Save"

31\. System increments the VBA no-show counter — repeat no-shows
auto-trigger escalation to Coach Manager as an overdue VBA flag.

32\. End flow: coach returns to Today list. No summary required for a
no-show.

**8)** **Reschedule** **Handling** **(Teacher-Initiated)**

33\. If teacher requests a reschedule before or during the VBA, coach
clicks "Reschedule VBA."

34\. Click "New time window" → choose slot. System warns if the slot
falls past quarter-end.

35\. Click "Reason category" → select (BEO visit / Students absent /
Network / Other).

36\. Click "Save" — reschedule counter updates; escalation auto-triggers
on repeat.

**9)** **Completed** **VBA** **—** **Live** **Session** **Close**

37\. Once all assessed students are marked "Done," coach clicks "End
VBA."

38\. System auto-marks session status "VBA Completed" and timestamps the
end. Coach is not asked to choose completion status.

39\. System auto-flags if session duration is unusually short relative
to the number of students assessed — this is an integrity signal tracked
under P3A6 and P3A7.

**10)** **Post-VBA** **Capture** **("After** **VBA"** **Screen)**

40\. The "After VBA" screen appears with two layers:

Layer 1 — Verify + complete student responses:

> ● Coach reviews the Student Assessment Panel — any students whose
> responses were not fully captured live can be completed now if
> shorthand notes exist
>
> ● System shows a breakdown: students assessed (complete) / students
> assessed (incomplete) / students absent
>
> ● Coach confirms final count against the cohort target — this feeds
> KPIs P3A3 and P3A4

Layer 2 — Protocol + integrity confirmation:

> ● Coach rates Protocol adherence (1–5) ● Coach rates SOP adherence
> (1–5)
>
> ● Coach confirms or adds integrity flags — prompted: *"Were* *any*
> *students* *coached* *or* *prompted* *during* *the* *assessment?"* —
> any "Yes" auto-triggers escalation to Coach Manager
>
> ● Coach adds qualitative observation notes (optional free text)

41\. Coach clicks "Confirm and generate summary."

**11)** **WhatsApp** **VBA** **Insights** **Summary** **+** **Next**
**Touch**

42\. System generates a WhatsApp-ready VBA insights summary draft
(AI-assisted if module is enabled, manual otherwise): classroom
proficiency snapshot in plain language, 2–3 priority observations,
agreed next actions for the teacher, and next coaching call date.

43\. Format: Hindi WhatsApp message, under 150 words, Devanagari script,
warm respectful tone appropriate for a UP Grade 2 primary teacher.

44\. Coach reviews and edits the draft before sending — coach-in-loop
edit is non-negotiable for VBA summaries given the pedagogic weight of
the insights.

45\. Coach copies to clipboard → sends via WhatsApp → clicks "Mark sent"
(with timestamp).

46\. Coach records next coaching call date — system flags if no next
touch is scheduled before month-end, since the VBA only replaces one of
the two monthly touches.

**12)** **Due** **Actions** **and** **Interruption** **Handling**

47\. Any unfinished post-VBA action (incomplete student responses,
unsent summary, unrecorded protocol rating) auto-appears in "Due action"
on the coach's home screen.

48\. If coach moves away mid-post-session and returns, all partial
inputs are saved and the system resumes from where they left off.

49\. Any auto-log failures (session duration missing, student count
mismatch) are recorded with whatever data is available — the flow is
never blocking.

**13)** **Close** **Session**

50\. Coach clicks "Save" → system updates: VBA record marked complete,
student responses locked, summary marked sent (if done), next touch
scheduled.

51\. Coach returns to the home screen — the VBA row moves to interaction
history and the "VBA Due" strip updates to show the teacher is current
for the quarter.

**What** **the** **System** **Must** **Never** **Do** **in** **This**
**Flow**

> ● Allow a VBA to be marked "Completed" without at least one student
> response entered
>
> ● Allow session closure without prompting the protocol and integrity
> ratings in Layer 2 (can be dismissed, but must be prompted)
>
> ● Auto-degrade a VBA to audio-only as a fallback — VBA protocol
> integrity depends on video
>
> ● Let a VBA no-show sit unremarked — it is quarter-bound and delay has
> direct program impact
>
> ● Lose partially captured student responses if the coach navigates
> away mid-session
