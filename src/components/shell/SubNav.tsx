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
      <div className="px-5 sm:px-8 md:px-10 lg:px-16 xl:px-24 max-w-[1400px] mx-auto">
        <div className="flex items-center gap-1 h-11 -mb-px">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex items-center gap-1.5 px-3 h-full text-sm font-medium transition-colors',
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
                {active && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
