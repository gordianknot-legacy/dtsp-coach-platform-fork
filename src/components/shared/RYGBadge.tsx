import { cn } from '@/lib/utils'
import type { RYGStatus } from '@/lib/supabase/types'

interface RYGBadgeProps {
  status: RYGStatus
  className?: string
  showLabel?: boolean
}

const RYG_CONFIG: Record<RYGStatus, { label: string; className: string }> = {
  G: { label: 'Green', className: 'bg-green-100 text-green-800 border-green-200' },
  Y: { label: 'Yellow', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  R: { label: 'Red', className: 'bg-red-100 text-red-800 border-red-200' },
}

export function RYGBadge({ status, className, showLabel = true }: RYGBadgeProps) {
  const config = RYG_CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold',
        config.className,
        className
      )}
    >
      <span className={cn(
        'w-1.5 h-1.5 rounded-full',
        status === 'G' ? 'bg-green-600' : status === 'Y' ? 'bg-yellow-500' : 'bg-red-600'
      )} />
      {showLabel && config.label}
    </span>
  )
}
