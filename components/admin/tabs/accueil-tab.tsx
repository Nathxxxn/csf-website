'use client'

import { useRef } from 'react'
import { upsertContent } from '@/app/admin/actions/content'
import type { SiteContent } from '@/lib/types'

export function AccueilTab({ content }: { content: SiteContent }) {
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form ref={formRef} action={upsertContent} className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">{"Page d'accueil"}</h2>
        <button type="submit" className="rounded bg-blue-600 px-4 py-1.5 text-sm font-medium hover:bg-blue-700">
          Enregistrer
        </button>
      </div>

      {/* Hero */}
      <section className="rounded-lg border border-white/10 bg-white/5 p-4 flex flex-col gap-4">
        <h3 className="text-xs uppercase tracking-widest text-white/40">Section Hero</h3>
        <Field name="hero_title" label="Titre principal" defaultValue={content.hero_title} />
        <TextareaField name="hero_subtitle" label="Sous-titre" defaultValue={content.hero_subtitle} />
      </section>

      {/* Stats */}
      <section className="rounded-lg border border-white/10 bg-white/5 p-4 flex flex-col gap-4">
        <h3 className="text-xs uppercase tracking-widest text-white/40">Statistiques</h3>
        <div className="grid grid-cols-3 gap-4">
          <Field name="stats_poles" label="Pôles" defaultValue={content.stats_poles} />
          <Field name="stats_membres" label="Membres" defaultValue={content.stats_membres} />
          <Field name="stats_evenements" label="Événements / an" defaultValue={content.stats_evenements} />
        </div>
      </section>
    </form>
  )
}

function Field({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-xs text-white/50">{label}</label>
      <input id={name} name={name} defaultValue={defaultValue} className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
    </div>
  )
}

function TextareaField({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-xs text-white/50">{label}</label>
      <textarea id={name} name={name} defaultValue={defaultValue} rows={3} className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none" />
    </div>
  )
}
