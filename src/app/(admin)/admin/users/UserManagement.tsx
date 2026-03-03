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
import { Plus, UserCog } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface User {
  id: string
  name: string
  role: string
  phone: string | null
  cohort_id: string | null
  created_at: string
}

interface Cohort {
  id: string
  name: string
  type: string
}

interface UserManagementProps {
  users: User[]
  cohorts: Cohort[]
}

export function UserManagement({ users, cohorts }: UserManagementProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [createOpen, setCreateOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('coach')
  const [cohortId, setCohortId] = useState('')
  const [loading, setLoading] = useState(false)

  const roleColors: Record<string, string> = {
    coach: 'bg-blue-100 text-blue-700',
    cm: 'bg-purple-100 text-purple-700',
    observer: 'bg-gray-100 text-gray-700',
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone: phone || null, role, cohort_id: cohortId || null }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast({ title: 'User created', description: `${name} invited via email` })
      setCreateOpen(false)
      setName(''); setEmail(''); setPhone(''); setRole('coach'); setCohortId('')
      router.refresh()
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">User Management</h1>
          <p className="text-sm text-muted-foreground">{users.length} users</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} size="sm" className="gap-2">
          <Plus className="h-4 w-4" /> Create user
        </Button>
      </div>

      <div className="space-y-2">
        {users.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground text-sm">
              No users yet. Create the first coach or CM account.
            </CardContent>
          </Card>
        ) : (
          users.map((user) => (
            <Card key={user.id}>
              <CardContent className="py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <UserCog className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${roleColors[user.role] ?? 'bg-gray-100 text-gray-700'}`}>
                      {user.role}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {user.phone ?? 'No phone'}
                    {' · '}
                    {cohorts.find((c) => c.id === user.cohort_id)?.name ?? 'No cohort'}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">{formatDate(user.created_at)}</span>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Create user account</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Full name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Priya Sharma" required />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="coach@dtsp.org" required />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9876543210" />
            </div>
            <div className="space-y-2">
              <Label>Role *</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="coach">Coach</SelectItem>
                  <SelectItem value="cm">Cluster Manager</SelectItem>
                  <SelectItem value="observer">Observer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cohort</Label>
              <Select value={cohortId} onValueChange={setCohortId}>
                <SelectTrigger><SelectValue placeholder="Select cohort…" /></SelectTrigger>
                <SelectContent>
                  {cohorts.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!name || !email || loading}>
                {loading ? 'Creating…' : 'Create & invite'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
