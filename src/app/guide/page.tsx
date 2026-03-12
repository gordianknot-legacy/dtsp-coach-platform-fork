import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function GuidePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 bg-white border-b border-border">
        <div className="px-5 sm:px-8 md:px-10 lg:px-16 xl:px-24 max-w-[960px] mx-auto flex items-center gap-3 h-14">
          <Link href="/" className="p-1.5 -ml-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-sm font-semibold">Platform Guide</h1>
        </div>
      </header>

      {/* Content */}
      <main className="px-5 sm:px-8 md:px-10 lg:px-16 xl:px-24 max-w-[960px] mx-auto py-8 sm:py-12">
        <div className="space-y-12">

          {/* Title */}
          <div>
            <div className="h-9 px-3 rounded-lg bg-brand text-brand-foreground flex items-center justify-center text-sm font-bold tracking-tight w-fit mb-4">
              DTSP
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              District Teacher Support Programme
            </h2>
            <p className="text-base text-muted-foreground mt-2 max-w-2xl">
              A coaching CRM that helps CSF&apos;s DTSP coaches manage 1-on-1 sessions, track teacher progress, and support instructional improvement across Uttar Pradesh primary schools.
            </p>
          </div>

          {/* Objective */}
          <Section title="Objective">
            <p>
              DTSP places trained coaches in UP districts. Each coach works with ~36 primary school teachers through regular coaching calls, classroom visits (VBA), and WhatsApp follow-ups.
            </p>
            <p>
              This platform is the operational backbone — it tracks every interaction, surfaces teachers who need attention, and gives program leadership a real-time view of coaching quality and coverage.
            </p>
            <Callout>
              Alpha phase: 2–5 real coaches, ~150 real teachers. The platform runs on Supabase (free tier) + Vercel (free tier) at $0/month.
            </Callout>
          </Section>

          {/* Key Terms */}
          <Section title="Key Terms & Definitions">
            <dl className="space-y-4">
              <Term term="Session" definition="A scheduled 1-on-1 coaching interaction between a coach and a teacher. Can be via Google Meet, phone, or in-person. Each session has a status lifecycle: Scheduled → Confirmed → In Progress → Completed (or No-Show / Rescheduled / Cancelled)." />
              <Term term="VBA (Visit-Based Assessment)" definition="An in-classroom observation where the coach assesses student learning outcomes directly. Students are tested on literacy and numeracy. Results are recorded per-student." />
              <Term term="RYG Status" definition="Red / Yellow / Green rating assigned to each teacher by their coach. Reflects the coach's judgment of the teacher's current practice quality. Every change is logged with who set it, when, and the prior status." />
              <Term term="Cohort" definition="An organizational grouping below district level. Each cohort has its own program standards, session templates, and rubrics. Coaches and teachers belong to a cohort. A CM manages one cohort." />
              <Term term="Escalation" definition="A flag raised when a teacher crosses a threshold (e.g., 3+ reschedules in 30 days). Can be auto-triggered by the system or manually created. CMs resolve escalations." />
              <Term term="Action Step" definition="A concrete next step agreed upon during a coaching session. Has a description, due date, and status (open / completed / carried forward). Up to 3 per session." />
              <Term term="Movement Plan" definition="A CM-created plan to improve a teacher's RYG status. Contains specific actions assigned to the coach and CM, with target dates." />
              <Term term="Focus Tag" definition="The topic of a coaching session: Literacy, Numeracy, Classroom Management, Relationship Building, or Off-script. Configured per cohort in Standards." />
              <Term term="Program Standards" definition="Configurable thresholds and rules per cohort — e.g., reschedule escalation threshold (default: 3), required sessions per teacher per month (default: 2), VBA frequency." />
              <Term term="Session Template" definition="Per-cohort configuration that defines focus categories, required fields, VBA checklist items, and rubric dimensions." />
            </dl>
          </Section>

          {/* Org Hierarchy */}
          <Section title="Organization Hierarchy">
            <div className="rounded-lg border border-border p-4 bg-muted/30 font-mono text-sm space-y-1">
              <p className="text-muted-foreground">State</p>
              <p className="ml-4">└─ District</p>
              <p className="ml-8">└─ <span className="font-semibold text-primary">Cohort</span> <span className="text-muted-foreground text-xs">(operational unit — coaches, teachers, standards scoped here)</span></p>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Example: Uttar Pradesh → Lucknow → Lucknow Cohort A. Each cohort has its own coaches, CM, teachers, rubrics, and escalation thresholds.
            </p>
          </Section>

          {/* Roles */}
          <Section title="User Roles">
            <div className="grid gap-4 sm:grid-cols-2">
              <RoleCard
                role="Coach"
                color="bg-blue-50 border-blue-200"
                description="Manages ~36 teachers. Conducts coaching calls, VBAs, and WhatsApp follow-ups. Sets RYG status. Records session notes and action steps."
                screens={['Coach Home — weekly session list + calendar', 'Call Workspace — during-session controls + notes', 'After Call — notes, action steps, WhatsApp draft', 'Teacher List — all assigned teachers + RYG', 'Teacher Profile — full history for one teacher', 'VBA Workspace — student-level assessment']}
              />
              <RoleCard
                role="Coach Manager (CM)"
                color="bg-purple-50 border-purple-200"
                description="Supervises all coaches in one cohort. Resolves escalations. Conducts 1:1s with coaches. Creates movement plans for struggling teachers."
                screens={['CM Home — cohort KPIs + coach overview', 'Coach Triage — prioritized coach list + escalations', '1:1 Workspace — session with individual coach', 'Leadership Snapshot — aggregate program metrics']}
              />
              <RoleCard
                role="Admin"
                color="bg-amber-50 border-amber-200"
                description="Configures the platform. Sets up org hierarchy, creates user accounts, imports teacher rosters, manages coach-teacher assignments, and defines rubrics/standards."
                screens={['Admin Home — setup status + quick links', 'Org Setup — state/district/cohort hierarchy', 'Users — create coaches and CMs', 'Rosters — CSV teacher import', 'Assignments — teacher-coach mapping', 'Standards — rubrics and program config']}
              />
              <RoleCard
                role="Observer"
                color="bg-green-50 border-green-200"
                description="Read-only state-level view. Sees aggregate metrics across all cohorts. No write access."
                screens={['State Snapshot — cross-cohort program metrics']}
              />
            </div>
          </Section>

          {/* Feature Walkthrough */}
          <Section title="How Each Feature Works">
            <div className="space-y-6">
              <Feature
                title="Coaching Sessions"
                steps={[
                  'Coach creates a session from Coach Home — picks teacher, date/time, channel (Meet/phone/in-person)',
                  'Session appears in the weekly list and calendar. Coach sends confirmation reminder via WhatsApp (copy-paste)',
                  'At session time, coach opens the Call Workspace. If Google Meet, a popup opens the meeting link',
                  'During the call, coach can take quick notes and tag the focus area',
                  'After the call, coach fills in the After Call screen: what was discussed, what was decided, action steps (up to 3), and optionally generates a Hindi WhatsApp summary via AI',
                  'Session status moves to "completed". Missing fields surface as a yellow banner on next login',
                ]}
              />
              <Feature
                title="WhatsApp Summaries"
                steps={[
                  'After a session, the platform can generate a Hindi summary draft using AI (Llama 3.1 via OpenRouter)',
                  'The draft appears in an editable textarea with Devanagari font support',
                  'Coach reviews, edits, then copies to clipboard. A green "Copied!" confirmation shows for 5 seconds',
                  'Coach pastes into WhatsApp manually. No automation — the platform generates text, the coach sends it',
                ]}
              />
              <Feature
                title="RYG Teacher Rating"
                steps={[
                  'Coach sets Red/Yellow/Green status for each teacher based on their judgment of classroom practice',
                  'Every change is logged: who set it, when, previous status, and optional dimension scores',
                  'RYG distribution is visible to CMs in the Coach Triage and Leadership Snapshot screens',
                  'CMs can create Movement Plans for Red/Yellow teachers with specific actions and target dates',
                ]}
              />
              <Feature
                title="VBA (Visit-Based Assessment)"
                steps={[
                  'Coach schedules a VBA from the VBA Workspace — similar to a session but includes student-level testing',
                  'During the visit, coach records each student\'s literacy (letter recognition, word reading, fluency) and numeracy (number recognition, operations) scores',
                  'Results auto-save as the coach enters them (idempotent PATCH per student)',
                  'Completed VBAs contribute to the teacher\'s profile and program-level analytics',
                ]}
              />
              <Feature
                title="Escalations"
                steps={[
                  'Auto-triggered: when a teacher\'s reschedule count in 30 days crosses the threshold (default: 3), the system creates an escalation automatically',
                  'Manual: coaches or CMs can also create escalations for any reason',
                  'Escalations appear in the CM\'s Coach Triage screen with an alert badge',
                  'CM resolves by adding resolution notes and a category. Status: Open → In Progress → Resolved/Closed',
                ]}
              />
              <Feature
                title="Admin Setup Flow"
                steps={[
                  'Create org hierarchy in Org Setup: State → District → Cohort',
                  'Create user accounts in Users: assign email, role, and cohort',
                  'Import teachers via CSV in Rosters: name, phone, school, UDISE code, block',
                  'Map teachers to coaches in Assignments',
                  'Configure rubrics, focus categories, and thresholds in Standards',
                ]}
              />
              <Feature
                title="Role Switching"
                steps={[
                  'Click your avatar/role label in the top-right corner of the navigation bar',
                  'Select any role (Coach, CM, Admin, Observer) from the dropdown',
                  'The app navigates to that role\'s home screen immediately — this is a view-only switch',
                  'Your database role does not change. All CSF team members have admin-level access and can view any role\'s interface',
                ]}
              />
            </div>
          </Section>

          {/* Dummy Data */}
          <Section title="Dummy Data & Test Users">
            <p>
              The platform is pre-loaded with seed data so you can explore every screen without setting up real data first.
            </p>

            <h4 className="text-sm font-semibold mt-4 mb-2">Seed Users</h4>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium">Name</th>
                    <th className="text-left px-3 py-2 font-medium">Role</th>
                    <th className="text-left px-3 py-2 font-medium">Cohort</th>
                    <th className="text-left px-3 py-2 font-medium">Teachers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr><td className="px-3 py-2">Aarav Sharma</td><td className="px-3 py-2">Admin</td><td className="px-3 py-2">Lucknow A</td><td className="px-3 py-2 text-muted-foreground">—</td></tr>
                  <tr><td className="px-3 py-2">Neha Gupta</td><td className="px-3 py-2">Observer</td><td className="px-3 py-2 text-muted-foreground">All</td><td className="px-3 py-2 text-muted-foreground">—</td></tr>
                  <tr><td className="px-3 py-2">Priya Singh</td><td className="px-3 py-2">CM</td><td className="px-3 py-2">Lucknow A</td><td className="px-3 py-2 text-muted-foreground">—</td></tr>
                  <tr><td className="px-3 py-2">Ravi Verma</td><td className="px-3 py-2">CM</td><td className="px-3 py-2">Prayagraj A</td><td className="px-3 py-2 text-muted-foreground">—</td></tr>
                  <tr className="bg-blue-50/50"><td className="px-3 py-2">Sunita Devi</td><td className="px-3 py-2">Coach</td><td className="px-3 py-2">Lucknow A</td><td className="px-3 py-2">Rekha, Poonam, Vinod</td></tr>
                  <tr className="bg-blue-50/50"><td className="px-3 py-2">Manoj Kumar</td><td className="px-3 py-2">Coach</td><td className="px-3 py-2">Lucknow A</td><td className="px-3 py-2">Meena, Anil, Savitri</td></tr>
                  <tr className="bg-blue-50/50"><td className="px-3 py-2">Kavita Yadav</td><td className="px-3 py-2">Coach</td><td className="px-3 py-2">Lucknow B</td><td className="px-3 py-2">Raj Kumar, Geeta, Shiv, Pushpa</td></tr>
                  <tr className="bg-blue-50/50"><td className="px-3 py-2">Deepak Tiwari</td><td className="px-3 py-2">Coach</td><td className="px-3 py-2">Prayagraj A</td><td className="px-3 py-2">Ramesh, Asha, Bhagwan</td></tr>
                  <tr className="bg-blue-50/50"><td className="px-3 py-2">Anjali Mishra</td><td className="px-3 py-2">Coach</td><td className="px-3 py-2">Prayagraj A</td><td className="px-3 py-2">Sushila, Om Prakash</td></tr>
                </tbody>
              </table>
            </div>

            <h4 className="text-sm font-semibold mt-6 mb-2">Seed Data Includes</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>6 org units (1 state, 2 districts, 3 cohorts)</li>
              <li>15 teachers with realistic UP school names and block tags</li>
              <li>27 sessions across all statuses (completed, scheduled, confirmed, in-progress, no-show, rescheduled, cancelled)</li>
              <li>13 session notes with Hindi AI draft examples</li>
              <li>14 action steps (mix of open and completed)</li>
              <li>15 RYG ratings (mix of R, Y, G across all teachers)</li>
              <li>4 reschedules, 2 escalations (1 auto-triggered, 1 manual)</li>
              <li>3 CM commitments, 2 VBA sessions, 5 student results, 2 movement plans</li>
            </ul>

            <h4 className="text-sm font-semibold mt-6 mb-2">Dummy vs. Real Users</h4>
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium w-1/3"></th>
                    <th className="text-left px-3 py-2 font-medium">Dummy (Seed) Users</th>
                    <th className="text-left px-3 py-2 font-medium">Real (Admin-Created) Users</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr><td className="px-3 py-2 font-medium">Created via</td><td className="px-3 py-2">Seed script (<code className="text-xs bg-muted px-1 rounded">seed.ts</code>)</td><td className="px-3 py-2">Admin → Users page</td></tr>
                  <tr><td className="px-3 py-2 font-medium">Email domain</td><td className="px-3 py-2">@example.com</td><td className="px-3 py-2">@centralsquarefoundation.org</td></tr>
                  <tr><td className="px-3 py-2 font-medium">Can log in</td><td className="px-3 py-2">No (no Google OAuth for @example.com)</td><td className="px-3 py-2">Yes, via Google sign-in</td></tr>
                  <tr><td className="px-3 py-2 font-medium">Role</td><td className="px-3 py-2">Fixed per user (coach, cm, admin, observer)</td><td className="px-3 py-2">Admin by default, can view all roles</td></tr>
                  <tr><td className="px-3 py-2 font-medium">Data visibility</td><td className="px-3 py-2">Scoped by RLS to their assigned cohort/teachers</td><td className="px-3 py-2">Admin RLS — sees all data</td></tr>
                  <tr><td className="px-3 py-2 font-medium">Purpose</td><td className="px-3 py-2">Populate screens with realistic data for demos</td><td className="px-3 py-2">Actual platform access for CSF team</td></tr>
                </tbody>
              </table>
            </div>
          </Section>

          {/* Hindi Summary */}
          <Section title="हिंदी सारांश">
            <div className="rounded-lg border border-border p-5 bg-amber-50/30 space-y-4" lang="hi" dir="auto">
              <p className="font-semibold text-base">
                DTSP कोच प्लेटफ़ॉर्म — संक्षिप्त परिचय
              </p>
              <p>
                यह प्लेटफ़ॉर्म CSF के District Teacher Support Programme के लिए बनाया गया है। इसमें कोच अपने शिक्षकों के साथ हुई 1-on-1 कोचिंग सत्रों को रिकॉर्ड करते हैं, शिक्षकों की प्रगति ट्रैक करते हैं, और WhatsApp पर हिंदी सारांश भेजते हैं।
              </p>

              <p className="font-semibold mt-4">मुख्य शब्दावली:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>सत्र (Session)</strong> — कोच और शिक्षक के बीच एक निर्धारित कोचिंग बातचीत</li>
                <li><strong>VBA</strong> — कक्षा में जाकर छात्रों का साक्षरता और गणित मूल्यांकन</li>
                <li><strong>RYG स्थिति</strong> — लाल/पीला/हरा — शिक्षक की वर्तमान शिक्षण गुणवत्ता का आकलन</li>
                <li><strong>कोहॉर्ट (Cohort)</strong> — जिले के अंतर्गत एक संगठनात्मक इकाई जहाँ कोच और शिक्षक जुड़े होते हैं</li>
                <li><strong>एस्केलेशन (Escalation)</strong> — जब कोई शिक्षक बार-बार सत्र रद्द करता है तो स्वचालित चेतावनी</li>
                <li><strong>कार्य चरण (Action Step)</strong> — सत्र में तय किया गया अगला कदम, जैसे &quot;अगले सप्ताह नई सामग्री तैयार करें&quot;</li>
              </ul>

              <p className="font-semibold mt-4">उपयोगकर्ता भूमिकाएँ:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>कोच</strong> — ~36 शिक्षकों के साथ कोचिंग सत्र आयोजित करता है</li>
                <li><strong>कोच मैनेजर (CM)</strong> — एक कोहॉर्ट के सभी कोचों की देखरेख करता है</li>
                <li><strong>एडमिन</strong> — प्लेटफ़ॉर्म सेटअप: संगठन, उपयोगकर्ता, रोस्टर, मानक</li>
                <li><strong>ऑब्ज़र्वर</strong> — केवल पढ़ने के लिए — राज्य-स्तरीय समग्र दृश्य</li>
              </ul>

              <p className="font-semibold mt-4">महत्वपूर्ण बातें:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>WhatsApp सारांश AI द्वारा तैयार होता है — कोच संपादित करके मैन्युअल रूप से भेजता है</li>
                <li>सत्र बंद करना &quot;सॉफ्ट&quot; है — अधूरा डेटा सेव होता है, अगली बार बैनर दिखता है</li>
                <li>सभी CSF टीम सदस्य एडमिन के रूप में लॉगिन करते हैं और कोई भी भूमिका देख सकते हैं</li>
              </ul>
            </div>
          </Section>

          {/* Quick Reference */}
          <Section title="Quick Reference">
            <div className="grid gap-3 sm:grid-cols-2">
              <RefCard label="Sessions per teacher/month" value="2 (configurable)" />
              <RefCard label="Max action steps per session" value="3" />
              <RefCard label="Reschedule escalation threshold" value="3 in 30 days" />
              <RefCard label="WhatsApp copy confirmation" value="5 seconds" />
              <RefCard label="AI model" value="Llama 3.1 8B (OpenRouter free tier)" />
              <RefCard label="VBA student save" value="Auto-save, idempotent" />
              <RefCard label="Session close" value="Soft — never blocks, missing fields flagged" />
              <RefCard label="Auth" value="Google OAuth, @centralsquarefoundation.org" />
            </div>
          </Section>

          {/* Footer */}
          <div className="border-t border-border pt-8 text-center">
            <p className="text-xs text-muted-foreground">
              Central Square Foundation — District Teacher Support Programme
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Platform guide last updated March 2026
            </p>
          </div>

        </div>
      </main>
    </div>
  )
}

