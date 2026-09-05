import Link from 'next/link'
import { NewEventForm } from '@/components/admin/new-event-form'

export default function NewEventPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 max-w-5xl">
      <Link href="/admin/dashboard?tab=evenements" className="mb-6 inline-block text-sm text-white/40 hover:text-white">
        ← Retour aux événements
      </Link>
      <h1 className="mb-6 text-lg font-semibold">Nouvel événement</h1>
      <NewEventForm />
    </div>
  )
}
