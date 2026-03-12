import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { RYGBadge } from '@/components/shared/RYGBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { Users } from 'lucide-react'
import type { RYGStatus } from '@/lib/supabase/types'


export const metadata = { title: 'My Teachers — DTSP' }

export default async function TeachersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: assignments } = await supabase
    .from('assignments')
    .select(`
      teacher:teachers(
        id, name, school_name, block_tag, designation, phone,
        ryg:teacher_ryg(status, set_at)
      )
    `)
    .eq('coach_id', user.id)
    .eq('is_active', true)

  const teachers = (assignments ?? []).map((a: any) => {
    const t = a.teacher
    const latestRyg = t.ryg?.sort(
      (x: any, y: any) => new Date(y.set_at).getTime() - new Date(x.set_at).getTime()
    )[0]
    return { ...t, rygStatus: latestRyg?.status ?? null }
  })

  const rygOrder: Record<string, number> = { R: 0, Y: 1, G: 2 }
  const sorted = [...teachers].sort((a: any, b: any) => {
    const ra = rygOrder[a.rygStatus] ?? 3
    const rb = rygOrder[b.rygStatus] ?? 3
    return ra - rb || a.name.localeCompare(b.name)
  })

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold">My Teachers</h1>
        <p className="text-sm text-muted-foreground">{sorted.length} assigned</p>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon={<Users className="h-7 w-7" />}
          title="No teachers assigned yet"
          description="Contact your admin to get teachers assigned."
        />
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border">
          {sorted.map((teacher: any) => (
            <Link
              key={teacher.id}
              href={`/coach/teachers/${teacher.id}`}
              className="flex items-center gap-3 px-3 py-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{teacher.name}</span>
                  {teacher.rygStatus && (
                    <RYGBadge status={teacher.rygStatus as RYGStatus} showLabel={false} />
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {teacher.school_name}
                  {teacher.block_tag && ` · ${teacher.block_tag}`}
                  {teacher.designation && ` · ${teacher.designation}`}
                </p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{teacher.phone}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
