'use client'
import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

interface HeroProps {
  imageUrl: string
  imageAlt?: string
}

// Two elegant lines — title case, restrained scale
const NAME_LINES = ['Алиса', 'Волосникова']

export function Hero({ imageUrl, imageAlt = '' }: HeroProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const lines = panelRef.current?.querySelectorAll<HTMLElement>('.hero-name-inner')
    const meta  = panelRef.current?.querySelectorAll<HTMLElement>('.hero-meta')
    const img   = imageRef.current
    if (!lines || !meta || !img) return

    const tl = gsap.timeline({ delay: 0.1 })

    // Image sweeps in
    tl.fromTo(img,
      { clipPath: 'inset(0 100% 0 0)', scale: 1.03 },
      { clipPath: 'inset(0 0% 0 0)', scale: 1, duration: 1.05, ease: 'power4.inOut' }
    )
    // Name rises
    .fromTo(lines,
      { y: '105%' },
      { y: '0%', duration: 0.75, stagger: 0.09, ease: 'power3.out' },
      '-=0.6'
    )
    // Meta fades
    .fromTo(meta,
      { opacity: 0 },
      { opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out' },
      '-=0.2'
    )
  }, [])

  return (
    <section className="flex" style={{ height: 'calc(100vh - var(--nav-h))' }}>

      {/* Left: identity panel — restrained, spacious */}
      <div
        ref={panelRef}
        className="w-[32%] bg-dark flex flex-col justify-between px-10 py-10 shrink-0 overflow-hidden"
      >
        {/* Top metadata */}
        <div className="hero-meta opacity-0">
          <p className="font-sans text-[8px] tracking-[0.28em] text-text-light/30 uppercase">
            Москва · 2026
          </p>
        </div>

        {/* Name — elegant, not dominant */}
        <div>
          {NAME_LINES.map((line, i) => (
            <div key={i} style={{ overflow: 'hidden' }}>
              <div
                className="hero-name-inner font-serif italic text-text-light"
                style={{
                  fontSize: 'clamp(1.7rem, 2.8vw, 3.2rem)',
                  lineHeight: 1.12,
                  letterSpacing: '-0.01em',
                }}
              >
                {line}
              </div>
            </div>
          ))}

          <div className="w-6 h-px bg-text-light/15 mt-4 mb-3 hero-meta opacity-0" />

          <p className="hero-meta opacity-0 font-sans text-[8px] tracking-[0.24em] text-text-light/35 uppercase">
            Fine Art Photography
          </p>
        </div>

        {/* Scroll cue */}
        <p className="hero-meta opacity-0 font-sans text-[8px] tracking-[0.22em] text-text-light/20 uppercase">
          Scroll
        </p>
      </div>

      {/* Right: hero photograph */}
      <div
        ref={imageRef}
        className="flex-1 relative overflow-hidden"
        style={{ clipPath: 'inset(0 100% 0 0)' }}
      >
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          priority
          sizes="68vw"
          className="object-cover"
        />
      </div>
    </section>
  )
}
