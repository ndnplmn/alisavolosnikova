// components/home/Statement.tsx
'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const QUOTE       = 'She does not capture moments. She selects them.'
const ATTRIBUTION = 'YEKATERINBURG · EST. 2019'

export function Statement() {
  const sectionRef     = useRef<HTMLElement>(null)
  const wordsRef       = useRef<HTMLSpanElement[]>([])
  const attributionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section     = sectionRef.current
    const attribution = attributionRef.current
    if (!section || !attribution) return

    const words = wordsRef.current.filter(Boolean)
    if (words.length === 0) return

    // Set initial hidden state
    gsap.set(words,       { y: '115%', opacity: 0 })
    gsap.set(attribution, { opacity: 0, y: 8 })

    const totalWordDuration = words.length * 0.055 + 0.8

    const trigger = ScrollTrigger.create({
      trigger: section,
      start:   'top 70%',
      once:    true,
      onEnter: () => {
        gsap.to(words, {
          y:        '0%',
          opacity:  1,
          duration: 0.8,
          stagger:  0.055,
          ease:     'power3.out',
        })
        gsap.to(attribution, {
          opacity:  1,
          y:        0,
          duration: 0.6,
          ease:     'power2.out',
          delay:    totalWordDuration,
        })
      },
    })

    return () => { trigger.kill() }
  }, [])

  // Reset ref array on every render to prevent stale accumulation on remount
  wordsRef.current = []

  // Split quote into words — each in an overflow:hidden wrapper for the slide-up
  const wordElements = QUOTE.split(' ').map((word, i) => (
    <span
      key={i}
      style={{
        display:       'inline-block',
        overflow:      'hidden',
        verticalAlign: 'bottom',
        marginRight:   i === 4 ? 0 : '0.28em',
        fontSize:      i === 4 ? 'clamp(7.5rem, 13vw, 19rem)' : 'clamp(2.4rem, 3.8vw, 5.5rem)',
      }}
    >
      <span
        ref={el => { if (el) wordsRef.current[i] = el }}
        style={{ display: 'inline-block' }}
      >
        {word}
      </span>
    </span>
  ))

  return (
    <section
      ref={sectionRef}
      className="bg-ink px-6 md:px-16 py-24 md:py-32"
    >
      {/* Quote */}
      <div
        className="font-serif italic text-text-light"
        style={{
          fontWeight:    300,
          lineHeight:    0.92,
          letterSpacing: '-0.03em',
        }}
        aria-label={QUOTE}
      >
        {wordElements}
      </div>

      {/* Rule + attribution */}
      <div ref={attributionRef}>
        <div
          style={{
            width:      '48px',
            height:     '1px',
            background: 'rgba(245,245,245,0.12)',
            marginTop:  '3.5rem',
          }}
        />
        <p className="font-sans text-[9px] tracking-extreme text-muted mt-6">
          {ATTRIBUTION}
        </p>
      </div>
    </section>
  )
}
