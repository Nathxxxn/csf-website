import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { PageLoader } from '@/components/ui/page-loader'
import { SiteChrome } from '@/components/layout/site-chrome'
import { Toaster } from '@/components/ui/sonner'
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
