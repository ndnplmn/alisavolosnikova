import Image from 'next/image'
import Link from 'next/link'
import { urlFor, getBlurDataURL } from '@/lib/sanity/image'

interface SeriesCardProps {
  title: string
  slug: string
  year: number
  photoCount: number
  coverImage: {
    asset: { url: string; metadata: { lqip: string; dimensions: { width: number; height: number } } }
    hotspot?: { x: number; y: number }
  }
}

function resolveImageUrl(coverImage: SeriesCardProps['coverImage']): string {
  const rawUrl = coverImage?.asset?.url ?? ''
  // If it's already an absolute URL (e.g. Unsplash placeholder), use it directly
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) return rawUrl
  // Otherwise let Sanity image builder handle it
  return urlFor(coverImage).width(640).url()
}

export function SeriesCard({ title, slug, year, photoCount, coverImage, seriesId }: SeriesCardProps & { seriesId?: string }) {
  return (
    <Link
      href={`/work/${slug}`}
      className="group block relative flex-shrink-0 w-56 sm:w-64 md:w-80"
      data-cursor="photo"
      data-cursor-label={title}
    >
      <div
        className="relative overflow-hidden aspect-[3/4]"
        style={{ viewTransitionName: seriesId ? `series-${seriesId}` : undefined }}
      >
        <Image
          src={resolveImageUrl(coverImage)}
          alt={title}
          fill
          sizes="(max-width: 768px) 224px, 320px"
          placeholder="blur"
          blurDataURL={getBlurDataURL(coverImage?.asset?.metadata?.lqip)}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-dark/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <p className="font-sans text-[9px] tracking-extreme text-text-light uppercase">
            {title}
          </p>
        </div>
      </div>
      <div className="mt-3">
        <p className="font-serif text-base text-text-dark">{title}</p>
        <p className="font-sans text-[9px] tracking-extreme text-muted mt-1">
          {year} · {photoCount} PHOTOS
        </p>
      </div>
    </Link>
  )
}
