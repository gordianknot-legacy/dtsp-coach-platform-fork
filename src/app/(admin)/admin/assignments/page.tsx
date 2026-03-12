import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { AssignmentsPage } from './AssignmentsPage'

export default async function Assignments() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  const [coaches, teachers] = await Promise.all([
    admin
      .from('profiles')
      .select('id, name, cohort_id')
      .eq('role', 'coach')
      .order('name'),
    admin
      .from('teachers')
      .select(`
        id, name, school_name, block_tag, cohort_id,
        assignments(coach_id, is_active)
      `)
      .eq('status', 'active')
      .order('name'),
  ])

  return (
    <AssignmentsPage
      coaches={coaches.data ?? []}
      teachers={teachers.data ?? []}
    />
  )
}
