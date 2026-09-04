'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updatePartner, deletePartner, reorderPartners, updatePartnerLogo, createPartnerWithLogoUrl } from '@/app/admin/actions/partners'
import { SortableList } from '@/components/admin/sortable-list'
import { ImageUpload } from '@/components/admin/image-upload'
import { useAdminAction } from '@/components/admin/use-admin-action'
import type { AdminPartner } from '@/lib/types'

export function PartenairesTab({ partners }: { partners: AdminPartner[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newLogoUrl, setNewLogoUrl] = useState('')
  const [newName, setNewName] = useState('')
  const router = useRouter()
  const editingPartner = partners.find(p => p.id === editingId) ?? null
  const { run: runCreate, isPending, error: addError } = useAdminAction(
    () => createPartnerWithLogoUrl(newName, newLogoUrl),
    {
      successMessage: 'Partenaire ajouté',
      onSuccess: () => {
        setNewName('')
        setNewLogoUrl('')
        router.refresh()
      },
    },
  )

  return (
    <div className="flex max-w-6xl flex-col gap-6 lg:flex-row lg:items-start">
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">{partners.length} partenaire{partners.length > 1 ? 's' : ''}</span>
          <span className="text-xs text-white/40">Ordre = ordre dans le bandeau</span>
        </div>

        <SortableList
          items={partners}
          onReorder={reorderPartners}
          renderItem={(partner, dragHandleProps) => (
            <PartnerRow
              partner={partner}
              dragHandleProps={dragHandleProps}
              isEditing={editingId === partner.id}
              onEdit={() => setEditingId(partner.id)}
              onDeleted={() => { if (editingId === partner.id) setEditingId(null) }}
            />
          )}
        />

        <div className="rounded-lg border border-dashed border-white/20 p-4 flex flex-col gap-3">
          <p className="text-xs text-white/40">Nouveau partenaire</p>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-white/50">Nom</label>
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Nom du partenaire"
                className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <ImageUpload label="Logo" onUpload={url => setNewLogoUrl(url)} />
            {addError && <p className="text-xs text-red-400">{addError}</p>}
            <button
              type="button"
              disabled={!newLogoUrl || !newName || isPending}
              onClick={() => runCreate()}
              className="self-start rounded bg-blue-600 px-4 py-1.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? 'Ajout…' : 'Ajouter le partenaire'}
            </button>
          </div>
        </div>
      </div>

      {editingPartner && (
        <PartnerEditorPanel partner={editingPartner} onClose={() => setEditingId(null)} />
      )}
    </div>
  )
}

function PartnerRow({ partner, dragHandleProps, isEditing, onEdit, onDeleted }: {
  partner: AdminPartner
  dragHandleProps: object
  isEditing: boolean
  onEdit: () => void
  onDeleted: () => void
}) {
  const router = useRouter()
  const { run, isPending } = useAdminAction(deletePartner.bind(null, partner.id), {
    successMessage: 'Partenaire supprimé',
    onSuccess: () => { onDeleted(); router.refresh() },
  })

  return (
    <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${isEditing ? 'border-blue-500/40 bg-blue-500/10' : 'border-white/10 bg-white/5'}`}>
      <span {...dragHandleProps} className="cursor-grab text-white/20 hover:text-white/50">⠿</span>
      <img src={partner.logo_url} alt={partner.name} className="h-8 w-16 object-contain" />
      <span className="flex-1 text-sm">{partner.name}</span>
      <button
        type="button"
        aria-label={`Éditer ${partner.name}`}
        onClick={onEdit}
        className="text-xs text-white/40 hover:text-white"
      >
        Éditer
      </button>
      <button
        type="button"
        aria-label={`Supprimer ${partner.name}`}
        disabled={isPending}
        className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
        onClick={() => {
          if (!confirm('Supprimer ?')) return
          run()
        }}
      >
        ✕
      </button>
    </div>
  )
}

function PartnerEditorPanel({ partner, onClose }: { partner: AdminPartner; onClose: () => void }) {
  const router = useRouter()
  const { run, isPending, error } = useAdminAction(updatePartner.bind(null, partner.id), {
    successMessage: 'Partenaire mis à jour',
    onSuccess: () => router.refresh(),
  })

  return (
    <aside
      role="complementary"
      aria-label="Édition partenaire"
      className="w-full rounded-lg border border-white/10 bg-white/5 p-4 lg:sticky lg:top-6 lg:w-80"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-white/40">Édition partenaire</p>
          <p className="mt-1 text-sm font-semibold">{partner.name}</p>
        </div>
        <button type="button" onClick={onClose} className="text-xs text-white/40 hover:text-white">Fermer</button>
      </div>
      <div className="flex flex-col gap-3">
        <form action={run} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/50">Nom</label>
            <input name="name" defaultValue={partner.name} className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
          </div>
          <input type="hidden" name="logo_url" value={partner.logo_url} />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button type="submit" disabled={isPending} className="self-start rounded bg-blue-600 px-4 py-1.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {isPending ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </form>
        <ImageUpload
          currentUrl={partner.logo_url}
          label="Logo"
          onUpload={async (url) => {
            await updatePartnerLogo(partner.id, url)
            router.refresh()
          }}
        />
      </div>
    </aside>
  )
}
