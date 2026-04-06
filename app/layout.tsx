import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SiteChrome } from '@/components/layout/site-chrome'
import { PageLoader } from '@/components/ui/page-loader'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/ui/theme-provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'CentraleSupélec Finance',
  description: "Association étudiante de finance à CentraleSupélec : événements, formations et réseau.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider>
          <PageLoader />
          <SiteChrome>{children}</SiteChrome>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
