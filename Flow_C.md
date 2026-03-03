**Program** **Admin** **Flow:** **Setting** **Up** **a** **Teacher**
**Cohort** **for** **1** **Coach**

**What** **This** **Flow** **Is**

This is a one-time setup flow that must be completed before a coach can
do any work in

the platform. Until this flow is complete, the coach has no teachers to
see, no sessions to

schedule, and no standards to work against. Everything downstream —
coaching calls,

VBAs, confirmations, escalations — depends on this setup being done
correctly.

The Program Admin is the only role with full system configuration
access. They operate

at state level and their decisions here propagate to every coach and
teacher in the

cohort.

Sequence of this flow: Org hierarchy → Coach account → Standards
(central defaults

with cohort overrides as needed) → Teacher roster import → Validation →

Teacher-to-coach assignment → Confirm readiness

**0)** **Landing** **on** **the** **Admin** **Workspace**

1\. Program Admin logs in → lands on the Admin Workspace where they can
see at

minimum:

> ● Org hierarchy status (which levels are configured vs. pending)
>
> ● User accounts (coaches, coach managers, admins — active / pending
> setup) ● Cohort setup status (cohorts configured / not yet set up)
>
> ● Any setup warnings or incomplete configurations

*Design* *note:* *The* *Admin* *Workspace* *is* *a* *configuration*
*and* *oversight* *surface,* *not* *an*

*operational* *one.* *It* *should* *make* *incomplete* *setup*
*immediately* *visible* *—* *a* *coach*

*cannot* *work* *in* *a* *cohort* *that* *has* *not* *been*
*configured,* *so* *anything* *blocking* *readiness*

*must* *surface* *without* *Admin* *having* *to* *dig* *for* *it.*

**1)** **Configure** **the** **Org** **Hierarchy**

2\. Admin clicks "Org hierarchy" and verifies the relevant levels are
already created: state

→ district → cohort.

3\. If the cohort does not yet exist, Admin clicks "Add cohort":

> ● Enters cohort name
>
> ● Selects parent district (from existing hierarchy) ● Clicks "Save"

4\. If the district or state level does not yet exist, Admin creates
those levels first, working

top-down: state → district → cohort. Each level is a simple name +
parent selection +

save.

*Design* *note:* *Block* *is* *not* *a* *level* *in* *the* *org*
*hierarchy.* *It* *is* *an* *attribute* *on* *the* *teacher*

*record,* *used* *for* *filtering,* *sorting,* *and* *reporting*
*aggregation.* *A* *cohort* *sits* *under* *a*

*district* *—* *this* *determines* *which* *Coach* *Manager* *oversees*
*which* *coaches* *and* *how*

*KPIs* *roll* *up* *for* *reporting.* *It* *does* *not* *constrain*
*which* *teachers* *a* *coach* *can* *be*

*assigned;* *a* *coach's* *portfolio* *will* *routinely* *draw* *from*
*multiple* *blocks* *within* *or* *across*

*districts,* *and* *this* *is* *expected* *and* *normal.*

*The* *system* *must* *prevent* *creating* *a* *cohort* *without* *a*
*valid* *parent* *district.* *Orphaned*

*cohorts* *break* *data* *scoping* *downstream* *—* *every* *coach*
*and* *teacher's* *reporting*

*visibility* *is* *determined* *by* *which* *cohort* *they* *sit* *in.*

**2)** **Create** **the** **Coach's** **Account**

5\. Admin clicks "User accounts" → "Add user."

6\. Admin enters:

> ● Full name
>
> ● Phone number / email (used for login) ● Role = Coach
>
> ● Assign to cohort (selects from the hierarchy configured in Steps
> 2–4)

7\. Admin clicks "Save" → system creates the coach account and sends
login credentials.

8\. System shows the coach as "Active / Pending first login" in the user
list. Admin does

not need to wait for first login to proceed.

*Design* *note:* *Coach* *Manager* *account* *setup* *follows* *the*
*same* *steps* *with* *Role* *=* *Coach*

*Manager,* *scoped* *to* *the* *same* *cohort* *or* *parent* *district.*
*This* *flow* *covers* *a* *single* *coach*

*—* *Admin* *would* *repeat* *Steps* *5–8* *for* *each* *coach* *in*
*the* *cohort* *before* *proceeding.*

