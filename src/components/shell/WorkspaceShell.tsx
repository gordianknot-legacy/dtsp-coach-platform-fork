import { createClient } from '@/lib/supabase/server'
import { ShellClient } from './ShellClient'
import type { UserRole } from '@/lib/supabase/types'

interface WorkspaceShellProps {
  role: UserRole
  children: React.ReactNode
}

export async function WorkspaceShell({ role, children }: WorkspaceShellProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userName = 'User'
  let escalationCount = 0

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single()

    if (profile) userName = profile.name

    // CM: fetch open escalation count
    if (role === 'cm') {
      const { count } = await supabase
        .from('escalations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open')

      escalationCount = count ?? 0
    }
  }

  return (
    <ShellClient role={role} userName={userName} escalationCount={escalationCount}>
      {children}
    </ShellClient>
  )
}
