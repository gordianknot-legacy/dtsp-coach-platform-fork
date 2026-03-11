'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from './nav-config'
import type { UserRole } from '@/lib/supabase/types'

interface MobileBottomBarProps {
  role: UserRole
}

export function MobileBottomBar({ role }: MobileBottomBarProps) {
  const pathname = usePathname()
  const allItems = NAV_ITEMS[role] ?? []

  function isActive(item: { href: string; exact?: boolean }) {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {allItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all active:scale-95',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <div className={cn(
                'flex items-center justify-center w-12 h-7 rounded-full transition-colors',
                active && 'bg-primary/10'
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <span className={cn('text-[11px] leading-none', active ? 'font-semibold' : 'font-medium')}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
