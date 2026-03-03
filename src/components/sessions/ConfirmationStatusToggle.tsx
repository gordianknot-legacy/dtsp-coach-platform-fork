'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { ConfirmationStatus } from '@/lib/supabase/types'

interface ConfirmationStatusToggleProps {
  sessionId: string
  initial: ConfirmationStatus
  onChange?: (status: ConfirmationStatus) => void
}

const STATES: { value: ConfirmationStatus; label: string; className: string }[] = [
  { value: 'pending', label: 'Pending', className: 'bg-muted text-muted-foreground' },
  { value: 'confirmed', label: 'Confirmed', className: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'no_response', label: 'No Response', className: 'bg-red-100 text-red-700 border-red-300' },
]

export function ConfirmationStatusToggle({ sessionId, initial, onChange }: ConfirmationStatusToggleProps) {
  const [status, setStatus] = useState<ConfirmationStatus>(initial)
  const [saving, setSaving] = useState(false)

  async function handleChange(next: ConfirmationStatus) {
    if (next === status || saving) return
    setSaving(true)

    try {
      await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation_status: next }),
      })
      setStatus(next)
      onChange?.(next)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-muted-foreground mr-1">Confirmation:</span>
      {STATES.map((s) => (
        <button
          key={s.value}
          type="button"
          onClick={() => handleChange(s.value)}
          disabled={saving}
          className={cn(
            'px-2 py-0.5 rounded border text-xs font-medium transition-all',
            status === s.value ? s.className : 'bg-background text-muted-foreground border-border hover:bg-muted'
          )}
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}
