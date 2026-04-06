import { createEvent } from '@/app/admin/actions/events'
import Link from 'next/link'

export default function NewEventPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 max-w-2xl">
      <Link href="/admin/dashboard?tab=evenements" className="mb-6 inline-block text-sm text-white/40 hover:text-white">
        ← Retour aux événements
      </Link>
      <h1 className="mb-6 text-lg font-semibold">Nouvel événement</h1>
      <form action={createEvent} className="flex flex-col gap-4">
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
        <button type="submit" className="self-start rounded bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-700">
          {"Créer l'événement"}
        </button>
      </form>
    </div>
  )
}

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
      <textarea id={name} name={name} required={required} rows={4} className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none" />
    </div>
  )
}
