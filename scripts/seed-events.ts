// scripts/seed-events.ts
// Usage: npx tsx scripts/seed-events.ts
import { createClient } from '@libsql/client'
import { readFileSync } from 'fs'
import { randomUUID } from 'crypto'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

type RawEvent = {
  id: string
  title: string
  date: string
  partner: string
  partnerDescription?: string
  pole?: string | null
  description: string
  image?: string | null
  status: 'upcoming' | 'past'
  highlights?: Array<{ title: string; description: string }>
  photos?: Array<{ src: string; caption?: string }>
}

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
})

const eventsJson: RawEvent[] = JSON.parse(readFileSync('./data/events.json', 'utf-8'))

async function main() {
  console.log(`Migrating ${eventsJson.length} events...`)

  for (const [i, e] of eventsJson.entries()) {
    // Check if already exists
    const { rows } = await db.execute({ sql: 'SELECT id FROM events WHERE id=?', args: [e.id] })
    if (rows.length > 0) {
      console.log(`  ⏭  Already in DB: ${e.title}`)
      continue
    }

    await db.execute({
      sql: 'INSERT INTO events (id, title, date, partner, partner_description, pole, description, image_url, status, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args: [
        e.id,
        e.title,
        e.date,
        e.partner,
        e.partnerDescription ?? null,
        e.pole ?? null,
        e.description,
        e.image ?? null,
        e.status,
        i,
      ],
    })

    for (const [hi, h] of (e.highlights ?? []).entries()) {
      await db.execute({
        sql: 'INSERT INTO event_highlights (id, event_id, title, description, order_index) VALUES (?, ?, ?, ?, ?)',
        args: [randomUUID(), e.id, h.title, h.description, hi],
      })
    }

    for (const [pi, p] of (e.photos ?? []).entries()) {
      await db.execute({
        sql: 'INSERT INTO event_photos (id, event_id, url, caption, order_index) VALUES (?, ?, ?, ?, ?)',
        args: [randomUUID(), e.id, p.src, p.caption ?? null, pi],
      })
    }

    console.log(`  ✓  Migrated: ${e.title}`)
  }

  const { rows: countRows } = await db.execute('SELECT COUNT(*) as n FROM events')
  console.log(`Done. DB now has ${countRows[0]?.n} events.`)
  process.exit(0)
}

main().catch(err => { console.error(err); process.exit(1) })
