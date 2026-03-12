import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { StandardsEditor } from './StandardsEditor'

export default async function StandardsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  const { data: cohorts } = await admin
    .from('org_units')
    .select('id, name')
    .eq('type', 'cohort')
    .order('name')

  return <StandardsEditor cohorts={cohorts ?? []} />
}
