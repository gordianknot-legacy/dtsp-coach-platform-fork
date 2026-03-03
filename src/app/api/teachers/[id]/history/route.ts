import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: teacherId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') ?? '20', 10)
  const offset = parseInt(searchParams.get('offset') ?? '0', 10)

  const { data, error, count } = await supabase
    .from('sessions')
    .select(`
      id, scheduled_at, status, focus_tag, session_type, duration_mins, confirmation_status,
      notes:session_notes(what_discussed, what_decided, ai_draft_used),
      action_steps(id, description, due_date, status)
    `, { count: 'exact' })
    .eq('teacher_id', teacherId)
    .order('scheduled_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ sessions: data, total: count })
}
