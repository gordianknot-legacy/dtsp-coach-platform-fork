import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface KPICardProps {
  label: string
  value: string | number
  subtext?: string
  trend?: 'up' | 'down' | 'neutral'
  className?: string
}

export function KPICard({ label, value, subtext, trend, className }: KPICardProps) {
  return (
    <Card className={cn('', className)}>
      <CardContent className="pt-4 pb-4">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        {subtext && (
          <p className={cn(
            'text-xs mt-0.5',
            trend === 'up' ? 'text-green-600' :
            trend === 'down' ? 'text-red-600' :
            'text-muted-foreground'
          )}>
            {subtext}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
