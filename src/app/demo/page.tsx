'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { KPICard } from '@/components/shared/KPICard'
import { RYGBadge } from '@/components/shared/RYGBadge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Video, Phone, CheckCircle2, AlertCircle, XCircle,
  Users, Bell, BarChart2, Upload, Settings, GraduationCap,
  UserCog, ArrowRight, Plus, ClipboardList, TrendingUp,
  CalendarDays, ChevronRight,
} from 'lucide-react'

// ─── shared mock nav ──────────────────────────────────────────────────────────
function DemoTopNav({ role, name }: { role: string; name: string }) {
  const navMap: Record<string, { label: string; href: string }[]> = {
    coach:    [{ label: 'Home', href: '#' }, { label: 'Teachers', href: '#' }],
    cm:       [{ label: 'Home', href: '#' }, { label: 'Coaches', href: '#' }, { label: 'Snapshot', href: '#' }],
    admin:    [{ label: 'Home', href: '#' }, { label: 'Org', href: '#' }, { label: 'Users', href: '#' }, { label: 'Rosters', href: '#' }, { label: 'Standards', href: '#' }],
    observer: [{ label: 'Snapshot', href: '#' }],
  }
  const roleLabel: Record<string, string> = { coach: 'Coach', cm: 'Cluster Manager', admin: 'Admin', observer: 'Observer' }
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase()

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="flex h-14 items-center px-4 gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">D</div>
          <span className="font-semibold text-sm hidden sm:block">DTSP</span>
        </div>
        <Separator orientation="vertical" className="h-5" />
        <nav className="flex items-center gap-1 flex-1">
          {(navMap[role] ?? []).map((item, i) => (
            <span key={item.label} className={`px-3 py-1.5 rounded-md text-sm font-medium ${i === 0 ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground'}`}>
              {item.label}
            </span>
          ))}
        </nav>
        <div className="flex items-center gap-2 shrink-0">
          {role === 'cm' && (
            <div className="relative">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-destructive text-destructive-foreground text-[9px] flex items-center justify-center font-bold">2</span>
            </div>
          )}
          <Avatar className="h-7 w-7"><AvatarFallback className="text-xs">{initials}</AvatarFallback></Avatar>
          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-medium leading-none">{name}</span>
            <span className="text-[10px] text-muted-foreground leading-none mt-0.5">{roleLabel[role]}</span>
          </div>
        </div>
      </div>
    </header>
  )
}

// ─── coach view ───────────────────────────────────────────────────────────────
const MOCK_SESSIONS = [
  { id: '1', time: '09:00', teacher: 'Sunita Devi', school: 'GPS Malihabad · Malihabad', ryg: 'Y' as const, channel: 'google_meet', status: 'confirmed', statusLabel: 'Confirmed', statusColor: 'bg-green-50 text-green-700', conf: 'confirmed' },
  { id: '2', time: '11:00', teacher: 'Ramesh Kumar', school: 'GPS Bakshi Ka Talab · BKT', ryg: 'R' as const, channel: 'phone', status: 'scheduled', statusLabel: 'Scheduled', statusColor: 'bg-blue-50 text-blue-700', conf: 'pending' },
  { id: '3', time: '14:30', teacher: 'Meena Gupta', school: 'GPS Chinhat · Chinhat', ryg: 'G' as const, channel: 'google_meet', status: 'scheduled', statusLabel: 'Scheduled', statusColor: 'bg-blue-50 text-blue-700', conf: 'pending' },
  { id: '4', time: '16:00', teacher: 'Anjali Singh', school: 'GPS Amausi · Amausi', ryg: null, channel: 'phone', status: 'scheduled', statusLabel: 'Scheduled', statusColor: 'bg-blue-50 text-blue-700', conf: 'no_response' },
]

