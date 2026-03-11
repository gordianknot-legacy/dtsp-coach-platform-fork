import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const ACCENT_COLORS: Record<string, { bar: string; bg: string }> = {
  blue: { bar: 'bg-blue-500', bg: 'bg-blue-50/50' },
  green: { bar: 'bg-emerald-500', bg: 'bg-emerald-50/50' },
  amber: { bar: 'bg-amber-500', bg: 'bg-amber-50/50' },
  red: { bar: 'bg-red-500', bg: 'bg-red-50/50' },
  purple: { bar: 'bg-purple-500', bg: 'bg-purple-50/50' },
  sky: { bar: 'bg-sky-500', bg: 'bg-sky-50/50' },
}

interface KPICardProps {
  label: string
  value: string | number
  subtext?: string
  trend?: 'up' | 'down' | 'neutral'
  accent?: keyof typeof ACCENT_COLORS
  className?: string
}

export function KPICard({ label, value, subtext, trend, accent, className }: KPICardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const accentConfig = accent ? ACCENT_COLORS[accent as string] : null

  return (
    <div className={cn(
      'rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow overflow-hidden relative',
      accentConfig ? accentConfig.bg : 'bg-card',
      className
    )}>
      {accentConfig && (
        <div className={cn('absolute top-0 left-0 right-0 h-1', accentConfig.bar)} />
      )}
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-3xl font-bold tracking-tight mt-1.5 tabular-nums text-foreground">{value}</p>
      {subtext && (
        <div className={cn(
          'flex items-center gap-1 mt-2 text-xs',
          trend === 'up' ? 'text-emerald-600' :
          trend === 'down' ? 'text-red-500' :
          'text-muted-foreground'
        )}>
          <TrendIcon className="h-3 w-3" />
          <span>{subtext}</span>
        </div>
      )}
    </div>
  )
}
