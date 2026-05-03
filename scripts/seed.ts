// scripts/seed.ts
import { createClient } from '@libsql/client'
import { existsSync, readFileSync } from 'fs'
import { randomUUID } from 'crypto'
import type { PoleData, Event, Partner } from '../lib/types'

const schemaSQL = readFileSync('./lib/schema.sql', 'utf-8')

const url = process.env.TURSO_DATABASE_URL
if (!url) throw new Error('TURSO_DATABASE_URL is not set')

const db = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN })

const team: PoleData[] = JSON.parse(readFileSync('./data/team.json', 'utf-8'))
const events: Event[] = JSON.parse(readFileSync('./data/events.json', 'utf-8'))
const partners: Partner[] = JSON.parse(readFileSync('./data/partners.json', 'utf-8'))

type SeedFormation = {
  id: string
  title: string
  date: string
  category: string
  description: string
  speakerName: string
  speakerRole: string
  supportUrl?: string | null
  supportFilename?: string | null
}

const formations: SeedFormation[] = existsSync('./data/formations.json')
  ? JSON.parse(readFileSync('./data/formations.json', 'utf-8'))
  : []

async function seed() {
  // Apply schema
  for (const statement of schemaSQL.split(';').map(s => s.trim()).filter(Boolean)) {
    await db.execute(statement)
  }

  // Seed poles + members
  for (let poleIndex = 0; poleIndex < team.length; poleIndex++) {
    const poleData = team[poleIndex]
    const poleId = randomUUID()
    await db.execute({
      sql: 'INSERT OR IGNORE INTO poles (id, name, badge, description, order_index) VALUES (?, ?, ?, ?, ?)',
      args: [poleId, poleData.pole, poleData.badge, poleData.description, poleIndex],
    })
    for (let memberIndex = 0; memberIndex < poleData.members.length; memberIndex++) {
      const m = poleData.members[memberIndex]
      await db.execute({
        sql: 'INSERT OR IGNORE INTO team_members (id, name, role, photo_url, linkedin, tagline, bio, promo, joined_year, contributions, skills, email, pole_id, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        args: [
          randomUUID(),
          m.name,
          m.role,
          m.photo ?? null,
          m.linkedin ?? null,
          m.tagline ?? null,
          m.bio ?? null,
          m.promo ?? null,
          m.joinedYear ?? null,
          m.contributions ?? null,
          JSON.stringify(m.skills ?? []),
          m.email ?? null,
          poleId,
          memberIndex,
        ],
      })
    }
  }

  // Seed events
  for (let eventIndex = 0; eventIndex < events.length; eventIndex++) {
    const e = events[eventIndex]
    await db.execute({
      sql: 'INSERT OR IGNORE INTO events (id, title, date, partner, partner_description, pole, description, image_url, status, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args: [e.id, e.title, e.date, e.partner, e.partnerDescription ?? null, e.pole ?? null, e.description, e.image ?? null, e.status, eventIndex],
    })
    if (e.highlights) {
      for (let hIndex = 0; hIndex < e.highlights.length; hIndex++) {
        const h = e.highlights[hIndex]
        await db.execute({
          sql: 'INSERT OR IGNORE INTO event_highlights (id, event_id, title, description, order_index) VALUES (?, ?, ?, ?, ?)',
          args: [randomUUID(), e.id, h.title, h.description, hIndex],
        })
      }
    }
    if (e.photos) {
      for (let pIndex = 0; pIndex < e.photos.length; pIndex++) {
        const p = e.photos[pIndex]
        await db.execute({
          sql: 'INSERT OR IGNORE INTO event_photos (id, event_id, url, caption, order_index) VALUES (?, ?, ?, ?, ?)',
          args: [randomUUID(), e.id, p.src, p.caption ?? null, pIndex],
        })
      }
    }
  }

  // Seed partners
  for (let partnerIndex = 0; partnerIndex < partners.length; partnerIndex++) {
    const p = partners[partnerIndex]
    await db.execute({
      sql: 'INSERT OR IGNORE INTO partners (id, name, logo_url, order_index) VALUES (?, ?, ?, ?)',
      args: [randomUUID(), p.name, p.logo, partnerIndex],
    })
  }

  // Seed formations when a real data/formations.json file exists.
  for (let formationIndex = 0; formationIndex < formations.length; formationIndex++) {
    const f = formations[formationIndex]
    await db.execute({
      sql: 'INSERT OR IGNORE INTO formations (id, title, date, category, description, speaker_name, speaker_role, support_url, support_filename, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args: [
        f.id,
        f.title,
        f.date,
        f.category,
        f.description,
        f.speakerName,
        f.speakerRole,
        f.supportUrl ?? null,
        f.supportFilename ?? null,
        formationIndex,
      ],
    })
  }

  // Seed site_content defaults
  const defaults: Array<[string, string]> = [
    ['hero_title', "Cultivons l'excellence financière"],
    ['hero_subtitle', 'La Compagnie des Étudiants en Finance vous accompagne dans votre parcours vers les métiers de la finance.'],
    ['stats_poles', '6'],
    ['stats_membres', '200+'],
    ['stats_evenements', '20+'],
  ]
  for (const [key, value] of defaults) {
    await db.execute({
      sql: 'INSERT OR IGNORE INTO site_content (key, value) VALUES (?, ?)',
      args: [key, value],
    })
  }

  console.log('✓ Seed terminé')
}

seed().catch(console.error)
