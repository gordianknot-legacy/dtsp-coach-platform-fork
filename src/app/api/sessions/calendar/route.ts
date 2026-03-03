import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

// GET /api/sessions/calendar?month=2025-03
// Returns day-level session counts for calendar color-coding
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const month = searchParams.get('month') // YYYY-MM

  let startDate: Date
  let endDate: Date

  if (month) {
    startDate = new Date(`${month}-01T00:00:00`)
    endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + 1)
  } else {
    // Default: current month
    const now = new Date()
    startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  }

  const { data, error } = await supabase
    .from('sessions')
    .select('scheduled_at, session_type, status')
    .gte('scheduled_at', startDate.toISOString())
    .lt('scheduled_at', endDate.toISOString())
    .not('status', 'in', '("cancelled")')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Aggregate by date
  const counts = new Map<string, { count: number; hasVba: boolean }>()

  for (const session of data ?? []) {
    const date = session.scheduled_at.split('T')[0]
    const existing = counts.get(date) ?? { count: 0, hasVba: false }
    counts.set(date, {
      count: existing.count + 1,
      hasVba: existing.hasVba || session.session_type === 'vba',
    })
  }

  const dayCounts = Array.from(counts.entries()).map(([date, info]) => ({
    date,
    count: info.count,
    hasVba: info.hasVba,
  }))

  return NextResponse.json({ dayCounts, start: startDate.toISOString(), end: endDate.toISOString() })
}
