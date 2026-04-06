import eventsJson from '@/data/events.json'
import partnersJson from '@/data/partners.json'
import type { PoleData, Event, Partner, AdminPole, AdminEvent, AdminPartner, SiteContent } from './types'
import { getDb } from './db'

function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string') throw new Error(`Expected string for field "${field}", got ${typeof value}`)
  return value
}

// --- Fonctions publiques (utilisées par les pages du site) ---

export async function getTeam(): Promise<PoleData[]> {
  const db = getDb()
  const { rows: poles } = await db.execute('SELECT * FROM poles ORDER BY order_index')
  const { rows: members } = await db.execute('SELECT * FROM team_members ORDER BY order_index')

  return poles.map(pole => ({
    pole: requireString(pole.name, 'pole.name'),
    badge: requireString(pole.badge, 'pole.badge'),
    description: requireString(pole.description, 'pole.description'),
    members: members
      .filter(m => m.pole_id === pole.id)
      .map(m => ({
        name: requireString(m.name, 'member.name'),
        role: requireString(m.role, 'member.role'),
        photo: (m.photo_url as string | null) ?? null,
        linkedin: (m.linkedin as string | null) ?? null,
      })),
  }))
}

export async function getEvents(): Promise<Event[]> {
  return eventsJson.map(e => ({
    ...e,
    status: e.status as 'upcoming' | 'past',
  }))
}

export async function getUpcomingEvents(): Promise<Event[]> {
  const events = await getEvents()
  return events
    .filter(e => e.status === 'upcoming')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export async function getPastEvents(): Promise<Event[]> {
  const events = await getEvents()
  return events
    .filter(e => e.status === 'past')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function getPartners(): Promise<Partner[]> {
  return partnersJson as Partner[]
}

export async function getEventById(id: string): Promise<Event | undefined> {
  const events = await getEvents()
  return events.find(e => e.id === id)
}

// --- Fonctions admin (avec IDs) ---

export async function getAdminTeam(): Promise<AdminPole[]> {
  const db = getDb()
  const { rows: poles } = await db.execute('SELECT * FROM poles ORDER BY order_index')
  const { rows: members } = await db.execute('SELECT * FROM team_members ORDER BY order_index')

  return poles.map(pole => ({
    id: requireString(pole.id, 'pole.id'),
    name: requireString(pole.name, 'pole.name'),
    badge: requireString(pole.badge, 'pole.badge'),
    description: requireString(pole.description, 'pole.description'),
    order_index: pole.order_index as number,
    members: members
      .filter(m => m.pole_id === pole.id)
      .map(m => ({
        id: requireString(m.id, 'member.id'),
        name: requireString(m.name, 'member.name'),
        role: requireString(m.role, 'member.role'),
        photo_url: (m.photo_url as string | null) ?? null,
        linkedin: (m.linkedin as string | null) ?? null,
        pole_id: requireString(m.pole_id, 'member.pole_id'),
        order_index: m.order_index as number,
      })),
  }))
}

export async function getAdminEvents(): Promise<AdminEvent[]> {
  const db = getDb()
  const { rows: eventRows } = await db.execute('SELECT * FROM events ORDER BY order_index')
  const { rows: highlightRows } = await db.execute('SELECT * FROM event_highlights ORDER BY order_index')
  const { rows: photoRows } = await db.execute('SELECT * FROM event_photos ORDER BY order_index')

  return eventRows.map(e => {
    const status = requireString(e.status, 'event.status')
    if (status !== 'upcoming' && status !== 'past') throw new Error(`Invalid event status: "${status}"`)
    return {
      id: requireString(e.id, 'event.id'),
      title: requireString(e.title, 'event.title'),
      date: requireString(e.date, 'event.date'),
      partner: requireString(e.partner, 'event.partner'),
      partner_description: (e.partner_description as string | null) ?? null,
      pole: (e.pole as string | null) ?? null,
      description: requireString(e.description, 'event.description'),
      image_url: (e.image_url as string | null) ?? null,
      status,
      order_index: e.order_index as number,
      highlights: highlightRows
        .filter(h => h.event_id === e.id)
        .map(h => ({
          id: requireString(h.id, 'highlight.id'),
          event_id: requireString(h.event_id, 'highlight.event_id'),
          title: requireString(h.title, 'highlight.title'),
          description: requireString(h.description, 'highlight.description'),
          order_index: h.order_index as number,
        })),
      photos: photoRows
        .filter(p => p.event_id === e.id)
        .map(p => ({
          id: requireString(p.id, 'photo.id'),
          event_id: requireString(p.event_id, 'photo.event_id'),
          url: requireString(p.url, 'photo.url'),
          caption: (p.caption as string | null) ?? null,
          order_index: p.order_index as number,
        })),
    }
  })
}

export async function getAdminEventById(id: string): Promise<AdminEvent | undefined> {
  const events = await getAdminEvents()
  return events.find(e => e.id === id)
}

export async function getAdminPartners(): Promise<AdminPartner[]> {
  const db = getDb()
  const { rows } = await db.execute('SELECT * FROM partners ORDER BY order_index')
  return rows.map(p => ({
    id: requireString(p.id, 'partner.id'),
    name: requireString(p.name, 'partner.name'),
    logo_url: requireString(p.logo_url, 'partner.logo_url'),
    order_index: p.order_index as number,
  }))
}

export async function getSiteContent(): Promise<SiteContent> {
  const db = getDb()
  const { rows } = await db.execute('SELECT key, value FROM site_content')
  const map = Object.fromEntries(rows.map(r => [r.key as string, r.value as string]))
  return {
    hero_title: map['hero_title'] ?? '',
    hero_subtitle: map['hero_subtitle'] ?? '',
    stats_poles: map['stats_poles'] ?? '',
    stats_membres: map['stats_membres'] ?? '',
    stats_evenements: map['stats_evenements'] ?? '',
    apropos_mission_title: map['apropos_mission_title'] ?? '',
    apropos_mission_text: map['apropos_mission_text'] ?? '',
  }
}
