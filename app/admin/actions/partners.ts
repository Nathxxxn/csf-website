'use server'

import { revalidatePath } from 'next/cache'
import { randomUUID } from 'crypto'
import { requireAdminSession } from '@/lib/session'
import { getDb } from '@/lib/db'
import { partnerSchema, parseFormData } from '@/lib/validation'

function revalidateAll() {
  revalidatePath('/')
  revalidatePath('/admin/dashboard')
}

export async function createPartner(formData: FormData) {
  await requireAdminSession()
  const data = parseFormData(partnerSchema, formData)
  const db = getDb()
  const { rows } = await db.execute('SELECT MAX(order_index) as m FROM partners')
  const maxOrder = (rows[0]?.m as number | null) ?? -1
  await db.execute({
    sql: 'INSERT INTO partners (id, name, logo_url, order_index) VALUES (?, ?, ?, ?)',
    args: [randomUUID(), data.name, data.logo_url, maxOrder + 1],
  })
  revalidateAll()
}

export async function updatePartner(id: string, formData: FormData) {
  await requireAdminSession()
  const data = parseFormData(partnerSchema, formData)
  const db = getDb()
  await db.execute({
    sql: 'UPDATE partners SET name=?, logo_url=? WHERE id=?',
    args: [data.name, data.logo_url, id],
  })
  revalidateAll()
}

export async function deletePartner(id: string) {
  await requireAdminSession()
  const db = getDb()
  await db.execute({ sql: 'DELETE FROM partners WHERE id=?', args: [id] })
  revalidateAll()
}

export async function reorderPartners(ids: string[]) {
  await requireAdminSession()
  const db = getDb()
  for (let i = 0; i < ids.length; i++) {
    await db.execute({ sql: 'UPDATE partners SET order_index=? WHERE id=?', args: [i, ids[i]] })
  }
  revalidateAll()
}

export async function updatePartnerLogo(id: string, logoUrl: string) {
  await requireAdminSession()
  const db = getDb()
  await db.execute({ sql: 'UPDATE partners SET logo_url=? WHERE id=?', args: [logoUrl, id] })
  revalidateAll()
}

export async function createPartnerWithLogoUrl(name: string, logoUrl: string) {
  await requireAdminSession()
  const db = getDb()
  const { rows } = await db.execute('SELECT MAX(order_index) as m FROM partners')
  const maxOrder = (rows[0]?.m as number | null) ?? -1
  await db.execute({
    sql: 'INSERT INTO partners (id, name, logo_url, order_index) VALUES (?, ?, ?, ?)',
    args: [randomUUID(), name, logoUrl, maxOrder + 1],
  })
  revalidateAll()
}
