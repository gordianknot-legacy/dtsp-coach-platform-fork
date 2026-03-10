import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { RYGBadge } from '@/components/shared/RYGBadge'
import { formatTime } from '@/lib/utils'
import { Phone, Video, Users, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
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
  scheduled:   { label: 'Scheduled',   className: 'bg-blue-50 text-blue-700 border-blue-200' },
  confirmed:   { label: 'Confirmed',   className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  in_progress: { label: 'In Progress', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  completed:   { label: 'Done',        className: 'bg-slate-100 text-slate-500 border-slate-200' },
  no_show:     { label: 'No-show',     className: 'bg-red-50 text-red-600 border-red-200' },
  cancelled:   { label: 'Cancelled',   className: 'bg-slate-100 text-slate-400 border-slate-200' },
  rescheduled: { label: 'Rescheduled', className: 'bg-purple-50 text-purple-700 border-purple-200' },
}

const CHANNEL_ICON = {
  google_meet: Video,
  phone: Phone,
  in_person: Users,
}

const CONFIRMATION_ICON: Record<ConfirmationStatus, React.ElementType> = {
  confirmed:   CheckCircle2,
  no_response: XCircle,
  pending:     AlertCircle,
}

export function SessionRow({ session, showDate = false }: SessionRowProps) {
  const status = STATUS_CONFIG[session.status] ?? { label: session.status, className: 'bg-slate-100 text-slate-600 border-slate-200' }
  const ChannelIcon = CHANNEL_ICON[session.channel]
  const ConfIcon = CONFIRMATION_ICON[session.confirmation_status]
  const isCompleted = session.status === 'completed' || session.status === 'cancelled'

  return (
    <Link
      href={isCompleted ? `/coach/sessions/${session.id}/after` : `/coach/sessions/${session.id}`}
      className={cn(
        'group flex items-center gap-4 px-4 py-3.5 rounded-xl bg-card border',
        'hover:shadow-md hover:border-primary/15 hover:-translate-y-px transition-all duration-200',
        isCompleted && 'opacity-55'
      )}
    >
      {/* Time column */}
      <div className="w-14 shrink-0 text-right">
        <p className="text-sm font-bold tabular-nums text-foreground/80">{formatTime(session.scheduled_at)}</p>
        {showDate && (
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {new Date(session.scheduled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="w-px self-stretch bg-border/60 shrink-0" />

      {/* Teacher info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{session.teacher.name}</span>
          {session.teacher.ryg && <RYGBadge status={session.teacher.ryg.status} showLabel={false} />}
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {session.teacher.school_name}
          {session.teacher.block_tag && ` · ${session.teacher.block_tag}`}
        </p>
      </div>

      {/* Focus tag */}
      {session.focus_tag && (
        <Badge variant="outline" className="hidden sm:inline-flex text-xs shrink-0 rounded-lg">
          {session.focus_tag}
        </Badge>
      )}

      {/* Status & indicators */}
      <div className="flex items-center gap-2 shrink-0">
        <ChannelIcon className="h-3.5 w-3.5 text-muted-foreground/60" />
        <ConfIcon
          className={cn(
            'h-3.5 w-3.5',
            session.confirmation_status === 'confirmed'   ? 'text-emerald-500' :
            session.confirmation_status === 'no_response' ? 'text-red-400'     :
            'text-muted-foreground/50'
          )}
        />
        <span className={cn(
          'text-[11px] px-2.5 py-0.5 rounded-lg border font-semibold',
          status.className
        )}>
          {status.label}
        </span>
      </div>
    </Link>
  )
}
