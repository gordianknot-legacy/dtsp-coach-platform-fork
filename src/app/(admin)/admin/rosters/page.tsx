import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { RosterImport } from './RosterImport'

export default async function RostersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  const { data: cohorts } = await admin
    .from('org_units')
    .select('id, name')
    .eq('type', 'cohort')
    .order('name')

  return <RosterImport cohorts={cohorts ?? []} />
}
