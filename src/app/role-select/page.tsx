'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/lib/supabase/types'
import { Users, BarChart2, Settings, Eye } from 'lucide-react'

const ROLES: { role: UserRole; label: string; description: string; color: string; gradient: string; icon: React.ElementType }[] = [
  { role: 'coach', label: 'Coach', description: 'Manage sessions, track teachers, and build coaching relationships', color: 'bg-blue-500', gradient: 'from-blue-500 to-blue-600', icon: Users },
  { role: 'cm', label: 'Cluster Manager', description: 'Oversee coaches, review escalations, and monitor cluster health', color: 'bg-emerald-500', gradient: 'from-emerald-500 to-emerald-600', icon: BarChart2 },
  { role: 'admin', label: 'Administrator', description: 'Set up org hierarchy, manage users, import rosters, and configure standards', color: 'bg-violet-500', gradient: 'from-violet-500 to-violet-600', icon: Settings },
  { role: 'observer', label: 'Observer', description: 'View-only access to state-level snapshots and program metrics', color: 'bg-amber-500', gradient: 'from-amber-500 to-amber-600', icon: Eye },
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
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(145deg, hsl(220 82% 20%) 0%, hsl(224 40% 14%) 100%)' }}>
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white font-bold text-xl mx-auto mb-5 border border-white/10">
            D
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {userName ? `Welcome, ${userName}` : 'Choose your role'}
          </h1>
          <p className="text-blue-200/50 mt-2 text-[15px]">
            Select a role to get started. You can switch anytime.
          </p>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ROLES.map(({ role, label, description, gradient, icon: Icon }) => {
            const isActive = currentRole === role
            const isLoading = switching === role
            const isDisabled = switching !== null && switching !== role

            return (
              <button
                key={role}
                onClick={() => selectRole(role)}
                disabled={switching !== null}
                className={`group relative text-left p-5 rounded-2xl border transition-all duration-200 ${
                  isActive
                    ? 'bg-white/15 border-white/20 shadow-lg shadow-black/10'
                    : 'bg-white/[0.06] border-white/[0.08] hover:bg-white/[0.12] hover:border-white/[0.15] hover:shadow-lg hover:shadow-black/10 hover:-translate-y-0.5'
                } ${isDisabled ? 'opacity-30 pointer-events-none' : ''}`}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3.5 shadow-sm`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-[15px] font-semibold text-white">{label}</p>
                <p className="text-xs text-blue-200/40 mt-1 leading-relaxed">{description}</p>

                {isActive && (
                  <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-white/15 text-[10px] font-semibold text-blue-200 uppercase tracking-wider">
                    Current
                  </div>
                )}
                {isLoading && (
                  <div className="absolute top-4 right-4 text-xs text-blue-200 animate-pulse">
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
