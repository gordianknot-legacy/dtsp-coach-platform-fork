'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { KPICard } from '@/components/shared/KPICard'
import { RYGBadge } from '@/components/shared/RYGBadge'
import { InlineExpandable } from '@/components/shared/InlineExpandable'
import { useToast } from '@/hooks/use-toast'
import { formatDate, formatDateTime } from '@/lib/utils'
import { CheckCircle2, AlertCircle, User, Save } from 'lucide-react'
import type { RYGStatus } from '@/lib/supabase/types'

interface CM1on1WorkspaceProps {
  coach: { id: string; name: string }
  sessions: any[]
  escalations: any[]
  teachers: any[]
  recentCommitments: any[]
  rubricDimensions: { id: string; label: string; scale_min: number; scale_max: number }[]
  cmId: string
}

export function CM1on1Workspace({
  coach, sessions, escalations, teachers, recentCommitments, rubricDimensions, cmId
}: CM1on1WorkspaceProps) {
  const router = useRouter()
  const { toast } = useToast()

  // Spot-check ratings state
  const [spotCheckRatings, setSpotCheckRatings] = useState<Record<string, Record<string, number>>>({})
  const [spotCheckSession, setSpotCheckSession] = useState<string | null>(null)
  const [commitmentText, setCommitmentText] = useState('')
  const [savingCommitments, setSavingCommitments] = useState(false)
  const [resolvingEsc, setResolvingEsc] = useState<string | null>(null)

  const completed = sessions.filter((s) => s.status === 'completed').length
  const noShows = sessions.filter((s) => s.status === 'no_show').length
  const confirmationRate = sessions.length > 0
    ? Math.round(sessions.filter((s) => s.confirmation_status === 'confirmed').length / sessions.length * 100)
    : 0

  const redTeachers = teachers.filter((t) => t.ryg?.status === 'R')
  const yellowTeachers = teachers.filter((t) => t.ryg?.status === 'Y')

  async function resolveEscalation(id: string, category: string) {
    setResolvingEsc(id)
    try {
      await fetch(`/api/escalations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved', resolution_category: category }),
      })
      toast({ title: 'Escalation resolved' })
      router.refresh()
    } catch {
      toast({ title: 'Error', variant: 'destructive' })
    } finally {
      setResolvingEsc(null)
    }
  }

  async function saveCommitments() {
    if (!commitmentText.trim()) return
    setSavingCommitments(true)
    try {
      await fetch('/api/cm/commitments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coach_id: coach.id,
          commitments: commitmentText.split('\n').filter(Boolean).map((c) => ({ text: c, date: new Date().toISOString() })),
          spot_check_ratings: spotCheckRatings,
        }),
      })
      toast({ title: '1:1 saved' })
      setCommitmentText('')
      router.refresh()
    } catch {
      toast({ title: 'Save failed', variant: 'destructive' })
    } finally {
      setSavingCommitments(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">{coach.name}</h1>
        <p className="text-sm text-muted-foreground">1:1 Workspace — Last 30 days</p>
      </div>

      {/* KPI rollup */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard label="Teachers" value={teachers.length} />
        <KPICard label="Completed" value={completed} />
        <KPICard label="No-shows" value={noShows} trend={noShows > 2 ? 'down' : 'neutral'} />
        <KPICard label="Confirmation rate" value={`${confirmationRate}%`} trend={confirmationRate < 70 ? 'down' : 'up'} />
      </div>

      {/* At-risk teachers */}
      {(redTeachers.length > 0 || yellowTeachers.length > 0) && (
        <InlineExpandable
          title="At-risk teachers"
          defaultOpen={redTeachers.length > 0}
          badge={
            <div className="flex gap-1">
              {redTeachers.length > 0 && <Badge className="bg-red-100 text-red-700 text-xs">{redTeachers.length} Red</Badge>}
              {yellowTeachers.length > 0 && <Badge className="bg-yellow-100 text-yellow-700 text-xs">{yellowTeachers.length} Yellow</Badge>}
            </div>
          }
        >
          <div className="space-y-2">
            {[...redTeachers, ...yellowTeachers].map((t) => (
              <div key={t.id} className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1">{t.name} — {t.school_name}</span>
                <RYGBadge status={t.ryg?.status as RYGStatus} />
              </div>
            ))}
          </div>
        </InlineExpandable>
      )}

      {/* Escalations */}
      {escalations.length > 0 && (
        <InlineExpandable
          title="Open escalations"
          defaultOpen={true}
          badge={<Badge className="bg-red-100 text-red-700 text-xs">{escalations.length}</Badge>}
        >
          <div className="space-y-3">
            {escalations.map((esc) => (
              <div key={esc.id} className="flex items-start justify-between gap-3 p-3 bg-red-50 rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium">{esc.teacher?.name}</span>
                    <Badge variant="outline" className="text-xs border-red-300 text-red-700">
                      {esc.trigger_type.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatDate(esc.auto_created_at)}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {['addressed', 'monitoring', 'false_positive'].map((cat) => (
                    <Button
                      key={cat}
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      disabled={resolvingEsc === esc.id}
                      onClick={() => resolveEscalation(esc.id, cat)}
                    >
                      {cat.replace(/_/g, ' ')}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </InlineExpandable>
      )}

      {/* Recent sessions + spot-check */}
      <InlineExpandable title={`Sessions (${sessions.length})`} defaultOpen={false}>
        <div className="space-y-3">
          {sessions.slice(0, 10).map((session) => (
            <div key={session.id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{session.teacher?.name}</span>
                  {session.focus_tag && <Badge variant="outline" className="text-xs">{session.focus_tag}</Badge>}
                  <span className={`text-xs px-1 py-0.5 rounded ${
                    session.status === 'completed' ? 'bg-gray-100 text-gray-600' :
                    session.status === 'no_show' ? 'bg-red-100 text-red-700' :
                    'bg-blue-50 text-blue-700'
                  }`}>{session.status}</span>
                </div>
                <span className="text-xs text-muted-foreground">{formatDate(session.scheduled_at)}</span>
              </div>

              {/* Spot-check rating */}
              {session.status === 'completed' && rubricDimensions.length > 0 && (
                <div className="ml-4 space-y-1">
                  {rubricDimensions.map((dim) => (
                    <div key={dim.id} className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground w-32 truncate">{dim.label}</span>
                      <div className="flex gap-1">
                        {Array.from({ length: dim.scale_max - dim.scale_min + 1 }, (_, i) => dim.scale_min + i).map((score) => (
                          <button
                            key={score}
                            type="button"
                            onClick={() => setSpotCheckRatings((prev) => ({
                              ...prev,
                              [session.id]: { ...(prev[session.id] ?? {}), [dim.id]: score }
                            }))}
                            className={`w-6 h-6 rounded text-xs font-medium transition-colors ${
                              spotCheckRatings[session.id]?.[dim.id] === score
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-muted/70'
                            }`}
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </InlineExpandable>

      {/* Commitments */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">1:1 commitments & notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pb-4">
          <Textarea
            placeholder="One commitment per line. E.g.&#10;• Will complete notes for 3 missing sessions by Friday&#10;• Focus literacy theme next 2 weeks for Block A teachers"
            value={commitmentText}
            onChange={(e) => setCommitmentText(e.target.value)}
            rows={4}
          />

          {recentCommitments.length > 0 && (
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-medium">Previous commitments:</p>
              {recentCommitments[0].commitments?.slice(0, 3).map((c: any, i: number) => (
                <p key={i}>• {c.text}</p>
              ))}
            </div>
          )}

          <Button onClick={saveCommitments} disabled={!commitmentText.trim() || savingCommitments} className="gap-2">
            <Save className="h-4 w-4" />
            {savingCommitments ? 'Saving…' : 'Save 1:1 & mark done'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
