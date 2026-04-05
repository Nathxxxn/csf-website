import type { PoleData, Event, Partner, AdminPole, AdminEvent, AdminPartner, SiteContent } from './types'
import { getDb } from './db'

// --- Fonctions publiques (utilisées par les pages du site) ---

export async function getTeam(): Promise<PoleData[]> {
  const db = getDb()
  const { rows: poles } = await db.execute('SELECT * FROM poles ORDER BY order_index')
  const { rows: members } = await db.execute('SELECT * FROM team_members ORDER BY order_index')

  return poles.map(pole => ({
    pole: pole.name as string,
    badge: pole.badge as string,
    description: pole.description as string,
    members: members
      .filter(m => m.pole_id === pole.id)
      .map(m => ({
        name: m.name as string,
        role: m.role as string,
        photo: (m.photo_url as string | null) ?? null,
        linkedin: (m.linkedin as string | null) ?? null,
      })),
  }))
}

export async function getEvents(): Promise<Event[]> {
  const db = getDb()
  const { rows: eventRows } = await db.execute('SELECT * FROM events ORDER BY order_index')
  const { rows: highlightRows } = await db.execute('SELECT * FROM event_highlights ORDER BY order_index')
  const { rows: photoRows } = await db.execute('SELECT * FROM event_photos ORDER BY order_index')

  return eventRows.map(e => ({
    id: e.id as string,
    title: e.title as string,
    date: e.date as string,
    partner: e.partner as string,
    partnerDescription: (e.partner_description as string | null) ?? undefined,
    pole: (e.pole as string | null) ?? '',
    description: e.description as string,
    image: (e.image_url as string | null) ?? null,
    images: [],
    status: e.status as 'upcoming' | 'past',
    highlights: highlightRows
      .filter(h => h.event_id === e.id)
      .map(h => ({ title: h.title as string, description: h.description as string })),
    photos: photoRows
      .filter(p => p.event_id === e.id)
      .map(p => ({ src: p.url as string, caption: (p.caption as string | null) ?? '' })),
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
  const db = getDb()
  const { rows } = await db.execute('SELECT * FROM partners ORDER BY order_index')
  return rows.map(p => ({
    name: p.name as string,
    logo: p.logo_url as string,
  }))
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
    id: pole.id as string,
    name: pole.name as string,
    badge: pole.badge as string,
    description: pole.description as string,
    order_index: pole.order_index as number,
    members: members
      .filter(m => m.pole_id === pole.id)
      .map(m => ({
        id: m.id as string,
        name: m.name as string,
        role: m.role as string,
        photo_url: (m.photo_url as string | null) ?? null,
        linkedin: (m.linkedin as string | null) ?? null,
        pole_id: m.pole_id as string,
        order_index: m.order_index as number,
      })),
  }))
}

export async function getAdminEvents(): Promise<AdminEvent[]> {
  const db = getDb()
  const { rows: eventRows } = await db.execute('SELECT * FROM events ORDER BY order_index')
  const { rows: highlightRows } = await db.execute('SELECT * FROM event_highlights ORDER BY order_index')
  const { rows: photoRows } = await db.execute('SELECT * FROM event_photos ORDER BY order_index')

  return eventRows.map(e => ({
    id: e.id as string,
    title: e.title as string,
    date: e.date as string,
    partner: e.partner as string,
    partner_description: (e.partner_description as string | null) ?? null,
    pole: (e.pole as string | null) ?? null,
    description: e.description as string,
    image_url: (e.image_url as string | null) ?? null,
    status: e.status as 'upcoming' | 'past',
    order_index: e.order_index as number,
    highlights: highlightRows
      .filter(h => h.event_id === e.id)
      .map(h => ({
        id: h.id as string,
        event_id: h.event_id as string,
        title: h.title as string,
        description: h.description as string,
        order_index: h.order_index as number,
      })),
    photos: photoRows
      .filter(p => p.event_id === e.id)
      .map(p => ({
        id: p.id as string,
        event_id: p.event_id as string,
        url: p.url as string,
        caption: (p.caption as string | null) ?? null,
        order_index: p.order_index as number,
      })),
  }))
}

export async function getAdminEventById(id: string): Promise<AdminEvent | undefined> {
  const events = await getAdminEvents()
  return events.find(e => e.id === id)
}

export async function getAdminPartners(): Promise<AdminPartner[]> {
  const db = getDb()
  const { rows } = await db.execute('SELECT * FROM partners ORDER BY order_index')
  return rows.map(p => ({
    id: p.id as string,
    name: p.name as string,
    logo_url: p.logo_url as string,
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
