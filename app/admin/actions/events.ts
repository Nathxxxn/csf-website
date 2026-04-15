'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { randomUUID } from 'crypto'
import { requireAdminSession } from '@/lib/session'
import { getDb } from '@/lib/db'
import { eventSchema, highlightSchema, parseFormData } from '@/lib/validation'

export async function createEvent(formData: FormData) {
  await requireAdminSession()
  const data = parseFormData(eventSchema, formData)
  const db = getDb()
  const { rows } = await db.execute('SELECT MAX(order_index) as max_order FROM events')
  const maxOrder = (rows[0]?.max_order as number | null) ?? -1
  const id = randomUUID()
  await db.execute({
    sql: 'INSERT INTO events (id, title, date, partner, partner_description, pole, description, image_url, status, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: [
      id,
      data.title,
      data.date,
      data.partner,
      data.partner_description ?? null,
      data.pole ?? null,
      data.description,
      null,
      data.status,
      maxOrder + 1,
    ],
  })
  revalidatePath('/')
  revalidatePath('/evenements')
  redirect(`/admin/dashboard/evenements/${id}`)
}

export async function updateEvent(id: string, formData: FormData) {
  await requireAdminSession()
  const data = parseFormData(eventSchema, formData)
  const db = getDb()
  await db.execute({
    sql: 'UPDATE events SET title=?, date=?, partner=?, partner_description=?, pole=?, description=?, status=? WHERE id=?',
    args: [
      data.title,
      data.date,
      data.partner,
      data.partner_description ?? null,
      data.pole ?? null,
      data.description,
      data.status,
      id,
    ],
  })
  revalidatePath('/')
  revalidatePath('/evenements')
  revalidatePath(`/evenements/${id}`)
}

export async function updateEventImage(id: string, imageUrl: string) {
  await requireAdminSession()
  const db = getDb()
  await db.execute({ sql: 'UPDATE events SET image_url=? WHERE id=?', args: [imageUrl, id] })
  revalidatePath(`/evenements/${id}`)
}

export async function deleteEvent(id: string) {
  await requireAdminSession()
  const db = getDb()
  await db.execute({ sql: 'DELETE FROM events WHERE id=?', args: [id] })
  revalidatePath('/')
  revalidatePath('/evenements')
  redirect('/admin/dashboard?tab=evenements')
}

export async function reorderEvents(ids: string[]) {
  await requireAdminSession()
  const db = getDb()
  for (let i = 0; i < ids.length; i++) {
    await db.execute({ sql: 'UPDATE events SET order_index=? WHERE id=?', args: [i, ids[i]] })
  }
}

export async function createHighlight(eventId: string, formData: FormData) {
  await requireAdminSession()
  const data = parseFormData(highlightSchema, formData)
  const db = getDb()
  const { rows } = await db.execute({ sql: 'SELECT MAX(order_index) as m FROM event_highlights WHERE event_id=?', args: [eventId] })
  const maxOrder = (rows[0]?.m as number | null) ?? -1
  await db.execute({
    sql: 'INSERT INTO event_highlights (id, event_id, title, description, order_index) VALUES (?, ?, ?, ?, ?)',
    args: [randomUUID(), eventId, data.title, data.description, maxOrder + 1],
  })
}

export async function updateHighlight(id: string, formData: FormData) {
  await requireAdminSession()
  const data = parseFormData(highlightSchema, formData)
  const db = getDb()
  await db.execute({
    sql: 'UPDATE event_highlights SET title=?, description=? WHERE id=?',
    args: [data.title, data.description, id],
  })
}

export async function deleteHighlight(id: string) {
  await requireAdminSession()
  const db = getDb()
  await db.execute({ sql: 'DELETE FROM event_highlights WHERE id=?', args: [id] })
}

export async function reorderHighlights(ids: string[]) {
  await requireAdminSession()
  const db = getDb()
  for (let i = 0; i < ids.length; i++) {
    await db.execute({ sql: 'UPDATE event_highlights SET order_index=? WHERE id=?', args: [i, ids[i]] })
  }
}

export async function addPhoto(eventId: string, url: string, caption: string) {
  await requireAdminSession()
  const db = getDb()
  const { rows } = await db.execute({ sql: 'SELECT MAX(order_index) as m FROM event_photos WHERE event_id=?', args: [eventId] })
  const maxOrder = (rows[0]?.m as number | null) ?? -1
  await db.execute({
    sql: 'INSERT INTO event_photos (id, event_id, url, caption, order_index) VALUES (?, ?, ?, ?, ?)',
    args: [randomUUID(), eventId, url, caption || null, maxOrder + 1],
  })
}

export async function updatePhotoCaption(id: string, formData: FormData) {
  await requireAdminSession()
  const db = getDb()
  const caption = String(formData.get('caption') ?? '')
  await db.execute({ sql: 'UPDATE event_photos SET caption=? WHERE id=?', args: [caption, id] })
}

export async function deletePhoto(id: string) {
  await requireAdminSession()
  const db = getDb()
  await db.execute({ sql: 'DELETE FROM event_photos WHERE id=?', args: [id] })
}

export async function reorderPhotos(ids: string[]) {
  await requireAdminSession()
  const db = getDb()
  for (let i = 0; i < ids.length; i++) {
    await db.execute({ sql: 'UPDATE event_photos SET order_index=? WHERE id=?', args: [i, ids[i]] })
  }
}
