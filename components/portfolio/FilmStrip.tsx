'use client'
import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getBlurDataURL } from '@/lib/sanity/image'

gsap.registerPlugin(ScrollTrigger)

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

export function FilmStrip({ photos }: { photos: Photo[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const track = trackRef.current
    if (!container || !track) return

    // Wait one frame so layout is settled before measuring
    const raf = requestAnimationFrame(() => {
      const distance = track.scrollWidth - window.innerWidth
      if (distance <= 0) return

      const tween = gsap.to(track, {
        x: -distance,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: () => `+=${distance}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      return () => {
        tween.scrollTrigger?.kill()
        tween.kill()
      }
    })

    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    // Label above the strip
    <div>
      <div className="px-6 pb-4">
        <p className="font-sans text-muted" style={{ fontSize: '9px', letterSpacing: '0.22em' }}>
          SERIES · {photos.length} FRAMES
        </p>
      </div>

      {/* Sticky container — GSAP pins this */}
      <div ref={containerRef} className="overflow-hidden">
        {/* Horizontal track */}
        <div
          ref={trackRef}
          className="flex will-change-transform"
          style={{ height: '100vh' }}
        >
          {photos.map((photo) => {
            const dim = photo.image?.asset?.metadata?.dimensions
            // Width derived from aspect ratio so each photo fills full height naturally
            const aspectRatio = dim ? dim.width / dim.height : 4 / 3
            const lqip = photo.image?.asset?.metadata?.lqip

            return (
              <div
                key={photo._id}
                className="relative flex-shrink-0 h-full"
                style={{ width: `${aspectRatio * 100}vh` }}
              >
                <Image
                  src={photo.image.asset.url}
                  alt={photo.altText ?? photo.title ?? ''}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  {...(lqip ? { placeholder: 'blur', blurDataURL: getBlurDataURL(lqip) } : {})}
                />
                {/* Per-frame caption */}
                {(photo.title || photo.year) && (
                  <div className="absolute bottom-0 left-0 p-6">
                    <p
                      className="font-sans text-text-light/50"
                      style={{ fontSize: '9px', letterSpacing: '0.22em' }}
                    >
                      {[photo.title, photo.year].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
