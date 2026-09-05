import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const executeMock = vi.fn()

vi.mock('@/lib/db', () => ({
  getDb: () => ({ execute: executeMock }),
}))

beforeEach(() => {
  vi.resetModules()
  executeMock.mockReset()
})

describe('getTeam', () => {
  afterEach(() => { vi.resetAllMocks() })

  it('returns poles with their members', async () => {
    executeMock
      .mockResolvedValueOnce({
        rows: [
          { id: 'p1', name: 'Bureau', badge: 'BUR', description: 'Le bureau', order_index: 0 },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'm1',
            name: 'Alice',
            role: 'Présidente',
            photo_url: null,
            linkedin: null,
            tagline: 'Phrase courte',
            bio: 'Bio publique',
            promo: '3A',
            joined_year: '2024',
            contributions: 7,
            skills: '["M&A","Strategy"]',
            email: 'alice@example.com',
            pole_id: 'p1',
            order_index: 0,
          },
        ],
      })

    const { getTeam } = await import('@/lib/data')
    const result = await getTeam()

    expect(result).toHaveLength(1)
    expect(result[0].pole).toBe('Bureau')
    expect(result[0].members).toHaveLength(1)
    expect(result[0].members[0].name).toBe('Alice')
    expect(result[0].members[0]).toMatchObject({
      tagline: 'Phrase courte',
      bio: 'Bio publique',
      promo: '3A',
      joinedYear: '2024',
      contributions: 7,
      skills: ['M&A', 'Strategy'],
      email: 'alice@example.com',
    })
  })
})

describe('getEvents', () => {
  afterEach(() => { vi.resetAllMocks() })

  it('returns events with highlights and photos from the db', async () => {
    executeMock
      .mockResolvedValueOnce({
        rows: [{
          id: 'event-1',
          title: 'Conférence',
          date: '2026-05-20',
          partner: 'BNP',
          partner_description: 'Banque partenaire',
          pole: 'Markets',
          description: 'Description',
          image_url: '/event.jpg',
          status: 'upcoming',
          order_index: 0,
        }],
      })
      .mockResolvedValueOnce({ rows: [{ event_id: 'event-1', title: 'Point clé', description: 'Détail', order_index: 0 }] })
      .mockResolvedValueOnce({ rows: [{ event_id: 'event-1', url: '/photo.jpg', caption: 'Photo', order_index: 0 }] })

    const { getEvents } = await import('@/lib/data')
    const result = await getEvents()

    expect(result).toHaveLength(1)
    expect(result[0].highlights).toEqual([{ title: 'Point clé', description: 'Détail' }])
    expect(result[0].photos).toEqual([{ src: '/photo.jpg', caption: 'Photo' }])
  })
})

describe('getPartners', () => {
  afterEach(() => { vi.resetAllMocks() })

  it('returns partners from the db', async () => {
    executeMock.mockResolvedValueOnce({ rows: [{ name: 'Goldman Sachs', logo_url: '/images/partners/goldman.png', order_index: 0 }] })

    const { getPartners } = await import('@/lib/data')
    const result = await getPartners()

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Goldman Sachs')
    expect(result[0].logo).toBe('/images/partners/goldman.png')
  })
})

