import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  const body = await request.json()
  const { name, type, parent_id } = body

  if (!name || !type) return NextResponse.json({ error: 'name and type required' }, { status: 400 })

  const { data, error } = await admin
    .from('org_units')
    .insert({ name, type, parent_id: parent_id ?? null })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ org_unit: data }, { status: 201 })
}