function SessionCard({ s }: { s: typeof MOCK_SESSIONS[0] }) {
  const Icon = s.channel === 'google_meet' ? Video : Phone
  const ConfIcon = s.conf === 'confirmed' ? CheckCircle2 : s.conf === 'no_response' ? XCircle : AlertCircle
  const confColor = s.conf === 'confirmed' ? 'text-green-600' : s.conf === 'no_response' ? 'text-red-500' : 'text-muted-foreground'
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/40 transition-colors cursor-pointer">
      <div className="w-16 shrink-0 text-right">
        <p className="text-sm font-medium">{s.time}</p>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{s.teacher}</span>
          {s.ryg && <RYGBadge status={s.ryg} showLabel={false} />}
        </div>
        <p className="text-xs text-muted-foreground">{s.school}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <ConfIcon className={`h-3.5 w-3.5 ${confColor}`} />
        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${s.statusColor}`}>{s.statusLabel}</span>
      </div>
    </div>
  )
}

function CoachView() {
  return (
    <div className="space-y-4">
      {/* Due action banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-3">
        <AlertCircle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-yellow-800">1 pending action from previous sessions</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-yellow-700">Sunita Devi — Notes not completed</span>
            <span className="text-xs font-medium text-yellow-700 cursor-pointer hover:underline">Complete</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">My Sessions</h1>
          <p className="text-sm text-muted-foreground">Monday, 3 March 2026</p>
        </div>
        <Button size="sm" className="gap-2"><Plus className="h-4 w-4" />Schedule</Button>
      </div>

      <Tabs defaultValue="today">
        <TabsList>
          <TabsTrigger value="today">Today (4)</TabsTrigger>
          <TabsTrigger value="tomorrow">Tomorrow</TabsTrigger>
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="calendar"><CalendarDays className="h-3.5 w-3.5 mr-1" />Calendar</TabsTrigger>
        </TabsList>
        <TabsContent value="today" className="space-y-2 mt-4">
          {MOCK_SESSIONS.map(s => <SessionCard key={s.id} s={s} />)}
        </TabsContent>
        <TabsContent value="tomorrow" className="mt-4">
          <div className="text-center py-10 text-muted-foreground text-sm">No sessions tomorrow.</div>
        </TabsContent>
        <TabsContent value="week" className="space-y-2 mt-4">
          {MOCK_SESSIONS.map(s => <SessionCard key={s.id} s={s} />)}
        </TabsContent>
        <TabsContent value="calendar" className="mt-4">
          <div className="h-48 rounded-lg border bg-muted/20 flex items-center justify-center text-sm text-muted-foreground">
            Calendar view — colour-coded by session load
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ─── CM view ──────────────────────────────────────────────────────────────────
const MOCK_COACHES = [
  { name: 'Priya Sharma', completed: 18, noShows: 2, openEsc: 1, ryg: { G: 12, Y: 8, R: 4 }, trend: '+2 vs last week' },
  { name: 'Arjun Mehta', completed: 14, noShows: 5, openEsc: 2, ryg: { G: 8, Y: 10, R: 6 }, trend: '-3 vs last week' },
  { name: 'Deepa Nair', completed: 22, noShows: 1, openEsc: 0, ryg: { G: 18, Y: 8, R: 2 }, trend: '+5 vs last week' },
]

function CMView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Cluster Overview</h1>
        <p className="text-sm text-muted-foreground">Cohort Alpha · 3 coaches · 108 teachers</p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard label="Sessions (30d)" value="54" trend="+8 vs prev" trendPositive />
        <KPICard label="No-show rate" value="7.4%" trend="-1.2pp" trendPositive />
        <KPICard label="Open escalations" value="3" trend="2 new" trendPositive={false} />
        <KPICard label="RYG — Red" value="10" trend="-2 this week" trendPositive />
      </div>

      {/* Coach triage cards */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Coach Triage</h2>
        {MOCK_COACHES.map(c => (
          <Card key={c.name} className="cursor-pointer hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8"><AvatarFallback className="text-xs">{c.name.split(' ').map(w=>w[0]).join('')}</AvatarFallback></Avatar>
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.trend}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="text-center"><p className="font-semibold">{c.completed}</p><p className="text-muted-foreground">done</p></div>
                  <div className="text-center"><p className="font-semibold">{c.noShows}</p><p className="text-muted-foreground">no-show</p></div>
                  {c.openEsc > 0 && <Badge variant="destructive" className="text-[10px]">{c.openEsc} esc</Badge>}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 bg-gray-100 rounded-full h-2 flex overflow-hidden">
                  <div className="bg-green-500 h-full" style={{ width: `${(c.ryg.G / 28) * 100}%` }} />
                  <div className="bg-yellow-400 h-full" style={{ width: `${(c.ryg.Y / 28) * 100}%` }} />
                  <div className="bg-red-500 h-full" style={{ width: `${(c.ryg.R / 28) * 100}%` }} />
                </div>
                <span className="text-xs text-muted-foreground shrink-0">G{c.ryg.G} Y{c.ryg.Y} R{c.ryg.R}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Escalations */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Open Escalations</h2>
        {[
          { coach: 'Priya Sharma', teacher: 'Sunita Devi', reason: '3 reschedules in 2 weeks', age: '3 days ago' },
          { coach: 'Arjun Mehta',  teacher: 'Ravi Shankar', reason: 'VBA overdue >14 days',   age: '1 day ago' },
        ].map(e => (
          <div key={e.teacher} className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-lg">
            <div>
              <p className="text-sm font-medium text-red-900">{e.teacher} <span className="font-normal text-red-700">via {e.coach}</span></p>
              <p className="text-xs text-red-600">{e.reason} · {e.age}</p>
            </div>
            <Button size="sm" variant="outline" className="text-xs h-7">Resolve</Button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── admin view ───────────────────────────────────────────────────────────────
function AdminView() {
  const links = [
    { href: '#', icon: Settings,      label: 'Org Setup',            description: 'Configure state → district → cohort hierarchy' },
    { href: '#', icon: UserCog,       label: 'User Management',      description: 'Create coach and CM accounts, assign roles' },
    { href: '#', icon: Upload,        label: 'Roster Import',        description: 'Upload teacher CSV with UDISE codes' },
    { href: '#', icon: Users,         label: 'Assignments',          description: 'Assign teachers to coaches' },
    { href: '#', icon: GraduationCap, label: 'Standards & Templates', description: 'Edit rubrics, focus categories, thresholds' },
  ]
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">DTSP UP Alpha · Cohort Alpha</p>
      </div>

      {/* Setup warnings */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-1.5">
        <p className="text-sm font-semibold text-amber-900 flex items-center gap-2"><AlertCircle className="h-4 w-4" />Setup checklist</p>
        {['Run SQL migration in Supabase', 'Add coach accounts in User Management', 'Import teacher roster CSV'].map(w => (
          <div key={w} className="flex items-center gap-2 text-xs text-amber-800">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            {w}
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {links.map(({ icon: Icon, label, description }) => (
          <div key={label} className="flex items-start gap-3 p-4 rounded-xl border hover:shadow-sm transition-shadow cursor-pointer bg-card">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">{label}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Standards preview */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Active Standards (Cohort Alpha)</CardTitle></CardHeader>
        <CardContent className="text-xs space-y-1.5">
          {[
            ['reschedule_threshold', '3'],
            ['vba_frequency_weeks', '4'],
            ['session_frequency_weeks', '1'],
            ['focus_categories', 'Literacy, Numeracy, Relationship, Off-script'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between py-1 border-b last:border-0">
              <span className="text-muted-foreground font-mono">{k}</span>
              <span className="font-medium">{v}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── observer view ────────────────────────────────────────────────────────────
function ObserverView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">State Snapshot</h1>
        <p className="text-sm text-muted-foreground">Uttar Pradesh · All cohorts · Last 30 days</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard label="Total coaches" value="25" />
        <KPICard label="Teachers tracked" value="892" />
        <KPICard label="Sessions (30d)" value="412" trend="+34 vs prev" trendPositive />
        <KPICard label="Open escalations" value="11" trend="+3" trendPositive={false} />
      </div>

      {/* RYG distribution */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Teacher RYG Distribution</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { label: 'Green', count: 487, pct: 55, color: 'bg-green-500' },
              { label: 'Yellow', count: 281, pct: 31, color: 'bg-yellow-400' },
              { label: 'Red', count: 124, pct: 14, color: 'bg-red-500' },
            ].map(r => (
              <div key={r.label} className="flex items-center gap-3">
                <span className="text-xs w-12 text-muted-foreground">{r.label}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div className={`${r.color} h-full rounded-full`} style={{ width: `${r.pct}%` }} />
                </div>
                <span className="text-xs font-medium w-8 text-right">{r.count}</span>
                <span className="text-xs text-muted-foreground w-8">{r.pct}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cohort table */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">By Cohort</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground border-b">
                <th className="text-left pb-2 font-medium">Cohort</th>
                <th className="text-right pb-2 font-medium">Coaches</th>
                <th className="text-right pb-2 font-medium">Sessions</th>
                <th className="text-right pb-2 font-medium">No-show%</th>
                <th className="text-right pb-2 font-medium">Escalations</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {[
                { name: 'Cohort Alpha',   coaches: 8,  sessions: 142, noShow: '6.3%', esc: 3 },
                { name: 'Cohort Beta',    coaches: 9,  sessions: 158, noShow: '8.1%', esc: 5 },
                { name: 'Cohort Gamma',   coaches: 8,  sessions: 112, noShow: '11.2%', esc: 3 },
              ].map(c => (
                <tr key={c.name}>
                  <td className="py-1.5 font-medium">{c.name}</td>
                  <td className="py-1.5 text-right">{c.coaches}</td>
                  <td className="py-1.5 text-right">{c.sessions}</td>
                  <td className="py-1.5 text-right">{c.noShow}</td>
                  <td className="py-1.5 text-right">{c.esc > 0 ? <span className="text-red-600 font-semibold">{c.esc}</span> : c.esc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── page ─────────────────────────────────────────────────────────────────────
const ROLES = [
  { key: 'coach',    label: 'Coach',           name: 'Priya Sharma',   color: 'bg-blue-600',    badge: 'bg-blue-100 text-blue-800' },
  { key: 'cm',       label: 'Cluster Manager', name: 'Rahul Verma',    color: 'bg-emerald-600', badge: 'bg-emerald-100 text-emerald-800' },
  { key: 'admin',    label: 'Admin',           name: 'Admin User',     color: 'bg-violet-600',  badge: 'bg-violet-100 text-violet-800' },
  { key: 'observer', label: 'Observer',        name: 'State Observer', color: 'bg-amber-600',   badge: 'bg-amber-100 text-amber-800' },
]

export default function DemoPage() {
  const [activeRole, setActiveRole] = useState('coach')
  const current = ROLES.find(r => r.key === activeRole)!

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Demo banner */}
      <div className="bg-gray-900 text-white text-xs flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Demo · No login required</span>
          <span className="text-gray-600">·</span>
          <span className={`px-2 py-0.5 rounded-full text-white text-[11px] font-medium ${current.color}`}>
            {current.label}
          </span>
        </div>
        <span className="text-gray-400 text-[11px]">DTSP Coach Platform · Alpha</span>
      </div>

      {/* Role switcher */}
      <div className="border-b bg-muted/30 px-4 py-2 flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground mr-1">View as:</span>
        {ROLES.map(r => (
          <button
            key={r.key}
            onClick={() => setActiveRole(r.key)}
            className={`text-xs px-3 py-1 rounded-full font-medium border transition-all ${
              activeRole === r.key
                ? `${r.color} text-white border-transparent`
                : 'bg-background text-muted-foreground border-gray-200 hover:border-gray-400'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Simulated top nav */}
      <DemoTopNav role={activeRole} name={current.name} />

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl">
        {activeRole === 'coach'    && <CoachView />}
        {activeRole === 'cm'       && <CMView />}
        {activeRole === 'admin'    && <AdminView />}
        {activeRole === 'observer' && <ObserverView />}
      </main>
    </div>
  )
}
