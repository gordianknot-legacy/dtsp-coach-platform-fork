import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface KPICardProps {
  label: string
  value: string | number
  subtext?: string
  trend?: 'up' | 'down' | 'neutral'
  className?: string
}

export function KPICard({ label, value, subtext, trend, className }: KPICardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

  return (
    <div className={cn('rounded-lg border border-border bg-card p-4 shadow-md hover:shadow-lg transition-shadow', className)}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold mt-1 tabular-nums">{value}</p>
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
