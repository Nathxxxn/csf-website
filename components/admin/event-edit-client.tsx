'use client'

import Link from 'next/link'
import {
  updateEvent, updateEventImage,
  createHighlight, updateHighlight, deleteHighlight, reorderHighlights,
  addPhotos, deletePhoto, reorderPhotos, updatePhotoCaption,
} from '@/app/admin/actions/events'
import { ImageUpload } from '@/components/admin/image-upload'
import { SortableList } from '@/components/admin/sortable-list'
import { useAdminAction } from '@/components/admin/use-admin-action'
import type { AdminEvent, AdminHighlight, AdminPhoto } from '@/lib/types'

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/5 p-4 flex flex-col gap-4">
      <h2 className="text-xs uppercase tracking-widest text-white/40">{title}</h2>
      {children}
    </section>
  )
}

function Field({ name, label, type = 'text', defaultValue }: { name: string; label: string; type?: string; defaultValue?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-xs text-white/50">{label}</label>
      <input id={name} name={name} type={type} defaultValue={defaultValue} className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
    </div>
  )
}

function TextareaField({ name, label, defaultValue }: { name: string; label: string; defaultValue?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-xs text-white/50">{label}</label>
      <textarea id={name} name={name} defaultValue={defaultValue} rows={4} className="min-h-28 resize-y rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
    </div>
  )
}

function GeneralInfoSection({ event }: { event: AdminEvent }) {
  const { run, isPending, error } = useAdminAction(updateEvent.bind(null, event.id), {
    successMessage: 'Événement mis à jour',
  })

  return (
    <SectionCard title="Informations générales">
      <form action={run} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Field name="title" label="Titre" defaultValue={event.title} />
          <Field name="date" label="Date" type="date" defaultValue={event.date} />
          <Field name="partner" label="Partenaire" defaultValue={event.partner} />
          <div className="flex flex-col gap-1">
            <label htmlFor="status" className="text-xs text-white/50">Statut</label>
            <select id="status" name="status" defaultValue={event.status} className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
              <option value="upcoming">À venir</option>
              <option value="past">Passé</option>
            </select>
          </div>
        </div>
        <TextareaField name="description" label="Description courte" defaultValue={event.description} />
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button type="submit" disabled={isPending} className="self-start rounded bg-blue-600 px-4 py-1.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          {isPending ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </form>
      <ImageUpload
        currentUrl={event.image_url}
        label="Image principale"
        onUpload={(url) => updateEventImage(event.id, url)}
      />
    </SectionCard>
  )
}

function PartnerSection({ event }: { event: AdminEvent }) {
  const { run, isPending, error } = useAdminAction(updateEvent.bind(null, event.id), {
    successMessage: 'Section partenaire mise à jour',
  })

  return (
    <SectionCard title="Section partenaire (page détail)">
      <form action={run} className="flex flex-col gap-4">
        <input type="hidden" name="title" value={event.title} />
        <input type="hidden" name="date" value={event.date} />
        <input type="hidden" name="partner" value={event.partner} />
        <input type="hidden" name="status" value={event.status} />
        <input type="hidden" name="description" value={event.description} />
        <TextareaField name="partner_description" label="Description du partenaire" defaultValue={event.partner_description ?? ''} />
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button type="submit" disabled={isPending} className="self-start rounded bg-blue-600 px-4 py-1.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          {isPending ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </form>
    </SectionCard>
  )
}

