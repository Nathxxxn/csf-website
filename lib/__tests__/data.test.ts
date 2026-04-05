import { afterEach, describe, expect, it, vi } from 'vitest'

const executeMock = vi.fn()

vi.mock('@/lib/db', () => ({
  getDb: () => ({ execute: executeMock }),
}))

describe('getEventById', () => {
  afterEach(() => { vi.resetAllMocks() })

  it('returns the event with matching id', async () => {
    executeMock
      .mockResolvedValueOnce({ rows: [{ id: 'mock-id-1', title: 'Mock Trading Session', date: '2025-04-01', partner: 'BNP', partner_description: 'Desc', pole: null, description: 'Desc', image_url: null, status: 'upcoming', order_index: 0 }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
    const { getEventById } = await import('../data')
    const event = await getEventById('mock-id-1')
    expect(event).toBeDefined()
    expect(event?.title).toBe('Mock Trading Session')
  })

  it('returns undefined for unknown id', async () => {
    executeMock
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
    const { getEventById } = await import('../data')
    expect(await getEventById('does-not-exist')).toBeUndefined()
  })
})

describe('event images', () => {
  afterEach(() => { vi.resetAllMocks() })

  it('events have an images array', async () => {
    executeMock
      .mockResolvedValueOnce({ rows: [{ id: 'e1', title: 'Conf', date: '2025-05-01', partner: 'GS', partner_description: null, pole: null, description: 'Desc', image_url: null, status: 'upcoming', order_index: 0 }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
    const { getEvents } = await import('../data')
    const events = await getEvents()
    expect(events.length).toBeGreaterThan(0)
    for (const event of events) {
      expect(event.images, `event ${event.id} should have images`).toBeDefined()
    }
  })
})

describe('event detail data', () => {
  afterEach(() => { vi.resetAllMocks() })

  it('events have highlights and photos arrays', async () => {
    executeMock
      .mockResolvedValueOnce({ rows: [{ id: 'e1', title: 'Conf', date: '2025-05-01', partner: 'GS', partner_description: 'Desc', pole: null, description: 'Desc', image_url: null, status: 'past', order_index: 0 }] })
      .mockResolvedValueOnce({ rows: [{ id: 'h1', event_id: 'e1', title: 'HL', description: 'Detail', order_index: 0 }] })
      .mockResolvedValueOnce({ rows: [{ id: 'p1', event_id: 'e1', url: '/photo.jpg', caption: 'Cap', order_index: 0 }] })
    const { getEvents } = await import('../data')
    const events = await getEvents()
    for (const event of events) {
      expect(event.highlights).toBeDefined()
      expect(event.photos).toBeDefined()
    }
  })
})
