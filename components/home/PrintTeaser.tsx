// components/home/PrintTeaser.tsx
'use client'
import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TransitionLink } from '@/components/ui/PageTransition'

gsap.registerPlugin(ScrollTrigger)

const HEADING_LINES = ['Limited', 'editions,', 'archival quality.']

export function PrintTeaser() {
  const sectionRef  = useRef<HTMLElement>(null)
  const lineRefs    = useRef<(HTMLSpanElement | null)[]>([])
  const bottomRef   = useRef<HTMLDivElement>(null)
  const printRef    = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const bottom  = bottomRef.current
    if (!section || !bottom) return

    const lines = lineRefs.current.filter(Boolean) as HTMLElement[]
    if (lines.length === 0) return

    const print = printRef.current   // ← capture here

    gsap.set(lines,  { clipPath: 'inset(0 100% 0 0)' })
    gsap.set(bottom, { opacity: 0, y: 8 })
    if (print) gsap.set(print, { opacity: 0, y: 28 })

    const st = ScrollTrigger.create({
      trigger: section,
      start:   'top 78%',
      once:    true,
      onEnter: () => {
        gsap.to(lines, {
          clipPath:  'inset(0 0% 0 0)',
          duration:  1.0,
          stagger:   0.15,
          ease:      'power3.inOut',
        })
        gsap.to(bottom, {
          opacity:  1,
          y:        0,
          duration: 0.6,
          ease:     'power2.out',
          delay:    lines.length * 0.15 + 0.3,
        })
        if (print) gsap.to(print, {
          opacity:  1,
          y:        0,
          duration: 1.0,
          ease:     'power2.out',
          delay:    lines.length * 0.15 + 0.9,
        })
      },
    })

    return () => { st.kill() }
  }, [])

  lineRefs.current = []

  return (
    <section
      ref={sectionRef}
      className="bg-ink px-6 md:px-16 pt-16 pb-16"
      style={{ borderTop: '1px solid rgba(245,245,245,0.08)' }}
    >
      {/* Label */}
      <p className="font-sans text-[9px] tracking-extreme text-muted mb-10">
        FINE ART PRINTS
      </p>

      {/* Two-column: heading left + print right */}
      <div className="flex items-start justify-between gap-8">

        {/* Heading — each line clip-path revealed */}
        <div
          className="font-serif italic text-text-light flex-1"
          style={{
            fontSize:      'clamp(3.5rem, 7vw, 10rem)',
            fontWeight:    300,
            lineHeight:    0.88,
            letterSpacing: '-0.03em',
          }}
          aria-label={HEADING_LINES.join(' ')}
        >
          {HEADING_LINES.map((line, i) => (
            <span
              key={i}
              ref={el => { lineRefs.current[i] = el }}
              style={{ display: 'block' }}
              aria-hidden="true"
            >
              {line}
            </span>
          ))}
        </div>

        {/* Print — physical object alongside heading */}
        <div
          ref={printRef}
          className="flex-shrink-0 hidden md:block"
        >
          <div
            style={{
              position:    'relative',
              width:       'clamp(160px, 22vw, 320px)',
              aspectRatio: '2/3',
              transform:   'rotate(-2.5deg)',
              boxShadow:   '0 20px 70px rgba(0,0,0,0.7)',
              overflow:    'hidden',
            }}
          >
            <Image
              src="/images/foto-07.jpg"
              alt="Fine art print — Алиса Волосникова"
              fill
              sizes="22vw"
              className="object-cover"
            />
          </div>
        </div>

      </div>

      {/* Print — mobile only (below heading) */}
      <div
        ref={undefined}
        className="mt-10 flex justify-end md:hidden"
      >
        <div
          style={{
            position:    'relative',
            width:       'clamp(140px, 55vw, 260px)',
            aspectRatio: '2/3',
            transform:   'rotate(-2.5deg)',
            boxShadow:   '0 16px 50px rgba(0,0,0,0.7)',
            overflow:    'hidden',
          }}
        >
          <Image
            src="/images/foto-07.jpg"
            alt="Fine art print — Алиса Волосникова"
            fill
            sizes="55vw"
            className="object-cover"
          />
        </div>
      </div>

      {/* Divider */}
      <div
        style={{ height: '1px', background: 'rgba(245,245,245,0.08)', marginTop: '3.5rem' }}
      />

      {/* Bottom row */}
      <div ref={bottomRef} className="flex justify-between items-center mt-8">
        <p className="font-sans text-[9px] tracking-extreme text-muted">
          ARCHIVAL PIGMENT · SIGNED &amp; NUMBERED · PRODUCED TO ORDER
        </p>
        <TransitionLink
          href="/prints"
          data-cursor="link"
          className="font-sans text-[9px] tracking-extreme text-text-light
                     transition-opacity duration-300 hover:opacity-40 ml-8 flex-shrink-0"
        >
          VIEW PRINTS →
        </TransitionLink>
      </div>
    </section>
  )
}
