// components/ui/PageHero.tsx
'use client'
import { useRef, useEffect, type ReactNode } from 'react'
import { gsap } from 'gsap'
// @ts-ignore
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(SplitText)

type PageHeroProps = {
  label:    string
  headline: string
  bottom?:  ReactNode
}

export function PageHero({ label, headline, bottom }: PageHeroProps) {
  const headlineRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const el = headlineRef.current
    if (!el) return
    const split = new SplitText(el, { type: 'words' })
    gsap.set(split.words, { yPercent: 110, opacity: 0 })
    const anim = gsap.to(split.words, {
      yPercent: 0,
      opacity:  1,
      duration: 1.05,
      ease:     'power3.out',
      stagger:  0.055,
      delay:    0.15,
    })
    return () => { split.revert(); anim.kill() }
  }, [])

  return (
    <div className="bg-ink text-text-light px-6 md:px-16 pt-24 pb-16 flex flex-col min-h-[100svh] justify-between">
      <p className="font-sans text-[9px] tracking-extreme" style={{ color: 'rgba(245,245,245,0.35)' }}>
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
