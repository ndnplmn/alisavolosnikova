import { notFound } from 'next/navigation'
import Image from 'next/image'
import { client } from '@/lib/sanity/client'
import { SERIES_BY_SLUG_QUERY, ALL_SERIES_QUERY } from '@/lib/sanity/queries'
import { MasonryGrid } from '@/components/portfolio/MasonryGrid'
import { NextSection } from '@/components/ui/NextSection'
import { CornerUI } from '@/components/ui/CornerUI'
import { getBlurDataURL } from '@/lib/sanity/image'

export const revalidate = 3600

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  try {
    if (
      !process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID === 'your_project_id_here'
    ) {
      return []
    }
    const series = await client.fetch(ALL_SERIES_QUERY)
    return series.map((s: { slug: string }) => ({ slug: s.slug }))
  } catch {
    return []
  }
}

export default async function SeriesPage({ params }: PageProps) {
  const { slug } = await params

  let series: any = null
  let allSeries: any[] = []

  try {
    if (
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== 'your_project_id_here'
    ) {
      ;[series, allSeries] = await Promise.all([
        client.fetch(SERIES_BY_SLUG_QUERY, { slug }),
        client.fetch(ALL_SERIES_QUERY),
      ])
    }
  } catch {
    // Sanity not configured yet
  }

  // Placeholder for development
  if (!series) {
    series = {
      _id: slug,
      title: slug.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
      slug,
      year: 2024,
      mode: 'dark',
      description: 'A series by Алиса Волосникова.',
      photos: [
        {
          _id: 'p1',
          title: 'Untitled 01',
          weight: 'full',
          year: 2024,
          altText: 'Photograph 1',
          image: { asset: { url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1400', metadata: { lqip: '', dimensions: { width: 1400, height: 933 } } } },
        },
        {
          _id: 'p2',
          title: 'Untitled 02',
          weight: 'half',
          year: 2024,
          altText: 'Photograph 2',
          image: { asset: { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700', metadata: { lqip: '', dimensions: { width: 700, height: 933 } } } },
        },
        {
          _id: 'p3',
          title: 'Untitled 03',
          weight: 'half',
          year: 2024,
          altText: 'Photograph 3',
          image: { asset: { url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=700', metadata: { lqip: '', dimensions: { width: 700, height: 933 } } } },
        },
      ],
    }
  }

  const bgClass = series.mode === 'dark' ? 'bg-dark text-text-light' : 'bg-light text-text-dark'

  // Find next series
  const currentIdx = allSeries.findIndex((s: any) => s.slug === slug)
  const nextSeries = allSeries.length > 0
    ? allSeries[(currentIdx + 1) % allSeries.length]
    : null

  return (
    <div className={`min-h-screen ${bgClass} pt-16`}>
      <CornerUI
        topLeft={series.title}
        bottomLeft={`${series.year} · ${series.photos?.length ?? 0} PHOTOS`}
      />

      {/* Series header */}
      <header className="px-6 pt-12 pb-8">
        {/* Hero image — matches SeriesCard cover for view-transition morph */}
        {series.photos && series.photos.length > 0 && (
          <div
            className="relative w-full max-w-2xl aspect-[3/2] overflow-hidden mb-8"
            style={{ viewTransitionName: `series-${series._id}` }}
          >
            <Image
              src={series.photos[0].image.asset.url}
              alt={series.photos[0].altText ?? series.title}
              fill
              sizes="(max-width: 768px) 100vw, 672px"
              placeholder="blur"
              blurDataURL={getBlurDataURL(series.photos[0].image?.asset?.metadata?.lqip)}
              className="object-cover"
              priority
            />
          </div>
        )}
        <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl">
          {series.title}
        </h1>
        {series.description && (
          <p className="font-sans text-sm text-muted mt-4 max-w-md leading-relaxed">
            {series.description}
          </p>
        )}
      </header>

      {/* Masonry photo grid */}
      {series.photos && series.photos.length > 0 && (
        <MasonryGrid photos={series.photos} />
      )}

      {/* Next series transition */}
      {nextSeries && (
        <NextSection
          label="NEXT SERIES"
          href={`/work/${nextSeries.slug}`}
          title={nextSeries.title}
          coverImage={nextSeries.coverImage}
        />
      )}
    </div>
  )
}
