'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { randomUUID } from 'crypto'
import { verifyCookie, SESSION_COOKIE_NAME } from '@/lib/session'
import { getDb } from '@/lib/db'

async function requireSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  const session = verifyCookie(token)
  if (!session) redirect('/admin')
}

export async function createEvent(formData: FormData) {
  await requireSession()
  const db = getDb()
  const { rows } = await db.execute('SELECT MAX(order_index) as max_order FROM events')
  const maxOrder = (rows[0]?.max_order as number | null) ?? -1
  const id = randomUUID()
  await db.execute({
    sql: 'INSERT INTO events (id, title, date, partner, partner_description, pole, description, image_url, status, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: [
      id,
      String(formData.get('title') ?? ''),
      String(formData.get('date') ?? ''),
      String(formData.get('partner') ?? ''),
      formData.get('partner_description') ? String(formData.get('partner_description')) : null,
      formData.get('pole') ? String(formData.get('pole')) : null,
      String(formData.get('description') ?? ''),
      null,
      String(formData.get('status') ?? 'upcoming'),
      maxOrder + 1,
    ],
  })
  revalidatePath('/evenements')
  redirect(`/admin/dashboard/evenements/${id}`)
}

export async function updateEvent(id: string, formData: FormData) {
  await requireSession()
  const db = getDb()
  await db.execute({
    sql: 'UPDATE events SET title=?, date=?, partner=?, partner_description=?, pole=?, description=?, status=? WHERE id=?',
    args: [
      String(formData.get('title') ?? ''),
      String(formData.get('date') ?? ''),
      String(formData.get('partner') ?? ''),
      formData.get('partner_description') ? String(formData.get('partner_description')) : null,
      formData.get('pole') ? String(formData.get('pole')) : null,
      String(formData.get('description') ?? ''),
      String(formData.get('status') ?? 'upcoming'),
      id,
    ],
  })
  revalidatePath('/evenements')
  revalidatePath(`/evenements/${id}`)
}

export async function updateEventImage(id: string, imageUrl: string) {
  await requireSession()
  const db = getDb()
  await db.execute({ sql: 'UPDATE events SET image_url=? WHERE id=?', args: [imageUrl, id] })
  revalidatePath(`/evenements/${id}`)
}

export async function deleteEvent(id: string) {
  await requireSession()
  const db = getDb()
  await db.execute({ sql: 'DELETE FROM events WHERE id=?', args: [id] })
  revalidatePath('/evenements')
  redirect('/admin/dashboard?tab=evenements')
}

export async function reorderEvents(ids: string[]) {
  await requireSession()
  const db = getDb()
  for (let i = 0; i < ids.length; i++) {
    await db.execute({ sql: 'UPDATE events SET order_index=? WHERE id=?', args: [i, ids[i]] })
  }
}

export async function createHighlight(eventId: string, formData: FormData) {
  await requireSession()
  const db = getDb()
  const { rows } = await db.execute({ sql: 'SELECT MAX(order_index) as m FROM event_highlights WHERE event_id=?', args: [eventId] })
  const maxOrder = (rows[0]?.m as number | null) ?? -1
  await db.execute({
    sql: 'INSERT INTO event_highlights (id, event_id, title, description, order_index) VALUES (?, ?, ?, ?, ?)',
    args: [randomUUID(), eventId, String(formData.get('title') ?? ''), String(formData.get('description') ?? ''), maxOrder + 1],
  })
}

export async function updateHighlight(id: string, formData: FormData) {
  await requireSession()
  const db = getDb()
  await db.execute({
    sql: 'UPDATE event_highlights SET title=?, description=? WHERE id=?',
    args: [String(formData.get('title') ?? ''), String(formData.get('description') ?? ''), id],
  })
}

export async function deleteHighlight(id: string) {
  await requireSession()
  const db = getDb()
  await db.execute({ sql: 'DELETE FROM event_highlights WHERE id=?', args: [id] })
}

export async function reorderHighlights(ids: string[]) {
  await requireSession()
  const db = getDb()
  for (let i = 0; i < ids.length; i++) {
    await db.execute({ sql: 'UPDATE event_highlights SET order_index=? WHERE id=?', args: [i, ids[i]] })
  }
}

export async function addPhoto(eventId: string, url: string, caption: string) {
  await requireSession()
  const db = getDb()
  const { rows } = await db.execute({ sql: 'SELECT MAX(order_index) as m FROM event_photos WHERE event_id=?', args: [eventId] })
  const maxOrder = (rows[0]?.m as number | null) ?? -1
  await db.execute({
    sql: 'INSERT INTO event_photos (id, event_id, url, caption, order_index) VALUES (?, ?, ?, ?, ?)',
    args: [randomUUID(), eventId, url, caption || null, maxOrder + 1],
  })
}

export async function updatePhotoCaption(id: string, caption: string) {
  await requireSession()
  const db = getDb()
  await db.execute({ sql: 'UPDATE event_photos SET caption=? WHERE id=?', args: [caption, id] })
}

export async function deletePhoto(id: string) {
  await requireSession()
  const db = getDb()
  await db.execute({ sql: 'DELETE FROM event_photos WHERE id=?', args: [id] })
}

export async function reorderPhotos(ids: string[]) {
  await requireSession()
  const db = getDb()
  for (let i = 0; i < ids.length; i++) {
    await db.execute({ sql: 'UPDATE event_photos SET order_index=? WHERE id=?', args: [i, ids[i]] })
  }
}
