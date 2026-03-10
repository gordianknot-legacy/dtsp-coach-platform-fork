'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn, getInitials } from '@/lib/utils'
import { LogOut, Bell, LayoutGrid, ChevronRight } from 'lucide-react'
import type { UserRole } from '@/lib/supabase/types'
import { useState } from 'react'

interface NavItem {
  label: string
  href: string
  exact?: boolean
}

const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  coach: [
    { label: 'Home', href: '/coach', exact: true },
    { label: 'Teachers', href: '/coach/teachers' },
  ],
  cm: [
    { label: 'Home', href: '/cm', exact: true },
    { label: 'Coaches', href: '/cm/coaches' },
    { label: 'Snapshot', href: '/cm/snapshot' },
  ],
  admin: [
    { label: 'Home', href: '/admin', exact: true },
    { label: 'Org', href: '/admin/org' },
    { label: 'Users', href: '/admin/users' },
    { label: 'Rosters', href: '/admin/rosters' },
    { label: 'Assignments', href: '/admin/assignments' },
    { label: 'Standards', href: '/admin/standards' },
  ],
  observer: [
    { label: 'Snapshot', href: '/observer', exact: true },
  ],
}

const ROLE_LABEL: Record<UserRole, string> = {
  coach: 'Coach',
  cm: 'Cluster Manager',
  admin: 'Administrator',
  observer: 'Observer',
}

const ROLE_COLOR: Record<UserRole, string> = {
  coach: 'bg-blue-600',
  cm: 'bg-emerald-600',
  admin: 'bg-violet-600',
  observer: 'bg-amber-600',
}

const ROLE_ACCENT: Record<UserRole, string> = {
  coach: 'text-blue-700 bg-blue-50',
  cm: 'text-emerald-700 bg-emerald-50',
  admin: 'text-violet-700 bg-violet-50',
  observer: 'text-amber-700 bg-amber-50',
}

interface TopNavProps {
  role: UserRole
  userName: string
  escalationCount?: number
}

export function TopNav({ role, userName, escalationCount = 0 }: TopNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false)
  const [switchingRole, setSwitchingRole] = useState<UserRole | null>(null)

  const navItems = NAV_ITEMS[role] ?? []

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  function isActive(item: NavItem) {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/80 backdrop-blur-md">
      <div className="flex h-14 items-center px-4 gap-3 max-w-5xl mx-auto">

        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0',
            ROLE_COLOR[role]
          )}>
            D
          </div>
          <div className="hidden sm:flex flex-col leading-none">
            <span className="font-semibold text-sm text-foreground tracking-tight">DTSP</span>
            <span className="text-[10px] mt-0.5 text-muted-foreground">Coach Platform</span>
          </div>
        </Link>

        {/* Divider */}
        <div className="w-px h-5 shrink-0 bg-border" />

        {/* Nav */}
        <nav className="flex items-center gap-0.5 flex-1 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                isActive(item)
                  ? 'text-foreground bg-muted'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-1.5 shrink-0">

          {/* Escalation bell — CM only */}
          {role === 'cm' && escalationCount > 0 && (
            <Link
              href="/cm/coaches"
              className="relative p-2 rounded-lg transition-colors hover:bg-muted text-muted-foreground hover:text-foreground"
              title={`${escalationCount} open escalations`}
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold leading-none ring-2 ring-card">
                {escalationCount > 9 ? '9+' : escalationCount}
              </span>
            </Link>
          )}

          {/* Role switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              title="Switch role"
              className={cn(
                'p-2 rounded-lg transition-colors',
                showRoleSwitcher
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>

            {showRoleSwitcher && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowRoleSwitcher(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl shadow-lg border border-border bg-card z-50 py-1.5 overflow-hidden">
                  <p className="px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    Switch Role
                  </p>
                  {(['coach', 'cm', 'admin', 'observer'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      disabled={switchingRole !== null}
                      onClick={async () => {
                        if (r === role) {
                          setShowRoleSwitcher(false)
                          return
                        }
                        setSwitchingRole(r)
                        try {
                          const res = await fetch('/api/auth/switch-role', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ role: r }),
                          })
                          if (res.ok) {
                            window.location.href = `/${r === 'coach' ? 'coach' : r}`
                          } else {
                            setSwitchingRole(null)
                          }
                        } catch {
                          setSwitchingRole(null)
                        }
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left',
                        r === role
                          ? 'bg-muted text-foreground'
                          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                        switchingRole !== null && switchingRole !== r && 'opacity-40 pointer-events-none'
                      )}
                    >
                      <div className={cn(
                        'w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold',
                        ROLE_ACCENT[r]
                      )}>
                        {ROLE_LABEL[r][0]}
                      </div>
                      <span className="flex-1">{ROLE_LABEL[r]}</span>
                      {switchingRole === r && (
                        <span className="text-[10px] text-primary animate-pulse">Switching...</span>
                      )}
                      {r === role && switchingRole !== r && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Active</span>
                      )}
                    </button>
                  ))}
                  <div className="border-t border-border my-1.5" />
                  <Link
                    href="/role-select"
                    onClick={() => setShowRoleSwitcher(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs transition-colors hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                  >
                    <span>Full role selector</span>
                    <ChevronRight className="h-3 w-3 ml-auto" />
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-5 shrink-0 bg-border mx-0.5" />

          {/* User */}
          <div className="flex items-center gap-2.5">
            <Avatar className="h-8 w-8 ring-2 ring-border">
              <AvatarFallback className={cn('text-[11px] font-semibold text-white', ROLE_COLOR[role])}>
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-xs font-medium text-foreground">{userName}</span>
              <span className="text-[10px] mt-1 text-muted-foreground">
                {ROLE_LABEL[role]}
              </span>
            </div>
          </div>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="ml-1 p-2 rounded-lg transition-colors text-muted-foreground/60 hover:text-foreground hover:bg-muted/50"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  )
}
