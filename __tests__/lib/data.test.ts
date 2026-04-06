import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const executeMock = vi.fn()

vi.mock('@/lib/db', () => ({
  getDb: () => ({ execute: executeMock }),
}))

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
          { id: 'm1', name: 'Alice', role: 'Présidente', photo_url: null, linkedin: null, pole_id: 'p1', order_index: 0 },
        ],
      })

    const { getTeam } = await import('@/lib/data')
    const result = await getTeam()

    expect(result).toHaveLength(1)
    expect(result[0].pole).toBe('Bureau')
    expect(result[0].members).toHaveLength(1)
    expect(result[0].members[0].name).toBe('Alice')
  })
})

describe('getEvents', () => {
  afterEach(() => { vi.resetAllMocks() })

  it('returns events with highlights and photos from JSON', async () => {
    const { getEvents } = await import('@/lib/data')
    const result = await getEvents()

    expect(result.length).toBeGreaterThan(0)
    for (const event of result) {
      expect(Array.isArray(event.highlights)).toBe(true)
      expect(Array.isArray(event.photos)).toBe(true)
    }
  })
})

describe('getPartners', () => {
  afterEach(() => { vi.resetAllMocks() })

  it('returns partners from JSON', async () => {
    const { getPartners } = await import('@/lib/data')
    const result = await getPartners()

    expect(result.length).toBeGreaterThan(0)
    expect(result[0].name).toBe('Goldman Sachs')
    expect(result[0].logo).toBe('/images/partners/goldman.png')
  })
})

describe('getEventById', () => {
  afterEach(() => { vi.resetAllMocks() })

  it('returns the event when found', async () => {
    const { getEventById } = await import('@/lib/data')
    const result = await getEventById('mock-trading-bnp-2025-04')
    expect(result).toBeDefined()
    expect(result?.id).toBe('mock-trading-bnp-2025-04')
  })

  it('returns undefined when not found', async () => {
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
      .mockResolvedValueOnce({ rows: [{ id: 'm1', name: 'Alice', role: 'Présidente', photo_url: null, linkedin: null, pole_id: 'p1', order_index: 0 }] })
    const { getAdminTeam } = await import('@/lib/data')
    const result = await getAdminTeam()
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('p1')
    expect(result[0].members[0].id).toBe('m1')
    expect(result[0].members[0].pole_id).toBe('p1')
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
        { key: 'apropos_mission_title', value: 'Mission' },
        { key: 'apropos_mission_text', value: 'Texte' },
      ],
    })
    const { getSiteContent } = await import('@/lib/data')
    const result = await getSiteContent()
    expect(result.hero_title).toBe('Bonjour')
    expect(result.stats_poles).toBe('6')
    expect(result.apropos_mission_text).toBe('Texte')
  })

  it('falls back to empty string for missing keys', async () => {
    executeMock.mockResolvedValueOnce({ rows: [] })
    const { getSiteContent } = await import('@/lib/data')
    const result = await getSiteContent()
    expect(result.hero_title).toBe('')
    expect(result.hero_subtitle).toBe('')
  })
})
