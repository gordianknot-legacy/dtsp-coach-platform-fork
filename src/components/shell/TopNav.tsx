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
  coach: 'bg-blue-500',
  cm: 'bg-emerald-500',
  admin: 'bg-violet-500',
  observer: 'bg-amber-500',
}

const ROLE_GRADIENT: Record<UserRole, string> = {
  coach: 'from-blue-500 to-blue-600',
  cm: 'from-emerald-500 to-emerald-600',
  admin: 'from-violet-500 to-violet-600',
  observer: 'from-amber-500 to-amber-600',
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
    <header
      className="sticky top-0 z-40 w-full backdrop-blur-xl border-b"
      style={{
        background: 'linear-gradient(180deg, hsl(224 40% 10% / 0.97) 0%, hsl(224 40% 12% / 0.95) 100%)',
        borderColor: 'var(--color-border, hsl(224 28% 18%))',
      }}
    >
      <div className="flex h-[56px] items-center px-4 gap-3 max-w-screen-2xl mx-auto">

        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className={cn(
            'w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm',
            ROLE_GRADIENT[role]
          )}>
            D
          </div>
          <div className="hidden sm:flex flex-col leading-none">
            <span className="font-semibold text-sm text-white tracking-tight">DTSP</span>
            <span className="text-[10px] mt-0.5 text-white/35">Coach Platform</span>
          </div>
        </Link>

        {/* Divider */}
        <div className="w-px h-5 shrink-0 bg-white/10" />

        {/* Nav */}
        <nav className="flex items-center gap-0.5 flex-1 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap',
                isActive(item)
                  ? 'text-white bg-white/12 shadow-sm'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/[0.06]'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-1 shrink-0">

          {/* Escalation bell — CM only */}
          {role === 'cm' && escalationCount > 0 && (
            <Link
              href="/cm/coaches"
              className="relative p-2 rounded-lg transition-all hover:bg-white/[0.08] text-white/50 hover:text-white/80"
              title={`${escalationCount} open escalations`}
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold leading-none ring-2 ring-[hsl(224,40%,10%)]">
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
                'p-2 rounded-lg transition-all',
                showRoleSwitcher
                  ? 'bg-white/12 text-white'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/[0.06]'
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
                <div
                  className="absolute right-0 top-full mt-2 w-56 rounded-xl shadow-2xl border z-50 py-2 overflow-hidden"
                  style={{
                    background: 'hsl(224 40% 12%)',
                    borderColor: 'hsl(224 28% 20%)',
                    boxShadow: '0 20px 60px -12px rgba(0,0,0,0.5)',
                  }}
                >
                  <p className="px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-white/25">
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
                        'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all text-left',
                        r === role
                          ? 'bg-white/[0.08] text-white'
                          : 'text-white/60 hover:bg-white/[0.05] hover:text-white/90',
                        switchingRole !== null && switchingRole !== r && 'opacity-40 pointer-events-none'
                      )}
                    >
                      <div className={cn(
                        'w-7 h-7 rounded-lg bg-gradient-to-br flex items-center justify-center text-white text-[10px] font-bold shadow-sm',
                        ROLE_GRADIENT[r]
                      )}>
                        {ROLE_LABEL[r][0]}
                      </div>
                      <span className="flex-1">{ROLE_LABEL[r]}</span>
                      {switchingRole === r && (
                        <span className="text-[10px] text-blue-300 animate-pulse">Switching...</span>
                      )}
                      {r === role && switchingRole !== r && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-blue-300 font-medium">Active</span>
                      )}
                    </button>
                  ))}
                  <div className="border-t my-1.5" style={{ borderColor: 'hsl(224 28% 18%)' }} />
                  <Link
                    href="/role-select"
                    onClick={() => setShowRoleSwitcher(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs transition-all hover:bg-white/[0.05] text-white/35 hover:text-white/60"
                  >
                    <span>Full role selector</span>
                    <ChevronRight className="h-3 w-3 ml-auto" />
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-5 shrink-0 bg-white/8 mx-1" />

          {/* User */}
          <div className="flex items-center gap-2.5">
            <Avatar className="h-8 w-8 ring-2 ring-white/10">
              <AvatarFallback className={cn('text-[11px] font-semibold text-white bg-gradient-to-br', ROLE_GRADIENT[role])}>
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-xs font-medium text-white/90">{userName}</span>
              <span className="text-[10px] mt-1 text-white/30">
                {ROLE_LABEL[role]}
              </span>
            </div>
          </div>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="ml-1 p-2 rounded-lg transition-all text-white/30 hover:text-white/60 hover:bg-white/[0.06]"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  )
}
