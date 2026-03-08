import Image from 'next/image'
import { urlFor, getBlurDataURL } from '@/lib/sanity/image'

interface Photo {
  _id: string
  title?: string
  image: {
    asset: { url: string; metadata: { lqip: string; dimensions: { width: number; height: number } } }
    hotspot?: { x: number; y: number }
  }
  weight: 'full' | 'half' | 'split-30' | 'split-70'
  year?: number
  dimensions?: string
  altText?: string
}

interface MasonryGridProps {
  photos: Photo[]
}

// Group photos into visual rows based on their weight field
function groupIntoRows(photos: Photo[]): Photo[][] {
  const rows: Photo[][] = []
  let i = 0

  while (i < photos.length) {
    const current = photos[i]

    if (current.weight === 'full') {
      rows.push([current])
      i++
    } else if (
      current.weight === 'half' &&
      photos[i + 1]?.weight === 'half'
    ) {
      rows.push([current, photos[i + 1]])
      i += 2
    } else if (
      current.weight === 'split-30' &&
      photos[i + 1]?.weight === 'split-70'
    ) {
      rows.push([current, photos[i + 1]])
      i += 2
    } else if (
      current.weight === 'split-70' &&
      photos[i + 1]?.weight === 'split-30'
    ) {
      rows.push([current, photos[i + 1]])
      i += 2
    } else {
      // Fallback: treat as full width
      rows.push([current])
      i++
    }
  }

  return rows
}

function getFlexValue(photo: Photo, rowLength: number): string {
  if (rowLength === 1) return '1'
  switch (photo.weight) {
    case 'split-30': return '3'
    case 'split-70': return '7'
    case 'half':
    default: return '1'
  }
}

export function MasonryGrid({ photos }: MasonryGridProps) {
  const rows = groupIntoRows(photos)

  return (
    <div className="flex flex-col gap-1 px-1">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1">
          {row.map(photo => (
            <div
              key={photo._id}
              className="relative overflow-hidden group"
              style={{ flex: getFlexValue(photo, row.length) }}
              data-cursor="photo"
              data-cursor-label={photo.title ?? ''}
            >
              {/* Maintain aspect ratio — use min-h so tall photos look good */}
              <div className="relative min-h-48 md:min-h-64 lg:min-h-80">
                <Image
                  src={urlFor(photo.image).width(1400).url()}
                  alt={photo.altText ?? photo.title ?? ''}
                  fill
                  sizes="(max-width: 768px) 100vw, 80vw"
                  placeholder="blur"
                  blurDataURL={getBlurDataURL(photo.image?.asset?.metadata?.lqip)}
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
              </div>

              {/* Metadata overlay on hover */}
              {(photo.title || photo.year) && (
                <div className="absolute bottom-0 left-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="font-sans text-[9px] tracking-extreme text-text-light">
                    {[photo.title, photo.year, photo.dimensions]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
