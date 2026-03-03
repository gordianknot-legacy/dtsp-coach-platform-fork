'use client'

import Link from 'next/link'
import type { UserRole } from '@/lib/supabase/types'

const ROLE_LABEL: Record<UserRole, string> = {
  coach: 'Coach',
  cm: 'Cluster Manager',
  admin: 'Admin',
  observer: 'Observer',
}

const ROLE_COLOR: Record<UserRole, string> = {
  coach: 'bg-blue-600',
  cm: 'bg-emerald-600',
  admin: 'bg-violet-600',
  observer: 'bg-amber-600',
}

export function DemoBar({ role }: { role: UserRole }) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-50 flex items-center justify-between px-4 py-2 bg-gray-900 text-white text-xs">
      <div className="flex items-center gap-2">
        <span className="text-gray-400">Demo mode</span>
        <span className="text-gray-600">·</span>
        <span className={`px-2 py-0.5 rounded-full text-white font-medium text-[11px] ${ROLE_COLOR[role]}`}>
          {ROLE_LABEL[role]}
        </span>
      </div>
      <Link
        href="/demo"
        className="text-gray-300 hover:text-white transition-colors font-medium"
      >
        Switch role →
      </Link>
    </div>
  )
}
