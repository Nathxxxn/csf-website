import { beforeEach, describe, expect, it, vi } from 'vitest'

const executeMock = vi.fn()

vi.mock('@/lib/db', () => ({
  getDb: () => ({ execute: executeMock }),
}))

const eventRows = [
  {
    id: 'mock-trading-bnp-2025-04',
    title: 'Mock Trading Session',
    date: '2025-04-15',
    partner: 'BNP Paribas',
    partner_description: null,
    pole: 'Markets',
    description: 'Session de mock trading.',
    image_url: '/events/mock-trading.jpg',
    status: 'past',
    order_index: 0,
  },
]

const highlightRows = [
  {
    event_id: 'mock-trading-bnp-2025-04',
    title: 'Simulation',
    description: 'Trading en conditions réelles.',
    order_index: 0,
  },
]

const photoRows = [
  {
    event_id: 'mock-trading-bnp-2025-04',
    url: '/events/mock-trading-1.jpg',
    caption: 'Salle de marché',
    order_index: 0,
  },
]

function mockEventsQuery() {
  executeMock
    .mockResolvedValueOnce({ rows: eventRows })
    .mockResolvedValueOnce({ rows: highlightRows })
    .mockResolvedValueOnce({ rows: photoRows })
}

beforeEach(() => {
  vi.resetModules()
  executeMock.mockReset()
})

describe('getEventById', () => {
  it('returns the event with matching id', async () => {
    mockEventsQuery()
    const { getEventById } = await import('../data')
    const event = await getEventById('mock-trading-bnp-2025-04')
    expect(event).toBeDefined()
    expect(event?.title).toBe('Mock Trading Session')
  })

  it('returns undefined for unknown id', async () => {
    mockEventsQuery()
    const { getEventById } = await import('../data')
    expect(await getEventById('does-not-exist')).toBeUndefined()
  })
})

describe('event images', () => {
  it('events have an images array', async () => {
    mockEventsQuery()
    const { getEvents } = await import('../data')
    const events = await getEvents()
    expect(events.length).toBeGreaterThan(0)
    for (const event of events) {
      expect(event.images, `event ${event.id} should have images`).toBeDefined()
    }
  })
})

describe('event detail data', () => {
  it('events have highlights and photos arrays', async () => {
    mockEventsQuery()
    const { getEvents } = await import('../data')
    const events = await getEvents()
    for (const event of events) {
      expect(event.highlights).toBeDefined()
      expect(event.photos).toBeDefined()
    }
  })
})
