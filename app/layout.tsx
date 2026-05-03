import type { Metadata } from 'next'
import { Inter, Instrument_Serif } from 'next/font/google'
import { SiteChrome } from '@/components/layout/site-chrome'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const instrumentSerif = Instrument_Serif({
  weight: '400',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-serif',
})

export const metadata: Metadata = {
  title: 'CentraleSupélec Finance',
  description: "Association étudiante de finance à CentraleSupélec : événements, formations et réseau.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body className={`${inter.variable} ${instrumentSerif.variable} antialiased`}>
        <SiteChrome>{children}</SiteChrome>
        <Toaster />
      </body>
    </html>
  )
}
