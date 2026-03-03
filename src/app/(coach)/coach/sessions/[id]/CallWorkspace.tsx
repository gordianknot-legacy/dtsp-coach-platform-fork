'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { FocusTagSelector } from '@/components/sessions/FocusTagSelector'
import { ConfirmationStatusToggle } from '@/components/sessions/ConfirmationStatusToggle'
import { RescheduleDrawer } from '@/components/sessions/RescheduleDrawer'
import { RYGBadge } from '@/components/shared/RYGBadge'
import { InlineExpandable } from '@/components/shared/InlineExpandable'
import { useToast } from '@/hooks/use-toast'
import { formatDateTime, formatDate } from '@/lib/utils'
import {
  Video, Phone, ArrowLeft, ExternalLink,
  AlertTriangle, CheckCircle2, UserX, Clock
} from 'lucide-react'
import type { Session, Teacher, RYGStatus } from '@/lib/supabase/types'

interface CallWorkspaceProps {
  session: Session & {
    teacher: Teacher
    notes: { what_discussed: string | null } | null
    action_steps: { description: string; due_date: string | null; status: string }[]
    reschedules: { reason_category: string; created_at: string }[]
  }
  lastSession: {
    scheduled_at: string
    focus_tag: string | null
    notes: { what_discussed: string | null; what_decided: string | null } | null
    action_steps: { description: string; due_date: string | null; status: string }[]
  } | null
  currentRYG: RYGStatus | null
  focusCategories: string[]
}

