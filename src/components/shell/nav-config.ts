import {
  CalendarDays,
  Users,
  LayoutDashboard,
  UserCheck,
  BarChart3,
  Home,
  Building2,
  UserCog,
  Upload,
  Link2,
  GraduationCap,
  Eye,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { UserRole } from '@/lib/supabase/types'

export interface NavItem {
  label: string
  href: string
  exact?: boolean
  icon: LucideIcon
  description: string
  iconBg: string
  iconColor: string
}

export const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  coach: [
    { label: 'Sessions', href: '/coach', exact: true, icon: CalendarDays, description: 'Today\'s schedule', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
    { label: 'Teachers', href: '/coach/teachers', icon: Users, description: 'Your assigned teachers', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
  ],
  cm: [
    { label: 'Overview', href: '/cm', exact: true, icon: LayoutDashboard, description: 'Cluster dashboard', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
    { label: 'Coaches', href: '/cm/coaches', icon: UserCheck, description: 'Coach triage & 1:1s', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
    { label: 'Snapshot', href: '/cm/snapshot', icon: BarChart3, description: 'Leadership metrics', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
  ],
  admin: [
    { label: 'Home', href: '/admin', exact: true, icon: Home, description: 'Platform overview', iconBg: 'bg-slate-100', iconColor: 'text-slate-600' },
    { label: 'Org', href: '/admin/org', icon: Building2, description: 'Hierarchy and cohorts', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
    { label: 'Users', href: '/admin/users', icon: UserCog, description: 'Coach and CM accounts', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
    { label: 'Rosters', href: '/admin/rosters', icon: Upload, description: 'Teacher CSV import', iconBg: 'bg-green-100', iconColor: 'text-green-600' },
    { label: 'Assignments', href: '/admin/assignments', icon: Link2, description: 'Teacher-coach mapping', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
    { label: 'Standards', href: '/admin/standards', icon: GraduationCap, description: 'Rubrics and templates', iconBg: 'bg-rose-100', iconColor: 'text-rose-600' },
  ],
  observer: [
    { label: 'Snapshot', href: '/observer', exact: true, icon: Eye, description: 'Read-only program view', iconBg: 'bg-sky-100', iconColor: 'text-sky-600' },
  ],
}

export const ROLE_LABEL: Record<UserRole, string> = {
  coach: 'Coach',
  cm: 'Cluster Manager',
  admin: 'Admin',
  observer: 'Observer',
}
