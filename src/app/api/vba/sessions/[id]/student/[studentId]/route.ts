import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

// Idempotent PATCH — auto-save per student, field-level updates only
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; studentId: string }> }
) {
  const { id: vbaSessionId, studentId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { student_name, student_number, literacy_results, numeracy_results } = body

  // Build partial update — only update fields present in payload
  const updates: Record<string, unknown> = {}
  if (student_name !== undefined) updates.student_name = student_name
  if (student_number !== undefined) updates.student_number = student_number
  if (literacy_results !== undefined) updates.literacy_results = literacy_results
  if (numeracy_results !== undefined) updates.numeracy_results = numeracy_results

  // Upsert by vba_session_id + student_number
  const { data, error } = await supabase
    .from('vba_student_results')
    .upsert(
      {
        vba_session_id: vbaSessionId,
        student_number: student_number ?? parseInt(studentId, 10),
        student_name: student_name ?? '',
        ...updates,
      },
      { onConflict: 'vba_session_id,student_number' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ result: data })
}
