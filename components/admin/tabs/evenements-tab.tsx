'use client'

import Link from 'next/link'
import { deleteEvent, reorderEvents } from '@/app/admin/actions/events'
import { SortableList } from '@/components/admin/sortable-list'
import type { AdminEvent } from '@/lib/types'

export function EvenementsTab({ events }: { events: AdminEvent[] }) {
  const upcoming = events.filter(e => e.status === 'upcoming')
  const past = events.filter(e => e.status === 'past')

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{events.length} événement{events.length > 1 ? 's' : ''}</span>
        <Link href="/admin/dashboard/evenements/new" className="rounded bg-blue-600 px-4 py-1.5 text-sm font-medium hover:bg-blue-700">
          + Nouvel événement
        </Link>
      </div>

      {upcoming.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-widest text-white/40">À venir</p>
          <SortableList
            items={upcoming}
            onReorder={reorderEvents}
            renderItem={(event, dragHandleProps) => (
              <EventRow event={event} dragHandleProps={dragHandleProps} />
            )}
          />
        </div>
      )}

      {past.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-widest text-white/40">Passés</p>
          <SortableList
            items={past}
            onReorder={reorderEvents}
            renderItem={(event, dragHandleProps) => (
              <EventRow event={event} dragHandleProps={dragHandleProps} />
            )}
          />
        </div>
      )}
    </div>
  )
}

function EventRow({ event, dragHandleProps }: { event: AdminEvent; dragHandleProps: object }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
      <span {...dragHandleProps} className="cursor-grab text-white/20 hover:text-white/50">⠿</span>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium">{event.title}</p>
        <p className="text-xs text-white/40">{event.partner} · {new Date(event.date).toLocaleDateString('fr-FR')}</p>
      </div>
      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${event.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-white/40'}`}>
        {event.status === 'upcoming' ? 'À venir' : 'Passé'}
      </span>
      <Link href={`/admin/dashboard/evenements/${event.id}`} className="shrink-0 rounded border border-white/20 px-3 py-1 text-xs hover:border-white/40">
        → Éditer
      </Link>
      <form action={deleteEvent.bind(null, event.id)}>
        <button
          type="submit"
          className="shrink-0 text-xs text-red-400 hover:text-red-300"
          onClick={e => { if (!confirm('Supprimer cet événement ?')) e.preventDefault() }}
        >
          Supprimer
        </button>
      </form>
    </div>
  )
}
