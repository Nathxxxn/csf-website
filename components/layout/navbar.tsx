'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/evenements', label: 'Événements' },
  { href: '/equipe', label: 'Équipe' },
  { href: '/a-propos', label: 'À propos' },
] as const

const MOBILE_SHELL_CLOSE_DELAY_MS = 300

function AnimatedNavLink({
  href,
  children,
}: {
  href: string
  children: string
}) {
  return (
    <Link
      href={href}
      className="group relative inline-flex h-5 overflow-hidden text-sm font-medium text-[#f2f2f2] transition-colors hover:text-white"
    >
      <span className="block transition-transform duration-300 ease-out group-hover:-translate-y-full">
        {children}
      </span>
      <span
        aria-hidden="true"
        className="absolute inset-0 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0"
      >
        {children}
      </span>
    </Link>
  )
}

export function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileShellOpen, setMobileShellOpen] = useState(false)

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    if (mobileMenuOpen) {
      setMobileShellOpen(true)
    } else {
      timeoutId = setTimeout(() => {
        setMobileShellOpen(false)
      }, MOBILE_SHELL_CLOSE_DELAY_MS)
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [mobileMenuOpen])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  return (
    <header className="fixed left-1/2 top-6 z-50 -translate-x-1/2 px-4">
      <div className="mx-auto flex w-fit justify-center">
        <div
          className={cn(
            'inline-flex w-auto max-w-[calc(100vw-1rem)] flex-col overflow-hidden rounded-full border border-[#333] bg-[rgba(31,31,31,0.57)] shadow-[0_18px_50px_rgba(0,0,0,0.25)] backdrop-blur-sm transition-[border-radius,box-shadow] duration-300 ease-in-out',
            mobileShellOpen && 'rounded-xl shadow-[0_24px_70px_rgba(0,0,0,0.35)]',
          )}
        >
          <div className="flex items-center gap-4 px-4 py-3 sm:px-5">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="CSF Logo"
                width={28}
                height={28}
                className="h-7 w-7"
                priority
              />
            </Link>

            <nav className="hidden items-center gap-7 md:flex">
              {NAV_LINKS.map(link => (
                <AnimatedNavLink
                  key={link.href}
                  href={link.href}
                >
                  {link.label}
                </AnimatedNavLink>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Link
                href="/contact"
                className="hidden rounded-full bg-[#f2f2f2] px-4 py-2 text-sm font-semibold text-[#111] transition-opacity hover:opacity-90 md:inline-flex"
              >
                Nous contacter
              </Link>
              <button
                type="button"
                aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-nav-panel"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#333] bg-[#1f1f1f]/70 text-[#f2f2f2] transition-colors hover:bg-[#262626] md:hidden"
                onClick={() => setMobileMenuOpen(open => !open)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div
            id="mobile-nav-panel"
            className={cn(
              'grid overflow-hidden border-t border-[#333] px-4 transition-[max-height,opacity,padding-top,padding-bottom] duration-300 ease-out md:hidden',
              mobileMenuOpen ? 'max-h-80 py-4 opacity-100' : 'max-h-0 py-0 opacity-0',
            )}
          >
            {mobileMenuOpen && (
              <nav className="flex flex-col gap-3">
                {NAV_LINKS.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-lg px-2 py-2 text-sm font-medium text-[#f2f2f2] transition-colors hover:bg-white/5"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/contact"
                  className="rounded-lg bg-[#f2f2f2] px-3 py-2 text-sm font-semibold text-[#111] transition-opacity hover:opacity-90"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contacter
                </Link>
              </nav>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
