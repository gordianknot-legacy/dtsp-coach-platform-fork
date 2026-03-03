import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { coach_id, commitments, spot_check_ratings } = body

  if (!coach_id) return NextResponse.json({ error: 'coach_id required' }, { status: 400 })

  const { data, error } = await supabase
    .from('cm_commitments')
    .insert({
      cm_id: user.id,
      coach_id,
      commitments: commitments ?? [],
      spot_check_ratings: spot_check_ratings ?? {},
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ commitment: data }, { status: 201 })
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const coachId = searchParams.get('coach_id')

  let query = supabase
    .from('cm_commitments')
    .select('*')
    .eq('cm_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  if (coachId) query = query.eq('coach_id', coachId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ commitments: data })
}
