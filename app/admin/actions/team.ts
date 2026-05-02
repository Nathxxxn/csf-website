'use server'

import { revalidatePath } from 'next/cache'
import { randomUUID } from 'crypto'
import { requireAdminSession } from '@/lib/session'
import { getDb } from '@/lib/db'
import { poleSchema, memberSchema, parseFormData } from '@/lib/validation'

function revalidateAll() {
  revalidatePath('/')
  revalidatePath('/equipe')
  revalidatePath('/admin/dashboard')
}

function optionalText(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function skillsToJson(value: string | null | undefined): string {
  const skills = (value ?? '')
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean)

  return JSON.stringify(skills)
}

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
  revalidateAll()
}

export async function updatePole(id: string, formData: FormData) {
  await requireAdminSession()
  const data = parseFormData(poleSchema, formData)
  const db = getDb()
  await db.execute({
    sql: 'UPDATE poles SET name=?, badge=?, description=? WHERE id=?',
    args: [data.name, data.badge, data.description, id],
  })
  revalidateAll()
}

export async function deletePole(id: string) {
  await requireAdminSession()
  const db = getDb()
  await db.execute({ sql: 'DELETE FROM poles WHERE id=?', args: [id] })
  revalidateAll()
}

export async function reorderPoles(ids: string[]) {
  await requireAdminSession()
  const db = getDb()
  for (let i = 0; i < ids.length; i++) {
    await db.execute({ sql: 'UPDATE poles SET order_index=? WHERE id=?', args: [i, ids[i]] })
  }
  revalidateAll()
}

export async function createMember(formData: FormData) {
  await requireAdminSession()
  const data = parseFormData(memberSchema, formData)
  const linkedin = optionalText(data.linkedin)
  const tagline = optionalText(data.tagline)
  const bio = optionalText(data.bio)
  const promo = optionalText(data.promo)
  const joinedYear = optionalText(data.joined_year)
  const contributions = data.contributions ?? null
  const skills = skillsToJson(data.skills)
  const email = optionalText(data.email)
  const db = getDb()
  const { rows } = await db.execute({ sql: 'SELECT MAX(order_index) as m FROM team_members WHERE pole_id=?', args: [data.pole_id] })
  const maxOrder = (rows[0]?.m as number | null) ?? -1
  await db.execute({
    sql: 'INSERT INTO team_members (id, name, role, photo_url, linkedin, tagline, bio, promo, joined_year, contributions, skills, email, pole_id, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: [
      randomUUID(),
      data.name,
      data.role,
      null,
      linkedin,
      tagline,
      bio,
      promo,
      joinedYear,
      contributions,
      skills,
      email,
      data.pole_id,
      maxOrder + 1,
    ],
  })
  revalidateAll()
}

export async function updateMember(id: string, formData: FormData) {
  await requireAdminSession()
  const data = parseFormData(memberSchema, formData)
  const linkedin = optionalText(data.linkedin)
  const tagline = optionalText(data.tagline)
  const bio = optionalText(data.bio)
  const promo = optionalText(data.promo)
  const joinedYear = optionalText(data.joined_year)
  const contributions = data.contributions ?? null
  const skills = skillsToJson(data.skills)
  const email = optionalText(data.email)
  const db = getDb()
  await db.execute({
    sql: 'UPDATE team_members SET name=?, role=?, linkedin=?, tagline=?, bio=?, promo=?, joined_year=?, contributions=?, skills=?, email=?, pole_id=? WHERE id=?',
    args: [
      data.name,
      data.role,
      linkedin,
      tagline,
      bio,
      promo,
      joinedYear,
      contributions,
      skills,
      email,
      data.pole_id,
      id,
    ],
  })
  revalidateAll()
}

export async function updateMemberPhoto(id: string, photoUrl: string) {
  await requireAdminSession()
  const db = getDb()
  await db.execute({ sql: 'UPDATE team_members SET photo_url=? WHERE id=?', args: [photoUrl, id] })
  revalidateAll()
}

export async function deleteMember(id: string) {
  await requireAdminSession()
  const db = getDb()
  await db.execute({ sql: 'DELETE FROM team_members WHERE id=?', args: [id] })
  revalidateAll()
}

export async function reorderMembers(ids: string[]) {
  await requireAdminSession()
  const db = getDb()
  for (let i = 0; i < ids.length; i++) {
    await db.execute({ sql: 'UPDATE team_members SET order_index=? WHERE id=?', args: [i, ids[i]] })
  }
  revalidateAll()
}
