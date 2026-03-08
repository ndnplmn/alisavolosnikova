// app/about/page.tsx
import { client } from '@/lib/sanity/client'
import { ABOUT_QUERY } from '@/lib/sanity/queries'
import { AboutContent } from '@/components/about/AboutContent'
import { CornerUI } from '@/components/ui/CornerUI'

export const revalidate = 3600

const PLACEHOLDER_DATA = {
  portrait: { asset: { url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=900', metadata: { lqip: null, dimensions: { width: 900, height: 1200 } } } },
  statement: 'I photograph the quiet spaces between moments — the pause before the shutter, the light that lingers after the subject has gone.',
  bio: null,
  pullQuote: 'Every image is a question the world has not yet answered.',
  practice: {
    vision: ['Natural light', 'Long exposure', 'Documentary'],
    process: ['Film & digital', 'Darkroom printing', 'On-location'],
    medium: ['35mm', 'Medium format', 'Large format'],
  },
  clients: ['Vogue Russia', 'Harper\'s Bazaar', 'ELLE', 'Afisha'],
}

export default async function AboutPage() {
  let data: any = null
  try {
    data = await client.fetch(ABOUT_QUERY)
  } catch {
    // Sanity not configured yet
  }
  return (
    <>
      <CornerUI topLeft="ABOUT" bottomLeft="PHOTOGRAPHER" bottomRight="MOSCOW · 2026" />
      <AboutContent data={data ?? PLACEHOLDER_DATA} />
    </>
  )
}
