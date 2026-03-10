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
    <Card className={cn(className)}>
      <CardContent className="pt-4 pb-4 px-4">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold mt-1.5 tabular-nums tracking-tight">{value}</p>
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