// ============================================================================
// Components
// ============================================================================

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-lg font-semibold tracking-tight mb-4 pb-2 border-b border-border">
        {title}
      </h3>
      <div className="text-sm leading-relaxed text-foreground space-y-3">
        {children}
      </div>
    </section>
  )
}

function Term({ term, definition }: { term: string; definition: string }) {
  return (
    <div>
      <dt className="font-semibold text-foreground">{term}</dt>
      <dd className="text-muted-foreground mt-0.5">{definition}</dd>
    </div>
  )
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50/50 px-4 py-3 text-sm text-blue-900">
      {children}
    </div>
  )
}

function RoleCard({ role, color, description, screens }: { role: string; color: string; description: string; screens: string[] }) {
  return (
    <div className={`rounded-xl border p-4 ${color}`}>
      <h4 className="font-semibold text-sm mb-1.5">{role}</h4>
      <p className="text-sm text-muted-foreground mb-3">{description}</p>
      <div className="space-y-1">
        {screens.map((s) => (
          <p key={s} className="text-xs text-muted-foreground flex gap-1.5">
            <span className="text-muted-foreground/40 shrink-0">•</span>
            {s}
          </p>
        ))}
      </div>
    </div>
  )
}

function Feature({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div>
      <h4 className="font-semibold text-sm mb-2">{title}</h4>
      <ol className="space-y-1.5">
        {steps.map((step, i) => (
          <li key={i} className="text-sm text-muted-foreground flex gap-2">
            <span className="text-xs font-medium text-foreground bg-muted rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

function RefCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border px-3.5 py-2.5 flex justify-between items-center gap-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground shrink-0">{value}</span>
    </div>
  )
}
