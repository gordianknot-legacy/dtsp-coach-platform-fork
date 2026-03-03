'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { FocusTagSelector } from '@/components/sessions/FocusTagSelector'
import { WhatsAppDraftBox } from '@/components/sessions/WhatsAppDraftBox'
import { ActionStepInput, type ActionStepDraft } from '@/components/sessions/ActionStepInput'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react'
import type { Session, Teacher, SessionNote } from '@/lib/supabase/types'
import { formatDateTime } from '@/lib/utils'

const DRAFT_KEY = (sessionId: string) => `after-call-draft-${sessionId}`

interface AfterCallScreenProps {
  session: Session & {
    teacher: Pick<Teacher, 'id' | 'name' | 'phone' | 'school_name' | 'block_tag'>
    notes: SessionNote | null
    action_steps: { description: string; due_date: string | null; status: string }[]
  }
  focusCategories: string[]
  coachId: string
}

export function AfterCallScreen({ session, focusCategories, coachId }: AfterCallScreenProps) {
  const router = useRouter()
  const { toast } = useToast()

  // Initialize from existing notes or localStorage draft
  const savedDraft = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem(DRAFT_KEY(session.id)) ?? 'null')
    : null

  const [focusTag, setFocusTag] = useState(session.focus_tag ?? savedDraft?.focusTag ?? null)
  const [whatDiscussed, setWhatDiscussed] = useState(
    session.notes?.what_discussed ?? savedDraft?.whatDiscussed ?? ''
  )
  const [whatDecided, setWhatDecided] = useState(
    session.notes?.what_decided ?? savedDraft?.whatDecided ?? ''
  )
  const [qualitative, setQualitative] = useState(
    session.notes?.qualitative_comments ?? savedDraft?.qualitative ?? ''
  )
  const [actionSteps, setActionSteps] = useState<ActionStepDraft[]>(
    savedDraft?.actionSteps ?? [{ description: '', due_date: '' }]
  )
  const [durationMins, setDurationMins] = useState(
    session.duration_mins?.toString() ?? ''
  )
  const [whatsappDraft, setWhatsappDraft] = useState(savedDraft?.whatsappDraft ?? '')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiUsed, setAiUsed] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Persist draft to localStorage on every change — survives network interruption
  useEffect(() => {
    const draft = { focusTag, whatDiscussed, whatDecided, qualitative, actionSteps, whatsappDraft }
    localStorage.setItem(DRAFT_KEY(session.id), JSON.stringify(draft))
  }, [focusTag, whatDiscussed, whatDecided, qualitative, actionSteps, whatsappDraft])

  async function generateAIDraft() {
    if (!whatDiscussed && !whatDecided) {
      toast({ title: 'Fill in notes first', description: 'Add what was discussed before generating draft.' })
      return
    }
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/draft-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacher_name: session.teacher.name,
          session_date: session.scheduled_at,
          focus_tag: focusTag,
          what_discussed: whatDiscussed,
          what_decided: whatDecided,
          action_steps: actionSteps.filter((s) => s.description.trim()),
        }),
      })
      const json = await res.json()
      if (json.draft) {
        setWhatsappDraft(json.draft)
        setAiUsed(true)
      }
    } catch {
      toast({ title: 'AI unavailable', description: 'Generate draft manually or try again.' })
    } finally {
      setAiLoading(false)
    }
  }

  async function handleSave(closeSession = false) {
    setSaving(true)
    try {
      // Save notes
      await fetch(`/api/sessions/${session.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          what_discussed: whatDiscussed || null,
          what_decided: whatDecided || null,
          qualitative_comments: qualitative || null,
          ai_draft_used: aiUsed,
          ai_draft_text: aiUsed ? whatsappDraft : null,
          action_steps: actionSteps.filter((s) => s.description.trim()),
        }),
      })

      // Update focus tag + duration
      await fetch(`/api/sessions/${session.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          focus_tag: focusTag,
          duration_mins: durationMins ? parseInt(durationMins, 10) : null,
          ...(closeSession && { status: 'completed' }),
        }),
      })

      // Clear localStorage draft
      localStorage.removeItem(DRAFT_KEY(session.id))
      setSaved(true)

      toast({ title: closeSession ? 'Session saved and closed' : 'Notes saved' })

      if (closeSession) {
        setTimeout(() => router.push('/coach'), 800)
      }
    } catch {
      toast({ title: 'Save failed', description: 'Your work is preserved locally. Try again.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Back */}
      <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2">
        <Link href={`/coach/sessions/${session.id}`}>
          <ArrowLeft className="h-4 w-4" /> Back to session
        </Link>
      </Button>

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">After-call notes</h1>
        <p className="text-sm text-muted-foreground">
          {session.teacher.name} · {formatDateTime(session.scheduled_at)}
        </p>
      </div>

      {/* Focus tag */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Session focus *</CardTitle>
        </CardHeader>
        <CardContent>
          <FocusTagSelector tags={focusCategories} value={focusTag} onChange={setFocusTag} />
        </CardContent>
      </Card>

      {/* Duration */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-3">
            <div className="space-y-1 flex-1">
              <Label htmlFor="duration">Call duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="180"
                placeholder="e.g. 45"
                value={durationMins}
                onChange={(e) => setDurationMins(e.target.value)}
                className="w-32"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-5">
              Duration auto-updated when Google Meet data is available
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Session notes *</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="discussed">What was discussed</Label>
            <Textarea
              id="discussed"
              placeholder="Key topics covered in this session…"
              value={whatDiscussed}
              onChange={(e) => setWhatDiscussed(e.target.value)}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="decided">What was decided</Label>
            <Textarea
              id="decided"
              placeholder="Decisions made, teaching practice to try…"
              value={whatDecided}
              onChange={(e) => setWhatDecided(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="qualitative">Qualitative observations (optional)</Label>
            <Textarea
              id="qualitative"
              placeholder="Tone, engagement, confidence level…"
              value={qualitative}
              onChange={(e) => setQualitative(e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action steps */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <ActionStepInput value={actionSteps} onChange={setActionSteps} />
        </CardContent>
      </Card>

      {/* WhatsApp summary */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">WhatsApp summary (Hindi)</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={generateAIDraft}
              disabled={aiLoading}
              className="gap-2"
            >
              {aiLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {aiLoading ? 'Generating…' : 'Generate AI draft'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <WhatsAppDraftBox
            draft={whatsappDraft}
            onDraftChange={setWhatsappDraft}
            isAIGenerated={aiUsed}
            teacherPhone={session.teacher.phone}
          />
        </CardContent>
      </Card>

      {/* Save buttons */}
      <div className="flex gap-3 pb-8">
        <Button
          onClick={() => handleSave(false)}
          variant="outline"
          disabled={saving}
          className="gap-2"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save draft
        </Button>
        <Button
          onClick={() => handleSave(true)}
          disabled={saving}
          className="gap-2"
        >
          {saved ? <CheckCircle2 className="h-4 w-4" /> : null}
          Save & close session
        </Button>
      </div>
    </div>
  )
}
