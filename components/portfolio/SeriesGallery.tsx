'use client'
import { FullBleedPhoto } from './FullBleedPhoto'
import { SplitPhoto } from './SplitPhoto'
import { FilmStrip } from './FilmStrip'

interface Photo {
  _id: string
  title?: string
  year?: number
  altText?: string
  image: {
    asset: {
      url: string
      metadata: { lqip: string; dimensions: { width: number; height: number } }
    }
  }
}

interface SeriesGalleryProps {
  /** Photos to display — caller should slice out the hero (photos[0]) before passing */
  photos: Photo[]
}

export function SeriesGallery({ photos }: SeriesGalleryProps) {
  if (!photos.length) return null

  // ── Layout logic ──────────────────────────────────────────────────────────
  // ≥ 4 gallery photos → use FilmStrip for the middle group
  // < 4 gallery photos → alternate FullBleed / Split
  const useFilmStrip = photos.length >= 4

  const elements: React.ReactNode[] = []

  if (!useFilmStrip) {
    photos.forEach((photo, i) => {
      elements.push(
        i % 2 === 0 ? (
          <FullBleedPhoto key={photo._id} photo={photo} />
        ) : (
          <SplitPhoto
            key={photo._id}
            photo={photo}
            direction={i % 4 === 1 ? 'right' : 'left'}
            index={i}
          />
        )
      )
    })
  } else {
    // First photo → full-bleed
    elements.push(<FullBleedPhoto key={photos[0]._id} photo={photos[0]} />)

    // Second photo → split (image right, text left)
    if (photos[1]) {
      elements.push(
        <SplitPhoto key={photos[1]._id} photo={photos[1]} direction="right" index={1} />
      )
    }

    // Middle group (up to 4 photos) → film strip
    const filmPhotos = photos.slice(2, 6)
    if (filmPhotos.length >= 2) {
      elements.push(<FilmStrip key="filmstrip" photos={filmPhotos} />)
    } else {
      // Not enough for strip, fall back to alternating layout
      filmPhotos.forEach((photo, i) => {
        elements.push(
          i % 2 === 0 ? (
            <FullBleedPhoto key={photo._id} photo={photo} />
          ) : (
            <SplitPhoto key={photo._id} photo={photo} direction="left" index={i + 2} />
          )
        )
      })
    }

    // Remaining photos after the film strip
    photos.slice(6).forEach((photo, i) => {
      elements.push(
        i % 2 === 0 ? (
          <FullBleedPhoto key={photo._id} photo={photo} />
        ) : (
          <SplitPhoto
            key={photo._id}
            photo={photo}
            direction={i % 4 === 0 ? 'left' : 'right'}
            index={i + 6}
          />
        )
      )
    })
  }

  return (
    <div className="flex flex-col gap-2 mt-2">
      {elements}
    </div>
  )
}
