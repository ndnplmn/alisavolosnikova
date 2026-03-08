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
  seriesId?: string
}

function resolveImageUrl(coverImage: SeriesCardProps['coverImage']): string {
  const rawUrl = coverImage?.asset?.url ?? ''
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) return rawUrl
  return urlFor(coverImage).width(900).url()
}

export function SeriesCard({ title, slug, year, photoCount, coverImage, seriesId }: SeriesCardProps) {
  return (
    <Link
      href={`/work/${slug}`}
      className="group block"
      data-cursor="photo"
      data-cursor-label={title}
    >
      {/* Image — portrait 3:4 */}
      <div
        className="relative overflow-hidden aspect-[3/4]"
        style={{ viewTransitionName: seriesId ? `series-${seriesId}` : undefined }}
      >
        <Image
          src={resolveImageUrl(coverImage)}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          placeholder="blur"
          blurDataURL={getBlurDataURL(coverImage?.asset?.metadata?.lqip)}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
        {/* Count badge — top right, like GSProductions */}
        <div className="absolute top-3 right-3 font-sans text-[8px] tracking-[0.18em] text-text-light/70 uppercase">
          {photoCount} {photoCount === 1 ? 'IMAGE' : 'IMAGES'}
        </div>
      </div>

      {/* Metadata below image — minimal */}
      <div className="pt-3 pb-8 border-b border-ink/[0.07]">
        <p className="font-serif text-[1.05rem] text-ink group-hover:opacity-60 transition-opacity duration-300">
          {title}
        </p>
        <p className="font-sans text-[9px] tracking-[0.2em] text-muted mt-1 uppercase">
          {year}
        </p>
      </div>
    </Link>
  )
}
