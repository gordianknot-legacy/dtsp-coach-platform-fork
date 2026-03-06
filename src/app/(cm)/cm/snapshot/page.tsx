import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LeadershipSnapshot } from './LeadershipSnapshot'
import { DEMO_CM_DATA } from '@/lib/demo-data'

export default async function SnapshotPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') redirect('/login')

  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && !user) {
    return (
      <LeadershipSnapshot
        coachCount={DEMO_CM_DATA.coaches.length}
        completedSessions={50}
        noShows={6}
        openEscalations={DEMO_CM_DATA.escalations.length}
        rygCounts={{ R: 28, Y: 51, G: 65, unset: 0 }}
        focusDistribution={{ Literacy: 20, Numeracy: 16, Relationship: 14 }}
        coaches={DEMO_CM_DATA.coaches.map(c => {
          const m = DEMO_CM_DATA.sessionsByCoach[c.id as keyof typeof DEMO_CM_DATA.sessionsByCoach]
            ?? { completed: 0, noShow: 0 }
          return {
            ...c,
            completed: m.completed,
            noShows: m.noShow,
            openEsc: DEMO_CM_DATA.escalations.filter(e => e.coach.name === c.name).length,
          }
        })}
      />
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('cohort_id')
    .eq('id', user.id)
    .single()

  const cohortId = profile?.cohort_id
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [coaches, sessions, rygData, escalations] = await Promise.all([
    supabase.from('profiles').select('id, name').eq('role', 'coach').eq('cohort_id', cohortId),
    supabase.from('sessions').select('status, coach_id, session_type, focus_tag, teacher_id')
      .gte('scheduled_at', thirtyDaysAgo)
      .in('coach_id',
        (await supabase.from('profiles').select('id').eq('role', 'coach').eq('cohort_id', cohortId)).data?.map((c: any) => c.id) ?? []
      ),
    supabase.from('teacher_ryg').select('status, teacher_id, set_at')
      .order('set_at', { ascending: false }),
    supabase.from('escalations').select('status, coach_id').eq('cohort_id', cohortId),
  ])

  const coachList = coaches.data ?? []
  const sessionData = sessions.data ?? []
  const allRYG = rygData.data ?? []
  const escalationData = escalations.data ?? []

  // Get latest RYG per teacher
  const latestRYGMap = new Map<string, string>()
  for (const ryg of allRYG) {
    if (!latestRYGMap.has(ryg.teacher_id)) {
      latestRYGMap.set(ryg.teacher_id, ryg.status)
    }
  }

  const rygCounts = { R: 0, Y: 0, G: 0, unset: 0 }
  for (const [, status] of latestRYGMap) {
    if (status === 'R') rygCounts.R++
    else if (status === 'Y') rygCounts.Y++
    else if (status === 'G') rygCounts.G++
  }

  const completed = sessionData.filter((s: any) => s.status === 'completed').length
  const noShows = sessionData.filter((s: any) => s.status === 'no_show').length
  const openEscalations = escalationData.filter((e: any) => e.status === 'open').length

  // Focus distribution
  const focusDist: Record<string, number> = {}
  for (const s of sessionData.filter((s: any) => s.focus_tag && s.status === 'completed')) {
    focusDist[s.focus_tag] = (focusDist[s.focus_tag] ?? 0) + 1
  }

  return (
    <LeadershipSnapshot
      coachCount={coachList.length}
      completedSessions={completed}
      noShows={noShows}
      openEscalations={openEscalations}
      rygCounts={rygCounts}
      focusDistribution={focusDist}
      coaches={coachList.map((c: any) => ({
        ...c,
        completed: sessionData.filter((s: any) => s.coach_id === c.id && s.status === 'completed').length,
        noShows: sessionData.filter((s: any) => s.coach_id === c.id && s.status === 'no_show').length,
        openEsc: escalationData.filter((e: any) => e.coach_id === c.id && e.status === 'open').length,
      }))}
    />
  )
}
