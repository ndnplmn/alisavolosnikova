import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Алиса Волосникова — Photographer',
  description: 'Fine art photography by Алиса Волосникова.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
