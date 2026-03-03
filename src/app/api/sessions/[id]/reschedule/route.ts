import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { reason_category, new_window } = body

  if (!reason_category) {
    return NextResponse.json({ error: 'reason_category is required' }, { status: 400 })
  }

  // Get teacher_id from session
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('teacher_id')
    .eq('id', sessionId)
    .eq('coach_id', user.id)
    .single()

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  // Count existing reschedules for this teacher in last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { count: existingCount } = await supabase
    .from('reschedules')
    .select('*', { count: 'exact', head: true })
    .in(
      'session_id',
      (await supabase
        .from('sessions')
        .select('id')
        .eq('teacher_id', session.teacher_id)).data?.map((s: { id: string }) => s.id) ?? []
    )
    .gte('created_at', thirtyDaysAgo)

  const counter = (existingCount ?? 0) + 1

  // Insert reschedule record
  const { data: reschedule, error } = await supabase
    .from('reschedules')
    .insert({
      session_id: sessionId,
      reason_category,
      new_window: new_window ?? null,
      counter,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Mark original session as rescheduled
  await supabase
    .from('sessions')
    .update({ status: 'rescheduled' })
    .eq('id', sessionId)

  // Create new session if new_window provided
  let newSession = null
  if (new_window) {
    const { data: orig } = await supabase
      .from('sessions')
      .select('teacher_id, session_type, channel, meet_link, focus_tag')
      .eq('id', sessionId)
      .single()

    if (orig) {
      const { data } = await supabase
        .from('sessions')
        .insert({
          teacher_id: orig.teacher_id,
          coach_id: user.id,
          session_type: orig.session_type,
          scheduled_at: new_window,
          channel: orig.channel,
          meet_link: orig.meet_link,
          focus_tag: orig.focus_tag,
          status: 'scheduled',
          confirmation_status: 'pending',
        })
        .select()
        .single()
      newSession = data
    }
  }

  return NextResponse.json({ reschedule, new_session: newSession, counter })
}
