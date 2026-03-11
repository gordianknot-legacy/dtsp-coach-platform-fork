'use client'

import { TopNav } from './TopNav'
import { SubNav } from './SubNav'
import { MobileBottomBar } from './MobileBottomBar'
import type { UserRole } from '@/lib/supabase/types'

interface ShellClientProps {
  role: UserRole
  userName: string
  escalationCount: number
  children: React.ReactNode
}

export function ShellClient({ role, userName, escalationCount, children }: ShellClientProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNav
        role={role}
        userName={userName}
        escalationCount={escalationCount}
      />

      {/* Horizontal sub-nav - hidden on mobile (bottom bar handles it) */}
      <SubNav role={role} />

      {/* Main content - NO card wrapper, pages own their cards */}
      <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8 max-w-6xl mx-auto w-full">
        {children}
      </main>

      <MobileBottomBar role={role} />
    </div>
  )
}
