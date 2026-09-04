'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { clearFormationSupport, createFormation, deleteFormation, updateFormation, updateFormationSupport } from '@/app/admin/actions/formations'
import { FileUpload } from '@/components/admin/file-upload'
import { useAdminAction } from '@/components/admin/use-admin-action'
import type { AdminFormation } from '@/lib/types'

function Field({ name, label, defaultValue, type = 'text', required = true }: {
  name: string
  label: string
  defaultValue?: string
  type?: string
  required?: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-xs text-white/50">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
      />
    </div>
  )
}

function TextareaField({ name, label, defaultValue, required = true }: {
  name: string
  label: string
  defaultValue?: string
  required?: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-xs text-white/50">{label}</label>
      <textarea
        id={name}
        name={name}
        required={required}
        rows={4}
        defaultValue={defaultValue}
        className="min-h-28 resize-y rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
      />
    </div>
  )
}

function FormationForm({ formation, onClose }: { formation: AdminFormation; onClose: () => void }) {
  const router = useRouter()
  const { run, isPending, error } = useAdminAction(updateFormation.bind(null, formation.id), {
    successMessage: 'Formation mise à jour',
    onSuccess: () => router.refresh(),
  })

  return (
    <aside
      role="complementary"
      aria-label="Édition formation"
      className="w-full rounded-lg border border-white/10 bg-white/5 p-4 lg:sticky lg:top-6 lg:w-[28rem]"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-white/40">Édition formation</p>
          <p className="mt-1 text-sm font-semibold">{formation.title}</p>
        </div>
        <button type="button" onClick={onClose} className="text-xs text-white/40 hover:text-white">Fermer</button>
      </div>

      <div className="flex flex-col gap-5">
        <form action={run} className="flex flex-col gap-3">
          <Field name="title" label="Titre" defaultValue={formation.title} />
          <div className="grid grid-cols-2 gap-3">
            <Field name="date" label="Date" type="date" defaultValue={formation.date} />
            <Field name="category" label="Catégorie" defaultValue={formation.category} />
          </div>
          <TextareaField name="description" label="Description" defaultValue={formation.description} />
          <div className="grid grid-cols-2 gap-3">
            <Field name="speaker_name" label="Intervenant" defaultValue={formation.speaker_name} />
            <Field name="speaker_role" label="Rôle" defaultValue={formation.speaker_role} />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button type="submit" disabled={isPending} className="self-start rounded bg-blue-600 px-4 py-1.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {isPending ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </form>

        <FileUpload
          currentFilename={formation.support_filename}
          label="Support"
          onUpload={(payload) => updateFormationSupport(formation.id, payload)}
          onClear={() => clearFormationSupport(formation.id)}
        />
      </div>
    </aside>
  )
}

function FormationRow({ formation, isEditing, onEdit, onDeleted }: {
  formation: AdminFormation
  isEditing: boolean
  onEdit: () => void
  onDeleted: () => void
}) {
  const router = useRouter()
  const { run, isPending } = useAdminAction(deleteFormation.bind(null, formation.id), {
    successMessage: 'Formation supprimée',
    onSuccess: () => { onDeleted(); router.refresh() },
  })

  return (
    <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${isEditing ? 'border-blue-500/40 bg-blue-500/10' : 'border-white/10 bg-white/5'}`}>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium">{formation.title}</p>
        <p className="text-xs text-white/40">{formation.category} · {new Date(`${formation.date}T00:00:00`).toLocaleDateString('fr-FR')} · {formation.speaker_name}</p>
      </div>
      <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/40">
        {formation.support_url ? 'Support' : 'Sans support'}
      </span>
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Éditer ${formation.title}`}
        className="shrink-0 rounded border border-white/20 px-3 py-1 text-xs hover:border-white/40"
      >
        Éditer
      </button>
      <button
        type="button"
        disabled={isPending}
        className="shrink-0 text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
        onClick={() => {
          if (!confirm('Supprimer cette formation ?')) return
          run()
        }}
      >
        {isPending ? 'Suppression…' : 'Supprimer'}
      </button>
    </div>
  )
}

export function FormationsTab({ formations }: { formations: AdminFormation[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newSupport, setNewSupport] = useState<{ url: string; filename: string } | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()
  const editingFormation = formations.find((formation) => formation.id === editingId) ?? null
  const { run: runCreate, isPending, error: addError } = useAdminAction(createFormation, {
    successMessage: 'Formation créée',
    onSuccess: () => {
      formRef.current?.reset()
      setNewSupport(null)
      router.refresh()
    },
  })

  return (
    <div className="flex max-w-6xl flex-col gap-6 lg:flex-row lg:items-start">
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">{formations.length} formation{formations.length > 1 ? 's' : ''}</span>
          <span className="text-xs text-white/40">Affichage public trié par date</span>
        </div>

        <div className="flex flex-col gap-2">
          {formations.map((formation) => (
            <FormationRow
              key={formation.id}
              formation={formation}
              isEditing={editingId === formation.id}
              onEdit={() => setEditingId(formation.id)}
              onDeleted={() => { if (editingId === formation.id) setEditingId(null) }}
            />
          ))}
        </div>

        <form ref={formRef} action={runCreate} className="flex flex-col gap-3 rounded-lg border border-dashed border-white/20 p-4">
          <p className="text-xs text-white/40">Nouvelle formation</p>
          <Field name="title" label="Titre" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field name="date" label="Date" type="date" />
            <Field name="category" label="Catégorie" />
          </div>
          <TextareaField name="description" label="Description" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field name="speaker_name" label="Intervenant" />
            <Field name="speaker_role" label="Rôle" />
          </div>
          <input type="hidden" name="support_url" value={newSupport?.url ?? ''} />
          <input type="hidden" name="support_filename" value={newSupport?.filename ?? ''} />
          <FileUpload
            currentFilename={newSupport?.filename}
            label="Support de la formation"
            onUpload={(payload) => {
              setNewSupport({ url: payload.url, filename: payload.filename })
            }}
            onClear={() => {
              setNewSupport(null)
            }}
          />
          {addError && <p className="text-xs text-red-400">{addError}</p>}
          <button type="submit" disabled={isPending} className="self-start rounded bg-blue-600 px-4 py-1.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {isPending ? 'Création...' : 'Créer la formation'}
          </button>
        </form>
      </div>

      {editingFormation && (
        <FormationForm formation={editingFormation} onClose={() => setEditingId(null)} />
      )}
    </div>
  )
}
