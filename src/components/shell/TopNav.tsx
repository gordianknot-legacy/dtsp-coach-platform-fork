'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn, getInitials } from '@/lib/utils'
import { LogOut, Bell, ChevronDown, Check } from 'lucide-react'
import type { UserRole } from '@/lib/supabase/types'
import { useState } from 'react'

interface NavItem {
  label: string
  href: string
  exact?: boolean
}

const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  coach: [
    { label: 'Sessions', href: '/coach', exact: true },
    { label: 'Teachers', href: '/coach/teachers' },
  ],
  cm: [
    { label: 'Overview', href: '/cm', exact: true },
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
  admin: 'Admin',
  observer: 'Observer',
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
    <header className="sticky top-0 z-40 w-full bg-[hsl(220,20%,18%)] shadow-md">
      <div className="flex h-12 items-center gap-6 px-4 sm:px-6 max-w-5xl mx-auto">

        {/* Brand + Role */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-sm font-semibold text-white">DTSP</span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1 flex-1 overflow-x-auto -mb-px h-12">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-3 h-12 inline-flex items-center text-sm transition-colors border-b-2 whitespace-nowrap',
                isActive(item)
                  ? 'border-blue-400 text-white font-medium'
                  : 'border-transparent text-white/60 hover:text-white'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Escalation bell — CM only */}
          {role === 'cm' && escalationCount > 0 && (
            <Link
              href="/cm/coaches"
              className="relative p-1.5 rounded-md transition-colors hover:bg-white/10 text-white/60 hover:text-white"
              title={`${escalationCount} open escalations`}
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-medium leading-none px-1">
                {escalationCount > 9 ? '9+' : escalationCount}
              </span>
            </Link>
          )}

          {/* Role switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              className={cn(
                'flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs transition-colors',
                showRoleSwitcher
                  ? 'bg-white/15 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              )}
            >
              <div className="w-5 h-5 rounded-md bg-white text-[hsl(220,20%,18%)] flex items-center justify-center text-[10px] font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline text-white/80">{ROLE_LABEL[role]}</span>
              <ChevronDown className="h-3 w-3 text-white/60" />
            </button>

            {showRoleSwitcher && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowRoleSwitcher(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-52 rounded-lg border border-border bg-popover shadow-lg z-50 py-1">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-sm font-medium text-foreground">{userName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{ROLE_LABEL[role]}</p>
                  </div>

                  <div className="py-1">
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
                          'w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors',
                          r === role ? 'text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                          switchingRole !== null && switchingRole !== r && 'opacity-40 pointer-events-none'
                        )}
                      >
                        <span className="flex-1">{ROLE_LABEL[r]}</span>
                        {switchingRole === r && (
                          <span className="text-xs text-muted-foreground animate-pulse">...</span>
                        )}
                        {r === role && <Check className="h-3.5 w-3.5 text-foreground" />}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-border pt-1">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-left"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
