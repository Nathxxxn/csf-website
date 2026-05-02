'use server'

import { revalidatePath } from 'next/cache'
import { requireAdminSession } from '@/lib/session'
import { getDb } from '@/lib/db'

export async function upsertContent(formData: FormData) {
  await requireAdminSession()
  const db = getDb()
  const keys = ['hero_title', 'hero_subtitle', 'stats_poles', 'stats_membres', 'stats_evenements', 'apropos_mission_title', 'apropos_mission_text']
  for (const key of keys) {
    const value = formData.get(key)
    if (value !== null) {
      await db.execute({
        sql: 'INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)',
        args: [key, String(value)],
      })
    }
  }
  revalidatePath('/')
  revalidatePath('/a-propos')
  revalidatePath('/admin/dashboard')
}
