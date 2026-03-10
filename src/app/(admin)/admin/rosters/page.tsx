import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { RosterImport } from './RosterImport'

export default async function RostersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: cohorts } = await supabase
    .from('org_units')
    .select('id, name')
    .eq('type', 'cohort')
    .order('name')

  return <RosterImport cohorts={cohorts ?? []} />
}
