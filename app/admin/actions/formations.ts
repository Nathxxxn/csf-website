'use server'

import { randomUUID } from 'crypto'
import { revalidatePath } from 'next/cache'
import { requireAdminSession } from '@/lib/session'
import { getDb } from '@/lib/db'
import { formationSchema, parseFormData } from '@/lib/validation'

type FormationSupportPayload = {
  url: string
  filename: string
  mimeType?: string
}

function revalidateFormations() {
  revalidatePath('/formations')
  revalidatePath('/admin/dashboard')
}

function optionalFormString(formData: FormData, key: string): string | null {
  const value = formData.get(key)
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export async function createFormation(formData: FormData) {
  await requireAdminSession()
  const data = parseFormData(formationSchema, formData)
  const supportUrl = optionalFormString(formData, 'support_url')
  const supportFilename = optionalFormString(formData, 'support_filename')
  const db = getDb()
  const { rows } = await db.execute('SELECT MAX(order_index) as max_order FROM formations')
  const maxOrder = (rows[0]?.max_order as number | null) ?? -1

  await db.execute({
    sql: 'INSERT INTO formations (id, title, date, category, description, speaker_name, speaker_role, support_url, support_filename, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: [
      randomUUID(),
      data.title,
      data.date,
      data.category,
      data.description,
      data.speaker_name,
      data.speaker_role,
      supportUrl,
      supportUrl ? supportFilename : null,
      maxOrder + 1,
    ],
  })
  revalidateFormations()
}

export async function updateFormation(id: string, formData: FormData) {
  await requireAdminSession()
  const data = parseFormData(formationSchema, formData)
  const db = getDb()
  await db.execute({
    sql: 'UPDATE formations SET title=?, date=?, category=?, description=?, speaker_name=?, speaker_role=? WHERE id=?',
    args: [
      data.title,
      data.date,
      data.category,
      data.description,
      data.speaker_name,
      data.speaker_role,
      id,
    ],
  })
  revalidateFormations()
}

export async function updateFormationSupport(id: string, payload: FormationSupportPayload) {
  await requireAdminSession()
  const url = payload.url.trim()
  const filename = payload.filename.trim()
  if (!url || !filename) throw new Error('Support invalide')

  const db = getDb()
  await db.execute({
    sql: 'UPDATE formations SET support_url=?, support_filename=? WHERE id=?',
    args: [url, filename, id],
  })
  revalidateFormations()
}

export async function clearFormationSupport(id: string) {
  await requireAdminSession()
  const db = getDb()
  await db.execute({
    sql: 'UPDATE formations SET support_url=NULL, support_filename=NULL WHERE id=?',
    args: [id],
  })
  revalidateFormations()
}

export async function deleteFormation(id: string) {
  await requireAdminSession()
  const db = getDb()
  await db.execute({ sql: 'DELETE FROM formations WHERE id=?', args: [id] })
  revalidateFormations()
}
