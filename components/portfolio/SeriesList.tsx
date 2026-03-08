interface SeriesListItem {
  _id: string
  title: string
  slug: string
  year: number
  photoCount: number
  coverImage: {
    asset: { url: string; metadata: { lqip: string } }
    hotspot?: { x: number; y: number }
  }
}

interface SeriesListProps {
  series: SeriesListItem[]
}

export function SeriesList({ series }: SeriesListProps) {
  return (
    <div className="px-6 py-8">
      {series.map(s => (
        <a
          key={s._id}
          href={`/work/${s.slug}`}
          data-series-id={s._id}
          className="flex items-baseline justify-between py-5 border-b border-text-dark/10 group no-underline"
          data-cursor="link"
        >
          <div className="flex items-baseline gap-8">
            <span className="font-sans text-[9px] tracking-extreme text-muted w-12 flex-shrink-0">
              {s.year}
            </span>
            <span className="font-serif text-xl md:text-2xl text-text-dark group-hover:translate-x-2 transition-transform duration-200 ease-out">
              {s.title}
            </span>
          </div>
          <span className="font-sans text-[9px] tracking-extreme text-muted hidden sm:block">
            {s.photoCount} PHOTOS
          </span>
        </a>
      ))}
    </div>
  )
}
