import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Nav } from '@/components/ui/Nav'

const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Алиса Волосникова — Photographer',
  description: 'Fine art photography by Алиса Волосникова.',
  openGraph: {
    title: 'Алиса Волосникова',
    description: 'Fine art photography',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body suppressHydrationWarning>
        <Nav />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
