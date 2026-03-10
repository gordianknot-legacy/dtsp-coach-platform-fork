import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, GraduationCap, Settings, Upload, UserCog, AlertCircle, ChevronRight } from 'lucide-react'


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
  if ((orgCount.count ?? 0) === 0) warnings.push('No org hierarchy configured — go to Org Setup')
  if ((coachCount.count ?? 0) === 0) warnings.push('No coach accounts created — go to User Management')
  if ((teacherCount.count ?? 0) === 0) warnings.push('No teachers imported — go to Roster Import')
  if ((standardsExist.count ?? 0) === 0) warnings.push('No rubrics configured — go to Standards & Templates')

  const quickLinks = [
    { href: '/admin/org', icon: Settings, label: 'Org Setup', description: 'Configure hierarchy, add cohorts', color: 'bg-blue-500/10 text-blue-600' },
    { href: '/admin/users', icon: UserCog, label: 'User Management', description: 'Create coach and CM accounts', color: 'bg-violet-500/10 text-violet-600' },
    { href: '/admin/rosters', icon: Upload, label: 'Roster Import', description: 'Upload teacher CSV', color: 'bg-emerald-500/10 text-emerald-600' },
    { href: '/admin/assignments', icon: Users, label: 'Assignments', description: 'Assign teachers to coaches', color: 'bg-amber-500/10 text-amber-600' },
    { href: '/admin/standards', icon: GraduationCap, label: 'Standards & Templates', description: 'Configure rubrics, focus categories', color: 'bg-rose-500/10 text-rose-600' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">DTSP Coach Platform configuration</p>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="rounded-xl bg-amber-50 border border-amber-200/60 p-5">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <AlertCircle className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-sm font-semibold text-amber-800">
              Setup incomplete ({warnings.length} item{warnings.length !== 1 ? 's' : ''})
            </p>
          </div>
          <ul className="space-y-1.5 ml-[42px]">
            {warnings.map((w) => (
              <li key={w} className="text-sm text-amber-700 leading-relaxed">{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Coaches', value: coachCount.count ?? 0 },
          { label: 'Active Teachers', value: teacherCount.count ?? 0 },
          { label: 'Org Units', value: orgCount.count ?? 0 },
          { label: 'Rubrics', value: standardsExist.count ?? 0 },
        ].map((stat) => (
          <Card key={stat.label} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-5 pb-5 text-center">
              <p className="text-3xl font-bold tabular-nums">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1.5 font-medium">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="group hover:shadow-md hover:border-primary/15 hover:-translate-y-px transition-all duration-200 cursor-pointer">
                <CardContent className="pt-5 pb-5 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl ${link.color} flex items-center justify-center shrink-0`}>
                    <link.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold group-hover:text-primary transition-colors">{link.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{link.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary/50 transition-colors shrink-0" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
