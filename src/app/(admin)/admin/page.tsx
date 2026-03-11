import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, GraduationCap, Settings, Upload, UserCog, ChevronRight } from 'lucide-react'


export default async function AdminHome() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [coachCount, teacherCount, orgCount, standardsExist] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'coach'),
    supabase.from('teachers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('org_units').select('*', { count: 'exact', head: true }),
    supabase.from('session_templates').select('id', { count: 'exact', head: true }),
  ])

  const warnings: string[] = []
  if ((orgCount.count ?? 0) === 0) warnings.push('No org hierarchy — set up in Org')
  if ((coachCount.count ?? 0) === 0) warnings.push('No coaches — create in Users')
  if ((teacherCount.count ?? 0) === 0) warnings.push('No teachers — import in Rosters')
  if ((standardsExist.count ?? 0) === 0) warnings.push('No rubrics — configure in Standards')

  const stats = [
    { label: 'Coaches', value: coachCount.count ?? 0 },
    { label: 'Teachers', value: teacherCount.count ?? 0 },
    { label: 'Org Units', value: orgCount.count ?? 0 },
    { label: 'Rubrics', value: standardsExist.count ?? 0 },
  ]

  const quickLinks = [
    { href: '/admin/org', icon: Settings, label: 'Org Setup', description: 'Hierarchy and cohorts' },
    { href: '/admin/users', icon: UserCog, label: 'Users', description: 'Coach and CM accounts' },
    { href: '/admin/rosters', icon: Upload, label: 'Rosters', description: 'Teacher CSV import' },
    { href: '/admin/assignments', icon: Users, label: 'Assignments', description: 'Teacher-coach mapping' },
    { href: '/admin/standards', icon: GraduationCap, label: 'Standards', description: 'Rubrics and templates' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Admin</h1>
        <p className="text-sm text-muted-foreground">Platform configuration</p>
      </div>

      {warnings.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
          <p className="text-xs font-medium text-amber-900 mb-1">Setup incomplete</p>
          {warnings.map((w) => (
            <p key={w} className="text-xs text-amber-800">{w}</p>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border bg-card p-3 shadow-md">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="text-xl font-semibold mt-0.5 tabular-nums">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card shadow-md divide-y divide-border">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <div className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors group">
              <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                <link.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{link.label}</p>
                <p className="text-xs text-muted-foreground">{link.description}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors shrink-0" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
