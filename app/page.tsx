import { client }              from '@/lib/sanity/client'
import { FEATURED_SERIES_QUERY } from '@/lib/sanity/queries'
import { Hero }                from '@/components/home/Hero'
import { Statement }           from '@/components/home/Statement'
import { SeriesCounter }       from '@/components/home/SeriesCounter'
import { PrintTeaser }         from '@/components/home/PrintTeaser'

export const revalidate = 3600

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1920&q=80'

export default async function HomePage() {
  let featuredSeries: any[] = []

  try {
    if (
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== 'your_project_id_here'
    ) {
      featuredSeries = await client.fetch(FEATURED_SERIES_QUERY)
    }
  } catch { /* Sanity not configured */ }

  const heroImageUrl = featuredSeries[0]?.coverImage?.asset?.url ?? PLACEHOLDER_IMAGE

  return (
    <main>
      {/* Hero occupies full viewport minus nav height (handled via CSS var in Hero component) */}
      <Hero imageUrl={heroImageUrl} imageAlt="Алиса Волосникова — Fine Art Photography" />

      <Statement />

      <SeriesCounter />

      <PrintTeaser imageUrl={PLACEHOLDER_IMAGE} />
    </main>
  )
}
