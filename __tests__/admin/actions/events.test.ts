import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { signCookie } from '@/lib/session'

const executeMock = vi.fn()
const redirectMock = vi.fn((url: string) => { throw new Error(`NEXT_REDIRECT:${url}`) })
const cookiesMock = vi.fn()

vi.mock('@/lib/db', () => ({ getDb: () => ({ execute: executeMock }) }))
vi.mock('next/navigation', () => ({ redirect: redirectMock }))
vi.mock('next/headers', () => ({ cookies: cookiesMock }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

function mockValidSession() {
  const token = signCookie({ username: 'admin', iat: Math.floor(Date.now() / 1000) })
  cookiesMock.mockResolvedValue({ get: vi.fn().mockReturnValue({ value: token }) })
}

describe('createEvent', () => {
  beforeEach(() => {
    vi.resetModules()
    executeMock.mockReset()
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
