import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { signCookie } from '@/lib/session'

const { executeMock, cookiesMock, revalidatePathMock } = vi.hoisted(() => ({
  executeMock: vi.fn(),
  cookiesMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}))

vi.mock('@/lib/db', () => ({ getDb: () => ({ execute: executeMock }) }))
vi.mock('next/headers', () => ({ cookies: cookiesMock }))
vi.mock('next/cache', () => ({ revalidatePath: revalidatePathMock }))

function mockValidSession() {
  const token = signCookie({ username: 'admin', iat: Math.floor(Date.now() / 1000) })
  cookiesMock.mockResolvedValue({ get: vi.fn().mockReturnValue({ value: token }) })
}

function formationFormData(overrides: Partial<Record<string, string>> = {}) {
  const fd = new FormData()
  fd.set('title', overrides.title ?? 'Introduction aux dérivés')
  fd.set('date', overrides.date ?? '2026-02-10')
  fd.set('category', overrides.category ?? 'Marchés')
  fd.set('description', overrides.description ?? 'Pricing, couverture et cas pratiques.')
  fd.set('speaker_name', overrides.speaker_name ?? 'Antoine R.')
  fd.set('speaker_role', overrides.speaker_role ?? 'Responsable Marchés')
  if (overrides.support_url) fd.set('support_url', overrides.support_url)
  if (overrides.support_filename) fd.set('support_filename', overrides.support_filename)
  return fd
}

describe('formations admin actions', () => {
  beforeEach(() => {
    vi.resetModules()
    executeMock.mockReset()
    cookiesMock.mockReset()
    revalidatePathMock.mockReset()
    process.env.SESSION_SECRET = 'a'.repeat(32)
    mockValidSession()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('creates a formation and revalidates public and admin surfaces', async () => {
    executeMock.mockResolvedValueOnce({ rows: [{ max_order: 3 }] }).mockResolvedValueOnce({ rows: [] })
    const { createFormation } = await import('@/app/admin/actions/formations')

    await createFormation(formationFormData())

    expect(executeMock).toHaveBeenCalledWith(expect.objectContaining({
      sql: expect.stringContaining('INSERT INTO formations'),
      args: expect.arrayContaining(['Introduction aux dérivés', '2026-02-10', 'Marchés', 'Pricing, couverture et cas pratiques.']),
    }))
    expect(revalidatePathMock).toHaveBeenCalledWith('/formations')
    expect(revalidatePathMock).toHaveBeenCalledWith('/admin/dashboard')
  })

  it('creates a formation with an uploaded support when metadata is present', async () => {
    executeMock.mockResolvedValueOnce({ rows: [{ max_order: 3 }] }).mockResolvedValueOnce({ rows: [] })
    const { createFormation } = await import('@/app/admin/actions/formations')

    await createFormation(formationFormData({
      support_url: 'https://blob.example/formation.pdf',
      support_filename: 'formation.pdf',
    }))

    expect(executeMock).toHaveBeenCalledWith(expect.objectContaining({
      sql: expect.stringContaining('INSERT INTO formations'),
      args: expect.arrayContaining(['https://blob.example/formation.pdf', 'formation.pdf']),
    }))
  })

  it('rejects invalid formation dates before writing', async () => {
    const { createFormation } = await import('@/app/admin/actions/formations')

    await expect(createFormation(formationFormData({ date: '10/02/2026' }))).rejects.toThrow('Validation échouée')

    expect(executeMock).not.toHaveBeenCalled()
  })

  it('updates formation fields', async () => {
    executeMock.mockResolvedValueOnce({ rows: [] })
    const { updateFormation } = await import('@/app/admin/actions/formations')

    await updateFormation('formation-1', formationFormData({ title: 'DCF avancé', category: 'M&A' }))

    expect(executeMock).toHaveBeenCalledWith(expect.objectContaining({
      sql: expect.stringContaining('UPDATE formations SET title=?, date=?, category=?, description=?, speaker_name=?, speaker_role=? WHERE id=?'),
      args: expect.arrayContaining(['DCF avancé', 'M&A', 'formation-1']),
    }))
  })

  it('updates the downloadable support metadata', async () => {
    executeMock.mockResolvedValueOnce({ rows: [] })
    const { updateFormationSupport } = await import('@/app/admin/actions/formations')

    await updateFormationSupport('formation-1', {
      url: 'https://blob.example/support.pdf',
      filename: 'support.pdf',
    })

    expect(executeMock).toHaveBeenCalledWith(expect.objectContaining({
      sql: expect.stringContaining('UPDATE formations SET support_url=?, support_filename=? WHERE id=?'),
      args: ['https://blob.example/support.pdf', 'support.pdf', 'formation-1'],
    }))
  })

  it('clears the downloadable support metadata', async () => {
    executeMock.mockResolvedValueOnce({ rows: [] })
    const { clearFormationSupport } = await import('@/app/admin/actions/formations')

    await clearFormationSupport('formation-1')

    expect(executeMock).toHaveBeenCalledWith(expect.objectContaining({
      sql: expect.stringContaining('UPDATE formations SET support_url=NULL, support_filename=NULL WHERE id=?'),
      args: ['formation-1'],
    }))
    expect(revalidatePathMock).toHaveBeenCalledWith('/formations')
  })

  it('deletes a formation', async () => {
    executeMock.mockResolvedValueOnce({ rows: [] })
    const { deleteFormation } = await import('@/app/admin/actions/formations')

    await deleteFormation('formation-1')

    expect(executeMock).toHaveBeenCalledWith(expect.objectContaining({
      sql: 'DELETE FROM formations WHERE id=?',
      args: ['formation-1'],
    }))
  })
})
