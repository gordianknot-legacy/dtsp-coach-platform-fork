**Flow** **E:** **Coach** **Manager** **Views** **Leadership**
**Snapshot**

Role: Coach Manager (primary), Program Admin / State Admin (read-only
consumers) Scenario: CM opens the Leadership Snapshot to get a
single-screen summary of program health — suitable for sharing with
senior leadership, state partners, or governance reviews without
exporting raw data.

Trigger: CM navigates to the Snapshot tab, or opens it before a
governance call / monthly review meeting.

Ends: CM has a complete, export-ready picture of program health across
all key dimensions.

Context & Design Rationale:

The weekly ops review and portfolio health views are designed for the
CM's operational decision-making — they are filter-heavy,
drill-down-oriented, and not structured for communication. A senior
leader or state partner asking *"how* *is* *the* *programme* *doing?"*
needs a different surface: high-level numbers, clear denominators, and
trend direction — all in one view with no navigation required. This
snapshot is not a replacement for operational views; it is a
distillation of them into a communication-ready format. Every number on
this screen must be derivable from data already in the system — no
manual compilation, no separate tracker.

Ground reality note: Today the CM manually assembles a PowerPoint or
fills a Google Sheet before every review meeting. This takes 1–2 hours
and produces numbers that are already stale by the time the meeting
happens. The snapshot must be live — reflecting the state of the
programme at the moment it is opened — and exportable in one click.

**0)** **Landing** **on** **CM** **Home**

> 1\. CM logs in → lands on CM Home. Clicks "Snapshot" tab in navigation
> (alongside My Coaches \| All Teachers \| Exports). Snapshot tab is
> visible to CM, Program Admin, and State Admin. State Admin sees the
> same view scoped to their state — read-only.

**1)** **Snapshot** **—** **Top** **Bar:** **Programme** **Vitals**

2\. CM lands on the Leadership Snapshot. At the very top — always
visible, never behind a scroll — the Programme Vitals strip. These are
the five numbers a senior leader asks for first:

||
||
||
||
||
||
||
||

> ●
>
> Each metric shows a directional indicator vs. the previous period: ↑
> 4% / ↓ 2% / → unchanged.
>
> ● Clicking any vitals metric deep-links to the relevant operational
> view (e.g., clicking "At-Risk Teachers" goes to Portfolio Health with
> the Red + Behind Schedule filter pre-applied).
>
> 3\. Design note: "Active" vs "Total" is one of the most important
> distinctions for leadership communication. A programme claiming 312
> teachers must be able to show how many are genuinely engaged. The
> denominator matters as much as the
>
> numerator. The definition of "active" (completed touch in last N days)
> must be configurable — a fortnightly programme has a different N than
> a weekly one.

**2)** **Teacher** **Health** **Distribution**

> 3\. Below the vitals strip: Teacher Health section. Three numbers with
> visual weight proportional to size:
>
> 4\. text

🟢 Green 189 (60%) ↑ from 54% last period 🟡 Yellow 100 (32%) → stable

🔴 Red 23 (8%) ↓ from 6% last period 5.

> ● Each status shows: count, % of total, and directional change vs.
> previous period.
>
> ● Below the distribution: "No movement plan: 3 Red teachers" — flagged
> in amber if any Red teachers lack a plan.
>
> ● Period selector available (same quick picks as Ops Review: This Week
> / This Month / Custom). Default = current period. Changing the period
> updates all sections on the snapshot simultaneously.
>
> 6\. Design note: The directional change is the signal leadership
> actually cares about. A programme with 8% Red is concerning; a
> programme where Red dropped from 12% to 8% is improving. Both facts
> must be visible on the same line. The previous period comparison must
> use the same definition of "period" as the current view — no silent
> definitional shift between the two numbers.

**3)** **Call** **Funnel** **—** **Touches** **per** **Teacher**
**This** **Period**

> 4\. Call Funnel section. This is the core delivery story — how many
> teachers received how many touches:
>
> 5\. text

Planned

Scheduled

312 (100% of portfolio)

289 (93%)

Completed 247 (79%) ← Completion rate denominator ├── Call 1 247
teachers received at least 1 touch ├── Call 2 168 teachers received 2
touches (target: 2/month)

└── Call 3+ 9 teachers received 3+ touches (recovery calls)

No-show 28 (10% of scheduled)

Rescheduled 14 (5% of scheduled — currently outstanding) Cancelled 6
(2%)

> 6\.
>
> ● "2-touch coverage" highlighted as the programme's core delivery
> metric: 168 / 312 = 54% of portfolio received both touches this period
> 🔴 (target: \>85%).
>
> ● Directional indicator vs. previous period: ↑ / ↓ / →
>
> ● VBA touches shown separately below the coaching call funnel: 7. text

VBA (this

Due

quarter)

> 312 (all teachers — 1 VBA/quarter)

Planned

Completed

278 (89%)

212 (68%) ← Quarter VBA coverage

Overdue 66 (21%) — of which 12 have \<30 days to quarter-end 🔴

> 8\.
>
> 9\. Design note: The call funnel must show the full drop-off story —
> not just completion rate. A completion rate of 79% is ambiguous: it
> could mean 79% of a well-planned schedule, or 79% of an under-planned
> schedule. Showing Planned → Scheduled → Completed as a funnel makes
> the planning discipline visible. The "2-touch coverage" metric is the
> honest answer to the question senior leadership is really asking: how
> many teachers are actually getting the full intervention dose?

**4)** **Coach** **Performance** **Summary**

5\. Coach Performance section. Cross-coach comparison in a single
compact table — not a drill-down, just the headline numbers:

||
||
||
||
||
||
||

