'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_ITEMS, ROLE_LABEL } from './nav-config'
import type { UserRole } from '@/lib/supabase/types'

interface SidebarProps {
  open: boolean
  onClose: () => void
  role: UserRole
  mode: 'persistent' | 'overlay'
}

export function Sidebar({ open, onClose, role, mode }: SidebarProps) {
  const pathname = usePathname()
  const navItems = NAV_ITEMS[role] ?? []

  // Lock body scroll when overlay is open
  useEffect(() => {
    if (mode === 'overlay' && open) {
      document.body.style.overflow = 'hidden'
    } else if (mode === 'overlay') {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open, mode])

  function isActive(item: { href: string; exact?: boolean }) {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand text-brand-foreground flex items-center justify-center text-sm font-bold shrink-0">
            DT
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground leading-tight">DTSP Coach Platform</p>
            <p className="text-xs text-muted-foreground">{ROLE_LABEL[role]}</p>
          </div>
        </div>
        {mode === 'overlay' && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto py-3 px-3">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={mode === 'overlay' ? onClose : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors min-h-[44px]',
                  active
                    ? 'bg-primary/10 text-foreground border-l-3 border-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', item.iconBg)}>
                  <Icon className={cn('h-5 w-5', item.iconColor)} />
                </div>
                <div className="min-w-0">
                  <p className={cn('text-sm leading-tight', active && 'font-semibold')}>{item.label}</p>
                  <p className="text-xs text-muted-foreground leading-tight mt-0.5 truncate">{item.description}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border px-5 py-3">
        <p className="text-xs text-muted-foreground">District Teacher Support Programme</p>
      </div>
    </>
  )

  // Persistent mode — always visible, part of flex layout
  if (mode === 'persistent') {
    return (
      <aside className="hidden md:flex w-64 lg:w-72 shrink-0 flex-col bg-white border-r border-border h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto">
        {sidebarContent}
      </aside>
    )
  }

  // Overlay mode — slides in on mobile
  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/40 transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <nav
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transition-transform duration-300 ease-in-out flex flex-col',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        role="dialog"
        aria-label="Navigation sidebar"
      >
        {sidebarContent}
      </nav>
    </>
  )
}
