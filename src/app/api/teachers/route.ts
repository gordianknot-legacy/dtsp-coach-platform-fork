import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const cohortId = searchParams.get('cohort_id')
  const blockTag = searchParams.get('block_tag')
  const status = searchParams.get('status') ?? 'active'
  const activeOnly = searchParams.get('active') !== 'false'

  let query = supabase
    .from('teachers')
    .select(`
      id, name, phone, school_name, block_tag, designation, udise_code, status,
      assignments(coach_id, is_active),
      ryg:teacher_ryg(status, set_at)
    `)
    .eq('status', status)
    .order('name', { ascending: true })

  if (cohortId) query = query.eq('cohort_id', cohortId)
  if (blockTag) query = query.eq('block_tag', blockTag)

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const teachers = (data ?? []).map((t: any) => ({
    ...t,
    ryg: t.ryg?.sort(
      (a: any, b: any) => new Date(b.set_at).getTime() - new Date(a.set_at).getTime()
    )[0] ?? null,
  }))

  return NextResponse.json({ teachers })
}
