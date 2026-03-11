import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const ACCENT_COLORS: Record<string, string> = {
  blue: 'bg-blue-500',
  green: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  purple: 'bg-purple-500',
  sky: 'bg-sky-500',
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

  return (
    <div className={cn('rounded-xl border border-border bg-card p-5 shadow-md hover:shadow-lg transition-shadow overflow-hidden relative', className)}>
      {accent && ACCENT_COLORS[accent] && (
        <div className={cn('absolute top-0 left-0 right-0 h-1', ACCENT_COLORS[accent])} />
      )}
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-3xl font-bold tracking-tight mt-1 tabular-nums">{value}</p>
      {subtext && (
        <div className={cn(
          'flex items-center gap-1 mt-1.5 text-xs',
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
