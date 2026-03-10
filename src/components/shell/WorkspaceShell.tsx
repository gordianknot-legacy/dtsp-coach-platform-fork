import { createClient } from '@/lib/supabase/server'
import { TopNav } from './TopNav'
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
    <div className="min-h-screen flex flex-col bg-background">
      <TopNav role={role} userName={userName} escalationCount={escalationCount} />
      <main className="flex-1 mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 max-w-5xl">
        {children}
      </main>
    </div>
  )
}
