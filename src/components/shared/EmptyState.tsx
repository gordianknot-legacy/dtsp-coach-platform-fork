import { cn } from '@/lib/utils'
import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-3">
        {icon ?? <Inbox className="h-4 w-4 text-muted-foreground" />}
      </div>
      <h3 className="font-medium text-foreground/80 text-sm">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-1.5 max-w-xs leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
