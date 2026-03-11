'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from './nav-config'
import type { UserRole } from '@/lib/supabase/types'

interface MobileBottomBarProps {
  role: UserRole
  onMoreClick: () => void
}

const MAX_TABS = 4

export function MobileBottomBar({ role, onMoreClick }: MobileBottomBarProps) {
  const pathname = usePathname()
  const allItems = NAV_ITEMS[role] ?? []
  const showMore = allItems.length > MAX_TABS
  const visibleItems = showMore ? allItems.slice(0, MAX_TABS - 1) : allItems

  function isActive(item: { href: string; exact?: boolean }) {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-16">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors active:scale-95 transition-transform',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className="h-[22px] w-[22px]" />
              <span className={cn('text-[11px] leading-tight', active && 'font-semibold')}>{item.label}</span>
            </Link>
          )
        })}

        {showMore && (
          <button
            onClick={onMoreClick}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-muted-foreground opacity-70 transition-colors active:scale-95 transition-transform"
          >
            <MoreHorizontal className="h-[22px] w-[22px]" />
            <span className="text-[11px] leading-tight">More</span>
          </button>
        )}
      </div>
    </div>
  )
}