function HighlightRow({ highlight, dragHandleProps }: { highlight: AdminHighlight; dragHandleProps: object }) {
  const { run: runUpdate, isPending: isUpdating } = useAdminAction(updateHighlight.bind(null, highlight.id), {
    successMessage: 'Point clé mis à jour',
  })
  const { run: runDelete, isPending: isDeleting } = useAdminAction(deleteHighlight.bind(null, highlight.id), {
    successMessage: 'Point clé supprimé',
  })

  return (
    <div className="flex items-start gap-2 rounded border border-white/10 bg-white/5 p-3">
      <span {...dragHandleProps} className="mt-1 cursor-grab text-white/20 hover:text-white/50">⠿</span>
      <form action={runUpdate} className="flex flex-1 flex-col gap-2">
        <input name="title" defaultValue={highlight.title} className="rounded border border-white/10 bg-transparent px-2 py-1 text-sm text-white focus:border-blue-500 focus:outline-none" />
        <textarea name="description" defaultValue={highlight.description} rows={3} className="min-h-20 resize-y rounded border border-white/10 bg-transparent px-2 py-1 text-xs text-white/70 focus:border-blue-500 focus:outline-none" />
        <button type="submit" disabled={isUpdating} className="self-start text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50">
          {isUpdating ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </form>
      <form action={runDelete}>
        <button type="submit" disabled={isDeleting} className="text-red-400 hover:text-red-300 text-xs disabled:opacity-50">✕</button>
      </form>
    </div>
  )
}

function HighlightsSection({ event }: { event: AdminEvent }) {
  const { run, isPending, error } = useAdminAction(createHighlight.bind(null, event.id), {
    successMessage: 'Point clé ajouté',
  })

  return (
    <SectionCard title="Points clés (Highlights)">
      <SortableList
        items={event.highlights}
        onReorder={reorderHighlights}
        renderItem={(highlight, dragHandleProps) => (
          <HighlightRow highlight={highlight} dragHandleProps={dragHandleProps} />
        )}
      />
      <form action={run} className="flex flex-col gap-2 border-t border-white/10 pt-4">
        <p className="text-xs text-white/40">Ajouter un point clé</p>
        <input name="title" placeholder="Titre" className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
        <textarea name="description" placeholder="Description" rows={3} className="min-h-24 resize-y rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button type="submit" disabled={isPending} className="self-start rounded border border-white/20 px-3 py-1 text-xs hover:border-white/40 disabled:opacity-50">
          {isPending ? 'Ajout…' : '+ Ajouter'}
        </button>
      </form>
    </SectionCard>
  )
}

function PhotoRow({ photo, dragHandleProps }: { photo: AdminPhoto; dragHandleProps: object }) {
  const { run: runCaption, isPending: isSavingCaption } = useAdminAction(updatePhotoCaption.bind(null, photo.id), {
    successMessage: 'Légende mise à jour',
  })
  const { run: runDelete, isPending: isDeleting } = useAdminAction(deletePhoto.bind(null, photo.id), {
    successMessage: 'Photo supprimée',
  })

  return (
    <div className="flex items-center gap-3 rounded border border-white/10 bg-white/5 p-2">
      <span {...dragHandleProps} className="cursor-grab text-white/20 hover:text-white/50">⠿</span>
      <img src={photo.url} alt="" className="h-14 w-20 rounded object-cover" />
      <form action={runCaption} className="flex flex-1 items-center gap-2">
        <input name="caption" defaultValue={photo.caption ?? ''} placeholder="Légende..." className="flex-1 rounded border border-white/10 bg-transparent px-2 py-1 text-xs text-white focus:border-blue-500 focus:outline-none" />
        <button type="submit" disabled={isSavingCaption} className="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50">OK</button>
      </form>
      <form action={runDelete}>
        <button type="submit" disabled={isDeleting} className="text-red-400 hover:text-red-300 text-xs disabled:opacity-50">✕</button>
      </form>
    </div>
  )
}

function PhotosSection({ event }: { event: AdminEvent }) {
  return (
    <SectionCard title="Galerie photos">
      <SortableList
        items={event.photos}
        onReorder={reorderPhotos}
        renderItem={(photo, dragHandleProps) => (
          <PhotoRow photo={photo} dragHandleProps={dragHandleProps} />
        )}
      />
      <ImageUpload
        label="Ajouter des photos"
        multiple
        onUpload={(urls) => addPhotos(event.id, urls.map((url) => ({ url })))}
      />
    </SectionCard>
  )
}

export function EventEditorContent({ event }: { event: AdminEvent }) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold">{event.title}</h1>
      <GeneralInfoSection event={event} />
      <PartnerSection event={event} />
      <HighlightsSection event={event} />
      <PhotosSection event={event} />
    </div>
  )
}

export function EventEditorPanel({ event, onClose }: { event: AdminEvent; onClose: () => void }) {
  return (
    <aside
      role="complementary"
      aria-label="Édition événement"
      className="w-full rounded-lg border border-white/10 bg-white/5 p-4 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:w-[28rem] lg:overflow-y-auto"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-white/40">Édition événement</p>
          <p className="mt-1 text-sm font-semibold">{event.title}</p>
        </div>
        <button type="button" onClick={onClose} className="text-xs text-white/40 hover:text-white">Fermer</button>
      </div>
      <EventEditorContent event={event} />
    </aside>
  )
}

export function EventEditClient({ event }: { event: AdminEvent }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="flex items-center justify-between border-b border-white/10 bg-[#111] px-6 py-3">
        <span className="font-bold">Console Admin</span>
      </header>
      <div className="flex max-w-5xl flex-col gap-6 p-6">
        <Link href="/admin/dashboard?tab=evenements" className="text-sm text-white/40 hover:text-white">
          ← Retour aux événements
        </Link>
        <EventEditorContent event={event} />
      </div>
    </div>
  )
}
