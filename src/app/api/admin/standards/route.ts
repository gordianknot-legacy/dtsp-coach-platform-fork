import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const cohortId = searchParams.get('cohort_id')
  if (!cohortId) return NextResponse.json({ error: 'cohort_id required' }, { status: 400 })

  const { data, error } = await supabase
    .from('program_standards')
    .select('key, value')
    .eq('cohort_id', cohortId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Convert array to key-value object
  const standards = Object.fromEntries((data ?? []).map((s) => [s.key, s.value]))
  return NextResponse.json({ standards })
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  const body = await request.json()
  const { cohort_id, standards } = body

  if (!cohort_id || !standards) {
    return NextResponse.json({ error: 'cohort_id and standards required' }, { status: 400 })
  }

  // Upsert each key-value pair
  const records = Object.entries(standards as Record<string, string>).map(([key, value]) => ({
    cohort_id,
    key,
    value: String(value),
    updated_at: new Date().toISOString(),
  }))

  const { error } = await admin
    .from('program_standards')
    .upsert(records, { onConflict: 'cohort_id,key' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ updated: records.length })
}
