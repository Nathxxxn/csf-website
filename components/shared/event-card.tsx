'use client'

import { MagicCard } from '@/components/ui/magic-card'
import { Badge } from '@/components/ui/badge'
import type { Event } from '@/lib/types'

interface EventCardProps {
  event: Event
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  })
}

export function EventCard({ event }: EventCardProps) {
  return (
    <MagicCard
      className="overflow-hidden rounded-xl border border-border bg-card"
      gradientColor="#1a1a1a"
    >
      <div className="h-40 bg-secondary flex items-center justify-center border-b border-border">
        {event.image ? (
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-xs tracking-widest uppercase text-muted-foreground/40">
            Photo événement
          </span>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs tracking-widest uppercase text-muted-foreground">
            {formatDate(event.date)}
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">{event.partner}</span>
        </div>
        <h4 className="text-base font-semibold mb-2 leading-tight">{event.title}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed mb-4">
          {event.description}
        </p>
        <Badge variant="secondary" className="text-xs">
          {event.pole}
        </Badge>
      </div>
    </MagicCard>
  )
}
