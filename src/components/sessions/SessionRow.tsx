import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { RYGBadge } from '@/components/shared/RYGBadge'
import { formatTime } from '@/lib/utils'
import { Phone, Video, Users, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import type { Session, Teacher, RYGStatus, ConfirmationStatus } from '@/lib/supabase/types'
import { cn } from '@/lib/utils'

interface SessionRowProps {
  session: Session & {
    teacher: Pick<Teacher, 'id' | 'name' | 'school_name' | 'block_tag'>
    ryg?: { status: RYGStatus } | null
  }
  showDate?: boolean
}

const STATUS_CONFIG = {
  scheduled: { label: 'Scheduled', className: 'bg-blue-50 text-blue-700' },
  confirmed: { label: 'Confirmed', className: 'bg-green-50 text-green-700' },
  in_progress: { label: 'In Progress', className: 'bg-amber-50 text-amber-700' },
  completed: { label: 'Done', className: 'bg-gray-100 text-gray-600' },
  no_show: { label: 'No-show', className: 'bg-red-50 text-red-700' },
  cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-500' },
  rescheduled: { label: 'Rescheduled', className: 'bg-purple-50 text-purple-700' },
}

const CHANNEL_ICON = {
  google_meet: Video,
  phone: Phone,
  in_person: Users,
}

const CONFIRMATION_ICON: Record<ConfirmationStatus, React.ElementType> = {
  confirmed: CheckCircle2,
  no_response: XCircle,
  pending: AlertCircle,
}

export function SessionRow({ session, showDate = false }: SessionRowProps) {
  const status = STATUS_CONFIG[session.status] ?? { label: session.status, className: 'bg-gray-100 text-gray-600' }
  const ChannelIcon = CHANNEL_ICON[session.channel]
  const ConfIcon = CONFIRMATION_ICON[session.confirmation_status]
  const isCompleted = session.status === 'completed' || session.status === 'cancelled'

  return (
    <Link
      href={isCompleted ? `/coach/sessions/${session.id}/after` : `/coach/sessions/${session.id}`}
      className={cn(
        'flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/40 transition-colors',
        isCompleted && 'opacity-75'
      )}
    >
      {/* Time */}
      <div className="w-16 shrink-0 text-right">
        <p className="text-sm font-medium">{formatTime(session.scheduled_at)}</p>
        {showDate && (
          <p className="text-xs text-muted-foreground">
            {new Date(session.scheduled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </p>
        )}
      </div>

      {/* Teacher info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{session.teacher.name}</span>
          {session.teacher.ryg && <RYGBadge status={session.teacher.ryg.status} showLabel={false} />}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {session.teacher.school_name}
          {session.teacher.block_tag && ` · ${session.teacher.block_tag}`}
        </p>
      </div>

      {/* Focus tag */}
      {session.focus_tag && (
        <Badge variant="outline" className="hidden sm:inline-flex text-xs">
          {session.focus_tag}
        </Badge>
      )}

      {/* Indicators */}
      <div className="flex items-center gap-2 shrink-0">
        <ChannelIcon className="h-3.5 w-3.5 text-muted-foreground" />
        <ConfIcon
          className={cn(
            'h-3.5 w-3.5',
            session.confirmation_status === 'confirmed' ? 'text-green-600' :
            session.confirmation_status === 'no_response' ? 'text-red-500' :
            'text-muted-foreground'
          )}
        />
        <span className={cn('text-xs px-1.5 py-0.5 rounded font-medium', status.className)}>
          {status.label}
        </span>
      </div>
    </Link>
  )
}
