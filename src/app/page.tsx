import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/lib/supabase/types'

const ROLE_HOME: Record<UserRole, string> = {
  coach: '/coach',
  cm: '/cm',
  admin: '/admin',
  observer: '/observer',
}

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  redirect(ROLE_HOME[profile.role as UserRole] ?? '/login')
}
