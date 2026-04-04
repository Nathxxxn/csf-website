import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createHmac } from 'node:crypto'
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  getSessionCookieOptions,
  signCookie,
  verifyCookie,
} from '@/lib/session'

const ORIGINAL_SECRET = process.env.SESSION_SECRET

beforeEach(() => {
  process.env.SESSION_SECRET = 'a'.repeat(32)
})

afterEach(() => {
  if (ORIGINAL_SECRET === undefined) {
    delete process.env.SESSION_SECRET
  } else {
    process.env.SESSION_SECRET = ORIGINAL_SECRET
  }
})

describe('session helpers', () => {
  it('round-trips a valid signed cookie', () => {
    const payload = { username: 'admin', iat: 1_700_000_000 }

    const cookie = signCookie(payload)
    const verified = verifyCookie(cookie, payload.iat + SESSION_MAX_AGE_SECONDS - 1)

    expect(cookie).toContain('.')
    expect(verified).toEqual(payload)
  })

  it('rejects a tampered signature', () => {
    const payload = { username: 'admin', iat: 1_700_000_000 }
    const cookie = signCookie(payload)
    const [encodedPayload] = cookie.split('.')
    const tamperedCookie = `${encodedPayload}.invalid-signature`

    expect(verifyCookie(tamperedCookie, payload.iat)).toBeUndefined()
  })

  it('rejects an expired cookie', () => {
    const payload = { username: 'admin', iat: 1_700_000_000 }
    const cookie = signCookie(payload)

    expect(verifyCookie(cookie, payload.iat + SESSION_MAX_AGE_SECONDS + 1)).toBeUndefined()
  })

  it('rejects a future-dated cookie', () => {
    const payload = { username: 'admin', iat: 1_700_000_100 }
    const cookie = signCookie(payload)

    expect(verifyCookie(cookie, payload.iat - 1)).toBeUndefined()
  })

  it.each([undefined, ''])('rejects empty session input', input => {
    expect(verifyCookie(input)).toBeUndefined()
  })

  it.each(['abc', 'abc.def.ghi'])('rejects malformed segment counts', input => {
    expect(verifyCookie(input)).toBeUndefined()
  })

  it('rejects an invalid payload shape', () => {
    const encodedPayload = Buffer.from(JSON.stringify({ username: 'admin' })).toString('base64url')
    const signature = createHmac('sha256', process.env.SESSION_SECRET ?? '').update(encodedPayload).digest('base64url')
    const cookie = `${encodedPayload}.${signature}`

    expect(verifyCookie(cookie)).toBeUndefined()
  })
})

describe('session constants', () => {
  it('uses the expected cookie name', () => {
    expect(SESSION_COOKIE_NAME).toBe('csf_admin_session')
  })
})

describe('getSessionCookieOptions', () => {
  it('returns the expected cookie options in development', () => {
    const originalNodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    try {
      expect(getSessionCookieOptions()).toEqual({
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false,
        maxAge: SESSION_MAX_AGE_SECONDS,
      })
    } finally {
      if (originalNodeEnv === undefined) {
        delete process.env.NODE_ENV
      } else {
        process.env.NODE_ENV = originalNodeEnv
      }
    }
  })

  it('sets secure in production', () => {
    const originalNodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    try {
      expect(getSessionCookieOptions().secure).toBe(true)
    } finally {
      if (originalNodeEnv === undefined) {
        delete process.env.NODE_ENV
      } else {
        process.env.NODE_ENV = originalNodeEnv
      }
    }
  })
})
