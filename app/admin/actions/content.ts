'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyCookie, SESSION_COOKIE_NAME } from '@/lib/session'
import { getDb } from '@/lib/db'

async function requireSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  const session = verifyCookie(token)
  if (!session) redirect('/admin')
}

export async function upsertContent(formData: FormData) {
  await requireSession()
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
}
