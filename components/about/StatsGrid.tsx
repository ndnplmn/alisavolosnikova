'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface Practice {
  vision?: string[]
  process?: string[]
  medium?: string[]
}

export function StatsGrid({ practice }: { practice: Practice }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const colRefs = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const cols = colRefs.current.filter(Boolean)
    gsap.set(cols, { opacity: 0, y: 20 })

    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 78%',
      onEnter: () =>
        gsap.to(cols, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.13,
        }),
    })

    return () => st.kill()
  }, [])

  const columns = [
    {
      label: 'MEDIUM',
      value: practice.medium?.[0] ?? '—',
      sub: practice.medium?.slice(1) ?? [],
    },
    {
      label: 'PROCESS',
      value: practice.process?.[0] ?? '—',
      sub: practice.process?.slice(1) ?? [],
    },
    {
      label: 'APPROACH',
      value: practice.vision?.[0] ?? '—',
      sub: practice.vision?.slice(1) ?? [],
    },
    {
      label: 'AVAILABLE FOR',
      value: 'Editorial',
      sub: ['Commercial', 'Personal work'],
    },
  ]

  return (
    <div ref={containerRef} className="border-t border-text-dark/10 py-20 md:py-28">
      {/* Gap-px grid: gap becomes visible as 1px dividers between cells */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-text-dark/10">
        {columns.map((col, i) => (
          <div
            key={col.label}
            ref={el => { if (el) colRefs.current[i] = el }}
            className="bg-light px-6 md:px-10 py-10"
            style={{ opacity: 0 }}
          >
            <p
              className="font-sans text-muted mb-5"
              style={{ fontSize: '9px', letterSpacing: '0.22em' }}
            >
              {col.label}
            </p>
            <p
              className="font-serif italic text-text-dark"
              style={{
                fontSize: 'clamp(1.6rem, 2.8vw, 3.8rem)',
                fontWeight: 300,
                lineHeight: 1,
                letterSpacing: '-0.02em',
              }}
            >
              {col.value}
            </p>
            {col.sub.map(s => (
              <p key={s} className="font-sans text-muted mt-3" style={{ fontSize: '11px', letterSpacing: '0.06em' }}>
                {s}
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
