# Navbar Floating Pill + Admin Login Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer la navbar publique actuelle par une floating pill centrée inspirée du prompt `mini-navbar`, puis ajouter un login admin minimal avec cookie signé et dashboard protégé.

**Architecture:** Le composant fourni est adapté à la structure existante au lieu d'être copié tel quel dans `components/ui`: la navbar reste dans `components/layout/navbar.tsx`, utilise `next/link`, `next/image`, et `lucide-react`, et pointe vers les routes réelles du site. Un wrapper client léger rend le chrome public conditionnel pour masquer navbar/footer sur `/admin*`. L’auth admin reste sans dépendance externe via `lib/session.ts` (HMAC-SHA256, cookie signé 8h), des Server Actions dans `app/admin/actions.ts`, et `middleware.ts` pour protéger `/admin/dashboard`.

**Tech Stack:** Next.js 16 app router, React 19, Tailwind CSS v4, shadcn/ui, TypeScript, Vitest, Testing Library, Node `crypto`

---

## Existing Constraints And Adaptation Notes

- Le projet supporte déjà **shadcn**, **Tailwind CSS** et **TypeScript** :
  - `components.json` existe
  - `app/globals.css` est la feuille Tailwind shadcn déclarée
  - `tsconfig.json` est strict et l’alias `@/*` est configuré
- Le chemin UI par défaut existe déjà : `@/components/ui` → `components/ui`
- La spec impose une adaptation du prompt, pas une copie 1:1 :
  - **Ne pas** créer `components/ui/mini-navbar.tsx`
  - **Remplacer** `components/layout/navbar.tsx` en place
  - **Utiliser** le logo existant `public/logo.svg`
  - **Remplacer** les SVG inline du prompt par `lucide-react` (`Menu`, `X`)
  - **Supprimer** login/signup de la navbar publique
  - **Utiliser** les routes réelles : `/evenements`, `/equipe`, `/a-propos`, `/contact`
- Aucune dépendance externe supplémentaire n’est requise pour cette itération.

## File Structure

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `components/layout/site-chrome.tsx` | Afficher/masquer navbar + footer selon la route |
| Modify | `app/layout.tsx` | Remplacer le rendu direct de `Navbar`/`Footer` par `SiteChrome` |
| Modify | `components/layout/navbar.tsx` | Refonte floating pill adaptée du prompt mini-navbar |
| Create | `__tests__/navbar.test.tsx` | Tests RTL pour navbar + visibilité du chrome |
| Create | `.env.example` | Documenter `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `SESSION_SECRET` |
| Create | `lib/session.ts` | Signature/vérification du cookie admin |
| Create | `__tests__/session.test.ts` | Tests unitaires des helpers de session |
| Create | `app/admin/actions.ts` | Server Actions `login()` et `logout()` |
| Create | `app/admin/page.tsx` | Page de login admin sans chrome public |
| Create | `app/admin/dashboard/page.tsx` | Dashboard placeholder protégé |
| Create | `__tests__/admin-actions.test.ts` | Tests unitaires des Server Actions admin |
| Create | `middleware.ts` | Protection de `/admin/dashboard` |
| Create | `__tests__/middleware.test.ts` | Tests du middleware |

## Task 1: Replace Public Navbar And Make Chrome Route-Aware

**Files:**
- Create: `components/layout/site-chrome.tsx`
- Modify: `app/layout.tsx`
- Modify: `components/layout/navbar.tsx`
- Test: `__tests__/navbar.test.tsx`

- [ ] **Step 1: Write the failing navbar/chrome tests**

Create `__tests__/navbar.test.tsx` with:

```tsx
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Navbar } from '@/components/layout/navbar'
import { SiteChrome } from '@/components/layout/site-chrome'

const mockedUsePathname = vi.fn()

vi.mock('next/navigation', () => ({
  usePathname: () => mockedUsePathname(),
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} alt={props.alt ?? ''} />,
}))

