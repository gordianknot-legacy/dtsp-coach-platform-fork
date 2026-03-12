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
    .from('session_templates')
    .select('*')
    .eq('cohort_id', cohortId)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ template: data })
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  const body = await request.json()
  const { cohort_id, focus_categories, rubric_json, vba_checklist, required_fields } = body

  if (!cohort_id) return NextResponse.json({ error: 'cohort_id required' }, { status: 400 })

  const { data, error } = await admin
    .from('session_templates')
    .upsert(
      {
        cohort_id,
        focus_categories: focus_categories ?? ['Literacy', 'Numeracy', 'Relationship', 'Off-script'],
        required_fields: required_fields ?? ['what_discussed', 'focus_tag'],
        vba_checklist: vba_checklist ?? [],
        rubric_json: rubric_json ?? [],
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'cohort_id' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ template: data })
}
