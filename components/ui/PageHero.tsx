// components/ui/PageHero.tsx
'use client'
import { useRef, useEffect, type ReactNode } from 'react'
import { gsap } from 'gsap'

type PageHeroProps = {
  label:    string
  headline: string
  bottom?:  ReactNode
}

export function PageHero({ label, headline, bottom }: PageHeroProps) {
  const headlineRef = useRef<HTMLParagraphElement>(null)
  const labelRef    = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const el    = headlineRef.current
    const lbEl  = labelRef.current
    if (!el) return

    gsap.set([lbEl, el], { opacity: 0, y: 18 })
    gsap.to([lbEl, el], {
      opacity:  1,
      y:        0,
      duration: 0.9,
      ease:     'power3.out',
      stagger:  0.12,
      delay:    0.1,
    })
  }, [])

  return (
    <div className="bg-ink text-text-light px-6 md:px-16 pt-24 pb-16 flex flex-col min-h-[100svh] justify-between">
      <p
        ref={labelRef}
        className="font-sans text-[9px] tracking-extreme"
        style={{ color: 'rgba(245,245,245,0.35)' }}
      >
        {label}
      </p>
      <p
        ref={headlineRef}
        className="font-serif italic text-text-light"
        style={{
          fontSize:      'clamp(2.5rem, 5vw, 7rem)',
          fontWeight:    300,
          lineHeight:    1.0,
          letterSpacing: '-0.025em',
          maxWidth:      '22ch',
          whiteSpace:    'pre-line',
        }}
      >
        {headline}
      </p>
      {bottom}
    </div>
  )
}