vi.mock('@/components/layout/footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}))

describe('Navbar', () => {
  it('renders the CSF logo and all public navigation links', () => {
    render(<Navbar />)

    expect(screen.getByAltText('CSF Logo')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Événements' })[0]).toHaveAttribute('href', '/evenements')
    expect(screen.getAllByRole('link', { name: 'Équipe' })[0]).toHaveAttribute('href', '/equipe')
    expect(screen.getAllByRole('link', { name: 'À propos' })[0]).toHaveAttribute('href', '/a-propos')
    expect(screen.getAllByRole('link', { name: 'Nous contacter' })[0]).toHaveAttribute('href', '/contact')
  })

  it('opens and closes the mobile menu', async () => {
    const user = userEvent.setup()
    render(<Navbar />)

    const toggle = screen.getByRole('button', { name: 'Open Menu' })
    await user.click(toggle)
    expect(screen.getByRole('button', { name: 'Close Menu' })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Contacter' })[0]).toHaveAttribute('href', '/contact')
  })
})

describe('SiteChrome', () => {
  beforeEach(() => {
    mockedUsePathname.mockReset()
  })

  it('renders navbar and footer on public routes', () => {
    mockedUsePathname.mockReturnValue('/evenements')
    render(<SiteChrome><div>Public page</div></SiteChrome>)

    expect(screen.getByAltText('CSF Logo')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('hides navbar and footer on admin routes', () => {
    mockedUsePathname.mockReturnValue('/admin')
    render(<SiteChrome><div>Admin page</div></SiteChrome>)

    expect(screen.queryByAltText('CSF Logo')).not.toBeInTheDocument()
    expect(screen.queryByTestId('footer')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
cd /Users/nathandifraja/CSF_website && npx vitest run __tests__/navbar.test.tsx
```

Expected: FAIL because `components/layout/site-chrome.tsx` does not exist and the navbar does not yet render the floating pill behavior.

- [ ] **Step 3: Create the route-aware chrome wrapper**

Create `components/layout/site-chrome.tsx`:

```tsx
'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminRoute = pathname.startsWith('/admin')

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <main>{children}</main>
      {!isAdminRoute && <Footer />}
    </>
  )
}
```

- [ ] **Step 4: Update the root layout to use `SiteChrome`**

Replace the body contents in `app/layout.tsx` with:

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { PageLoader } from '@/components/ui/page-loader'
import { SiteChrome } from '@/components/layout/site-chrome'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'CentraleSupélec Finance',
  description: "L'association finance de référence à CentraleSupélec.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body className={`${inter.variable} antialiased`}>
        <PageLoader />
        <SiteChrome>{children}</SiteChrome>
        <Toaster />
      </body>
    </html>
  )
}
```

- [ ] **Step 5: Replace the navbar with the adapted floating pill component**

Replace `components/layout/navbar.tsx` entirely with:

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { href: '/evenements', label: 'Événements' },
  { href: '/equipe', label: 'Équipe' },
  { href: '/a-propos', label: 'À propos' },
]

function AnimatedNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group relative inline-flex h-5 items-center overflow-hidden text-sm"
    >
      <span className="flex flex-col transition-transform duration-300 ease-out group-hover:-translate-y-1/2">
        <span className="text-gray-300">{children}</span>
        <span className="text-white">{children}</span>
      </span>
    </Link>
  )
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [shapeClass, setShapeClass] = useState('rounded-full')
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (isOpen) {
      setShapeClass('rounded-xl')
      return
    }

    timeoutRef.current = setTimeout(() => {
      setShapeClass('rounded-full')
    }, 300)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isOpen])

  return (
    <header
      className={`fixed top-6 left-1/2 z-50 flex w-[calc(100%-2rem)] -translate-x-1/2 flex-col items-center border border-[#333] bg-[rgba(31,31,31,0.57)] px-5 py-3 backdrop-blur-sm transition-[border-radius] duration-300 sm:w-auto ${shapeClass}`}
    >
      <div className="flex w-full items-center justify-between gap-6 sm:gap-8">
        <Link href="/" className="flex items-center justify-center" aria-label="Accueil CSF">
          <Image
            src="/logo.svg"
            alt="CSF Logo"
            width={28}
            height={28}
            className="mix-blend-screen"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-6 sm:flex">
          {NAV_LINKS.map(link => (
            <AnimatedNavLink key={link.href} href={link.href}>
              {link.label}
            </AnimatedNavLink>
          ))}
        </nav>

        <div className="hidden sm:block">
          <Link
            href="/contact"
            className="relative inline-flex items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-300 px-4 py-2 text-sm font-semibold text-black transition-all duration-200 hover:from-gray-200 hover:to-gray-400"
          >
            Nous contacter
          </Link>
        </div>

        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center text-gray-300 sm:hidden"
          onClick={() => setIsOpen(open => !open)}
          aria-label={isOpen ? 'Close Menu' : 'Open Menu'}
          aria-expanded={isOpen}
          aria-controls="mobile-nav"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        id="mobile-nav"
        className={`flex w-full flex-col items-center overflow-hidden transition-all duration-300 ease-in-out sm:hidden ${
          isOpen ? 'max-h-[320px] opacity-100 pt-4' : 'pointer-events-none max-h-0 opacity-0 pt-0'
        }`}
      >
        <nav className="flex w-full flex-col items-center space-y-4 text-base">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="w-full text-center text-gray-300 transition-colors hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-4 flex w-full flex-col items-center">
          <Link
            href="/contact"
            className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-300 px-4 py-2 text-sm font-semibold text-black transition-all duration-200 hover:from-gray-200 hover:to-gray-400"
            onClick={() => setIsOpen(false)}
          >
            Contacter
          </Link>
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 6: Run the navbar/chrome tests again**

Run:

```bash
cd /Users/nathandifraja/CSF_website && npx vitest run __tests__/navbar.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add app/layout.tsx components/layout/navbar.tsx components/layout/site-chrome.tsx __tests__/navbar.test.tsx
git commit -m "feat: replace public navbar with floating pill"
```

## Task 2: Add Signed Session Helpers And Environment Contract

**Files:**
- Create: `.env.example`
- Create: `lib/session.ts`
- Test: `__tests__/session.test.ts`

- [ ] **Step 1: Write failing session tests**

Create `__tests__/session.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  SESSION_MAX_AGE_SECONDS,
  signCookie,
  verifyCookie,
} from '@/lib/session'

describe('session helpers', () => {
  beforeEach(() => {
    vi.stubEnv('SESSION_SECRET', '0123456789abcdef0123456789abcdef')
  })

  it('round-trips a valid signed cookie', () => {
    const cookie = signCookie({ username: 'csf-admin', iat: 1_700_000_000 })
    expect(verifyCookie(cookie, 1_700_000_100)).toEqual({
      username: 'csf-admin',
      iat: 1_700_000_000,
    })
  })

  it('rejects a tampered signature', () => {
    const cookie = signCookie({ username: 'csf-admin', iat: 1_700_000_000 })
    const [payload] = cookie.split('.')
    expect(verifyCookie(`${payload}.tampered`, 1_700_000_100)).toBeNull()
  })

  it('rejects an expired cookie', () => {
    const cookie = signCookie({ username: 'csf-admin', iat: 1_700_000_000 })
    expect(verifyCookie(cookie, 1_700_000_000 + SESSION_MAX_AGE_SECONDS + 1)).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
cd /Users/nathandifraja/CSF_website && npx vitest run __tests__/session.test.ts
```

Expected: FAIL because `lib/session.ts` does not exist.

- [ ] **Step 3: Document required environment variables**

Create `.env.example`:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-me
SESSION_SECRET=replace-with-32-or-more-random-characters
```

- [ ] **Step 4: Implement signed cookie helpers**

Create `lib/session.ts`:

```ts
import crypto from 'crypto'

export const SESSION_COOKIE_NAME = 'csf_admin_session'
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8

export interface SessionPayload {
  username: string
  iat: number
}

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET

  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET must be set and at least 32 characters long')
  }

  return secret
}

function encodePayload(payload: SessionPayload) {
  return Buffer.from(JSON.stringify(payload)).toString('base64url')
}

function decodePayload(value: string): SessionPayload | null {
  try {
    const parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8'))

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof parsed.username !== 'string' ||
      typeof parsed.iat !== 'number'
    ) {
      return null
    }

    return parsed as SessionPayload
  } catch {
    return null
  }
}

function signValue(value: string) {
  return crypto.createHmac('sha256', getSessionSecret()).update(value).digest('base64url')
}

export function signCookie(payload: SessionPayload) {
  const encoded = encodePayload(payload)
  const signature = signValue(encoded)
  return `${encoded}.${signature}`
}

export function verifyCookie(cookieValue?: string, now = Math.floor(Date.now() / 1000)) {
  if (!cookieValue) {
    return null
  }

  const [encodedPayload, signature] = cookieValue.split('.')

  if (!encodedPayload || !signature) {
    return null
  }

  const expectedSignature = signValue(encodedPayload)
  const actualBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expectedSignature)

  if (
    actualBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return null
  }

  const payload = decodePayload(encodedPayload)

  if (!payload) {
    return null
  }

  if (now - payload.iat > SESSION_MAX_AGE_SECONDS) {
    return null
  }

  return payload
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_MAX_AGE_SECONDS,
  }
}
```

- [ ] **Step 5: Run the session tests again**

Run:

```bash
cd /Users/nathandifraja/CSF_website && npx vitest run __tests__/session.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add .env.example lib/session.ts __tests__/session.test.ts
git commit -m "feat: add signed admin session helpers"
```

## Task 3: Implement Admin Login Page, Actions, And Placeholder Dashboard

**Files:**
- Create: `app/admin/actions.ts`
- Create: `app/admin/page.tsx`
- Create: `app/admin/dashboard/page.tsx`
- Test: `__tests__/admin-actions.test.ts`

- [ ] **Step 1: Write failing tests for admin auth actions**

Create `__tests__/admin-actions.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest'

const cookieStore = {
  set: vi.fn(),
  delete: vi.fn(),
}

const redirect = vi.fn((location: string) => {
  throw new Error(`NEXT_REDIRECT:${location}`)
})

const signCookie = vi.fn(() => 'signed-cookie')

vi.mock('next/headers', () => ({
  cookies: async () => cookieStore,
}))

vi.mock('next/navigation', () => ({
  redirect: (location: string) => redirect(location),
}))

vi.mock('@/lib/session', () => ({
  SESSION_COOKIE_NAME: 'csf_admin_session',
  getSessionCookieOptions: () => ({
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: false,
    maxAge: 28800,
  }),
  signCookie: (...args: unknown[]) => signCookie(...args),
}))

const { login, logout } = await import('@/app/admin/actions')

describe('admin auth actions', () => {
  beforeEach(() => {
    cookieStore.set.mockReset()
    cookieStore.delete.mockReset()
    redirect.mockClear()
    signCookie.mockClear()
    vi.stubEnv('ADMIN_USERNAME', 'csf-admin')
    vi.stubEnv('ADMIN_PASSWORD', 'super-secret-password')
  })

  it('redirects back to /admin with an error when credentials are invalid', async () => {
    const formData = new FormData()
    formData.set('username', 'wrong')
    formData.set('password', 'bad')

    await expect(login(formData)).rejects.toThrow('NEXT_REDIRECT:/admin?error=invalid')
    expect(cookieStore.set).not.toHaveBeenCalled()
  })

  it('sets the signed cookie and redirects to the dashboard when credentials are valid', async () => {
    const formData = new FormData()
    formData.set('username', 'csf-admin')
    formData.set('password', 'super-secret-password')

    await expect(login(formData)).rejects.toThrow('NEXT_REDIRECT:/admin/dashboard')
    expect(signCookie).toHaveBeenCalledWith({
      username: 'csf-admin',
      iat: expect.any(Number),
    })
    expect(cookieStore.set).toHaveBeenCalledWith(
      'csf_admin_session',
      'signed-cookie',
      expect.objectContaining({ httpOnly: true, sameSite: 'lax' }),
    )
  })

  it('deletes the cookie and redirects to /admin on logout', async () => {
    await expect(logout()).rejects.toThrow('NEXT_REDIRECT:/admin')
    expect(cookieStore.delete).toHaveBeenCalledWith('csf_admin_session')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
cd /Users/nathandifraja/CSF_website && npx vitest run __tests__/admin-actions.test.ts
```

Expected: FAIL because `app/admin/actions.ts` does not exist.

- [ ] **Step 3: Implement login/logout server actions**

Create `app/admin/actions.ts`:

```ts
'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  getSessionCookieOptions,
  SESSION_COOKIE_NAME,
  signCookie,
} from '@/lib/session'

export async function login(formData: FormData) {
  const username = String(formData.get('username') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const expectedUsername = process.env.ADMIN_USERNAME ?? ''
  const expectedPassword = process.env.ADMIN_PASSWORD ?? ''

  if (!expectedUsername || !expectedPassword) {
    throw new Error('ADMIN_USERNAME and ADMIN_PASSWORD must be configured')
  }

  if (username !== expectedUsername || password !== expectedPassword) {
    redirect('/admin?error=invalid')
  }

  const cookieStore = await cookies()
  const signedCookie = signCookie({
    username,
    iat: Math.floor(Date.now() / 1000),
  })

  cookieStore.set(SESSION_COOKIE_NAME, signedCookie, getSessionCookieOptions())
  redirect('/admin/dashboard')
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
  redirect('/admin')
}
```

- [ ] **Step 4: Create the `/admin` login page**

Create `app/admin/page.tsx`:

```tsx
import Image from 'next/image'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { login } from './actions'
import { SESSION_COOKIE_NAME, verifyCookie } from '@/lib/session'

type AdminPageProps = {
  searchParams?: Promise<{ error?: string }>
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const cookieStore = await cookies()
  const session = verifyCookie(cookieStore.get(SESSION_COOKIE_NAME)?.value)

  if (session) {
    redirect('/admin/dashboard')
  }

  const resolvedSearchParams = (await searchParams) ?? {}
  const showError = resolvedSearchParams.error === 'invalid'

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-6 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-sm items-center">
        <div className="w-full rounded-2xl border border-[#333] bg-white/[0.04] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="mb-8 flex flex-col items-center text-center">
            <Image
              src="/logo.svg"
              alt="CSF Logo"
              width={56}
              height={56}
              className="mb-4 mix-blend-screen"
              priority
            />
            <h1 className="text-2xl font-semibold tracking-tight">Espace administrateur</h1>
            <p className="mt-2 text-sm text-gray-400">
              Connexion réservée à l’équipe CSF.
            </p>
          </div>

          <form action={login} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm text-gray-300">
                Identifiant
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="w-full rounded-lg border border-[#333] bg-white/[0.04] px-4 py-3 text-white outline-none transition-colors focus:border-white/50"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm text-gray-300">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full rounded-lg border border-[#333] bg-white/[0.04] px-4 py-3 text-white outline-none transition-colors focus:border-white/50"
              />
            </div>

            {showError && (
              <p
                role="alert"
                className="rounded-lg border border-red-500/25 bg-red-500/8 px-4 py-3 text-sm text-red-200"
              >
                Identifiants incorrects.
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-full bg-gradient-to-br from-gray-100 to-gray-300 px-4 py-3 text-sm font-semibold text-black transition-all duration-200 hover:from-gray-200 hover:to-gray-400"
            >
              Se connecter
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create the protected dashboard placeholder**

Create `app/admin/dashboard/page.tsx`:

```tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { logout } from '../actions'
import { SESSION_COOKIE_NAME, verifyCookie } from '@/lib/session'

export default async function AdminDashboardPage() {
  const cookieStore = await cookies()
  const session = verifyCookie(cookieStore.get(SESSION_COOKIE_NAME)?.value)

  if (!session) {
    redirect('/admin')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col gap-4 border-b border-[#333] pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-gray-500">CSF Admin</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Console administrateur
            </h1>
          </div>

          <form action={logout}>
            <button
              type="submit"
              className="rounded-full border border-[#333] bg-white/[0.04] px-4 py-2 text-sm text-gray-200 transition-colors hover:border-white/40 hover:text-white"
            >
              Se déconnecter
            </button>
          </form>
        </header>

        <section className="rounded-2xl border border-[#333] bg-white/[0.03] p-8">
          <h2 className="text-xl font-medium">Console en cours de développement</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400">
            Les outils de gestion des événements, membres et contenus seront ajoutés lors d’une itération ultérieure.
          </p>
          <p className="mt-6 text-xs uppercase tracking-[0.2em] text-gray-500">
            Session active: {session.username}
          </p>
        </section>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Run the action tests again**

Run:

```bash
cd /Users/nathandifraja/CSF_website && npx vitest run __tests__/admin-actions.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add app/admin/actions.ts app/admin/page.tsx app/admin/dashboard/page.tsx __tests__/admin-actions.test.ts
git commit -m "feat: add admin login and dashboard placeholder"
```

## Task 4: Protect The Dashboard With Middleware And Run Final Verification

**Files:**
- Create: `middleware.ts`
- Test: `__tests__/middleware.test.ts`

- [ ] **Step 1: Write failing middleware tests**

Create `__tests__/middleware.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const verifyCookie = vi.fn()

vi.mock('@/lib/session', () => ({
  SESSION_COOKIE_NAME: 'csf_admin_session',
  verifyCookie: (...args: unknown[]) => verifyCookie(...args),
}))

const { middleware } = await import('@/middleware')

describe('admin middleware', () => {
  beforeEach(() => {
    verifyCookie.mockReset()
  })

  it('redirects anonymous users to /admin', () => {
    verifyCookie.mockReturnValue(null)

    const request = new NextRequest('http://localhost:3000/admin/dashboard')
    const response = middleware(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/admin')
  })

  it('allows authenticated users through', () => {
    verifyCookie.mockReturnValue({ username: 'csf-admin', iat: 1_700_000_000 })

    const request = new NextRequest('http://localhost:3000/admin/dashboard')
    const response = middleware(request)

    expect(response.headers.get('x-middleware-next')).toBe('1')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
cd /Users/nathandifraja/CSF_website && npx vitest run __tests__/middleware.test.ts
```

Expected: FAIL because `middleware.ts` does not exist.

- [ ] **Step 3: Implement the middleware**

Create `middleware.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE_NAME, verifyCookie } from '@/lib/session'

export function middleware(request: NextRequest) {
  const cookieValue = request.cookies.get(SESSION_COOKIE_NAME)?.value
  const session = verifyCookie(cookieValue)

  if (!session) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/dashboard/:path*'],
}
```

- [ ] **Step 4: Run middleware tests again**

Run:

```bash
cd /Users/nathandifraja/CSF_website && npx vitest run __tests__/middleware.test.ts
```

Expected: PASS.

- [ ] **Step 5: Run the full verification suite**

Run:

```bash
cd /Users/nathandifraja/CSF_website && npx vitest run __tests__/navbar.test.tsx __tests__/session.test.ts __tests__/admin-actions.test.ts __tests__/middleware.test.ts
cd /Users/nathandifraja/CSF_website && npm run build
```

Expected:
- All four targeted test files PASS
- `next build` succeeds with no route or middleware errors

Then verify manually in the browser:

```text
1. Ouvrir /
2. Vérifier la floating pill centrée, logo seul, 3 liens, CTA "Nous contacter"
3. Réduire en mobile et ouvrir/fermer le menu hamburger
4. Ouvrir /admin sans être connecté
5. Tenter un mauvais login et vérifier "Identifiants incorrects."
6. Se connecter avec les bonnes variables d'env et vérifier la redirection vers /admin/dashboard
7. Ouvrir /admin en étant connecté et vérifier la redirection automatique vers /admin/dashboard
8. Cliquer "Se déconnecter" et vérifier le retour vers /admin
9. Ouvrir /admin/dashboard sans cookie valide et vérifier la redirection vers /admin
```

- [ ] **Step 6: Commit**

```bash
git add middleware.ts __tests__/middleware.test.ts
git commit -m "feat: protect admin dashboard with middleware"
```

## Self-Review

**Spec coverage:**
- Navbar floating pill + dropdown mobile: couvert par Task 1
- Aucun bouton login dans la navbar: couvert par Task 1
- `/admin` + `/admin/dashboard`: couverts par Task 3
- Cookie signé HMAC-SHA256 + expiration 8h: couvert par Task 2
- Middleware de protection: couvert par Task 4
- Absence de navbar/footer publics sur admin: couvert par Task 1

**Placeholder scan:**
- Aucun `TODO`, `TBD`, ou “handle appropriately” restant dans les tâches

**Type consistency:**
- `SessionPayload`, `SESSION_COOKIE_NAME`, `signCookie`, `verifyCookie`, `login`, `logout` sont cohérents entre les tâches
