import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { protocol_ratings, checklist_items_done } = body

  const { data, error } = await supabase
    .from('vba_sessions')
    .update({
      status: 'completed',
      protocol_ratings: protocol_ratings ?? {},
      checklist_items_done: checklist_items_done ?? [],
    })
    .eq('id', id)
    .eq('coach_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ session: data })
}
