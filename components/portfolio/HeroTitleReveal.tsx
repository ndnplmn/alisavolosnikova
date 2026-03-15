'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

interface HeroTitleRevealProps {
  title: string
  year: number
  photoCount: number
}

export function HeroTitleReveal({ title, year, photoCount }: HeroTitleRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const masks = container.querySelectorAll<HTMLElement>('.word-mask')
    if (!masks.length) return

    // Make container visible (starts at opacity:0 to avoid flash during View Transition)
    gsap.set(container, { opacity: 1 })

    // Staggered mask reveal — words slide up from behind overflow:hidden clip
    gsap.fromTo(
      masks,
      { yPercent: 105 },
      { yPercent: 0, duration: 1.1, ease: 'power3.out', stagger: 0.07, delay: 0.45 }
    )
  }, [])

  const words = title.split(' ')

  return (
    <div
      ref={containerRef}
      className="absolute bottom-0 left-0 z-10 pointer-events-none"
      style={{ padding: 'clamp(1.5rem, 4vw, 3rem)', opacity: 0 }}
    >
      {/* Series title — large serif italic, mask reveal per word */}
      <h1
        className="font-serif text-text-light flex flex-wrap"
        style={{
          fontSize: 'clamp(2.5rem, 5.5vw, 7rem)',
          fontStyle: 'italic',
          fontWeight: 300,
          lineHeight: 0.95,
          letterSpacing: '-0.025em',
          gap: '0 0.22em',
        }}
      >
        {words.map((word, i) => (
          <span key={i} style={{ overflow: 'hidden', display: 'inline-block' }}>
            <span className="word-mask" style={{ display: 'inline-block' }}>
              {word}
            </span>
          </span>
        ))}
      </h1>

      {/* Metadata line */}
      <div style={{ overflow: 'hidden', marginTop: '1rem' }}>
        <p
          className="word-mask font-sans text-text-light/50"
          style={{ fontSize: '9px', letterSpacing: '0.22em', display: 'inline-block' }}
        >
          {year} · {String(photoCount).padStart(2, '0')} PHOTOS
        </p>
      </div>
    </div>
  )
}
