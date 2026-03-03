import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, role, phone, cohort_id, created_at')
    .not('role', 'eq', 'admin')
    .order('created_at', { ascending: false })

  return NextResponse.json({ users: profiles })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify requester is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { name, email, phone, role, cohort_id } = body

  if (!name || !email || !role) {
    return NextResponse.json({ error: 'name, email, and role are required' }, { status: 400 })
  }

  // Create auth user via admin client + send magic link invite
  const admin = createAdminClient()
  const { data: authData, error: authError } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { name },
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 })
  }

  // Create profile record
  const { error: profileError } = await admin
    .from('profiles')
    .insert({
      id: authData.user.id,
      name,
      role,
      phone: phone ?? null,
      cohort_id: cohort_id ?? null,
    })

  if (profileError) {
    // Clean up auth user if profile insert fails
    await admin.auth.admin.deleteUser(authData.user.id)
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  return NextResponse.json({ user: { id: authData.user.id, name, email, role } }, { status: 201 })
}
