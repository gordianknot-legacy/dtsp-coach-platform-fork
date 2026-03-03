import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('vba_sessions')
    .select(`
      *,
      teacher:teachers(id, name, school_name, block_tag)
    `)
    .order('scheduled_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ sessions: data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { teacher_id, scheduled_at } = body

  if (!teacher_id || !scheduled_at) {
    return NextResponse.json({ error: 'teacher_id and scheduled_at required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('vba_sessions')
    .insert({ teacher_id, coach_id: user.id, scheduled_at, status: 'scheduled' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ session: data }, { status: 201 })
}
