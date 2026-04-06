'use client'

import { useState } from 'react'
import {
  createPole, updatePole, deletePole, reorderPoles,
  createMember, updateMember, deleteMember, reorderMembers, updateMemberPhoto,
} from '@/app/admin/actions/team'
import { SortableList } from '@/components/admin/sortable-list'
import { ImageUpload } from '@/components/admin/image-upload'
import type { AdminPole, AdminMember } from '@/lib/types'

export function EquipeTab({ team }: { team: AdminPole[] }) {
  const [editingPole, setEditingPole] = useState<string | null>(null)
  const [editingMember, setEditingMember] = useState<AdminMember | null>(null)
  const [addingMemberToPole, setAddingMemberToPole] = useState<string | null>(null)

  return (
    <div className="flex gap-6 max-w-5xl">
      {/* Liste des pôles */}
      <div className="flex-1 flex flex-col gap-4">
        <SortableList
          items={team}
          onReorder={reorderPoles}
          renderItem={(pole, dragHandleProps) => (
            <PoleCard
              pole={pole}
              dragHandleProps={dragHandleProps}
              onEditPole={() => setEditingPole(pole.id)}
              onEditMember={setEditingMember}
              onAddMember={() => setAddingMemberToPole(pole.id)}
            />
          )}
        />
        <form action={createPole} className="rounded-lg border border-dashed border-white/20 p-4 flex flex-col gap-2">
          <p className="text-xs text-white/40">Nouveau pôle</p>
          <input name="name" placeholder="Nom du pôle" required className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
          <input name="badge" placeholder="Badge (ex: BUR)" required className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
          <textarea name="description" placeholder="Description" rows={2} className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white resize-none focus:border-blue-500 focus:outline-none" />
          <button type="submit" className="self-start rounded border border-white/20 px-3 py-1 text-xs hover:border-white/40">+ Créer le pôle</button>
        </form>
      </div>

      {/* Panneau latéral */}
      {(editingMember || addingMemberToPole || editingPole) && (
        <aside className="w-64 rounded-lg border border-white/10 bg-white/5 p-4 flex flex-col gap-4 h-fit">
          {editingMember && (
            <MemberForm member={editingMember} poles={team} onClose={() => setEditingMember(null)} />
          )}
          {addingMemberToPole && !editingMember && (
            <NewMemberForm poleId={addingMemberToPole} poles={team} onClose={() => setAddingMemberToPole(null)} />
          )}
          {editingPole && !editingMember && !addingMemberToPole && (
            <PoleForm pole={team.find(p => p.id === editingPole)!} onClose={() => setEditingPole(null)} />
          )}
        </aside>
      )}
    </div>
  )
}

function PoleCard({ pole, dragHandleProps, onEditPole, onEditMember, onAddMember }: {
  pole: AdminPole
  dragHandleProps: object
  onEditPole: () => void
  onEditMember: (m: AdminMember) => void
  onAddMember: () => void
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
        <span {...dragHandleProps} className="cursor-grab text-white/20 hover:text-white/50">⠿</span>
        <span className="flex-1 text-sm font-semibold">{pole.name}</span>
        <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-400">{pole.members.length} membres</span>
        <button onClick={onEditPole} className="text-xs text-white/40 hover:text-white">Éditer pôle</button>
        <button onClick={onAddMember} className="rounded bg-blue-600 px-3 py-1 text-xs hover:bg-blue-700">+ Membre</button>
      </div>
      <div className="p-2 flex flex-col gap-1">
        <SortableList
          items={pole.members}
          onReorder={reorderMembers}
          renderItem={(member, dh) => (
            <MemberRow member={member} dragHandleProps={dh} onEdit={() => onEditMember(member)} />
          )}
        />
      </div>
    </div>
  )
}

