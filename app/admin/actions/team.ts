'use server'

import { revalidatePath } from 'next/cache'
import { randomUUID } from 'crypto'
import { requireAdminSession } from '@/lib/session'
import { getDb } from '@/lib/db'

export async function createPole(formData: FormData) {
  await requireAdminSession()
  const db = getDb()
  const { rows } = await db.execute('SELECT MAX(order_index) as m FROM poles')
  const maxOrder = (rows[0]?.m as number | null) ?? -1
  await db.execute({
    sql: 'INSERT INTO poles (id, name, badge, description, order_index) VALUES (?, ?, ?, ?, ?)',
    args: [randomUUID(), String(formData.get('name') ?? ''), String(formData.get('badge') ?? ''), String(formData.get('description') ?? ''), maxOrder + 1],
  })
  revalidatePath('/equipe')
}

export async function updatePole(id: string, formData: FormData) {
  await requireAdminSession()
  const db = getDb()
  await db.execute({
    sql: 'UPDATE poles SET name=?, badge=?, description=? WHERE id=?',
    args: [String(formData.get('name') ?? ''), String(formData.get('badge') ?? ''), String(formData.get('description') ?? ''), id],
  })
  revalidatePath('/equipe')
}

export async function deletePole(id: string) {
  await requireAdminSession()
  const db = getDb()
  await db.execute({ sql: 'DELETE FROM poles WHERE id=?', args: [id] })
  revalidatePath('/equipe')
}

export async function reorderPoles(ids: string[]) {
  await requireAdminSession()
  const db = getDb()
  for (let i = 0; i < ids.length; i++) {
    await db.execute({ sql: 'UPDATE poles SET order_index=? WHERE id=?', args: [i, ids[i]] })
  }
}

export async function createMember(formData: FormData) {
  await requireAdminSession()
  const db = getDb()
  const poleId = String(formData.get('pole_id') ?? '')
  const { rows } = await db.execute({ sql: 'SELECT MAX(order_index) as m FROM team_members WHERE pole_id=?', args: [poleId] })
  const maxOrder = (rows[0]?.m as number | null) ?? -1
  await db.execute({
    sql: 'INSERT INTO team_members (id, name, role, photo_url, linkedin, pole_id, order_index) VALUES (?, ?, ?, ?, ?, ?, ?)',
    args: [randomUUID(), String(formData.get('name') ?? ''), String(formData.get('role') ?? ''), null, formData.get('linkedin') ? String(formData.get('linkedin')) : null, poleId, maxOrder + 1],
  })
  revalidatePath('/equipe')
}

export async function updateMember(id: string, formData: FormData) {
  await requireAdminSession()
  const db = getDb()
  await db.execute({
    sql: 'UPDATE team_members SET name=?, role=?, linkedin=?, pole_id=? WHERE id=?',
    args: [String(formData.get('name') ?? ''), String(formData.get('role') ?? ''), formData.get('linkedin') ? String(formData.get('linkedin')) : null, String(formData.get('pole_id') ?? ''), id],
  })
  revalidatePath('/equipe')
}

export async function updateMemberPhoto(id: string, photoUrl: string) {
  await requireAdminSession()
  const db = getDb()
  await db.execute({ sql: 'UPDATE team_members SET photo_url=? WHERE id=?', args: [photoUrl, id] })
  revalidatePath('/equipe')
}

export async function deleteMember(id: string) {
  await requireAdminSession()
  const db = getDb()
  await db.execute({ sql: 'DELETE FROM team_members WHERE id=?', args: [id] })
  revalidatePath('/equipe')
}

export async function reorderMembers(ids: string[]) {
  await requireAdminSession()
  const db = getDb()
  for (let i = 0; i < ids.length; i++) {
    await db.execute({ sql: 'UPDATE team_members SET order_index=? WHERE id=?', args: [i, ids[i]] })
  }
}
