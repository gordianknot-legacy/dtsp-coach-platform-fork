'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from './nav-config'
import type { UserRole } from '@/lib/supabase/types'

interface SubNavProps {
  role: UserRole
}

export function SubNav({ role }: SubNavProps) {
  const pathname = usePathname()
  const navItems = NAV_ITEMS[role] ?? []

  // Don't render if only one nav item (e.g. Observer)
  if (navItems.length <= 1) return null

  function isActive(item: { href: string; exact?: boolean }) {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  return (
    <nav className="hidden md:block border-b border-border bg-white/80 backdrop-blur-sm sticky top-14 z-30">
      <div className="px-4 sm:px-6 lg:px-10 xl:px-16 max-w-[1400px] mx-auto">
        <div className="flex items-center gap-1 h-11">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                  active
                    ? 'text-primary bg-primary/8'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
