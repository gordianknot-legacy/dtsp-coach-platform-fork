'use client'

import { Button } from '@/components/ui/button'
import { KPICard } from '@/components/shared/KPICard'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Download } from 'lucide-react'

interface LeadershipSnapshotProps {
  coachCount: number
  completedSessions: number
  noShows: number
  openEscalations: number
  rygCounts: { R: number; Y: number; G: number; unset: number }
  focusDistribution: Record<string, number>
  coaches: { id: string; name: string; completed: number; noShows: number; openEsc: number }[]
}

export function LeadershipSnapshot({
  coachCount, completedSessions, noShows, openEscalations, rygCounts, focusDistribution, coaches
}: LeadershipSnapshotProps) {
  function exportCSV() {
    const rows = [
      ['Metric', 'Value'],
      ['Coaches', coachCount],
      ['Completed sessions (30d)', completedSessions],
      ['No-shows (30d)', noShows],
      ['Open escalations', openEscalations],
      ['Teachers - Green', rygCounts.G],
      ['Teachers - Yellow', rygCounts.Y],
      ['Teachers - Red', rygCounts.R],
      [],
      ['Coach', 'Completed', 'No-shows', 'Escalations'],
      ...coaches.map((c) => [c.name, c.completed, c.noShows, c.openEsc]),
    ]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dtsp_snapshot_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const focusData = Object.entries(focusDistribution).map(([name, value]) => ({ name, value }))
  const rygChartData = [
    { name: 'Green', value: rygCounts.G, color: '#16a34a' },
    { name: 'Yellow', value: rygCounts.Y, color: '#ca8a04' },
    { name: 'Red', value: rygCounts.R, color: '#dc2626' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leadership Snapshot</h1>
          <p className="text-sm text-muted-foreground mt-1">Last 30 days</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Coaches active" value={coachCount} accent="blue" />
        <KPICard label="Sessions completed" value={completedSessions} accent="green" />
        <KPICard label="No-shows" value={noShows} accent="amber" trend={noShows > 10 ? 'down' : 'neutral'} />
        <KPICard label="Open escalations" value={openEscalations} accent="red" trend={openEscalations > 5 ? 'down' : 'neutral'} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* RYG distribution */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-semibold mb-4">Teacher RYG distribution</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rygChartData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {rygChartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Focus distribution */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-semibold mb-4">Focus area distribution</p>
          {focusData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sessions with focus tags yet.</p>
          ) : (
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={focusData} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(221 83% 53%)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Coach breakdown */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-3">Coach breakdown</p>
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Coach</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Completed</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">No-shows</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Escalations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {coaches.sort((a, b) => b.openEsc - a.openEsc).map((coach) => (
                <tr key={coach.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium">{coach.name}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-emerald-600">{coach.completed}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-red-600">{coach.noShows}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {coach.openEsc > 0 ? (
                      <span className="text-red-600 font-semibold">{coach.openEsc}</span>
                    ) : (
                      <span className="text-muted-foreground">&mdash;</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
