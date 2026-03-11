'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/lib/supabase/types'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const ROLES: { role: UserRole; label: string; description: string }[] = [
  { role: 'coach', label: 'Coach', description: 'Manage sessions and track teacher progress' },
  { role: 'cm', label: 'Cluster Manager', description: 'Oversee coaches and handle escalations' },
  { role: 'admin', label: 'Administrator', description: 'Configure org, users, rosters, and standards' },
  { role: 'observer', label: 'Observer', description: 'View program metrics and snapshots' },
]

const ROLE_HOME: Record<UserRole, string> = {
  coach: '/coach',
  cm: '/cm',
  admin: '/admin',
  observer: '/observer',
}

export default function RoleSelectPage() {
  const router = useRouter()
  const [switching, setSwitching] = useState<UserRole | null>(null)
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    async function fetchProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, name')
        .eq('id', user.id)
        .single()
      if (profile) {
        setCurrentRole(profile.role as UserRole)
        setUserName(profile.name)
      }
    }
    fetchProfile()
  }, [router])

  async function selectRole(role: UserRole) {
    setSwitching(role)
    try {
      const res = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })
      if (res.ok) {
        window.location.href = ROLE_HOME[role]
      } else {
        setSwitching(null)
      }
    } catch {
      setSwitching(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <h1 className="text-lg font-semibold">
            {userName ? `Welcome, ${userName}` : 'Select role'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Choose how you want to use the platform.
          </p>
        </div>

        <div className="space-y-2">
          {ROLES.map(({ role, label, description }) => {
            const isActive = currentRole === role
            const isLoading = switching === role
            const isDisabled = switching !== null && switching !== role

            return (
              <button
                key={role}
                onClick={() => selectRole(role)}
                disabled={switching !== null}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors',
                  isActive
                    ? 'border-foreground bg-foreground/[0.03]'
                    : 'border-border hover:border-foreground/20 hover:bg-muted/50',
                  isDisabled && 'opacity-40 pointer-events-none'
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                </div>
                {isLoading && (
                  <span className="text-xs text-muted-foreground animate-pulse shrink-0">...</span>
                )}
                {isActive && !isLoading && (
                  <Check className="h-4 w-4 text-foreground shrink-0" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
