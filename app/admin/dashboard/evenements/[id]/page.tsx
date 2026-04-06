import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { verifyCookie, SESSION_COOKIE_NAME } from '@/lib/session'
import { getAdminEventById } from '@/lib/data'
import {
  updateEvent, updateEventImage,
  createHighlight, updateHighlight, deleteHighlight, reorderHighlights,
  addPhoto, deletePhoto, reorderPhotos, updatePhotoCaption,
} from '@/app/admin/actions/events'
import { ImageUpload } from '@/components/admin/image-upload'
import { SortableList } from '@/components/admin/sortable-list'
import Link from 'next/link'
import type { AdminEvent } from '@/lib/types'

interface Props { params: Promise<{ id: string }> }

export default async function EventEditPage({ params }: Props) {
  const cookieStore = await cookies()
  const session = verifyCookie(cookieStore.get(SESSION_COOKIE_NAME)?.value)
  if (!session) redirect('/admin')

  const { id } = await params
  const event = await getAdminEventById(id)
  if (!event) notFound()

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="flex items-center justify-between border-b border-white/10 bg-[#111] px-6 py-3">
        <span className="font-bold">Console Admin</span>
      </header>
      <div className="p-6 max-w-2xl flex flex-col gap-6">
        <Link href="/admin/dashboard?tab=evenements" className="text-sm text-white/40 hover:text-white">
          ← Retour aux événements
        </Link>
        <h1 className="text-lg font-semibold">{event.title}</h1>

        <GeneralInfoSection event={event} />
        <PartnerSection event={event} />
        <HighlightsSection event={event} />
        <PhotosSection event={event} />
      </div>
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/5 p-4 flex flex-col gap-4">
      <h2 className="text-xs uppercase tracking-widest text-white/40">{title}</h2>
      {children}
    </section>
  )
}

function GeneralInfoSection({ event }: { event: AdminEvent }) {
  const updateEventWithId = updateEvent.bind(null, event.id)
  const updateImageWithId = updateEventImage.bind(null, event.id)

  return (
    <SectionCard title="Informations générales">
      <form action={updateEventWithId} className="flex flex-col gap-4">
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
        <button type="submit" className="self-start rounded bg-blue-600 px-4 py-1.5 text-sm font-medium hover:bg-blue-700">
          Enregistrer
        </button>
      </form>
      <ImageUpload
        currentUrl={event.image_url}
        label="Image principale"
        onUpload={async (url) => {
          'use server'
          await updateImageWithId(url)
        }}
      />
    </SectionCard>
  )
}

function PartnerSection({ event }: { event: AdminEvent }) {
  const updateEventWithId = updateEvent.bind(null, event.id)
  return (
    <SectionCard title="Section partenaire (page détail)">
      <form action={updateEventWithId} className="flex flex-col gap-4">
        <input type="hidden" name="title" value={event.title} />
        <input type="hidden" name="date" value={event.date} />
        <input type="hidden" name="partner" value={event.partner} />
        <input type="hidden" name="status" value={event.status} />
        <input type="hidden" name="description" value={event.description} />
        <TextareaField name="partner_description" label="Description du partenaire" defaultValue={event.partner_description ?? ''} />
        <button type="submit" className="self-start rounded bg-blue-600 px-4 py-1.5 text-sm font-medium hover:bg-blue-700">
          Enregistrer
        </button>
      </form>
    </SectionCard>
  )
}

function HighlightsSection({ event }: { event: AdminEvent }) {
  const createHighlightWithEventId = createHighlight.bind(null, event.id)
  return (
    <SectionCard title="Points clés (Highlights)">
      <SortableList
        items={event.highlights}
        onReorder={reorderHighlights}
        renderItem={(highlight, dragHandleProps) => (
          <div className="flex items-start gap-2 rounded border border-white/10 bg-white/5 p-3">
            <span {...dragHandleProps} className="mt-1 cursor-grab text-white/20 hover:text-white/50">⠿</span>
            <form action={updateHighlight.bind(null, highlight.id)} className="flex flex-1 flex-col gap-2">
              <input name="title" defaultValue={highlight.title} className="rounded border border-white/10 bg-transparent px-2 py-1 text-sm text-white focus:border-blue-500 focus:outline-none" />
              <textarea name="description" defaultValue={highlight.description} rows={2} className="rounded border border-white/10 bg-transparent px-2 py-1 text-xs text-white/70 resize-none focus:border-blue-500 focus:outline-none" />
              <button type="submit" className="self-start text-xs text-blue-400 hover:text-blue-300">Enregistrer</button>
            </form>
            <form action={deleteHighlight.bind(null, highlight.id)}>
              <button type="submit" className="text-red-400 hover:text-red-300 text-xs">✕</button>
            </form>
          </div>
        )}
      />
      <form action={createHighlightWithEventId} className="flex flex-col gap-2 border-t border-white/10 pt-4">
        <p className="text-xs text-white/40">Ajouter un point clé</p>
        <input name="title" placeholder="Titre" className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
        <textarea name="description" placeholder="Description" rows={2} className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white resize-none focus:border-blue-500 focus:outline-none" />
        <button type="submit" className="self-start rounded border border-white/20 px-3 py-1 text-xs hover:border-white/40">+ Ajouter</button>
      </form>
    </SectionCard>
  )
}

function PhotosSection({ event }: { event: AdminEvent }) {
  const addPhotoWithEventId = addPhoto.bind(null, event.id)
  return (
    <SectionCard title="Galerie photos">
      <SortableList
        items={event.photos}
        onReorder={reorderPhotos}
        renderItem={(photo, dragHandleProps) => (
          <div className="flex items-center gap-3 rounded border border-white/10 bg-white/5 p-2">
            <span {...dragHandleProps} className="cursor-grab text-white/20 hover:text-white/50">⠿</span>
            <img src={photo.url} alt="" className="h-14 w-20 rounded object-cover" />
            <form action={updatePhotoCaption.bind(null, photo.id)} className="flex flex-1 items-center gap-2">
              <input name="caption" defaultValue={photo.caption ?? ''} placeholder="Légende..." className="flex-1 rounded border border-white/10 bg-transparent px-2 py-1 text-xs text-white focus:border-blue-500 focus:outline-none" />
              <button type="submit" className="text-xs text-blue-400 hover:text-blue-300">OK</button>
            </form>
            <form action={deletePhoto.bind(null, photo.id)}>
              <button type="submit" className="text-red-400 hover:text-red-300 text-xs">✕</button>
            </form>
          </div>
        )}
      />
      <ImageUpload
        label="Ajouter une photo"
        onUpload={async (url) => {
          'use server'
          await addPhotoWithEventId(url, '')
        }}
      />
    </SectionCard>
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
      <textarea id={name} name={name} defaultValue={defaultValue} rows={4} className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white resize-none focus:border-blue-500 focus:outline-none" />
    </div>
  )
}
