'use server'

import { requireAdminSession } from '@/lib/session'
import { getDb } from '@/lib/db'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'

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
}

export async function handleBlobUpload(body: HandleUploadBody) {
  await requireAdminSession()
  return handleUpload({
    body,
    request: { headers: new Headers() } as Request,
    onBeforeGenerateToken: async () => ({ allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] }),
    onUploadCompleted: async () => {},
  })
}
