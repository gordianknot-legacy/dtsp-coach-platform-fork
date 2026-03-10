import { Card, CardContent } from '@/components/ui/card'
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
    <Card className={cn('group hover:shadow-md transition-shadow duration-200', className)}>
      <CardContent className="pt-5 pb-5 px-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">{label}</p>
        <p className="text-3xl font-bold mt-2 tabular-nums tracking-tight">{value}</p>
        {subtext && (
          <div className={cn(
            'flex items-center gap-1 mt-2',
            trend === 'up' ? 'text-emerald-600' :
            trend === 'down' ? 'text-red-500' :
            'text-muted-foreground'
          )}>
            <TrendIcon className="h-3 w-3" />
            <p className="text-xs font-medium">{subtext}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
