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

      <SubNav role={role} />

      {/* Content fills the viewport — white bg, responsive padding */}
      <main className="flex-1 bg-white border-t border-border">
        <div className="px-4 sm:px-6 lg:px-10 xl:px-16 py-6 sm:py-8 pb-24 md:pb-10 max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>

      <MobileBottomBar role={role} />
    </div>
  )
}
