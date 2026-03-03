import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { status, resolution_category, resolution_notes } = body

  const updates: Record<string, unknown> = {}
  if (status) updates.status = status
  if (resolution_category) updates.resolution_category = resolution_category
  if (resolution_notes) updates.resolution_notes = resolution_notes
  if (status === 'resolved' || status === 'closed') {
    updates.actioned_by = user.id
    updates.actioned_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('escalations')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ escalation: data })
}
