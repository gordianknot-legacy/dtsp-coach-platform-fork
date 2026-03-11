'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { SessionRow } from '@/components/sessions/SessionRow'
import { SessionCalendar } from '@/components/sessions/SessionCalendar'
import { DueActionBanner } from '@/components/shared/DueActionBanner'
import { EmptyState } from '@/components/shared/EmptyState'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CalendarDays, Plus, Phone, Video } from 'lucide-react'
import { format, addDays, startOfWeek } from 'date-fns'
import type { Session, Teacher, RYGStatus } from '@/lib/supabase/types'
import { useToast } from '@/hooks/use-toast'

type SessionWithTeacher = Session & {
  teacher: Pick<Teacher, 'id' | 'name' | 'school_name' | 'block_tag' | 'phone'> & {
    ryg?: { status: RYGStatus } | null
  }
}

interface CoachHomeProps {
  todaySessions: SessionWithTeacher[]
  dueActions: { sessionId: string; teacherName: string; type: 'incomplete_notes'; label: string }[]
}

export function CoachHome({ todaySessions, dueActions }: CoachHomeProps) {
  const [tab, setTab] = useState('today')
  const [weekSessions, setWeekSessions] = useState<SessionWithTeacher[]>([])
  const [tomorrowSessions, setTomorrowSessions] = useState<SessionWithTeacher[]>([])
  const [calendarCounts, setCalendarCounts] = useState<{ date: string; count: number; hasVba: boolean }[]>([])
  const [calendarMonth, setCalendarMonth] = useState(format(new Date(), 'yyyy-MM'))
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [filteredSessions, setFilteredSessions] = useState<SessionWithTeacher[]>([])
  const [loading, setLoading] = useState(false)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const router = useRouter()
  const { toast } = useToast()

  const today = format(new Date(), 'yyyy-MM-dd')
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd')

  async function fetchWeekSessions() {
    try {
      const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
      const res = await fetch(`/api/sessions?week=${weekStart}`)
      if (!res.ok) return
      const json = await res.json()
      setWeekSessions(json.sessions ?? [])
    } catch {
      // Network error — leave empty state visible
    }
  }

  async function fetchTomorrowSessions() {
    try {
      const res = await fetch(`/api/sessions?date=${tomorrow}`)
      if (!res.ok) return
      const json = await res.json()
      setTomorrowSessions(json.sessions ?? [])
    } catch {
      // Network error — leave empty state visible
    }
  }

  async function fetchCalendarCounts(month: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/sessions/calendar?month=${month}`)
      if (!res.ok) return
      const json = await res.json()
      setCalendarCounts(json.dayCounts ?? [])
    } catch {
      // Network error — leave calendar empty
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (tab === 'tomorrow' && tomorrowSessions.length === 0) fetchTomorrowSessions()
    if (tab === 'week' && weekSessions.length === 0) fetchWeekSessions()
    if (tab === 'calendar') fetchCalendarCounts(calendarMonth)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, calendarMonth])

  function handleCalendarDayClick(date: Date, hasSession: boolean) {
    const dateStr = format(date, 'yyyy-MM-dd')
    setSelectedDate(dateStr)
    // Filter the calendar data to show sessions for that day
    const dayCount = calendarCounts.find((d) => d.date === dateStr)
    if (dayCount && dayCount.count > 0) {
      // Switch to showing filtered view for the selected date
      const daySessions = weekSessions.filter((s) =>
        s.scheduled_at.startsWith(dateStr)
      )
      setFilteredSessions(daySessions)
    }
    // Navigate to fetch sessions for that specific day
    fetch(`/api/sessions?date=${dateStr}`)
      .then((r) => r.json())
      .then((j) => setFilteredSessions(j.sessions ?? []))
  }

  function handleEmptyDayClick(date: Date) {
    setScheduleDate(format(date, "yyyy-MM-dd'T'HH:mm"))
    setScheduleOpen(true)
  }

  return (
    <div className="space-y-6">
      {dueActions.length > 0 && <DueActionBanner actions={dueActions} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">My Sessions</h1>
          <p className="text-sm text-muted-foreground">{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
        </div>
        <Button onClick={() => { setScheduleDate(''); setScheduleOpen(true) }} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Schedule
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="today">Today ({todaySessions.length})</TabsTrigger>
          <TabsTrigger value="tomorrow">Tomorrow</TabsTrigger>
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="calendar" className="gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            Calendar
          </TabsTrigger>
        </TabsList>

        {/* TODAY */}
        <TabsContent value="today" className="space-y-2 mt-3">
          {todaySessions.length === 0 ? (
            <EmptyState
              title="You're all caught up today!"
              description="Your scheduled sessions will appear here."
              action={
                <Button variant="outline" size="sm" onClick={() => { setScheduleDate(''); setScheduleOpen(true) }}>
                  Schedule a session
                </Button>
              }
            />
          ) : (
            todaySessions.map((s) => <SessionRow key={s.id} session={s} />)
          )}
        </TabsContent>

        {/* TOMORROW */}
        <TabsContent value="tomorrow" className="space-y-2 mt-3">
          {tomorrowSessions.length === 0 ? (
            <EmptyState
              title="No sessions tomorrow"
              description="Click a date on the calendar to schedule."
            />
          ) : (
            tomorrowSessions.map((s) => <SessionRow key={s.id} session={s} />)
          )}
        </TabsContent>

        {/* THIS WEEK */}
        <TabsContent value="week" className="space-y-2 mt-3">
          {weekSessions.length === 0 ? (
            <EmptyState title="No sessions this week" />
          ) : (
            weekSessions.map((s) => <SessionRow key={s.id} session={s} showDate />)
          )}
        </TabsContent>

        {/* CALENDAR */}
        <TabsContent value="calendar" className="mt-3 space-y-4">
          <SessionCalendar
            dayCounts={calendarCounts}
            onDayClick={handleCalendarDayClick}
            onEmptyDayClick={handleEmptyDayClick}
          />

          {/* Sessions for selected date */}
          {selectedDate && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Sessions for {format(new Date(selectedDate + 'T12:00:00'), 'd MMMM')}
              </h3>
              {filteredSessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sessions on this date.</p>
              ) : (
                filteredSessions.map((s) => <SessionRow key={s.id} session={s} />)
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Schedule session drawer */}
      <ScheduleSessionDialog
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        defaultDate={scheduleDate}
        onSuccess={() => router.refresh()}
      />
    </div>
  )
}

// Inline schedule dialog
interface ScheduleSessionDialogProps {
  open: boolean
  onClose: () => void
  defaultDate: string
  onSuccess: () => void
}

function ScheduleSessionDialog({ open, onClose, defaultDate, onSuccess }: ScheduleSessionDialogProps) {
  const [teacherId, setTeacherId] = useState('')
  const [scheduledAt, setScheduledAt] = useState(defaultDate)
  const [channel, setChannel] = useState('google_meet')
  const [meetLink, setMeetLink] = useState('')
  const [teachers, setTeachers] = useState<{ id: string; name: string; school_name: string }[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      setScheduledAt(defaultDate)
      // Fetch assigned teachers
      fetch('/api/teachers')
        .then((r) => r.json())
        .then((j) => setTeachers(j.teachers ?? []))
    }
  }, [open, defaultDate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacher_id: teacherId, scheduled_at: scheduledAt, channel, meet_link: meetLink }),
      })
      if (!res.ok) throw new Error()
      toast({ title: 'Session scheduled' })
      onSuccess()
      onClose()
    } catch {
      toast({ title: 'Error', description: 'Could not schedule session', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader><DialogTitle>Schedule session</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Teacher *</Label>
            <Select value={teacherId} onValueChange={setTeacherId} required>
              <SelectTrigger><SelectValue placeholder="Select teacher…" /></SelectTrigger>
              <SelectContent>
                {teachers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name} — {t.school_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Date & Time *</Label>
            <Input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Channel</Label>
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="google_meet">Google Meet</SelectItem>
                <SelectItem value="phone">Phone call</SelectItem>
                <SelectItem value="in_person">In person</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {channel === 'google_meet' && (
            <div className="space-y-2">
              <Label>Google Meet link</Label>
              <Input
                type="url"
                placeholder="https://meet.google.com/..."
                value={meetLink}
                onChange={(e) => setMeetLink(e.target.value)}
              />
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={!teacherId || !scheduledAt || loading}>
              {loading ? 'Scheduling…' : 'Schedule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
