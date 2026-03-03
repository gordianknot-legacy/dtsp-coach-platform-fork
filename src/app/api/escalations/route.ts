import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') ?? 'open'
  const coachId = searchParams.get('coach_id')

  let query = supabase
    .from('escalations')
    .select(`
      *,
      teacher:teachers(id, name, school_name, block_tag),
      coach:profiles(id, name)
    `)
    .order('auto_created_at', { ascending: false })

  if (status !== 'all') query = query.eq('status', status)
  if (coachId) query = query.eq('coach_id', coachId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ escalations: data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { teacher_id, coach_id, cohort_id, trigger_type = 'manual' } = body

  const { data, error } = await supabase
    .from('escalations')
    .insert({ teacher_id, coach_id, cohort_id, trigger_type, status: 'open' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ escalation: data }, { status: 201 })
}
