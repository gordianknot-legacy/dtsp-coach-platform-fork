import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, GraduationCap, Settings, Upload, UserCog, ChevronRight, AlertTriangle } from 'lucide-react'
import { KPICard } from '@/components/shared/KPICard'


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

  const warnings: { text: string; href: string }[] = []
  if ((orgCount.count ?? 0) === 0) warnings.push({ text: 'No org hierarchy — set up in Org', href: '/admin/org' })
  if ((coachCount.count ?? 0) === 0) warnings.push({ text: 'No coaches — create in Users', href: '/admin/users' })
  if ((teacherCount.count ?? 0) === 0) warnings.push({ text: 'No teachers — import in Rosters', href: '/admin/rosters' })
  if ((standardsExist.count ?? 0) === 0) warnings.push({ text: 'No rubrics — configure in Standards', href: '/admin/standards' })

  const quickLinks = [
    { href: '/admin/org', icon: Settings, label: 'Org Setup', description: 'Hierarchy and cohorts', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
    { href: '/admin/users', icon: UserCog, label: 'Users', description: 'Coach and CM accounts', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
    { href: '/admin/rosters', icon: Upload, label: 'Rosters', description: 'Teacher CSV import', iconBg: 'bg-green-100', iconColor: 'text-green-600' },
    { href: '/admin/assignments', icon: Users, label: 'Assignments', description: 'Teacher-coach mapping', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
    { href: '/admin/standards', icon: GraduationCap, label: 'Standards', description: 'Rubrics and templates', iconBg: 'bg-rose-100', iconColor: 'text-rose-600' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform configuration</p>
      </div>

      {warnings.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <p className="text-sm font-semibold text-amber-900">Setup incomplete</p>
          </div>
          <div className="space-y-1.5 ml-6">
            {warnings.map((w) => (
              <Link key={w.href} href={w.href} className="block text-sm text-amber-800 hover:text-amber-950 hover:underline transition-colors">
                {w.text}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard label="Coaches" value={coachCount.count ?? 0} accent="blue" />
        <KPICard label="Teachers" value={teacherCount.count ?? 0} accent="green" />
        <KPICard label="Org Units" value={orgCount.count ?? 0} accent="purple" />
        <KPICard label="Rubrics" value={standardsExist.count ?? 0} accent="amber" />
      </div>

      <div>
        <p className="text-sm font-semibold text-foreground mb-3">Quick links</p>
        <div className="rounded-xl border border-border bg-card shadow-sm divide-y divide-border">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <div className="flex items-center gap-3.5 px-4 py-3.5 hover:bg-muted/50 transition-colors group">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${link.iconBg}`}>
                  <link.icon className={`h-5 w-5 ${link.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{link.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{link.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
