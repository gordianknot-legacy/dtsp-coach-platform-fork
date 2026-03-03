'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
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
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/60 transition-colors text-left"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          {open ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm font-medium">{title}</span>
          {badge}
        </div>
      </button>
      {open && <div className="px-4 py-4 border-t">{children}</div>}
    </div>
  )
}
