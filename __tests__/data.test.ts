import { afterEach, describe, expect, it, vi } from 'vitest'

const executeMock = vi.fn()

vi.mock('@/lib/db', () => ({
  getDb: () => ({ execute: executeMock }),
}))

describe('getTeam', () => {
  afterEach(() => { vi.resetAllMocks() })

  it('returns an array of pole data', async () => {
    executeMock
      .mockResolvedValueOnce({ rows: [{ id: 'p1', name: 'Bureau', badge: 'BUR', description: 'Desc', order_index: 0 }] })
      .mockResolvedValueOnce({ rows: [{ id: 'm1', name: 'Alice', role: 'Présidente', photo_url: null, linkedin: null, pole_id: 'p1', order_index: 0 }] })
    const { getTeam } = await import('@/lib/data')
    const team = await getTeam()
    expect(Array.isArray(team)).toBe(true)
    expect(team.length).toBeGreaterThan(0)
    expect(team[0]).toHaveProperty('pole')
    expect(team[0]).toHaveProperty('members')
    expect(Array.isArray(team[0].members)).toBe(true)
  })
})

describe('getEvents', () => {
  afterEach(() => { vi.resetAllMocks() })

  it('returns an array of events', async () => {
    executeMock
      .mockResolvedValueOnce({ rows: [{ id: 'e1', title: 'Conf', date: '2025-05-01', partner: 'GS', partner_description: null, pole: null, description: 'Desc', image_url: null, status: 'upcoming', order_index: 0 }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
    const { getEvents } = await import('@/lib/data')
    const events = await getEvents()
    expect(Array.isArray(events)).toBe(true)
    expect(events.length).toBeGreaterThan(0)
    expect(events[0]).toHaveProperty('id')
    expect(events[0]).toHaveProperty('status')
  })

  it('returns events with valid status', async () => {
    executeMock
      .mockResolvedValueOnce({ rows: [{ id: 'e1', title: 'Conf', date: '2025-05-01', partner: 'GS', partner_description: null, pole: null, description: 'Desc', image_url: null, status: 'upcoming', order_index: 0 }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
    const { getEvents } = await import('@/lib/data')
    const events = await getEvents()
    events.forEach(e => {
      expect(['upcoming', 'past']).toContain(e.status)
    })
  })
})

describe('getUpcomingEvents', () => {
  afterEach(() => { vi.resetAllMocks() })

  it('returns only upcoming events', async () => {
    executeMock
      .mockResolvedValueOnce({ rows: [{ id: 'e1', title: 'Conf', date: '2025-05-01', partner: 'GS', partner_description: null, pole: null, description: 'Desc', image_url: null, status: 'upcoming', order_index: 0 }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
    const { getUpcomingEvents } = await import('@/lib/data')
    const events = await getUpcomingEvents()
    events.forEach(e => expect(e.status).toBe('upcoming'))
  })

  it('returns upcoming events sorted ascending by date', async () => {
    executeMock
      .mockResolvedValueOnce({ rows: [
        { id: 'e2', title: 'Later', date: '2025-06-01', partner: 'GS', partner_description: null, pole: null, description: 'Desc', image_url: null, status: 'upcoming', order_index: 1 },
        { id: 'e1', title: 'Earlier', date: '2025-05-01', partner: 'GS', partner_description: null, pole: null, description: 'Desc', image_url: null, status: 'upcoming', order_index: 0 },
      ]})
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
    const { getUpcomingEvents } = await import('@/lib/data')
    const events = await getUpcomingEvents()
    for (let i = 1; i < events.length; i++) {
      expect(new Date(events[i].date).getTime())
        .toBeGreaterThanOrEqual(new Date(events[i - 1].date).getTime())
    }
  })
})

describe('getPastEvents', () => {
  afterEach(() => { vi.resetAllMocks() })

  it('returns only past events', async () => {
    executeMock
      .mockResolvedValueOnce({ rows: [{ id: 'e1', title: 'Old', date: '2024-01-01', partner: 'GS', partner_description: null, pole: null, description: 'Desc', image_url: null, status: 'past', order_index: 0 }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
    const { getPastEvents } = await import('@/lib/data')
    const events = await getPastEvents()
    events.forEach(e => expect(e.status).toBe('past'))
  })

  it('returns past events sorted descending by date', async () => {
    executeMock
      .mockResolvedValueOnce({ rows: [
        { id: 'e1', title: 'Earlier', date: '2024-01-01', partner: 'GS', partner_description: null, pole: null, description: 'Desc', image_url: null, status: 'past', order_index: 0 },
        { id: 'e2', title: 'Later', date: '2024-06-01', partner: 'GS', partner_description: null, pole: null, description: 'Desc', image_url: null, status: 'past', order_index: 1 },
      ]})
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
    const { getPastEvents } = await import('@/lib/data')
    const events = await getPastEvents()
    for (let i = 1; i < events.length; i++) {
      expect(new Date(events[i].date).getTime())
        .toBeLessThanOrEqual(new Date(events[i - 1].date).getTime())
    }
  })
})

describe('getPartners', () => {
  afterEach(() => { vi.resetAllMocks() })

  it('returns an array of partners', async () => {
    executeMock.mockResolvedValueOnce({ rows: [{ id: 'p1', name: 'GS', logo_url: '/gs.png', order_index: 0 }] })
    const { getPartners } = await import('@/lib/data')
    const partners = await getPartners()
    expect(Array.isArray(partners)).toBe(true)
    expect(partners.length).toBeGreaterThan(0)
    expect(partners[0]).toHaveProperty('name')
    expect(partners[0]).toHaveProperty('logo')
  })
})

describe('getFormations', () => {
  afterEach(() => { vi.resetAllMocks() })

  it('returns formations sorted by descending date with nullable support metadata', async () => {
    executeMock.mockResolvedValueOnce({
      rows: [
        {
          id: 'formation-2',
          title: 'DCF avancé',
          date: '2026-03-10',
          category: 'M&A',
          description: 'Construire un DCF auditable.',
          speaker_name: 'Léa M.',
          speaker_role: 'VP Corporate',
          support_url: null,
          support_filename: null,
          order_index: 1,
        },
        {
          id: 'formation-1',
          title: 'Produits dérivés',
          date: '2025-10-14',
          category: 'Marchés',
          description: 'Forwards, futures et swaps.',
          speaker_name: 'Antoine R.',
          speaker_role: 'Responsable Marchés',
          support_url: 'https://blob.example/derives.pdf',
          support_filename: 'derives.pdf',
          order_index: 0,
        },
      ],
    })

    const { getFormations } = await import('@/lib/data')
    const formations = await getFormations()

    expect(executeMock).toHaveBeenCalledWith('SELECT * FROM formations ORDER BY date DESC, order_index ASC')
    expect(formations).toEqual([
      {
        id: 'formation-2',
        title: 'DCF avancé',
        date: '2026-03-10',
        category: 'M&A',
        description: 'Construire un DCF auditable.',
        speakerName: 'Léa M.',
        speakerRole: 'VP Corporate',
        supportUrl: null,
        supportFilename: null,
      },
      {
        id: 'formation-1',
        title: 'Produits dérivés',
        date: '2025-10-14',
        category: 'Marchés',
        description: 'Forwards, futures et swaps.',
        speakerName: 'Antoine R.',
        speakerRole: 'Responsable Marchés',
        supportUrl: 'https://blob.example/derives.pdf',
        supportFilename: 'derives.pdf',
      },
    ])
  })
})
