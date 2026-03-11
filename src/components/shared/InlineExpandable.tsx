'use client'

import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InlineExpandableProps {
  title: string
  badge?: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
  className?: string
}

export function InlineExpandable({
  title,
  badge,
  defaultOpen = false,
  children,
  className,
}: InlineExpandableProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={cn('rounded-lg border border-border overflow-hidden', className)}>
      <button
        type="button"
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-muted/50 transition-colors text-left"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          <ChevronRight className={cn('h-4 w-4 text-muted-foreground transition-transform duration-200', open && 'rotate-90')} />
          <span className="text-sm font-medium">{title}</span>
          {badge}
        </div>
      </button>
      <div className={cn('grid transition-[grid-template-rows] duration-200', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
        <div className="overflow-hidden">
          <div className="px-3 py-3 border-t border-border">{children}</div>
        </div>
      </div>
    </div>
  )
}
