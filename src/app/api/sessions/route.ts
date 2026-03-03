import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date') // YYYY-MM-DD
  const week = searchParams.get('week') // YYYY-MM-DD (start of week)
  const status = searchParams.get('status')

  let query = supabase
    .from('sessions')
    .select(`
      *,
      teacher:teachers(id, name, school_name, block_tag, phone),
      ryg:teacher_ryg(status)
    `)
    .order('scheduled_at', { ascending: true })

  // Filter by date range
  if (date) {
    query = query
      .gte('scheduled_at', `${date}T00:00:00`)
      .lte('scheduled_at', `${date}T23:59:59`)
  } else if (week) {
    const start = new Date(week)
    const end = new Date(start)
    end.setDate(end.getDate() + 7)
    query = query
      .gte('scheduled_at', start.toISOString())
      .lt('scheduled_at', end.toISOString())
  }

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // For each teacher, get the latest RYG status only
  const sessions = data?.map((s: any) => ({
    ...s,
    teacher: {
      ...s.teacher,
      ryg: s.ryg?.length > 0 ? s.ryg[s.ryg.length - 1] : null,
    },
  }))

  return NextResponse.json({ sessions })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { teacher_id, scheduled_at, session_type, channel, meet_link, focus_tag } = body

  if (!teacher_id || !scheduled_at) {
    return NextResponse.json({ error: 'teacher_id and scheduled_at are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('sessions')
    .insert({
      teacher_id,
      coach_id: user.id,
      session_type: session_type ?? 'coaching_call',
      scheduled_at,
      channel: channel ?? 'google_meet',
      meet_link: meet_link ?? null,
      focus_tag: focus_tag ?? null,
      status: 'scheduled',
      confirmation_status: 'pending',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ session: data }, { status: 201 })
}
