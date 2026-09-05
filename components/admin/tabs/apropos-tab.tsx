'use client'

import { upsertContent } from '@/app/admin/actions/content'
import { useAdminAction } from '@/components/admin/use-admin-action'
import type { SiteContent } from '@/lib/types'

export function AproposTab({ content }: { content: SiteContent }) {
  const { run, isPending, error } = useAdminAction(upsertContent, {
    successMessage: 'Page À propos enregistrée',
  })

  return (
    <form action={run} className="flex max-w-5xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">À propos</h2>
        <button type="submit" disabled={isPending} className="rounded bg-blue-600 px-4 py-1.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          {isPending ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}

      <section className="rounded-lg border border-white/10 bg-white/5 p-4 flex flex-col gap-4">
        <h3 className="text-xs uppercase tracking-widest text-white/40">Introduction</h3>
        <TextareaField
          name="about_heading"
          label="Titre principal"
          defaultValue={content.about_heading}
          placeholder="CentraleSupélec Finance, l'association qui fait le lien entre les élèves de CentraleSupélec et le monde de la finance."
          rows={2}
        />
        <TextareaField
          name="about_intro"
          label="Paragraphe d'intro"
          defaultValue={content.about_intro}
          placeholder="Concrètement, nous organisons des rencontres avec des professionnels du secteur…"
          rows={4}
        />
      </section>

      <section className="rounded-lg border border-white/10 bg-white/5 p-4 flex flex-col gap-4">
        <h3 className="text-xs uppercase tracking-widest text-white/40">Informations légales</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Field name="about_legal_address" label="Adresse" defaultValue={content.about_legal_address} placeholder="3 rue Joliot Curie, 91190 Gif-sur-Yvette" />
          <Field name="about_legal_rna" label="Identifiant RNA" defaultValue={content.about_legal_rna} placeholder="W913012869" />
        </div>
      </section>

      <p className="text-xs text-white/40">
        Les statistiques (pôles, membres, étudiants, événements/an) et la liste des pôles affichés sur cette
        page viennent respectivement de l&apos;onglet Accueil et de l&apos;onglet Équipe.
      </p>
    </form>
  )
}

function Field({ name, label, defaultValue, placeholder }: { name: string; label: string; defaultValue: string; placeholder?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-xs text-white/50">{label}</label>
      <input id={name} name={name} defaultValue={defaultValue} placeholder={placeholder} className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
    </div>
  )
}

function TextareaField({
  name,
  label,
  defaultValue,
  placeholder,
  rows = 3,
}: {
  name: string
  label: string
  defaultValue: string
  placeholder?: string
  rows?: number
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-xs text-white/50">{label}</label>
      <textarea id={name} name={name} defaultValue={defaultValue} placeholder={placeholder} rows={rows} className="min-h-20 resize-y rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
    </div>
  )
}
