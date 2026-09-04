'use client'

import Link from 'next/link'
import { useState } from 'react'
import { deleteEvent, reorderEvents } from '@/app/admin/actions/events'
import { EventEditorPanel } from '@/components/admin/event-edit-client'
import { SortableList } from '@/components/admin/sortable-list'
import { useAdminAction } from '@/components/admin/use-admin-action'
import type { AdminEvent } from '@/lib/types'

export function EvenementsTab({ events }: { events: AdminEvent[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const upcoming = events.filter(e => e.status === 'upcoming')
  const past = events.filter(e => e.status === 'past')
  const editingEvent = events.find((event) => event.id === editingId) ?? null

  return (
    <div className="flex max-w-6xl flex-col gap-6 lg:flex-row lg:items-start">
      <div className="flex min-w-0 flex-1 flex-col gap-6">
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
                <EventRow
                  event={event}
                  dragHandleProps={dragHandleProps}
                  isEditing={editingId === event.id}
                  onEdit={() => setEditingId(event.id)}
                />
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
                <EventRow
                  event={event}
                  dragHandleProps={dragHandleProps}
                  isEditing={editingId === event.id}
                  onEdit={() => setEditingId(event.id)}
                />
              )}
            />
          </div>
        )}
      </div>

      {editingEvent && (
        <EventEditorPanel event={editingEvent} onClose={() => setEditingId(null)} />
      )}
    </div>
  )
}

function EventRow({
  event,
  dragHandleProps,
  isEditing,
  onEdit,
}: {
  event: AdminEvent
  dragHandleProps: object
  isEditing: boolean
  onEdit: () => void
}) {
  const { run, isPending } = useAdminAction(deleteEvent.bind(null, event.id))

  return (
    <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${isEditing ? 'border-blue-500/40 bg-blue-500/10' : 'border-white/10 bg-white/5'}`}>
      <span {...dragHandleProps} className="cursor-grab text-white/20 hover:text-white/50">⠿</span>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium">{event.title}</p>
        <p className="text-xs text-white/40">{event.partner} · {new Date(event.date).toLocaleDateString('fr-FR')}</p>
      </div>
      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${event.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-white/40'}`}>
        {event.status === 'upcoming' ? 'À venir' : 'Passé'}
      </span>
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Éditer ${event.title}`}
        className="shrink-0 rounded border border-white/20 px-3 py-1 text-xs hover:border-white/40"
      >
        Éditer
      </button>
      <form action={run}>
        <button
          type="submit"
          disabled={isPending}
          className="shrink-0 text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
          onClick={e => { if (!confirm('Supprimer cet événement ?')) e.preventDefault() }}
        >
          {isPending ? 'Suppression…' : 'Supprimer'}
        </button>
      </form>
    </div>
  )
}
