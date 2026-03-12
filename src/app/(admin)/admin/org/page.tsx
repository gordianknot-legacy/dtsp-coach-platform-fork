import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { OrgSetup } from './OrgSetup'

export default async function OrgPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  const { data: orgUnits } = await admin
    .from('org_units')
    .select('id, name, type, parent_id')
    .order('type')
    .order('name')

  return <OrgSetup orgUnits={orgUnits ?? []} />
}
