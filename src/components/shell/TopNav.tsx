'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { LogOut, Bell, ChevronDown, Check, HelpCircle } from 'lucide-react'
import { ROLE_LABEL } from './nav-config'
import type { UserRole } from '@/lib/supabase/types'
import { useState } from 'react'

interface TopNavProps {
  role: UserRole
  userName: string
  escalationCount?: number
}

export function TopNav({ role, userName, escalationCount = 0 }: TopNavProps) {
  const router = useRouter()
  const supabase = createClient()
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false)

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-[hsl(220,20%,18%)] shadow-md h-14">
      <div className="flex h-14 items-center gap-4 px-5 sm:px-8 md:px-10 lg:px-16 xl:px-24 max-w-[1400px] mx-auto w-full">

        {/* Brand */}
        <Link href="/" className="shrink-0">
          <div className="h-7 px-2 rounded-md bg-brand text-brand-foreground flex items-center justify-center text-xs font-bold tracking-tight">
            DTSP
          </div>
        </Link>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Guide */}
          <Link
            href="/guide"
            className="p-1.5 rounded-md transition-colors hover:bg-white/10 text-white/60 hover:text-white"
            title="Platform Guide"
          >
            <HelpCircle className="h-4 w-4" />
          </Link>

          {/* Escalation bell — CM only */}
          {role === 'cm' && escalationCount > 0 && (
            <Link
              href="/cm/coaches"
              className="relative p-1.5 rounded-md transition-colors hover:bg-white/10 text-white/60 hover:text-white"
              title={`${escalationCount} open escalations`}
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full bg-destructive text-destructive-foreground text-[11px] flex items-center justify-center font-medium leading-none px-1">
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
              <div className="w-6 h-6 rounded-full bg-white text-[hsl(220,20%,18%)] flex items-center justify-center text-xs font-bold">
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
                    {(['coach', 'cm', 'admin', 'observer'] as UserRole[]).map((r) => {
                      const href = `/${r === 'coach' ? 'coach' : r}`
                      return (
                        <button
                          key={r}
                          onClick={() => {
                            setShowRoleSwitcher(false)
                            if (r !== role) {
                              window.location.href = href
                            }
                          }}
                          className={cn(
                            'w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors',
                            r === role ? 'text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                          )}
                        >
                          <span className="flex-1">{ROLE_LABEL[r]}</span>
                          {r === role && <Check className="h-3.5 w-3.5 text-foreground" />}
                        </button>
                      )
                    })}
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
