// components/home/FeaturedWork.tsx
'use client'
import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { urlFor, getBlurDataURL } from '@/lib/sanity/image'
import { TransitionLink } from '@/components/ui/PageTransition'

gsap.registerPlugin(ScrollTrigger)

export interface SeriesItem {
  _id:        string
  title:      string
  slug:       string
  year?:      string
  mode?:      string
  photoCount?: number
  description?: string
  coverImage: {
    asset: { url: string; metadata: { lqip?: string; dimensions: { width: number; height: number } } }
    hotspot?: { x: number; y: number }
  }
}

// ─── Marquee strip (CSS animation — no dependency on about/Marquee) ──────────
function SeriesMarquee({ series }: { series: SeriesItem[] }) {
  if (series.length === 0) return null
  // Duplicate for seamless loop
  const items = [...series, ...series]

  return (
    <div
      className="overflow-hidden select-none"
      style={{ borderTop: '1px solid rgba(10,10,10,0.07)', borderBottom: '1px solid rgba(10,10,10,0.07)', padding: '20px 0' }}
      aria-hidden="true"
    >
      <div
        className="flex"
        style={{ animation: 'marquee-left 40s linear infinite', willChange: 'transform' }}
      >
        {items.map((s, i) => (
          <TransitionLink
            key={`${s._id}-${i}`}
            href={`/work/${s.slug}`}
            className="font-serif italic flex-shrink-0 mx-10 transition-opacity duration-300"
            style={{
              fontSize:   'clamp(3rem, 5vw, 6rem)',
              fontWeight: 300,
              opacity:    0.1,
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => gsap.to(e.currentTarget, { opacity: 1, duration: 0.3 })}
            onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => gsap.to(e.currentTarget, { opacity: 0.1, duration: 0.3 })}
          >
            {s.title}
          </TransitionLink>
        ))}
      </div>
    </div>
  )
}

// ─── Series row ───────────────────────────────────────────────────────────────
function SeriesRow({ series, index }: { series: SeriesItem; index: number }) {
  const rowRef  = useRef<HTMLDivElement>(null)
  const imgRef  = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  const imageUrl = series.coverImage?.asset
    ? urlFor(series.coverImage).width(1200).url()
    : null

  const lqip = series.coverImage?.asset?.metadata?.lqip
  const hotspot = series.coverImage?.hotspot
  const objectPosition = hotspot ? `${hotspot.x * 100}% ${hotspot.y * 100}%` : 'center center'

  const meta = [
    series.year,
    series.mode ? series.mode.toUpperCase() : null,
    series.photoCount ? `${series.photoCount} PHOTOS` : null,
  ].filter(Boolean).join(' · ')

  useEffect(() => {
    const img  = imgRef.current
    const text = textRef.current
    if (!img || !text) return

    gsap.set([img, text], { opacity: 0 })
    gsap.set(img,  { x: -20 })
    gsap.set(text, { x: 20 })

    const st = ScrollTrigger.create({
      trigger: img,
      start:   'top 80%',
      once:    true,
      onEnter: () => {
        gsap.to(img,  { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' })
        gsap.to(text, { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out', delay: 0.1 })
      },
    })

    return () => { st.kill() }
  }, [])

  if (!imageUrl) return null

  return (
    <div
      ref={rowRef}
      className="flex flex-col md:flex-row py-12 md:py-16"
      style={{ borderBottom: '1px solid rgba(10,10,10,0.08)' }}
      onMouseEnter={() => {
        if (imgRef.current) gsap.to(imgRef.current.querySelector('img'), { filter: 'saturate(0.75)', duration: 0.4 })
      }}
      onMouseLeave={() => {
        if (imgRef.current) gsap.to(imgRef.current.querySelector('img'), { filter: 'saturate(1)', duration: 0.4 })
      }}
    >
      {/* Image — 55% */}
      <div
        ref={imgRef}
        className="relative overflow-hidden w-full md:w-[55%] flex-shrink-0"
        style={{ aspectRatio: '16/10' }}
      >
        <Image
          src={imageUrl}
          alt={series.title}
          fill
          sizes="(max-width: 768px) 100vw, 55vw"
          className="object-cover"
          style={{ objectPosition }}
          {...(lqip ? { placeholder: 'blur', blurDataURL: getBlurDataURL(lqip) } : {})}
        />
      </div>

      {/* Text panel — 45% */}
      <div
        ref={textRef}
        className="flex flex-col justify-between pt-6 md:pt-0 md:pl-14 md:w-[45%]"
      >
        <div>
          {/* Series number + name */}
          <div className="flex items-start justify-between mb-2">
            <p
              className="font-serif italic text-text-dark"
              style={{
                fontSize:      'clamp(1.8rem, 3vw, 3.5rem)',
                fontWeight:    300,
                letterSpacing: '-0.02em',
                lineHeight:    1.0,
              }}
            >
              {series.title}
            </p>
            <span className="font-sans text-[9px] tracking-extreme text-muted ml-4 mt-1 flex-shrink-0">
              {String(index + 1).padStart(2, '0')} →
            </span>
          </div>

          {/* Meta */}
          {meta && (
            <p className="font-sans text-[9px] tracking-extreme text-muted mt-2">
              {meta}
            </p>
          )}

          {/* Description */}
          {series.description && (
            <p
              className="font-serif italic mt-4"
              style={{
                fontSize:   'clamp(0.9rem, 1.1vw, 1.3rem)',
                lineHeight: 1.7,
                opacity:    0.55,
                color:      'var(--color-text-dark)',
                maxWidth:   '36ch',
              }}
            >
              {series.description}
            </p>
          )}
        </div>

        <TransitionLink
          href={`/work/${series.slug}`}
          data-cursor="link"
          className="font-sans text-[9px] tracking-extreme text-text-dark
                     transition-opacity duration-300 hover:opacity-40 mt-6 md:mt-0 self-start"
        >
          VIEW SERIES →
        </TransitionLink>
      </div>
    </div>
  )
}

// ─── FeaturedWork ─────────────────────────────────────────────────────────────
export function FeaturedWork({ series }: { series: SeriesItem[] }) {
  if (series.length === 0) return null

  return (
    <section className="bg-light">
      {/* Header */}
      <div className="px-6 md:px-16 pt-20 pb-0">
        <p className="font-sans text-[9px] tracking-extreme text-muted">
          SELECTED WORK
        </p>
        <div style={{ height: '1px', background: 'rgba(10,10,10,0.1)', marginTop: '16px' }} />
      </div>

      {/* Marquee strip */}
      <SeriesMarquee series={series} />

      {/* Editorial series list */}
      <div className="px-6 md:px-16 pb-24">
        {series.map((s, i) => (
          <SeriesRow key={s._id} series={s} index={i} />
        ))}
      </div>
    </section>
  )
}
