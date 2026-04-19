import { Badge } from '@/components/ui/badge'
import { cn, formatEventDay, formatEventMonth } from '@/lib/utils'
import type { Event } from '@/lib/types'

interface EventRowProps {
  event: Event
  featured?: boolean
}

export function EventRow({ event, featured = false }: EventRowProps) {
  return (
    <div className={cn('grid grid-cols-[64px_1fr] sm:grid-cols-[80px_1fr_auto] gap-4 sm:gap-6 items-center px-6 py-5 bg-card', featured ? 'border border-border rounded-xl' : 'border-b border-border last:border-0')}>
      <div className="text-center">
        <div className="text-3xl font-bold tracking-tight leading-none">
          {formatEventDay(event.date)}
        </div>
        <div className="text-xs text-muted-foreground tracking-widest mt-1">
          {formatEventMonth(event.date)}
        </div>
      </div>
      <div>
        <h4 className="text-sm font-semibold mb-1">{event.title}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {event.description}
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">{event.partner}</p>
      </div>
      <Badge variant="outline" className="text-xs shrink-0 hidden sm:flex">
        {event.pole}
      </Badge>
    </div>
  )
}
