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

export async function createPartner(formData: FormData) {
  await requireSession()
  const db = getDb()
  const { rows } = await db.execute('SELECT MAX(order_index) as m FROM partners')
  const maxOrder = (rows[0]?.m as number | null) ?? -1
  await db.execute({
    sql: 'INSERT INTO partners (id, name, logo_url, order_index) VALUES (?, ?, ?, ?)',
    args: [randomUUID(), String(formData.get('name') ?? ''), String(formData.get('logo_url') ?? ''), maxOrder + 1],
  })
  revalidatePath('/')
}

export async function updatePartner(id: string, formData: FormData) {
  await requireSession()
  const db = getDb()
  await db.execute({
    sql: 'UPDATE partners SET name=?, logo_url=? WHERE id=?',
    args: [String(formData.get('name') ?? ''), String(formData.get('logo_url') ?? ''), id],
  })
  revalidatePath('/')
}

export async function deletePartner(id: string) {
  await requireSession()
  const db = getDb()
  await db.execute({ sql: 'DELETE FROM partners WHERE id=?', args: [id] })
  revalidatePath('/')
}

export async function reorderPartners(ids: string[]) {
  await requireSession()
  const db = getDb()
  for (let i = 0; i < ids.length; i++) {
    await db.execute({ sql: 'UPDATE partners SET order_index=? WHERE id=?', args: [i, ids[i]] })
  }
}

export async function updatePartnerLogo(id: string, logoUrl: string) {
  await requireSession()
  const db = getDb()
  await db.execute({ sql: 'UPDATE partners SET logo_url=? WHERE id=?', args: [logoUrl, id] })
  revalidatePath('/')
}

export async function createPartnerWithLogoUrl(name: string, logoUrl: string) {
  await requireSession()
  const db = getDb()
  const { rows } = await db.execute('SELECT MAX(order_index) as m FROM partners')
  const maxOrder = (rows[0]?.m as number | null) ?? -1
  await db.execute({
    sql: 'INSERT INTO partners (id, name, logo_url, order_index) VALUES (?, ?, ?, ?)',
    args: [randomUUID(), name, logoUrl, maxOrder + 1],
  })
  revalidatePath('/')
}