function MemberRow({ member, dragHandleProps, onEdit }: { member: AdminMember; dragHandleProps: object; onEdit: () => void }) {
  const initials = member.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div className="flex items-center gap-3 rounded px-3 py-2 hover:bg-white/5">
      <span {...dragHandleProps} className="cursor-grab text-white/20 hover:text-white/50 text-xs">⠿</span>
      <div className="h-7 w-7 shrink-0 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-semibold text-blue-400">
        {member.photo_url
          ? <img src={member.photo_url} alt="" className="h-7 w-7 rounded-full object-cover" />
          : initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm">{member.name}</p>
        <p className="text-xs text-white/40">{member.role}</p>
      </div>
      <button onClick={onEdit} className="text-xs text-white/40 hover:text-white">Éditer</button>
      <form action={deleteMember.bind(null, member.id)}>
        <button
          type="submit"
          className="text-red-400 hover:text-red-300 text-xs"
          onClick={e => { if (!confirm('Supprimer ?')) e.preventDefault() }}
        >✕</button>
      </form>
    </div>
  )
}

function MemberForm({ member, poles, onClose }: { member: AdminMember; poles: AdminPole[]; onClose: () => void }) {
  const updateMemberWithId = updateMember.bind(null, member.id)
  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Éditer le membre</p>
        <button onClick={onClose} className="text-xs text-white/40 hover:text-white">✕</button>
      </div>
      <ImageUpload currentUrl={member.photo_url} label="Photo" onUpload={url => updateMemberPhoto(member.id, url)} />
      <form action={updateMemberWithId} className="flex flex-col gap-3">
        <Field name="name" label="Nom complet" defaultValue={member.name} />
        <Field name="role" label="Rôle" defaultValue={member.role} />
        <div className="flex flex-col gap-1">
          <label className="text-xs text-white/50">Pôle</label>
          <select name="pole_id" defaultValue={member.pole_id} className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
            {poles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <Field name="linkedin" label="LinkedIn (optionnel)" defaultValue={member.linkedin ?? ''} />
        <button type="submit" className="rounded bg-blue-600 px-4 py-1.5 text-sm font-medium hover:bg-blue-700">Enregistrer</button>
      </form>
    </>
  )
}

function NewMemberForm({ poleId, poles, onClose }: { poleId: string; poles: AdminPole[]; onClose: () => void }) {
  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Nouveau membre</p>
        <button onClick={onClose} className="text-xs text-white/40 hover:text-white">✕</button>
      </div>
      <form action={createMember} className="flex flex-col gap-3">
        <input type="hidden" name="pole_id" value={poleId} />
        <Field name="name" label="Nom complet" />
        <Field name="role" label="Rôle" />
        <div className="flex flex-col gap-1">
          <label className="text-xs text-white/50">Pôle</label>
          <select name="pole_id" defaultValue={poleId} className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
            {poles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <Field name="linkedin" label="LinkedIn (optionnel)" />
        <button type="submit" className="rounded bg-blue-600 px-4 py-1.5 text-sm font-medium hover:bg-blue-700">Créer</button>
      </form>
    </>
  )
}

function PoleForm({ pole, onClose }: { pole: AdminPole; onClose: () => void }) {
  const updatePoleWithId = updatePole.bind(null, pole.id)
  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Éditer le pôle</p>
        <button onClick={onClose} className="text-xs text-white/40 hover:text-white">✕</button>
      </div>
      <form action={updatePoleWithId} className="flex flex-col gap-3">
        <Field name="name" label="Nom" defaultValue={pole.name} />
        <Field name="badge" label="Badge" defaultValue={pole.badge} />
        <TextareaField name="description" label="Description" defaultValue={pole.description} />
        <button type="submit" className="rounded bg-blue-600 px-4 py-1.5 text-sm font-medium hover:bg-blue-700">Enregistrer</button>
      </form>
      <form action={deletePole.bind(null, pole.id)}>
        <button
          type="submit"
          className="text-xs text-red-400 hover:text-red-300"
          onClick={e => { if (!confirm('Supprimer ce pôle et tous ses membres ?')) e.preventDefault() }}
        >
          Supprimer le pôle
        </button>
      </form>
    </>
  )
}

function Field({ name, label, defaultValue }: { name: string; label: string; defaultValue?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-white/50">{label}</label>
      <input name={name} defaultValue={defaultValue} className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
    </div>
  )
}

function TextareaField({ name, label, defaultValue }: { name: string; label: string; defaultValue?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-white/50">{label}</label>
      <textarea name={name} defaultValue={defaultValue} rows={3} className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white resize-none focus:border-blue-500 focus:outline-none" />
    </div>
  )
}
