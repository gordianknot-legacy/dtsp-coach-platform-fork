import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { UserManagement } from './UserManagement'

export default async function UsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  const { data: profiles } = await admin
    .from('profiles')
    .select('id, name, role, phone, cohort_id, created_at')
    .in('role', ['coach', 'cm', 'observer'])
    .order('created_at', { ascending: false })

  const { data: orgUnits } = await admin
    .from('org_units')
    .select('id, name, type')
    .eq('type', 'cohort')
    .order('name')

  return <UserManagement users={profiles ?? []} cohorts={orgUnits ?? []} />
}
