'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSessionCookieOptions, SESSION_COOKIE_NAME, signCookie } from '@/lib/session'

function getAdminCredentials() {
  const username = process.env.ADMIN_USERNAME
  const password = process.env.ADMIN_PASSWORD

  if (!username || !password) {
    throw new Error('ADMIN_USERNAME and ADMIN_PASSWORD must be set')
  }

  return { username, password }
}

export async function login(formData: FormData) {
  const { username: expectedUsername, password: expectedPassword } = getAdminCredentials()
  const username = String(formData.get('username') ?? '')
  const password = String(formData.get('password') ?? '')

  if (username !== expectedUsername || password !== expectedPassword) {
    redirect('/admin?error=invalid')
  }

  const cookieStore = await cookies()
  const iat = Math.floor(Date.now() / 1000)

  cookieStore.set(
    SESSION_COOKIE_NAME,
    signCookie({ username, iat }),
    getSessionCookieOptions(),
  )

  redirect('/admin/dashboard')
}

export async function logout() {
  const cookieStore = await cookies()

  cookieStore.delete(SESSION_COOKIE_NAME)
  redirect('/admin')
}