export function CallWorkspace({ session, lastSession, currentRYG, focusCategories }: CallWorkspaceProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [focusTag, setFocusTag] = useState<string | null>(session.focus_tag)
  const [callInProgress, setCallInProgress] = useState(false)
  const [noShowCountdown, setNoShowCountdown] = useState<number | null>(null)
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const [savingFocus, setSavingFocus] = useState(false)
  const [markingNoShow, setMarkingNoShow] = useState(false)

  const isCompleted = session.status === 'completed'
  const hasReschedules = session.reschedules.length > 0
  const openActionSteps = lastSession?.action_steps.filter((s) => s.status === 'open') ?? []

  async function handleFocusChange(tag: string | null) {
    setFocusTag(tag)
    setSavingFocus(true)
    try {
      await fetch(`/api/sessions/${session.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ focus_tag: tag }),
      })
    } finally {
      setSavingFocus(false)
    }
  }

  function handleStartCall() {
    const meetLink = session.meet_link ?? 'https://meet.google.com'
    window.open(meetLink, 'dtsp-meet', 'width=1200,height=800,left=100,top=100')
    setCallInProgress(true)

    // Update session status to in_progress
    fetch(`/api/sessions/${session.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'in_progress' }),
    })
  }

  function handleStartNoShowTimer() {
    let seconds = 300 // 5 min wait
    setNoShowCountdown(seconds)
    const interval = setInterval(() => {
      seconds -= 1
      setNoShowCountdown(seconds)
      if (seconds <= 0) {
        clearInterval(interval)
        setNoShowCountdown(0)
      }
    }, 1000)
  }

  async function handleMarkNoShow() {
    setMarkingNoShow(true)
    try {
      await fetch(`/api/sessions/${session.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'no_show' }),
      })
      toast({ title: 'Marked as no-show', description: 'Reschedule when ready.' })
      setRescheduleOpen(true)
    } finally {
      setMarkingNoShow(false)
    }
  }

  function handleEndCall() {
    router.push(`/coach/sessions/${session.id}/after`)
  }

  const noShowMinutes = noShowCountdown !== null ? Math.ceil(noShowCountdown / 60) : null

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Back nav */}
      <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2">
        <Link href="/coach"><ArrowLeft className="h-4 w-4" /> Back to Home</Link>
      </Button>

      {/* Teacher header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold">{session.teacher.name}</h1>
            {currentRYG && <RYGBadge status={currentRYG} />}
            {hasReschedules && (
              <Badge variant="outline" className="text-orange-700 border-orange-300 bg-orange-50 text-xs">
                {session.reschedules.length} reschedule{session.reschedules.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {session.teacher.school_name}
            {session.teacher.block_tag && ` · ${session.teacher.block_tag}`}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDateTime(session.scheduled_at)}
            {session.teacher.phone && ` · ${session.teacher.phone}`}
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/coach/teachers/${session.teacher_id}`}>Teacher profile</Link>
          </Button>
        </div>
      </div>

      {/* Confirmation status */}
      <ConfirmationStatusToggle
        sessionId={session.id}
        initial={session.confirmation_status}
      />

      {/* Call in progress banner */}
      {callInProgress && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5">
          <Video className="h-4 w-4 text-blue-600 animate-pulse" />
          <span className="text-sm font-medium text-blue-800">
            Call in progress — {session.teacher.name}
          </span>
          <span className="text-xs text-blue-600 ml-auto">Google Meet is open in another window</span>
        </div>
      )}

      {/* Pre-session brief */}
      <InlineExpandable
        title="Pre-session brief"
        defaultOpen={!callInProgress}
        badge={lastSession && <span className="text-xs text-muted-foreground">Last: {formatDate(lastSession.scheduled_at)}</span>}
      >
        {lastSession ? (
          <div className="space-y-3 text-sm">
            {lastSession.focus_tag && (
              <div>
                <span className="font-medium text-muted-foreground">Last focus:</span>
                <Badge variant="outline" className="ml-2 text-xs">{lastSession.focus_tag}</Badge>
              </div>
            )}
            {lastSession.notes?.what_discussed && (
              <div>
                <p className="font-medium text-muted-foreground mb-1">What was discussed:</p>
                <p className="text-foreground whitespace-pre-line">{lastSession.notes.what_discussed}</p>
              </div>
            )}
            {lastSession.notes?.what_decided && (
              <div>
                <p className="font-medium text-muted-foreground mb-1">What was decided:</p>
                <p className="text-foreground whitespace-pre-line">{lastSession.notes.what_decided}</p>
              </div>
            )}
            {openActionSteps.length > 0 && (
              <div>
                <p className="font-medium text-muted-foreground mb-1">Open action steps:</p>
                <ul className="space-y-1">
                  {openActionSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Clock className="h-3.5 w-3.5 mt-0.5 text-amber-500 shrink-0" />
                      <span>{step.description}</span>
                      {step.due_date && (
                        <span className="text-muted-foreground text-xs shrink-0">
                          Due {formatDate(step.due_date)}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No previous sessions with this teacher.</p>
        )}
      </InlineExpandable>

      {/* Focus tag */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Focus for this session</CardTitle>
        </CardHeader>
        <CardContent>
          <FocusTagSelector
            tags={focusCategories}
            value={focusTag}
            onChange={handleFocusChange}
            disabled={isCompleted}
          />
          {savingFocus && <p className="text-xs text-muted-foreground mt-2">Saving…</p>}
        </CardContent>
      </Card>

      {/* Call controls */}
      {!isCompleted && (
        <Card>
          <CardContent className="pt-4 pb-4 space-y-3">
            {/* Start call */}
            {!callInProgress ? (
              <div className="flex gap-2 flex-wrap">
                <Button onClick={handleStartCall} className="gap-2 flex-1 sm:flex-none">
                  <Video className="h-4 w-4" />
                  Start Google Meet
                  <ExternalLink className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartNoShowTimer}
                  className="gap-2"
                  disabled={noShowCountdown !== null}
                >
                  <AlertTriangle className="h-4 w-4" />
                  {noShowCountdown !== null ? `Waiting ${noShowMinutes}m…` : 'Teacher hasn\'t joined'}
                </Button>
              </div>
            ) : (
              <div className="flex gap-2 flex-wrap">
                <Button onClick={handleEndCall} variant="default" className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  End call & write notes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartNoShowTimer}
                  disabled={noShowCountdown !== null}
                >
                  Teacher dropped
                </Button>
              </div>
            )}

            {/* No-show flow */}
            {noShowCountdown === 0 && (
              <div className="flex gap-2 items-center bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <UserX className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-800 flex-1">Wait time elapsed. Mark as no-show?</span>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleMarkNoShow}
                  disabled={markingNoShow}
                >
                  Mark no-show
                </Button>
              </div>
            )}

            <Separator />

            {/* Reschedule */}
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground"
              onClick={() => setRescheduleOpen(true)}
            >
              Reschedule this session
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Duration note for completed sessions */}
      {isCompleted && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          Session completed
          {session.duration_mins && ` · ${session.duration_mins} mins`}
          {!session.duration_mins && ' · Duration auto-updated when available'}
        </div>
      )}

      <RescheduleDrawer
        sessionId={session.id}
        teacherName={session.teacher.name}
        open={rescheduleOpen}
        onClose={() => setRescheduleOpen(false)}
      />
    </div>
  )
}
