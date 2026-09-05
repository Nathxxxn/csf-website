'use server'

import { revalidatePath } from 'next/cache'
import { requireAdminSession } from '@/lib/session'
import { getDb } from '@/lib/db'

export async function upsertContent(formData: FormData) {
  await requireAdminSession()
  const db = getDb()
  const keys = [
    'hero_title',
    'hero_subtitle',
    'stats_poles',
    'stats_membres',
    'stats_etudiants',
    'stats_evenements',
    'partners_marquee_label',
    'partners_cta_eyebrow',
    'partners_cta_title',
    'partners_cta_body',
    'partners_cta_primary_label',
    'partners_cta_secondary_label',
    'events_eyebrow',
    'events_intro',
    'about_heading',
    'about_intro',
    'about_legal_address',
    'about_legal_rna',
  ]
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
  revalidatePath('/admin/dashboard')
}
