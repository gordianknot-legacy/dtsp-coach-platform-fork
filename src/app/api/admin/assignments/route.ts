import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const coachId = searchParams.get('coach_id')

  let query = supabase
    .from('assignments')
    .select(`
      teacher_id, coach_id, is_active, assigned_at,
      teacher:teachers(id, name, school_name, block_tag),
      coach:profiles(id, name)
    `)
    .eq('is_active', true)

  if (coachId) query = query.eq('coach_id', coachId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ assignments: data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { coach_id, teacher_ids } = body

  if (!coach_id || !Array.isArray(teacher_ids) || teacher_ids.length === 0) {
    return NextResponse.json({ error: 'coach_id and teacher_ids required' }, { status: 400 })
  }

  // Deactivate existing assignments for these teachers (one coach per teacher)
  await supabase
    .from('assignments')
    .update({ is_active: false })
    .in('teacher_id', teacher_ids)

  // Insert new assignments
  const records = teacher_ids.map((teacherId: string) => ({
    teacher_id: teacherId,
    coach_id,
    is_active: true,
  }))

  const { data, error } = await supabase
    .from('assignments')
    .upsert(records, { onConflict: 'teacher_id,coach_id' })
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ assigned: data?.length ?? 0 }, { status: 201 })
}
