import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { ChevronRight } from 'lucide-react'


export default async function CoachesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('cohort_id')
    .eq('id', user.id)
    .single()

  const { data: coaches } = await supabase
    .from('profiles')
    .select('id, name')
    .eq('role', 'coach')
    .eq('cohort_id', profile?.cohort_id)
    .order('name')

  const coachIds = (coaches ?? []).map((c: any) => c.id)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [sessions, escalations, assignments] = coachIds.length > 0
    ? await Promise.all([
        supabase
          .from('sessions')
          .select('status, coach_id, confirmation_status')
          .in('coach_id', coachIds)
          .gte('scheduled_at', thirtyDaysAgo),
        supabase
          .from('escalations')
          .select('coach_id, status')
          .in('coach_id', coachIds)
          .eq('status', 'open'),
        supabase
          .from('assignments')
          .select('coach_id')
          .in('coach_id', coachIds)
          .eq('is_active', true),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }]

  const sessionData = sessions.data ?? []
  const escalationData = escalations.data ?? []
  const assignmentData = assignments.data ?? []

  const coachMetrics = (coaches ?? []).map((coach: any) => {
    const coachSessions = sessionData.filter((s: any) => s.coach_id === coach.id)
    const openEsc = escalationData.filter((e: any) => e.coach_id === coach.id).length
    const teacherCount = assignmentData.filter((a: any) => a.coach_id === coach.id).length
    const completed = coachSessions.filter((s: any) => s.status === 'completed').length
    const noShows = coachSessions.filter((s: any) => s.status === 'no_show').length

    return { ...coach, openEsc, teacherCount, completed, noShows }
  }).sort((a: any, b: any) => b.openEsc - a.openEsc)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold">Coaches</h1>
        <p className="text-sm text-muted-foreground">Sorted by escalation count</p>
      </div>

      <div className="rounded-lg border border-border divide-y divide-border">
        {coachMetrics.map((coach: any) => (
          <Link key={coach.id} href={`/cm/coaches/${coach.id}`}>
            <div className="flex items-center gap-3 px-3 py-3 hover:bg-muted/50 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{coach.name}</span>
                  {coach.openEsc > 0 && (
                    <Badge variant="destructive" className="text-[10px] h-5 px-1.5">
                      {coach.openEsc} esc
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                  <span>{coach.teacherCount} teachers</span>
                  <span>{coach.completed} done</span>
                  {coach.noShows > 0 && <span className="text-red-600">{coach.noShows} no-shows</span>}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/30 shrink-0" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
