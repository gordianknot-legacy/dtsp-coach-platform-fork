'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Leadership Snapshot</h1>
          <p className="text-sm text-muted-foreground">Last 30 days · All coaches</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard label="Coaches active" value={coachCount} />
        <KPICard label="Sessions completed" value={completedSessions} />
        <KPICard label="No-shows" value={noShows} trend={noShows > 10 ? 'down' : 'neutral'} />
        <KPICard label="Open escalations" value={openEscalations} trend={openEscalations > 5 ? 'down' : 'neutral'} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* RYG distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Teacher RYG distribution</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rygChartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {rygChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Focus distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Focus area distribution</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            {focusData.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sessions with focus tags yet.</p>
            ) : (
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={focusData} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(240 5.9% 10%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Coach breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Coach breakdown</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium text-muted-foreground">Coach</th>
                <th className="text-right py-2 font-medium text-muted-foreground">Completed</th>
                <th className="text-right py-2 font-medium text-muted-foreground">No-shows</th>
                <th className="text-right py-2 font-medium text-muted-foreground">Escalations</th>
              </tr>
            </thead>
            <tbody>
              {coaches.sort((a, b) => b.openEsc - a.openEsc).map((coach) => (
                <tr key={coach.id} className="border-b border-muted">
                  <td className="py-2">{coach.name}</td>
                  <td className="py-2 text-right text-green-700">{coach.completed}</td>
                  <td className="py-2 text-right text-red-700">{coach.noShows}</td>
                  <td className="py-2 text-right">
                    {coach.openEsc > 0 ? (
                      <span className="text-red-700 font-medium">{coach.openEsc}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
