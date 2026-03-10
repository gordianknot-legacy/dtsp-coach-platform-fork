'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/lib/supabase/types'
import { Users, BarChart2, Settings, Eye } from 'lucide-react'

const ROLES: { role: UserRole; label: string; description: string; accent: string; icon: React.ElementType }[] = [
  { role: 'coach', label: 'Coach', description: 'Manage sessions, track teachers, and build coaching relationships', accent: 'text-blue-700 bg-blue-50 border-blue-200', icon: Users },
  { role: 'cm', label: 'Cluster Manager', description: 'Oversee coaches, review escalations, and monitor cluster health', accent: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: BarChart2 },
  { role: 'admin', label: 'Administrator', description: 'Set up org hierarchy, manage users, import rosters, and configure standards', accent: 'text-violet-700 bg-violet-50 border-violet-200', icon: Settings },
  { role: 'observer', label: 'Observer', description: 'View-only access to state-level snapshots and program metrics', accent: 'text-amber-700 bg-amber-50 border-amber-200', icon: Eye },
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
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm mx-auto mb-4">
            D
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            {userName ? `Welcome, ${userName}` : 'Choose your role'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Select a role to get started. You can switch anytime.
          </p>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ROLES.map(({ role, label, description, accent, icon: Icon }) => {
            const isActive = currentRole === role
            const isLoading = switching === role
            const isDisabled = switching !== null && switching !== role

            return (
              <button
                key={role}
                onClick={() => selectRole(role)}
                disabled={switching !== null}
                className={`group relative text-left p-4 rounded-lg border transition-all duration-150 ${
                  isActive
                    ? 'bg-muted border-border shadow-sm'
                    : 'bg-card border-border hover:shadow-md hover:border-primary/20'
                } ${isDisabled ? 'opacity-40 pointer-events-none' : ''}`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${accent.split(' ').slice(0, 2).join(' ')}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>

                {isActive && (
                  <div className="absolute top-3 right-3 px-1.5 py-0.5 rounded-md bg-primary/10 text-[10px] font-medium text-primary uppercase tracking-wider">
                    Current
                  </div>
                )}
                {isLoading && (
                  <div className="absolute top-3 right-3 text-xs text-primary animate-pulse">
                    Loading...
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