describe('getEventById', () => {
  afterEach(() => { vi.resetAllMocks() })

  it('returns the event when found', async () => {
    executeMock
      .mockResolvedValueOnce({ rows: [{ id: 'event-1', title: 'Conférence', date: '2026-05-20', partner: 'BNP', partner_description: null, pole: null, description: 'Description', image_url: null, status: 'upcoming', order_index: 0 }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })

    const { getEventById } = await import('@/lib/data')
    const result = await getEventById('event-1')
    expect(result).toBeDefined()
    expect(result?.id).toBe('event-1')
  })

  it('returns undefined when not found', async () => {
    executeMock
      .mockResolvedValueOnce({ rows: [{ id: 'event-1', title: 'Conférence', date: '2026-05-20', partner: 'BNP', partner_description: null, pole: null, description: 'Description', image_url: null, status: 'upcoming', order_index: 0 }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })

    const { getEventById } = await import('@/lib/data')
    const result = await getEventById('nonexistent')
    expect(result).toBeUndefined()
  })
})

describe('getAdminTeam', () => {
  afterEach(() => { vi.resetAllMocks() })

  it('returns admin poles with members including IDs', async () => {
    executeMock
      .mockResolvedValueOnce({ rows: [{ id: 'p1', name: 'Bureau', badge: 'BUR', description: 'Desc', order_index: 0 }] })
      .mockResolvedValueOnce({
        rows: [{
          id: 'm1',
          name: 'Alice',
          role: 'Présidente',
          photo_url: null,
          linkedin: null,
          tagline: 'Phrase courte',
          bio: 'Bio publique',
          promo: '3A',
          joined_year: '2024',
          contributions: 7,
          skills: '["M&A","Strategy"]',
          email: 'alice@example.com',
          pole_id: 'p1',
          order_index: 0,
        }],
      })
    const { getAdminTeam } = await import('@/lib/data')
    const result = await getAdminTeam()
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('p1')
    expect(result[0].members[0].id).toBe('m1')
    expect(result[0].members[0].pole_id).toBe('p1')
    expect(result[0].members[0]).toMatchObject({
      tagline: 'Phrase courte',
      bio: 'Bio publique',
      promo: '3A',
      joined_year: '2024',
      contributions: 7,
      skills: ['M&A', 'Strategy'],
      email: 'alice@example.com',
    })
  })
})

describe('getAdminEvents', () => {
  afterEach(() => { vi.resetAllMocks() })

  it('returns admin events with highlights and photos including IDs', async () => {
    executeMock
      .mockResolvedValueOnce({ rows: [{ id: 'e1', title: 'Conf', date: '2025-05-01', partner: 'GS', partner_description: null, pole: null, description: 'Desc', image_url: null, status: 'upcoming', order_index: 0 }] })
      .mockResolvedValueOnce({ rows: [{ id: 'h1', event_id: 'e1', title: 'HL', description: 'Desc', order_index: 0 }] })
      .mockResolvedValueOnce({ rows: [{ id: 'ph1', event_id: 'e1', url: '/img.png', caption: null, order_index: 0 }] })
    const { getAdminEvents } = await import('@/lib/data')
    const result = await getAdminEvents()
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('e1')
    expect(result[0].highlights[0].id).toBe('h1')
    expect(result[0].photos[0].id).toBe('ph1')
    expect(result[0].photos[0].url).toBe('/img.png')
  })
})

describe('getAdminPartners', () => {
  afterEach(() => { vi.resetAllMocks() })

  it('returns admin partners with IDs and logo_url field', async () => {
    executeMock.mockResolvedValueOnce({ rows: [{ id: 'p1', name: 'GS', logo_url: '/gs.png', order_index: 0 }] })
    const { getAdminPartners } = await import('@/lib/data')
    const result = await getAdminPartners()
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('p1')
    expect(result[0].logo_url).toBe('/gs.png')
  })
})

describe('getAdminEventById', () => {
  afterEach(() => { vi.resetAllMocks() })

  it('returns the admin event when found', async () => {
    executeMock
      .mockResolvedValueOnce({ rows: [{ id: 'e1', title: 'Conf', date: '2025-05-01', partner: 'GS', partner_description: null, pole: null, description: 'Desc', image_url: null, status: 'upcoming', order_index: 0 }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
    const { getAdminEventById } = await import('@/lib/data')
    const result = await getAdminEventById('e1')
    expect(result).toBeDefined()
    expect(result?.id).toBe('e1')
  })

  it('returns undefined when not found', async () => {
    executeMock
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
    const { getAdminEventById } = await import('@/lib/data')
    const result = await getAdminEventById('nonexistent')
    expect(result).toBeUndefined()
  })
})

describe('getSiteContent', () => {
  afterEach(() => { vi.resetAllMocks() })

  it('maps key-value rows to SiteContent fields', async () => {
    executeMock.mockResolvedValueOnce({
      rows: [
        { key: 'hero_title', value: 'Bonjour' },
        { key: 'hero_subtitle', value: 'Sous-titre' },
        { key: 'stats_poles', value: '6' },
        { key: 'stats_membres', value: '200+' },
        { key: 'stats_evenements', value: '20+' },
        { key: 'partners_marquee_label', value: 'Partenaires actuels' },
        { key: 'partners_cta_eyebrow', value: 'Entreprises' },
        { key: 'partners_cta_title', value: 'Organisons un événement' },
        { key: 'partners_cta_body', value: 'Un format utile pour les étudiants.' },
        { key: 'partners_cta_primary_label', value: 'Discuter' },
        { key: 'partners_cta_secondary_label', value: 'Logos' },
      ],
    })
    const { getSiteContent } = await import('@/lib/data')
    const result = await getSiteContent()
    expect(result.hero_title).toBe('Bonjour')
    expect(result.stats_poles).toBe('6')
    expect(result.partners_marquee_label).toBe('Partenaires actuels')
    expect(result.partners_cta_title).toBe('Organisons un événement')
    expect(result.partners_cta_secondary_label).toBe('Logos')
    expect(result).not.toHaveProperty('apropos_mission_text')
  })

  it('falls back to the current site copy for keys never saved to the database', async () => {
    executeMock.mockResolvedValueOnce({ rows: [] })
    const { getSiteContent } = await import('@/lib/data')
    const { SITE_CONTENT_DEFAULTS } = await import('@/lib/site-content-defaults')
    const result = await getSiteContent()
    expect(result).toEqual(SITE_CONTENT_DEFAULTS)
  })

  it('falls back to the default when a saved value is an empty string', async () => {
    executeMock.mockResolvedValueOnce({ rows: [{ key: 'hero_title', value: '' }] })
    const { getSiteContent } = await import('@/lib/data')
    const { SITE_CONTENT_DEFAULTS } = await import('@/lib/site-content-defaults')
    const result = await getSiteContent()
    expect(result.hero_title).toBe(SITE_CONTENT_DEFAULTS.hero_title)
  })
})
