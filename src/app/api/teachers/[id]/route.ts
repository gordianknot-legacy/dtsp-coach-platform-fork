import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('teachers')
    .select(`
      *,
      assignments(coach_id, is_active),
      ryg:teacher_ryg(status, set_at, set_by, prior_status, dimensions_json),
      movement_plans(*),
      action_steps(*)
    `)
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })

  // Sort RYG by set_at desc, return most recent
  const ryg = data.ryg?.sort(
    (a: { set_at: string }, b: { set_at: string }) => new Date(b.set_at).getTime() - new Date(a.set_at).getTime()
  )

  return NextResponse.json({ teacher: { ...data, ryg: ryg?.[0] ?? null, ryg_history: ryg } })
}