> ●
>
> Each coach name is clickable — deep-links to that coach's 1:1
> Workspace.
>
> ● Table is read-only in the Snapshot — no actions available. Actions
> happen in the 1:1 Workspace.
>
> ● Rows sorted by overall risk (most flags first).
>
> 6\. Design note: This table is for leadership communication, not coach
> performance management. It is visible to Program Admin and State Admin
> in read-only mode. It surfaces patterns — one coach consistently
> underperforming, one coach with a last-login gap — that a senior
> leader might ask about. The CM's job is to have answers to these
> questions ready, not to be surprised by them in a meeting.

**5)** **Intervention** **Mix** **—** **What** **Kind** **of**
**Coaching** **Is** **Happening**

> 6\. Intervention Mix section. Answers the question: are coaches
> spending their call time on the right things?
>
> 7\. text

Call Focus Distribution (completed calls, active period)

📘 Literacy

🔢 Numeracy

112 calls (45%)

> 89 calls (36%)

🤝 Relationship 31 calls (13%) ⚡ Off-script / Problem 15 calls (6%) 🏷
No focus tag 8 calls (3%) 🟡

> 8\.
>
> ● "No focus tag" shown in amber if above a configurable threshold
> (default: \>5% of completed calls) — indicates documentation
> discipline gap, not just a quality issue.
>
> ● Directional comparison vs. previous period for each focus type.
>
> 9\. Design note: The intervention mix tells a coaching quality story
> that completion rate cannot. A programme where 40% of calls are
> "relationship" or "off-script" may be struggling with instructional
> focus. A programme where literacy and numeracy together account for
> \>80% of calls is on-strategy. This is the number a CSF academic lead
> or state education officer will want to see in a review meeting.

**6)** **Primary** **Platform** **Used** **—** **Connectivity**
**Reality** **Check**

> 7\. Platform & Connectivity section. Answers the question: is the
> programme actually running on video, or degrading to audio?
>
> 8\. text

Session Channel (completed calls, active period) 📹 Google Meet (video)
168 calls (68%)

📱 WhatsApp Video 41 calls (17%) 🔊 Audio only 29 calls (12%)

💬 Async / WhatsApp message 9 calls (4%) ← lowest quality touch

> 9\.
>
> ● "Async / WhatsApp message" shown in amber if above configurable
> threshold — async closure is the fallback of last resort and should
> not become routine.
>
> ● For VBA specifically: "% of VBAs conducted on stable video: 94%" —
> shown separately because VBA protocol integrity depends on video. Any
> VBA conducted on audio-only is flagged as a protocol concern.
>
> 10.Design note: This data is only as reliable as the coach's channel
> logging at session close. In MVP, channel is self-reported by the
> coach (from the connectivity fallback logging in the session record).
> The Snapshot must show this caveat: *"Channel* *data* *based* *on*
> *coach-reported* *session* *records."* If coaches are not logging
> channel switches, this section will over-report Google Meet usage. The
> missing-data problem is itself a signal about documentation
> discipline.

**7)** **Webinar** **Reach**

> 8\. Webinar section (compact — not the primary KPI, but relevant for
> governance): 9. text

This month's webinar

Invited Attended

Catch-up sent

312

> 89 (29%) 🔴

178 (57%)

No engagement 45 (14%) 🟡 10.

> ● "No engagement" = neither attended nor received a catch-up link —
> shown in amber if above configurable threshold.
>
> ● Directional vs. previous month.

**8)** **Snapshot** **Period** **and** **Export**

> 9\. Period selector visible at the top of the Snapshot (sticky —
> always accessible): This Week / This Month / This Quarter / Custom.
> Default = current month for the Snapshot (distinct from the Ops Review
> default of current week — the Snapshot is a governance view, not a
> tactical view). Changing the period updates all sections
> simultaneously.
>
> 10."Export Snapshot" button at top right of the screen:
>
> ● Generates a single PDF with all sections formatted for presentation
> — not a raw CSV. Clean layout, metric labels, period clearly stated,
> directional indicators included.
>
> ● PDF header shows: CM name, org unit (district/block/cohort), period,
> date generated.
>
> ● Export takes \<10 seconds. No reformatting required by the CM before
> sharing.
>
> 11\. Design note: The PDF export is the primary governance artefact
> for state-level reviews and CSF leadership meetings. It must be
> designed as a standalone document — readable without the platform,
> self-explanatory to a government officer who has never seen the CRM.
> Every metric on the PDF must include its definition (in small text
> below the number) and its denominator. "79% completion rate" must also
> show "completed calls / (completed + no-show + cancelled)" so the
> reader cannot misinterpret it.

**What** **the** **System** **Must** **Never** **Do** **in** **This**
**Flow**

> ● Allow any Snapshot metric to be manually edited — all numbers must
> be system-derived from session and teacher records
>
> ● Use a different definition of "completed" in the Snapshot than in
> the Ops Review — consistent definitions across all views is a
> first-order governance requirement
>
> ● Show the Snapshot to coaches — CM, Program Admin, and State Admin
> only ● Hard-code period defaults, threshold definitions, or "at-risk"
> definitions — all
>
> configurable by Program Admin
>
> ● Export the Snapshot as raw CSV — the export must be a formatted,
> presentation-ready PDF
>
> ● Allow the Snapshot to go stale — it must reflect live data at the
> moment it is opened, not a cached snapshot from the last login
>
> ● Show completion rate without the full funnel (Planned → Scheduled →
> Completed) — the denominator and drop-off points are as important as
> the final percentage
>
> ● Display VBA channel data without the caveat that it is
> coach-reported and dependent on session logging discipline
