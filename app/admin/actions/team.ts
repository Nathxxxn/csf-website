'use server'

import { revalidatePath } from 'next/cache'
import { randomUUID } from 'crypto'
import { requireAdminSession } from '@/lib/session'
import { getDb } from '@/lib/db'
import { poleSchema, memberSchema, parseFormData } from '@/lib/validation'

export async function createPole(formData: FormData) {
  await requireAdminSession()
  const data = parseFormData(poleSchema, formData)
  const db = getDb()
  const { rows } = await db.execute('SELECT MAX(order_index) as m FROM poles')
  const maxOrder = (rows[0]?.m as number | null) ?? -1
  await db.execute({
    sql: 'INSERT INTO poles (id, name, badge, description, order_index) VALUES (?, ?, ?, ?, ?)',
    args: [randomUUID(), data.name, data.badge, data.description, maxOrder + 1],
  })
  revalidatePath('/')
  revalidatePath('/equipe')
}

export async function updatePole(id: string, formData: FormData) {
  await requireAdminSession()
  const data = parseFormData(poleSchema, formData)
  const db = getDb()
  await db.execute({
    sql: 'UPDATE poles SET name=?, badge=?, description=? WHERE id=?',
    args: [data.name, data.badge, data.description, id],
  })
  revalidatePath('/')
  revalidatePath('/equipe')
}

export async function deletePole(id: string) {
  await requireAdminSession()
  const db = getDb()
  await db.execute({ sql: 'DELETE FROM poles WHERE id=?', args: [id] })
  revalidatePath('/')
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
  const data = parseFormData(memberSchema, formData)
  const linkedin = data.linkedin === '' ? null : (data.linkedin ?? null)
  const db = getDb()
  const { rows } = await db.execute({ sql: 'SELECT MAX(order_index) as m FROM team_members WHERE pole_id=?', args: [data.pole_id] })
  const maxOrder = (rows[0]?.m as number | null) ?? -1
  await db.execute({
    sql: 'INSERT INTO team_members (id, name, role, photo_url, linkedin, pole_id, order_index) VALUES (?, ?, ?, ?, ?, ?, ?)',
    args: [randomUUID(), data.name, data.role, null, linkedin, data.pole_id, maxOrder + 1],
  })
  revalidatePath('/')
  revalidatePath('/equipe')
}

export async function updateMember(id: string, formData: FormData) {
  await requireAdminSession()
  const data = parseFormData(memberSchema, formData)
  const linkedin = data.linkedin === '' ? null : (data.linkedin ?? null)
  const db = getDb()
  await db.execute({
    sql: 'UPDATE team_members SET name=?, role=?, linkedin=?, pole_id=? WHERE id=?',
    args: [data.name, data.role, linkedin, data.pole_id, id],
  })
  revalidatePath('/')
  revalidatePath('/equipe')
}

export async function updateMemberPhoto(id: string, photoUrl: string) {
  await requireAdminSession()
  const db = getDb()
  await db.execute({ sql: 'UPDATE team_members SET photo_url=? WHERE id=?', args: [photoUrl, id] })
  revalidatePath('/')
  revalidatePath('/equipe')
}

export async function deleteMember(id: string) {
  await requireAdminSession()
  const db = getDb()
  await db.execute({ sql: 'DELETE FROM team_members WHERE id=?', args: [id] })
  revalidatePath('/')
  revalidatePath('/equipe')
}

export async function reorderMembers(ids: string[]) {
  await requireAdminSession()
  const db = getDb()
  for (let i = 0; i < ids.length; i++) {
    await db.execute({ sql: 'UPDATE team_members SET order_index=? WHERE id=?', args: [i, ids[i]] })
  }
}
