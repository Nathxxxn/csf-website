import { afterEach, describe, expect, it, vi } from 'vitest'

const executeMock = vi.fn()

vi.mock('@/lib/db', () => ({
  getDb: () => ({ execute: executeMock }),
}))

describe('getEventById', () => {
  afterEach(() => { vi.resetAllMocks() })

  it('returns the event with matching id', async () => {
    const { getEventById } = await import('../data')
    const event = await getEventById('mock-trading-bnp-2025-04')
    expect(event).toBeDefined()
    expect(event?.title).toBe('Mock Trading Session')
  })

  it('returns undefined for unknown id', async () => {
    const { getEventById } = await import('../data')
    expect(await getEventById('does-not-exist')).toBeUndefined()
  })
})

describe('event images', () => {
  afterEach(() => { vi.resetAllMocks() })

  it('events have an images array', async () => {
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
    const { getEvents } = await import('../data')
    const events = await getEvents()
    for (const event of events) {
      expect(event.highlights).toBeDefined()
      expect(event.photos).toBeDefined()
    }
  })
})
