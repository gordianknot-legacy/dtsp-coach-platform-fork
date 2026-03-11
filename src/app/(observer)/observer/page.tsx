import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EmptyState } from '@/components/shared/EmptyState'
import { Eye } from 'lucide-react'

export default async function ObserverPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">State Observer View</h1>
        <p className="text-sm text-muted-foreground mt-1">Read-only program snapshot</p>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-5 flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
          <Eye className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-blue-900">Dashboard not configured yet</p>
          <p className="text-sm text-blue-700 mt-1">
            Observer dashboard is scoped to your assigned org unit. Contact your program admin to configure access.
          </p>
        </div>
      </div>
    </div>
  )
}
