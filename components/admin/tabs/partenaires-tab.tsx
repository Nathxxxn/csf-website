'use client'

import { useState } from 'react'
import { updatePartner, deletePartner, reorderPartners, updatePartnerLogo, createPartnerWithLogoUrl } from '@/app/admin/actions/partners'
import { SortableList } from '@/components/admin/sortable-list'
import { ImageUpload } from '@/components/admin/image-upload'
import type { AdminPartner } from '@/lib/types'

export function PartenairesTab({ partners }: { partners: AdminPartner[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newLogoUrl, setNewLogoUrl] = useState('')
  const [newName, setNewName] = useState('')

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{partners.length} partenaire{partners.length > 1 ? 's' : ''}</span>
        <span className="text-xs text-white/40">Ordre = ordre dans le bandeau</span>
      </div>

      <SortableList
        items={partners}
        onReorder={reorderPartners}
        renderItem={(partner, dragHandleProps) => (
          <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
            <span {...dragHandleProps} className="cursor-grab text-white/20 hover:text-white/50">⠿</span>
            <img src={partner.logo_url} alt={partner.name} className="h-8 w-16 object-contain" />
            <span className="flex-1 text-sm">{partner.name}</span>
            <button
              onClick={() => setEditingId(editingId === partner.id ? null : partner.id)}
              className="text-xs text-white/40 hover:text-white"
            >
              {editingId === partner.id ? 'Fermer' : 'Éditer'}
            </button>
            <form action={deletePartner.bind(null, partner.id)}>
              <button
                type="submit"
                className="text-xs text-red-400 hover:text-red-300"
                onClick={e => { if (!confirm('Supprimer ?')) e.preventDefault() }}
              >
                ✕
              </button>
            </form>
          </div>
        )}
      />

      {editingId && (() => {
        const partner = partners.find(p => p.id === editingId)
        if (!partner) return null
        const updateWithId = updatePartner.bind(null, editingId)
        return (
          <div className="rounded-lg border border-blue-500/30 bg-white/5 p-4 flex flex-col gap-3">
            <p className="text-xs text-white/40">Éditer — {partner.name}</p>
            <form action={updateWithId} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-white/50">Nom</label>
                <input name="name" defaultValue={partner.name} className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
              </div>
              <input type="hidden" name="logo_url" value={partner.logo_url} />
              <button type="submit" className="self-start rounded bg-blue-600 px-4 py-1.5 text-sm font-medium hover:bg-blue-700">Enregistrer</button>
            </form>
            <ImageUpload currentUrl={partner.logo_url} label="Logo" onUpload={(url) => updatePartnerLogo(editingId, url)} />
          </div>
        )
      })()}

      {/* New partner */}
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
          <button
            type="button"
            disabled={!newLogoUrl || !newName}
            onClick={async () => {
              await createPartnerWithLogoUrl(newName, newLogoUrl)
              setNewName('')
              setNewLogoUrl('')
            }}
            className="self-start rounded bg-blue-600 px-4 py-1.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            Ajouter le partenaire
          </button>
        </div>
      </div>
    </div>
  )
}
