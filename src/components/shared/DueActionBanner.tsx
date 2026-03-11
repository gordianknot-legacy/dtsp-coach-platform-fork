'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface DueAction {
  sessionId: string
  teacherName: string
  type: 'incomplete_notes' | 'unsent_summary' | 'open_action_steps'
  label: string
}

interface DueActionBannerProps {
  actions: DueAction[]
}

export function DueActionBanner({ actions }: DueActionBannerProps) {
  if (actions.length === 0) return null

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
      <p className="text-sm font-medium text-amber-900">
        {actions.length} pending {actions.length === 1 ? 'action' : 'actions'}
      </p>
      <div className="mt-2 space-y-1.5">
        {actions.slice(0, 3).map((action) => (
          <div key={`${action.sessionId}-${action.type}`} className="flex items-center justify-between gap-2">
            <span className="text-sm text-amber-800">
              {action.teacherName} — {action.label}
            </span>
            <Button asChild variant="ghost" size="sm" className="h-8 text-xs px-3 text-amber-800 hover:text-amber-900 hover:bg-amber-100">
              <Link href={`/coach/sessions/${action.sessionId}/after`}>
                Complete
              </Link>
            </Button>
          </div>
        ))}
        {actions.length > 3 && (
          <Button asChild variant="ghost" size="sm" className="h-7 text-xs px-2 text-amber-700 hover:text-amber-900 hover:bg-amber-100 -ml-2">
            <Link href="/coach">View all</Link>
          </Button>
        )}
      </div>
    </div>
  )
}
