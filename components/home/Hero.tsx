'use client'
import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

interface HeroProps {
  imageUrl: string
  imageAlt?: string
}

const NAME_LINES = ['АЛИСА', 'ВОЛОС', 'НИКОВА']

export function Hero({ imageUrl, imageAlt = '' }: HeroProps) {
  const linesRef = useRef<HTMLDivElement>(null)
  const tagRef   = useRef<HTMLParagraphElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const lines = linesRef.current?.querySelectorAll<HTMLElement>('.hero-name-inner')
    const tag   = tagRef.current
    const img   = imageRef.current
    if (!lines || !tag || !img) return

    const tl = gsap.timeline({ delay: 0.15 })

    tl.fromTo(img,
      { clipPath: 'inset(0 100% 0 0)', scale: 1.05 },
      { clipPath: 'inset(0 0% 0 0)', scale: 1, duration: 1.1, ease: 'power4.inOut' }
    )
    .fromTo(lines,
      { y: '115%' },
      { y: '0%', duration: 0.85, stagger: 0.1, ease: 'power3.out' },
      '-=0.65'
    )
    .fromTo(tag,
      { opacity: 0, y: 6 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
      '-=0.25'
    )
  }, [])

  return (
    <section className="flex" style={{ height: 'calc(100vh - var(--nav-h))' }}>

      {/* Left: dark typographic panel */}
      <div className="w-[38%] bg-dark flex flex-col justify-between px-8 py-10 shrink-0 overflow-hidden">
        <div />

        <div ref={linesRef}>
          {NAME_LINES.map((line, i) => (
            <div key={i} style={{ overflow: 'hidden' }}>
              <div
                className="hero-name-inner font-serif italic text-text-light leading-[0.88]"
                style={{ fontSize: 'clamp(2.8rem, 7.2vw, 8rem)' }}
              >
                {line}
              </div>
            </div>
          ))}
          <div className="w-8 h-px bg-text-light/20 mt-5 mb-4" />
          <p ref={tagRef} className="font-sans text-[9px] tracking-[0.28em] text-text-light/40 uppercase">
            Fine Art Photography
          </p>
        </div>

        <p className="font-sans text-[9px] tracking-[0.22em] text-text-light/20 uppercase">
          SCROLL ↓
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
          sizes="62vw"
          className="object-cover"
        />
      </div>
    </section>
  )
}
