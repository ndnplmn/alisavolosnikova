// components/home/FeaturedWork.tsx
'use client'
import Image from 'next/image'
import { useEffect, useRef, useState, useCallback } from 'react'
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

// ─── Marquee strip (GSAP — velocity-linked + hover pause) ────────────────────
function SeriesMarquee({ series }: { series: SeriesItem[] }) {
  const stripRef     = useRef<HTMLDivElement>(null)
  const isHoveredRef = useRef(false)

  useEffect(() => {
    const strip = stripRef.current
    if (!strip) return

    // GSAP tween replaces CSS animation — gives timeScale control
    const tween = gsap.fromTo(
      strip,
      { xPercent: 0 },
      { xPercent: -50, ease: 'none', duration: 40, repeat: -1 }
    )

    // Dual-factor timeScale: scroll velocity × hover pause
    // speedFactor  — accelerates with scroll, min 0.4
    // pauseFactor  — smoothly goes to 0 on hover, back to 1 on leave
    let speedFactor = 1
    let pauseFactor = 1

    const tick = () => {
      const velocity  = (ScrollTrigger as any).getVelocity()
      const velTarget = Math.max(0.4, 1 + Math.abs(velocity) / 2800)
      speedFactor     = gsap.utils.interpolate(speedFactor, velTarget, 0.09)

      const pauseTarget = isHoveredRef.current ? 0 : 1
      pauseFactor       = gsap.utils.interpolate(pauseFactor, pauseTarget, 0.10)

      tween.timeScale(speedFactor * pauseFactor)
    }
    gsap.ticker.add(tick)

    return () => {
      gsap.ticker.remove(tick)
      tween.kill()
    }
  }, [])

  if (series.length === 0) return null
  const items = [...series, ...series]

  return (
    <div
      className="overflow-hidden select-none"
      style={{ borderTop: '1px solid rgba(10,10,10,0.07)', borderBottom: '1px solid rgba(10,10,10,0.07)', padding: '20px 0' }}
      aria-hidden="true"
      onMouseEnter={() => { isHoveredRef.current = true }}
      onMouseLeave={() => { isHoveredRef.current = false }}
    >
      <div
        ref={stripRef}
        className="flex will-change-transform"
      >
        {items.map((s, i) => (
          <TransitionLink
            key={`${s._id}-${i}`}
            href={`/work/${s.slug}`}
            className="font-serif italic flex-shrink-0 mx-10"
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
function SeriesRow({
  series,
  index,
  onHoverEnter,
  onHoverLeave,
}: {
  series:       SeriesItem
  index:        number
  onHoverEnter: (src: string, alt: string) => void
  onHoverLeave: () => void
}) {
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
        if (imageUrl) onHoverEnter(imageUrl, series.title)
      }}
      onMouseLeave={() => {
        if (imgRef.current) gsap.to(imgRef.current.querySelector('img'), { filter: 'saturate(1)', duration: 0.4 })
        onHoverLeave()
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
  const followerRef = useRef<HTMLDivElement>(null)
  const [followerImg, setFollowerImg] = useState<{ src: string; alt: string } | null>(null)
  const isPointerRef = useRef(false)

  // Mouse tracking — only on pointer-fine devices
  useEffect(() => {
    isPointerRef.current = window.matchMedia('(hover: fine)').matches
    if (!isPointerRef.current) return

    const el = followerRef.current
    if (!el) return

    gsap.set(el, { opacity: 0, scale: 0.88 })

    const quickX = gsap.quickTo(el, 'x', { duration: 0.55, ease: 'power3.out' })
    const quickY = gsap.quickTo(el, 'y', { duration: 0.55, ease: 'power3.out' })

    const onMove = (e: MouseEvent) => {
      quickX(e.clientX + 20)
      quickY(e.clientY - 180)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  const showFollower = useCallback((src: string, alt: string) => {
    if (!isPointerRef.current) return
    setFollowerImg({ src, alt })
    if (!followerRef.current) return
    gsap.to(followerRef.current, { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' })
  }, [])

  const hideFollower = useCallback(() => {
    if (!followerRef.current) return
    gsap.to(followerRef.current, { opacity: 0, scale: 0.88, duration: 0.3, ease: 'power2.in' })
  }, [])

  // Early return AFTER hooks — show minimal placeholder so page layout doesn't jump
  if (series.length === 0) {
    return (
      <section className="bg-light">
        <div className="px-6 md:px-16 pt-20 pb-24">
          <p className="font-sans text-[9px] tracking-extreme text-muted">
            SELECTED WORK
          </p>
          <div style={{ height: '1px', background: 'rgba(10,10,10,0.1)', marginTop: '16px', marginBottom: '48px' }} />
          <p
            className="font-serif italic text-text-dark/30"
            style={{ fontSize: 'clamp(1.8rem, 3vw, 3.5rem)', fontWeight: 300, lineHeight: 1.0 }}
          >
            Series coming soon.
          </p>
        </div>
      </section>
    )
  }

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
          <SeriesRow
            key={s._id}
            series={s}
            index={i}
            onHoverEnter={showFollower}
            onHoverLeave={hideFollower}
          />
        ))}
      </div>

      {/* ── Cursor image follower ─────────────────────────────────────────── */}
      <div
        ref={followerRef}
        aria-hidden="true"
        className="fixed top-0 left-0 pointer-events-none overflow-hidden"
        style={{
          width:       '260px',
          height:      '175px',
          zIndex:      200,
          willChange:  'transform',
        }}
      >
        {followerImg && (
          <Image
            src={followerImg.src}
            alt={followerImg.alt}
            fill
            sizes="260px"
            className="object-cover"
          />
        )}
      </div>
    </section>
  )
}
