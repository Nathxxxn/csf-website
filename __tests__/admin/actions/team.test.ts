import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { signCookie } from '@/lib/session'

const mocks = vi.hoisted(() => ({
  executeMock: vi.fn(),
  redirectMock: vi.fn((url: string) => { throw new Error(`NEXT_REDIRECT:${url}`) }),
  cookiesMock: vi.fn(),
}))

const { executeMock, redirectMock, cookiesMock } = mocks

vi.mock('@/lib/db', () => ({ getDb: () => ({ execute: mocks.executeMock }) }))
vi.mock('next/navigation', () => ({ redirect: mocks.redirectMock }))
vi.mock('next/headers', () => ({ cookies: mocks.cookiesMock }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

function mockValidSession() {
  const token = signCookie({ username: 'admin', iat: Math.floor(Date.now() / 1000) })
  cookiesMock.mockResolvedValue({ get: vi.fn().mockReturnValue({ value: token }) })
}

describe('createMember', () => {
  beforeEach(() => { vi.resetModules(); executeMock.mockReset(); process.env.SESSION_SECRET = 'a'.repeat(32); mockValidSession() })
  afterEach(() => { vi.unstubAllEnvs() })

  it('inserts a member into the db', async () => {
    executeMock.mockResolvedValue({ rows: [{ m: 0 }] })
    const { createMember } = await import('@/app/admin/actions/team')
    const fd = new FormData()
    fd.set('name', 'Alice Martin')
    fd.set('role', 'Analyste')
    fd.set('pole_id', 'pole-123')
    fd.set('tagline', 'Phrase courte')
    fd.set('bio', 'Bio publique')
    fd.set('promo', '3A')
    fd.set('joined_year', '2024')
    fd.set('contributions', '12')
    fd.set('skills', 'M&A, Strategy')
    fd.set('email', 'alice@example.com')
    await createMember(fd)
    expect(executeMock).toHaveBeenCalledWith(expect.objectContaining({
      sql: expect.stringContaining('INSERT INTO team_members'),
      args: expect.arrayContaining([
        'Alice Martin',
        'Analyste',
        null,
        null,
        'Phrase courte',
        'Bio publique',
        '3A',
        '2024',
        12,
        '["M&A","Strategy"]',
        'alice@example.com',
        'pole-123',
        1,
      ]),
    }))
  })

  it('updates member profile fields and normalizes empty optional values', async () => {
    executeMock.mockResolvedValue({ rows: [] })
    const { updateMember } = await import('@/app/admin/actions/team')
    const fd = new FormData()
    fd.set('name', 'Alice Martin')
    fd.set('role', 'Analyste')
    fd.set('pole_id', 'pole-123')
    fd.set('linkedin', '')
    fd.set('tagline', '')
    fd.set('bio', '')
    fd.set('promo', '')
    fd.set('joined_year', '')
    fd.set('contributions', '')
    fd.set('skills', '')
    fd.set('email', '')

    await updateMember('member-123', fd)

    expect(executeMock).toHaveBeenCalledWith(expect.objectContaining({
      sql: expect.stringContaining('UPDATE team_members SET'),
      args: [
        'Alice Martin',
        'Analyste',
        null,
        null,
        null,
        null,
        null,
        null,
        '[]',
        null,
        'pole-123',
        'member-123',
      ],
    }))
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