**3)** **Standards** **—** **Central** **Defaults** **with**
**Cohort-Level** **Overrides**

*Standards* *are* *set* *once* *at* *the* *program/state* *level* *and*
*apply* *to* *all* *cohorts* *by* *default.*

*A* *cohort* *only* *needs* *to* *be* *touched* *here* *if* *its*
*standards* *differ* *from* *the* *central* *defaults.*

*Most* *cohorts* *will* *never* *need* *an* *override.*

9\. Admin clicks "Program standards" → this is the central configuration
that all cohorts

inherit unless explicitly overridden.

10\. Admin reviews or sets session standards:

> ● Weekly call target per coach (e.g., 25 completed calls/week) ●
> Touches per teacher per month (standard: 2)
>
> ● What counts as a completed touch: call happened + summary sent +
> next touch scheduled

11\. Admin reviews or sets session templates:

> ● Coaching call focus categories: Literacy / Numeracy /
> Relationship-building / Off-script
>
> ● Minimum fields coaches must capture per session (what was observed,
> what was suggested, action steps, next touch)
>
> ● VBA protocol checklist (the floating checklist coaches see during a
> VBA session)

12\. Admin reviews or sets VBA standards:

> ● Students to be assessed per VBA (e.g., 10 students) — this
> auto-populates on every VBA session record across all cohorts,
> removing the need for coaches to enter a number individually
>
> ● VBA frequency: 1 per quarter per teacher

13\. Admin reviews or sets RYG thresholds and escalation triggers:

> ● Reschedule threshold for auto-escalation (e.g., \>3 reschedules
> triggers escalation item for Coach Manager)
>
> ● VBA overdue trigger (e.g., no VBA completed by week 10 of the
> quarter)
>
> ● Chronic non-confirmation trigger (e.g., teacher unconfirmed for 3
> consecutive sessions)

14\. Admin clicks "Save program standards." These now apply to all
cohorts.

15\. If this specific cohort needs different standards, Admin opens the
cohort record →

clicks "Override standards":

> ● System shows central defaults as the starting point ● Admin edits
> only the fields that differ
>
> ● Clicks "Save cohort override"
>
> ● System records the override in the audit trail and displays a
> visible indicator on the cohort record: *"Custom* *standards*
> *applied* *—* *differs* *from* *program* *defaults"*

*Design* *note:* *Any* *cohort* *running* *on* *custom* *standards*
*must* *be* *clearly* *flagged* *in* *the*

*Admin* *Workspace* *so* *it* *is* *never* *mistaken* *for* *a*
*standard* *cohort.* *The* *override* *path*

*exists* *for* *exceptions,* *not* *routine* *use.*

**4)** **Import** **the** **Teacher** **Roster**

16\. Admin clicks "Teacher roster" → "Import CSV."

17\. Admin uploads the CSV file. Required fields per teacher row:

> ● Full name
>
> ● Designation (e.g., Assistant Teacher, Head Teacher, Shiksha Mitra) ●
> Phone number (WhatsApp-reachable)
>
> ● School name
>
> ● UDISE code (unique school identifier — used for deduplication,
> reporting, and linking to state data)
>
> ● Block tag (the teacher's school's block — a descriptive attribute
> used for filtering and reporting, not a hierarchy constraint)
>
> ● HM (Head Master) name ● HM phone number
>
> ● Grade taught (Grade 2 for DTSP Phase 1)

18\. System runs automatic validation on the uploaded file and displays
a pre-import

report:

||
||
||
||
||
||
||

||
||
||
||
||
||
||

19\. Admin reviews the validation report:

> ● Rows with hard errors (missing phone, missing UDISE, duplicate
> phone) are held out of the import — Admin must fix in the source CSV
> and re-upload, or edit inline
>
> ● Rows with warnings (unrecognised UDISE, missing designation, missing
> HM details, missing block tag) can be imported with a flag, or Admin
> can resolve first

20\. Admin clicks "Confirm import" for the clean rows → system creates a
teacher profile

for each imported teacher. Each profile contains: name, designation,
phone, school

name, UDISE code, block tag, HM name, HM phone, and a blank interaction
history

ready to receive sessions.

21\. System shows import summary: *"X* *teachers* *imported.* *Y* *rows*
*held* *for* *errors.* *Z*

