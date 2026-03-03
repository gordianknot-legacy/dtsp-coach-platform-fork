'use client'

import { useState, useCallback } from 'react'
import { Calendar, dateFnsLocalizer, Views, type View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth } from 'date-fns'
import { enIN } from 'date-fns/locale/en-IN'
import { cn } from '@/lib/utils'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const locales = { 'en-IN': enIN }

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }), // Monday start
  getDay,
  locales,
})

interface DayCount {
  date: string // YYYY-MM-DD
  count: number
  hasVba: boolean
}

interface SessionCalendarProps {
  dayCounts: DayCount[]
  onDayClick: (date: Date, hasSession: boolean) => void
  onEmptyDayClick: (date: Date) => void
}

function getCapacityClass(count: number): string {
  if (count === 0) return ''
  if (count <= 1) return 'rbc-day-low'   // green
  if (count <= 3) return 'rbc-day-medium' // amber
  if (count <= 5) return 'rbc-day-high'   // red
  return 'rbc-day-full' // dark red
}

function getCapacityLabel(count: number): string {
  if (count === 0) return ''
  if (count <= 1) return `${count} session`
  if (count <= 3) return `${count} sessions`
  if (count <= 5) return `${count} — full`
  return `${count} — over capacity`
}

export function SessionCalendar({ dayCounts, onDayClick, onEmptyDayClick }: SessionCalendarProps) {
  const [view, setView] = useState<View>(Views.MONTH)
  const [date, setDate] = useState(new Date())

  // Build a lookup map from date string → count info
  const dayMap = new Map(dayCounts.map((d) => [d.date, d]))

  // Convert day counts to calendar events for display
  const events = dayCounts
    .filter((d) => d.count > 0)
    .map((d) => ({
      id: d.date,
      title: getCapacityLabel(d.count),
      start: new Date(d.date + 'T00:00:00'),
      end: new Date(d.date + 'T23:59:59'),
      allDay: true,
      resource: d,
    }))

  const dayPropGetter = useCallback(
    (date: Date) => {
      const key = format(date, 'yyyy-MM-dd')
      const info = dayMap.get(key)
      if (!info || info.count === 0) return {}
      return {
        className: cn(getCapacityClass(info.count)),
      }
    },
    [dayMap]
  )

  const handleSelectSlot = useCallback(
    ({ start }: { start: Date }) => {
      const key = format(start, 'yyyy-MM-dd')
      const info = dayMap.get(key)
      if (info && info.count > 0) {
        onDayClick(start, true)
      } else {
        onEmptyDayClick(start)
      }
    },
    [dayMap, onDayClick, onEmptyDayClick]
  )

  const handleSelectEvent = useCallback(
    (event: { resource: DayCount; start: Date }) => {
      onDayClick(event.start, true)
    },
    [onDayClick]
  )

  return (
    <>
      <style>{`
        .rbc-day-low .rbc-day-bg { background-color: #dcfce7 !important; }
        .rbc-day-medium .rbc-day-bg { background-color: #fef9c3 !important; }
        .rbc-day-high .rbc-day-bg { background-color: #fee2e2 !important; }
        .rbc-day-full .rbc-day-bg { background-color: #fca5a5 !important; }
        .rbc-event { font-size: 11px; padding: 2px 4px; }
        .rbc-month-view { border-radius: 8px; overflow: hidden; }
        .rbc-toolbar button { font-size: 13px; }
      `}</style>
      <div className="h-[500px]">
        <Calendar
          localizer={localizer}
          events={events}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          dayPropGetter={dayPropGetter}
          views={[Views.MONTH, Views.WEEK]}
          popup
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
        />
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-green-200 border border-green-300" />
          0–1 sessions (low)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-yellow-200 border border-yellow-300" />
          2–3 sessions (medium)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-red-200 border border-red-300" />
          4–5 sessions (high)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-red-400 border border-red-500" />
          6+ sessions (over capacity)
        </span>
      </div>
    </>
  )
}
