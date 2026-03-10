import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { isAllowedEmail } from '@/lib/allowed-users'
import { NextResponse } from 'next/server'
import type { UserRole } from '@/lib/supabase/types'

const VALID_ROLES: UserRole[] = ['coach', 'cm', 'admin', 'observer']

export async function POST(request: Request) {
  const { role } = await request.json()

  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !user.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Only allowed users can switch roles
  if (!isAllowedEmail(user.email)) {
    return NextResponse.json({ error: 'Not authorized to switch roles' }, { status: 403 })
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('profiles')
    .update({ role })
    .eq('id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
