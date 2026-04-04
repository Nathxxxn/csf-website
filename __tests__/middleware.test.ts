import { NextRequest } from 'next/server'
import { createHmac } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS, signCookie } from '@/lib/session'

const originalSessionSecret = process.env.SESSION_SECRET

function createRequest(cookieValue?: string) {
  const request = new NextRequest('http://localhost/admin/dashboard')

  if (cookieValue) {
    request.cookies.set(SESSION_COOKIE_NAME, cookieValue)
  }

  return request
}

function base64UrlEncode(input: string) {
  return Buffer.from(input).toString('base64url')
}

function signArbitraryCookie(payload: unknown) {
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const signature = createHmac('sha256', process.env.SESSION_SECRET ?? '')
    .update(encodedPayload)
    .digest('base64url')

  return `${encodedPayload}.${signature}`
}

function signEncodedPayload(encodedPayload: string) {
  const signature = createHmac('sha256', process.env.SESSION_SECRET ?? '')
    .update(encodedPayload)
    .digest('base64url')

  return `${encodedPayload}.${signature}`
}

describe('middleware', () => {
  beforeEach(() => {
    vi.resetModules()
    process.env.SESSION_SECRET = 'a'.repeat(32)
  })

  afterEach(() => {
    if (originalSessionSecret === undefined) {
      delete process.env.SESSION_SECRET
    } else {
      process.env.SESSION_SECRET = originalSessionSecret
    }
  })

  it('redirects anonymous requests to /admin', async () => {
    const { middleware } = await import('@/middleware')

    const response = await middleware(createRequest())

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost/admin')
  })

  it('redirects tampered cookies to /admin', async () => {
    const cookieValue = signCookie({
      username: 'admin',
      iat: Math.floor(Date.now() / 1000),
    })
    const [encodedPayload, signature] = cookieValue.split('.')
    const tamperedSignature = `${signature.startsWith('a') ? 'b' : 'a'}${signature.slice(1)}`
    const tamperedCookie = `${encodedPayload}.${tamperedSignature}`
    const { middleware } = await import('@/middleware')

    const response = await middleware(createRequest(tamperedCookie))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost/admin')
  })

  it('redirects malformed cookies with the wrong segment count to /admin', async () => {
    const { middleware } = await import('@/middleware')

    const response = await middleware(createRequest('a.b.c'))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost/admin')
  })

  it('redirects cookies with the wrong payload shape to /admin', async () => {
    const { middleware } = await import('@/middleware')
    const cookieValue = signArbitraryCookie({
      username: 'admin',
      role: 'root',
    })

    const response = await middleware(createRequest(cookieValue))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost/admin')
  })

  it('redirects cookies with undecodable or non-JSON payloads to /admin', async () => {
    const { middleware } = await import('@/middleware')
    const cookieValue = signEncodedPayload(base64UrlEncode('not-json'))

    const response = await middleware(createRequest(cookieValue))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost/admin')
  })

  it('redirects future-dated cookies to /admin', async () => {
    const { middleware } = await import('@/middleware')
    const cookieValue = signArbitraryCookie({
      username: 'admin',
      iat: Math.floor(Date.now() / 1000) + 60,
    })

    const response = await middleware(createRequest(cookieValue))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost/admin')
  })

  it('redirects negative timestamp cookies to /admin', async () => {
    const { middleware } = await import('@/middleware')
    const cookieValue = signArbitraryCookie({
      username: 'admin',
      iat: -1,
    })

    const response = await middleware(createRequest(cookieValue))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost/admin')
  })

  it('redirects expired cookies to /admin', async () => {
    const { middleware } = await import('@/middleware')
    const cookieValue = signArbitraryCookie({
      username: 'admin',
      iat: Math.floor(Date.now() / 1000) - SESSION_MAX_AGE_SECONDS - 1,
    })

    const response = await middleware(createRequest(cookieValue))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost/admin')
  })

  it('allows authenticated requests through', async () => {
    const cookieValue = signCookie({
      username: 'admin',
      iat: Math.floor(Date.now() / 1000),
    })
    const { middleware } = await import('@/middleware')

    const response = await middleware(createRequest(cookieValue))

    expect(response.status).toBe(200)
    expect(response.headers.get('x-middleware-next')).toBe('1')
  })

  it('exports the dashboard matcher', async () => {
    const { config } = await import('@/middleware')

    expect(config.matcher).toEqual(['/admin/dashboard/:path*'])
  })
})
