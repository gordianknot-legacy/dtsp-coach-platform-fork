'use client'

import { useState } from 'react'
import { TopNav } from './TopNav'
import { Sidebar } from './Sidebar'
import { MobileBottomBar } from './MobileBottomBar'
import type { UserRole } from '@/lib/supabase/types'

interface ShellClientProps {
  role: UserRole
  userName: string
  escalationCount: number
  children: React.ReactNode
}

export function ShellClient({ role, userName, escalationCount, children }: ShellClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNav
        role={role}
        userName={userName}
        escalationCount={escalationCount}
        onMenuClick={() => setSidebarOpen(true)}
      />

      {/* Overlay sidebar for mobile */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        role={role}
        mode="overlay"
      />

      <div className="flex flex-1">
        {/* Persistent sidebar for desktop */}
        <Sidebar
          open={true}
          onClose={() => {}}
          role={role}
          mode="persistent"
        />

        {/* Main content */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 md:pb-8">
          <div className="bg-card rounded-xl shadow-md p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      <MobileBottomBar role={role} onMoreClick={() => setSidebarOpen(true)} />
    </div>
  )
}
