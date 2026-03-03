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
  const { duration_mins } = body

  // Mark session as completed (soft close — always succeeds)
  const { data, error } = await supabase
    .from('sessions')
    .update({
      status: 'completed',
      duration_mins: duration_mins ?? null,
    })
    .eq('id', sessionId)
    .eq('coach_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Check for incomplete required fields (non-blocking — just flag)
  const { data: notes } = await supabase
    .from('session_notes')
    .select('what_discussed, focus_tag')
    .eq('session_id', sessionId)
    .single()

  const incomplete: string[] = []
  if (!notes?.what_discussed) incomplete.push('what_discussed')
  if (!data.focus_tag) incomplete.push('focus_tag')

  return NextResponse.json({
    session: data,
    incomplete_fields: incomplete,
    has_due_actions: incomplete.length > 0,
  })
}
