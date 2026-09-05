'use client'

import { createEvent } from '@/app/admin/actions/events'
import { useAdminAction } from '@/components/admin/use-admin-action'

function Field({ name, label, type = 'text', required }: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-xs text-white/50">{label}</label>
      <input id={name} name={name} type={type} required={required} className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
    </div>
  )
}

function TextareaField({ name, label, required }: { name: string; label: string; required?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-xs text-white/50">{label}</label>
      <textarea id={name} name={name} required={required} rows={5} className="min-h-32 resize-y rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
    </div>
  )
}

export function NewEventForm() {
  const { run, isPending, error } = useAdminAction(createEvent)

  return (
    <form action={run} className="flex flex-col gap-4">
      <Field name="title" label="Titre" required />
      <Field name="date" label="Date" type="date" required />
      <Field name="partner" label="Partenaire" required />
      <div className="flex flex-col gap-1">
        <label htmlFor="status" className="text-xs text-white/50">Statut</label>
        <select id="status" name="status" className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
          <option value="upcoming">À venir</option>
          <option value="past">Passé</option>
        </select>
      </div>
      <TextareaField name="description" label="Description" required />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button type="submit" disabled={isPending} className="self-start rounded bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
        {isPending ? 'Création…' : "Créer l'événement"}
      </button>
    </form>
  )
}
