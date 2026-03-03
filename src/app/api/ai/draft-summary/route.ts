import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { generateHindiSummary } from '@/lib/ai/openrouter'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const {
    teacher_name,
    session_date,
    focus_tag,
    what_discussed,
    what_decided,
    action_steps = [],
  } = body

  if (!teacher_name || !what_discussed) {
    return NextResponse.json({ error: 'teacher_name and what_discussed required' }, { status: 400 })
  }

  try {
    const result = await generateHindiSummary({
      teacherName: teacher_name,
      sessionDate: session_date ?? new Date().toISOString(),
      focusTag: focus_tag ?? null,
      whatDiscussed: what_discussed,
      whatDecided: what_decided ?? '',
      actionSteps: action_steps,
    })

    if (result.error || !result.draft) {
      return NextResponse.json(
        { draft: null, error: result.error ?? 'Draft generation failed', available: false },
        { status: 503 }
      )
    }

    return NextResponse.json({
      draft: result.draft,
      model: result.model,
      available: true,
      quality_note: 'AI-generated — review carefully before sending',
    })
  } catch (err: any) {
    // Non-blocking: return 503 so coach UI shows blank editable field
    return NextResponse.json(
      { draft: null, error: err.message, available: false },
      { status: 503 }
    )
  }
}
