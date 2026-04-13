import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const SESSION_COOKIE_NAME = 'csf_admin_session'
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8

export type SessionPayload = {
  username: string
  iat: number
}

type CookieOptions = {
  httpOnly: boolean
  sameSite: 'lax'
  path: string
  secure: boolean
  maxAge: number
}

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET

  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET must be set and contain at least 32 characters')
  }

  return secret
}

function isSessionPayload(value: unknown): value is SessionPayload {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Partial<SessionPayload>

  return (
    typeof candidate.username === 'string' &&
    candidate.username.length > 0 &&
    typeof candidate.iat === 'number' &&
    Number.isInteger(candidate.iat)
  )
}

function base64UrlEncode(input: string | Buffer) {
  return Buffer.from(input).toString('base64url')
}

function base64UrlDecode(input: string) {
  return Buffer.from(input, 'base64url').toString('utf8')
}

function signValue(value: string, secret: string) {
  return createHmac('sha256', secret).update(value).digest('base64url')
}

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a)
  const bBuffer = Buffer.from(b)

  if (aBuffer.length !== bBuffer.length) {
    return false
  }

  return timingSafeEqual(aBuffer, bBuffer)
}

export function signCookie(payload: SessionPayload) {
  const secret = getSessionSecret()
  if (!isSessionPayload(payload)) {
    throw new Error('Invalid session payload')
  }
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const signature = signValue(encodedPayload, secret)

  return `${encodedPayload}.${signature}`
}

export function verifyCookie(
  cookieValue?: string,
  now = Math.floor(Date.now() / 1000)
): SessionPayload | undefined {
  if (!cookieValue) {
    return undefined
  }

  const secret = getSessionSecret()
  const parts = cookieValue.split('.')

  if (parts.length !== 2) {
    return undefined
  }

  const [encodedPayload, signature] = parts
  const expectedSignature = signValue(encodedPayload, secret)

  if (!safeEqual(signature, expectedSignature)) {
    return undefined
  }

  let parsedPayload: unknown

  try {
    parsedPayload = JSON.parse(base64UrlDecode(encodedPayload))
  } catch {
    return undefined
  }

  if (!isSessionPayload(parsedPayload)) {
    return undefined
  }

  if (parsedPayload.iat > now || parsedPayload.iat < 0) {
    return undefined
  }

  if (now - parsedPayload.iat > SESSION_MAX_AGE_SECONDS) {
    return undefined
  }

  return parsedPayload
}

export function getSessionCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_MAX_AGE_SECONDS,
  }
}

/**
 * À appeler en début de chaque Server Action admin.
 * Redirige vers /admin si la session est absente ou invalide.
 */
export async function requireAdminSession(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  const session = verifyCookie(token)
  if (!session) redirect('/admin')
}
