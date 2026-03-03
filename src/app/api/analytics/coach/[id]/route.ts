import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

// KPI rollup computed on-the-fly from sessions table
// At alpha scale (900 sessions/month), no materialized views needed
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: coachId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') ?? '30' // days
  const daysAgo = parseInt(period, 10)

  const sinceDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString()

  const [sessionsResult, teachersResult, escalationsResult] = await Promise.all([
    supabase
      .from('sessions')
      .select('id, status, confirmation_status, focus_tag, duration_mins, teacher_id, scheduled_at')
      .eq('coach_id', coachId)
      .gte('scheduled_at', sinceDate),

    supabase
      .from('assignments')
      .select('teacher_id, teacher:teachers(id, name)')
      .eq('coach_id', coachId)
      .eq('is_active', true),

    supabase
      .from('escalations')
      .select('id, status, trigger_type, auto_created_at')
      .eq('coach_id', coachId)
      .gte('auto_created_at', sinceDate),
  ])

  const sessions = sessionsResult.data ?? []
  const assignments = teachersResult.data ?? []
  const escalations = escalationsResult.data ?? []

  const totalTeachers = assignments.length
  const totalScheduled = sessions.length
  const completed = sessions.filter((s) => s.status === 'completed').length
  const noShows = sessions.filter((s) => s.status === 'no_show').length
  const rescheduled = sessions.filter((s) => s.status === 'rescheduled').length
  const confirmed = sessions.filter((s) => s.confirmation_status === 'confirmed').length
  const pendingConfirmation = sessions.filter((s) => s.confirmation_status === 'pending').length

  // Contact rate: teachers who have had at least one session in period
  const touchedTeachers = new Set(sessions.map((s) => s.teacher_id)).size
  const contactRate = totalTeachers > 0 ? Math.round((touchedTeachers / totalTeachers) * 100) : 0

  // Average duration
  const durations = sessions.filter((s) => s.duration_mins).map((s) => s.duration_mins as number)
  const avgDuration = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : null

  // Focus distribution
  const focusDist: Record<string, number> = {}
  for (const s of sessions.filter((s) => s.focus_tag)) {
    focusDist[s.focus_tag!] = (focusDist[s.focus_tag!] ?? 0) + 1
  }

  return NextResponse.json({
    period_days: daysAgo,
    kpis: {
      total_teachers: totalTeachers,
      total_scheduled: totalScheduled,
      completed,
      no_shows: noShows,
      rescheduled,
      confirmation_rate: totalScheduled > 0 ? Math.round((confirmed / totalScheduled) * 100) : 0,
      pending_confirmation: pendingConfirmation,
      contact_rate: contactRate,
      avg_duration_mins: avgDuration,
      open_escalations: escalations.filter((e) => e.status === 'open').length,
    },
    focus_distribution: focusDist,
  })
}
