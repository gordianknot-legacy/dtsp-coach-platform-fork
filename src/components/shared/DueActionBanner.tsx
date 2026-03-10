'use client'

import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
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
    <div className="rounded-lg bg-amber-50 border border-amber-200/60 p-4 flex items-start gap-3">
      <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-amber-800">
          {actions.length} pending {actions.length === 1 ? 'action' : 'actions'} from previous sessions
        </p>
        <div className="mt-2 space-y-1">
          {actions.slice(0, 3).map((action) => (
            <div key={`${action.sessionId}-${action.type}`} className="flex items-center justify-between">
              <span className="text-xs text-amber-700">
                {action.teacherName} — {action.label}
              </span>
              <Button asChild variant="ghost" size="sm" className="h-6 text-xs text-amber-700 px-2 hover:bg-amber-100">
                <Link href={`/coach/sessions/${action.sessionId}/after`}>
                  Complete
                </Link>
              </Button>
            </div>
          ))}
          {actions.length > 3 && (
            <p className="text-xs text-amber-600 mt-1">+{actions.length - 3} more</p>
          )}
        </div>
      </div>
    </div>
  )
}
