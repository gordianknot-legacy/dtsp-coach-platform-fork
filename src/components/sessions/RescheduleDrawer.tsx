'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'

const REASON_OPTIONS = [
  { value: 'teacher_unavailable', label: 'Teacher unavailable' },
  { value: 'coach_unavailable', label: 'Coach unavailable' },
  { value: 'tech_issue', label: 'Technical issue' },
  { value: 'school_event', label: 'School event' },
  { value: 'other', label: 'Other' },
]

interface RescheduleDrawerProps {
  sessionId: string
  teacherName: string
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function RescheduleDrawer({ sessionId, teacherName, open, onClose, onSuccess }: RescheduleDrawerProps) {
  const [reason, setReason] = useState('')
  const [newWindow, setNewWindow] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reason) return

    setLoading(true)
    try {
      const res = await fetch(`/api/sessions/${sessionId}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason_category: reason, new_window: newWindow || null }),
      })

      if (!res.ok) throw new Error()

      toast({ title: 'Session rescheduled', description: `Reschedule logged for ${teacherName}` })
      onSuccess?.()
      onClose()
      router.refresh()
    } catch {
      toast({ title: 'Error', description: 'Could not save reschedule', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reschedule — {teacherName}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Reason for reschedule *</Label>
            <Select value={reason} onValueChange={setReason} required>
              <SelectTrigger>
                <SelectValue placeholder="Select reason…" />
              </SelectTrigger>
              <SelectContent>
                {REASON_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>New date/time (optional)</Label>
            <Input
              type="datetime-local"
              value={newWindow}
              onChange={(e) => setNewWindow(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Leave blank if not yet confirmed</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={!reason || loading}>
              {loading ? 'Saving…' : 'Save reschedule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
