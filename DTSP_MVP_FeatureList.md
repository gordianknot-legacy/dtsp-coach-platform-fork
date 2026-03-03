**DTSP** **MVP** **FEATURE** **LIST**

**Platform** **foundations**

> ● Roles & permissions: Coach, Coach Manager, Program Admin, Govt
> observer read-only views.
>
> ● Org hierarchy: state → district → block → cohort, scoped data access
> by org unit. ● Roster management: CSV import, duplicate/invalid phone
> detection, tagging
>
> (school/block), bulk edits.
>
> ● Assignment engine: teacher↔coach allocation, reassignment with
> history continuity.
>
> ● Standard definitions & templates: what counts as “completed,” focus
> categories, minimum fields, session rubrics.
>
> ● Audit trail: who changed what, when (status, assignments,
> thresholds, escalations).

**Teacher** **&** **coach** **CRM**

> ● Unified teacher profile: contact, school context, engagement notes,
> artifacts, status timeline.
>
> ● Full interaction history: all sessions, summaries, action steps,
> reschedules, VBA outcomes.
>
> ● Action step tracker: observable actions, due date, done/not done,
> carried forward to next touch.
>
> ● Teacher status (manual R/Y/G + movement plan): configurable
> dimensions, movement plan fields for Red teachers.
>
> ● Coach workspace home: “today’s calls,” “unconfirmed,” “due
> summaries,” “overdue actions,” “VBA due.”

**Scheduling** **&** **confirmations** **(WhatsApp-first,** **without**
**sync)**

> ● Weekly planning board: capacity planning, buffer slots, habitual
> windows, draft schedule.
>
> ● Call scheduling: select time window, generate/store meeting link,
> attach agenda/checklist.
>
> ● Reminder templates: day-before reminder + day-of confirmation
> (copy-to-WhatsApp).
>
> ● “At-risk today” list: unconfirmed calls, repeat no-pickup patterns,
> time-to-slot countdown.
>
> ● Reschedule flow: capture new window + reason category, reschedule
> counter, auto-escalate on repeat.
>
> ● Completion logging: completed / no-show / cancelled / rescheduled +
> tech issue flag.

**In-call** **capture** **(minimum** **viable** **+** **quality)**

> ● Session template (fast): focus tag
> (lit/num/relationship/off-script), 1–3 actions, next touch window.
>
> ● Structured notes (lightweight): a few fields aligned to the call
> (what was observed, what was suggested).
>
> ● Collateral logging: what TG pages / PDFs / resources were used;
> screen-share vs WhatsApp file share fallback.
>
> ● Connectivity fallback logging: channel switch (Meet→WhatsApp
> video→audio/phone), whether touch counted.

**Post-call** **summary** **+** **documentation**

> ● WhatsApp-ready summary composer: 2–3 highlights + action steps +
> next touch window + links, copy-to-WhatsApp.
>
> ● “Marked sent” tracking: checkbox + timestamp so managers can audit
> summary discipline.
>
> ● Missing-summary queue: auto-list sessions without same-day summary.
>
> ● Forms/surveys dispatch tracking (if used): sent vs completed
> indicators (without WhatsApp sync).

**Artifact** **management**

> ● Artifact receipt record: type tags (weekly assessment,
> Taalika/Aaklan, tracker photo), linked to teacher + date/session.
>
> ● Storage integration (basic): upload, naming convention helper,
> searchable by tags/date (even if backed by Drive).
>
> ● Artifact-to-action linkage: “requested in last call” → “received?”
> and time-to-receipt.

**VBA** **module** **(planning** **→** **delivery** **→** **insights)**

> ● VBA due list + planning calendar: who is due this quarter, planned
> date, overdue alerts.
>
> ● VBA session record: shortlist students, record tech glitches,
> protocol checklist, integrity flags.
>
> ● Digital response capture: enter student responses during/after call
> to avoid paper→form duplication.
>
> ● Classroom report + insights: generate a simple output, prompt
> remedial plan creation and next steps.
>
> ● VBA monitoring dashboard: completion rates, timeliness, average
> duration, integrity/protocol flags.

**Coach** **Manager** **“operating** **system”**

> ● Weekly ops dashboard: planned/scheduled/completed, reschedules,
> no-shows, missing summaries, confirmation hygiene.
>
> ● Portfolio health views: behind-schedule teachers, repeat
> reschedulers, overdue VBAs, Red teachers with missing movement plans.
>
> ● Escalation queue: auto-triggers (repeat reschedules, VBA integrity
> flags, chronic non-confirmation), assign owner, track closure.
>
> ● Quality spot-check tool: sample sessions quickly, view
> notes+summary, rate agenda adherence/action clarity/tone; feedback
> notes.
>
> ● Coach 1:1 workspace: per-coach KPI rollup, commitments for next
> week, follow-up items.
>
> ● Exports: CSV exports for leadership/state reviews with consistent
> definitions.

**Content** **&** **webinar** **support** **(CMS-lite)**

> ● Central content library: webinar collateral, TG-linked PDFs/images,
> searchable and shareable.
>
> ● Quick-share from session: attach collateral to a session and include
> link in summary.
>
> ● Webinar operations: attendance/completion tracking (as feasible),
> missed-webinar catch-up link logged against teacher.

**AI** **“selective** **deepening”** **(included** **now,**
**non-blocking)**

> ● AI pre-session brief: pull last summary/actions, suggest likely
> focus area, surface risk signals.
>
> ● AI draft summary: generate WhatsApp-ready summary from structured
> notes/transcript; coach edits (coach-in-loop).
>
> ● Transcription (opportunistic): real-time or upload-based where
> channel supports it; not assumed on every call.
>
> ● Transcript-derived quality signals (conditional): talk-time ratio
> etc., computed only when transcript exists.
>
> ● Smart prompts: flag missing structure (no action steps/next touch)
> before allowing session closure.
>
> ● Advanced analytics (non-dependent): cohort trends, quality drift
> indicators using mixed signals (tags + spot-checks + conditional
> transcript metrics).

**Explicitly** **excluded** **(per** **your** **constraint)**

> ● Two-way WhatsApp sync / full message history ingestion into the
> platform.
