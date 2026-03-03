'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn, getInitials } from '@/lib/utils'
import { LogOut, Bell } from 'lucide-react'
import type { UserRole } from '@/lib/supabase/types'

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

interface TopNavProps {
  role: UserRole
  userName: string
  escalationCount?: number
}

export function TopNav({ role, userName, escalationCount = 0 }: TopNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const navItems = NAV_ITEMS[role] ?? []

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  function isActive(item: NavItem) {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  const roleLabel: Record<UserRole, string> = {
    coach: 'Coach',
    cm: 'Cluster Manager',
    admin: 'Admin',
    observer: 'Observer',
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="flex h-14 items-center px-4 gap-4">
        {/* Logo / Brand */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
            D
          </div>
          <span className="font-semibold text-sm hidden sm:block">DTSP</span>
        </Link>

        <Separator orientation="vertical" className="h-5" />

        {/* Nav items */}
        <nav className="flex items-center gap-1 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                isActive(item)
                  ? 'bg-secondary text-secondary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Escalation badge for CM */}
          {role === 'cm' && escalationCount > 0 && (
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/cm/coaches">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
                  {escalationCount > 9 ? '9+' : escalationCount}
                </span>
              </Link>
            </Button>
          )}

          {/* User avatar + role */}
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-xs">{getInitials(userName)}</AvatarFallback>
            </Avatar>
            <div className="hidden sm:flex flex-col">
              <span className="text-xs font-medium leading-none">{userName}</span>
              <span className="text-[10px] text-muted-foreground leading-none mt-0.5">{roleLabel[role]}</span>
            </div>
          </div>

          <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
