import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { signCookie } from '@/lib/session'

const {
  executeMock,
  redirectMock,
  cookiesMock,
  revalidatePathMock,
} = vi.hoisted(() => ({
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

describe('upsertContent', () => {
  beforeEach(() => {
    vi.resetModules()
    executeMock.mockReset()
    revalidatePathMock.mockReset()
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

  it('persists partnership landing content keys', async () => {
    executeMock.mockResolvedValue({ rows: [] })
    const { upsertContent } = await import('@/app/admin/actions/content')
    const fd = new FormData()
    fd.set('partners_marquee_label', 'Nos partenaires finance')
    fd.set('partners_cta_eyebrow', 'Relations entreprises')
    fd.set('partners_cta_title', 'Construire un format ensemble')
    fd.set('partners_cta_body', 'Conférence, workshop ou immersion métier.')
    fd.set('partners_cta_primary_label', 'Nous contacter')
    fd.set('partners_cta_secondary_label', 'Voir les partenaires')

    await upsertContent(fd)

    expect(executeMock).toHaveBeenCalledTimes(6)
    expect(executeMock).toHaveBeenCalledWith(
      expect.objectContaining({ args: ['partners_marquee_label', 'Nos partenaires finance'] }),
    )
    expect(executeMock).toHaveBeenCalledWith(
      expect.objectContaining({ args: ['partners_cta_secondary_label', 'Voir les partenaires'] }),
    )
  })

  it('persists the missing stat, the events page intro, and the new À propos fields', async () => {
    executeMock.mockResolvedValue({ rows: [] })
    const { upsertContent } = await import('@/app/admin/actions/content')
    const fd = new FormData()
    fd.set('stats_etudiants', '5000')
    fd.set('events_eyebrow', 'Agenda')
    fd.set('events_intro', 'Nos événements en un coup d\'œil.')
    fd.set('about_heading', 'Notre mission')
    fd.set('about_intro', 'Ce que nous faisons.')
    fd.set('about_legal_address', '3 rue Joliot Curie, 91190 Gif-sur-Yvette')
    fd.set('about_legal_rna', 'W913012869')

    await upsertContent(fd)

    expect(executeMock).toHaveBeenCalledTimes(7)
    expect(executeMock).toHaveBeenCalledWith(
      expect.objectContaining({ args: ['stats_etudiants', '5000'] }),
    )
    expect(executeMock).toHaveBeenCalledWith(
      expect.objectContaining({ args: ['about_legal_rna', 'W913012869'] }),
    )
  })

  it('ignores legacy À propos content fields and does not revalidate /a-propos', async () => {
    executeMock.mockResolvedValue({ rows: [] })
    const { upsertContent } = await import('@/app/admin/actions/content')
    const fd = new FormData()
    fd.set('apropos_mission_title', 'Ancien titre')
    fd.set('apropos_mission_text', 'Ancien texte')

    await upsertContent(fd)

    expect(executeMock).not.toHaveBeenCalled()
    expect(revalidatePathMock).not.toHaveBeenCalledWith('/a-propos')
  })

  it('redirects to /admin when session is invalid', async () => {
    cookiesMock.mockResolvedValue({ get: vi.fn().mockReturnValue(undefined) })
    const { upsertContent } = await import('@/app/admin/actions/content')
    await expect(upsertContent(new FormData())).rejects.toThrow('NEXT_REDIRECT:/admin')
  })
})
