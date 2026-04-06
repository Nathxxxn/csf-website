import { render, screen } from '@testing-library/react'
import { createElement, type ComponentProps } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SESSION_COOKIE_NAME, signCookie, verifyCookie } from '@/lib/session'

const redirectMock = vi.fn((location: string) => {
  throw new Error(`NEXT_REDIRECT:${location}`)
})

const cookiesMock = vi.fn()

vi.mock('next/navigation', () => ({
  redirect: redirectMock,
}))

vi.mock('next/headers', () => ({
  cookies: cookiesMock,
}))

vi.mock('next/image', () => ({
  default: ({ alt = '', priority: _priority, ...props }: ComponentProps<'img'> & { alt?: string; priority?: boolean }) =>
    createElement('img', { alt, ...props }),
}))

const originalSessionSecret = process.env.SESSION_SECRET
const originalAdminUsername = process.env.ADMIN_USERNAME
const originalAdminPassword = process.env.ADMIN_PASSWORD

function createFormData(entries: Array<[string, string]>) {
  const formData = new FormData()

  for (const [key, value] of entries) {
    formData.append(key, value)
  }

  return formData
}

function createValidSessionCookie(username = 'admin') {
  return signCookie({
    username,
    iat: Math.floor(Date.now() / 1000),
  })
}

describe('admin actions', () => {
  beforeEach(() => {
    vi.resetModules()
    redirectMock.mockClear()
    cookiesMock.mockReset()

    process.env.SESSION_SECRET = 'a'.repeat(32)
    process.env.ADMIN_USERNAME = 'admin'
    process.env.ADMIN_PASSWORD = 'super-secret'
  })

  afterEach(() => {
    vi.unstubAllEnvs()

    if (originalSessionSecret === undefined) {
      delete process.env.SESSION_SECRET
    } else {
      process.env.SESSION_SECRET = originalSessionSecret
    }

    if (originalAdminUsername === undefined) {
      delete process.env.ADMIN_USERNAME
    } else {
      process.env.ADMIN_USERNAME = originalAdminUsername
    }

    if (originalAdminPassword === undefined) {
      delete process.env.ADMIN_PASSWORD
    } else {
      process.env.ADMIN_PASSWORD = originalAdminPassword
    }
  })

  it('invalid credentials redirect back to /admin?error=invalid and do not set cookie', async () => {
    const cookieStore = { set: vi.fn(), delete: vi.fn() }
    cookiesMock.mockResolvedValue(cookieStore)
    const { login } = await import('@/app/admin/actions/auth')

    await expect(
      login(
        createFormData([
          ['username', 'wrong'],
          ['password', 'credentials'],
        ]),
      ),
    ).rejects.toThrow('NEXT_REDIRECT:/admin?error=invalid')

    expect(cookiesMock).not.toHaveBeenCalled()
    expect(cookieStore.set).not.toHaveBeenCalled()
    expect(redirectMock).toHaveBeenCalledWith('/admin?error=invalid')
  })

  it('valid credentials set the signed cookie and redirect to /admin/dashboard', async () => {
    const cookieStore = { set: vi.fn(), delete: vi.fn() }
    cookiesMock.mockResolvedValue(cookieStore)
    const { login } = await import('@/app/admin/actions/auth')

    await expect(
      login(
        createFormData([
          ['username', 'admin'],
          ['password', 'super-secret'],
        ]),
      ),
    ).rejects.toThrow('NEXT_REDIRECT:/admin/dashboard')

    expect(cookieStore.set).toHaveBeenCalledTimes(1)
    const [name, value, options] = cookieStore.set.mock.calls[0]
    const session = verifyCookie(value)

    expect(name).toBe(SESSION_COOKIE_NAME)
    expect(options).toMatchObject({
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: expect.any(Number),
    })
    expect(session?.username).toBe('admin')
    expect(session?.iat).toEqual(expect.any(Number))
    expect(redirectMock).toHaveBeenCalledWith('/admin/dashboard')
  })

  it('logout deletes cookie and redirects to /admin', async () => {
    const cookieStore = { set: vi.fn(), delete: vi.fn() }
    cookiesMock.mockResolvedValue(cookieStore)
    const { logout } = await import('@/app/admin/actions/auth')

    await expect(logout()).rejects.toThrow('NEXT_REDIRECT:/admin')

    expect(cookieStore.delete).toHaveBeenCalledWith(SESSION_COOKIE_NAME)
    expect(redirectMock).toHaveBeenCalledWith('/admin')
  })
})

describe('admin pages', () => {
  beforeEach(() => {
    vi.resetModules()
    redirectMock.mockClear()
    cookiesMock.mockReset()
    process.env.SESSION_SECRET = 'a'.repeat(32)
  })

  it('/admin redirects to /admin/dashboard when a valid session cookie is present', async () => {
    cookiesMock.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: createValidSessionCookie() }),
    })

    const { default: AdminLoginPage } = await import('@/app/admin/page')

    await expect(
      AdminLoginPage({
        searchParams: Promise.resolve({}),
      }),
    ).rejects.toThrow('NEXT_REDIRECT:/admin/dashboard')

    expect(redirectMock).toHaveBeenCalledWith('/admin/dashboard')
  })

  it('/admin renders the inline invalid-credentials message when searchParams.error is invalid', async () => {
    cookiesMock.mockResolvedValue({
      get: vi.fn().mockReturnValue(undefined),
    })

    const { default: AdminLoginPage } = await import('@/app/admin/page')
    const page = await AdminLoginPage({
      searchParams: Promise.resolve({ error: 'invalid' }),
    })

    render(page)

    expect(screen.getByText('Identifiants incorrects.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Se connecter' })).toBeInTheDocument()
    expect(screen.getByText('Espace administrateur')).toBeInTheDocument()
  })

  it('/admin/dashboard redirects to /admin when no valid session exists', async () => {
    cookiesMock.mockResolvedValue({
      get: vi.fn().mockReturnValue(undefined),
    })

    const { default: AdminDashboardPage } = await import('@/app/admin/dashboard/page')

    await expect(AdminDashboardPage({ searchParams: Promise.resolve({}) })).rejects.toThrow('NEXT_REDIRECT:/admin')

    expect(redirectMock).toHaveBeenCalledWith('/admin')
  })
})
