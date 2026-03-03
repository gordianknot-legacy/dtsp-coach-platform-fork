import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { cohort_id, teachers } = body

  if (!cohort_id || !Array.isArray(teachers) || teachers.length === 0) {
    return NextResponse.json({ error: 'cohort_id and teachers array required' }, { status: 400 })
  }

  const records = teachers.map((t: Record<string, string>) => ({
    name: t.name.trim(),
    school_name: t.school_name.trim(),
    phone: t.phone?.trim() || null,
    udise_code: t.udise_code?.trim() || null,
    block_tag: t.block_tag?.trim() || null,
    designation: t.designation?.trim() || null,
    hm_name: t.hm_name?.trim() || null,
    hm_phone: t.hm_phone?.trim() || null,
    cohort_id,
    status: 'active',
  }))

  // Insert in batches of 100
  let imported = 0
  const batchSize = 100
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize)
    const { data, error } = await supabase
      .from('teachers')
      .insert(batch)
      .select('id')

    if (error) {
      return NextResponse.json({ error: error.message, imported }, { status: 500 })
    }
    imported += data?.length ?? 0
  }

  return NextResponse.json({ imported, total: records.length })
}
