import Link from 'next/link'
import { RYGBadge } from '@/components/shared/RYGBadge'
import { formatTime } from '@/lib/utils'
import { Phone, Video, Users } from 'lucide-react'
import type { Session, Teacher, RYGStatus, ConfirmationStatus } from '@/lib/supabase/types'
import { cn } from '@/lib/utils'

interface SessionRowProps {
  session: Session & {
    teacher: Pick<Teacher, 'id' | 'name' | 'school_name' | 'block_tag'>
    ryg?: { status: RYGStatus } | null
  }
  showDate?: boolean
}

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  scheduled:   { label: 'Scheduled',   className: 'text-blue-700 bg-blue-50' },
  confirmed:   { label: 'Confirmed',   className: 'text-emerald-700 bg-emerald-50' },
  in_progress: { label: 'In Progress', className: 'text-amber-700 bg-amber-50' },
  completed:   { label: 'Done',        className: 'text-muted-foreground bg-muted' },
  no_show:     { label: 'No-show',     className: 'text-red-700 bg-red-50' },
  cancelled:   { label: 'Cancelled',   className: 'text-muted-foreground bg-muted' },
  rescheduled: { label: 'Rescheduled', className: 'text-violet-700 bg-violet-50' },
}

const CHANNEL_ICON: Record<string, React.ElementType> = {
  google_meet: Video,
  phone: Phone,
  in_person: Users,
}

export function SessionRow({ session, showDate = false }: SessionRowProps) {
  const status = STATUS_LABEL[session.status] ?? { label: session.status, className: 'text-muted-foreground bg-muted' }
  const ChannelIcon = CHANNEL_ICON[session.channel] ?? Phone
  const isCompleted = session.status === 'completed' || session.status === 'cancelled'

  return (
    <Link
      href={isCompleted ? `/coach/sessions/${session.id}/after` : `/coach/sessions/${session.id}`}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
        'hover:bg-muted/50',
        isCompleted && 'opacity-60'
      )}
    >
      {/* Time */}
      <div className="w-12 shrink-0 text-right">
        <p className="text-sm font-medium tabular-nums">{formatTime(session.scheduled_at)}</p>
        {showDate && (
          <p className="text-[11px] text-muted-foreground">
            {new Date(session.scheduled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </p>
        )}
      </div>

      {/* Teacher info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium truncate">{session.teacher.name}</span>
          {session.teacher.ryg && <RYGBadge status={session.teacher.ryg.status} showLabel={false} />}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {session.teacher.school_name}
          {session.teacher.block_tag && ` · ${session.teacher.block_tag}`}
        </p>
      </div>

      {/* Right indicators */}
      <div className="flex items-center gap-2 shrink-0">
        <ChannelIcon className="h-3.5 w-3.5 text-muted-foreground/50" />
        <span className={cn('text-[11px] px-2 py-0.5 rounded-md font-medium', status.className)}>
          {status.label}
        </span>
      </div>
    </Link>
  )
}
