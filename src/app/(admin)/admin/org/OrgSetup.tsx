'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Plus, Building2, Globe, MapPin } from 'lucide-react'

interface OrgUnit {
  id: string
  name: string
  type: 'state' | 'district' | 'cohort'
  parent_id: string | null
}

const TYPE_ICONS = {
  state: Globe,
  district: Building2,
  cohort: MapPin,
}

const TYPE_COLORS = {
  state: 'bg-blue-100 text-blue-700',
  district: 'bg-purple-100 text-purple-700',
  cohort: 'bg-green-100 text-green-700',
}

export function OrgSetup({ orgUnits }: { orgUnits: OrgUnit[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [createOpen, setCreateOpen] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState<'state' | 'district' | 'cohort'>('cohort')
  const [parentId, setParentId] = useState('')
  const [loading, setLoading] = useState(false)

  const parents = orgUnits.filter((u) =>
    type === 'district' ? u.type === 'state' : type === 'cohort' ? u.type === 'district' : false
  )

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/admin/org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type, parent_id: parentId || null }),
      })
      if (!res.ok) throw new Error()
      toast({ title: `${type} created: ${name}` })
      setCreateOpen(false)
      setName(''); setType('cohort'); setParentId('')
      router.refresh()
    } catch {
      toast({ title: 'Creation failed', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  // Group by type
  const byType = {
    state: orgUnits.filter((u) => u.type === 'state'),
    district: orgUnits.filter((u) => u.type === 'district'),
    cohort: orgUnits.filter((u) => u.type === 'cohort'),
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Org Setup</h1>
          <p className="text-sm text-muted-foreground">State → District → Cohort hierarchy</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} size="sm" className="gap-2">
          <Plus className="h-4 w-4" /> Add unit
        </Button>
      </div>

      {/* Hierarchy display */}
      {(['state', 'district', 'cohort'] as const).map((type) => (
        <Card key={type}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm capitalize flex items-center gap-2">
              {(() => { const Icon = TYPE_ICONS[type]; return <Icon className="h-4 w-4" /> })()}
              {type}s ({byType[type].length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            {byType[type].length === 0 ? (
              <p className="text-sm text-muted-foreground">None created yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {byType[type].map((unit) => {
                  const parent = orgUnits.find((u) => u.id === unit.parent_id)
                  return (
                    <div key={unit.id} className="flex items-center gap-1.5 text-sm">
                      <Badge variant="outline" className={TYPE_COLORS[type]}>{unit.name}</Badge>
                      {parent && <span className="text-xs text-muted-foreground">in {parent.name}</span>}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Add org unit</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="state">State</SelectItem>
                  <SelectItem value="district">District</SelectItem>
                  <SelectItem value="cohort">Cohort</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={`${type} name`} required />
            </div>
            {parents.length > 0 && (
              <div className="space-y-2">
                <Label>Parent {type === 'district' ? 'State' : 'District'}</Label>
                <Select value={parentId} onValueChange={setParentId}>
                  <SelectTrigger><SelectValue placeholder="Select parent…" /></SelectTrigger>
                  <SelectContent>
                    {parents.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!name || loading}>{loading ? 'Creating…' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
