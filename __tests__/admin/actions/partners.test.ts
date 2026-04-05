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

describe('createPartner', () => {
  beforeEach(() => { vi.resetModules(); executeMock.mockReset(); process.env.SESSION_SECRET = 'a'.repeat(32); mockValidSession() })
  afterEach(() => { vi.unstubAllEnvs() })

  it('inserts a partner', async () => {
    executeMock.mockResolvedValue({ rows: [{ m: 2 }] })
    const { createPartner } = await import('@/app/admin/actions/partners')
    const fd = new FormData(); fd.set('name', 'HSBC'); fd.set('logo_url', '/hsbc.png')
    await createPartner(fd)
    expect(executeMock).toHaveBeenCalledWith(expect.objectContaining({ sql: expect.stringContaining('INSERT INTO partners') }))
  })
})

describe('reorderPartners', () => {
  beforeEach(() => { vi.resetModules(); executeMock.mockReset(); process.env.SESSION_SECRET = 'a'.repeat(32); mockValidSession() })
  afterEach(() => { vi.unstubAllEnvs() })

  it('updates order_index', async () => {
    executeMock.mockResolvedValue({ rows: [] })
    const { reorderPartners } = await import('@/app/admin/actions/partners')
    await reorderPartners(['p2', 'p1'])
    expect(executeMock).toHaveBeenNthCalledWith(1, expect.objectContaining({ args: expect.arrayContaining([0, 'p2']) }))
  })
})
