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

  it('returns events with highlights and photos', async () => {
    executeMock
      .mockResolvedValueOnce({
        rows: [{ id: 'e1', title: 'Conf', date: '2025-05-01', partner: 'GS', partner_description: null, pole: null, description: 'Desc', image_url: null, status: 'upcoming', order_index: 0 }],
      })
      .mockResolvedValueOnce({ rows: [{ id: 'h1', event_id: 'e1', title: 'HL', description: 'Desc', order_index: 0 }] })
      .mockResolvedValueOnce({ rows: [] })

    const { getEvents } = await import('@/lib/data')
    const result = await getEvents()

    expect(result).toHaveLength(1)
    expect(result[0].highlights).toHaveLength(1)
    expect(result[0].photos).toHaveLength(0)
  })
})

describe('getPartners', () => {
  afterEach(() => { vi.resetAllMocks() })

  it('returns partners ordered by order_index', async () => {
    executeMock.mockResolvedValueOnce({
      rows: [{ id: 'p1', name: 'GS', logo_url: '/gs.png', order_index: 0 }],
    })

    const { getPartners } = await import('@/lib/data')
    const result = await getPartners()

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('GS')
    expect(result[0].logo).toBe('/gs.png')
  })
})
