import { cn } from '@/lib/utils'
import type { RYGStatus } from '@/lib/supabase/types'

interface RYGBadgeProps {
  status: RYGStatus
  className?: string
  showLabel?: boolean
}

const RYG_CONFIG: Record<RYGStatus, { label: string; dot: string; text: string }> = {
  G: { label: 'Green', dot: 'bg-emerald-500', text: 'text-emerald-700' },
  Y: { label: 'Yellow', dot: 'bg-amber-400', text: 'text-amber-700' },
  R: { label: 'Red', dot: 'bg-red-500', text: 'text-red-700' },
}

export function RYGBadge({ status, className, showLabel = true }: RYGBadgeProps) {
  const config = RYG_CONFIG[status]
  if (!config) return null

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className={cn('w-2 h-2 rounded-full', config.dot)} />
      {showLabel && (
        <span className={cn('text-xs font-medium', config.text)}>
          {config.label}
        </span>
      )}
    </span>
  )
}
