import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { KPICard } from '@/components/shared/KPICard'
import { AlertCircle, ArrowRight, ChevronRight } from 'lucide-react'
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

  // Fetch coaches first since sessions query depends on coach IDs
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Cluster Overview</h1>
        <p className="text-muted-foreground mt-1">Last 30 days</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard label="Coaches" value={coachList.length} />
        <KPICard label="Sessions done" value={completedCount} />
        <KPICard label="No-shows" value={noShowCount} />
        <KPICard label="Escalations" value={escalations.length} />
      </div>

      {/* Escalations */}
      {escalations.length > 0 && (
        <div className="rounded-xl bg-red-50 border border-red-200/60 p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
            <p className="text-sm font-semibold text-red-800">
              {escalations.length} open escalation{escalations.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="space-y-2.5 ml-[42px]">
            {escalations.map((esc: any) => (
              <div key={esc.id} className="flex items-center justify-between gap-2">
                <div className="text-sm text-red-900">
                  <span className="font-medium">{esc.teacher?.name}</span>
                  <span className="text-red-600"> · {esc.trigger_type.replace(/_/g, ' ')}</span>
                  <span className="text-red-500 text-xs"> · Coach: {esc.coach?.name}</span>
                </div>
                <span className="text-xs text-red-500 shrink-0">{formatDate(esc.auto_created_at)}</span>
              </div>
            ))}
          </div>
          <div className="ml-[42px] mt-4">
            <Button asChild variant="outline" size="sm" className="border-red-200 text-red-700 hover:bg-red-100">
              <Link href="/cm/coaches">View all escalations</Link>
            </Button>
          </div>
        </div>
      )}

      {/* Coach quick links */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Your Coaches</h2>
        <Card>
          <CardContent className="py-2 divide-y divide-border/50">
            {coachList.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No coaches assigned to your cluster yet.</p>
            ) : (
              coachList.map((coach: any) => {
                const coachSessions = sessions.filter((s: any) => s.coach_id === coach.id)
                const coachCompleted = coachSessions.filter((s: any) => s.status === 'completed').length
                const coachNoShows = coachSessions.filter((s: any) => s.status === 'no_show').length

                return (
                  <Link key={coach.id} href={`/cm/coaches/${coach.id}`}>
                    <div className="group flex items-center justify-between py-3 px-1 transition-colors hover:bg-muted/30 rounded-lg -mx-1 px-2">
                      <span className="text-sm font-medium group-hover:text-primary transition-colors">{coach.name}</span>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="tabular-nums">{coachCompleted} done</span>
                        {coachNoShows > 0 && <span className="text-red-600 font-medium">{coachNoShows} no-shows</span>}
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary/50 transition-colors" />
                      </div>
                    </div>
                  </Link>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
