import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { PageLoader } from '@/components/ui/page-loader'
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
        <Navbar />
        <main>{children}</main>
        <Footer />
        <Toaster />
      </body>
    </html>
  )
}
