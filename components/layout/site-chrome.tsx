'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'

type SiteChromeProps = {
  children: ReactNode
}

export function SiteChrome({ children }: SiteChromeProps) {
  const pathname = usePathname()
  const isAdminRoute = pathname === '/admin' || pathname?.startsWith('/admin/')

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <main>{children}</main>
      {!isAdminRoute && <Footer />}
    </>
  )
}
