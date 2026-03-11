import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { KPICard } from '@/components/shared/KPICard'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'


export default async function CMHome() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('cohort_id')
    .eq('id', user.id)
    .single()

  const cohortId = profile?.cohort_id
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const coaches = await supabase
    .from('profiles')
    .select('id, name')
    .eq('role', 'coach')
    .eq('cohort_id', cohortId)
    .order('name')

  const coachIds = (coaches.data ?? []).map((c: any) => c.id)

  const [openEscalations, recentSessions] = await Promise.all([
    supabase
      .from('escalations')
      .select('id, trigger_type, teacher:teachers(name), coach:profiles(name), auto_created_at')
      .eq('cohort_id', cohortId)
      .eq('status', 'open')
      .order('auto_created_at', { ascending: false })
      .limit(5),

    coachIds.length > 0
      ? supabase
          .from('sessions')
          .select('status, coach_id')
          .gte('scheduled_at', thirtyDaysAgo)
          .in('coach_id', coachIds)
      : Promise.resolve({ data: [] }),
  ])

  const coachList = coaches.data ?? []
  const sessions = recentSessions.data ?? []
  const escalations = openEscalations.data ?? []
  const completedCount = sessions.filter((s: any) => s.status === 'completed').length
  const noShowCount = sessions.filter((s: any) => s.status === 'no_show').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Cluster Overview</h1>
        <p className="text-sm text-muted-foreground">Last 30 days</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Coaches" value={coachList.length} accent="blue" />
        <KPICard label="Sessions done" value={completedCount} accent="green" />
        <KPICard label="No-shows" value={noShowCount} accent="amber" />
        <KPICard label="Escalations" value={escalations.length} accent="red" />
      </div>

      {escalations.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm font-medium text-red-900 mb-2">
            {escalations.length} open escalation{escalations.length !== 1 ? 's' : ''}
          </p>
          <div className="space-y-1.5">
            {escalations.map((esc: any) => (
              <div key={esc.id} className="flex items-center justify-between gap-2">
                <p className="text-xs text-red-800">
                  <span className="font-medium">{esc.teacher?.name ?? 'Unknown'}</span>
                  {' · '}{esc.trigger_type.replace(/_/g, ' ')}
                  {' · Coach: '}{esc.coach?.name ?? 'Unassigned'}
                </p>
                <span className="text-xs text-red-700 shrink-0 tabular-nums">{formatDate(esc.auto_created_at)}</span>
              </div>
            ))}
          </div>
          <div className="mt-2.5">
            <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-red-800 hover:text-red-900 hover:bg-red-100 -ml-2">
              <Link href="/cm/coaches">View all</Link>
            </Button>
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Coaches</p>
        <div className="rounded-lg border border-border bg-card shadow-md divide-y divide-border">
          {coachList.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No coaches in your cluster yet.</p>
          ) : (
            coachList.map((coach: any) => {
              const coachSessions = sessions.filter((s: any) => s.coach_id === coach.id)
              const coachCompleted = coachSessions.filter((s: any) => s.status === 'completed').length
              const coachNoShows = coachSessions.filter((s: any) => s.status === 'no_show').length

              return (
                <Link key={coach.id} href={`/cm/coaches/${coach.id}`}>
                  <div className="flex items-center justify-between px-3 py-2.5 hover:bg-muted/50 hover:-translate-y-px transition-all duration-150">
                    <span className="text-sm font-semibold">{coach.name}</span>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="tabular-nums">{coachCompleted} done</span>
                      {coachNoShows > 0 && <span className="text-red-600 font-medium tabular-nums">{coachNoShows} no-shows</span>}
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30" />
                    </div>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
