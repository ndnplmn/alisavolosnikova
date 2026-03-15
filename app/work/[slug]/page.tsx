import Image from 'next/image'
import { client } from '@/lib/sanity/client'
import { SERIES_BY_SLUG_QUERY, ALL_SERIES_QUERY } from '@/lib/sanity/queries'
import { SeriesGallery } from '@/components/portfolio/SeriesGallery'
import { SeriesIntro } from '@/components/portfolio/SeriesIntro'
import { HeroTitleReveal } from '@/components/portfolio/HeroTitleReveal'
import { NextSection } from '@/components/ui/NextSection'
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

  // Find next series
  const currentIdx = allSeries.findIndex((s: any) => s.slug === slug)
  const nextSeries = allSeries.length > 0
    ? allSeries[(currentIdx + 1) % allSeries.length]
    : null

  const heroPhoto = series.photos?.[0]
  const galleryPhotos = series.photos?.slice(1) ?? []
  const lqip = heroPhoto?.image?.asset?.metadata?.lqip

  return (
    <div className="min-h-screen bg-light text-text-dark">

      {/* ── Zone 1: Hero — full-bleed 100vh, morphs via View Transition ──────── */}
      {heroPhoto && (
        <div
          className="relative w-full overflow-hidden"
          style={{ height: '100vh', viewTransitionName: `photo-${slug}` }}
        >
          <Image
            src={heroPhoto.image.asset.url}
            alt={heroPhoto.altText ?? series.title}
            fill
            sizes="100vw"
            className="object-cover"
            priority
            {...(lqip ? { placeholder: 'blur', blurDataURL: getBlurDataURL(lqip) } : {})}
          />
          {/* Gradient so title text reads over any image */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark/60 via-transparent to-transparent" />

          {/* Animated title overlay */}
          <HeroTitleReveal
            title={series.title}
            year={series.year}
            photoCount={series.photos?.length ?? 0}
          />
        </div>
      )}

      {/* ── Zone 2: Editorial intro — description as large italic pull ───────── */}
      {series.description && (
        <SeriesIntro description={series.description} />
      )}

      {/* ── Zone 3: Gallery — FullBleed / Split / FilmStrip sequence ─────────── */}
      {galleryPhotos.length > 0 && (
        <SeriesGallery photos={galleryPhotos} />
      )}

      {/* ── Zone 4: Next series — full-viewport dark cinematic panel ─────────── */}
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
