import { afterEach, describe, expect, it, vi } from 'vitest'

describe('getDb', () => {
  afterEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
  })

  it('throws when TURSO_DATABASE_URL is not set', async () => {
    vi.stubEnv('TURSO_DATABASE_URL', '')
    const { getDb } = await import('@/lib/db')
    expect(() => getDb()).toThrow('TURSO_DATABASE_URL is not set')
  })

  it('returns a client when TURSO_DATABASE_URL is set', async () => {
    vi.stubEnv('TURSO_DATABASE_URL', 'file::memory:')
    const { getDb } = await import('@/lib/db')
    const client = getDb()
    expect(client).toBeDefined()
    expect(typeof client.execute).toBe('function')
  })

  it('returns the same instance on multiple calls', async () => {
    vi.stubEnv('TURSO_DATABASE_URL', 'file::memory:')
    const { getDb } = await import('@/lib/db')
    expect(getDb()).toBe(getDb())
  })
})
