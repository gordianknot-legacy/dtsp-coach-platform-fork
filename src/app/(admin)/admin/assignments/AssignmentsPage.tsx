'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Users, ChevronRight } from 'lucide-react'

interface Coach {
  id: string
  name: string
  cohort_id: string | null
}

interface Teacher {
  id: string
  name: string
  school_name: string
  block_tag: string | null
  cohort_id: string
  assignments: { coach_id: string; is_active: boolean }[]
}

interface AssignmentsPageProps {
  coaches: Coach[]
  teachers: Teacher[]
}

export function AssignmentsPage({ coaches, teachers }: AssignmentsPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedCoach, setSelectedCoach] = useState<string>('')
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const selectedCoachData = coaches.find((c) => c.id === selectedCoach)
  const unassignedTeachers = teachers.filter(
    (t) => !t.assignments.some((a) => a.is_active)
  )
  const coachTeachers = selectedCoach
    ? teachers.filter((t) => t.assignments.some((a) => a.coach_id === selectedCoach && a.is_active))
    : []

  function toggleTeacher(id: string) {
    setSelectedTeachers((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
  }

  async function handleAssign() {
    if (!selectedCoach || selectedTeachers.length === 0) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coach_id: selectedCoach, teacher_ids: selectedTeachers }),
      })
      if (!res.ok) throw new Error()
      toast({ title: `${selectedTeachers.length} teachers assigned to ${selectedCoachData?.name}` })
      setSelectedTeachers([])
      router.refresh()
    } catch {
      toast({ title: 'Assignment failed', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Assignments</h1>
        <p className="text-sm text-muted-foreground">
          {unassignedTeachers.length} unassigned teachers · {teachers.length} total
        </p>
      </div>

      {/* Coach selector */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Select coach to assign to:</p>
            <Select value={selectedCoach} onValueChange={setSelectedCoach}>
              <SelectTrigger className="max-w-sm">
                <SelectValue placeholder="Select coach…" />
              </SelectTrigger>
              <SelectContent>
                {coaches.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Unassigned teachers */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Unassigned teachers ({unassignedTeachers.length})</CardTitle>
          </CardHeader>
          <CardContent className="pb-4 space-y-1 max-h-96 overflow-y-auto">
            {unassignedTeachers.length === 0 ? (
              <p className="text-sm text-muted-foreground">All teachers are assigned.</p>
            ) : (
              unassignedTeachers.map((t) => (
                <div
                  key={t.id}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                    selectedTeachers.includes(t.id)
                      ? 'bg-primary/10 border border-primary/30'
                      : 'hover:bg-muted/40'
                  }`}
                  onClick={() => toggleTeacher(t.id)}
                >
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    selectedTeachers.includes(t.id) ? 'border-primary bg-primary' : 'border-muted-foreground'
                  }`}>
                    {selectedTeachers.includes(t.id) && (
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                        <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {t.school_name}{t.block_tag && ` · ${t.block_tag}`}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Current coach assignments */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              {selectedCoachData ? `${selectedCoachData.name}'s teachers (${coachTeachers.length})` : 'Select a coach'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4 space-y-1 max-h-96 overflow-y-auto">
            {coachTeachers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No teachers assigned yet.</p>
            ) : (
              coachTeachers.map((t) => (
                <div key={t.id} className="flex items-center gap-2 p-2">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{t.school_name}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Assign button */}
      {selectedTeachers.length > 0 && selectedCoach && (
        <div className="flex items-center gap-3">
          <Button onClick={handleAssign} disabled={loading} className="gap-2">
            <ChevronRight className="h-4 w-4" />
            {loading ? 'Assigning…' : `Assign ${selectedTeachers.length} teachers to ${selectedCoachData?.name}`}
          </Button>
          <Button variant="ghost" onClick={() => setSelectedTeachers([])}>Clear selection</Button>
        </div>
      )}
    </div>
  )
}
