import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { signCookie } from '@/lib/session'

const executeMock = vi.fn()
const redirectMock = vi.fn((url: string) => { throw new Error(`NEXT_REDIRECT:${url}`) })
const cookiesMock = vi.fn()

vi.mock('@/lib/db', () => ({ getDb: () => ({ execute: executeMock }) }))
vi.mock('next/navigation', () => ({ redirect: redirectMock }))
vi.mock('next/headers', () => ({ cookies: cookiesMock }))

function mockValidSession() {
  const token = signCookie({ username: 'admin', iat: Math.floor(Date.now() / 1000) })
  cookiesMock.mockResolvedValue({ get: vi.fn().mockReturnValue({ value: token }) })
}

describe('upsertContent', () => {
  beforeEach(() => {
    vi.resetModules()
    executeMock.mockReset()
    process.env.SESSION_SECRET = 'a'.repeat(32)
    mockValidSession()
  })
  afterEach(() => { vi.unstubAllEnvs() })

  it('inserts a key-value pair', async () => {
    executeMock.mockResolvedValue({ rows: [] })
    const { upsertContent } = await import('@/app/admin/actions/content')
    const fd = new FormData()
    fd.set('hero_title', 'Nouveau titre')
    await upsertContent(fd)
    expect(executeMock).toHaveBeenCalledWith(
      expect.objectContaining({ sql: expect.stringContaining('INSERT OR REPLACE') }),
    )
  })

  it('redirects to /admin when session is invalid', async () => {
    cookiesMock.mockResolvedValue({ get: vi.fn().mockReturnValue(undefined) })
    const { upsertContent } = await import('@/app/admin/actions/content')
    await expect(upsertContent(new FormData())).rejects.toThrow('NEXT_REDIRECT:/admin')
  })
})
