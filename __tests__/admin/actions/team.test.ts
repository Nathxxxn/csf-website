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

describe('createMember', () => {
  beforeEach(() => { vi.resetModules(); executeMock.mockReset(); process.env.SESSION_SECRET = 'a'.repeat(32); mockValidSession() })
  afterEach(() => { vi.unstubAllEnvs() })

  it('inserts a member into the db', async () => {
    executeMock.mockResolvedValue({ rows: [{ max_order: 0 }] })
    const { createMember } = await import('@/app/admin/actions/team')
    const fd = new FormData()
    fd.set('name', 'Alice Martin'); fd.set('role', 'Analyste'); fd.set('pole_id', 'pole-123')
    await createMember(fd)
    expect(executeMock).toHaveBeenCalledWith(expect.objectContaining({ sql: expect.stringContaining('INSERT INTO team_members') }))
  })
})

describe('reorderMembers', () => {
  beforeEach(() => { vi.resetModules(); executeMock.mockReset(); process.env.SESSION_SECRET = 'a'.repeat(32); mockValidSession() })
  afterEach(() => { vi.unstubAllEnvs() })

  it('updates order_index for each member id', async () => {
    executeMock.mockResolvedValue({ rows: [] })
    const { reorderMembers } = await import('@/app/admin/actions/team')
    await reorderMembers(['m2', 'm1'])
    expect(executeMock).toHaveBeenNthCalledWith(1, expect.objectContaining({ args: expect.arrayContaining([0, 'm2']) }))
    expect(executeMock).toHaveBeenNthCalledWith(2, expect.objectContaining({ args: expect.arrayContaining([1, 'm1']) }))
  })
})