*rows* *imported* *with* *warnings."*

*Ground* *reality* *note:* *Roster* *errors* *are* *the* *most* *common*
*source* *of* *downstream* *call*

*failures* *in* *the* *current* *operation* *—* *wrong* *numbers,*
*duplicates,* *and* *mismatched* *tags*

*all* *create* *silent* *failures* *that* *only* *surface* *when* *a*
*coach* *tries* *to* *reach* *a* *teacher* *and*

*gets* *a* *dead* *number* *or* *the* *wrong* *person.* *The* *UDISE*
*code* *is* *the* *critical* *deduplication*

*anchor* *—* *it* *is* *the* *only* *reliable* *way* *to* *distinguish*
*two* *teachers* *with* *the* *same* *name* *at*

*different* *schools.* *This* *validation* *step* *is* *the* *single*
*most* *important* *quality* *gate* *in* *the*

*entire* *setup* *flow.*

**5)** **Assign** **Teachers** **to** **the** **Coach**

22\. Admin clicks "Assignments" → "Assign teachers."

23\. Admin selects the coach from the user accounts created in Steps
5–8.

24\. Admin selects teachers to assign from the full imported roster.
Since a coach's

portfolio will routinely span multiple blocks, the selection interface
must support:

> ● Filter by block tag (to view and select all teachers from a given
> block) ● Filter by school / UDISE code (to pick specific schools)
>
> ● Individual selection (for ad-hoc additions)
>
> ● Any combination of the above in one assignment action

25\. Admin reviews the assignment summary before confirming:

> ● Coach name
>
> ● Total number of teachers being assigned
>
> ● Breakdown by block tag (since teachers span multiple blocks — Admin
> needs to see the spread, not just a total count)
>
> ● Any teachers already assigned to another coach — flagged for
> explicit reassignment confirmation

26\. Admin clicks "Confirm assignment" → system links the selected
teachers to the

coach. The coach's workspace will show these teachers in their portfolio
from their next

login.

27\. If any teacher was previously assigned to a different coach
(mid-program

reassignment):

> ● System retains full interaction history under the teacher profile —
> new coach can see all prior sessions, summaries, and action steps
>
> ● System records the reassignment event in the audit trail: prior
> coach name, new coach name, date of reassignment

**6)** **Confirm** **Cohort** **Readiness**

28\. Admin returns to the cohort record — system shows a readiness
checklist:

||
||
||
||
||
||
||
||

29\. If all items are ✓, the cohort is "Ready." The coach can log in and
see their full

teacher portfolio, session standards, and VBA due list.

30\. If any item is ✗, Admin resolves it before the cohort is marked
ready. The system

must not allow coaches to begin working in a cohort with incomplete
configuration —

incomplete standards or empty portfolios lead to definition drift and
data gaps that are

very difficult to correct mid-program.

**7)** **Audit** **Trail**

31\. Every action in this flow is recorded in the system audit trail:
who created what,

when, and any changes made — including role assignments, roster edits,
standard

overrides, and teacher reassignments.

32\. The audit trail is accessible to Program Admin at any time and is
the reference point

for any configuration disputes that arise mid-program (e.g., *"who*
*changed* *the*

*reschedule* *threshold* *for* *this* *cohort?"*, *"when* *was* *this*
*teacher* *reassigned?"*).

**What** **the** **System** **Must** **Never** **Do** **in** **This**
**Flow**

> ● Allow a coach account to be created without assignment to a cohort —
> unscoped coaches have no data visibility and cannot operate
>
> ● Import a teacher row with a missing or invalid phone number without
> flagging it as a hard error — phone number is the only communication
> channel to the teacher
>
> ● Import a teacher row without a UDISE code without flagging it as a
> hard error — UDISE is the only reliable school-level deduplication key
>
> ● Allow a cohort to begin without standards in place — even inherited
> central defaults must be confirmed, not assumed
>
> ● Allow a teacher to be silently reassigned without preserving full
> prior interaction history under the teacher profile
>
> ● Allow two coaches to be assigned the same teacher without explicit
> Admin confirmation — dual ownership creates scheduling conflicts and
> continuity breaks
>
> ● Place block as a structural level in the org hierarchy — block is a
> teacher attribute, not a hierarchy node
