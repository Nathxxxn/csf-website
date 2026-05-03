import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { signCookie } from '@/lib/session'

const { executeMock, redirectMock, cookiesMock, revalidatePathMock } = vi.hoisted(() => ({
  executeMock: vi.fn(),
  redirectMock: vi.fn((url: string) => { throw new Error(`NEXT_REDIRECT:${url}`) }),
  cookiesMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}))

vi.mock('@/lib/db', () => ({ getDb: () => ({ execute: executeMock }) }))
vi.mock('next/navigation', () => ({ redirect: redirectMock }))
vi.mock('next/headers', () => ({ cookies: cookiesMock }))
vi.mock('next/cache', () => ({ revalidatePath: revalidatePathMock }))

function mockValidSession() {
  const token = signCookie({ username: 'admin', iat: Math.floor(Date.now() / 1000) })
  cookiesMock.mockResolvedValue({ get: vi.fn().mockReturnValue({ value: token }) })
}

describe('createEvent', () => {
  beforeEach(() => {
    vi.resetModules()
    executeMock.mockReset()
    revalidatePathMock.mockReset()
    process.env.SESSION_SECRET = 'a'.repeat(32)
    mockValidSession()
  })
  afterEach(() => { vi.unstubAllEnvs() })

  it('inserts a new event and redirects to its edit page', async () => {
    executeMock.mockResolvedValue({ rows: [{ max_order: 0 }] })
    const { createEvent } = await import('@/app/admin/actions/events')
    const fd = new FormData()
    fd.set('title', 'Nouvel Event')
    fd.set('date', '2025-06-01')
    fd.set('partner', 'Goldman Sachs')
    fd.set('status', 'upcoming')
    fd.set('description', 'Description')
    await expect(createEvent(fd)).rejects.toThrow('NEXT_REDIRECT:/admin/dashboard/evenements/')
    expect(executeMock).toHaveBeenCalledWith(expect.objectContaining({ sql: expect.stringContaining('INSERT INTO events') }))
  })
})

describe('deleteEvent', () => {
  beforeEach(() => {
    vi.resetModules()
    executeMock.mockReset()
    revalidatePathMock.mockReset()
    process.env.SESSION_SECRET = 'a'.repeat(32)
    mockValidSession()
  })
  afterEach(() => { vi.unstubAllEnvs() })

  it('deletes the event and redirects to events list', async () => {
    executeMock.mockResolvedValue({ rows: [] })
    const { deleteEvent } = await import('@/app/admin/actions/events')
    await expect(deleteEvent('event-id-123')).rejects.toThrow('NEXT_REDIRECT:/admin/dashboard?tab=evenements')
    expect(executeMock).toHaveBeenCalledWith(expect.objectContaining({ sql: expect.stringContaining('DELETE FROM events') }))
  })
})

describe('reorderEvents', () => {
  beforeEach(() => {
    vi.resetModules()
    executeMock.mockReset()
    revalidatePathMock.mockReset()
    process.env.SESSION_SECRET = 'a'.repeat(32)
    mockValidSession()
  })
  afterEach(() => { vi.unstubAllEnvs() })

  it('updates order_index for each event id', async () => {
    executeMock.mockResolvedValue({ rows: [] })
    const { reorderEvents } = await import('@/app/admin/actions/events')
    await reorderEvents(['id-b', 'id-a'])
    expect(executeMock).toHaveBeenCalledTimes(2)
    expect(executeMock).toHaveBeenNthCalledWith(1, expect.objectContaining({ args: expect.arrayContaining([0, 'id-b']) }))
    expect(executeMock).toHaveBeenNthCalledWith(2, expect.objectContaining({ args: expect.arrayContaining([1, 'id-a']) }))
  })
})

describe('event detail sections', () => {
  beforeEach(() => {
    vi.resetModules()
    executeMock.mockReset()
    revalidatePathMock.mockReset()
    process.env.SESSION_SECRET = 'a'.repeat(32)
    mockValidSession()
  })
  afterEach(() => { vi.unstubAllEnvs() })

  it('revalidates event surfaces after creating a highlight', async () => {
    executeMock.mockResolvedValueOnce({ rows: [{ m: 0 }] }).mockResolvedValueOnce({ rows: [] })
    const { createHighlight } = await import('@/app/admin/actions/events')
    const fd = new FormData()
    fd.set('title', 'Point clé')
    fd.set('description', 'Description du point clé')

    await createHighlight('event-1', fd)

    expect(revalidatePathMock).toHaveBeenCalledWith('/')
    expect(revalidatePathMock).toHaveBeenCalledWith('/evenements')
    expect(revalidatePathMock).toHaveBeenCalledWith('/evenements/event-1')
    expect(revalidatePathMock).toHaveBeenCalledWith('/admin/dashboard')
  })

  it('can add several photos and revalidates the event detail page once', async () => {
    executeMock.mockResolvedValueOnce({ rows: [{ m: 1 }] }).mockResolvedValue({ rows: [] })
    const { addPhotos } = await import('@/app/admin/actions/events')

    await addPhotos('event-1', [
      { url: 'https://example.com/a.jpg', caption: 'A' },
      { url: 'https://example.com/b.jpg' },
    ])

    expect(executeMock).toHaveBeenCalledTimes(3)
    expect(executeMock).toHaveBeenNthCalledWith(2, expect.objectContaining({ args: expect.arrayContaining(['https://example.com/a.jpg', 'A', 2]) }))
    expect(executeMock).toHaveBeenNthCalledWith(3, expect.objectContaining({ args: expect.arrayContaining(['https://example.com/b.jpg', null, 3]) }))
    expect(revalidatePathMock).toHaveBeenCalledWith('/evenements/event-1')
  })
})
