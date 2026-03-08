import { client } from '@/lib/sanity/client'
import { FEATURED_SERIES_QUERY } from '@/lib/sanity/queries'
import { Hero } from '@/components/home/Hero'
import { Statement } from '@/components/home/Statement'
import { FeaturedWork } from '@/components/home/FeaturedWork'
import { SeriesCounter } from '@/components/home/SeriesCounter'
import { PrintTeaser } from '@/components/home/PrintTeaser'

export const revalidate = 3600

// Placeholder image for development (replaced with real Sanity images later)
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80'

export default async function HomePage() {
  let featuredSeries: any[] = []

  try {
    // Will return empty array if Sanity is not yet configured
    if (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID && process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== 'your_project_id_here') {
      featuredSeries = await client.fetch(FEATURED_SERIES_QUERY)
    }
  } catch {
    // Sanity not configured yet — use placeholders
  }

  const heroImageUrl = featuredSeries[0]?.coverImage?.asset?.url ?? PLACEHOLDER_IMAGE

  return (
    <main>
      <Hero imageUrl={heroImageUrl} imageAlt="Алиса Волосникова" />

      <Statement />

      {featuredSeries.length > 0 && (
        <FeaturedWork series={featuredSeries} />
      )}

      <SeriesCounter />

      <PrintTeaser imageUrl={PLACEHOLDER_IMAGE} />
    </main>
  )
}
