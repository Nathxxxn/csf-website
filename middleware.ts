import { NextRequest, NextResponse } from 'next/server'

type SessionPayload = {
  username: string
  iat: number
}

const SESSION_COOKIE_NAME = 'csf_admin_session'
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8
const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET

  if (!secret || secret.length < 32) {
    return undefined
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

function base64UrlToBytes(input: string) {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/')
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const binary = atob(base64 + padding)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return bytes
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = ''

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

async function importHmacKey(secret: string, usage: KeyUsage) {
  return crypto.subtle.importKey(
    'raw',
    textEncoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    [usage],
  )
}

async function signValue(value: string, secret: string) {
  const key = await importHmacKey(secret, 'sign')
  const signature = await crypto.subtle.sign('HMAC', key, textEncoder.encode(value))

  return bytesToBase64Url(new Uint8Array(signature))
}

async function verifySignature(value: string, signature: string, secret: string) {
  try {
    const key = await importHmacKey(secret, 'verify')

    return crypto.subtle.verify(
      'HMAC',
      key,
      base64UrlToBytes(signature),
      textEncoder.encode(value),
    )
  } catch {
    return false
  }
}

async function verifyCookie(cookieValue?: string, now = Math.floor(Date.now() / 1000)) {
  if (!cookieValue) {
    return undefined
  }

  const secret = getSessionSecret()

  if (!secret) {
    return undefined
  }

  const parts = cookieValue.split('.')

  if (parts.length !== 2) {
    return undefined
  }

  const [encodedPayload, signature] = parts

  if (!(await verifySignature(encodedPayload, signature, secret))) {
    return undefined
  }

  let parsedPayload: unknown

  try {
    parsedPayload = JSON.parse(textDecoder.decode(base64UrlToBytes(encodedPayload)))
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

export async function middleware(request: NextRequest) {
  const cookieValue = request.cookies.get(SESSION_COOKIE_NAME)?.value
  const session = await verifyCookie(cookieValue)

  if (!session) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/dashboard/:path*'],
}
