import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const {
    what_discussed,
    what_decided,
    teacher_practice_markers,
    qualitative_comments,
    collateral_refs,
    ai_draft_used,
    ai_draft_text,
    action_steps,
  } = body

  // Upsert session notes (one per session)
  const { data: note, error: noteError } = await supabase
    .from('session_notes')
    .upsert(
      {
        session_id: sessionId,
        what_discussed: what_discussed ?? null,
        what_decided: what_decided ?? null,
        teacher_practice_markers: teacher_practice_markers ?? {},
        qualitative_comments: qualitative_comments ?? null,
        collateral_refs: collateral_refs ?? [],
        ai_draft_used: ai_draft_used ?? false,
        ai_draft_text: ai_draft_text ?? null,
      },
      { onConflict: 'session_id' }
    )
    .select()
    .single()

  if (noteError) return NextResponse.json({ error: noteError.message }, { status: 500 })

  // Save action steps (insert new ones)
  if (action_steps && Array.isArray(action_steps) && action_steps.length > 0) {
    // Get teacher_id from session
    const { data: session } = await supabase
      .from('sessions')
      .select('teacher_id')
      .eq('id', sessionId)
      .single()

    if (session) {
      const steps = action_steps
        .filter((s: { description?: string }) => s.description?.trim())
        .map((s: { description: string; due_date?: string }) => ({
          session_id: sessionId,
          teacher_id: session.teacher_id,
          description: s.description.trim(),
          due_date: s.due_date || null,
          status: 'open',
        }))

      if (steps.length > 0) {
        await supabase.from('action_steps').insert(steps)
      }
    }
  }

  return NextResponse.json({ note }, { status: 201 })
}
